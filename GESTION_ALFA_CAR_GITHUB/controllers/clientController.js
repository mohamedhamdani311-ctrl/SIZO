// ============================================================
// Controller: Client
// ============================================================
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const Car = require('../models/Car');
const Client = require('../models/Client');
const Seller = require('../models/Seller');
const User = require('../models/User');
const Reservation = require('../models/Reservation');
const Sale = require('../models/Sale');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const Agency = require('../models/Agency');

const clientController = {
    // ========================================================
    // TABLEAU DE BORD
    // ========================================================
    async dashboard(req, res) {
        try {
            const client = await Client.findByUserId(req.session.user.id);
            if (!client) {
                req.flash('error', 'Profil client introuvable.');
                return res.redirect('/auth/login');
            }

            // Statistiques du client
            const [reservationCount] = await db.query(
                'SELECT COUNT(*) as total FROM reservation WHERE id_client = ?',
                [client.id_client]
            );
            const [pendingReservations] = await db.query(
                "SELECT COUNT(*) as total FROM reservation WHERE id_client = ? AND statut = 'en_attente'",
                [client.id_client]
            );
            const [purchaseCount] = await db.query(
                'SELECT COUNT(*) as total FROM vente WHERE id_client = ?',
                [client.id_client]
            );
            const [validatedPurchases] = await db.query(
                "SELECT COUNT(*) as total FROM vente WHERE id_client = ? AND statut_vente = 'validee'",
                [client.id_client]
            );
            const [invoiceCount] = await db.query(
                `SELECT COUNT(*) as total FROM facture f
                 INNER JOIN paiement p ON f.id_paiement = p.id_paiement
                 INNER JOIN vente vt ON p.id_vente = vt.id_vente
                 WHERE vt.id_client = ?`,
                [client.id_client]
            );
            const [totalSpent] = await db.query(
                "SELECT COALESCE(SUM(montant_total), 0) as total FROM vente WHERE id_client = ? AND statut_vente = 'validee'",
                [client.id_client]
            );

            // Données récentes
            const recentReservations = await Reservation.findByClient(client.id_client);
            const recentReservationsLimited = recentReservations.slice(0, 5);

            const recentPurchases = await Sale.findByClient(client.id_client);
            const recentPurchasesLimited = recentPurchases.slice(0, 5);

            res.render('client/dashboard', {
                title: 'Tableau de bord - Client',
                clientData: client,
                stats: {
                    totalReservations: reservationCount[0].total,
                    pendingReservations: pendingReservations[0].total,
                    totalPurchases: purchaseCount[0].total,
                    validatedPurchases: validatedPurchases[0].total,
                    totalInvoices: invoiceCount[0].total,
                    totalSpent: totalSpent[0].total
                },
                recentReservations: recentReservationsLimited,
                recentPurchases: recentPurchasesLimited
            });
        } catch (error) {
            console.error('Erreur tableau de bord client:', error);
            req.flash('error', 'Erreur lors du chargement du tableau de bord.');
            res.render('client/dashboard', {
                title: 'Tableau de bord - Client',
                clientData: null,
                stats: {
                    totalReservations: 0, pendingReservations: 0,
                    totalPurchases: 0, validatedPurchases: 0,
                    totalInvoices: 0, totalSpent: 0
                },
                recentReservations: [],
                recentPurchases: []
            });
        }
    },

    // ========================================================
    // VOITURES (Catalogue)
    // ========================================================
    async listCars(req, res) {
        try {
            const filters = {
                marque: req.query.marque || '',
                modele: req.query.modele || '',
                annee: req.query.annee || '',
                prix_min: req.query.prix_min || '',
                prix_max: req.query.prix_max || '',
                carburant: req.query.carburant || '',
                boite_vitesse: req.query.boite_vitesse || ''
            };

            const [cars, brands] = await Promise.all([
                Car.findAvailableForClient(filters),
                Car.getBrands()
            ]);

            res.render('client/cars', {
                title: 'Catalogue de Voitures - Client',
                cars,
                brands,
                filters
            });
        } catch (error) {
            console.error('Erreur liste voitures client:', error);
            req.flash('error', 'Erreur lors du chargement du catalogue.');
            return res.redirect('/client');
        }
    },

    async carDetails(req, res) {
        try {
            const car = await Car.findById(req.params.id);
            if (!car) {
                req.flash('error', 'Voiture introuvable.');
                return res.redirect('/client/cars');
            }
            res.render('client/car-details', {
                title: car.marque + ' ' + car.modele + ' - Détails',
                car
            });
        } catch (error) {
            console.error('Erreur détails voiture client:', error);
            req.flash('error', 'Erreur lors du chargement des détails de la voiture.');
            return res.redirect('/client/cars');
        }
    },

    // ========================================================
    // RÉSERVATIONS
    // ========================================================
    async createReservation(req, res) {
        try {
            const client = await Client.findByUserId(req.session.user.id);
            if (!client) {
                req.flash('error', 'Profil client introuvable.');
                return res.redirect('/client/cars');
            }

            const { id_voiture, note, date_expiration } = req.body;

            // Vérifier que la voiture existe et est disponible
            const car = await Car.findById(id_voiture);
            if (!car) {
                req.flash('error', 'Voiture introuvable.');
                return res.redirect('/client/cars');
            }
            if (car.statut !== 'disponible') {
                req.flash('error', 'Cette voiture n\'est plus disponible.');
                return res.redirect('/client/cars');
            }

            // Récupérer un vendeur de l'agence de la voiture
            const sellersInAgency = await Seller.findByAgency(car.id_agence);
            let vendeurId = null;
            if (sellersInAgency.length > 0) {
                vendeurId = sellersInAgency[0].id_vendeur;
            } else {
                // Prendre le premier vendeur disponible
                const allSellers = await Seller.findAll();
                if (allSellers.length > 0) {
                    vendeurId = allSellers[0].id_vendeur;
                } else {
                    req.flash('error', 'Aucun vendeur disponible pour traiter votre réservation.');
                    return res.redirect('/client/cars');
                }
            }

            await Reservation.create({
                id_client: client.id_client,
                id_voiture,
                id_vendeur: vendeurId,
                date_expiration: date_expiration || null,
                note: note || null
            });

            // Mettre à jour le statut de la voiture en réservée
            await Car.updateStatus(id_voiture, 'reservee');

            req.flash('success', 'Réservation créée avec succès. Un vendeur traitera votre demande.');
            return res.redirect('/client/reservations');
        } catch (error) {
            console.error('Erreur création réservation client:', error);
            req.flash('error', 'Erreur lors de la création de la réservation.');
            return res.redirect('/client/cars');
        }
    },

    async cancelReservation(req, res) {
        try {
            const reservationId = req.params.id;

            // Vérifier que la réservation appartient au client
            const client = await Client.findByUserId(req.session.user.id);
            if (!client) {
                req.flash('error', 'Profil client introuvable.');
                return res.redirect('/client/reservations');
            }

            const reservation = await Reservation.findById(reservationId);
            if (!reservation) {
                req.flash('error', 'Réservation introuvable.');
                return res.redirect('/client/reservations');
            }
            if (reservation.id_client !== client.id_client) {
                req.flash('error', 'Vous n\'êtes pas autorisé à annuler cette réservation.');
                return res.redirect('/client/reservations');
            }

            await Reservation.updateStatus(reservationId, 'annulee');

            // Remettre la voiture en disponible
            await Car.updateStatus(reservation.id_voiture, 'disponible');

            req.flash('success', 'Réservation annulée avec succès.');
            return res.redirect('/client/reservations');
        } catch (error) {
            console.error('Erreur annulation réservation client:', error);
            req.flash('error', 'Erreur lors de l\'annulation de la réservation.');
            return res.redirect('/client/reservations');
        }
    },

    async listReservations(req, res) {
        try {
            const client = await Client.findByUserId(req.session.user.id);
            if (!client) {
                req.flash('error', 'Profil client introuvable.');
                return res.redirect('/client');
            }

            const reservations = await Reservation.findByClient(client.id_client);

            res.render('client/reservations', {
                title: 'Mes Réservations - Client',
                reservations,
                clientData: client
            });
        } catch (error) {
            console.error('Erreur liste réservations client:', error);
            req.flash('error', 'Erreur lors du chargement des réservations.');
            return res.redirect('/client');
        }
    },

    // ========================================================
    // ACHATS (VENTES côté client)
    // ========================================================
    async createPurchase(req, res) {
        try {
            const client = await Client.findByUserId(req.session.user.id);
            if (!client) {
                req.flash('error', 'Profil client introuvable.');
                return res.redirect('/client/cars');
            }

            const {
                id_voiture, type_paiement, notes,
                montant_avance, nombre_mensualites, mensualite,
                taux_interet, date_debut_remboursement
            } = req.body;

            // Vérifier que la voiture existe
            const car = await Car.findById(id_voiture);
            if (!car) {
                req.flash('error', 'Voiture introuvable.');
                return res.redirect('/client/cars');
            }

            // Récupérer un vendeur de l'agence de la voiture
            const sellersInAgency = await Seller.findByAgency(car.id_agence);
            let vendeurId = null;
            if (sellersInAgency.length > 0) {
                vendeurId = sellersInAgency[0].id_vendeur;
            } else {
                const allSellers = await Seller.findAll();
                if (allSellers.length > 0) {
                    vendeurId = allSellers[0].id_vendeur;
                } else {
                    req.flash('error', 'Aucun vendeur disponible pour traiter votre achat.');
                    return res.redirect('/client/cars');
                }
            }

            // Créer la vente
            const saleResult = await Sale.create({
                id_client: client.id_client,
                id_voiture,
                id_vendeur: vendeurId,
                id_agence: car.id_agence,
                montant_total: car.prix,
                type_paiement: type_paiement || 'comptant',
                statut_vente: 'en_attente',
                notes: notes || null
            });

            const venteId = saleResult.insertId;

            // Créer le paiement associé
            const paymentData = {
                id_vente: venteId,
                montant: car.prix,
                type_paiement: type_paiement || 'comptant'
            };

            // Si paiement à crédit, ajouter les champs spécifiques
            if (type_paiement === 'credit') {
                paymentData.montant_avance = montant_avance || null;
                paymentData.nombre_mensualites = nombre_mensualites || null;
                paymentData.mensualite = mensualite || null;
                paymentData.taux_interet = taux_interet || null;
                paymentData.date_debut_remboursement = date_debut_remboursement || null;
            }

            await Payment.create(paymentData);

            req.flash('success', 'Demande d\'achat créée avec succès. Un vendeur traitera votre demande.');
            return res.redirect('/client/purchases');
        } catch (error) {
            console.error('Erreur création achat client:', error);
            req.flash('error', 'Erreur lors de la création de la demande d\'achat.');
            return res.redirect('/client/cars');
        }
    },

    async listPurchases(req, res) {
        try {
            const client = await Client.findByUserId(req.session.user.id);
            if (!client) {
                req.flash('error', 'Profil client introuvable.');
                return res.redirect('/client');
            }

            const purchases = await Sale.findByClient(client.id_client);

            res.render('client/purchases', {
                title: 'Mes Achats - Client',
                purchases,
                clientData: client
            });
        } catch (error) {
            console.error('Erreur liste achats client:', error);
            req.flash('error', 'Erreur lors du chargement des achats.');
            return res.redirect('/client');
        }
    },

    // ========================================================
    // FACTURES
    // ========================================================
    async listInvoices(req, res) {
        try {
            const client = await Client.findByUserId(req.session.user.id);
            if (!client) {
                req.flash('error', 'Profil client introuvable.');
                return res.redirect('/client');
            }

            const invoices = await Invoice.findByClient(client.id_client);

            res.render('client/invoices', {
                title: 'Mes Factures - Client',
                invoices,
                clientData: client
            });
        } catch (error) {
            console.error('Erreur liste factures client:', error);
            req.flash('error', 'Erreur lors du chargement des factures.');
            return res.redirect('/client');
        }
    },

    async viewInvoice(req, res) {
        try {
            const client = await Client.findByUserId(req.session.user.id);
            if (!client) {
                req.flash('error', 'Profil client introuvable.');
                return res.redirect('/client/invoices');
            }

            const invoice = await Invoice.findById(req.params.id);
            if (!invoice) {
                req.flash('error', 'Facture introuvable.');
                return res.redirect('/client/invoices');
            }

            // Vérifier que la facture appartient au client
            if (invoice.id_client !== client.id_client) {
                req.flash('error', 'Vous n\'êtes pas autorisé à consulter cette facture.');
                return res.redirect('/client/invoices');
            }

            res.render('client/invoice-view', {
                title: 'Facture ' + invoice.numero_facture + ' - Client',
                invoice,
                clientData: client
            });
        } catch (error) {
            console.error('Erreur affichage facture client:', error);
            req.flash('error', 'Erreur lors de l\'affichage de la facture.');
            return res.redirect('/client/invoices');
        }
    },

    // ========================================================
    // PROFIL
    // ========================================================
    async profile(req, res) {
        try {
            const client = await Client.findByUserId(req.session.user.id);
            const user = await User.findById(req.session.user.id);
            res.render('client/profile', {
                title: 'Mon Profil - Client',
                clientData: client,
                userInfo: user
            });
        } catch (error) {
            console.error('Erreur profil client:', error);
            req.flash('error', 'Erreur lors du chargement du profil.');
            return res.redirect('/client');
        }
    },

    async updateProfile(req, res) {
        try {
            const client = await Client.findByUserId(req.session.user.id);
            if (!client) {
                req.flash('error', 'Profil client introuvable.');
                return res.redirect('/client/profile');
            }

            const { nom, prenom, telephone, email, adresse, password, new_password } = req.body;

            // Mettre à jour les informations du client
            await Client.update(client.id_client, {
                nom: nom || client.nom,
                prenom: prenom || client.prenom,
                telephone: telephone || client.telephone,
                email: email || client.email,
                adresse: adresse || client.adresse
            });

            // Si changement de mot de passe demandé
            if (password && new_password) {
                const user = await User.findById(req.session.user.id);
                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    req.flash('error', 'Le mot de passe actuel est incorrect.');
                    return res.redirect('/client/profile');
                }
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(new_password, salt);
                await User.updatePassword(req.session.user.id, hashedPassword);
            }

            // Mettre à jour la session
            req.session.user.nom = nom || client.nom;
            req.session.user.prenom = prenom || client.prenom;

            req.flash('success', 'Profil mis à jour avec succès.');
            return res.redirect('/client/profile');
        } catch (error) {
            console.error('Erreur mise à jour profil client:', error);
            req.flash('error', 'Erreur lors de la mise à jour du profil.');
            return res.redirect('/client/profile');
        }
    }
};

module.exports = clientController;

// ============================================================
// Controller: Seller (Vendeur)
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

const sellerController = {
    // ========================================================
    // TABLEAU DE BORD
    // ========================================================
    async dashboard(req, res) {
        try {
            const seller = await Seller.findByUserId(req.session.user.id);
            if (!seller) {
                req.flash('error', 'Profil vendeur introuvable.');
                return res.redirect('/auth/login');
            }

            // Statistiques liées à l'agence et au vendeur
            const [carsInAgency] = await db.query(
                'SELECT COUNT(*) as total FROM voiture WHERE id_agence = ?',
                [seller.id_agence]
            );
            const [availableCarsInAgency] = await db.query(
                "SELECT COUNT(*) as total FROM voiture WHERE id_agence = ? AND statut = 'disponible'",
                [seller.id_agence]
            );
            const [sellerReservations] = await db.query(
                'SELECT COUNT(*) as total FROM reservation WHERE id_vendeur = ?',
                [seller.id_vendeur]
            );
            const [pendingReservations] = await db.query(
                "SELECT COUNT(*) as total FROM reservation WHERE id_vendeur = ? AND statut = 'en_attente'",
                [seller.id_vendeur]
            );
            const [sellerSales] = await db.query(
                'SELECT COUNT(*) as total FROM vente WHERE id_vendeur = ?',
                [seller.id_vendeur]
            );
            const [validatedSales] = await db.query(
                "SELECT COUNT(*) as total FROM vente WHERE id_vendeur = ? AND statut_vente = 'validee'",
                [seller.id_vendeur]
            );
            const [pendingAccounts] = await db.query(
                "SELECT COUNT(*) as total FROM utilisateur WHERE statut_compte = 'en_attente'"
            );
            const [sellerRevenue] = await db.query(
                "SELECT COALESCE(SUM(montant_total), 0) as total FROM vente WHERE id_vendeur = ? AND statut_vente = 'validee'",
                [seller.id_vendeur]
            );

            // Ventes récentes du vendeur
            const recentSales = await Sale.findByVendeur(seller.id_vendeur);
            const recentSalesLimited = recentSales.slice(0, 5);

            // Réservations récentes du vendeur
            const recentReservations = await Reservation.findByVendeur(seller.id_vendeur);
            const recentReservationsLimited = recentReservations.slice(0, 5);

            // Données graphiques
            const salesByMonth = await Sale.salesByMonth();
            const salesByBrand = await Sale.salesByBrand();

            res.render('seller/dashboard', {
                title: 'Tableau de bord - Vendeur',
                seller,
                stats: {
                    totalCars: carsInAgency[0].total,
                    availableCars: availableCarsInAgency[0].total,
                    totalReservations: sellerReservations[0].total,
                    pendingReservations: pendingReservations[0].total,
                    totalSales: sellerSales[0].total,
                    validatedSales: validatedSales[0].total,
                    pendingAccounts: pendingAccounts[0].total,
                    revenue: sellerRevenue[0].total
                },
                recentSales: recentSalesLimited,
                recentReservations: recentReservationsLimited,
                chartData: {
                    salesByMonth,
                    salesByBrand
                }
            });
        } catch (error) {
            console.error('Erreur tableau de bord vendeur:', error);
            req.flash('error', 'Erreur lors du chargement du tableau de bord.');
            res.render('seller/dashboard', {
                title: 'Tableau de bord - Vendeur',
                seller: null,
                stats: {
                    totalCars: 0, availableCars: 0, totalReservations: 0, pendingReservations: 0,
                    totalSales: 0, validatedSales: 0, pendingAccounts: 0, revenue: 0
                },
                recentSales: [],
                recentReservations: [],
                chartData: { salesByMonth: [], salesByBrand: [] }
            });
        }
    },

    // ========================================================
    // VOITURES
    // ========================================================
    async listCars(req, res) {
        try {
            const seller = await Seller.findByUserId(req.session.user.id);
            if (!seller) {
                req.flash('error', 'Profil vendeur introuvable.');
                return res.redirect('/seller');
            }

            // Filtrer les voitures par l'agence du vendeur
            const filters = {
                marque: req.query.marque || '',
                statut: req.query.statut || '',
                carburant: req.query.carburant || '',
                boite_vitesse: req.query.boite_vitesse || ''
            };

            const [cars] = await db.query(
                `SELECT v.id_voiture, v.id_agence, v.marque, v.modele, v.annee, v.prix,
                        v.kilometrage, v.carburant, v.boite_vitesse, v.couleur,
                        v.description, v.image, v.statut, v.date_ajout,
                        ag.nom_agence
                 FROM voiture v
                 INNER JOIN agence ag ON v.id_agence = ag.id_agence
                 WHERE v.id_agence = ?
                 ORDER BY v.date_ajout DESC`,
                [seller.id_agence]
            );

            res.render('seller/cars', {
                title: 'Gestion des Voitures - Vendeur',
                cars,
                filters,
                seller
            });
        } catch (error) {
            console.error('Erreur liste voitures vendeur:', error);
            req.flash('error', 'Erreur lors du chargement des voitures.');
            return res.redirect('/seller');
        }
    },

    async showCarForm(req, res) {
        try {
            const agencies = await Agency.findAll();
            let car = null;
            if (req.params.id) {
                car = await Car.findById(req.params.id);
                if (!car) {
                    req.flash('error', 'Voiture introuvable.');
                    return res.redirect('/seller/cars');
                }
            }
            res.render('seller/car-form', {
                title: car ? 'Modifier la Voiture - Vendeur' : 'Ajouter une Voiture - Vendeur',
                car,
                agencies
            });
        } catch (error) {
            console.error('Erreur formulaire voiture vendeur:', error);
            req.flash('error', 'Erreur lors du chargement du formulaire.');
            return res.redirect('/seller/cars');
        }
    },

    async createCar(req, res) {
        try {
            const seller = await Seller.findByUserId(req.session.user.id);
            if (!seller) {
                req.flash('error', 'Profil vendeur introuvable.');
                return res.redirect('/seller/cars');
            }

            const { marque, modele, annee, prix, kilometrage, carburant, boite_vitesse, couleur, description } = req.body;
            let image = null;
            if (req.file) {
                image = '/uploads/' + req.file.filename;
            } else if (req.files && req.files.length > 0) {
                image = '/uploads/' + req.files[0].filename;
            }

            await Car.create({
                id_agence: seller.id_agence,
                marque,
                modele,
                annee,
                prix,
                kilometrage,
                carburant,
                boite_vitesse,
                couleur,
                description,
                image
            });

            req.flash('success', 'Voiture ajoutée avec succès.');
            return res.redirect('/seller/cars');
        } catch (error) {
            console.error('Erreur création voiture vendeur:', error);
            req.flash('error', 'Erreur lors de l\'ajout de la voiture.');
            return res.redirect('/seller/cars/add');
        }
    },

    async updateCar(req, res) {
        try {
            const carId = req.params.id;
            const { id_agence, marque, modele, annee, prix, kilometrage, carburant, boite_vitesse, couleur, description } = req.body;
            let image = undefined;
            if (req.file) {
                image = '/uploads/' + req.file.filename;
            } else if (req.files && req.files.length > 0) {
                image = '/uploads/' + req.files[0].filename;
            }

            const updateData = { id_agence, marque, modele, annee, prix, kilometrage, carburant, boite_vitesse, couleur, description };
            if (image) {
                updateData.image = image;
            }

            await Car.update(carId, updateData);

            req.flash('success', 'Voiture mise à jour avec succès.');
            return res.redirect('/seller/cars');
        } catch (error) {
            console.error('Erreur mise à jour voiture vendeur:', error);
            req.flash('error', 'Erreur lors de la mise à jour de la voiture.');
            return res.redirect('/seller/cars/edit/' + req.params.id);
        }
    },

    async deleteCar(req, res) {
        try {
            await Car.delete(req.params.id);
            req.flash('success', 'Voiture supprimée avec succès.');
            return res.redirect('/seller/cars');
        } catch (error) {
            console.error('Erreur suppression voiture vendeur:', error);
            req.flash('error', 'Erreur lors de la suppression de la voiture.');
            return res.redirect('/seller/cars');
        }
    },

    // ========================================================
    // CLIENTS
    // ========================================================
    async listCustomers(req, res) {
        try {
            const clients = await Client.findAll();
            res.render('seller/customers', {
                title: 'Liste des Clients - Vendeur',
                clients
            });
        } catch (error) {
            console.error('Erreur liste clients vendeur:', error);
            req.flash('error', 'Erreur lors du chargement des clients.');
            return res.redirect('/seller');
        }
    },

    // ========================================================
    // GESTION DES COMPTES
    // ========================================================
    async approveAccount(req, res) {
        try {
            await User.updateStatus(req.params.id, 'actif');
            req.flash('success', 'Compte approuvé avec succès.');
            return res.redirect('back');
        } catch (error) {
            console.error('Erreur approbation compte vendeur:', error);
            req.flash('error', 'Erreur lors de l\'approbation du compte.');
            return res.redirect('back');
        }
    },

    async rejectAccount(req, res) {
        try {
            await User.updateStatus(req.params.id, 'refuse');
            req.flash('success', 'Compte refusé.');
            return res.redirect('back');
        } catch (error) {
            console.error('Erreur refus compte vendeur:', error);
            req.flash('error', 'Erreur lors du refus du compte.');
            return res.redirect('back');
        }
    },

    // ========================================================
    // RÉSERVATIONS
    // ========================================================
    async listReservations(req, res) {
        try {
            const seller = await Seller.findByUserId(req.session.user.id);
            if (!seller) {
                req.flash('error', 'Profil vendeur introuvable.');
                return res.redirect('/seller');
            }

            const reservations = await Reservation.findByVendeur(seller.id_vendeur);

            res.render('seller/reservations', {
                title: 'Gestion des Réservations - Vendeur',
                reservations,
                seller
            });
        } catch (error) {
            console.error('Erreur liste réservations vendeur:', error);
            req.flash('error', 'Erreur lors du chargement des réservations.');
            return res.redirect('/seller');
        }
    },

    async approveReservation(req, res) {
        try {
            await Reservation.updateStatus(req.params.id, 'confirmee');
            req.flash('success', 'Réservation confirmée avec succès.');
            return res.redirect('/seller/reservations');
        } catch (error) {
            console.error('Erreur approbation réservation vendeur:', error);
            req.flash('error', 'Erreur lors de la confirmation de la réservation.');
            return res.redirect('/seller/reservations');
        }
    },

    async rejectReservation(req, res) {
        try {
            await Reservation.updateStatus(req.params.id, 'annulee');
            req.flash('success', 'Réservation annulée.');
            return res.redirect('/seller/reservations');
        } catch (error) {
            console.error('Erreur rejet réservation vendeur:', error);
            req.flash('error', 'Erreur lors de l\'annulation de la réservation.');
            return res.redirect('/seller/reservations');
        }
    },

    // ========================================================
    // VENTES
    // ========================================================
    async listSales(req, res) {
        try {
            const seller = await Seller.findByUserId(req.session.user.id);
            if (!seller) {
                req.flash('error', 'Profil vendeur introuvable.');
                return res.redirect('/seller');
            }

            const sales = await Sale.findByVendeur(seller.id_vendeur);

            res.render('seller/sales', {
                title: 'Gestion des Ventes - Vendeur',
                sales,
                seller
            });
        } catch (error) {
            console.error('Erreur liste ventes vendeur:', error);
            req.flash('error', 'Erreur lors du chargement des ventes.');
            return res.redirect('/seller');
        }
    },

    async approveSale(req, res) {
        try {
            const saleId = req.params.id;
            const sale = await Sale.findById(saleId);
            if (!sale) {
                req.flash('error', 'Vente introuvable.');
                return res.redirect('/seller/sales');
            }

            // Valider la vente
            await Sale.updateStatus(saleId, 'validee');

            // Marquer la voiture comme vendue
            await Car.updateStatus(sale.id_voiture, 'vendue');

            req.flash('success', 'Vente validée avec succès. La voiture a été marquée comme vendue.');
            return res.redirect('/seller/sales');
        } catch (error) {
            console.error('Erreur approbation vente vendeur:', error);
            req.flash('error', 'Erreur lors de la validation de la vente.');
            return res.redirect('/seller/sales');
        }
    },

    async rejectSale(req, res) {
        try {
            await Sale.updateStatus(req.params.id, 'annulee');
            req.flash('success', 'Vente annulée.');
            return res.redirect('/seller/sales');
        } catch (error) {
            console.error('Erreur rejet vente vendeur:', error);
            req.flash('error', 'Erreur lors de l\'annulation de la vente.');
            return res.redirect('/seller/sales');
        }
    },

    // ========================================================
    // PAIEMENTS
    // ========================================================
    async listPayments(req, res) {
        try {
            const payments = await Payment.findAll();
            res.render('seller/payments', {
                title: 'Gestion des Paiements - Vendeur',
                payments
            });
        } catch (error) {
            console.error('Erreur liste paiements vendeur:', error);
            req.flash('error', 'Erreur lors du chargement des paiements.');
            return res.redirect('/seller');
        }
    },

    async approvePayment(req, res) {
        try {
            const paymentId = req.params.id;
            const userId = req.session.user.id;

            // Confirmer le paiement
            await Payment.updateStatus(paymentId, 'confirme', userId);

            // Vérifier si une facture existe déjà
            const existingInvoice = await Invoice.findByPaiement(paymentId);
            if (!existingInvoice) {
                // Générer le numéro de facture et créer la facture
                const invoiceNumber = await Invoice.generateNumber();
                await Invoice.create({
                    id_paiement: paymentId,
                    numero_facture: invoiceNumber
                });
            }

            req.flash('success', 'Paiement confirmé et facture générée avec succès.');
            return res.redirect('/seller/payments');
        } catch (error) {
            console.error('Erreur approbation paiement vendeur:', error);
            req.flash('error', 'Erreur lors de la confirmation du paiement.');
            return res.redirect('/seller/payments');
        }
    },

    async rejectPayment(req, res) {
        try {
            await Payment.updateStatus(req.params.id, 'refuse', req.session.user.id);
            req.flash('success', 'Paiement refusé.');
            return res.redirect('/seller/payments');
        } catch (error) {
            console.error('Erreur rejet paiement vendeur:', error);
            req.flash('error', 'Erreur lors du refus du paiement.');
            return res.redirect('/seller/payments');
        }
    },

    // ========================================================
    // PROFIL
    // ========================================================
    async profile(req, res) {
        try {
            const seller = await Seller.findByUserId(req.session.user.id);
            const user = await User.findById(req.session.user.id);
            res.render('seller/profile', {
                title: 'Mon Profil - Vendeur',
                seller,
                userInfo: user
            });
        } catch (error) {
            console.error('Erreur profil vendeur:', error);
            req.flash('error', 'Erreur lors du chargement du profil.');
            return res.redirect('/seller');
        }
    },

    async updateProfile(req, res) {
        try {
            const seller = await Seller.findByUserId(req.session.user.id);
            if (!seller) {
                req.flash('error', 'Profil vendeur introuvable.');
                return res.redirect('/seller/profile');
            }

            const { nom, prenom, telephone, email, password, new_password } = req.body;

            // Mettre à jour les informations du vendeur
            await Seller.update(seller.id_vendeur, {
                id_agence: seller.id_agence,
                nom: nom || seller.nom,
                prenom: prenom || seller.prenom,
                telephone: telephone || seller.telephone,
                email: email || seller.email
            });

            // Si changement de mot de passe demandé
            if (password && new_password) {
                const user = await User.findById(req.session.user.id);
                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    req.flash('error', 'Le mot de passe actuel est incorrect.');
                    return res.redirect('/seller/profile');
                }
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(new_password, salt);
                await User.updatePassword(req.session.user.id, hashedPassword);
            }

            // Mettre à jour la session
            req.session.user.nom = nom || seller.nom;
            req.session.user.prenom = prenom || seller.prenom;

            req.flash('success', 'Profil mis à jour avec succès.');
            return res.redirect('/seller/profile');
        } catch (error) {
            console.error('Erreur mise à jour profil vendeur:', error);
            req.flash('error', 'Erreur lors de la mise à jour du profil.');
            return res.redirect('/seller/profile');
        }
    }
};

module.exports = sellerController;

// ============================================================
// Controller: Admin
// ============================================================
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Seller = require('../models/Seller');
const Client = require('../models/Client');
const Agency = require('../models/Agency');
const Car = require('../models/Car');
const Reservation = require('../models/Reservation');
const Sale = require('../models/Sale');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');

const adminController = {
    // ========================================================
    // TABLEAU DE BORD
    // ========================================================
    async dashboard(req, res) {
        try {
            const [totalCars] = await db.query('SELECT COUNT(*) as total FROM voiture');
            const [availableCars] = await db.query("SELECT COUNT(*) as total FROM voiture WHERE statut = 'disponible'");
            const [totalClients] = await db.query("SELECT COUNT(*) as total FROM client c INNER JOIN utilisateur u ON c.id_utilisateur = u.id_utilisateur WHERE u.statut_compte = 'actif'");
            const [totalSellers] = await db.query("SELECT COUNT(*) as total FROM vendeur v INNER JOIN utilisateur u ON v.id_utilisateur = u.id_utilisateur WHERE u.statut_compte = 'actif'");
            const [totalSales] = await db.query('SELECT COUNT(*) as total FROM vente');
            const [validatedSales] = await db.query("SELECT COUNT(*) as total FROM vente WHERE statut_vente = 'validee'");
            const [totalReservations] = await db.query('SELECT COUNT(*) as total FROM reservation');
            const [pendingReservations] = await db.query("SELECT COUNT(*) as total FROM reservation WHERE statut = 'en_attente'");
            const [totalPayments] = await db.query('SELECT COUNT(*) as total FROM paiement');
            const [pendingPayments] = await db.query("SELECT COUNT(*) as total FROM paiement WHERE statut = 'en_attente'");
            const [revenue] = await db.query("SELECT COALESCE(SUM(montant_total), 0) as total FROM vente WHERE statut_vente = 'validee'");
            const [pendingAccounts] = await db.query("SELECT COUNT(*) as total FROM utilisateur WHERE statut_compte = 'en_attente'");

            // Ventes récentes
            const [recentSales] = await db.query(`
                SELECT vt.*, c.nom AS client_nom, c.prenom AS client_prenom,
                       v.marque, v.modele, a.nom_agence
                FROM vente vt
                JOIN client c ON vt.id_client = c.id_client
                JOIN voiture v ON vt.id_voiture = v.id_voiture
                JOIN agence a ON vt.id_agence = a.id_agence
                ORDER BY vt.date_vente DESC LIMIT 5
            `);

            // Réservations récentes
            const [recentReservations] = await db.query(`
                SELECT r.*, c.nom AS client_nom, c.prenom AS client_prenom,
                       v.marque, v.modele
                FROM reservation r
                JOIN client c ON r.id_client = c.id_client
                JOIN voiture v ON r.id_voiture = v.id_voiture
                ORDER BY r.date_reservation DESC LIMIT 5
            `);

            // Clients récents
            const [recentClients] = await db.query(`
                SELECT c.*, u.username, u.statut_compte, u.date_creation
                FROM client c
                JOIN utilisateur u ON c.id_utilisateur = u.id_utilisateur
                ORDER BY c.date_inscription DESC LIMIT 5
            `);

            res.render('admin/dashboard', {
                title: 'Tableau de bord - Admin',
                stats: {
                    totalCars: totalCars[0].total,
                    availableCars: availableCars[0].total,
                    totalClients: totalClients[0].total,
                    totalSellers: totalSellers[0].total,
                    totalSales: totalSales[0].total,
                    validatedSales: validatedSales[0].total,
                    totalReservations: totalReservations[0].total,
                    pendingReservations: pendingReservations[0].total,
                    totalPayments: totalPayments[0].total,
                    pendingPayments: pendingPayments[0].total,
                    revenue: revenue[0].total,
                    pendingAccounts: pendingAccounts[0].total
                },
                recentSales,
                recentReservations,
                recentClients
            });
        } catch (error) {
            console.error('Erreur tableau de bord admin:', error);
            req.flash('error', 'Erreur lors du chargement du tableau de bord.');
            res.render('admin/dashboard', {
                title: 'Tableau de bord - Admin',
                stats: { totalCars: 0, availableCars: 0, totalClients: 0, totalSellers: 0, totalSales: 0, validatedSales: 0, totalReservations: 0, pendingReservations: 0, totalPayments: 0, pendingPayments: 0, revenue: 0, pendingAccounts: 0 },
                recentSales: [],
                recentReservations: [],
                recentClients: []
            });
        }
    },

    // ========================================================
    // VOITURES
    // ========================================================
    async listCars(req, res) {
        try {
            // Auto-répare les voitures bloquées en 'reservee' sans réservation/vente active
            Car.repairStatuses().catch(err => console.error('[repairStatuses]', err));

            const filters = {
                marque: req.query.marque || '',
                statut: req.query.statut || '',
                carburant: req.query.carburant || '',
                boite_vitesse: req.query.boite_vitesse || '',
                prix_min: req.query.prix_min || '',
                prix_max: req.query.prix_max || '',
                id_agence: req.query.id_agence || ''
            };
            const cars = await Car.findAll(filters);
            const agencies = await Agency.findAll();
            res.render('admin/cars', {
                title: 'Gestion des Voitures - Admin',
                cars,
                agencies,
                filters
            });
        } catch (error) {
            console.error('Erreur liste voitures:', error);
            req.flash('error', 'Erreur lors du chargement des voitures.');
            return res.redirect('/admin');
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
                    return res.redirect('/admin/cars');
                }
            }
            res.render('admin/car-form', {
                title: car ? 'Modifier la Voiture - Admin' : 'Ajouter une Voiture - Admin',
                car,
                agencies
            });
        } catch (error) {
            console.error('Erreur formulaire voiture:', error);
            req.flash('error', 'Erreur lors du chargement du formulaire.');
            return res.redirect('/admin/cars');
        }
    },

    async createCar(req, res) {
        try {
            const { id_agence, marque, modele, annee, prix, kilometrage, carburant, boite_vitesse, couleur, description } = req.body;
            let image = null;
            if (req.files && req.files.length > 0) {
                image = '/uploads/' + req.files[0].filename;
            } else if (req.file) {
                image = '/uploads/' + req.file.filename;
            }

            await Car.create({
                id_agence, marque, modele, annee, prix, kilometrage, carburant, boite_vitesse, couleur, description, image
            });

            req.flash('success', 'Voiture ajoutée avec succès.');
            return res.redirect('/admin/cars');
        } catch (error) {
            console.error('Erreur création voiture:', error);
            req.flash('error', 'Erreur lors de l\'ajout de la voiture.');
            return res.redirect('/admin/cars/add');
        }
    },

    async updateCar(req, res) {
        try {
            const carId = req.params.id;
            const { id_agence, marque, modele, annee, prix, kilometrage, carburant, boite_vitesse, couleur, description } = req.body;
            let image = null;
            if (req.files && req.files.length > 0) {
                image = '/uploads/' + req.files[0].filename;
            } else if (req.file) {
                image = '/uploads/' + req.file.filename;
            }

            await Car.update(carId, {
                id_agence, marque, modele, annee, prix, kilometrage, carburant, boite_vitesse, couleur, description, image
            });

            req.flash('success', 'Voiture mise à jour avec succès.');
            return res.redirect('/admin/cars');
        } catch (error) {
            console.error('Erreur mise à jour voiture:', error);
            req.flash('error', 'Erreur lors de la mise à jour de la voiture.');
            return res.redirect('/admin/cars/edit/' + req.params.id);
        }
    },

    async deleteCar(req, res) {
        try {
            await Car.delete(req.params.id);
            req.flash('success', 'Voiture supprimée avec succès.');
            return res.redirect('/admin/cars');
        } catch (error) {
            console.error('Erreur suppression voiture:', error);
            req.flash('error', 'Erreur lors de la suppression de la voiture.');
            return res.redirect('/admin/cars');
        }
    },

    async fixCarStatuses(req, res) {
        try {
            const fixed = await Car.repairStatuses();
            req.flash('success', `Synchronisation terminée : ${fixed} voiture(s) remise(s) en disponible.`);
        } catch (error) {
            console.error('Erreur sync statuts voitures:', error);
            req.flash('error', 'Erreur lors de la synchronisation des statuts.');
        }
        return res.redirect('/admin/cars');
    },

    // ========================================================
    // CLIENTS
    // ========================================================
    async listCustomers(req, res) {
        try {
            const customers = await Client.findAll();
            res.render('admin/customers', {
                title: 'Gestion des Clients - Admin',
                customers
            });
        } catch (error) {
            console.error('Erreur liste clients:', error);
            req.flash('error', 'Erreur lors du chargement des clients.');
            return res.redirect('/admin');
        }
    },

    async approveAccount(req, res) {
        try {
            await User.updateStatus(req.params.id, 'actif');
            req.flash('success', 'Compte approuvé avec succès.');
            return res.redirect('back');
        } catch (error) {
            console.error('Erreur approbation compte:', error);
            req.flash('error', 'Erreur lors de l\'approbation du compte.');
            return res.redirect('back');
        }
    },

    async rejectAccount(req, res) {
        try {
            await User.delete(req.params.id);
            req.flash('success', 'Compte refusé et supprimé définitivement.');
            return res.redirect('back');
        } catch (error) {
            console.error('Erreur refus compte:', error);
            req.flash('error', 'Erreur lors du refus du compte.');
            return res.redirect('back');
        }
    },

    async deleteCustomer(req, res) {
        try {
            await Client.delete(req.params.id);
            req.flash('success', 'Client supprimé avec succès.');
            return res.redirect('/admin/customers');
        } catch (error) {
            console.error('Erreur suppression client:', error);
            req.flash('error', 'Erreur lors de la suppression du client.');
            return res.redirect('/admin/customers');
        }
    },

    // ========================================================
    // VENDEURS
    // ========================================================
    async listSellers(req, res) {
        try {
            const sellers = await Seller.findAll();
            res.render('admin/sellers', {
                title: 'Gestion des Vendeurs - Admin',
                sellers
            });
        } catch (error) {
            console.error('Erreur liste vendeurs:', error);
            req.flash('error', 'Erreur lors du chargement des vendeurs.');
            return res.redirect('/admin');
        }
    },

    async showSellerForm(req, res) {
        try {
            const agencies = await Agency.findAll();
            let seller = null;
            if (req.params.id) {
                seller = await Seller.findById(req.params.id);
                if (!seller) {
                    req.flash('error', 'Vendeur introuvable.');
                    return res.redirect('/admin/sellers');
                }
            }
            res.render('admin/seller-form', {
                title: seller ? 'Modifier le Vendeur - Admin' : 'Ajouter un Vendeur - Admin',
                seller,
                agencies
            });
        } catch (error) {
            console.error('Erreur formulaire vendeur:', error);
            req.flash('error', 'Erreur lors du chargement du formulaire.');
            return res.redirect('/admin/sellers');
        }
    },

    async createSeller(req, res) {
        let userId = null;
        try {
            const { username, password, nom, prenom, telephone, email, id_agence } = req.body;

            // ── 1. Validation des champs obligatoires ──────────────────────
            if (!id_agence) {
                req.flash('error', 'Veuillez sélectionner une agence. Si la liste est vide, créez d\'abord une agence dans l\'onglet Agences.');
                return res.redirect('/admin/sellers/add');
            }
            if (!username || !password || !nom || !prenom) {
                req.flash('error', 'Tous les champs obligatoires (nom d\'utilisateur, mot de passe, nom, prénom) doivent être remplis.');
                return res.redirect('/admin/sellers/add');
            }

            // ── 2. Vérifier que l'agence existe réellement en base ─────────
            const agency = await Agency.findById(id_agence);
            if (!agency) {
                req.flash('error', 'L\'agence sélectionnée n\'existe pas. Veuillez recharger la page et réessayer.');
                return res.redirect('/admin/sellers/add');
            }

            // ── 3. Vérifier que le nom d'utilisateur est disponible ────────
            const existingUser = await User.findByUsername(username);
            if (existingUser) {
                req.flash('error', 'Ce nom d\'utilisateur est déjà utilisé. Choisissez un autre.');
                return res.redirect('/admin/sellers/add');
            }

            // ── 4. Créer le compte utilisateur ─────────────────────────────
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            userId = await User.create({
                username,
                password: hashedPassword,
                role: 'vendeur',
                statut_compte: 'en_attente'
            });

            // ── 5. Créer le profil vendeur ─────────────────────────────────
            //    Si cette étape échoue, on supprime le compte utilisateur
            //    créé à l'étape précédente pour ne laisser aucun orphelin.
            try {
                await Seller.create({
                    id_utilisateur: userId,
                    id_agence: parseInt(id_agence, 10),
                    nom,
                    prenom,
                    telephone,
                    email
                });
            } catch (sellerErr) {
                console.error('Échec création profil vendeur, suppression du compte utilisateur orphelin:', sellerErr.message);
                await User.delete(userId);
                userId = null;
                throw new Error('Impossible de créer le profil vendeur : ' + sellerErr.message);
            }

            req.flash('success', 'Vendeur créé avec succès. Son compte est en attente d\'approbation dans l\'onglet Comptes.');
            return res.redirect('/admin/sellers');

        } catch (error) {
            console.error('Erreur création vendeur:', error.message);
            req.flash('error', error.message);
            return res.redirect('/admin/sellers/add');
        }
    },

    async updateSeller(req, res) {
        try {
            const sellerId = req.params.id;
            const { nom, prenom, telephone, email, id_agence } = req.body;

            await Seller.update(sellerId, { id_agence, nom, prenom, telephone, email });

            req.flash('success', 'Vendeur mis à jour avec succès.');
            return res.redirect('/admin/sellers');
        } catch (error) {
            console.error('Erreur mise à jour vendeur:', error);
            req.flash('error', 'Erreur lors de la mise à jour du vendeur.');
            return res.redirect('/admin/sellers/edit/' + req.params.id);
        }
    },

    async deleteSeller(req, res) {
        try {
            await Seller.delete(req.params.id);
            req.flash('success', 'Vendeur supprimé avec succès.');
            return res.redirect('/admin/sellers');
        } catch (error) {
            console.error('Erreur suppression vendeur:', error);
            req.flash('error', 'Erreur lors de la suppression du vendeur.');
            return res.redirect('/admin/sellers');
        }
    },

    // ========================================================
    // AGENCES
    // ========================================================
    async listAgencies(req, res) {
        try {
            const agencies = await Agency.findAll();
            res.render('admin/agencies', {
                title: 'Gestion des Agences - Admin',
                agencies
            });
        } catch (error) {
            console.error('Erreur liste agences:', error);
            req.flash('error', 'Erreur lors du chargement des agences.');
            return res.redirect('/admin');
        }
    },

    async showAgencyForm(req, res) {
        try {
            let agency = null;
            if (req.params.id) {
                agency = await Agency.findById(req.params.id);
                if (!agency) {
                    req.flash('error', 'Agence introuvable.');
                    return res.redirect('/admin/agencies');
                }
            }
            res.render('admin/agency-form', {
                title: agency ? 'Modifier l\'Agence - Admin' : 'Ajouter une Agence - Admin',
                agency
            });
        } catch (error) {
            console.error('Erreur formulaire agence:', error);
            req.flash('error', 'Erreur lors du chargement du formulaire.');
            return res.redirect('/admin/agencies');
        }
    },

    async createAgency(req, res) {
        try {
            const { nom_agence, adresse, telephone, email } = req.body;
            await Agency.create({ nom_agence, adresse, telephone, email });
            req.flash('success', 'Agence créée avec succès.');
            return res.redirect('/admin/agencies');
        } catch (error) {
            console.error('Erreur création agence:', error);
            req.flash('error', 'Erreur lors de la création de l\'agence.');
            return res.redirect('/admin/agencies/add');
        }
    },

    async updateAgency(req, res) {
        try {
            const agencyId = req.params.id;
            const { nom_agence, adresse, telephone, email } = req.body;
            await Agency.update(agencyId, { nom_agence, adresse, telephone, email });
            req.flash('success', 'Agence mise à jour avec succès.');
            return res.redirect('/admin/agencies');
        } catch (error) {
            console.error('Erreur mise à jour agence:', error);
            req.flash('error', 'Erreur lors de la mise à jour de l\'agence.');
            return res.redirect('/admin/agencies/edit/' + req.params.id);
        }
    },

    async deleteAgency(req, res) {
        try {
            await Agency.delete(req.params.id);
            req.flash('success', 'Agence supprimée avec succès.');
            return res.redirect('/admin/agencies');
        } catch (error) {
            console.error('Erreur suppression agence:', error);
            req.flash('error', 'Erreur lors de la suppression de l\'agence. Vérifiez qu\'aucun vendeur ou voiture n\'y est associé.');
            return res.redirect('/admin/agencies');
        }
    },

    // ========================================================
    // RÉSERVATIONS
    // ========================================================
    async listReservations(req, res) {
        try {
            const reservations = await Reservation.findAll();
            res.render('admin/reservations', {
                title: 'Gestion des Réservations - Admin',
                reservations
            });
        } catch (error) {
            console.error('Erreur liste réservations:', error);
            req.flash('error', 'Erreur lors du chargement des réservations.');
            return res.redirect('/admin');
        }
    },

    async approveReservation(req, res) {
        try {
            await Reservation.updateStatus(req.params.id, 'confirmee');
            req.flash('success', 'Réservation confirmée avec succès.');
            return res.redirect('/admin/reservations');
        } catch (error) {
            console.error('Erreur approbation réservation:', error);
            req.flash('error', 'Erreur lors de la confirmation de la réservation.');
            return res.redirect('/admin/reservations');
        }
    },

    async rejectReservation(req, res) {
        try {
            const reservationId = req.params.id;
            const reservation = await Reservation.findById(reservationId);
            await Reservation.updateStatus(reservationId, 'annulee');
            // Remettre la voiture disponible pour qu'elle réapparaisse dans le catalogue client
            if (reservation && reservation.id_voiture) {
                await Car.updateStatus(reservation.id_voiture, 'disponible');
            }
            req.flash('success', 'Réservation annulée. La voiture est de nouveau disponible.');
            return res.redirect('/admin/reservations');
        } catch (error) {
            console.error('Erreur rejet réservation:', error);
            req.flash('error', 'Erreur lors de l\'annulation de la réservation.');
            return res.redirect('/admin/reservations');
        }
    },

    // ========================================================
    // VENTES
    // ========================================================
    async listSales(req, res) {
        try {
            const sales = await Sale.findAll();
            res.render('admin/sales', {
                title: 'Gestion des Ventes - Admin',
                sales
            });
        } catch (error) {
            console.error('Erreur liste ventes:', error);
            req.flash('error', 'Erreur lors du chargement des ventes.');
            return res.redirect('/admin');
        }
    },

    async approveSale(req, res) {
        try {
            const saleId = req.params.id;
            const sale = await Sale.findById(saleId);
            if (!sale) {
                req.flash('error', 'Vente introuvable.');
                return res.redirect('/admin/sales');
            }

            // Valider la vente
            await Sale.updateStatus(saleId, 'validee');

            // Marquer la voiture comme vendue
            await Car.updateStatus(sale.id_voiture, 'vendue');

            // Créer automatiquement un paiement si aucun n'existe
            const existingPayment = await Payment.findByVente(saleId);
            if (!existingPayment) {
                await Payment.create({
                    id_vente: saleId,
                    montant: sale.montant_total,
                    type_paiement: sale.type_paiement
                });
            }

            req.flash('success', 'Vente validée avec succès. La voiture a été marquée comme vendue.');
            return res.redirect('/admin/sales');
        } catch (error) {
            console.error('Erreur approbation vente:', error);
            req.flash('error', 'Erreur lors de la validation de la vente.');
            return res.redirect('/admin/sales');
        }
    },

    async rejectSale(req, res) {
        try {
            const saleId = req.params.id;
            const sale = await Sale.findById(saleId);
            await Sale.updateStatus(saleId, 'annulee');
            // Remettre la voiture en disponible si elle n'est pas encore vendue
            if (sale && sale.id_voiture) {
                await Car.updateStatus(sale.id_voiture, 'disponible');
            }
            req.flash('success', 'Vente annulée. La voiture est de nouveau disponible.');
            return res.redirect('/admin/sales');
        } catch (error) {
            console.error('Erreur rejet vente:', error);
            req.flash('error', 'Erreur lors de l\'annulation de la vente.');
            return res.redirect('/admin/sales');
        }
    },

    // ========================================================
    // PAIEMENTS
    // ========================================================
    async listPayments(req, res) {
        try {
            const payments = await Payment.findAll();
            res.render('admin/payments', {
                title: 'Gestion des Paiements - Admin',
                payments
            });
        } catch (error) {
            console.error('Erreur liste paiements:', error);
            req.flash('error', 'Erreur lors du chargement des paiements.');
            return res.redirect('/admin');
        }
    },

    async approvePayment(req, res) {
        try {
            const paymentId = req.params.id;
            const adminUserId = req.session.user.id;

            // Confirmer le paiement
            await Payment.updateStatus(paymentId, 'confirme', adminUserId);

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
            return res.redirect('/admin/payments');
        } catch (error) {
            console.error('Erreur approbation paiement:', error);
            req.flash('error', 'Erreur lors de la confirmation du paiement.');
            return res.redirect('/admin/payments');
        }
    },

    async rejectPayment(req, res) {
        try {
            await Payment.updateStatus(req.params.id, 'refuse');
            req.flash('success', 'Paiement refusé.');
            return res.redirect('/admin/payments');
        } catch (error) {
            console.error('Erreur rejet paiement:', error);
            req.flash('error', 'Erreur lors du refus du paiement.');
            return res.redirect('/admin/payments');
        }
    },

    // ========================================================
    // FACTURES
    // ========================================================
    async listInvoices(req, res) {
        try {
            const invoices = await Invoice.findAll();
            res.render('admin/invoices', {
                title: 'Gestion des Factures - Admin',
                invoices
            });
        } catch (error) {
            console.error('Erreur liste factures:', error);
            req.flash('error', 'Erreur lors du chargement des factures.');
            return res.redirect('/admin');
        }
    },

    async viewInvoice(req, res) {
        try {
            const invoice = await Invoice.findById(req.params.id);
            if (!invoice) {
                req.flash('error', 'Facture introuvable.');
                return res.redirect('/admin/invoices');
            }
            res.render('admin/invoice-view', {
                title: 'Facture ' + invoice.numero_facture + ' - Admin',
                invoice
            });
        } catch (error) {
            console.error('Erreur affichage facture:', error);
            req.flash('error', 'Erreur lors de l\'affichage de la facture.');
            return res.redirect('/admin/invoices');
        }
    },

    // ========================================================
    // RAPPORTS
    // ========================================================
    async reports(req, res) {
        try {
            res.render('admin/reports', {
                title: 'Rapports - Admin'
            });
        } catch (error) {
            console.error('Erreur page rapports:', error);
            req.flash('error', 'Erreur lors du chargement des rapports.');
            return res.redirect('/admin');
        }
    },

    async getReportData(req, res) {
        try {
            const { type } = req.params || req.query;
            const period = req.query.period || 'monthly';

            let dateFilter = '';
            if (period === 'daily') {
                dateFilter = 'AND DATE(##DATE_FIELD##) = CURDATE()';
            } else if (period === 'monthly') {
                dateFilter = 'AND MONTH(##DATE_FIELD##) = MONTH(CURDATE()) AND YEAR(##DATE_FIELD##) = YEAR(CURDATE())';
            } else if (period === 'yearly') {
                dateFilter = 'AND YEAR(##DATE_FIELD##) = YEAR(CURDATE())';
            }

            let data = [];
            let summary = {};

            switch (type) {
                case 'cars': {
                    const dateField = 'v.date_ajout';
                    const filter = dateFilter.replace(/##DATE_FIELD##/g, dateField);
                    const [rows] = await db.query(`
                        SELECT v.*, a.nom_agence FROM voiture v
                        JOIN agence a ON v.id_agence = a.id_agence
                        WHERE 1=1 ${filter}
                        ORDER BY v.date_ajout DESC
                    `);
                    const [total] = await db.query(`SELECT COUNT(*) as total FROM voiture v WHERE 1=1 ${filter}`);
                    const [available] = await db.query(`SELECT COUNT(*) as total FROM voiture v WHERE statut = 'disponible' ${filter}`);
                    const [sold] = await db.query(`SELECT COUNT(*) as total FROM voiture v WHERE statut = 'vendue' ${filter}`);
                    data = rows;
                    summary = { total: total[0].total, disponibles: available[0].total, vendues: sold[0].total };
                    break;
                }
                case 'customers': {
                    const dateField = 'c.date_inscription';
                    const filter = dateFilter.replace(/##DATE_FIELD##/g, dateField);
                    const [rows] = await db.query(`
                        SELECT c.*, u.username, u.statut_compte FROM client c
                        JOIN utilisateur u ON c.id_utilisateur = u.id_utilisateur
                        WHERE 1=1 ${filter}
                        ORDER BY c.date_inscription DESC
                    `);
                    const [total] = await db.query(`SELECT COUNT(*) as total FROM client c WHERE 1=1 ${filter}`);
                    data = rows;
                    summary = { total: total[0].total };
                    break;
                }
                case 'sellers': {
                    const dateField = 'v.date_embauche';
                    const filter = dateFilter.replace(/##DATE_FIELD##/g, dateField);
                    const [rows] = await db.query(`
                        SELECT v.*, u.username, a.nom_agence FROM vendeur v
                        JOIN utilisateur u ON v.id_utilisateur = u.id_utilisateur
                        JOIN agence a ON v.id_agence = a.id_agence
                        WHERE 1=1 ${filter}
                        ORDER BY v.date_embauche DESC
                    `);
                    const [total] = await db.query(`SELECT COUNT(*) as total FROM vendeur v WHERE 1=1 ${filter}`);
                    data = rows;
                    summary = { total: total[0].total };
                    break;
                }
                case 'sales': {
                    const dateField = 'vt.date_vente';
                    const filter = dateFilter.replace(/##DATE_FIELD##/g, dateField);
                    const [rows] = await db.query(`
                        SELECT vt.*, c.nom AS client_nom, c.prenom AS client_prenom,
                               v.marque, v.modele, a.nom_agence,
                               ve.nom AS vendeur_nom, ve.prenom AS vendeur_prenom
                        FROM vente vt
                        JOIN client c ON vt.id_client = c.id_client
                        JOIN voiture v ON vt.id_voiture = v.id_voiture
                        JOIN agence a ON vt.id_agence = a.id_agence
                        JOIN vendeur ve ON vt.id_vendeur = ve.id_vendeur
                        WHERE 1=1 ${filter}
                        ORDER BY vt.date_vente DESC
                    `);
                    const [total] = await db.query(`SELECT COUNT(*) as total FROM vente vt WHERE 1=1 ${filter}`);
                    const [validated] = await db.query(`SELECT COUNT(*) as total FROM vente vt WHERE statut_vente = 'validee' ${filter}`);
                    const [revenueData] = await db.query(`SELECT COALESCE(SUM(montant_total), 0) as total FROM vente vt WHERE statut_vente = 'validee' ${filter}`);
                    data = rows;
                    summary = { total: total[0].total, validees: validated[0].total, chiffre_affaires: revenueData[0].total };
                    break;
                }
                case 'reservations': {
                    const dateField = 'r.date_reservation';
                    const filter = dateFilter.replace(/##DATE_FIELD##/g, dateField);
                    const [rows] = await db.query(`
                        SELECT r.*, c.nom AS client_nom, c.prenom AS client_prenom,
                               v.marque, v.modele,
                               ve.nom AS vendeur_nom, ve.prenom AS vendeur_prenom
                        FROM reservation r
                        JOIN client c ON r.id_client = c.id_client
                        JOIN voiture v ON r.id_voiture = v.id_voiture
                        JOIN vendeur ve ON r.id_vendeur = ve.id_vendeur
                        WHERE 1=1 ${filter}
                        ORDER BY r.date_reservation DESC
                    `);
                    const [total] = await db.query(`SELECT COUNT(*) as total FROM reservation r WHERE 1=1 ${filter}`);
                    const [pending] = await db.query(`SELECT COUNT(*) as total FROM reservation r WHERE statut = 'en_attente' ${filter}`);
                    const [confirmed] = await db.query(`SELECT COUNT(*) as total FROM reservation r WHERE statut = 'confirmee' ${filter}`);
                    data = rows;
                    summary = { total: total[0].total, en_attente: pending[0].total, confirmees: confirmed[0].total };
                    break;
                }
                case 'payments': {
                    const dateField = 'p.date_paiement';
                    const filter = dateFilter.replace(/##DATE_FIELD##/g, dateField);
                    const [rows] = await db.query(`
                        SELECT p.*, c.nom AS client_nom, c.prenom AS client_prenom,
                               v.marque, v.modele, a.nom_agence
                        FROM paiement p
                        JOIN vente vt ON p.id_vente = vt.id_vente
                        JOIN client c ON vt.id_client = c.id_client
                        JOIN voiture v ON vt.id_voiture = v.id_voiture
                        JOIN agence a ON vt.id_agence = a.id_agence
                        WHERE 1=1 ${filter}
                        ORDER BY p.date_paiement DESC
                    `);
                    const [total] = await db.query(`SELECT COUNT(*) as total FROM paiement p WHERE 1=1 ${filter}`);
                    const [totalAmount] = await db.query(`SELECT COALESCE(SUM(montant), 0) as total FROM paiement p WHERE statut = 'confirme' ${filter}`);
                    data = rows;
                    summary = { total: total[0].total, montant_total: totalAmount[0].total };
                    break;
                }
                case 'invoices': {
                    const dateField = 'f.date_facture';
                    const filter = dateFilter.replace(/##DATE_FIELD##/g, dateField);
                    const [rows] = await db.query(`
                        SELECT f.*, p.montant, p.type_paiement,
                               c.nom AS client_nom, c.prenom AS client_prenom,
                               v.marque, v.modele, a.nom_agence
                        FROM facture f
                        JOIN paiement p ON f.id_paiement = p.id_paiement
                        JOIN vente vt ON p.id_vente = vt.id_vente
                        JOIN client c ON vt.id_client = c.id_client
                        JOIN voiture v ON vt.id_voiture = v.id_voiture
                        JOIN agence a ON vt.id_agence = a.id_agence
                        WHERE 1=1 ${filter}
                        ORDER BY f.date_facture DESC
                    `);
                    const [total] = await db.query(`SELECT COUNT(*) as total FROM facture f WHERE 1=1 ${filter}`);
                    data = rows;
                    summary = { total: total[0].total };
                    break;
                }
                default:
                    return res.status(400).json({ success: false, message: 'Type de rapport invalide.' });
            }

            return res.json({ success: true, type, period, summary, data });
        } catch (error) {
            console.error('Erreur génération rapport:', error);
            return res.status(500).json({ success: false, message: 'Erreur lors de la génération du rapport.' });
        }
    },

    // ========================================================
    // COMPTES EN ATTENTE
    // ========================================================
    async accounts(req, res) {
        try {
            const [pendingUsers] = await db.query(`
                SELECT u.id_utilisateur, u.username, u.role, u.statut_compte, u.date_creation,
                       COALESCE(v.nom, c.nom)       AS nom,
                       COALESCE(v.prenom, c.prenom) AS prenom,
                       COALESCE(v.email, c.email)   AS email,
                       COALESCE(v.telephone, c.telephone) AS telephone
                FROM utilisateur u
                LEFT JOIN vendeur v ON u.id_utilisateur = v.id_utilisateur
                LEFT JOIN client  c ON u.id_utilisateur = c.id_utilisateur
                WHERE u.statut_compte = 'en_attente'
                ORDER BY u.date_creation DESC
            `);
            res.render('admin/accounts', {
                title: 'Comptes en Attente - Admin',
                pendingUsers
            });
        } catch (error) {
            console.error('Erreur comptes en attente:', error);
            req.flash('error', 'Erreur lors du chargement des comptes en attente.');
            return res.redirect('/admin');
        }
    },

    // ========================================================
    // PARAMÈTRES
    // ========================================================
    async settings(req, res) {
        try {
            res.render('admin/settings', {
                title: 'Paramètres - Admin'
            });
        } catch (error) {
            console.error('Erreur paramètres:', error);
            req.flash('error', 'Erreur lors du chargement des paramètres.');
            return res.redirect('/admin');
        }
    },

    async updateSettings(req, res) {
        try {
            // Mettre à jour les paramètres (Placeholder logique)
            req.flash('success', 'Paramètres mis à jour avec succès.');
            return res.redirect('/admin/settings');
        } catch (error) {
            console.error('Erreur mise à jour paramètres:', error);
            req.flash('error', 'Erreur lors de la mise à jour des paramètres.');
            return res.redirect('/admin/settings');
        }
    },

    // ========================================================
    // PROFIL
    // ========================================================
    async profile(req, res) {
        try {
            const admin = await Admin.findByUserId(req.session.user.id);
            const user = await User.findById(req.session.user.id);
            res.render('admin/profile', {
                title: 'Mon Profil - Admin',
                admin,
                userInfo: user
            });
        } catch (error) {
            console.error('Erreur profil admin:', error);
            req.flash('error', 'Erreur lors du chargement du profil.');
            return res.redirect('/admin');
        }
    },

    async updateProfile(req, res) {
        try {
            const { nom, prenom, password, new_password } = req.body;

            // Mettre à jour le profil admin
            await Admin.updateProfile(req.session.user.id, { nom, prenom });

            // Si changement de mot de passe demandé
            if (password && new_password) {
                const user = await User.findById(req.session.user.id);
                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    req.flash('error', 'Le mot de passe actuel est incorrect.');
                    return res.redirect('/admin/profile');
                }
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(new_password, salt);
                await User.updatePassword(req.session.user.id, hashedPassword);
            }

            // Mettre à jour la session
            req.session.user.nom = nom;
            req.session.user.prenom = prenom;

            req.flash('success', 'Profil mis à jour avec succès.');
            return res.redirect('/admin/profile');
        } catch (error) {
            console.error('Erreur mise à jour profil:', error);
            req.flash('error', 'Erreur lors de la mise à jour du profil.');
            return res.redirect('/admin/profile');
        }
    }
};

module.exports = adminController;

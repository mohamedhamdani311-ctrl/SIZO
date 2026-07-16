// ============================================================
// Controller: Invoice (Facture)
// ============================================================
const Invoice = require('../models/Invoice');

const invoiceController = {
    // ========================================================
    // AFFICHAGE D'UNE FACTURE
    // ========================================================
    async view(req, res) {
        try {
            const invoice = await Invoice.findById(req.params.id);
            if (!invoice) {
                // Si requête AJAX, retourner JSON
                if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                    return res.status(404).json({
                        success: false,
                        message: 'Facture introuvable.'
                    });
                }
                req.flash('error', 'Facture introuvable.');
                return res.redirect('back');
            }

            // Si requête AJAX ou demande JSON, retourner JSON
            if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
                return res.json({
                    success: true,
                    invoice: {
                        id_facture: invoice.id_facture,
                        numero_facture: invoice.numero_facture,
                        date_facture: invoice.date_facture,
                        statut_envoi: invoice.statut_envoi,
                        paiement: {
                            id_paiement: invoice.id_paiement,
                            montant: invoice.paiement_montant,
                            type_paiement: invoice.paiement_type,
                            statut: invoice.paiement_statut,
                            date_paiement: invoice.date_paiement,
                            montant_avance: invoice.montant_avance,
                            nombre_mensualites: invoice.nombre_mensualites,
                            mensualite: invoice.mensualite,
                            taux_interet: invoice.taux_interet
                        },
                        vente: {
                            id_vente: invoice.id_vente,
                            montant_total: invoice.montant_total,
                            type_paiement: invoice.vente_type_paiement,
                            statut_vente: invoice.statut_vente,
                            date_vente: invoice.date_vente
                        },
                        client: {
                            id_client: invoice.id_client,
                            nom: invoice.client_nom,
                            prenom: invoice.client_prenom,
                            telephone: invoice.client_telephone,
                            email: invoice.client_email,
                            adresse: invoice.client_adresse
                        },
                        voiture: {
                            id_voiture: invoice.id_voiture,
                            marque: invoice.marque,
                            modele: invoice.modele,
                            annee: invoice.annee,
                            prix: invoice.prix,
                            couleur: invoice.couleur,
                            kilometrage: invoice.kilometrage,
                            carburant: invoice.carburant,
                            boite_vitesse: invoice.boite_vitesse,
                            image: invoice.voiture_image
                        },
                        agence: {
                            id_agence: invoice.id_agence,
                            nom_agence: invoice.nom_agence,
                            adresse: invoice.agence_adresse,
                            telephone: invoice.agence_telephone,
                            email: invoice.agence_email
                        }
                    }
                });
            }

            // Sinon, afficher la vue HTML
            res.render('invoices/view', {
                title: 'Facture ' + invoice.numero_facture,
                invoice
            });
        } catch (error) {
            console.error('Erreur affichage facture:', error);
            if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
                return res.status(500).json({
                    success: false,
                    message: 'Erreur lors de l\'affichage de la facture.'
                });
            }
            req.flash('error', 'Erreur lors de l\'affichage de la facture.');
            return res.redirect('back');
        }
    },

    // ========================================================
    // DONNÉES POUR GÉNÉRATION PDF (côté client)
    // ========================================================
    async generatePDF(req, res) {
        try {
            const invoice = await Invoice.findById(req.params.id);
            if (!invoice) {
                return res.status(404).json({
                    success: false,
                    message: 'Facture introuvable.'
                });
            }

            return res.json({
                success: true,
                invoice: {
                    id_facture: invoice.id_facture,
                    numero_facture: invoice.numero_facture,
                    date_facture: invoice.date_facture,
                    statut_envoi: invoice.statut_envoi,
                    paiement: {
                        id_paiement: invoice.id_paiement,
                        montant: invoice.paiement_montant,
                        type_paiement: invoice.paiement_type,
                        statut: invoice.paiement_statut,
                        date_paiement: invoice.date_paiement,
                        montant_avance: invoice.montant_avance,
                        nombre_mensualites: invoice.nombre_mensualites,
                        mensualite: invoice.mensualite,
                        taux_interet: invoice.taux_interet
                    },
                    vente: {
                        id_vente: invoice.id_vente,
                        montant_total: invoice.montant_total,
                        type_paiement: invoice.vente_type_paiement,
                        statut_vente: invoice.statut_vente,
                        date_vente: invoice.date_vente
                    },
                    client: {
                        id_client: invoice.id_client,
                        nom: invoice.client_nom,
                        prenom: invoice.client_prenom,
                        telephone: invoice.client_telephone,
                        email: invoice.client_email,
                        adresse: invoice.client_adresse
                    },
                    voiture: {
                        id_voiture: invoice.id_voiture,
                        marque: invoice.marque,
                        modele: invoice.modele,
                        annee: invoice.annee,
                        prix: invoice.prix,
                        couleur: invoice.couleur,
                        kilometrage: invoice.kilometrage,
                        carburant: invoice.carburant,
                        boite_vitesse: invoice.boite_vitesse,
                        image: invoice.voiture_image
                    },
                    agence: {
                        id_agence: invoice.id_agence,
                        nom_agence: invoice.nom_agence,
                        adresse: invoice.agence_adresse,
                        telephone: invoice.agence_telephone,
                        email: invoice.agence_email
                    }
                }
            });
        } catch (error) {
            console.error('Erreur génération PDF facture:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la génération des données de la facture.'
            });
        }
    }
};

module.exports = invoiceController;

// ============================================================
// Controller: Report (Rapports)
// Génération dynamique de rapports à partir des tables existantes
// ============================================================
const db = require('../config/database');

const reportController = {
    // ========================================================
    // GÉNÉRATION DE RAPPORTS
    // ========================================================
    async generate(req, res) {
        try {
            const type = req.query.type || req.params.type;
            const period = req.query.period || 'monthly';

            if (!type) {
                return res.status(400).json({
                    success: false,
                    message: 'Le type de rapport est requis.'
                });
            }

            // Construction du filtre de date selon la période
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
                // ------------------------------------------------
                // RAPPORT VOITURES
                // ------------------------------------------------
                case 'cars': {
                    const dateField = 'v.date_ajout';
                    const filter = dateFilter.replace(/##DATE_FIELD##/g, dateField);

                    const [rows] = await db.query(`
                        SELECT v.id_voiture, v.marque, v.modele, v.annee, v.prix,
                               v.kilometrage, v.carburant, v.boite_vitesse, v.couleur,
                               v.statut, v.date_ajout, v.image,
                               a.nom_agence
                        FROM voiture v
                        JOIN agence a ON v.id_agence = a.id_agence
                        WHERE 1=1 ${filter}
                        ORDER BY v.date_ajout DESC
                    `);
                    const [total] = await db.query(
                        `SELECT COUNT(*) as total FROM voiture v WHERE 1=1 ${filter}`
                    );
                    const [available] = await db.query(
                        `SELECT COUNT(*) as total FROM voiture v WHERE v.statut = 'disponible' ${filter}`
                    );
                    const [sold] = await db.query(
                        `SELECT COUNT(*) as total FROM voiture v WHERE v.statut = 'vendue' ${filter}`
                    );
                    const [reserved] = await db.query(
                        `SELECT COUNT(*) as total FROM voiture v WHERE v.statut = 'reservee' ${filter}`
                    );

                    data = rows;
                    summary = {
                        total: total[0].total,
                        disponibles: available[0].total,
                        vendues: sold[0].total,
                        reservees: reserved[0].total
                    };
                    break;
                }

                // ------------------------------------------------
                // RAPPORT CLIENTS
                // ------------------------------------------------
                case 'customers': {
                    const dateField = 'c.date_inscription';
                    const filter = dateFilter.replace(/##DATE_FIELD##/g, dateField);

                    const [rows] = await db.query(`
                        SELECT c.id_client, c.nom, c.prenom, c.telephone, c.email,
                               c.adresse, c.date_inscription,
                               u.username, u.statut_compte, u.date_creation
                        FROM client c
                        JOIN utilisateur u ON c.id_utilisateur = u.id_utilisateur
                        WHERE 1=1 ${filter}
                        ORDER BY c.date_inscription DESC
                    `);
                    const [total] = await db.query(
                        `SELECT COUNT(*) as total FROM client c WHERE 1=1 ${filter}`
                    );
                    const [active] = await db.query(
                        `SELECT COUNT(*) as total FROM client c
                         JOIN utilisateur u ON c.id_utilisateur = u.id_utilisateur
                         WHERE u.statut_compte = 'actif' ${filter.replace(/c\./g, 'c.')}`
                    );

                    data = rows;
                    summary = {
                        total: total[0].total,
                        actifs: active[0].total
                    };
                    break;
                }

                // ------------------------------------------------
                // RAPPORT VENDEURS
                // ------------------------------------------------
                case 'sellers': {
                    const dateField = 'v.date_embauche';
                    const filter = dateFilter.replace(/##DATE_FIELD##/g, dateField);

                    const [rows] = await db.query(`
                        SELECT v.id_vendeur, v.nom, v.prenom, v.telephone, v.email,
                               v.date_embauche,
                               u.username, u.statut_compte,
                               a.nom_agence
                        FROM vendeur v
                        JOIN utilisateur u ON v.id_utilisateur = u.id_utilisateur
                        JOIN agence a ON v.id_agence = a.id_agence
                        WHERE 1=1 ${filter}
                        ORDER BY v.date_embauche DESC
                    `);
                    const [total] = await db.query(
                        `SELECT COUNT(*) as total FROM vendeur v WHERE 1=1 ${filter}`
                    );

                    data = rows;
                    summary = {
                        total: total[0].total
                    };
                    break;
                }

                // ------------------------------------------------
                // RAPPORT VENTES
                // ------------------------------------------------
                case 'sales': {
                    const dateField = 'vt.date_vente';
                    const filter = dateFilter.replace(/##DATE_FIELD##/g, dateField);

                    const [rows] = await db.query(`
                        SELECT vt.id_vente, vt.date_vente, vt.montant_total, vt.type_paiement,
                               vt.statut_vente, vt.notes,
                               c.nom AS client_nom, c.prenom AS client_prenom,
                               v.marque, v.modele, v.annee,
                               a.nom_agence,
                               ve.nom AS vendeur_nom, ve.prenom AS vendeur_prenom
                        FROM vente vt
                        JOIN client c ON vt.id_client = c.id_client
                        JOIN voiture v ON vt.id_voiture = v.id_voiture
                        JOIN agence a ON vt.id_agence = a.id_agence
                        JOIN vendeur ve ON vt.id_vendeur = ve.id_vendeur
                        WHERE 1=1 ${filter}
                        ORDER BY vt.date_vente DESC
                    `);
                    const [total] = await db.query(
                        `SELECT COUNT(*) as total FROM vente vt WHERE 1=1 ${filter}`
                    );
                    const [validated] = await db.query(
                        `SELECT COUNT(*) as total FROM vente vt WHERE vt.statut_vente = 'validee' ${filter}`
                    );
                    const [pending] = await db.query(
                        `SELECT COUNT(*) as total FROM vente vt WHERE vt.statut_vente = 'en_attente' ${filter}`
                    );
                    const [revenueData] = await db.query(
                        `SELECT COALESCE(SUM(montant_total), 0) as total FROM vente vt WHERE vt.statut_vente = 'validee' ${filter}`
                    );

                    data = rows;
                    summary = {
                        total: total[0].total,
                        validees: validated[0].total,
                        en_attente: pending[0].total,
                        chiffre_affaires: revenueData[0].total
                    };
                    break;
                }

                // ------------------------------------------------
                // RAPPORT RÉSERVATIONS
                // ------------------------------------------------
                case 'reservations': {
                    const dateField = 'r.date_reservation';
                    const filter = dateFilter.replace(/##DATE_FIELD##/g, dateField);

                    const [rows] = await db.query(`
                        SELECT r.id_reservation, r.date_reservation, r.statut,
                               r.date_expiration, r.note,
                               c.nom AS client_nom, c.prenom AS client_prenom,
                               v.marque, v.modele, v.annee, v.prix,
                               ve.nom AS vendeur_nom, ve.prenom AS vendeur_prenom,
                               a.nom_agence
                        FROM reservation r
                        JOIN client c ON r.id_client = c.id_client
                        JOIN voiture v ON r.id_voiture = v.id_voiture
                        JOIN vendeur ve ON r.id_vendeur = ve.id_vendeur
                        JOIN agence a ON v.id_agence = a.id_agence
                        WHERE 1=1 ${filter}
                        ORDER BY r.date_reservation DESC
                    `);
                    const [total] = await db.query(
                        `SELECT COUNT(*) as total FROM reservation r WHERE 1=1 ${filter}`
                    );
                    const [pendingRes] = await db.query(
                        `SELECT COUNT(*) as total FROM reservation r WHERE r.statut = 'en_attente' ${filter}`
                    );
                    const [confirmed] = await db.query(
                        `SELECT COUNT(*) as total FROM reservation r WHERE r.statut = 'confirmee' ${filter}`
                    );
                    const [cancelled] = await db.query(
                        `SELECT COUNT(*) as total FROM reservation r WHERE r.statut = 'annulee' ${filter}`
                    );

                    data = rows;
                    summary = {
                        total: total[0].total,
                        en_attente: pendingRes[0].total,
                        confirmees: confirmed[0].total,
                        annulees: cancelled[0].total
                    };
                    break;
                }

                // ------------------------------------------------
                // RAPPORT PAIEMENTS
                // ------------------------------------------------
                case 'payments': {
                    const dateField = 'p.date_paiement';
                    const filter = dateFilter.replace(/##DATE_FIELD##/g, dateField);

                    const [rows] = await db.query(`
                        SELECT p.id_paiement, p.montant, p.type_paiement, p.statut,
                               p.date_paiement, p.montant_avance, p.nombre_mensualites,
                               p.mensualite, p.taux_interet,
                               c.nom AS client_nom, c.prenom AS client_prenom,
                               v.marque, v.modele, v.annee,
                               a.nom_agence
                        FROM paiement p
                        JOIN vente vt ON p.id_vente = vt.id_vente
                        JOIN client c ON vt.id_client = c.id_client
                        JOIN voiture v ON vt.id_voiture = v.id_voiture
                        JOIN agence a ON vt.id_agence = a.id_agence
                        WHERE 1=1 ${filter}
                        ORDER BY p.date_paiement DESC
                    `);
                    const [total] = await db.query(
                        `SELECT COUNT(*) as total FROM paiement p WHERE 1=1 ${filter}`
                    );
                    const [confirmedPay] = await db.query(
                        `SELECT COUNT(*) as total FROM paiement p WHERE p.statut = 'confirme' ${filter}`
                    );
                    const [totalAmount] = await db.query(
                        `SELECT COALESCE(SUM(montant), 0) as total FROM paiement p WHERE p.statut = 'confirme' ${filter}`
                    );
                    const [pendingPay] = await db.query(
                        `SELECT COUNT(*) as total FROM paiement p WHERE p.statut = 'en_attente' ${filter}`
                    );

                    data = rows;
                    summary = {
                        total: total[0].total,
                        confirmes: confirmedPay[0].total,
                        en_attente: pendingPay[0].total,
                        montant_total: totalAmount[0].total
                    };
                    break;
                }

                // ------------------------------------------------
                // RAPPORT FACTURES
                // ------------------------------------------------
                case 'invoices': {
                    const dateField = 'f.date_facture';
                    const filter = dateFilter.replace(/##DATE_FIELD##/g, dateField);

                    const [rows] = await db.query(`
                        SELECT f.id_facture, f.numero_facture, f.date_facture, f.statut_envoi,
                               p.montant, p.type_paiement, p.statut AS paiement_statut,
                               c.nom AS client_nom, c.prenom AS client_prenom,
                               v.marque, v.modele, v.annee,
                               a.nom_agence
                        FROM facture f
                        JOIN paiement p ON f.id_paiement = p.id_paiement
                        JOIN vente vt ON p.id_vente = vt.id_vente
                        JOIN client c ON vt.id_client = c.id_client
                        JOIN voiture v ON vt.id_voiture = v.id_voiture
                        JOIN agence a ON vt.id_agence = a.id_agence
                        WHERE 1=1 ${filter}
                        ORDER BY f.date_facture DESC
                    `);
                    const [total] = await db.query(
                        `SELECT COUNT(*) as total FROM facture f WHERE 1=1 ${filter}`
                    );
                    const [sent] = await db.query(
                        `SELECT COUNT(*) as total FROM facture f WHERE f.statut_envoi = 'envoyee' ${filter}`
                    );

                    data = rows;
                    summary = {
                        total: total[0].total,
                        envoyees: sent[0].total
                    };
                    break;
                }

                default:
                    return res.status(400).json({
                        success: false,
                        message: 'Type de rapport invalide. Types disponibles : cars, customers, sellers, sales, reservations, payments, invoices.'
                    });
            }

            return res.json({
                success: true,
                type,
                period,
                summary,
                data
            });
        } catch (error) {
            console.error('Erreur génération rapport:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la génération du rapport.'
            });
        }
    }
};

module.exports = reportController;

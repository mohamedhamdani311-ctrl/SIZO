// ============================================================
// Model: Sale (vente)
// GESTION ALFA CAR
// ============================================================

const db = require('../config/database');

const Sale = {
    /**
     * Trouver une vente par son ID (avec infos client, voiture, vendeur, agence)
     */
    async findById(id) {
        const [rows] = await db.execute(
            `SELECT vt.id_vente, vt.id_client, vt.id_voiture, vt.id_vendeur, vt.id_agence,
                    vt.id_reservation, vt.date_vente, vt.montant_total, vt.type_paiement,
                    vt.statut_vente, vt.notes,
                    c.nom AS client_nom, c.prenom AS client_prenom, c.telephone AS client_telephone,
                    c.email AS client_email, c.adresse AS client_adresse,
                    v.marque, v.modele, v.annee, v.prix, v.image AS voiture_image,
                    v.couleur, v.kilometrage, v.carburant, v.boite_vitesse,
                    ve.nom AS vendeur_nom, ve.prenom AS vendeur_prenom,
                    ag.nom_agence, ag.adresse AS agence_adresse, ag.telephone AS agence_telephone, ag.email AS agence_email
             FROM vente vt
             LEFT JOIN client c ON vt.id_client = c.id_client
             LEFT JOIN voiture v ON vt.id_voiture = v.id_voiture
             LEFT JOIN vendeur ve ON vt.id_vendeur = ve.id_vendeur
             LEFT JOIN agence ag ON vt.id_agence = ag.id_agence
             WHERE vt.id_vente = ?`,
            [id]
        );
        return rows[0] || null;
    },

    /**
     * Créer une nouvelle vente
     */
    async create(data) {
        const { id_client, id_voiture, id_vendeur, id_agence, id_reservation, montant_total, type_paiement, notes } = data;
        const [result] = await db.execute(
            `INSERT INTO vente (id_client, id_voiture, id_vendeur, id_agence, id_reservation, montant_total, type_paiement, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [id_client, id_voiture, id_vendeur, id_agence, id_reservation || null, montant_total, type_paiement, notes || null]
        );
        return result;
    },

    /**
     * Mettre à jour le statut d'une vente
     */
    async updateStatus(id, statut) {
        const [result] = await db.execute(
            'UPDATE vente SET statut_vente = ? WHERE id_vente = ?',
            [statut, id]
        );
        return result;
    },

    /**
     * Supprimer une vente
     */
    async delete(id) {
        const [result] = await db.execute(
            'DELETE FROM vente WHERE id_vente = ?',
            [id]
        );
        return result;
    },

    /**
     * Récupérer toutes les ventes avec filtres et pagination
     */
    async findAll(filters = {}) {
        const { statut_vente, date_debut, date_fin, type_paiement, page, limit } = filters;
        let sql = `SELECT vt.id_vente, vt.id_client, vt.id_voiture, vt.id_vendeur, vt.id_agence,
                          vt.id_reservation, vt.date_vente, vt.montant_total, vt.type_paiement,
                          vt.statut_vente, vt.notes,
                          c.nom AS client_nom, c.prenom AS client_prenom, c.telephone AS client_telephone,
                          v.marque, v.modele, v.annee, v.prix, v.image AS voiture_image,
                          ve.nom AS vendeur_nom, ve.prenom AS vendeur_prenom,
                          ag.nom_agence
                   FROM vente vt
                   LEFT JOIN client c ON vt.id_client = c.id_client
                   LEFT JOIN voiture v ON vt.id_voiture = v.id_voiture
                   LEFT JOIN vendeur ve ON vt.id_vendeur = ve.id_vendeur
                   LEFT JOIN agence ag ON vt.id_agence = ag.id_agence`;
        const conditions = [];
        const values = [];

        if (statut_vente) {
            conditions.push('vt.statut_vente = ?');
            values.push(statut_vente);
        }
        if (date_debut) {
            conditions.push('vt.date_vente >= ?');
            values.push(date_debut);
        }
        if (date_fin) {
            conditions.push('vt.date_vente <= ?');
            values.push(date_fin);
        }
        if (type_paiement) {
            conditions.push('vt.type_paiement = ?');
            values.push(type_paiement);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        sql += ' ORDER BY vt.date_vente DESC';

        // Pagination
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const offset = (pageNum - 1) * limitNum;
        sql += ' LIMIT ? OFFSET ?';
        values.push(limitNum, offset);

        const [rows] = await db.execute(sql, values);
        return rows;
    },

    /**
     * Récupérer les ventes d'un client
     */
    async findByClient(clientId) {
        const [rows] = await db.execute(
            `SELECT vt.id_vente, vt.date_vente, vt.montant_total, vt.type_paiement, vt.statut_vente, vt.notes,
                    v.marque, v.modele, v.annee, v.prix, v.image AS voiture_image,
                    ve.nom AS vendeur_nom, ve.prenom AS vendeur_prenom,
                    ag.nom_agence
             FROM vente vt
             LEFT JOIN voiture v ON vt.id_voiture = v.id_voiture
             LEFT JOIN vendeur ve ON vt.id_vendeur = ve.id_vendeur
             LEFT JOIN agence ag ON vt.id_agence = ag.id_agence
             WHERE vt.id_client = ?
             ORDER BY vt.date_vente DESC`,
            [clientId]
        );
        return rows;
    },

    /**
     * Récupérer les ventes d'un vendeur
     */
    async findByVendeur(vendeurId) {
        const [rows] = await db.execute(
            `SELECT vt.id_vente, vt.date_vente, vt.montant_total, vt.type_paiement, vt.statut_vente, vt.notes,
                    c.nom AS client_nom, c.prenom AS client_prenom, c.telephone AS client_telephone,
                    v.marque, v.modele, v.annee, v.prix, v.image AS voiture_image,
                    ag.nom_agence
             FROM vente vt
             LEFT JOIN client c ON vt.id_client = c.id_client
             LEFT JOIN voiture v ON vt.id_voiture = v.id_voiture
             LEFT JOIN agence ag ON vt.id_agence = ag.id_agence
             WHERE vt.id_vendeur = ?
             ORDER BY vt.date_vente DESC`,
            [vendeurId]
        );
        return rows;
    },

    /**
     * Récupérer les ventes en attente
     */
    async findPending() {
        const [rows] = await db.execute(
            `SELECT vt.id_vente, vt.date_vente, vt.montant_total, vt.type_paiement, vt.statut_vente,
                    c.nom AS client_nom, c.prenom AS client_prenom,
                    v.marque, v.modele, v.annee,
                    ve.nom AS vendeur_nom, ve.prenom AS vendeur_prenom,
                    ag.nom_agence
             FROM vente vt
             LEFT JOIN client c ON vt.id_client = c.id_client
             LEFT JOIN voiture v ON vt.id_voiture = v.id_voiture
             LEFT JOIN vendeur ve ON vt.id_vendeur = ve.id_vendeur
             LEFT JOIN agence ag ON vt.id_agence = ag.id_agence
             WHERE vt.statut_vente = ?
             ORDER BY vt.date_vente DESC`,
            ['en_attente']
        );
        return rows;
    },

    /**
     * Compter les ventes avec filtres optionnels
     */
    async count(filters = {}) {
        const { statut_vente, date_debut, date_fin, type_paiement } = filters;
        let sql = 'SELECT COUNT(*) AS total FROM vente vt';
        const conditions = [];
        const values = [];

        if (statut_vente) {
            conditions.push('vt.statut_vente = ?');
            values.push(statut_vente);
        }
        if (date_debut) {
            conditions.push('vt.date_vente >= ?');
            values.push(date_debut);
        }
        if (date_fin) {
            conditions.push('vt.date_vente <= ?');
            values.push(date_fin);
        }
        if (type_paiement) {
            conditions.push('vt.type_paiement = ?');
            values.push(type_paiement);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        const [rows] = await db.execute(sql, values);
        return rows[0].total;
    },

    /**
     * Calculer le revenu total (ventes validées)
     */
    async totalRevenue() {
        const [rows] = await db.execute(
            'SELECT COALESCE(SUM(montant_total), 0) AS total FROM vente WHERE statut_vente = ?',
            ['validee']
        );
        return rows[0].total;
    },

    /**
     * Récupérer les ventes récentes
     */
    async recentSales(limit = 5) {
        const [rows] = await db.execute(
            `SELECT vt.id_vente, vt.date_vente, vt.montant_total, vt.type_paiement, vt.statut_vente,
                    c.nom AS client_nom, c.prenom AS client_prenom,
                    v.marque, v.modele, v.annee, v.image AS voiture_image,
                    ve.nom AS vendeur_nom, ve.prenom AS vendeur_prenom,
                    ag.nom_agence
             FROM vente vt
             LEFT JOIN client c ON vt.id_client = c.id_client
             LEFT JOIN voiture v ON vt.id_voiture = v.id_voiture
             LEFT JOIN vendeur ve ON vt.id_vendeur = ve.id_vendeur
             LEFT JOIN agence ag ON vt.id_agence = ag.id_agence
             ORDER BY vt.date_vente DESC
             LIMIT ?`,
            [limit]
        );
        return rows;
    },

    /**
     * Ventes par mois (pour graphiques)
     */
    async salesByMonth() {
        const [rows] = await db.execute(
            `SELECT
                YEAR(date_vente) AS annee,
                MONTH(date_vente) AS mois,
                COUNT(*) AS nombre_ventes,
                COALESCE(SUM(montant_total), 0) AS total_montant
             FROM vente
             WHERE statut_vente = ?
             GROUP BY YEAR(date_vente), MONTH(date_vente)
             ORDER BY annee DESC, mois DESC
             LIMIT 12`,
            ['validee']
        );
        return rows;
    },

    /**
     * Ventes par marque (pour graphiques)
     */
    async salesByBrand() {
        const [rows] = await db.execute(
            `SELECT
                v.marque,
                COUNT(*) AS nombre_ventes,
                COALESCE(SUM(vt.montant_total), 0) AS total_montant
             FROM vente vt
             LEFT JOIN voiture v ON vt.id_voiture = v.id_voiture
             WHERE vt.statut_vente = ?
             GROUP BY v.marque
             ORDER BY nombre_ventes DESC`,
            ['validee']
        );
        return rows;
    }
};

module.exports = Sale;

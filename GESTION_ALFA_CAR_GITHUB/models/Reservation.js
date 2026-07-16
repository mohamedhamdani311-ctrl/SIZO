// ============================================================
// Model: Reservation
// GESTION ALFA CAR
// ============================================================

const db = require('../config/database');

const Reservation = {
    /**
     * Trouver une réservation par son ID (avec infos client, voiture, vendeur)
     */
    async findById(id) {
        const [rows] = await db.execute(
            `SELECT r.id_reservation, r.id_client, r.id_voiture, r.id_vendeur,
                    r.date_reservation, r.statut, r.date_expiration, r.note,
                    c.nom AS client_nom, c.prenom AS client_prenom, c.telephone AS client_telephone, c.email AS client_email,
                    v.marque, v.modele, v.annee, v.prix, v.image AS voiture_image, v.couleur,
                    ve.nom AS vendeur_nom, ve.prenom AS vendeur_prenom,
                    ag.nom_agence
             FROM reservation r
             INNER JOIN client c ON r.id_client = c.id_client
             INNER JOIN voiture v ON r.id_voiture = v.id_voiture
             INNER JOIN vendeur ve ON r.id_vendeur = ve.id_vendeur
             INNER JOIN agence ag ON v.id_agence = ag.id_agence
             WHERE r.id_reservation = ?`,
            [id]
        );
        return rows[0] || null;
    },

    /**
     * Créer une nouvelle réservation
     */
    async create(data) {
        const { id_client, id_voiture, id_vendeur, date_expiration, note } = data;
        const [result] = await db.execute(
            'INSERT INTO reservation (id_client, id_voiture, id_vendeur, date_expiration, note) VALUES (?, ?, ?, ?, ?)',
            [id_client, id_voiture, id_vendeur, date_expiration || null, note || null]
        );
        return result;
    },

    /**
     * Mettre à jour le statut d'une réservation
     */
    async updateStatus(id, statut) {
        const [result] = await db.execute(
            'UPDATE reservation SET statut = ? WHERE id_reservation = ?',
            [statut, id]
        );
        return result;
    },

    /**
     * Supprimer une réservation
     */
    async delete(id) {
        const [result] = await db.execute(
            'DELETE FROM reservation WHERE id_reservation = ?',
            [id]
        );
        return result;
    },

    /**
     * Récupérer toutes les réservations avec filtres et pagination
     */
    async findAll(filters = {}) {
        const { statut, page, limit } = filters;
        let sql = `SELECT r.id_reservation, r.id_client, r.id_voiture, r.id_vendeur,
                          r.date_reservation, r.statut, r.date_expiration, r.note,
                          c.nom AS client_nom, c.prenom AS client_prenom,
                          v.marque, v.modele, v.annee, v.prix, v.image AS voiture_image,
                          ve.nom AS vendeur_nom, ve.prenom AS vendeur_prenom,
                          ag.nom_agence
                   FROM reservation r
                   INNER JOIN client c ON r.id_client = c.id_client
                   INNER JOIN voiture v ON r.id_voiture = v.id_voiture
                   INNER JOIN vendeur ve ON r.id_vendeur = ve.id_vendeur
                   INNER JOIN agence ag ON v.id_agence = ag.id_agence`;
        const conditions = [];
        const values = [];

        if (statut) {
            conditions.push('r.statut = ?');
            values.push(statut);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        sql += ' ORDER BY r.date_reservation DESC';

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
     * Récupérer les réservations d'un client
     */
    async findByClient(clientId) {
        const [rows] = await db.execute(
            `SELECT r.id_reservation, r.id_client, r.id_voiture, r.id_vendeur,
                    r.date_reservation, r.statut, r.date_expiration, r.note,
                    v.marque, v.modele, v.annee, v.prix, v.image AS voiture_image, v.couleur,
                    ve.nom AS vendeur_nom, ve.prenom AS vendeur_prenom,
                    ag.nom_agence
             FROM reservation r
             INNER JOIN voiture v ON r.id_voiture = v.id_voiture
             INNER JOIN vendeur ve ON r.id_vendeur = ve.id_vendeur
             INNER JOIN agence ag ON v.id_agence = ag.id_agence
             WHERE r.id_client = ?
             ORDER BY r.date_reservation DESC`,
            [clientId]
        );
        return rows;
    },

    /**
     * Récupérer les réservations d'un vendeur
     */
    async findByVendeur(vendeurId) {
        const [rows] = await db.execute(
            `SELECT r.id_reservation, r.id_client, r.id_voiture, r.id_vendeur,
                    r.date_reservation, r.statut, r.date_expiration, r.note,
                    c.nom AS client_nom, c.prenom AS client_prenom, c.telephone AS client_telephone,
                    v.marque, v.modele, v.annee, v.prix, v.image AS voiture_image,
                    ag.nom_agence
             FROM reservation r
             INNER JOIN client c ON r.id_client = c.id_client
             INNER JOIN voiture v ON r.id_voiture = v.id_voiture
             INNER JOIN agence ag ON v.id_agence = ag.id_agence
             WHERE r.id_vendeur = ?
             ORDER BY r.date_reservation DESC`,
            [vendeurId]
        );
        return rows;
    },

    /**
     * Récupérer les réservations en attente
     */
    async findPending() {
        const [rows] = await db.execute(
            `SELECT r.id_reservation, r.id_client, r.id_voiture, r.id_vendeur,
                    r.date_reservation, r.statut, r.date_expiration, r.note,
                    c.nom AS client_nom, c.prenom AS client_prenom,
                    v.marque, v.modele, v.annee, v.prix,
                    ve.nom AS vendeur_nom, ve.prenom AS vendeur_prenom
             FROM reservation r
             INNER JOIN client c ON r.id_client = c.id_client
             INNER JOIN voiture v ON r.id_voiture = v.id_voiture
             INNER JOIN vendeur ve ON r.id_vendeur = ve.id_vendeur
             WHERE r.statut = ?
             ORDER BY r.date_reservation DESC`,
            ['en_attente']
        );
        return rows;
    },

    /**
     * Compter les réservations avec filtres optionnels
     */
    async count(filters = {}) {
        const { statut } = filters;
        let sql = 'SELECT COUNT(*) AS total FROM reservation r';
        const conditions = [];
        const values = [];

        if (statut) {
            conditions.push('r.statut = ?');
            values.push(statut);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        const [rows] = await db.execute(sql, values);
        return rows[0].total;
    },

    /**
     * Compter les réservations par statut
     */
    async countByStatus(statut) {
        const [rows] = await db.execute(
            'SELECT COUNT(*) AS total FROM reservation WHERE statut = ?',
            [statut]
        );
        return rows[0].total;
    }
};

module.exports = Reservation;

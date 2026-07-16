// ============================================================
// Model: Payment (paiement)
// GESTION ALFA CAR
// ============================================================

const db = require('../config/database');

const Payment = {
    /**
     * Trouver un paiement par son ID (avec infos vente, client, voiture)
     */
    async findById(id) {
        const [rows] = await db.execute(
            `SELECT p.id_paiement, p.id_vente, p.montant, p.type_paiement, p.statut,
                    p.date_paiement, p.id_admin_validation, p.montant_avance,
                    p.nombre_mensualites, p.mensualite, p.taux_interet, p.date_debut_remboursement,
                    vt.montant_total, vt.statut_vente, vt.date_vente, vt.type_paiement AS vente_type_paiement,
                    c.id_client, c.nom AS client_nom, c.prenom AS client_prenom,
                    c.telephone AS client_telephone, c.email AS client_email, c.adresse AS client_adresse,
                    v.id_voiture, v.marque, v.modele, v.annee, v.prix, v.image AS voiture_image,
                    v.couleur, v.kilometrage,
                    ag.nom_agence, ag.adresse AS agence_adresse
             FROM paiement p
             INNER JOIN vente vt ON p.id_vente = vt.id_vente
             INNER JOIN client c ON vt.id_client = c.id_client
             INNER JOIN voiture v ON vt.id_voiture = v.id_voiture
             INNER JOIN agence ag ON vt.id_agence = ag.id_agence
             WHERE p.id_paiement = ?`,
            [id]
        );
        return rows[0] || null;
    },

    /**
     * Créer un nouveau paiement
     */
    async create(data) {
        const {
            id_vente, montant, type_paiement, montant_avance,
            nombre_mensualites, mensualite, taux_interet, date_debut_remboursement
        } = data;
        const [result] = await db.execute(
            `INSERT INTO paiement (id_vente, montant, type_paiement, montant_avance, nombre_mensualites, mensualite, taux_interet, date_debut_remboursement)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id_vente, montant, type_paiement,
                montant_avance || null, nombre_mensualites || null,
                mensualite || null, taux_interet || null,
                date_debut_remboursement || null
            ]
        );
        return result;
    },

    /**
     * Mettre à jour le statut d'un paiement et l'admin qui valide
     */
    async updateStatus(id, statut, adminId) {
        const [result] = await db.execute(
            'UPDATE paiement SET statut = ?, id_admin_validation = ? WHERE id_paiement = ?',
            [statut, adminId || null, id]
        );
        return result;
    },

    /**
     * Supprimer un paiement
     */
    async delete(id) {
        const [result] = await db.execute(
            'DELETE FROM paiement WHERE id_paiement = ?',
            [id]
        );
        return result;
    },

    /**
     * Récupérer tous les paiements avec filtres et pagination
     */
    async findAll(filters = {}) {
        const { statut, type_paiement, date_debut, date_fin, page, limit } = filters;
        let sql = `SELECT p.id_paiement, p.id_vente, p.montant, p.type_paiement, p.statut,
                          p.date_paiement, p.id_admin_validation, p.montant_avance,
                          p.nombre_mensualites, p.mensualite, p.taux_interet, p.date_debut_remboursement,
                          vt.montant_total, vt.statut_vente,
                          c.id_client, c.nom AS client_nom, c.prenom AS client_prenom,
                          v.id_voiture, v.marque, v.modele, v.annee, v.image AS voiture_image,
                          ag.nom_agence
                   FROM paiement p
                   INNER JOIN vente vt ON p.id_vente = vt.id_vente
                   INNER JOIN client c ON vt.id_client = c.id_client
                   INNER JOIN voiture v ON vt.id_voiture = v.id_voiture
                   INNER JOIN agence ag ON vt.id_agence = ag.id_agence`;
        const conditions = [];
        const values = [];

        if (statut) {
            conditions.push('p.statut = ?');
            values.push(statut);
        }
        if (type_paiement) {
            conditions.push('p.type_paiement = ?');
            values.push(type_paiement);
        }
        if (date_debut) {
            conditions.push('p.date_paiement >= ?');
            values.push(date_debut);
        }
        if (date_fin) {
            conditions.push('p.date_paiement <= ?');
            values.push(date_fin);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        sql += ' ORDER BY p.date_paiement DESC';

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
     * Récupérer les paiements d'une vente
     */
    async findByVente(venteId) {
        const [rows] = await db.execute(
            `SELECT p.id_paiement, p.id_vente, p.montant, p.type_paiement, p.statut,
                    p.date_paiement, p.id_admin_validation, p.montant_avance,
                    p.nombre_mensualites, p.mensualite, p.taux_interet, p.date_debut_remboursement
             FROM paiement p
             WHERE p.id_vente = ?
             ORDER BY p.date_paiement DESC`,
            [venteId]
        );
        return rows;
    },

    /**
     * Récupérer les paiements d'un client (via la vente)
     */
    async findByClient(clientId) {
        const [rows] = await db.execute(
            `SELECT p.id_paiement, p.id_vente, p.montant, p.type_paiement, p.statut,
                    p.date_paiement, p.montant_avance, p.nombre_mensualites, p.mensualite,
                    vt.montant_total, vt.statut_vente,
                    v.marque, v.modele, v.annee, v.image AS voiture_image,
                    ag.nom_agence
             FROM paiement p
             INNER JOIN vente vt ON p.id_vente = vt.id_vente
             INNER JOIN voiture v ON vt.id_voiture = v.id_voiture
             INNER JOIN agence ag ON vt.id_agence = ag.id_agence
             WHERE vt.id_client = ?
             ORDER BY p.date_paiement DESC`,
            [clientId]
        );
        return rows;
    },

    /**
     * Récupérer les paiements en attente
     */
    async findPending() {
        const [rows] = await db.execute(
            `SELECT p.id_paiement, p.id_vente, p.montant, p.type_paiement, p.statut,
                    p.date_paiement, p.montant_avance, p.nombre_mensualites, p.mensualite,
                    vt.montant_total,
                    c.nom AS client_nom, c.prenom AS client_prenom,
                    v.marque, v.modele, v.annee,
                    ag.nom_agence
             FROM paiement p
             INNER JOIN vente vt ON p.id_vente = vt.id_vente
             INNER JOIN client c ON vt.id_client = c.id_client
             INNER JOIN voiture v ON vt.id_voiture = v.id_voiture
             INNER JOIN agence ag ON vt.id_agence = ag.id_agence
             WHERE p.statut = ?
             ORDER BY p.date_paiement DESC`,
            ['en_attente']
        );
        return rows;
    },

    /**
     * Compter les paiements avec filtres optionnels
     */
    async count(filters = {}) {
        const { statut, type_paiement, date_debut, date_fin } = filters;
        let sql = 'SELECT COUNT(*) AS total FROM paiement p';
        const conditions = [];
        const values = [];

        if (statut) {
            conditions.push('p.statut = ?');
            values.push(statut);
        }
        if (type_paiement) {
            conditions.push('p.type_paiement = ?');
            values.push(type_paiement);
        }
        if (date_debut) {
            conditions.push('p.date_paiement >= ?');
            values.push(date_debut);
        }
        if (date_fin) {
            conditions.push('p.date_paiement <= ?');
            values.push(date_fin);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        const [rows] = await db.execute(sql, values);
        return rows[0].total;
    },

    /**
     * Calculer le total des paiements confirmés
     */
    async totalPayments() {
        const [rows] = await db.execute(
            'SELECT COALESCE(SUM(montant), 0) AS total FROM paiement WHERE statut = ?',
            ['confirme']
        );
        return rows[0].total;
    }
};

module.exports = Payment;

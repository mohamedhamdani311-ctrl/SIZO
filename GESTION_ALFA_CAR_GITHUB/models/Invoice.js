// ============================================================
// Model: Invoice (facture)
// GESTION ALFA CAR
// ============================================================

const db = require('../config/database');

const Invoice = {
    /**
     * Trouver une facture par son ID (avec toutes les infos liées)
     */
    async findById(id) {
        const [rows] = await db.execute(
            `SELECT f.id_facture, f.id_paiement, f.numero_facture, f.fichier_pdf,
                    f.date_facture, f.statut_envoi,
                    p.montant AS paiement_montant, p.type_paiement AS paiement_type, p.statut AS paiement_statut,
                    p.date_paiement, p.montant_avance, p.nombre_mensualites, p.mensualite, p.taux_interet,
                    vt.id_vente, vt.montant_total, vt.type_paiement AS vente_type_paiement,
                    vt.statut_vente, vt.date_vente,
                    c.id_client, c.nom AS client_nom, c.prenom AS client_prenom,
                    c.telephone AS client_telephone, c.email AS client_email, c.adresse AS client_adresse,
                    v.id_voiture, v.marque, v.modele, v.annee, v.prix, v.image AS voiture_image,
                    v.couleur, v.kilometrage, v.carburant, v.boite_vitesse,
                    ag.id_agence, ag.nom_agence, ag.adresse AS agence_adresse,
                    ag.telephone AS agence_telephone, ag.email AS agence_email
             FROM facture f
             INNER JOIN paiement p ON f.id_paiement = p.id_paiement
             INNER JOIN vente vt ON p.id_vente = vt.id_vente
             INNER JOIN client c ON vt.id_client = c.id_client
             INNER JOIN voiture v ON vt.id_voiture = v.id_voiture
             INNER JOIN agence ag ON vt.id_agence = ag.id_agence
             WHERE f.id_facture = ?`,
            [id]
        );
        return rows[0] || null;
    },

    /**
     * Créer une nouvelle facture
     */
    async create(data) {
        const { id_paiement, numero_facture, fichier_pdf, statut_envoi } = data;
        const [result] = await db.execute(
            'INSERT INTO facture (id_paiement, numero_facture, fichier_pdf, statut_envoi) VALUES (?, ?, ?, ?)',
            [id_paiement, numero_facture, fichier_pdf || null, statut_envoi || 'non_envoyee']
        );
        return result;
    },

    /**
     * Mettre à jour une facture
     */
    async update(id, data) {
        const { fichier_pdf, statut_envoi } = data;
        const fields = [];
        const values = [];

        if (fichier_pdf !== undefined) { fields.push('fichier_pdf = ?'); values.push(fichier_pdf); }
        if (statut_envoi !== undefined) { fields.push('statut_envoi = ?'); values.push(statut_envoi); }

        if (fields.length === 0) {
            return { affectedRows: 0 };
        }

        values.push(id);
        const [result] = await db.execute(
            `UPDATE facture SET ${fields.join(', ')} WHERE id_facture = ?`,
            values
        );
        return result;
    },

    /**
     * Supprimer une facture
     */
    async delete(id) {
        const [result] = await db.execute(
            'DELETE FROM facture WHERE id_facture = ?',
            [id]
        );
        return result;
    },

    /**
     * Récupérer toutes les factures avec pagination
     */
    async findAll(filters = {}) {
        const { page, limit } = filters;
        let sql = `SELECT f.id_facture, f.id_paiement, f.numero_facture, f.fichier_pdf,
                          f.date_facture, f.statut_envoi,
                          p.montant AS paiement_montant, p.type_paiement AS paiement_type, p.statut AS paiement_statut,
                          vt.id_vente, vt.montant_total, vt.statut_vente, vt.date_vente,
                          c.id_client, c.nom AS client_nom, c.prenom AS client_prenom,
                          v.id_voiture, v.marque, v.modele, v.annee, v.image AS voiture_image,
                          ag.nom_agence
                   FROM facture f
                   INNER JOIN paiement p ON f.id_paiement = p.id_paiement
                   INNER JOIN vente vt ON p.id_vente = vt.id_vente
                   INNER JOIN client c ON vt.id_client = c.id_client
                   INNER JOIN voiture v ON vt.id_voiture = v.id_voiture
                   INNER JOIN agence ag ON vt.id_agence = ag.id_agence
                   ORDER BY f.date_facture DESC`;

        const values = [];

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
     * Récupérer les factures d'un client (via les joins)
     */
    async findByClient(clientId) {
        const [rows] = await db.execute(
            `SELECT f.id_facture, f.numero_facture, f.fichier_pdf, f.date_facture, f.statut_envoi,
                    p.montant AS paiement_montant, p.type_paiement AS paiement_type, p.statut AS paiement_statut,
                    vt.id_vente, vt.montant_total, vt.statut_vente,
                    v.marque, v.modele, v.annee, v.image AS voiture_image,
                    ag.nom_agence
             FROM facture f
             INNER JOIN paiement p ON f.id_paiement = p.id_paiement
             INNER JOIN vente vt ON p.id_vente = vt.id_vente
             INNER JOIN client c ON vt.id_client = c.id_client
             INNER JOIN voiture v ON vt.id_voiture = v.id_voiture
             INNER JOIN agence ag ON vt.id_agence = ag.id_agence
             WHERE c.id_client = ?
             ORDER BY f.date_facture DESC`,
            [clientId]
        );
        return rows;
    },

    /**
     * Récupérer une facture par l'ID du paiement
     */
    async findByPaiement(paiementId) {
        const [rows] = await db.execute(
            `SELECT f.id_facture, f.id_paiement, f.numero_facture, f.fichier_pdf,
                    f.date_facture, f.statut_envoi
             FROM facture f
             WHERE f.id_paiement = ?`,
            [paiementId]
        );
        return rows[0] || null;
    },

    /**
     * Générer un numéro de facture unique : FAC-YYYY-XXXX
     */
    async generateNumber() {
        const year = new Date().getFullYear();
        const prefix = `FAC-${year}-`;

        const [rows] = await db.execute(
            `SELECT numero_facture FROM facture
             WHERE numero_facture LIKE ?
             ORDER BY numero_facture DESC
             LIMIT 1`,
            [`${prefix}%`]
        );

        let nextNumber = 1;
        if (rows.length > 0) {
            const lastNumber = rows[0].numero_facture;
            const lastSequence = parseInt(lastNumber.split('-').pop(), 10);
            if (!isNaN(lastSequence)) {
                nextNumber = lastSequence + 1;
            }
        }

        const formattedNumber = String(nextNumber).padStart(4, '0');
        return `${prefix}${formattedNumber}`;
    },

    /**
     * Compter les factures avec filtres optionnels
     */
    async count(filters = {}) {
        const { statut_envoi } = filters;
        let sql = 'SELECT COUNT(*) AS total FROM facture f';
        const conditions = [];
        const values = [];

        if (statut_envoi) {
            conditions.push('f.statut_envoi = ?');
            values.push(statut_envoi);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        const [rows] = await db.execute(sql, values);
        return rows[0].total;
    }
};

module.exports = Invoice;

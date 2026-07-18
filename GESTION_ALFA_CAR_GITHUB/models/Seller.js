// ============================================================
// Model: Seller (vendeur)
// GESTION ALFA CAR
// ============================================================

const db = require('../config/database');

const Seller = {
    /**
     * Trouver un vendeur par son ID (avec infos utilisateur et agence)
     */
    async findById(id) {
        const [rows] = await db.execute(
            `SELECT v.id_vendeur, v.id_utilisateur, v.id_agence, v.nom, v.prenom,
                    v.telephone, v.email, v.date_embauche,
                    u.username, u.role, u.statut_compte, u.date_creation,
                    ag.nom_agence, ag.adresse AS agence_adresse
             FROM vendeur v
             INNER JOIN utilisateur u ON v.id_utilisateur = u.id_utilisateur
             INNER JOIN agence ag ON v.id_agence = ag.id_agence
             WHERE v.id_vendeur = ?`,
            [id]
        );
        return rows[0] || null;
    },

    /**
     * Trouver un vendeur par l'ID utilisateur
     */
    async findByUserId(userId) {
        const [rows] = await db.execute(
            `SELECT v.id_vendeur, v.id_utilisateur, v.id_agence, v.nom, v.prenom,
                    v.telephone, v.email, v.date_embauche,
                    u.username, u.role, u.statut_compte, u.date_creation,
                    ag.nom_agence, ag.adresse AS agence_adresse
             FROM vendeur v
             INNER JOIN utilisateur u ON v.id_utilisateur = u.id_utilisateur
             INNER JOIN agence ag ON v.id_agence = ag.id_agence
             WHERE v.id_utilisateur = ?`,
            [userId]
        );
        return rows[0] || null;
    },

    /**
     * Créer un nouveau vendeur
     */
    async create(sellerData) {
        const { id_utilisateur, id_agence, nom, prenom, telephone, email } = sellerData;
        const [result] = await db.execute(
            'INSERT INTO vendeur (id_utilisateur, id_agence, nom, prenom, telephone, email) VALUES (?, ?, ?, ?, ?, ?)',
            [id_utilisateur, id_agence, nom, prenom, telephone || null, email || null]
        );
        return result;
    },

    /**
     * Mettre à jour un vendeur
     */
    async update(id, data) {
        const { id_agence, nom, prenom, telephone, email } = data;
        const [result] = await db.execute(
            'UPDATE vendeur SET id_agence = ?, nom = ?, prenom = ?, telephone = ?, email = ? WHERE id_vendeur = ?',
            [id_agence, nom, prenom, telephone || null, email || null, id]
        );
        return result;
    },

    /**
     * Supprimer un vendeur (supprime aussi l'utilisateur via CASCADE)
     */
    async delete(id) {
        // Récupérer l'id_utilisateur avant suppression
        const [vendeur] = await db.execute(
            'SELECT id_utilisateur FROM vendeur WHERE id_vendeur = ?',
            [id]
        );
        if (vendeur.length === 0) {
            return { affectedRows: 0 };
        }
        // Supprimer l'utilisateur (CASCADE supprimera le vendeur)
        const [result] = await db.execute(
            'DELETE FROM utilisateur WHERE id_utilisateur = ?',
            [vendeur[0].id_utilisateur]
        );
        return result;
    },

    /**
     * Récupérer tous les vendeurs avec infos utilisateur et agence
     */
    async findAll() {
        const [rows] = await db.execute(
            `SELECT v.id_vendeur, v.id_utilisateur, v.id_agence, v.nom, v.prenom,
                    v.telephone, v.email, v.date_embauche,
                    u.username, u.role, u.statut_compte, u.date_creation,
                    ag.nom_agence, ag.adresse AS agence_adresse
             FROM vendeur v
             INNER JOIN utilisateur u ON v.id_utilisateur = u.id_utilisateur
             INNER JOIN agence ag ON v.id_agence = ag.id_agence
             WHERE u.statut_compte = 'actif'
             ORDER BY v.id_vendeur ASC`
        );
        return rows;
    },

    /**
     * Récupérer les vendeurs d'une agence spécifique
     */
    async findByAgency(agencyId) {
        const [rows] = await db.execute(
            `SELECT v.id_vendeur, v.id_utilisateur, v.id_agence, v.nom, v.prenom,
                    v.telephone, v.email, v.date_embauche,
                    u.username, u.role, u.statut_compte,
                    ag.nom_agence
             FROM vendeur v
             INNER JOIN utilisateur u ON v.id_utilisateur = u.id_utilisateur
             INNER JOIN agence ag ON v.id_agence = ag.id_agence
             WHERE v.id_agence = ?
             ORDER BY v.nom ASC`,
            [agencyId]
        );
        return rows;
    },

    /**
     * Compter le nombre total de vendeurs
     */
    async count() {
        const [rows] = await db.execute(
            `SELECT COUNT(*) AS total FROM vendeur v
             INNER JOIN utilisateur u ON v.id_utilisateur = u.id_utilisateur
             WHERE u.statut_compte = 'actif'`
        );
        return rows[0].total;
    }
};

module.exports = Seller;

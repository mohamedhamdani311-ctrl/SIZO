// ============================================================
// Model: Client
// GESTION ALFA CAR
// ============================================================

const db = require('../config/database');

const Client = {
    /**
     * Trouver un client par son ID (avec infos utilisateur)
     */
    async findById(id) {
        const [rows] = await db.execute(
            `SELECT c.id_client, c.id_utilisateur, c.nom, c.prenom,
                    c.telephone, c.email, c.adresse, c.date_inscription,
                    u.username, u.role, u.statut_compte, u.date_creation
             FROM client c
             INNER JOIN utilisateur u ON c.id_utilisateur = u.id_utilisateur
             WHERE c.id_client = ?`,
            [id]
        );
        return rows[0] || null;
    },

    /**
     * Trouver un client par l'ID utilisateur
     */
    async findByUserId(userId) {
        const [rows] = await db.execute(
            `SELECT c.id_client, c.id_utilisateur, c.nom, c.prenom,
                    c.telephone, c.email, c.adresse, c.date_inscription,
                    u.username, u.role, u.statut_compte, u.date_creation
             FROM client c
             INNER JOIN utilisateur u ON c.id_utilisateur = u.id_utilisateur
             WHERE c.id_utilisateur = ?`,
            [userId]
        );
        return rows[0] || null;
    },

    /**
     * Créer un nouveau client
     */
    async create(clientData) {
        const { id_utilisateur, nom, prenom, telephone, email, adresse } = clientData;
        const [result] = await db.execute(
            'INSERT INTO client (id_utilisateur, nom, prenom, telephone, email, adresse) VALUES (?, ?, ?, ?, ?, ?)',
            [id_utilisateur, nom, prenom, telephone || null, email || null, adresse || null]
        );
        return result;
    },

    /**
     * Mettre à jour un client
     */
    async update(id, data) {
        const { nom, prenom, telephone, email, adresse } = data;
        const [result] = await db.execute(
            'UPDATE client SET nom = ?, prenom = ?, telephone = ?, email = ?, adresse = ? WHERE id_client = ?',
            [nom, prenom, telephone || null, email || null, adresse || null, id]
        );
        return result;
    },

    /**
     * Supprimer un client (supprime aussi l'utilisateur via CASCADE)
     */
    async delete(id) {
        // Récupérer l'id_utilisateur avant suppression
        const [client] = await db.execute(
            'SELECT id_utilisateur FROM client WHERE id_client = ?',
            [id]
        );
        if (client.length === 0) {
            return { affectedRows: 0 };
        }
        // Supprimer l'utilisateur (CASCADE supprimera le client)
        const [result] = await db.execute(
            'DELETE FROM utilisateur WHERE id_utilisateur = ?',
            [client[0].id_utilisateur]
        );
        return result;
    },

    /**
     * Récupérer tous les clients avec infos utilisateur
     */
    async findAll() {
        const [rows] = await db.execute(
            `SELECT c.id_client, c.id_utilisateur, c.nom, c.prenom,
                    c.telephone, c.email, c.adresse, c.date_inscription,
                    u.username, u.role, u.statut_compte, u.date_creation
             FROM client c
             INNER JOIN utilisateur u ON c.id_utilisateur = u.id_utilisateur
             ORDER BY c.date_inscription DESC`
        );
        return rows;
    },

    /**
     * Récupérer les clients en attente de validation
     */
    async findPending() {
        const [rows] = await db.execute(
            `SELECT c.id_client, c.id_utilisateur, c.nom, c.prenom,
                    c.telephone, c.email, c.adresse, c.date_inscription,
                    u.username, u.statut_compte, u.date_creation
             FROM client c
             INNER JOIN utilisateur u ON c.id_utilisateur = u.id_utilisateur
             WHERE u.statut_compte = ?
             ORDER BY c.date_inscription DESC`,
            ['en_attente']
        );
        return rows;
    },

    /**
     * Compter le nombre total de clients
     */
    async count() {
        const [rows] = await db.execute(
            'SELECT COUNT(*) AS total FROM client'
        );
        return rows[0].total;
    }
};

module.exports = Client;

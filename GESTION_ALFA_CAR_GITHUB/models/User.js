// ============================================================
// Model: User (utilisateur)
// GESTION ALFA CAR
// ============================================================

const db = require('../config/database');

const User = {
    /**
     * Trouver un utilisateur par son ID
     */
    async findById(id) {
        const [rows] = await db.execute(
            'SELECT id_utilisateur, username, password, role, statut_compte, date_creation FROM utilisateur WHERE id_utilisateur = ?',
            [id]
        );
        return rows[0] || null;
    },

    /**
     * Trouver un utilisateur par son nom d'utilisateur
     */
    async findByUsername(username) {
        const [rows] = await db.execute(
            'SELECT id_utilisateur, username, password, role, statut_compte, date_creation FROM utilisateur WHERE username = ?',
            [username]
        );
        return rows[0] || null;
    },

    /**
     * Créer un nouvel utilisateur
     */
    async create(userData) {
        const { username, password, role, statut_compte } = userData;
        const [result] = await db.execute(
            'INSERT INTO utilisateur (username, password, role, statut_compte) VALUES (?, ?, ?, ?)',
            [username, password, role, statut_compte || 'en_attente']
        );
        return result.insertId;
    },

    /**
     * Mettre à jour le statut du compte
     */
    async updateStatus(id, statut) {
        const [result] = await db.execute(
            'UPDATE utilisateur SET statut_compte = ? WHERE id_utilisateur = ?',
            [statut, id]
        );
        return result;
    },

    /**
     * Mettre à jour le mot de passe
     */
    async updatePassword(id, hashedPassword) {
        const [result] = await db.execute(
            'UPDATE utilisateur SET password = ? WHERE id_utilisateur = ?',
            [hashedPassword, id]
        );
        return result;
    },

    /**
     * Récupérer tous les utilisateurs
     */
    async findAll() {
        const [rows] = await db.execute(
            'SELECT id_utilisateur, username, role, statut_compte, date_creation FROM utilisateur ORDER BY date_creation DESC'
        );
        return rows;
    },

    /**
     * Récupérer les utilisateurs en attente de validation
     */
    async findPending() {
        const [rows] = await db.execute(
            'SELECT id_utilisateur, username, role, statut_compte, date_creation FROM utilisateur WHERE statut_compte = ? ORDER BY date_creation DESC',
            ['en_attente']
        );
        return rows;
    },

    /**
     * Supprimer un utilisateur
     */
    async delete(id) {
        const [result] = await db.execute(
            'DELETE FROM utilisateur WHERE id_utilisateur = ?',
            [id]
        );
        return result;
    },

    /**
     * Compter les utilisateurs par rôle
     */
    async countByRole(role) {
        const [rows] = await db.execute(
            'SELECT COUNT(*) AS total FROM utilisateur WHERE role = ?',
            [role]
        );
        return rows[0].total;
    }
};

module.exports = User;

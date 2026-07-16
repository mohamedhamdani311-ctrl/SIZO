// ============================================================
// Model: Admin (administrateur)
// GESTION ALFA CAR
// ============================================================

const db = require('../config/database');

const Admin = {
    /**
     * Trouver un administrateur par son ID
     */
    async findById(id) {
        const [rows] = await db.execute(
            `SELECT a.id_admin, a.id_utilisateur, a.nom, a.prenom, a.niveau_acces,
                    u.username, u.role, u.statut_compte, u.date_creation
             FROM administrateur a
             INNER JOIN utilisateur u ON a.id_utilisateur = u.id_utilisateur
             WHERE a.id_admin = ?`,
            [id]
        );
        return rows[0] || null;
    },

    /**
     * Trouver un administrateur par l'ID utilisateur
     */
    async findByUserId(userId) {
        const [rows] = await db.execute(
            `SELECT a.id_admin, a.id_utilisateur, a.nom, a.prenom, a.niveau_acces,
                    u.username, u.role, u.statut_compte, u.date_creation
             FROM administrateur a
             INNER JOIN utilisateur u ON a.id_utilisateur = u.id_utilisateur
             WHERE a.id_utilisateur = ?`,
            [userId]
        );
        return rows[0] || null;
    },

    /**
     * Créer un nouvel administrateur
     */
    async create(adminData) {
        const { id_utilisateur, nom, prenom, niveau_acces } = adminData;
        const [result] = await db.execute(
            'INSERT INTO administrateur (id_utilisateur, nom, prenom, niveau_acces) VALUES (?, ?, ?, ?)',
            [id_utilisateur, nom, prenom, niveau_acces || 'normal']
        );
        return result;
    },

    /**
     * Mettre à jour un administrateur
     */
    async update(id, data) {
        const { nom, prenom, niveau_acces } = data;
        const [result] = await db.execute(
            'UPDATE administrateur SET nom = ?, prenom = ?, niveau_acces = ? WHERE id_admin = ?',
            [nom, prenom, niveau_acces, id]
        );
        return result;
    },

    /**
     * Récupérer tous les administrateurs avec leurs infos utilisateur
     */
    async findAll() {
        const [rows] = await db.execute(
            `SELECT a.id_admin, a.id_utilisateur, a.nom, a.prenom, a.niveau_acces,
                    u.username, u.role, u.statut_compte, u.date_creation
             FROM administrateur a
             INNER JOIN utilisateur u ON a.id_utilisateur = u.id_utilisateur
             ORDER BY a.id_admin ASC`
        );
        return rows;
    }
};

module.exports = Admin;

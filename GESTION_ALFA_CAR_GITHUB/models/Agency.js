// ============================================================
// Model: Agency (agence)
// GESTION ALFA CAR
// ============================================================

const db = require('../config/database');

const Agency = {
    /**
     * Trouver une agence par son ID
     */
    async findById(id) {
        const [rows] = await db.execute(
            'SELECT id_agence, nom_agence, adresse, telephone, email, date_creation FROM agence WHERE id_agence = ?',
            [id]
        );
        return rows[0] || null;
    },

    /**
     * Créer une nouvelle agence
     */
    async create(data) {
        const { nom_agence, adresse, telephone, email } = data;
        const [result] = await db.execute(
            'INSERT INTO agence (nom_agence, adresse, telephone, email) VALUES (?, ?, ?, ?)',
            [nom_agence, adresse, telephone || null, email || null]
        );
        return result;
    },

    /**
     * Mettre à jour une agence
     */
    async update(id, data) {
        const { nom_agence, adresse, telephone, email } = data;
        const [result] = await db.execute(
            'UPDATE agence SET nom_agence = ?, adresse = ?, telephone = ?, email = ? WHERE id_agence = ?',
            [nom_agence, adresse, telephone || null, email || null, id]
        );
        return result;
    },

    /**
     * Supprimer une agence
     */
    async delete(id) {
        const [result] = await db.execute(
            'DELETE FROM agence WHERE id_agence = ?',
            [id]
        );
        return result;
    },

    /**
     * Récupérer toutes les agences
     */
    async findAll() {
        const [rows] = await db.execute(
            'SELECT id_agence, nom_agence, adresse, telephone, email, date_creation FROM agence ORDER BY nom_agence ASC'
        );
        return rows;
    },

    /**
     * Compter le nombre total d'agences
     */
    async count() {
        const [rows] = await db.execute(
            'SELECT COUNT(*) AS total FROM agence'
        );
        return rows[0].total;
    }
};

module.exports = Agency;

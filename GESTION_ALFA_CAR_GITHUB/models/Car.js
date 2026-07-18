// ============================================================
// Model: Car (voiture)
// GESTION ALFA CAR
// ============================================================

const db = require('../config/database');

const Car = {
    /**
     * Trouver une voiture par son ID (avec infos agence)
     */
    async findById(id) {
        const [rows] = await db.execute(
            `SELECT v.id_voiture, v.id_agence, v.marque, v.modele, v.annee, v.prix,
                    v.kilometrage, v.carburant, v.boite_vitesse, v.couleur,
                    v.description, v.image, v.statut, v.date_ajout,
                    ag.nom_agence, ag.adresse AS agence_adresse, ag.telephone AS agence_telephone
             FROM voiture v
             INNER JOIN agence ag ON v.id_agence = ag.id_agence
             WHERE v.id_voiture = ?`,
            [id]
        );
        return rows[0] || null;
    },

    /**
     * Créer une nouvelle voiture
     */
    async create(carData) {
        const { id_agence, marque, modele, annee, prix, kilometrage, carburant, boite_vitesse, couleur, description, image } = carData;
        const [result] = await db.execute(
            `INSERT INTO voiture (id_agence, marque, modele, annee, prix, kilometrage, carburant, boite_vitesse, couleur, description, image)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id_agence, marque, modele, annee, prix, kilometrage || 0, carburant, boite_vitesse, couleur || null, description || null, image || null]
        );
        return result;
    },

    /**
     * Mettre à jour une voiture
     */
    async update(id, data) {
        const { id_agence, marque, modele, annee, prix, kilometrage, carburant, boite_vitesse, couleur, description, image } = data;
        const fields = [];
        const values = [];

        if (id_agence !== undefined) { fields.push('id_agence = ?'); values.push(id_agence); }
        if (marque !== undefined) { fields.push('marque = ?'); values.push(marque); }
        if (modele !== undefined) { fields.push('modele = ?'); values.push(modele); }
        if (annee !== undefined) { fields.push('annee = ?'); values.push(annee); }
        if (prix !== undefined) { fields.push('prix = ?'); values.push(prix); }
        if (kilometrage !== undefined) { fields.push('kilometrage = ?'); values.push(kilometrage); }
        if (carburant !== undefined) { fields.push('carburant = ?'); values.push(carburant); }
        if (boite_vitesse !== undefined) { fields.push('boite_vitesse = ?'); values.push(boite_vitesse); }
        if (couleur !== undefined) { fields.push('couleur = ?'); values.push(couleur); }
        if (description !== undefined) { fields.push('description = ?'); values.push(description); }
        if (image !== undefined) { fields.push('image = ?'); values.push(image); }

        if (fields.length === 0) {
            return { affectedRows: 0 };
        }

        values.push(id);
        const [result] = await db.execute(
            `UPDATE voiture SET ${fields.join(', ')} WHERE id_voiture = ?`,
            values
        );
        return result;
    },

    /**
     * Supprimer une voiture
     */
    async delete(id) {
        const [result] = await db.execute(
            'DELETE FROM voiture WHERE id_voiture = ?',
            [id]
        );
        return result;
    },

    /**
     * Récupérer toutes les voitures avec filtres et pagination
     */
    async findAll(filters = {}) {
        const { marque, modele, annee, prix_min, prix_max, carburant, boite_vitesse, statut, page, limit } = filters;
        let sql = `SELECT v.id_voiture, v.id_agence, v.marque, v.modele, v.annee, v.prix,
                          v.kilometrage, v.carburant, v.boite_vitesse, v.couleur,
                          v.description, v.image, v.statut, v.date_ajout,
                          ag.nom_agence
                   FROM voiture v
                   INNER JOIN agence ag ON v.id_agence = ag.id_agence`;
        const conditions = [];
        const values = [];

        if (marque) {
            conditions.push('v.marque = ?');
            values.push(marque);
        }
        if (modele) {
            conditions.push('v.modele LIKE ?');
            values.push(`%${modele}%`);
        }
        if (annee) {
            conditions.push('v.annee = ?');
            values.push(annee);
        }
        if (prix_min) {
            conditions.push('v.prix >= ?');
            values.push(prix_min);
        }
        if (prix_max) {
            conditions.push('v.prix <= ?');
            values.push(prix_max);
        }
        if (carburant) {
            conditions.push('v.carburant = ?');
            values.push(carburant);
        }
        if (boite_vitesse) {
            conditions.push('v.boite_vitesse = ?');
            values.push(boite_vitesse);
        }
        if (statut) {
            conditions.push('v.statut = ?');
            values.push(statut);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        sql += ' ORDER BY v.date_ajout DESC';

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
     * Catalogue client : voitures disponibles + voitures reservee sans réservation active
     * (auto-récupère les voitures bloquées si une réservation a été annulée sans remettre le statut)
     */
    async findAvailableForClient(filters = {}) {
        const { marque, modele, annee, prix_min, prix_max, carburant, boite_vitesse } = filters;

        // On ignore complètement le champ statut (souvent désynchronisé).
        // Une voiture est disponible si : elle n'est pas vendue ET elle n'a pas de
        // réservation active ET elle n'a pas de vente active.
        let sql = `SELECT v.id_voiture, v.id_agence, v.marque, v.modele, v.annee, v.prix,
                          v.kilometrage, v.carburant, v.boite_vitesse, v.couleur,
                          v.description, v.image, v.statut, v.date_ajout,
                          ag.nom_agence
                   FROM voiture v
                   LEFT JOIN agence ag ON v.id_agence = ag.id_agence
                   WHERE v.statut != 'vendue'
                     AND NOT EXISTS (
                       SELECT 1 FROM reservation r
                       WHERE r.id_voiture = v.id_voiture
                         AND r.statut IN ('en_attente', 'confirmee')
                     )
                     AND NOT EXISTS (
                       SELECT 1 FROM vente vt
                       WHERE vt.id_voiture = v.id_voiture
                         AND vt.statut_vente IN ('en_attente', 'validee')
                     )`;

        const conditions = [];
        const values = [];

        if (marque)        { conditions.push('v.marque = ?');          values.push(marque); }
        if (modele)        { conditions.push('v.modele LIKE ?');        values.push(`%${modele}%`); }
        if (annee)         { conditions.push('v.annee = ?');            values.push(annee); }
        if (prix_min)      { conditions.push('v.prix >= ?');            values.push(prix_min); }
        if (prix_max)      { conditions.push('v.prix <= ?');            values.push(prix_max); }
        if (carburant)     { conditions.push('v.carburant = ?');        values.push(carburant); }
        if (boite_vitesse) { conditions.push('v.boite_vitesse = ?');    values.push(boite_vitesse); }

        if (conditions.length > 0) {
            sql += ' AND ' + conditions.join(' AND ');
        }

        sql += ' ORDER BY v.date_ajout DESC';

        const [rows] = await db.execute(sql, values);

        // Sync de fond : remettre à disponible les voitures qui ressortent disponibles
        // mais ont encore un statut obsolète (reservee)
        const toSync = rows.filter(r => r.statut !== 'disponible');
        if (toSync.length > 0) {
            Promise.all(
                toSync.map(r =>
                    db.execute('UPDATE voiture SET statut = ? WHERE id_voiture = ?', ['disponible', r.id_voiture])
                )
            ).catch(err => console.error('[Car sync]', err));
        }

        return rows;
    },

    /**
     * Répare tous les statuts de voitures désynchronisés (à appeler depuis l'admin).
     * Remet à 'disponible' toutes les voitures bloquées en 'reservee' sans réservation ni vente active.
     */
    async repairStatuses() {
        const [result] = await db.execute(`
            UPDATE voiture
            SET statut = 'disponible'
            WHERE statut = 'reservee'
              AND id_voiture NOT IN (
                SELECT id_voiture FROM reservation WHERE statut IN ('en_attente', 'confirmee')
              )
              AND id_voiture NOT IN (
                SELECT id_voiture FROM vente WHERE statut_vente IN ('en_attente', 'validee')
              )
        `);
        return result.affectedRows;
    },

    /**
     * Récupérer les voitures disponibles
     */
    async findAvailable() {
        const [rows] = await db.execute(
            `SELECT v.id_voiture, v.id_agence, v.marque, v.modele, v.annee, v.prix,
                    v.kilometrage, v.carburant, v.boite_vitesse, v.couleur,
                    v.description, v.image, v.statut, v.date_ajout,
                    ag.nom_agence
             FROM voiture v
             INNER JOIN agence ag ON v.id_agence = ag.id_agence
             WHERE v.statut = ?
             ORDER BY v.date_ajout DESC`,
            ['disponible']
        );
        return rows;
    },

    /**
     * Récupérer les voitures en vedette (les plus récentes disponibles)
     */
    async findFeatured(limit = 6) {
        const [rows] = await db.execute(
            `SELECT v.id_voiture, v.id_agence, v.marque, v.modele, v.annee, v.prix,
                    v.kilometrage, v.carburant, v.boite_vitesse, v.couleur,
                    v.description, v.image, v.statut, v.date_ajout,
                    ag.nom_agence
             FROM voiture v
             INNER JOIN agence ag ON v.id_agence = ag.id_agence
             WHERE v.statut = ?
             ORDER BY v.date_ajout DESC
             LIMIT ?`,
            ['disponible', limit]
        );
        return rows;
    },

    /**
     * Mettre à jour le statut d'une voiture
     */
    async updateStatus(id, statut) {
        const [result] = await db.execute(
            'UPDATE voiture SET statut = ? WHERE id_voiture = ?',
            [statut, id]
        );
        return result;
    },

    /**
     * Compter les voitures avec filtres optionnels
     */
    async count(filters = {}) {
        const { marque, modele, annee, prix_min, prix_max, carburant, boite_vitesse, statut } = filters;
        let sql = 'SELECT COUNT(*) AS total FROM voiture v';
        const conditions = [];
        const values = [];

        if (marque) {
            conditions.push('v.marque = ?');
            values.push(marque);
        }
        if (modele) {
            conditions.push('v.modele LIKE ?');
            values.push(`%${modele}%`);
        }
        if (annee) {
            conditions.push('v.annee = ?');
            values.push(annee);
        }
        if (prix_min) {
            conditions.push('v.prix >= ?');
            values.push(prix_min);
        }
        if (prix_max) {
            conditions.push('v.prix <= ?');
            values.push(prix_max);
        }
        if (carburant) {
            conditions.push('v.carburant = ?');
            values.push(carburant);
        }
        if (boite_vitesse) {
            conditions.push('v.boite_vitesse = ?');
            values.push(boite_vitesse);
        }
        if (statut) {
            conditions.push('v.statut = ?');
            values.push(statut);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        const [rows] = await db.execute(sql, values);
        return rows[0].total;
    },

    /**
     * Récupérer les marques distinctes
     */
    async getBrands() {
        const [rows] = await db.execute(
            'SELECT DISTINCT marque FROM voiture ORDER BY marque ASC'
        );
        return rows; // rows are already objects with { marque } property
    },

    /**
     * Recherche textuelle sur marque, modèle, couleur, description
     */
    async search(query) {
        const searchTerm = `%${query}%`;
        const [rows] = await db.execute(
            `SELECT v.id_voiture, v.id_agence, v.marque, v.modele, v.annee, v.prix,
                    v.kilometrage, v.carburant, v.boite_vitesse, v.couleur,
                    v.description, v.image, v.statut, v.date_ajout,
                    ag.nom_agence
             FROM voiture v
             INNER JOIN agence ag ON v.id_agence = ag.id_agence
             WHERE v.marque LIKE ? OR v.modele LIKE ? OR v.couleur LIKE ? OR v.description LIKE ?
             ORDER BY v.date_ajout DESC`,
            [searchTerm, searchTerm, searchTerm, searchTerm]
        );
        return rows;
    }
};

module.exports = Car;

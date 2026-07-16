// ============================================================
// Controller: Car (Public)
// Pages publiques de voitures (sans authentification requise)
// ============================================================
const Car = require('../models/Car');

const carController = {
    // ========================================================
    // LISTE PUBLIQUE DES VOITURES (avec filtres et pagination)
    // ========================================================
    async listPublic(req, res) {
        try {
            const filters = {
                marque: req.query.marque || '',
                modele: req.query.modele || '',
                annee: req.query.annee || '',
                prix_min: req.query.prix_min || '',
                prix_max: req.query.prix_max || '',
                carburant: req.query.carburant || '',
                boite_vitesse: req.query.boite_vitesse || '',
                statut: 'disponible',
                page: req.query.page || 1,
                limit: 12
            };

            const cars = await Car.findAll(filters);
            const totalCars = await Car.count({
                marque: filters.marque,
                modele: filters.modele,
                annee: filters.annee,
                prix_min: filters.prix_min,
                prix_max: filters.prix_max,
                carburant: filters.carburant,
                boite_vitesse: filters.boite_vitesse,
                statut: 'disponible'
            });
            const brands = await Car.getBrands();

            const currentPage = parseInt(req.query.page) || 1;
            const totalPages = Math.ceil(totalCars / 12);

            res.render('cars/list', {
                title: 'Nos Voitures - ALFA CAR',
                cars,
                brands,
                filters,
                pagination: {
                    currentPage,
                    totalPages,
                    totalCars,
                    hasNext: currentPage < totalPages,
                    hasPrev: currentPage > 1
                }
            });
        } catch (error) {
            console.error('Erreur liste publique voitures:', error);
            res.render('cars/list', {
                title: 'Nos Voitures - ALFA CAR',
                cars: [],
                brands: [],
                filters: {},
                pagination: { currentPage: 1, totalPages: 0, totalCars: 0, hasNext: false, hasPrev: false }
            });
        }
    },

    // ========================================================
    // DÉTAILS D'UNE VOITURE (page publique)
    // ========================================================
    async details(req, res) {
        try {
            const car = await Car.findById(req.params.id);
            if (!car) {
                req.flash('error', 'Voiture introuvable.');
                return res.redirect('/cars');
            }

            // Récupérer des voitures similaires (même marque, disponibles)
            const [similarCars] = await require('../config/database').query(
                `SELECT v.id_voiture, v.marque, v.modele, v.annee, v.prix, v.image, v.kilometrage, v.carburant,
                        ag.nom_agence
                 FROM voiture v
                 INNER JOIN agence ag ON v.id_agence = ag.id_agence
                 WHERE v.marque = ? AND v.id_voiture != ? AND v.statut = 'disponible'
                 ORDER BY v.date_ajout DESC
                 LIMIT 4`,
                [car.marque, car.id_voiture]
            );

            res.render('cars/details', {
                title: car.marque + ' ' + car.modele + ' ' + car.annee + ' - ALFA CAR',
                car,
                similarCars
            });
        } catch (error) {
            console.error('Erreur détails voiture publique:', error);
            req.flash('error', 'Erreur lors du chargement des détails de la voiture.');
            return res.redirect('/cars');
        }
    },

    // ========================================================
    // RECHERCHE AJAX
    // ========================================================
    async search(req, res) {
        try {
            const query = req.query.q;
            if (!query || query.trim().length === 0) {
                return res.json({ success: true, cars: [] });
            }

            const cars = await Car.search(query.trim());

            // Filtrer pour ne retourner que les voitures disponibles
            const availableCars = cars.filter(car => car.statut === 'disponible');

            return res.json({
                success: true,
                cars: availableCars,
                total: availableCars.length
            });
        } catch (error) {
            console.error('Erreur recherche voiture:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la recherche.',
                cars: []
            });
        }
    }
};

module.exports = carController;

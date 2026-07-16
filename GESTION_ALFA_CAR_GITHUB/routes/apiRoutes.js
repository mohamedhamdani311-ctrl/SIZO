const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const carController = require('../controllers/carController');
const invoiceController = require('../controllers/invoiceController');
const { isAuthenticated } = require('../middleware/auth');
const db = require('../config/database');

// ---------- Rapports ----------
router.get('/reports/:type', reportController.generate);

// ---------- Recherche de voitures ----------
router.get('/cars/search', carController.search);

// ---------- Liste des marques (valeurs distinctes) ----------
router.get('/cars/brands', async (req, res) => {
    try {
        const [brands] = await db.query(
            'SELECT DISTINCT marque FROM voiture ORDER BY marque ASC'
        );
        res.json({
            success: true,
            data: brands.map(b => b.marque)
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des marques :', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des marques'
        });
    }
});

// ---------- Génération de facture PDF ----------
router.get('/invoice/:id', invoiceController.generatePDF);

// ---------- Statistiques du tableau de bord ----------
router.get('/stats', isAuthenticated, async (req, res) => {
    try {
        const [[carsCount]] = await db.query(
            'SELECT COUNT(*) AS total FROM voiture'
        );
        const [[customersCount]] = await db.query(
            'SELECT COUNT(*) AS total FROM utilisateur WHERE role = ?',
            ['client']
        );
        const [[reservationsCount]] = await db.query(
            'SELECT COUNT(*) AS total FROM reservation'
        );
        const [[salesCount]] = await db.query(
            'SELECT COUNT(*) AS total FROM vente'
        );
        const [[revenue]] = await db.query(
            "SELECT COALESCE(SUM(montant), 0) AS total FROM paiement WHERE statut = 'confirme'"
        );
        const [[pendingReservations]] = await db.query(
            "SELECT COUNT(*) AS total FROM reservation WHERE statut = 'en_attente'"
        );
        const [[pendingSales]] = await db.query(
            "SELECT COUNT(*) AS total FROM vente WHERE statut_vente = 'en_attente'"
        );
        const [[pendingAccounts]] = await db.query(
            "SELECT COUNT(*) AS total FROM utilisateur WHERE statut_compte = 'en_attente'"
        );

        res.json({
            success: true,
            data: {
                voitures: carsCount.total,
                clients: customersCount.total,
                reservations: reservationsCount.total,
                ventes: salesCount.total,
                revenus: revenue.total,
                reservationsEnAttente: pendingReservations.total,
                ventesEnAttente: pendingSales.total,
                comptesEnAttente: pendingAccounts.total
            }
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques :', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des statistiques'
        });
    }
});

module.exports = router;

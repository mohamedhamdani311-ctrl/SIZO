const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { isAuthenticated } = require('../middleware/auth');
const { isClient } = require('../middleware/roles');
const { uploadSingle } = require('../middleware/upload');

// Toutes les routes client sont protégées
router.use(isAuthenticated, isClient);

// ---------- Tableau de bord ----------
router.get('/', clientController.dashboard);
router.get('/dashboard', clientController.dashboard);

// ---------- Catalogue des voitures ----------
router.get('/cars', clientController.listCars);
router.get('/cars/:id', clientController.carDetails);

// ---------- Réservations ----------
router.post('/reservations/create', clientController.createReservation);
router.post('/reservations/cancel/:id', clientController.cancelReservation);
router.get('/reservations', clientController.listReservations);

// ---------- Achats ----------
router.post('/purchases/create', clientController.createPurchase);
router.get('/purchases', clientController.listPurchases);

// ---------- Factures ----------
router.get('/invoices', clientController.listInvoices);
router.get('/invoices/:id', clientController.viewInvoice);

// ---------- Profil ----------
router.get('/profile', clientController.profile);
router.post('/profile', uploadSingle, clientController.updateProfile);

module.exports = router;

const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerController');
const { isAuthenticated } = require('../middleware/auth');
const { isSeller } = require('../middleware/roles');
const { uploadSingle, uploadMultiple } = require('../middleware/upload');

// Toutes les routes vendeur sont protégées
router.use(isAuthenticated, isSeller);

// ---------- Tableau de bord ----------
router.get('/', sellerController.dashboard);
router.get('/dashboard', sellerController.dashboard);

// ---------- Gestion des voitures ----------
router.get('/cars', sellerController.listCars);
router.get('/cars/add', sellerController.showCarForm);
router.post('/cars/add', uploadMultiple, sellerController.createCar);
router.get('/cars/edit/:id', sellerController.showCarForm);
router.post('/cars/edit/:id', uploadMultiple, sellerController.updateCar);
router.post('/cars/delete/:id', sellerController.deleteCar);

// ---------- Gestion des clients ----------
router.get('/customers', sellerController.listCustomers);
router.post('/customers/approve/:id', sellerController.approveAccount);
router.post('/customers/reject/:id', sellerController.rejectAccount);

// ---------- Gestion des réservations ----------
router.get('/reservations', sellerController.listReservations);
router.post('/reservations/approve/:id', sellerController.approveReservation);
router.post('/reservations/reject/:id', sellerController.rejectReservation);

// ---------- Gestion des ventes ----------
router.get('/sales', sellerController.listSales);
router.post('/sales/approve/:id', sellerController.approveSale);
router.post('/sales/reject/:id', sellerController.rejectSale);

// ---------- Gestion des paiements ----------
router.get('/payments', sellerController.listPayments);
router.post('/payments/approve/:id', sellerController.approvePayment);
router.post('/payments/reject/:id', sellerController.rejectPayment);

// ---------- Profil ----------
router.get('/profile', sellerController.profile);
router.post('/profile', uploadSingle, sellerController.updateProfile);

module.exports = router;

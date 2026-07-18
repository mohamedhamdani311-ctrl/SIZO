const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAuthenticated } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roles');
const { uploadSingle, uploadMultiple } = require('../middleware/upload');

// Toutes les routes admin sont protégées
router.use(isAuthenticated, isAdmin);

// ---------- Tableau de bord ----------
router.get('/', adminController.dashboard);
router.get('/dashboard', adminController.dashboard);

// ---------- Gestion des voitures ----------
router.get('/cars', adminController.listCars);
router.get('/cars/add', adminController.showCarForm);
router.post('/cars/add', uploadMultiple, adminController.createCar);
router.get('/cars/edit/:id', adminController.showCarForm);
router.post('/cars/edit/:id', uploadMultiple, adminController.updateCar);
router.post('/cars/delete/:id', adminController.deleteCar);

// ---------- Gestion des clients ----------
router.get('/customers', adminController.listCustomers);
router.post('/customers/approve/:id', adminController.approveAccount);
router.post('/customers/reject/:id', adminController.rejectAccount);
router.post('/customers/delete/:id', adminController.deleteCustomer);

// ---------- Gestion des vendeurs ----------
router.get('/sellers', adminController.listSellers);
router.get('/sellers/add', adminController.showSellerForm);
router.post('/sellers/add', adminController.createSeller);
router.get('/sellers/edit/:id', adminController.showSellerForm);
router.post('/sellers/edit/:id', adminController.updateSeller);
router.post('/sellers/delete/:id', adminController.deleteSeller);

// ---------- Gestion des agences ----------
router.get('/agencies', adminController.listAgencies);
router.get('/agencies/add', adminController.showAgencyForm);
router.post('/agencies/add', adminController.createAgency);
router.get('/agencies/edit/:id', adminController.showAgencyForm);
router.post('/agencies/edit/:id', adminController.updateAgency);
router.post('/agencies/delete/:id', adminController.deleteAgency);

// ---------- Gestion des réservations ----------
router.get('/reservations', adminController.listReservations);
router.post('/reservations/approve/:id', adminController.approveReservation);
router.post('/reservations/reject/:id', adminController.rejectReservation);

// ---------- Gestion des ventes ----------
router.get('/sales', adminController.listSales);
router.post('/sales/approve/:id', adminController.approveSale);
router.post('/sales/reject/:id', adminController.rejectSale);

// ---------- Gestion des paiements ----------
router.get('/payments', adminController.listPayments);
router.post('/payments/approve/:id', adminController.approvePayment);
router.post('/payments/reject/:id', adminController.rejectPayment);

// ---------- Factures ----------
router.get('/invoices', adminController.listInvoices);
router.get('/invoices/:id', adminController.viewInvoice);

// ---------- Rapports ----------
router.get('/reports', adminController.reports);

// ---------- Comptes ----------
router.get('/accounts', adminController.accounts);
router.post('/accounts/approve/:id', adminController.approveAccount);
router.post('/accounts/reject/:id', adminController.rejectAccount);

// ---------- Paramètres ----------
router.get('/settings', adminController.settings);
router.post('/settings', uploadSingle, adminController.updateSettings);

// ---------- Profil ----------
router.get('/profile', adminController.profile);
router.post('/profile', uploadSingle, adminController.updateProfile);

module.exports = router;

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isNotAuthenticated } = require('../middleware/auth');

// ---------- Pages de connexion ----------
router.get('/login', isNotAuthenticated, authController.showLogin);
router.post('/login', authController.login);

// ---------- Pages d'inscription ----------
router.get('/register', isNotAuthenticated, authController.showRegister);
router.post('/register', authController.register);

// ---------- Mot de passe oublié ----------
router.get('/forgot-password', authController.showForgotPassword);
router.post('/forgot-password', authController.forgotPassword);

// ---------- Réinitialisation du mot de passe ----------
router.get('/reset-password/:id', authController.showResetPassword);
router.post('/reset-password/:id', authController.resetPassword);

// ---------- Déconnexion ----------
router.get('/logout', authController.logout);

module.exports = router;

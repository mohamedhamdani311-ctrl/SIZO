const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');

// ---------- Routes publiques des voitures ----------

// Liste publique des voitures
router.get('/', carController.listPublic);

// Recherche de voitures (retourne du JSON)
router.get('/search', carController.search);

// Détails d'une voiture
router.get('/:id', carController.details);

module.exports = router;

// ============================================================
// Middleware de Validation des Entrées
// GESTION ALFA CAR - express-validator
// ============================================================

const { body, validationResult } = require('express-validator');

// ============================================================
// Validation: Connexion
// ============================================================
const validateLogin = [
    body('username')
        .trim()
        .notEmpty()
        .withMessage('Le nom d\'utilisateur est requis.')
        .isLength({ max: 100 })
        .withMessage('Le nom d\'utilisateur ne doit pas dépasser 100 caractères.'),

    body('password')
        .notEmpty()
        .withMessage('Le mot de passe est requis.')
        .isLength({ min: 6 })
        .withMessage('Le mot de passe doit contenir au moins 6 caractères.')
];

// ============================================================
// Validation: Inscription
// ============================================================
const validateRegister = [
    body('username')
        .trim()
        .notEmpty()
        .withMessage('Le nom d\'utilisateur est requis.')
        .isLength({ min: 3, max: 100 })
        .withMessage('Le nom d\'utilisateur doit contenir entre 3 et 100 caractères.')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Le nom d\'utilisateur ne peut contenir que des lettres, chiffres et underscores.'),

    body('password')
        .notEmpty()
        .withMessage('Le mot de passe est requis.')
        .isLength({ min: 6 })
        .withMessage('Le mot de passe doit contenir au moins 6 caractères.'),

    body('confirm_password')
        .notEmpty()
        .withMessage('La confirmation du mot de passe est requise.')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Les mots de passe ne correspondent pas.');
            }
            return true;
        }),

    body('nom')
        .trim()
        .notEmpty()
        .withMessage('Le nom est requis.')
        .isLength({ min: 2, max: 100 })
        .withMessage('Le nom doit contenir entre 2 et 100 caractères.'),

    body('prenom')
        .trim()
        .notEmpty()
        .withMessage('Le prénom est requis.')
        .isLength({ min: 2, max: 100 })
        .withMessage('Le prénom doit contenir entre 2 et 100 caractères.'),

    body('telephone')
        .trim()
        .notEmpty()
        .withMessage('Le numéro de téléphone est requis.')
        .isLength({ max: 20 })
        .withMessage('Le numéro de téléphone ne doit pas dépasser 20 caractères.'),

    body('email')
        .trim()
        .notEmpty()
        .withMessage('L\'adresse email est requise.')
        .isEmail()
        .withMessage('Veuillez fournir une adresse email valide.')
        .normalizeEmail()
        .isLength({ max: 100 })
        .withMessage('L\'email ne doit pas dépasser 100 caractères.'),

    body('adresse')
        .trim()
        .notEmpty()
        .withMessage('L\'adresse est requise.')
        .isLength({ max: 255 })
        .withMessage('L\'adresse ne doit pas dépasser 255 caractères.')
];

// ============================================================
// Validation: Voiture
// ============================================================
const validateCar = [
    body('marque')
        .trim()
        .notEmpty()
        .withMessage('La marque est requise.')
        .isLength({ max: 100 })
        .withMessage('La marque ne doit pas dépasser 100 caractères.'),

    body('modele')
        .trim()
        .notEmpty()
        .withMessage('Le modèle est requis.')
        .isLength({ max: 100 })
        .withMessage('Le modèle ne doit pas dépasser 100 caractères.'),

    body('annee')
        .notEmpty()
        .withMessage('L\'année est requise.')
        .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
        .withMessage(`L'année doit être comprise entre 1900 et ${new Date().getFullYear() + 1}.`),

    body('prix')
        .notEmpty()
        .withMessage('Le prix est requis.')
        .isFloat({ min: 0 })
        .withMessage('Le prix doit être un nombre positif.'),

    body('carburant')
        .trim()
        .notEmpty()
        .withMessage('Le type de carburant est requis.')
        .isLength({ max: 50 })
        .withMessage('Le type de carburant ne doit pas dépasser 50 caractères.'),

    body('boite_vitesse')
        .trim()
        .notEmpty()
        .withMessage('Le type de boîte de vitesse est requis.')
        .isLength({ max: 50 })
        .withMessage('Le type de boîte de vitesse ne doit pas dépasser 50 caractères.'),

    body('id_agence')
        .notEmpty()
        .withMessage('L\'agence est requise.')
        .isInt({ min: 1 })
        .withMessage('Veuillez sélectionner une agence valide.'),

    body('kilometrage')
        .optional({ checkFalsy: true })
        .isInt({ min: 0 })
        .withMessage('Le kilométrage doit être un nombre positif.'),

    body('couleur')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 50 })
        .withMessage('La couleur ne doit pas dépasser 50 caractères.'),

    body('description')
        .optional({ checkFalsy: true })
        .trim()
];

// ============================================================
// Validation: Réservation
// ============================================================
const validateReservation = [
    body('id_voiture')
        .notEmpty()
        .withMessage('La voiture est requise.')
        .isInt({ min: 1 })
        .withMessage('Veuillez sélectionner une voiture valide.'),

    body('id_vendeur')
        .notEmpty()
        .withMessage('Le vendeur est requis.')
        .isInt({ min: 1 })
        .withMessage('Veuillez sélectionner un vendeur valide.'),

    body('date_expiration')
        .optional({ checkFalsy: true })
        .isDate()
        .withMessage('La date d\'expiration doit être une date valide.'),

    body('note')
        .optional({ checkFalsy: true })
        .trim()
];

// ============================================================
// Validation: Vente
// ============================================================
const validateSale = [
    body('id_client')
        .notEmpty()
        .withMessage('Le client est requis.')
        .isInt({ min: 1 })
        .withMessage('Veuillez sélectionner un client valide.'),

    body('id_voiture')
        .notEmpty()
        .withMessage('La voiture est requise.')
        .isInt({ min: 1 })
        .withMessage('Veuillez sélectionner une voiture valide.'),

    body('id_vendeur')
        .notEmpty()
        .withMessage('Le vendeur est requis.')
        .isInt({ min: 1 })
        .withMessage('Veuillez sélectionner un vendeur valide.'),

    body('id_agence')
        .notEmpty()
        .withMessage('L\'agence est requise.')
        .isInt({ min: 1 })
        .withMessage('Veuillez sélectionner une agence valide.'),

    body('montant_total')
        .notEmpty()
        .withMessage('Le montant total est requis.')
        .isFloat({ min: 0 })
        .withMessage('Le montant total doit être un nombre positif.'),

    body('type_paiement')
        .notEmpty()
        .withMessage('Le type de paiement est requis.')
        .isIn(['cash', 'credit'])
        .withMessage('Le type de paiement doit être "cash" ou "credit".'),

    body('id_reservation')
        .optional({ checkFalsy: true })
        .isInt({ min: 1 })
        .withMessage('La réservation sélectionnée est invalide.'),

    body('notes')
        .optional({ checkFalsy: true })
        .trim()
];

// ============================================================
// Validation: Paiement
// ============================================================
const validatePayment = [
    body('id_vente')
        .notEmpty()
        .withMessage('La vente est requise.')
        .isInt({ min: 1 })
        .withMessage('Veuillez sélectionner une vente valide.'),

    body('montant')
        .notEmpty()
        .withMessage('Le montant est requis.')
        .isFloat({ min: 0 })
        .withMessage('Le montant doit être un nombre positif.'),

    body('type_paiement')
        .notEmpty()
        .withMessage('Le type de paiement est requis.')
        .isIn(['cash', 'credit'])
        .withMessage('Le type de paiement doit être "cash" ou "credit".'),

    body('montant_avance')
        .optional({ checkFalsy: true })
        .isFloat({ min: 0 })
        .withMessage('Le montant de l\'avance doit être un nombre positif.'),

    body('nombre_mensualites')
        .optional({ checkFalsy: true })
        .isInt({ min: 1 })
        .withMessage('Le nombre de mensualités doit être un entier positif.'),

    body('mensualite')
        .optional({ checkFalsy: true })
        .isFloat({ min: 0 })
        .withMessage('La mensualité doit être un nombre positif.'),

    body('taux_interet')
        .optional({ checkFalsy: true })
        .isFloat({ min: 0, max: 100 })
        .withMessage('Le taux d\'intérêt doit être compris entre 0 et 100.'),

    body('date_debut_remboursement')
        .optional({ checkFalsy: true })
        .isDate()
        .withMessage('La date de début de remboursement doit être une date valide.')
];

// ============================================================
// Gestionnaire d'erreurs de validation
// ============================================================
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => err.msg);

        // Si la requête attend du JSON (API)
        if (req.xhr || req.headers.accept === 'application/json' || req.path.startsWith('/api')) {
            return res.status(400).json({
                success: false,
                message: 'Erreurs de validation.',
                errors: errorMessages
            });
        }

        // Pour les requêtes normales (formulaires)
        req.flash('error', errorMessages.join(' | '));
        return res.redirect('back');
    }
    next();
};

module.exports = {
    validateLogin,
    validateRegister,
    validateCar,
    validateReservation,
    validateSale,
    validatePayment,
    handleValidationErrors
};

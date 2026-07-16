// ============================================================
// Middleware d'Autorisation par Rôle
// GESTION ALFA CAR
// ============================================================

/**
 * Vérifie si l'utilisateur connecté est un administrateur.
 * Retourne 403 si le rôle n'est pas 'admin'.
 */
const isAdmin = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    req.flash('error', 'Accès refusé. Vous devez être administrateur pour accéder à cette page.');
    return res.status(403).render('errors/403', {
        title: 'Accès Refusé'
    });
};

/**
 * Vérifie si l'utilisateur connecté est un vendeur.
 * Retourne 403 si le rôle n'est pas 'vendeur'.
 */
const isSeller = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === 'vendeur') {
        return next();
    }
    req.flash('error', 'Accès refusé. Vous devez être vendeur pour accéder à cette page.');
    return res.status(403).render('errors/403', {
        title: 'Accès Refusé'
    });
};

/**
 * Vérifie si l'utilisateur connecté est un client.
 * Retourne 403 si le rôle n'est pas 'client'.
 */
const isClient = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === 'client') {
        return next();
    }
    req.flash('error', 'Accès refusé. Vous devez être client pour accéder à cette page.');
    return res.status(403).render('errors/403', {
        title: 'Accès Refusé'
    });
};

/**
 * Vérifie si l'utilisateur connecté est administrateur OU vendeur.
 * Retourne 403 si le rôle n'est ni 'admin' ni 'vendeur'.
 */
const isAdminOrSeller = (req, res, next) => {
    if (
        req.session &&
        req.session.user &&
        (req.session.user.role === 'admin' || req.session.user.role === 'vendeur')
    ) {
        return next();
    }
    req.flash('error', 'Accès refusé. Vous devez être administrateur ou vendeur pour accéder à cette page.');
    return res.status(403).render('errors/403', {
        title: 'Accès Refusé'
    });
};

module.exports = {
    isAdmin,
    isSeller,
    isClient,
    isAdminOrSeller
};

// ============================================================
// Middleware d'Authentification
// GESTION ALFA CAR
// ============================================================

/**
 * Vérifie si l'utilisateur est authentifié.
 * Redirige vers la page de connexion si non connecté.
 */
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    req.flash('error', 'Veuillez vous connecter pour accéder à cette page.');
    return res.redirect('/auth/login');
};

/**
 * Vérifie si l'utilisateur n'est PAS authentifié.
 * Utilisé pour les pages login/register — redirige vers le dashboard si déjà connecté.
 */
const isNotAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        const role = req.session.user.role;
        if (role === 'admin') {
            return res.redirect('/admin/dashboard');
        } else if (role === 'vendeur') {
            return res.redirect('/seller/dashboard');
        } else if (role === 'client') {
            return res.redirect('/client/dashboard');
        }
        return res.redirect('/');
    }
    return next();
};

/**
 * Vérifie le cookie "remember me" pour auto-connexion.
 * Si un cookie valide existe et qu'aucune session n'est active,
 * restaure la session utilisateur depuis la base de données.
 */
const rememberMe = async (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }

    const rememberToken = req.cookies ? req.cookies.remember_token : null;

    if (!rememberToken) {
        return next();
    }

    try {
        const db = require('../config/database');
        const [rows] = await db.execute(
            'SELECT id_utilisateur, username, role, statut_compte FROM utilisateur WHERE id_utilisateur = ? AND statut_compte = ?',
            [rememberToken, 'actif']
        );

        if (rows.length > 0) {
            const user = rows[0];

            let profileData = null;

            if (user.role === 'admin') {
                const [adminRows] = await db.execute(
                    'SELECT id_admin, nom, prenom, niveau_acces FROM administrateur WHERE id_utilisateur = ?',
                    [user.id_utilisateur]
                );
                if (adminRows.length > 0) {
                    profileData = adminRows[0];
                }
            } else if (user.role === 'vendeur') {
                const [sellerRows] = await db.execute(
                    'SELECT id_vendeur, nom, prenom, telephone, email, id_agence FROM vendeur WHERE id_utilisateur = ?',
                    [user.id_utilisateur]
                );
                if (sellerRows.length > 0) {
                    profileData = sellerRows[0];
                }
            } else if (user.role === 'client') {
                const [clientRows] = await db.execute(
                    'SELECT id_client, nom, prenom, telephone, email, adresse FROM client WHERE id_utilisateur = ?',
                    [user.id_utilisateur]
                );
                if (clientRows.length > 0) {
                    profileData = clientRows[0];
                }
            }

            req.session.user = {
                id_utilisateur: user.id_utilisateur,
                username: user.username,
                role: user.role,
                statut_compte: user.statut_compte,
                profile: profileData
            };
            req.session.lastActivity = Date.now();
        } else {
            // Cookie invalide, on le supprime
            res.clearCookie('remember_token');
        }
    } catch (error) {
        console.error('Erreur middleware rememberMe:', error.message);
        res.clearCookie('remember_token');
    }

    return next();
};

module.exports = {
    isAuthenticated,
    isNotAuthenticated,
    rememberMe
};

// ============================================================
// Controller: Authentication
// ============================================================
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Seller = require('../models/Seller');
const Client = require('../models/Client');

const authController = {
    // --------------------------------------------------------
    // Afficher la page de connexion
    // --------------------------------------------------------
    showLogin(req, res) {
        res.render('auth/login', {
            title: 'Connexion - ALFA CAR'
        });
    },

    // --------------------------------------------------------
    // Traiter la connexion
    // --------------------------------------------------------
    async login(req, res) {
        try {
            const { username, password, remember_me } = req.body;

            // Vérifier si l'utilisateur existe
            const user = await User.findByUsername(username);
            if (!user) {
                req.flash('error', 'Nom d\'utilisateur ou mot de passe incorrect.');
                return res.redirect('/auth/login');
            }

            // Vérifier le mot de passe
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                req.flash('error', 'Nom d\'utilisateur ou mot de passe incorrect.');
                return res.redirect('/auth/login');
            }

            // Vérifier le statut du compte
            if (user.statut_compte !== 'actif') {
                if (user.statut_compte === 'en_attente') {
                    req.flash('error', 'Votre compte est en attente d\'approbation par l\'administrateur.');
                } else if (user.statut_compte === 'refuse') {
                    req.flash('error', 'Votre compte a été refusé. Veuillez contacter l\'administrateur.');
                }
                return res.redirect('/auth/login');
            }

            // Récupérer les informations de profil selon le rôle
            let profileData = {};
            if (user.role === 'admin') {
                const admin = await Admin.findByUserId(user.id_utilisateur);
                if (admin) {
                    profileData = { id_admin: admin.id_admin, nom: admin.nom, prenom: admin.prenom, niveau_acces: admin.niveau_acces };
                }
            } else if (user.role === 'vendeur') {
                const seller = await Seller.findByUserId(user.id_utilisateur);
                if (seller) {
                    profileData = { id_vendeur: seller.id_vendeur, id_agence: seller.id_agence, nom: seller.nom, prenom: seller.prenom, telephone: seller.telephone, email: seller.email, nom_agence: seller.nom_agence };
                }
            } else if (user.role === 'client') {
                const client = await Client.findByUserId(user.id_utilisateur);
                if (client) {
                    profileData = { id_client: client.id_client, nom: client.nom, prenom: client.prenom, telephone: client.telephone, email: client.email, adresse: client.adresse };
                }
            }

            // Créer la session
            req.session.user = {
                id: user.id_utilisateur,
                username: user.username,
                role: user.role,
                statut_compte: user.statut_compte,
                ...profileData
            };
            req.session.lastActivity = Date.now();

            // Gérer "Se souvenir de moi"
            if (remember_me) {
                req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 jours
            }

            // Rediriger selon le rôle
            req.flash('success', `Bienvenue, ${profileData.prenom || user.username} !`);
            if (user.role === 'admin') return res.redirect('/admin');
            if (user.role === 'vendeur') return res.redirect('/seller');
            if (user.role === 'client') return res.redirect('/client');
            return res.redirect('/');
        } catch (error) {
            console.error('Erreur de connexion:', error);
            req.flash('error', 'Une erreur est survenue lors de la connexion.');
            return res.redirect('/auth/login');
        }
    },

    // --------------------------------------------------------
    // Afficher la page d'inscription
    // --------------------------------------------------------
    showRegister(req, res) {
        res.render('auth/register', {
            title: 'Inscription - ALFA CAR'
        });
    },

    // --------------------------------------------------------
    // Traiter l'inscription
    // --------------------------------------------------------
    async register(req, res) {
        try {
            const { username, password, nom, prenom, telephone, email, adresse } = req.body;

            // Vérifier si le nom d'utilisateur existe déjà
            const existingUser = await User.findByUsername(username);
            if (existingUser) {
                req.flash('error', 'Ce nom d\'utilisateur est déjà utilisé.');
                return res.redirect('/auth/register');
            }

            // Hasher le mot de passe
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Créer l'utilisateur avec le rôle client et statut en_attente
            const userId = await User.create({
                username,
                password: hashedPassword,
                role: 'client',
                statut_compte: 'en_attente'
            });

            // Créer le profil client
            await Client.create({
                id_utilisateur: userId,
                nom,
                prenom,
                telephone: telephone || null,
                email: email || null,
                adresse: adresse || null
            });

            req.flash('success', 'Votre compte a été créé avec succès. Il est en attente d\'approbation par l\'administrateur. Vous recevrez une notification une fois votre compte activé.');
            return res.redirect('/auth/login');
        } catch (error) {
            console.error('Erreur d\'inscription:', error);
            req.flash('error', 'Une erreur est survenue lors de l\'inscription.');
            return res.redirect('/auth/register');
        }
    },

    // --------------------------------------------------------
    // Afficher la page de mot de passe oublié
    // --------------------------------------------------------
    showForgotPassword(req, res) {
        res.render('auth/forgot-password', {
            title: 'Mot de passe oublié - ALFA CAR'
        });
    },

    // --------------------------------------------------------
    // Traiter la demande de mot de passe oublié
    // --------------------------------------------------------
    async forgotPassword(req, res) {
        try {
            const { username } = req.body;

            const user = await User.findByUsername(username);
            if (!user) {
                req.flash('error', 'Aucun compte trouvé avec ce nom d\'utilisateur.');
                return res.redirect('/auth/forgot-password');
            }

            // Rediriger vers le formulaire de réinitialisation
            req.flash('success', 'Compte trouvé. Veuillez définir votre nouveau mot de passe.');
            return res.redirect('/auth/reset-password/' + user.id_utilisateur);
        } catch (error) {
            console.error('Erreur mot de passe oublié:', error);
            req.flash('error', 'Une erreur est survenue.');
            return res.redirect('/auth/forgot-password');
        }
    },

    // --------------------------------------------------------
    // Afficher la page de réinitialisation
    // --------------------------------------------------------
    async showResetPassword(req, res) {
        try {
            const userId = req.params.id;
            const user = await User.findById(userId);
            if (!user) {
                req.flash('error', 'Utilisateur introuvable.');
                return res.redirect('/auth/forgot-password');
            }
            res.render('auth/reset-password', {
                title: 'Réinitialiser le mot de passe - ALFA CAR',
                userId: user.id_utilisateur,
                username: user.username
            });
        } catch (error) {
            console.error('Erreur affichage réinitialisation:', error);
            req.flash('error', 'Une erreur est survenue.');
            return res.redirect('/auth/forgot-password');
        }
    },

    // --------------------------------------------------------
    // Traiter la réinitialisation du mot de passe
    // --------------------------------------------------------
    async resetPassword(req, res) {
        try {
            const userId = req.params.id;
            const { old_password, new_password } = req.body;

            const user = await User.findById(userId);
            if (!user) {
                req.flash('error', 'Utilisateur introuvable.');
                return res.redirect('/auth/forgot-password');
            }

            // Si un ancien mot de passe est fourni, le vérifier
            if (old_password) {
                const isMatch = await bcrypt.compare(old_password, user.password);
                if (!isMatch) {
                    req.flash('error', 'L\'ancien mot de passe est incorrect.');
                    return res.redirect('/auth/reset-password/' + userId);
                }
            }

            // Hasher le nouveau mot de passe
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(new_password, salt);

            await User.updatePassword(userId, hashedPassword);

            req.flash('success', 'Votre mot de passe a été réinitialisé avec succès.');
            return res.redirect('/auth/login');
        } catch (error) {
            console.error('Erreur réinitialisation:', error);
            req.flash('error', 'Une erreur est survenue lors de la réinitialisation.');
            return res.redirect('/auth/forgot-password');
        }
    },

    // --------------------------------------------------------
    // Déconnexion
    // --------------------------------------------------------
    logout(req, res) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Erreur de déconnexion:', err);
            }
            res.clearCookie('connect.sid');
            return res.redirect('/');
        });
    }
};

module.exports = authController;

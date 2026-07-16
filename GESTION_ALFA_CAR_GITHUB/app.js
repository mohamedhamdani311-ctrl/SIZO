require('dotenv').config();
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// Security Middleware
// ============================================================
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));
app.use(cors());

// ============================================================
// Body Parsers
// ============================================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================================
// Static Files
// ============================================================
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// ============================================================
// View Engine
// ============================================================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ============================================================
// Session Configuration
// ============================================================
app.use(session({
    secret: process.env.SESSION_SECRET || 'AlfaCarSecretKey2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: parseInt(process.env.SESSION_TIMEOUT) || 3600000,
        sameSite: 'lax'
    }
}));

// ============================================================
// Flash Messages
// ============================================================
app.use(flash());

// ============================================================
// Global Variables Middleware
// ============================================================
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success');
    res.locals.error_msg = req.flash('error');
    res.locals.warning_msg = req.flash('warning');
    res.locals.user = req.session.user || null;
    res.locals.currentPath = req.path;
    next();
});

// ============================================================
// XSS Protection Middleware
// ============================================================
const xss = require('xss');
app.use((req, res, next) => {
    if (req.body) {
        for (let key in req.body) {
            if (typeof req.body[key] === 'string') {
                req.body[key] = xss(req.body[key]);
            }
        }
    }
    next();
});

// ============================================================
// Session Timeout Check
// ============================================================
app.use((req, res, next) => {
    if (req.session.user && req.session.lastActivity) {
        const now = Date.now();
        const timeout = parseInt(process.env.SESSION_TIMEOUT) || 3600000;
        if (now - req.session.lastActivity > timeout) {
            req.session.destroy((err) => {
                return res.redirect('/auth/login?expired=true');
            });
            return;
        }
    }
    if (req.session.user) {
        req.session.lastActivity = Date.now();
    }
    next();
});

// ============================================================
// Routes
// ============================================================
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const clientRoutes = require('./routes/clientRoutes');
const carRoutes = require('./routes/carRoutes');
const apiRoutes = require('./routes/apiRoutes');

// Public Home Page
app.get('/', async (req, res) => {
    try {
        const db = require('./config/database');
        const [featuredCars] = await db.query(
            "SELECT * FROM voiture WHERE statut = 'disponible' ORDER BY date_ajout DESC LIMIT 6"
        );
        const [latestCars] = await db.query(
            "SELECT * FROM voiture WHERE statut = 'disponible' ORDER BY date_ajout DESC LIMIT 8"
        );
        const [brands] = await db.query(
            "SELECT DISTINCT marque, COUNT(*) as count FROM voiture WHERE statut = 'disponible' GROUP BY marque ORDER BY count DESC"
        );
        const [totalCars] = await db.query("SELECT COUNT(*) as total FROM voiture WHERE statut = 'disponible'");
        const [totalSales] = await db.query("SELECT COUNT(*) as total FROM vente WHERE statut_vente = 'validee'");
        const [totalClients] = await db.query("SELECT COUNT(*) as total FROM client");

        res.render('home', {
            title: 'ALFA CAR - Vente de Voitures Premium',
            featuredCars,
            latestCars,
            brands,
            stats: {
                totalCars: totalCars[0].total,
                totalSales: totalSales[0].total,
                totalClients: totalClients[0].total
            }
        });
    } catch (error) {
        console.error('Home page error:', error);
        res.render('home', {
            title: 'ALFA CAR - Vente de Voitures Premium',
            featuredCars: [],
            latestCars: [],
            brands: [],
            stats: { totalCars: 0, totalSales: 0, totalClients: 0 }
        });
    }
});

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/seller', sellerRoutes);
app.use('/client', clientRoutes);
app.use('/cars', carRoutes);
app.use('/api', apiRoutes);

// ============================================================
// Error Pages
// ============================================================
app.use((req, res) => {
    res.status(404).render('errors/404', { title: 'Page Non Trouvée' });
});

app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    if (err.status === 403) {
        return res.status(403).render('errors/403', { title: 'Accès Refusé' });
    }
    res.status(500).render('errors/500', { title: 'Erreur Serveur' });
});

// ============================================================
// Start Server
// ============================================================
app.listen(PORT, () => {
    console.log(`
    ╔═══════════════════════════════════════════════╗
    ║                                               ║
    ║       🚗  GESTION ALFA CAR  🚗               ║
    ║                                               ║
    ║   Server running on http://localhost:${PORT}     ║
    ║                                               ║
    ╚═══════════════════════════════════════════════╝
    `);
});

module.exports = app;

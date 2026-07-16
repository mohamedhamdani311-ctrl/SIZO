# 🚗 GESTION ALFA CAR

> **Système de Gestion de Vente de Voitures** — Projet de Fin d'Études (PFE)

Application web complète de gestion de vente de voitures avec système multi-agences, gestion des paiements Cash/Crédit, et tableaux de bord dynamiques.

---

## 🛠️ Technologies Utilisées

| Couche | Technologies |
|--------|-------------|
| **Frontend** | HTML5, CSS3, JavaScript, Bootstrap 5, Three.js, GSAP, AOS, Swiper.js, Chart.js, DataTables, SweetAlert2 |
| **Backend** | Node.js, Express.js, EJS |
| **Base de données** | MySQL (XAMPP) |
| **Architecture** | MVC (Model-View-Controller) |

---

## 📋 Prérequis

- **Node.js** v18 ou supérieur — [Télécharger](https://nodejs.org/)
- **XAMPP** avec MySQL — [Télécharger](https://www.apachefriends.org/)

---

## 🚀 Installation

### 1. Cloner/Copier le projet

```
C:\xampp_new\htdocs\GESTION ALFA CAR
```

### 2. Installer les dépendances

```bash
cd "C:\xampp_new\htdocs\GESTION ALFA CAR"
npm install
```

### 3. Configurer la base de données

1. Démarrer **XAMPP** (Apache + MySQL)
2. Ouvrir **phpMyAdmin** : http://localhost/phpmyadmin
3. Importer le fichier SQL :
   - Cliquer sur **Importer**
   - Sélectionner `database/sql/gestion_alfa_car.sql`
   - Cliquer sur **Exécuter**

### 4. Configuration (`.env`)

Le fichier `.env` est déjà configuré :

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=GESTION_ALFA_CAR
DB_USER=root
DB_PASSWORD=
SESSION_SECRET=AlfaCar2024SecureSessionKey
```

### 5. Démarrer le serveur

```bash
# Mode développement (avec rechargement automatique)
npm run dev

# Mode production
npm start
```

### 6. Ouvrir l'application

```
http://localhost:3000
```

---

## 🔐 Comptes de Test

| Rôle | Nom d'utilisateur | Mot de passe |
|------|-------------------|--------------|
| **Administrateur** | `admin` | `Admin@123` |
| **Vendeur** | `vendeur1` | `Admin@123` |
| **Vendeur** | `vendeur2` | `Admin@123` |
| **Client** (actif) | `client1` | `Admin@123` |
| **Client** (actif) | `client2` | `Admin@123` |
| **Client** (en attente) | `client3` | `Admin@123` |

---

## 📁 Structure du Projet

```
GESTION ALFA CAR/
├── app.js                          # Point d'entrée Express
├── package.json                    # Dépendances npm
├── .env                            # Variables d'environnement
├── README.md                       # Documentation
│
├── config/
│   └── database.js                 # Connexion MySQL (pool)
│
├── controllers/
│   ├── authController.js           # Authentification
│   ├── adminController.js          # Tableau de bord Admin
│   ├── sellerController.js         # Tableau de bord Vendeur
│   ├── clientController.js         # Espace Client
│   ├── carController.js            # Voitures (public)
│   ├── reportController.js         # Rapports dynamiques
│   └── invoiceController.js        # Factures
│
├── middleware/
│   ├── auth.js                     # Authentification
│   ├── roles.js                    # Autorisation par rôle
│   ├── upload.js                   # Upload de fichiers (Multer)
│   └── validation.js               # Validation des formulaires
│
├── models/
│   ├── User.js                     # Utilisateur
│   ├── Admin.js                    # Administrateur
│   ├── Seller.js                   # Vendeur
│   ├── Client.js                   # Client
│   ├── Agency.js                   # Agence
│   ├── Car.js                      # Voiture
│   ├── Reservation.js              # Réservation
│   ├── Sale.js                     # Vente
│   ├── Payment.js                  # Paiement
│   └── Invoice.js                  # Facture
│
├── routes/
│   ├── authRoutes.js               # Routes authentification
│   ├── adminRoutes.js              # Routes admin
│   ├── sellerRoutes.js             # Routes vendeur
│   ├── clientRoutes.js             # Routes client
│   ├── carRoutes.js                # Routes voitures (public)
│   └── apiRoutes.js                # API AJAX
│
├── views/
│   ├── home.ejs                    # Page d'accueil
│   ├── partials/                   # Composants réutilisables
│   │   ├── head.ejs
│   │   ├── navbar.ejs
│   │   ├── footer.ejs
│   │   ├── sidebar.ejs
│   │   ├── breadcrumb.ejs
│   │   ├── flash.ejs
│   │   └── scripts.ejs
│   ├── auth/                       # Pages d'authentification
│   │   ├── login.ejs
│   │   ├── register.ejs
│   │   ├── forgot-password.ejs
│   │   └── reset-password.ejs
│   ├── admin/                      # Pages administrateur
│   ├── seller/                     # Pages vendeur
│   ├── client/                     # Pages client
│   ├── cars/                       # Pages voitures (public)
│   └── errors/                     # Pages d'erreur
│
├── public/
│   ├── css/
│   │   ├── style.css               # Styles globaux
│   │   ├── home.css                # Styles page d'accueil
│   │   ├── dashboard.css           # Styles tableau de bord
│   │   ├── auth.css                # Styles authentification
│   │   └── print.css               # Styles impression A4
│   ├── js/
│   │   ├── main.js                 # JavaScript global
│   │   ├── home.js                 # Three.js, GSAP, Swiper
│   │   ├── dashboard.js            # Chart.js, DataTables
│   │   ├── cars.js                 # Recherche, filtres
│   │   ├── print.js                # Impression
│   │   └── export.js               # Export PDF/Excel
│   ├── images/
│   └── uploads/
│
└── database/
    └── sql/
        └── gestion_alfa_car.sql    # Schéma + données de test
```

---

## ⭐ Fonctionnalités

### 🔐 Authentification & Sécurité
- Connexion / Inscription / Déconnexion
- Mot de passe oublié / Réinitialisation
- Hachage des mots de passe (bcrypt)
- Sessions sécurisées
- Validation côté client et serveur
- Protection contre SQL Injection et XSS
- Middleware d'authentification et d'autorisation
- Timeout de session
- Option "Se souvenir de moi"

### 👥 Gestion des Comptes
- Approbation des comptes clients par Admin/Vendeur
- 3 rôles : Administrateur, Vendeur, Client
- Profils avec photo de profil

### 🚗 Gestion des Voitures
- CRUD complet (Ajouter, Modifier, Supprimer)
- Upload d'images multiples
- Recherche avancée (marque, modèle, année, prix, carburant, boîte)
- Filtres et pagination
- Statut (Disponible / Vendue)

### 📅 Réservations
- Réservation par le client
- Approbation/Rejet par Admin/Vendeur
- Date d'expiration
- Statut (En attente, Confirmée, Annulée)

### 💰 Ventes & Paiements
- Achat en Cash ou Crédit
- Calcul des mensualités pour le crédit
- Approbation des ventes et paiements
- Génération automatique de factures

### 📄 Factures
- Numéro unique automatique
- Impression professionnelle (format A4)
- Export PDF

### 📊 Tableau de Bord
- Statistiques en temps réel
- Graphiques avec Chart.js
- Activité récente

### 📋 Rapports
- Rapports dynamiques (sans tables supplémentaires)
- Filtrage : Quotidien, Mensuel, Annuel
- Types : Voitures, Clients, Vendeurs, Ventes, Réservations, Paiements, Factures

### 🖨️ Impression & Export
- Impression simple et multiple (checkboxes)
- Export PDF (jsPDF)
- Export Excel (SheetJS)
- Mise en page A4 professionnelle

### 🎨 Design Premium
- Three.js pour modèle 3D
- GSAP pour animations premium
- AOS pour animations au scroll
- Swiper.js pour sliders
- Mode Sombre / Clair
- Glassmorphism
- Design responsive

---

## 🗄️ Base de Données

10 tables MySQL (schéma complet dans `database/sql/gestion_alfa_car.sql`) :

1. `utilisateur` — Comptes utilisateurs
2. `administrateur` — Profils administrateurs
3. `vendeur` — Profils vendeurs
4. `client` — Profils clients
5. `agence` — Agences
6. `voiture` — Voitures
7. `reservation` — Réservations
8. `vente` — Ventes
9. `paiement` — Paiements
10. `facture` — Factures

---

## 📝 Licence

Projet de Fin d'Études (PFE) — Tous droits réservés.

---

**ALFA CAR** — *Votre partenaire automobile de confiance* 🚗

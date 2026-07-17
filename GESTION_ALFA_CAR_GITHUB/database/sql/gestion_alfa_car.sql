-- ============================================================
-- GESTION ALFA CAR - Base de Données
-- Système de Gestion de Vente de Voitures (Cash / Crédit)
-- Multi-Agences
-- ============================================================

CREATE DATABASE IF NOT EXISTS GESTION_ALFA_CAR
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE GESTION_ALFA_CAR;

-- ============================================================
-- Table: utilisateur
-- ============================================================
CREATE TABLE IF NOT EXISTS utilisateur (
    id_utilisateur INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'vendeur', 'client') NOT NULL,
    statut_compte ENUM('en_attente', 'actif', 'refuse') NOT NULL DEFAULT 'en_attente',
    date_creation DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: administrateur
-- ============================================================
CREATE TABLE IF NOT EXISTS administrateur (
    id_admin INT AUTO_INCREMENT PRIMARY KEY,
    id_utilisateur INT NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    niveau_acces ENUM('super', 'normal') NOT NULL DEFAULT 'normal',
    FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: agence
-- ============================================================
CREATE TABLE IF NOT EXISTS agence (
    id_agence INT AUTO_INCREMENT PRIMARY KEY,
    nom_agence VARCHAR(150) NOT NULL,
    adresse VARCHAR(255) NOT NULL,
    telephone VARCHAR(20),
    email VARCHAR(100),
    date_creation DATE NOT NULL DEFAULT (CURRENT_DATE)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: vendeur
-- ============================================================
CREATE TABLE IF NOT EXISTS vendeur (
    id_vendeur INT AUTO_INCREMENT PRIMARY KEY,
    id_utilisateur INT NOT NULL,
    id_agence INT NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    telephone VARCHAR(20),
    email VARCHAR(100),
    date_embauche DATE NOT NULL DEFAULT (CURRENT_DATE),
    FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_agence) REFERENCES agence(id_agence) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: client
-- ============================================================
CREATE TABLE IF NOT EXISTS client (
    id_client INT AUTO_INCREMENT PRIMARY KEY,
    id_utilisateur INT NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    telephone VARCHAR(20),
    email VARCHAR(100),
    adresse VARCHAR(255),
    date_inscription DATE NOT NULL DEFAULT (CURRENT_DATE),
    FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: voiture
-- ============================================================
CREATE TABLE IF NOT EXISTS voiture (
    id_voiture INT AUTO_INCREMENT PRIMARY KEY,
    id_agence INT NOT NULL,
    marque VARCHAR(100) NOT NULL,
    modele VARCHAR(100) NOT NULL,
    annee YEAR NOT NULL,
    prix DECIMAL(12,2) NOT NULL,
    kilometrage INT DEFAULT 0,
    carburant VARCHAR(50) NOT NULL,
    boite_vitesse VARCHAR(50) NOT NULL,
    couleur VARCHAR(50),
    description TEXT,
    image VARCHAR(255),
    statut ENUM('disponible', 'vendue') NOT NULL DEFAULT 'disponible',
    date_ajout DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_agence) REFERENCES agence(id_agence) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_marque (marque),
    INDEX idx_statut (statut),
    INDEX idx_prix (prix)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: reservation
-- ============================================================
CREATE TABLE IF NOT EXISTS reservation (
    id_reservation INT AUTO_INCREMENT PRIMARY KEY,
    id_client INT NOT NULL,
    id_voiture INT NOT NULL,
    id_vendeur INT NOT NULL,
    date_reservation DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    statut ENUM('en_attente', 'confirmee', 'annulee') NOT NULL DEFAULT 'en_attente',
    date_expiration DATE,
    note TEXT,
    FOREIGN KEY (id_client) REFERENCES client(id_client) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_voiture) REFERENCES voiture(id_voiture) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_vendeur) REFERENCES vendeur(id_vendeur) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_statut_res (statut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: vente
-- ============================================================
CREATE TABLE IF NOT EXISTS vente (
    id_vente INT AUTO_INCREMENT PRIMARY KEY,
    id_client INT NOT NULL,
    id_voiture INT NOT NULL,
    id_vendeur INT NOT NULL,
    id_agence INT NOT NULL,
    id_reservation INT NULL,
    date_vente DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    montant_total DECIMAL(12,2) NOT NULL,
    type_paiement ENUM('cash', 'credit') NOT NULL,
    statut_vente ENUM('en_attente', 'validee', 'annulee') NOT NULL DEFAULT 'en_attente',
    notes TEXT,
    FOREIGN KEY (id_client) REFERENCES client(id_client) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_voiture) REFERENCES voiture(id_voiture) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_vendeur) REFERENCES vendeur(id_vendeur) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_agence) REFERENCES agence(id_agence) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_reservation) REFERENCES reservation(id_reservation) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_statut_vente (statut_vente),
    INDEX idx_date_vente (date_vente)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: paiement
-- ============================================================
CREATE TABLE IF NOT EXISTS paiement (
    id_paiement INT AUTO_INCREMENT PRIMARY KEY,
    id_vente INT NOT NULL,
    montant DECIMAL(12,2) NOT NULL,
    type_paiement ENUM('cash', 'credit') NOT NULL,
    statut ENUM('en_attente', 'confirme', 'refuse') NOT NULL DEFAULT 'en_attente',
    date_paiement DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_admin_validation INT NULL,
    montant_avance DECIMAL(12,2) NULL,
    nombre_mensualites INT NULL,
    mensualite DECIMAL(12,2) NULL,
    taux_interet DECIMAL(5,2) NULL,
    date_debut_remboursement DATE NULL,
    FOREIGN KEY (id_vente) REFERENCES vente(id_vente) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_admin_validation) REFERENCES utilisateur(id_utilisateur) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_statut_paiement (statut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: facture
-- ============================================================
CREATE TABLE IF NOT EXISTS facture (
    id_facture INT AUTO_INCREMENT PRIMARY KEY,
    id_paiement INT NOT NULL,
    numero_facture VARCHAR(50) NOT NULL UNIQUE,
    fichier_pdf VARCHAR(255),
    date_facture DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    statut_envoi ENUM('envoyee', 'non_envoyee') NOT NULL DEFAULT 'non_envoyee',
    FOREIGN KEY (id_paiement) REFERENCES paiement(id_paiement) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- ADMIN ACCOUNT (required to log in for the first time)
-- Username : admin
-- Password : Admin@123   ← change this after first login
-- ============================================================
INSERT INTO utilisateur (username, password, role, statut_compte) VALUES
('admin', '$2a$10$BJnPbqiRGcIKa9arVTJ1duuUVlFRmWHU9BOF1iNwjr/aa/ZppZ0Ke', 'admin', 'actif');

INSERT INTO administrateur (id_utilisateur, nom, prenom, niveau_acces) VALUES
(1, 'Admin', 'Principal', 'super');

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
-- SAMPLE DATA
-- ============================================================

-- Admin user (password: Admin@123)
INSERT INTO utilisateur (username, password, role, statut_compte) VALUES
('admin', '$2a$10$BJnPbqiRGcIKa9arVTJ1duuUVlFRmWHU9BOF1iNwjr/aa/ZppZ0Ke', 'admin', 'actif');

INSERT INTO administrateur (id_utilisateur, nom, prenom, niveau_acces) VALUES
(1, 'ALFA', 'Admin', 'super');

-- Agence
INSERT INTO agence (nom_agence, adresse, telephone, email) VALUES
('ALFA CAR - Siège Principal', '123 Boulevard Mohammed V, Casablanca', '+212 522 123456', 'contact@alfacar.ma'),
('ALFA CAR - Agence Rabat', '45 Avenue Hassan II, Rabat', '+212 537 654321', 'rabat@alfacar.ma');

-- Sellers (password: Seller@123)
INSERT INTO utilisateur (username, password, role, statut_compte) VALUES
('vendeur1', '$2a$10$BJnPbqiRGcIKa9arVTJ1duuUVlFRmWHU9BOF1iNwjr/aa/ZppZ0Ke', 'vendeur', 'actif'),
('vendeur2', '$2a$10$BJnPbqiRGcIKa9arVTJ1duuUVlFRmWHU9BOF1iNwjr/aa/ZppZ0Ke', 'vendeur', 'actif');

INSERT INTO vendeur (id_utilisateur, id_agence, nom, prenom, telephone, email) VALUES
(2, 1, 'Benali', 'Youssef', '+212 661 111111', 'youssef@alfacar.ma'),
(3, 2, 'Tahiri', 'Fatima', '+212 661 222222', 'fatima@alfacar.ma');

-- Clients (password: Client@123)
INSERT INTO utilisateur (username, password, role, statut_compte) VALUES
('client1', '$2a$10$BJnPbqiRGcIKa9arVTJ1duuUVlFRmWHU9BOF1iNwjr/aa/ZppZ0Ke', 'client', 'actif'),
('client2', '$2a$10$BJnPbqiRGcIKa9arVTJ1duuUVlFRmWHU9BOF1iNwjr/aa/ZppZ0Ke', 'client', 'actif'),
('client3', '$2a$10$BJnPbqiRGcIKa9arVTJ1duuUVlFRmWHU9BOF1iNwjr/aa/ZppZ0Ke', 'client', 'en_attente');

INSERT INTO client (id_utilisateur, nom, prenom, telephone, email, adresse) VALUES
(4, 'Amrani', 'Mohamed', '+212 662 333333', 'mohamed@email.com', '12 Rue de Fès, Casablanca'),
(5, 'Idrissi', 'Sara', '+212 662 444444', 'sara@email.com', '78 Avenue de Marrakech, Rabat'),
(6, 'Khalifi', 'Ahmed', '+212 662 555555', 'ahmed@email.com', '34 Boulevard Zerktouni, Casablanca');

-- Cars
INSERT INTO voiture (id_agence, marque, modele, annee, prix, kilometrage, carburant, boite_vitesse, couleur, description, image, statut) VALUES
(1, 'Mercedes-Benz', 'Classe C 220d', 2024, 450000.00, 5000, 'Diesel', 'Automatique', 'Noir', 'Mercedes-Benz Classe C dernière génération avec tous les équipements premium. Intérieur cuir, GPS, caméra de recul, sièges chauffants.', '/images/cars/mercedes-c.jpg', 'disponible'),
(1, 'BMW', 'Série 3 320i', 2024, 420000.00, 8000, 'Essence', 'Automatique', 'Blanc', 'BMW Série 3 sportive et élégante. Moteur puissant, technologie de pointe, confort optimal.', '/images/cars/bmw-3.jpg', 'disponible'),
(1, 'Audi', 'A4 2.0 TDI', 2023, 380000.00, 15000, 'Diesel', 'Automatique', 'Gris', 'Audi A4 premium avec finition S-Line. Jantes alliage 18 pouces, toit ouvrant panoramique.', '/images/cars/audi-a4.jpg', 'disponible'),
(2, 'Volkswagen', 'Golf 8 GTI', 2024, 350000.00, 3000, 'Essence', 'Automatique', 'Rouge', 'VW Golf 8 GTI sportive. 245 chevaux, intérieur sport, système multimédia dernière génération.', '/images/cars/vw-golf.jpg', 'disponible'),
(1, 'Peugeot', '3008 GT', 2023, 320000.00, 20000, 'Diesel', 'Automatique', 'Bleu', 'Peugeot 3008 GT avec i-Cockpit. SUV premium, confort et technologie.', '/images/cars/peugeot-3008.jpg', 'disponible'),
(2, 'Renault', 'Clio 5', 2024, 180000.00, 1000, 'Essence', 'Manuelle', 'Orange', 'Renault Clio 5 neuve. Économique et moderne, parfaite pour la ville.', '/images/cars/renault-clio.jpg', 'disponible'),
(1, 'Toyota', 'Corolla Hybride', 2024, 280000.00, 10000, 'Hybride', 'Automatique', 'Argent', 'Toyota Corolla Hybride. Faible consommation, fiabilité légendaire, technologie hybride.', '/images/cars/toyota-corolla.jpg', 'disponible'),
(2, 'Hyundai', 'Tucson', 2023, 300000.00, 25000, 'Diesel', 'Automatique', 'Blanc', 'Hyundai Tucson au design futuriste. SUV spacieux avec équipements modernes.', '/images/cars/hyundai-tucson.jpg', 'disponible'),
(1, 'Dacia', 'Duster', 2024, 200000.00, 5000, 'Diesel', 'Manuelle', 'Vert', 'Dacia Duster robuste et économique. Parfait pour toutes les routes.', '/images/cars/dacia-duster.jpg', 'disponible'),
(2, 'Range Rover', 'Evoque', 2023, 650000.00, 12000, 'Diesel', 'Automatique', 'Noir', 'Range Rover Evoque luxueux. Design iconique, performances tout-terrain, finition premium.', '/images/cars/range-rover.jpg', 'vendue');

-- Sample Reservation
INSERT INTO reservation (id_client, id_voiture, id_vendeur, statut, date_expiration, note) VALUES
(1, 2, 1, 'en_attente', DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'Client intéressé par la BMW Série 3'),
(2, 4, 2, 'confirmee', DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'Réservation confirmée pour la Golf GTI');

-- Sample Sale
INSERT INTO vente (id_client, id_voiture, id_vendeur, id_agence, id_reservation, montant_total, type_paiement, statut_vente) VALUES
(2, 10, 2, 2, NULL, 650000.00, 'credit', 'validee');

-- Sample Payment
INSERT INTO paiement (id_vente, montant, type_paiement, statut, id_admin_validation, montant_avance, nombre_mensualites, mensualite, taux_interet, date_debut_remboursement) VALUES
(1, 650000.00, 'credit', 'confirme', 1, 200000.00, 48, 10625.00, 5.50, DATE_ADD(CURDATE(), INTERVAL 1 MONTH));

-- Sample Invoice
INSERT INTO facture (id_paiement, numero_facture, statut_envoi) VALUES
(1, 'FAC-2024-0001', 'envoyee');

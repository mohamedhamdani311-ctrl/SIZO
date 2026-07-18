-- ============================================================
-- Ajouter un deuxième compte administrateur
-- Exécuter dans phpMyAdmin sur la base GESTION_ALFA_CAR
-- ============================================================

-- Mot de passe : AlfaAdmin2024!
INSERT INTO utilisateur (username, password, role, statut_compte)
VALUES (
    'admin2',
    '$2a$10$gsgs6Gdeu7PXKaJ8Iz3WdeykKCQR1pRRS5KymPTQAg57Tr2Ix6U96',
    'admin',
    'actif'
);

INSERT INTO administrateur (id_utilisateur, nom, prenom, niveau_acces)
VALUES (
    LAST_INSERT_ID(),
    'Admin',
    'Deux',
    'super'
);

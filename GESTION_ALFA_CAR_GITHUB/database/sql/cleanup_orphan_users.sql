-- ============================================================
-- CLEANUP: Supprimer les comptes utilisateurs orphelins
-- Un compte orphelin = un utilisateur dans la table `utilisateur`
-- qui n'a pas de profil correspondant dans vendeur, client,
-- ou administrateur (créé par erreur lors d'une tentative échouée).
--
-- Exécutez ce script UNE FOIS dans phpMyAdmin ou MySQL Workbench
-- si vous avez eu l'erreur "Ce nom d'utilisateur est déjà utilisé"
-- en essayant d'ajouter un vendeur.
-- ============================================================

USE GESTION_ALFA_CAR;

DELETE FROM utilisateur
WHERE id_utilisateur NOT IN (SELECT id_utilisateur FROM administrateur)
  AND id_utilisateur NOT IN (SELECT id_utilisateur FROM vendeur)
  AND id_utilisateur NOT IN (SELECT id_utilisateur FROM client);

-- Vérification : afficher les utilisateurs restants
SELECT id_utilisateur, username, role, statut_compte FROM utilisateur;

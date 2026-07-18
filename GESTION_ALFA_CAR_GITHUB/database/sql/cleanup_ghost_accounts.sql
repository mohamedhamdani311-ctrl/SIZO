-- ============================================================
-- Nettoyage des comptes fantômes (utilisateur sans profil lié)
-- Exécuter UNE SEULE FOIS dans phpMyAdmin
-- ============================================================

DELETE FROM utilisateur
WHERE role = 'client'
  AND id_utilisateur NOT IN (SELECT id_utilisateur FROM client);

DELETE FROM utilisateur
WHERE role = 'vendeur'
  AND id_utilisateur NOT IN (SELECT id_utilisateur FROM vendeur);

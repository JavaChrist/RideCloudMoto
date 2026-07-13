-- Ajout du téléphone de contact optionnel sur une alerte SOS.
-- (Appliqué en production ; conservé ici pour la reproductibilité du schéma.)

ALTER TABLE public.sos_alerts
  ADD COLUMN IF NOT EXISTS contact_phone text;

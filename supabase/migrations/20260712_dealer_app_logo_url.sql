-- Logo d'application personnalisé par concessionnaire (header de l'app client).
-- (Appliqué en production ; conservé ici pour la reproductibilité du schéma.)

ALTER TABLE public.dealers
  ADD COLUMN IF NOT EXISTS app_logo_url text;

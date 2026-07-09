-- ════════════════════════════════════════════════════════════════════════════
-- Comptes concessionnaire (portail self-service)
-- Un compte e-mail dédié rattaché à un concessionnaire lui donne accès au portail
-- pour enregistrer des ventes, consulter et prolonger les licences de ses clients.
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.dealer_users (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id   uuid NOT NULL REFERENCES public.dealers(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        text NOT NULL DEFAULT 'staff' CHECK (role IN ('owner','staff')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  -- Un compte est rattaché à un seul concessionnaire.
  CONSTRAINT dealer_users_user_unique UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_dealer_users_dealer ON public.dealer_users (dealer_id);

ALTER TABLE public.dealer_users ENABLE ROW LEVEL SECURITY;
-- Un utilisateur peut lire sa propre appartenance ; l'écriture est réservée au
-- service_role (l'admin plateforme gère les membres).
CREATE POLICY dealer_users_select_own ON public.dealer_users
  FOR SELECT USING (auth.uid() = user_id);

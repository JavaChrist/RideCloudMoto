-- ── SOS entraide motard : alertes + chat ─────────────────────────────────────
-- Une alerte SOS est diffusée à la communauté. La position est partagée
-- volontairement au moment du déclenchement (pas de stockage de position en dehors).

CREATE TABLE IF NOT EXISTS public.sos_alerts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  latitude     double precision NOT NULL,
  longitude    double precision NOT NULL,
  kind         text NOT NULL DEFAULT 'panne' CHECK (kind IN ('panne','chute','perdu','autre')),
  note         text,
  contact_phone text,
  status       text NOT NULL DEFAULT 'active' CHECK (status IN ('active','resolved','cancelled')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  resolved_at  timestamptz
);

CREATE INDEX IF NOT EXISTS idx_sos_alerts_active
  ON public.sos_alerts (created_at DESC) WHERE status = 'active';

CREATE TABLE IF NOT EXISTS public.sos_messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sos_id      uuid NOT NULL REFERENCES public.sos_alerts(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind        text NOT NULL DEFAULT 'message' CHECK (kind IN ('message','coming')),
  body        text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sos_messages_sos ON public.sos_messages (sos_id, created_at);

-- RLS : lecture par tout utilisateur connecté (entraide communautaire),
-- écriture réservée à l'auteur.
ALTER TABLE public.sos_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sos_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS sos_alerts_select_auth ON public.sos_alerts;
CREATE POLICY sos_alerts_select_auth ON public.sos_alerts
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS sos_alerts_insert_own ON public.sos_alerts;
CREATE POLICY sos_alerts_insert_own ON public.sos_alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS sos_alerts_update_own ON public.sos_alerts;
CREATE POLICY sos_alerts_update_own ON public.sos_alerts
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS sos_messages_select_auth ON public.sos_messages;
CREATE POLICY sos_messages_select_auth ON public.sos_messages
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS sos_messages_insert_own ON public.sos_messages;
CREATE POLICY sos_messages_insert_own ON public.sos_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

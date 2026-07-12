-- ════════════════════════════════════════════════════════════════════════════
-- RideCloudMoto — Schéma de base Supabase
-- Catégories : motos + scooters | Accès : code concessionnaire (gratuit 1 an) ou Premium
-- ════════════════════════════════════════════════════════════════════════════

-- ── Extensions ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── dealers (concessionnaires partenaires) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.dealers (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             text NOT NULL UNIQUE,
  name             text NOT NULL,
  logo_url         text,
  primary_color    text,
  secondary_color  text,
  address          text,
  postal_code      text,
  city             text,
  phone            text,
  email            text,
  website          text,
  latitude         double precision,
  longitude        double precision,
  hours            jsonb,
  brands           text[] NOT NULL DEFAULT '{}',
  booking_url      text,
  offer_months     integer NOT NULL DEFAULT 12,
  is_active        boolean NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.dealers ENABLE ROW LEVEL SECURITY;
CREATE POLICY dealers_select_all ON public.dealers FOR SELECT USING (true);

-- ── dealer_promotions ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.dealer_promotions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id    uuid NOT NULL REFERENCES public.dealers(id) ON DELETE CASCADE,
  title        text NOT NULL,
  description  text,
  valid_from   date,
  valid_until  date,
  is_active    boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dealer_promotions_dealer
  ON public.dealer_promotions (dealer_id) WHERE is_active;

ALTER TABLE public.dealer_promotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY dealer_promotions_select_all ON public.dealer_promotions FOR SELECT USING (true);

-- ── dealer_users (comptes concessionnaire — portail self-service) ─────────────
CREATE TABLE IF NOT EXISTS public.dealer_users (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id   uuid NOT NULL REFERENCES public.dealers(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        text NOT NULL DEFAULT 'staff' CHECK (role IN ('owner','staff')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT dealer_users_user_unique UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_dealer_users_dealer ON public.dealer_users (dealer_id);

ALTER TABLE public.dealer_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY dealer_users_select_own ON public.dealer_users
  FOR SELECT USING (auth.uid() = user_id);

-- ── SOS entraide motard : alertes + chat ─────────────────────────────────────
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

ALTER TABLE public.sos_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sos_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY sos_alerts_select_auth ON public.sos_alerts
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY sos_alerts_insert_own ON public.sos_alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY sos_alerts_update_own ON public.sos_alerts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY sos_messages_select_auth ON public.sos_messages
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY sos_messages_insert_own ON public.sos_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ── profiles ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id                       uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                    text NOT NULL UNIQUE,
  full_name                text,
  -- Billing
  plan                     text NOT NULL DEFAULT 'free' CHECK (plan IN ('free','premium')),
  plan_status              text NOT NULL DEFAULT 'active' CHECK (plan_status IN ('active','past_due','canceled','pending')),
  plan_interval            text CHECK (plan_interval IN ('monthly','yearly')),
  plan_renews_at           timestamptz,
  plan_canceled_at         timestamptz,
  mollie_customer_id       text,
  mollie_subscription_id   text,
  mollie_mandate_id        text,
  -- Offre concessionnaire : accès gratuit (1 véhicule) jusqu'à cette date — activée via code
  dealer_premium_until     timestamptz,
  -- Concessionnaire d'origine (branding + carte "Mon concessionnaire")
  dealer_id                uuid REFERENCES public.dealers(id) ON DELETE SET NULL,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY profiles_select_own ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ── vehicles ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.vehicles (
  id                           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category                     text NOT NULL CHECK (category IN ('motos','scooters')),
  marque                       text NOT NULL,
  modele                       text NOT NULL,
  annee                        integer NOT NULL,
  kilometrage                  integer NOT NULL DEFAULT 0,
  date_mise_en_circulation     date,
  date_achat                   date,
  carburant                    text,
  immatriculation              text,
  vin                          text,
  surnom                       text,
  photo_url                    text,
  usage_profile                text NOT NULL DEFAULT 'often' CHECK (usage_profile IN ('daily','often','occasional','rare')),
  avg_km_per_year              integer NOT NULL DEFAULT 6000,
  last_odometer_value          integer NOT NULL DEFAULT 0,
  last_odometer_date           date NOT NULL DEFAULT current_date,
  last_estimation_reminder_at  timestamptz,
  created_at                   timestamptz NOT NULL DEFAULT now(),
  updated_at                   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY vehicles_all_own ON public.vehicles FOR ALL USING (auth.uid() = user_id);

-- ── maintenance_plan_entries ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.maintenance_plan_entries (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id              uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  titre                   text NOT NULL,
  categorie               text NOT NULL,
  description             text,
  interval_km             integer,
  interval_months         integer,
  first_due_km            integer,
  first_due_date          date,
  last_done_km            integer,
  last_done_date          date,
  next_due_km             integer,
  next_due_date           date,
  due_soon_km_threshold   integer NOT NULL DEFAULT 500,
  due_soon_days_threshold integer NOT NULL DEFAULT 30,
  priority                text NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal','important','urgent')),
  status                  text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming','due_soon','overdue','done')),
  source                  text NOT NULL DEFAULT 'template' CHECK (source IN ('manual','template')),
  template_source         text CHECK (template_source IN ('hardcoded','community','approved')),
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT maintenance_plan_entries_unique_task_idx
    UNIQUE (user_id, vehicle_id, source, categorie, titre)
);

ALTER TABLE public.maintenance_plan_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY maintenance_plan_all_own ON public.maintenance_plan_entries FOR ALL USING (auth.uid() = user_id);

-- ── maintenance_entries (historique réalisé) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.maintenance_entries (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id                uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  titre                     text NOT NULL,
  date_entretien            date NOT NULL,
  kilometrage               integer NOT NULL DEFAULT 0,
  cout                      numeric(10,2),
  description               text,
  maintenance_plan_entry_id uuid REFERENCES public.maintenance_plan_entries(id) ON DELETE SET NULL,
  created_at                timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.maintenance_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY maintenance_all_own ON public.maintenance_entries FOR ALL USING (auth.uid() = user_id);

-- ── upcoming_maintenance (rappels manuels) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.upcoming_maintenance (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id     uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  titre          text NOT NULL,
  due_date       date,
  due_km         integer,
  niveau_urgence text NOT NULL DEFAULT 'normal' CHECK (niveau_urgence IN ('normal','urgent')),
  description    text,
  source         text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','template')),
  created_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.upcoming_maintenance ENABLE ROW LEVEL SECURITY;
CREATE POLICY upcoming_all_own ON public.upcoming_maintenance FOR ALL USING (auth.uid() = user_id);

-- ── modifications ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.modifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id  uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  titre       text NOT NULL,
  marque      text,
  modele      text,
  date_pose   date,
  cout        numeric(10,2),
  facture_url text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.modifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY modifications_all_own ON public.modifications FOR ALL USING (auth.uid() = user_id);

-- ── documents ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.documents (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id   uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  nom_fichier  text NOT NULL,
  type_fichier text NOT NULL,
  url          text NOT NULL,
  taille       integer,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY documents_all_own ON public.documents FOR ALL USING (auth.uid() = user_id);

-- ── push_subscriptions ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint     text NOT NULL UNIQUE,
  p256dh       text NOT NULL,
  auth         text NOT NULL,
  user_agent   text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY push_subscriptions_all_own ON public.push_subscriptions FOR ALL USING (auth.uid() = user_id);

-- ── notification_log (anti-spam push) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notification_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id  uuid REFERENCES public.vehicles(id) ON DELETE CASCADE,
  kind        text NOT NULL,
  ref_key     text,
  sent_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY notification_log_select_own ON public.notification_log FOR SELECT USING (auth.uid() = user_id);
-- INSERT réservé au service_role (cron)

-- ── set_updated_at trigger générique ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_vehicles_updated_at
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_maintenance_plan_entries_updated_at
  BEFORE UPDATE ON public.maintenance_plan_entries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_dealers_updated_at
  BEFORE UPDATE ON public.dealers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Storage bucket ────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('ridecloudmoto-files', 'ridecloudmoto-files', false)
ON CONFLICT (id) DO NOTHING;

-- Bucket public pour les photos de véhicules (affichées via next/image)
INSERT INTO storage.buckets (id, name, public)
VALUES ('vehicle-photos', 'vehicle-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY vehicle_photos_public_read ON storage.objects FOR SELECT
  USING (bucket_id = 'vehicle-photos');
CREATE POLICY vehicle_photos_insert_own ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'vehicle-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY vehicle_photos_update_own ON storage.objects FOR UPDATE
  USING (bucket_id = 'vehicle-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY vehicle_photos_delete_own ON storage.objects FOR DELETE
  USING (bucket_id = 'vehicle-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY storage_select_own ON storage.objects FOR SELECT
  USING (bucket_id = 'ridecloudmoto-files' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY storage_insert_own ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'ridecloudmoto-files' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY storage_update_own ON storage.objects FOR UPDATE
  USING (bucket_id = 'ridecloudmoto-files' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY storage_delete_own ON storage.objects FOR DELETE
  USING (bucket_id = 'ridecloudmoto-files' AND (storage.foldername(name))[1] = auth.uid()::text);

-- ── Codes activation concessionnaire ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.dealer_activation_codes (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code                text NOT NULL UNIQUE,
  dealer_name         text,
  dealer_id           uuid REFERENCES public.dealers(id) ON DELETE SET NULL,
  customer_first_name text,
  customer_last_name  text,
  customer_email      text,
  customer_phone      text,
  vehicle_model       text,
  purchase_date       date,
  used_by             uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  used_at             timestamptz,
  expires_at          timestamptz,
  extended_at         timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dealer_codes_unused
  ON public.dealer_activation_codes (code)
  WHERE used_by IS NULL;

CREATE INDEX IF NOT EXISTS idx_dealer_codes_dealer
  ON public.dealer_activation_codes (dealer_id) WHERE dealer_id IS NOT NULL;

ALTER TABLE public.dealer_activation_codes ENABLE ROW LEVEL SECURITY;

-- Seed : premier partenaire (Voge)
INSERT INTO public.dealers (slug, name, primary_color, brands, offer_months, is_active)
VALUES ('voge', 'Voge', '#FACC15', ARRAY['Voge'], 12, true)
ON CONFLICT (slug) DO NOTHING;

-- ── Trigger création profil (sans offre automatique) ───────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, updated_at = now();
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW; -- Ne jamais bloquer l'inscription
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

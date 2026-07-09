-- ════════════════════════════════════════════════════════════════════════════
-- Architecture multi-partenaires (B2B2C)
-- Chaque concessionnaire dispose de son identité (logo, couleurs, coordonnées,
-- horaires, marques, durée d'offre) tout en partageant le même moteur logiciel.
-- ════════════════════════════════════════════════════════════════════════════

-- ── dealers (concessionnaires partenaires) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.dealers (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             text NOT NULL UNIQUE,
  name             text NOT NULL,
  -- Personnalisation / branding
  logo_url         text,
  primary_color    text,           -- couleur principale au format hex (#RRGGBB)
  secondary_color  text,           -- couleur secondaire au format hex
  -- Coordonnées
  address          text,
  postal_code      text,
  city             text,
  phone            text,
  email            text,
  website          text,
  latitude         double precision,
  longitude        double precision,
  -- Horaires d'ouverture (jsonb libre : { "lundi": "9h-18h", ... })
  hours            jsonb,
  -- Marques distribuées (ex. {"Voge","Kawasaki"})
  brands           text[] NOT NULL DEFAULT '{}',
  -- Prise de rendez-vous atelier
  booking_url      text,
  -- Durée de l'offre Premium offerte (en mois) à la vente d'un véhicule
  offer_months     integer NOT NULL DEFAULT 12,
  is_active        boolean NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.dealers ENABLE ROW LEVEL SECURITY;
-- Lecture publique (authentifiés) : l'app affiche la carte "Mon concessionnaire".
CREATE POLICY dealers_select_all ON public.dealers FOR SELECT USING (true);
-- Écriture réservée au service_role (admin plateforme).

CREATE TRIGGER set_dealers_updated_at
  BEFORE UPDATE ON public.dealers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── dealer_promotions (offres/promotions du concessionnaire) ─────────────────
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

-- ── Liaison client ↔ concessionnaire ─────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS dealer_id uuid REFERENCES public.dealers(id) ON DELETE SET NULL;

ALTER TABLE public.dealer_activation_codes
  ADD COLUMN IF NOT EXISTS dealer_id uuid REFERENCES public.dealers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_dealer ON public.profiles (dealer_id) WHERE dealer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_dealer_codes_dealer ON public.dealer_activation_codes (dealer_id) WHERE dealer_id IS NOT NULL;

-- ── Seed : premier partenaire (Voge) ─────────────────────────────────────────
INSERT INTO public.dealers (slug, name, primary_color, brands, offer_months, is_active)
VALUES ('voge', 'Voge', '#FACC15', ARRAY['Voge'], 12, true)
ON CONFLICT (slug) DO NOTHING;

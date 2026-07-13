-- ═══════════════════════════════════════════════════════════════════════════
-- Catalogue multi-marques : marques, modèles et profils d'entretien en base.
-- Remplace le catalogue Voge codé en dur (src/lib/data/vehicle-catalog.ts).
-- Géré uniquement par l'admin (service_role) ; lecture pour les utilisateurs.
-- Ajoute également la catégorie "quads" aux véhicules.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Marques ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.catalog_brands (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL UNIQUE,
  slug       text NOT NULL UNIQUE,
  logo_url   text,
  is_active  boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ── Profils d'entretien (famille technique, par marque) ─────────────────────
-- tasks : tableau JSON de tâches au format MaintenanceTemplate
-- { titre, categorie, description?, intervalKm?, intervalMonths?, firstDueKm?, priority? }
CREATE TABLE IF NOT EXISTS public.catalog_maintenance_profiles (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key        text NOT NULL UNIQUE,
  label      text NOT NULL,
  tasks      jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ── Modèles ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.catalog_models (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id   uuid NOT NULL REFERENCES public.catalog_brands(id) ON DELETE CASCADE,
  name       text NOT NULL,
  category   text NOT NULL CHECK (category IN ('motos', 'scooters', 'quads')),
  years      integer[] NOT NULL DEFAULT '{}',
  specs      jsonb NOT NULL DEFAULT '{}',
  notice_url text,
  profile_id uuid REFERENCES public.catalog_maintenance_profiles(id) ON DELETE SET NULL,
  is_active  boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (brand_id, category, name)
);

CREATE INDEX IF NOT EXISTS idx_catalog_models_brand ON public.catalog_models(brand_id);
CREATE INDEX IF NOT EXISTS idx_catalog_models_category ON public.catalog_models(category);

-- ── updated_at automatique ───────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_catalog_brands_updated ON public.catalog_brands;
CREATE TRIGGER trg_catalog_brands_updated
  BEFORE UPDATE ON public.catalog_brands
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_catalog_profiles_updated ON public.catalog_maintenance_profiles;
CREATE TRIGGER trg_catalog_profiles_updated
  BEFORE UPDATE ON public.catalog_maintenance_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_catalog_models_updated ON public.catalog_models;
CREATE TRIGGER trg_catalog_models_updated
  BEFORE UPDATE ON public.catalog_models
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── RLS : lecture pour les utilisateurs connectés, écriture service_role ────
ALTER TABLE public.catalog_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_maintenance_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_models ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "catalog_brands_read" ON public.catalog_brands;
CREATE POLICY "catalog_brands_read" ON public.catalog_brands
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "catalog_profiles_read" ON public.catalog_maintenance_profiles;
CREATE POLICY "catalog_profiles_read" ON public.catalog_maintenance_profiles
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "catalog_models_read" ON public.catalog_models;
CREATE POLICY "catalog_models_read" ON public.catalog_models
  FOR SELECT TO authenticated USING (true);

-- ── Catégorie "quads" sur les véhicules ─────────────────────────────────────
ALTER TABLE public.vehicles DROP CONSTRAINT IF EXISTS vehicles_category_check;
ALTER TABLE public.vehicles
  ADD CONSTRAINT vehicles_category_check
  CHECK (category IN ('motos', 'scooters', 'quads'));

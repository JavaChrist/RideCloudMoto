# RideCloud — Architecture complète & guide de bootstrap

> Document de référence pour créer un nouveau projet dérivé depuis zéro.  
> Rédigé à partir de RideCloud v0.1.0 — état de production juin 2026.

---

## 1. Présentation du projet source

**RideCloud** est une PWA SaaS française de gestion d'entretien automobile.  
Stack : **Next.js 16 App Router · TypeScript · Supabase · Mollie · Mistral AI · Web Push · Vercel**

Ce document décrit l'intégralité de l'architecture afin de pouvoir :
- Relancer un projet identique dans un nouveau dossier
- Créer une **version dérivée simplifiée** (ex. concessionnaire mono-marque)

---

## 2. Stack technique complète

| Couche | Technologie | Version |
|--------|-------------|---------|
| Framework | Next.js App Router | ^16.2.1 |
| Langage | TypeScript strict | ^6.0.2 |
| UI | TailwindCSS + shadcn/ui + Radix UI | ^3.4.17 |
| Icônes | Lucide React | ^1.7.0 |
| Formulaires | React Hook Form + Zod | ^7.72.0 / ^4.3.6 |
| Toasts | Sonner | ^2.0.7 |
| Dates | date-fns | ^4.1.0 |
| Export ZIP | JSZip | ^3.10.1 |
| Backend DB | Supabase (Postgres 17, Auth, Storage, RLS) | ^2.101.0 |
| Auth SSR | @supabase/ssr | ^0.10.0 |
| Paiements | Mollie API | ^4.5.0 |
| IA | Mistral AI REST | via MISTRAL_API_KEY |
| Push | web-push (VAPID) | ^3.6.7 |
| Hébergement | Vercel (région cdg1 Paris) | — |
| Tests | Vitest | ^3.2.6 |

### `package.json` complet

```json
{
  "name": "ridecloud",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run"
  },
  "dependencies": {
    "@hookform/resolvers": "^5.2.2",
    "@mollie/api-client": "^4.5.0",
    "@radix-ui/react-avatar": "^1.1.11",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-label": "^2.1.8",
    "@radix-ui/react-separator": "^1.1.8",
    "@radix-ui/react-slot": "^1.2.4",
    "@radix-ui/react-tabs": "^1.1.13",
    "@supabase/ssr": "^0.10.0",
    "@supabase/supabase-js": "^2.101.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "date-fns": "^4.1.0",
    "jszip": "^3.10.1",
    "lucide-react": "^1.7.0",
    "next": "^16.2.1",
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "react-hook-form": "^7.72.0",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.5.0",
    "tailwindcss-animate": "^1.0.7",
    "web-push": "^3.6.7",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "@types/node": "^25.5.0",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@types/web-push": "^3.6.4",
    "autoprefixer": "^10.4.27",
    "eslint": "^9.39.4",
    "eslint-config-next": "^16.2.1",
    "postcss": "^8.5.8",
    "tailwindcss": "^3.4.17",
    "typescript": "^6.0.2",
    "vitest": "^3.2.6"
  }
}
```

---

## 3. Variables d'environnement

### `.env.example`

```env
# ── Supabase (client + serveur) ──────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...

# ── Supabase (serveur uniquement — JAMAIS exposé client) ─────────────────────
# Requis : suppression compte RGPD, crons, cache IA, admin
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# ── Mollie (paiements) ────────────────────────────────────────────────────────
# test_xxx pour dev local, live_xxx pour production
MOLLIE_API_KEY=test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ── Mistral AI (plans d'entretien IA) ─────────────────────────────────────────
# Réservé Premium/Family. Coût ~0,002 €/véhicule.
MISTRAL_API_KEY=
MISTRAL_MODEL=mistral-small-latest

# ── Web Push VAPID ────────────────────────────────────────────────────────────
# Générer : npx web-push generate-vapid-keys --json
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BO...
VAPID_PRIVATE_KEY=...
VAPID_CONTACT_EMAIL=mailto:support@votre-domaine.fr

# ── Crons Vercel ──────────────────────────────────────────────────────────────
# openssl rand -hex 32
CRON_SECRET=

# ── Admin ─────────────────────────────────────────────────────────────────────
# Emails séparés par virgule → accès /admin/*
ADMIN_EMAILS=admin@votre-domaine.fr
```

### Vercel — Variables par environnement

| Variable | Production | Preview | Development |
|----------|------------|---------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | ✅ | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | ✅ | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ uniquement | — | — |
| `MOLLIE_API_KEY` (live_) | ✅ | — | — |
| `MOLLIE_API_KEY` (test_) | — | ✅ | ✅ local |
| Reste | ✅ | ✅ | ✅ |

---

## 4. Schéma base de données Supabase

### Ordre d'application

```
1. supabase/schema.sql                                        ← schéma de base
2. supabase/migrations/2026-05-17_ai_maintenance_plan.sql
3. supabase/migrations/2026-05-17_backfill_profiles_and_harden_trigger.sql
4. supabase/migrations/20260612_founder_program.sql
5. supabase/migrations/20260612_mileage_estimation.sql
6. supabase/migrations/20260612_push_notifications.sql
```

### `schema.sql` — contenu complet à reproduire

```sql
-- ── Extensions ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── profiles ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id                       uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                    text NOT NULL UNIQUE,
  full_name                text,
  -- Billing (ajouter manuellement ou via migration dédiée)
  plan                     text NOT NULL DEFAULT 'free' CHECK (plan IN ('free','premium','family')),
  plan_status              text NOT NULL DEFAULT 'active' CHECK (plan_status IN ('active','past_due','canceled','pending')),
  plan_interval            text CHECK (plan_interval IN ('monthly','yearly')),
  plan_renews_at           timestamptz,
  plan_canceled_at         timestamptz,
  mollie_customer_id       text,
  mollie_subscription_id   text,
  mollie_mandate_id        text,
  -- Fondateurs
  founder_premium_lifetime boolean NOT NULL DEFAULT false,
  founder_badge            boolean NOT NULL DEFAULT false,
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
  category                     text NOT NULL CHECK (category IN ('voitures','motos','scooters','utilitaires')),
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
  avg_km_per_year              integer NOT NULL DEFAULT 8000,
  last_odometer_value          integer NOT NULL DEFAULT 0,
  last_odometer_date           date NOT NULL DEFAULT current_date,
  last_estimation_reminder_at  timestamptz,
  created_at                   timestamptz NOT NULL DEFAULT now(),
  updated_at                   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY vehicles_all_own ON public.vehicles FOR ALL USING (auth.uid() = user_id);

-- ── maintenance_entries ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.maintenance_entries (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id              uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  titre                   text NOT NULL,
  date_entretien          date NOT NULL,
  kilometrage             integer NOT NULL DEFAULT 0,
  cout                    numeric(10,2),
  description             text,
  maintenance_plan_entry_id uuid REFERENCES public.maintenance_plan_entries(id) ON DELETE SET NULL,
  created_at              timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.maintenance_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY maintenance_all_own ON public.maintenance_entries FOR ALL USING (auth.uid() = user_id);

-- ── upcoming_maintenance ─────────────────────────────────────────────────────
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
  template_source         text CHECK (template_source IN ('hardcoded','ai','community','approved')),
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT maintenance_plan_entries_unique_task_idx
    UNIQUE (user_id, vehicle_id, source, categorie, titre)
);

ALTER TABLE public.maintenance_plan_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY maintenance_plan_all_own ON public.maintenance_plan_entries FOR ALL USING (auth.uid() = user_id);

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

-- ── maintenance_template_cache ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.maintenance_template_cache (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category          text CHECK (category IN ('voitures','motos','scooters','utilitaires')),
  marque_normalized text NOT NULL,
  modele_normalized text NOT NULL,
  annee             integer,
  profile_name      text NOT NULL,
  templates         jsonb NOT NULL,
  source            text NOT NULL DEFAULT 'ai' CHECK (source IN ('ai','approved','community')),
  llm_model         text,
  prompt_version    text NOT NULL DEFAULT 'v1',
  generated_at      timestamptz NOT NULL DEFAULT now(),
  validated_at      timestamptz,
  validated_by      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT maintenance_template_cache_unique
    UNIQUE (category, marque_normalized, modele_normalized)
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER set_maintenance_template_cache_updated_at
  BEFORE UPDATE ON public.maintenance_template_cache
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE public.maintenance_template_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY template_cache_read_authenticated
  ON public.maintenance_template_cache FOR SELECT
  USING (auth.role() = 'authenticated');
-- INSERT/UPDATE/DELETE réservés au service_role (cron + generate-plan)

-- ── Storage bucket ────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('ridecloud-files', 'ridecloud-files', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY storage_select_own ON storage.objects FOR SELECT
  USING (bucket_id = 'ridecloud-files' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY storage_insert_own ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'ridecloud-files' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY storage_update_own ON storage.objects FOR UPDATE
  USING (bucket_id = 'ridecloud-files' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY storage_delete_own ON storage.objects FOR DELETE
  USING (bucket_id = 'ridecloud-files' AND (storage.foldername(name))[1] = auth.uid()::text);

-- ── Trigger création profil ───────────────────────────────────────────────────
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
```

### Migrations spécifiques à appliquer après `schema.sql`

**`20260612_founder_program.sql`** — Crée `founder_members`, `founder_questionnaire_responses` et les RPC `claim_founder_slot()`, `submit_founder_questionnaire()`, `founder_program_config()`, `founder_slots_taken()` avec les RLS et grants appropriés.

**`20260612_push_notifications.sql`** — Crée `push_subscriptions` et `notification_log`.

**`20260612_mileage_estimation.sql`** — Ajoute `usage_profile`, `avg_km_per_year`, `last_odometer_value`, `last_odometer_date`, `last_estimation_reminder_at` sur `vehicles`.

---

## 5. Structure complète du projet

```
mon-projet/
├── middleware.ts                        # Point d'entrée middleware Next.js
├── next.config.ts                       # Config Next.js (headers sécurité, images)
├── tailwind.config.ts                   # Config Tailwind + design system
├── tsconfig.json                        # TS strict, alias @/* → ./src/*
├── postcss.config.mjs
├── vercel.json                          # Région, crons
├── .env.example                         # Template variables d'env
├── public/
│   ├── manifest.webmanifest             # PWA manifest
│   ├── sw.js                            # Service Worker Web Push
│   └── icons/                           # Icônes PWA (à créer manuellement)
│       ├── favicon.ico
│       ├── logo32.png
│       ├── logo192.png
│       ├── logo512.png
│       └── apple-touch-icon.png
├── supabase/
│   ├── schema.sql
│   └── migrations/
├── src/
│   ├── app/
│   │   ├── layout.tsx                   # Root layout (font, providers, cookie banner)
│   │   ├── globals.css                  # Tokens CSS, thèmes, utilitaires
│   │   ├── page.tsx                     # Landing marketing
│   │   ├── not-found.tsx                # Page 404
│   │   ├── error.tsx                    # Boundary erreur globale (client)
│   │   ├── (auth)/
│   │   │   ├── layout.tsx               # Layout centré pour formulaires auth
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── reset-password/page.tsx
│   │   ├── (legal)/
│   │   │   ├── layout.tsx
│   │   │   ├── cgu/page.tsx
│   │   │   ├── confidentialite/page.tsx
│   │   │   ├── mentions-legales/page.tsx
│   │   │   └── rgpd/page.tsx
│   │   ├── (protected)/
│   │   │   ├── layout.tsx               # Guard auth + shell + redirect fondateur
│   │   │   ├── categories/page.tsx
│   │   │   ├── vehicules/
│   │   │   │   ├── [categorie]/page.tsx
│   │   │   │   └── nouveau/page.tsx
│   │   │   ├── vehicule/[id]/
│   │   │   │   ├── page.tsx
│   │   │   │   └── export/page.tsx
│   │   │   ├── parametres/page.tsx
│   │   │   ├── fondateur/
│   │   │   │   ├── page.tsx
│   │   │   │   └── questionnaire/page.tsx
│   │   │   └── admin/founders/page.tsx
│   │   ├── tarifs/page.tsx
│   │   ├── api/
│   │   │   ├── billing/
│   │   │   │   ├── checkout/route.ts    # POST — Démarrage paiement Mollie
│   │   │   │   ├── cancel/route.ts      # POST — Annulation subscription
│   │   │   │   ├── sync/route.ts        # POST — Resync Mollie → DB
│   │   │   │   └── webhook/route.ts     # POST — Webhook Mollie (no auth)
│   │   │   ├── account/delete/route.ts  # POST — Suppression compte RGPD
│   │   │   ├── maintenance/
│   │   │   │   └── generate-plan/route.ts  # POST — Génération IA (Premium)
│   │   │   ├── vehicles/[id]/
│   │   │   │   └── mark-maintenance-current/route.ts  # POST
│   │   │   ├── vehicule/[id]/
│   │   │   │   ├── export/route.ts      # GET — Export JSON
│   │   │   │   └── export-zip/route.ts  # GET — Export ZIP
│   │   │   ├── push/
│   │   │   │   ├── subscribe/route.ts   # POST
│   │   │   │   └── unsubscribe/route.ts # POST
│   │   │   └── cron/
│   │   │       ├── notifications/route.ts       # GET/POST — Push daily (08h UTC)
│   │   │       └── downgrade-expired/route.ts   # GET — Free downgrade (02h UTC)
│   │   └── auth/callback/route.ts       # GET — PKCE callback Supabase
│   ├── components/
│   │   ├── account/
│   │   │   └── delete-account-section.tsx
│   │   ├── auth/
│   │   │   ├── forgot-password-form.tsx
│   │   │   ├── login-form.tsx           # useSearchParams → Suspense requis
│   │   │   ├── register-form.tsx        # useSearchParams → Suspense requis
│   │   │   ├── reset-password-form.tsx
│   │   │   └── sign-out-button.tsx
│   │   ├── billing/
│   │   │   ├── billing-success-handler.tsx   # Client — ?billing=success auto-sync
│   │   │   ├── cancel-subscription-button.tsx
│   │   │   ├── checkout-consent-dialog.tsx   # Modal CGV + rétractation
│   │   │   ├── pricing-cards.tsx
│   │   │   ├── subscription-section.tsx
│   │   │   ├── sync-subscription-button.tsx
│   │   │   └── upgrade-button.tsx
│   │   ├── categories/
│   │   │   └── category-card.tsx
│   │   ├── common/
│   │   │   ├── cookie-banner.tsx
│   │   │   ├── logo.tsx
│   │   │   ├── theme-toggle.tsx
│   │   │   └── themed-toaster.tsx
│   │   ├── documents/
│   │   │   └── documents-list.tsx
│   │   ├── founder/
│   │   │   ├── founder-badge.tsx
│   │   │   ├── founder-banner.tsx
│   │   │   ├── founder-questionnaire.tsx
│   │   │   └── founder-welcome.tsx
│   │   ├── history/
│   │   │   ├── history-sections.tsx
│   │   │   ├── maintenance-plan-list.tsx
│   │   │   └── vehicle-timeline.tsx
│   │   ├── layout/
│   │   │   ├── protected-header.tsx     # Header app avec badge fondateur
│   │   │   └── protected-shell.tsx      # Shell (spacer header + bannière)
│   │   ├── legal/
│   │   │   └── legal-page.tsx
│   │   ├── modifications/
│   │   │   └── modifications-list.tsx
│   │   ├── notifications/
│   │   │   └── push-notifications-section.tsx
│   │   ├── providers/
│   │   │   ├── confirm-provider.tsx     # useConfirm() modales globales
│   │   │   └── theme-provider.tsx
│   │   ├── ui/                          # shadcn/ui primitives
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── textarea.tsx
│   │   └── vehicles/
│   │       ├── add-vehicle-form.tsx
│   │       ├── odometer-refresh-hint.tsx
│   │       ├── print-export-button.tsx
│   │       ├── update-kilometrage-dialog.tsx
│   │       ├── vehicle-actions.tsx
│   │       ├── vehicle-card.tsx
│   │       ├── vehicle-cost-summary.tsx
│   │       ├── vehicle-detail-tabs.tsx
│   │       └── vehicle-reminders-card.tsx
│   ├── lib/
│   │   ├── admin.ts                     # isAdminEmail(env ADMIN_EMAILS)
│   │   ├── costs.ts                     # Calcul coûts véhicule (mois/an/total/km)
│   │   ├── maintenance.ts               # calculateNextMaintenanceDue, getMaintenanceStatus
│   │   ├── odometer-estimate.ts         # Estimation km courant entre saisies
│   │   ├── rate-limit.ts                # rateLimit(key, maxHits, windowMs), getClientIp
│   │   ├── reminders.ts                 # Agrégation rappels pour UI
│   │   ├── usage-profile.ts             # Mapping usage → avg_km_per_year par catégorie
│   │   ├── utils.ts                     # cn() = clsx + tailwind-merge
│   │   ├── ai/
│   │   │   └── maintenance-generator.ts # Appel Mistral + validation Zod stricte
│   │   ├── billing/
│   │   │   ├── ensure-profile.ts        # ensureProfile() création idempotente
│   │   │   ├── founder-program.ts       # Client RPC + helpers statut/dates
│   │   │   ├── limits.ts                # getUserPlanState, isSubscriptionExpired
│   │   │   ├── mollie.ts                # Client Mollie singleton + helpers
│   │   │   └── plans.ts                 # PLANS (Free/Premium/Family) + CHECKOUT_CONSENT_VERSION
│   │   ├── data/
│   │   │   ├── demo.ts                  # Labels catégories + données démo
│   │   │   ├── fuel-options.ts          # Options carburant
│   │   │   ├── maintenance-manufacturer-templates.ts  # Règles constructeur hardcodées
│   │   │   ├── maintenance-template-cache.ts          # Read/write cache IA Supabase
│   │   │   ├── maintenance-template-resolver.ts       # Résolution template/véhicule
│   │   │   ├── maintenance-templates.ts               # Templates génériques par catégorie
│   │   │   ├── vehicle-catalog.ts                     # Catalogue marques/modèles
│   │   │   └── vehicle-repository.ts                  # Requêtes Supabase véhicules
│   │   ├── hooks/
│   │   │   └── use-founder-program.ts
│   │   ├── push/
│   │   │   ├── client.ts                # Souscription Web Push navigateur
│   │   │   └── server.ts                # Envoi push VAPID côté serveur
│   │   ├── supabase/
│   │   │   ├── admin.ts                 # createAdminClient() — service_role
│   │   │   ├── client.ts                # createClient() — browser
│   │   │   ├── env.ts                   # Validation env vars + helpers
│   │   │   ├── middleware.ts            # updateSession() — guards, refresh token
│   │   │   └── server.ts               # createClient() — Server Components
│   │   ├── utils/
│   │   │   └── date.ts
│   │   └── validators/
│   │       ├── auth.ts                  # loginSchema, registerSchema
│   │       └── vehicle.ts              # vehicleFormSchema
│   └── types/
│       ├── database.ts                  # Tous les types Supabase
│       └── maintenance.ts              # Types domaine entretien
```

---

## 6. Fichiers de configuration

### `middleware.ts` (racine)

```typescript
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]
};
```

### `vercel.json`

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "regions": ["cdg1"],
  "framework": "nextjs",
  "cleanUrls": true,
  "trailingSlash": false,
  "crons": [
    { "path": "/api/cron/notifications",      "schedule": "0 8 * * *" },
    { "path": "/api/cron/downgrade-expired",  "schedule": "0 2 * * *" }
  ]
}
```

### `next.config.ts` (structure clé)

```typescript
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" }
    ]
  },
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }
      ]
    }];
  }
};
```

---

## 7. Patterns d'architecture clés

### Auth Supabase SSR (PKCE)

```
Inscription  →  /register  →  signUp()  →  email confirmation  →  /auth/callback  →  ensureProfile()  →  /categories
Connexion    →  /login     →  signInWithPassword()  →  /categories
Reset        →  /forgot-password  →  /reset-password (session recovery)
```

**`ensureProfile(admin, userId, email)`** : upsert non-bloquant de la row `profiles`. Appelé dans `/auth/callback`, `/api/billing/checkout`, `/api/billing/webhook`, `/api/billing/sync`.

### Guards middleware

```typescript
// src/lib/supabase/middleware.ts
if (!user && isProtectedRoute)          → redirect /login
if (user && isAuthRoute)                → redirect /categories
if (user && !user.email_confirmed_at)   → redirect /login?unverified=1
```

### Pattern modales de confirmation

```typescript
// Dans n'importe quel composant client
const confirm = useConfirm();
const ok = await confirm({
  title: "...", description: "...",
  confirmText: "...", cancelText: "...",
  variant: "danger" | "warning" | "success" | "info" | "ai"
});
```

`ConfirmProvider` est monté dans `app/layout.tsx` — accessible partout.

### Rate limiting

```typescript
// src/lib/rate-limit.ts
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const rl = rateLimit(`key:${userId}`, 5, 10 * 60 * 1000); // 5 req / 10 min
if (!rl.ok) return NextResponse.json({ error: "..." }, { status: 429 });
```

### Plan billing (Mollie flow)

```
UpgradeButton → CheckoutConsentDialog → POST /api/billing/checkout
  → Mollie first payment → webhook POST /api/billing/webhook
  → subscription created → profile.plan = 'premium' | 'family'
  → redirect /parametres?billing=success → BillingSuccessHandler auto-sync
```

**Rétrogradation :** `getUserPlanState()` détecte `plan_canceled_at + plan_renews_at < now` → downgrade en mémoire + async DB update. Cron `/api/cron/downgrade-expired` nettoie en bulk à 02h00 UTC.

### `useSearchParams` + Next.js 16

Tout composant utilisant `useSearchParams()` **doit** être enveloppé dans `<Suspense>` dans sa page :

```tsx
// page.tsx
import { Suspense } from "react";
<Suspense><MonComposant /></Suspense>
```

---

## 8. Plan d'entretien — logique centrale

### Génération (2 sources)

| Source | Déclenchement | Utilisateurs |
|--------|--------------|--------------|
| Templates hardcodés (`src/lib/data/maintenance-manufacturer-templates.ts`) | Automatique à la lecture (`vehicle-repository.ts`) | Tous |
| IA Mistral (`/api/maintenance/generate-plan`) | Manuel "Générer avec l'IA" ou auto après création véhicule | Premium/Family |

**Cache partagé** : `maintenance_template_cache` — 1 appel Mistral par `(category, marque, modele)` pour tous les utilisateurs.

### Initialisation pour véhicule d'occasion

Quand `vehicle.kilometrage > 0` ET nouvelles entrées sans historique :
```typescript
const initialLastDoneKm = vehicle.kilometrage > 0 ? vehicle.kilometrage : null;
const initialLastDoneDate = vehicle.kilometrage > 0 ? todayIso : null;
```
→ Le plan démarre depuis le km actuel, rien n'apparaît "en retard".

### Calcul statuts

```typescript
// src/lib/maintenance.ts
calculateNextMaintenanceDue({ intervalKm, intervalMonths, firstDueKm, firstDueDate, lastDoneKm, lastDoneDate })
getMaintenanceStatus({ nextDueKm, nextDueDate, currentKm, dueSoonKmThreshold, dueSoonDaysThreshold })
// → "upcoming" | "due_soon" | "overdue" | "done"
```

---

## 9. Web Push (notifications hors-app)

```
1. Générer VAPID : npx web-push generate-vapid-keys --json
2. public/sw.js  : service worker minimal (écoute "push", affiche notification)
3. /api/push/subscribe   : enregistre endpoint dans push_subscriptions
4. /api/push/unsubscribe : supprime + nettoie 404/410
5. /api/cron/notifications : cron 08h00 UTC → web-push.sendNotification()
   - Anti-spam : 1 push / 25 jours / véhicule (odomètre) ; 1 push / 7 jours / tâche
```

---

## 10. Programme Membres Fondateurs

```
100 places numérotées → RPC claim_founder_slot() → advisory lock Postgres (atomique)
30 jours pour questionnaire (5 questions NPS) → RPC submit_founder_questionnaire()
→ founder_premium_lifetime = true → effectivePlan = "premium" (override Mollie)
→ founder_badge = true → badge visuel dans header
```

---

## 11. Instructions de démarrage (nouveau projet)

```bash
# 1. Créer le projet Next.js
npx create-next-app@latest mon-projet --typescript --tailwind --app --src-dir
cd mon-projet

# 2. Installer les dépendances (copier package.json §2 puis :)
npm install

# 3. Copier la structure src/ depuis RideCloud
# 4. Configurer .env.local (copier .env.example et remplir les valeurs)

# 5. Supabase — appliquer le schéma
# Dashboard Supabase → SQL Editor → coller schema.sql puis les migrations

# 6. Configurer Auth Supabase
# Dashboard → Auth → URL Configuration
#   Site URL : http://localhost:3000
#   Redirect URLs : http://localhost:3000/auth/callback
#                   http://localhost:3000/reset-password

# 7. Configurer SMTP (Resend recommandé)
# Dashboard → Auth → SMTP Settings
#   Host : smtp.resend.com, Port : 465, User : resend, Pass : RESEND_API_KEY

# 8. Créer le bucket Storage
# Déjà dans schema.sql mais vérifier dans Dashboard → Storage → ridecloud-files (private)

# 9. Démarrer
npm run dev  # → http://localhost:3000
```

---

## 12. Adaptation pour version concessionnaire Voge (mono-marque motos/scooters)

### Ce qu'on garde

- Auth Supabase complète (PKCE, email vérifié, middleware)
- Schéma DB (vehicles, maintenance_plan_entries, documents…)
- Plan d'entretien (templates hardcodés adaptés Voge + IA optionnelle)
- Export JSON/ZIP/PDF
- Web Push (rappels entretien)
- Pages légales (adapter l'éditeur)
- Conformité RGPD

### Ce qu'on simplifie / supprime

| Élément RideCloud | Action pour Voge |
|---|---|
| `category` multi-valeurs (`voitures`, `motos`, `scooters`, `utilitaires`) | Fixer à `motos` + `scooters` uniquement (Voge fait les deux) |
| Page `/categories` (hub 4 catégories) | Remplacer par liste directe des motos de l'utilisateur |
| Catalogue `vehicle-catalog.ts` (toutes marques) | Garder uniquement les modèles Voge |
| Plans Free/Premium/Family + Mollie | Soit garder, soit un seul plan unique/offert par le concessionnaire |
| Programme Fondateurs | Supprimer (ou adapter pour programme client concessionnaire) |
| Landing marketing grand public | Remplacer par landing marque Voge |
| Templates entretien multi-catégories | Créer templates spécifiques Voge (courroie CVT, huile moteur, etc.) |

### Modifications minimales dans le code

```typescript
// src/lib/data/vehicle-catalog.ts — filtrer uniquement Voge
export const vehicleCatalog = {
  motos: ["Voge"],
  scooters: ["Voge"]
};

// src/lib/validators/vehicle.ts — restreindre catégories
category: z.enum(["motos", "scooters"])

// src/lib/data/maintenance-manufacturer-templates.ts — ajouter règles Voge
// src/lib/usage-profile.ts — adapter km/an si besoin

// Supprimer les imports/composants fondateur si non utilisés
// Supprimer /admin/founders et le programme fondateur complet
```

---

## 13. Points critiques à ne pas oublier

1. **Colonnes billing** sur `profiles` — incluses dans `schema.sql` ci-dessus (§4), vérifier qu'elles existent bien
2. **Icônes PWA** — créer manuellement sous `public/icons/` (favicon.ico, logo32.png, logo192.png, logo512.png, apple-touch-icon.png)
3. **Webhook Mollie** — configurer dans le dashboard Mollie : `https://<domaine>/api/billing/webhook`
4. **`<Suspense>`** — obligatoire sur toute page contenant un composant avec `useSearchParams()`
5. **SUPABASE_SERVICE_ROLE_KEY** — nécessaire pour suppression compte, crons, cache IA ; à mettre sur Vercel en Production uniquement
6. **CRON_SECRET** — à configurer sur Vercel, requis par `/api/cron/*`
7. **RLS activée partout** — vérifier dans Supabase Dashboard → Table Editor que chaque table a RLS = ON
8. **Email templates** — personnaliser dans `docs/email-templates/` puis copier dans Supabase Auth Dashboard
9. **`force-dynamic`** — les Route Handlers qui lisent des cookies/auth doivent avoir `export const dynamic = "force-dynamic"`
10. **Rate limiter** — non distribué (mémoire par instance serverless) ; migrer vers Upstash Redis pour >10k req/min

---

*Document généré à partir de RideCloud v0.1.0 — Juin 2026*

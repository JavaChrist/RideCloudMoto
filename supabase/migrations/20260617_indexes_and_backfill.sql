-- ════════════════════════════════════════════════════════════════════════════
-- RideCloudMoto — Index de performance + backfill offre Premium concessionnaire
-- À appliquer après schema.sql
-- ════════════════════════════════════════════════════════════════════════════

-- ── Backfill : profils existants sans période Premium offerte ────────────────
UPDATE public.profiles
SET dealer_premium_until = created_at + interval '12 months'
WHERE dealer_premium_until IS NULL;

-- ── Index de performance ─────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_vehicles_user_id
  ON public.vehicles (user_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_user_category
  ON public.vehicles (user_id, category);

CREATE INDEX IF NOT EXISTS idx_maintenance_entries_vehicle
  ON public.maintenance_entries (vehicle_id, date_entretien DESC);

CREATE INDEX IF NOT EXISTS idx_plan_entries_vehicle
  ON public.maintenance_plan_entries (vehicle_id, status);

CREATE INDEX IF NOT EXISTS idx_upcoming_vehicle
  ON public.upcoming_maintenance (vehicle_id);

CREATE INDEX IF NOT EXISTS idx_modifications_vehicle
  ON public.modifications (vehicle_id);

CREATE INDEX IF NOT EXISTS idx_documents_vehicle
  ON public.documents (vehicle_id);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user
  ON public.push_subscriptions (user_id);

CREATE INDEX IF NOT EXISTS idx_notification_log_user_kind
  ON public.notification_log (user_id, kind, sent_at DESC);

-- ── Profils dont l'offre Premium expire prochainement (pour rappels cron) ────
CREATE INDEX IF NOT EXISTS idx_profiles_dealer_premium_until
  ON public.profiles (dealer_premium_until);

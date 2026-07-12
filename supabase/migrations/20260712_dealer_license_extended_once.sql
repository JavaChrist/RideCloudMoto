-- Suivi de la prolongation de licence concessionnaire (autorisée une seule fois)
ALTER TABLE public.dealer_activation_codes
  ADD COLUMN IF NOT EXISTS extended_at timestamptz;

-- Ajout des informations client/véhicule sur les codes concessionnaire.
-- Saisies au moment de l'enregistrement de l'immatriculation par l'admin.

ALTER TABLE public.dealer_activation_codes
  ADD COLUMN IF NOT EXISTS customer_first_name text,
  ADD COLUMN IF NOT EXISTS customer_last_name  text,
  ADD COLUMN IF NOT EXISTS customer_email      text,
  ADD COLUMN IF NOT EXISTS customer_phone      text,
  ADD COLUMN IF NOT EXISTS vehicle_model       text,
  ADD COLUMN IF NOT EXISTS purchase_date       date;

CREATE INDEX IF NOT EXISTS idx_dealer_codes_customer_email
  ON public.dealer_activation_codes (customer_email)
  WHERE customer_email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_dealer_codes_dealer_name
  ON public.dealer_activation_codes (dealer_name)
  WHERE dealer_name IS NOT NULL;

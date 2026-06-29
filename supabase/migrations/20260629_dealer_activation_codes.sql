-- Codes d'activation concessionnaire (usage unique)
-- L'offre gratuite 1 an n'est plus automatique à l'inscription.

CREATE TABLE IF NOT EXISTS public.dealer_activation_codes (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code         text NOT NULL UNIQUE,
  dealer_name  text,
  used_by      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  used_at      timestamptz,
  expires_at   timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dealer_codes_unused
  ON public.dealer_activation_codes (code)
  WHERE used_by IS NULL;

ALTER TABLE public.dealer_activation_codes ENABLE ROW LEVEL SECURITY;
-- Aucune policy client : accès service role uniquement.

COMMENT ON COLUMN public.profiles.dealer_premium_until IS
  'Fin de l''offre gratuite concessionnaire (1 véhicule). Activée via code, pas à l''inscription.';

-- Ne plus accorder l'offre automatiquement à la création du compte
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, updated_at = now();
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════
-- Correction : le trigger handle_new_user ne copiait pas full_name depuis les
-- métadonnées d'inscription (raw_user_meta_data), le nom restait vide dans
-- Paramètres > Compte. On corrige le trigger + backfill des comptes existants.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NULLIF(trim(NEW.raw_user_meta_data->>'full_name'), '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
    updated_at = now();
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW; -- Ne jamais bloquer l'inscription
END;
$$;

-- Backfill : récupère le nom saisi à l'inscription pour les profils sans nom
UPDATE public.profiles p
SET full_name = NULLIF(trim(u.raw_user_meta_data->>'full_name'), ''),
    updated_at = now()
FROM auth.users u
WHERE u.id = p.id
  AND p.full_name IS NULL
  AND NULLIF(trim(u.raw_user_meta_data->>'full_name'), '') IS NOT NULL;

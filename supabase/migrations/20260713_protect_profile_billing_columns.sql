-- Sécurité (C1) : empêche un utilisateur authentifié de modifier lui-même les
-- colonnes de facturation / d'accès de son profil via l'API Supabase (clé anon).
-- La policy `profiles_update_own` autorise l'UPDATE de sa propre ligne, mais
-- Postgres ne permet pas de restreindre les colonnes en RLS. On fige donc les
-- colonnes sensibles par trigger : seules les écritures via `service_role`
-- (serveur : webhook Mollie, crons, activation code) peuvent les modifier.

create or replace function public.protect_profile_billing_columns()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  req_role text := coalesce(
    current_setting('request.jwt.claim.role', true),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  );
begin
  -- service_role (serveur) et accès direct/migration (req_role null) : autorisés.
  if req_role is null or req_role = 'service_role' then
    return new;
  end if;

  -- Utilisateur authentifié : on restaure la valeur d'origine des colonnes
  -- de facturation et d'accès, quelles que soient les valeurs soumises.
  new.plan                   := old.plan;
  new.plan_status            := old.plan_status;
  new.plan_interval          := old.plan_interval;
  new.plan_renews_at         := old.plan_renews_at;
  new.plan_canceled_at       := old.plan_canceled_at;
  new.mollie_customer_id     := old.mollie_customer_id;
  new.mollie_subscription_id := old.mollie_subscription_id;
  new.mollie_mandate_id      := old.mollie_mandate_id;
  new.dealer_premium_until   := old.dealer_premium_until;
  new.dealer_id              := old.dealer_id;

  return new;
end;
$$;

drop trigger if exists trg_protect_profile_billing on public.profiles;
create trigger trg_protect_profile_billing
  before update on public.profiles
  for each row
  execute function public.protect_profile_billing_columns();

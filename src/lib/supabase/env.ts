export function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL manquant");
  return url;
}

export function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY manquant");
  return key;
}

export function getSupabaseServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY manquant");
  return key;
}

export function getSiteUrl(): string {
  // Priorité au domaine public stable (webhooks Mollie, redirections paiement).
  // On évite VERCEL_URL (*.vercel.app) qui peut être bloqué par la protection
  // de déploiement et casser la livraison des webhooks / les cookies de session.
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_PUBLIC_SITE_URL;
  if (configured && !/localhost|127\.0\.0\.1/i.test(configured)) {
    return configured.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

/**
 * Origin pour les redirections Supabase Auth côté navigateur.
 * Utilise le domaine courant pour éviter un localhost figé au build.
 */
export function getAuthRedirectOrigin(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return getSiteUrl();
}

/** URL publique pour QR codes, liens d'inscription et documents client. */
export function getPublicSiteUrl(): string {
  const production = "https://moto.ridecloud.app";
  const configured =
    process.env.NEXT_PUBLIC_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL;
  if (configured && !/localhost|127\.0\.0\.1/i.test(configured)) {
    return configured.replace(/\/$/, "");
  }
  return production;
}

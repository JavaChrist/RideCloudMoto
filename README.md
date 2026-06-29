# RideCloudMoto

Carnet d'entretien numérique pour **motos et scooters** (PWA). Version dérivée de RideCloud, adaptée à un réseau concessionnaire mono-marque.

> Identité visible neutre (**RideCloudMoto**). Le moteur de données s'appuie sur la gamme **Voge** (motos + scooters), sans affichage de la marque tant que l'autorisation n'est pas accordée.

**URL de démo :** [ride-cloud-moto.vercel.app](https://ride-cloud-moto.vercel.app)

## Stack

- **Next.js 16** (App Router) · TypeScript · React 19
- **Supabase** (Postgres, Auth SSR PKCE, Storage, RLS)
- **TailwindCSS** + primitives shadcn/ui + Radix UI
- **Mollie** (abonnement Premium)
- **web-push** (VAPID) pour les rappels
- **Vitest** (tests logique métier)

## Particularités de cette version

| Domaine | Adaptation |
|---|---|
| Catégories | Motos + scooters uniquement |
| Catalogue | Gamme Voge (`vehicle-catalog.ts`) + fiches techniques + notices |
| Plan d'entretien | Templates **Voge codés en dur**, sans IA |
| Accès | **Code concessionnaire** (12 mois gratuits, 1 véhicule) **ou** abonnement **Premium** |
| Codes | Format **immatriculation SIV** `AB-123-CD` (souvent la plaque du véhicule livré) |
| Compte à rebours | Visible in-app pendant toute l'offre gratuite (alerte avant blocage) |
| Plans | Offre concessionnaire (gratuit limité) + Premium (pas de Family) |
| Admin | Génération / impression codes + QR + flyers (`/admin/dealer-codes`) |
| Retiré | Offre auto à l'inscription, programme Fondateurs, IA Mistral |

## Offre concessionnaire (logique métier)

1. Le concessionnaire **enregistre un code** (immatriculation ou code généré) via l'admin.
2. Le client s'inscrit avec ce code (`/register?code=AB-123-CD`) ou l'active dans **Paramètres**.
3. **12 mois d'accès gratuit** (1 véhicule) — compte à rebours affiché en permanence.
4. À l'échéance : **Premium obligatoire** pour conserver l'accès (sinon écran de blocage).

Fichiers clés :
- `src/lib/billing/dealer-activation.ts` — validation / consommation des codes
- `src/lib/billing/limits.ts` — `getUserPlanState`, `hasAccess`
- `src/components/billing/dealer-offer-countdown.tsx` — compte à rebours UI

## Flyer & marketing

| Fichier | Usage |
|---|---|
| `docs/flyer-concessionnaire.html` | Modèle source (impression / PDF) |
| `public/flyer-concessionnaire.html` | Flyer vierge en ligne (`/flyer-concessionnaire.html`) |
| `/admin/flyer?code=AB-123-CD` | Flyer personnalisé avec QR (admin) |

## Installation

```bash
# 1. Dépendances
pnpm install        # ou : npm install --legacy-peer-deps

# 2. Variables d'environnement
cp .env.example .env.local

# 3. Base Supabase
#    Nouveau projet  → supabase/schema.sql (une seule fois)
#    Projet existant → supabase/migrations/*.sql uniquement (ne pas relancer schema.sql)

# 4. Migration codes concessionnaire (SQL Editor)
#    supabase/migrations/20260629_dealer_activation_codes.sql

# 5. Auth Supabase → URL Configuration
#    Site URL      : http://localhost:3000
#    Redirect URLs : http://localhost:3000/auth/callback
#                    http://localhost:3000/reset-password

# 6. Clés VAPID (notifications push)
npx web-push generate-vapid-keys --json

# 7. Démarrer
pnpm dev
```

## Scripts

```bash
pnpm dev      # serveur de développement
pnpm build    # build production
pnpm start    # serveur production
pnpm test     # tests Vitest
pnpm lint     # ESLint
```

## Variables d'environnement clés

| Variable | Rôle |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Serveur (crons, codes concessionnaire, suppression compte) |
| `MOLLIE_API_KEY` | Paiements (`test_` en dev, `live_` en prod) |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | Web Push |
| `DEALER_FREE_PREMIUM_MONTHS` | Durée offre gratuite après activation code (défaut **12**) |
| `CRON_SECRET` | Protection des routes `/api/cron/*` |
| `ADMIN_EMAILS` | Emails autorisés sur `/admin/dealer-codes` |
| `NEXT_PUBLIC_SITE_URL` | URL publique (QR codes, liens d'inscription) |

## Structure notable

- `src/lib/billing/dealer-activation.ts` — codes format plaque, activation
- `src/lib/billing/dealer-countdown.ts` — calcul compte à rebours
- `src/app/(protected)/admin/dealer-codes/` — interface admin codes + QR
- `src/components/billing/dealer-offer-countdown.tsx` — bandeau compte à rebours
- `src/lib/data/maintenance-manufacturer-templates.ts` — entretien Voge
- `src/components/vehicles/technical-sheet.tsx` — fiche technique

## Déploiement

Vercel (région `cdg1`). Crons dans `vercel.json` :
- `0 8 * * *` → rappels push
- `0 2 * * *` → rétrogradation abonnements expirés

Webhook Mollie : `https://<domaine>/api/billing/webhook`

Voir aussi `docs/DEPLOY-VERCEL.md`.

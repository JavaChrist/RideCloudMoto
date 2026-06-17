# RideCloudMoto

Carnet d'entretien numérique pour **motos et scooters** (PWA). Version dérivée de RideCloud, adaptée à un réseau concessionnaire mono-marque.

> Identité visible neutre (**RideCloudMoto**). Le moteur de données s'appuie sur la gamme **Voge** (motos + scooters), sans affichage de la marque tant que l'autorisation n'est pas accordée.

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
| Catalogue | Gamme Voge (`src/lib/data/vehicle-catalog.ts`) avec fiches techniques + liens notices externes |
| Plan d'entretien | Templates **Voge codés en dur** (`maintenance-manufacturer-templates.ts`), sans IA |
| Abonnement | **12 mois Premium offerts** à l'inscription (`dealer_premium_until`), puis Premium payant Mollie |
| Plans | Free + Premium (pas de Family) |
| Nouveauté | Onglet **Fiche technique** par véhicule (specs + notice) |
| Retiré | Programme Fondateurs, génération IA Mistral |

## Installation

```bash
# 1. Dépendances (pnpm recommandé sur Windows si l'antivirus ralentit npm)
pnpm install        # ou : npm install --legacy-peer-deps

# 2. Variables d'environnement
cp .env.example .env.local   # puis remplir les valeurs

# 3. Base de données Supabase (SQL Editor)
#    - Coller supabase/schema.sql
#    - Puis supabase/migrations/20260617_indexes_and_backfill.sql

# 4. Auth Supabase → URL Configuration
#    Site URL        : http://localhost:3000
#    Redirect URLs   : http://localhost:3000/auth/callback
#                      http://localhost:3000/reset-password

# 5. Générer les clés VAPID (notifications push)
npx web-push generate-vapid-keys --json

# 6. Démarrer
pnpm dev   # http://localhost:3000
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
| `SUPABASE_SERVICE_ROLE_KEY` | Serveur uniquement (crons, suppression compte) |
| `MOLLIE_API_KEY` | Paiements (`test_` en dev, `live_` en prod) |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | Web Push |
| `DEALER_FREE_PREMIUM_MONTHS` | Durée de l'offre Premium offerte (défaut 12) |
| `CRON_SECRET` | Protection des routes `/api/cron/*` |
| `ADMIN_EMAILS` | Emails administrateurs |

## Structure

Voir l'arborescence dans `readmeNew.md` (document d'architecture source). Points notables propres à cette version :

- `src/lib/data/vehicle-catalog.ts` — catalogue Voge + specs + notices
- `src/lib/data/maintenance-manufacturer-templates.ts` — plans d'entretien Voge
- `src/lib/billing/limits.ts` — logique offre concessionnaire (`getUserPlanState`)
- `src/components/vehicles/technical-sheet.tsx` — onglet Fiche technique

## Déploiement

Vercel (région `cdg1`). Crons configurés dans `vercel.json` :
- `0 8 * * *` → rappels d'entretien push
- `0 2 * * *` → rétrogradation des abonnements expirés

Configurer le webhook Mollie : `https://<domaine>/api/billing/webhook`.

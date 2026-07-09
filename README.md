# RideCloudMoto

Carnet d'entretien numérique pour **motos et scooters** (PWA). Version dérivée de RideCloud, pensée pour un modèle **B2B2C** : les concessionnaires distribuent l'application à leurs clients et deviennent des partenaires de la plateforme.

> Identité visible neutre (**RideCloudMoto**). Le moteur de données s'appuie sur la gamme **Voge** (motos + scooters), sans affichage de la marque tant que l'autorisation n'est pas accordée. Chaque concessionnaire peut appliquer sa propre couleur.

**Production :** [moto.ridecloud.app](https://moto.ridecloud.app)

## Stack

- **Next.js 16** (App Router) · TypeScript · React 19
- **Supabase** (Postgres, Auth SSR PKCE, Storage, RLS)
- **TailwindCSS** + primitives shadcn/ui + Radix UI
- **Mollie** (abonnement Premium)
- **web-push** (VAPID) pour les rappels
- **Vitest** (tests logique métier)

## Modèle B2B2C — vue d'ensemble

| Acteur | Rôle | Accès |
|---|---|---|
| **Client** | Propriétaire d'un deux-roues | App (garage, entretien, documents) |
| **Concessionnaire** | Distribue l'app, enregistre les ventes, fidélise | Portail `/portail` (compte e-mail dédié) |
| **Admin plateforme** | Gère les concessionnaires et les codes | `/admin/*` (e-mails autorisés) |

Le changement clé par rapport à la version B2C : les concessionnaires **apportent les utilisateurs** et disposent d'un espace pro en self-service.

## Particularités de cette version

| Domaine | Adaptation |
|---|---|
| Catégories | Motos + scooters uniquement |
| Catalogue | Gamme Voge (`vehicle-catalog.ts`) + fiches techniques + notices |
| Plan d'entretien | Templates **Voge codés en dur**, sans IA |
| Accès | **Code concessionnaire** (offre gratuite, 1 véhicule) **ou** abonnement **Premium** |
| Codes | Format **immatriculation SIV** `AB-123-CD` (souvent la plaque du véhicule livré) |
| Multi-partenaires | Table `dealers` : logo, couleurs, coordonnées, horaires, marques, durée d'offre |
| Portail concessionnaire | `/portail` : enregistrer une vente, suivre et **prolonger** les licences |
| Personnalisation | La couleur du concessionnaire remplace le doré dans l'app du client |
| Carte concessionnaire | Page `/mon-concessionnaire` (adresse, GPS, RDV, promos, horaires) |
| Mode lecture seule | À la fin de l'offre : consultation/export conservés, écritures bloquées |
| Cross-sell | Promotion discrète de RideCloud (voitures, utilitaires…) |
| Admin | Concessionnaires + équipes + codes + QR + flyers (`/admin/*`) |

## Accès & cycle de vie de l'offre

1. Le concessionnaire **enregistre une vente** (immatriculation) depuis son portail `/portail` (ou l'admin plateforme).
2. Le client s'inscrit avec ce code (`/register?code=AB-123-CD`) ou l'active dans **Paramètres** ; il est automatiquement **rattaché à sa concession**.
3. **Accès gratuit** (1 véhicule) pendant la durée définie par le concessionnaire (défaut 12 mois) — compte à rebours affiché en permanence.
4. Le concessionnaire peut **prolonger** la licence (fidélisation, ex. après une révision).
5. À l'échéance : bascule en **lecture seule** (l'historique reste consultable/exportable) ; le **Premium** rétablit l'écriture et lève la limite de véhicules.

## Rôles & routage

- **Client** → `/categories` (garage).
- **Concessionnaire** (compte présent dans `dealer_users`) → `/portail`.
- **Admin** (`ADMIN_EMAILS`) → `/admin/dealer-codes`.

Le routage par rôle est centralisé dans `src/app/post-login/page.tsx` et `src/app/auth/callback/route.ts`.

## Fichiers clés

| Domaine | Fichier |
|---|---|
| Droits / plan / lecture seule | `src/lib/billing/limits.ts` (`getUserPlanState`) |
| Garde d'écriture (lecture seule) | `src/lib/billing/write-guard.ts` |
| Codes concessionnaire | `src/lib/billing/dealer-activation.ts` (activation, prolongation) |
| Concessionnaire (data) | `src/lib/dealer/dealer-info.ts`, `src/lib/dealer/membership.ts` |
| Branding partenaire | `src/lib/dealer/branding.ts` (hex → HSL) |
| Compte à rebours | `src/components/billing/dealer-offer-countdown.tsx` |
| Portail concessionnaire | `src/app/(dealer)/portail/*` |
| Carte concessionnaire | `src/app/(protected)/mon-concessionnaire/page.tsx` |
| Admin concessionnaires | `src/app/(protected)/admin/dealers/*` |

## Base de données (tables principales)

- `profiles` — utilisateur + facturation + `dealer_id` (concession d'origine).
- `vehicles`, `maintenance_plan_entries`, `maintenance_entries`, `upcoming_maintenance`, `modifications`, `documents`.
- `dealers` — concessionnaires (branding, coordonnées, horaires, marques, `offer_months`).
- `dealer_promotions` — promotions affichées sur la carte concessionnaire.
- `dealer_users` — comptes rattachés à un concessionnaire (rôle `owner`/`staff`).
- `dealer_activation_codes` — codes/immatriculations + infos client + `dealer_id`.
- `push_subscriptions`, `notification_log`.

## Documentation & marketing

| Fichier | Usage |
|---|---|
| `docs/Guide-Concessionnaire.md` | Guide d'utilisation du portail concessionnaire |
| `docs/Guide-Utilisateur.md` | Guide d'utilisation client (installation, entretien, exports) |
| `public/flyer.html` | **Flyer au design de l'app avec QR dynamique** (`/flyer.html`) |
| `public/flyer-concessionnaire.html` | Flyer vierge (`/flyer-concessionnaire.html`) |
| `/admin/flyer?code=AB-123-CD` | Flyer personnalisé avec QR (admin) |
| `docs/RideCloudMoto-Product-Sheet.md` | Fiche produit |

## Installation

```bash
# 1. Dépendances
pnpm install        # ou : npm install --legacy-peer-deps

# 2. Variables d'environnement
cp .env.example .env.local

# 3. Base Supabase
#    Nouveau projet  → supabase/schema.sql (une seule fois)
#    Projet existant → supabase/migrations/*.sql uniquement (ne pas relancer schema.sql)

# 4. Migrations à appliquer (dans l'ordre, SQL Editor ou CLI)
#    20260629_dealer_activation_codes.sql
#    20260630_dealer_codes_customer_info.sql
#    20260708_dealers_and_partners.sql      (multi-partenaires)
#    20260708_dealer_users.sql              (comptes concessionnaire)

# 5. Auth Supabase → URL Configuration
#    Site URL      : http://localhost:3000
#    Redirect URLs : http://localhost:3000/auth/callback
#                    http://localhost:3000/reset-password
#    (Invitations d'équipe concessionnaire : SMTP à configurer)

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
| `SUPABASE_SERVICE_ROLE_KEY` | Serveur (crons, codes, portail concessionnaire, suppression compte) |
| `MOLLIE_API_KEY` | Paiements (`test_` en dev, `live_` en prod) |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | Web Push |
| `DEALER_FREE_PREMIUM_MONTHS` | Durée offre gratuite par défaut (défaut **12**, surchargée par `dealers.offer_months`) |
| `CRON_SECRET` | Protection des routes `/api/cron/*` |
| `ADMIN_EMAILS` | Emails autorisés sur `/admin/*` |
| `NEXT_PUBLIC_SITE_URL` | URL publique (QR codes, liens d'inscription) |
| `NEXT_PUBLIC_RIDECLOUD_URL` | Lien de cross-sell RideCloud (défaut `https://ridecloud.app`) |

## Déploiement

Vercel (région `cdg1`). Crons dans `vercel.json` :
- `0 8 * * *` → rappels push
- `0 2 * * *` → rétrogradation abonnements expirés

Webhook Mollie : `https://<domaine>/api/billing/webhook`

Voir aussi `docs/DEPLOY-VERCEL.md`.

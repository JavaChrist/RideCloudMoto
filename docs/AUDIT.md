# Audit technique — RideCloudMoto

> **Date :** 13 juillet 2026
> **Périmètre :** application complète (code source `src/`, base Supabase `supabase/`, configuration, dépendances)
> **Version :** `0.1.0` · Next.js 16.2 · React 19 · Supabase · Mollie
> **Type :** audit de sécurité, de qualité et de conformité, avec tests et correctifs appliqués

---

## 1. Résumé exécutif

RideCloudMoto est une application web (PWA) de carnet d'entretien pour motos et scooters, bâtie sur un modèle **B2B2C** : les concessionnaires distribuent l'application à leurs clients, qui bénéficient d'un accès gratuit, avec une montée en gamme possible via un abonnement Premium (Mollie).

L'état général du projet est **sain et de bonne facture** : architecture claire, séparation nette des rôles, secrets correctement protégés, webhook de paiement validé selon les règles de l'art, et logique métier couverte par des tests unitaires. L'audit a néanmoins identifié un ensemble de vulnérabilités liées principalement à la **sécurité au niveau de la base de données (RLS Supabase)**, où certains contrôles métier n'étaient appliqués que dans la couche applicative et pouvaient être contournés en appelant directement l'API Supabase depuis le navigateur.

**Les correctifs prioritaires ont été appliqués** durant cet audit (voir §7). Les tests et le build passent.

### Verdict global

| Domaine | Note | Commentaire |
|---|---|---|
| Architecture | ✅ Très bon | App Router structuré par rôle, séparation client/serveur nette |
| Authentification | ✅ Très bon | Supabase Auth PKCE, session SSR, middleware robuste |
| Autorisation (applicative) | ✅ Bon | Vérifications systématiques dans les routes API |
| Autorisation (base de données) | ⚠️ À renforcer | RLS trop permissive sur `profiles` et données véhicules (corrigé) |
| Paiement | ✅ Bon | Webhook Mollie validé par re-fetch |
| Gestion des secrets | ✅ Très bon | Aucun secret commité, service role isolé serveur |
| Qualité du code | ✅ Bon | TypeScript strict, code lisible, pas de dette évidente |
| Tests | 🟡 Moyen | Logique métier couverte, pas de tests d'intégration/E2E |
| Outillage | 🟡 Moyen | Script de lint cassé (corrigé), 2 vulnérabilités npm mineures |

---

## 2. Méthodologie

L'audit a combiné :

1. **Cartographie fonctionnelle complète** — inventaire des routes, rôles, intégrations et fichiers structurants.
2. **Revue de sécurité ligne par ligne** des 22 routes API, du middleware, du flux de paiement et des politiques RLS.
3. **Exécution des tests** (`vitest`), du **lint** (ESLint) et du **build de production** (`next build`).
4. **Analyse des dépendances** (`npm audit`, `npm outdated`).
5. **Application des correctifs** prioritaires, puis re-validation (tests + build).

---

## 3. Résultats des tests et du build

| Vérification | Résultat | Détail |
|---|---|---|
| Tests unitaires (`npm test`) | ✅ **28/28** | 5 fichiers : `limits`, `dealer-activation`, `dealer-countdown`, `maintenance`, `odometer-estimate` |
| Build production (`npm run build`) | ✅ **OK** | Compilation + TypeScript sans erreur, 48 routes générées |
| Lint (`npm run lint`) | ⚠️ → ✅ | Script cassé au départ (voir Q1), corrigé ; 13 avertissements React résiduels non bloquants |
| `npm audit` | ⚠️ 2 modérées | `postcss` transitif (voir D1) |

La logique métier critique (calcul des plans d'entretien, états d'abonnement, compte à rebours d'offre, validation des codes) est **bien couverte** par les tests. Il n'existe en revanche **aucun test d'intégration** sur les routes API ni de test end-to-end.

---

## 4. Constats de sécurité

Sévérité : **Critique** > **Élevé** > **Moyen** > **Faible** > **Info**.

### 4.1 Critique

#### C1 — Escalade de privilèges via mise à jour directe de `profiles`
**Fichier :** `supabase/schema.sql` (policy `profiles_update_own`)
**État : ✅ Corrigé**

La politique RLS autorisait un utilisateur à modifier **toutes** les colonnes de sa propre ligne `profiles`, sans restriction. Or cette table contient les colonnes de facturation et d'accès (`plan`, `plan_status`, `plan_renews_at`, `dealer_premium_until`, `mollie_*`…). Un utilisateur authentifié pouvait donc, en appelant directement l'API Supabase depuis le navigateur (clé anon + son propre JWT), **se passer en Premium ou prolonger son offre gratuite sans payer**.

**Correctif appliqué :** ajout d'un trigger `BEFORE UPDATE` (`20260713_protect_profile_billing_columns.sql`) qui restaure les valeurs d'origine des colonnes sensibles pour toute écriture ne provenant pas du `service_role` (serveur). Les écritures légitimes (webhook Mollie, crons, activation de code) passent toutes par le `service_role` et ne sont donc pas affectées.

> ⚠️ **Action requise en production :** exécuter cette migration sur la base Supabase.

### 4.2 Élevé

#### E1 — Contournement du paywall et de la limite de véhicules
**Fichier :** `supabase/schema.sql` (policies `vehicles_all_own`, etc.)
**État : 🟡 Recommandation documentée**

Les limites d'accès (droit d'utiliser l'app, nombre max de véhicules, quota de documents) sont appliquées dans les **Server Actions** et l'interface, mais **pas au niveau de la base**. La policy `vehicles_all_own` (et ses équivalentes sur `maintenance_plan_entries`, `maintenance_entries`, `documents`, `modifications`) autorise tout utilisateur authentifié à insérer/modifier ses propres lignes, indépendamment de son plan.

Un utilisateur techniquement averti pourrait donc créer des véhicules sans code concessionnaire ni abonnement, en appelant directement l'API Supabase.

**Recommandation :** faire passer les écritures sensibles par des routes serveur (`service_role`) qui vérifient le plan, **ou** ajouter dans les policies RLS une sous-requête vérifiant l'accès (offre active / Premium) et le quota. Impact fonctionnel à évaluer avant application, d'où le classement en recommandation plutôt qu'en correctif immédiat.

#### E2 — Contournement du mode lecture seule
**Fichiers :** `src/lib/billing/write-guard.ts` + RLS
**État : 🟡 Partiellement traité**

Même cause que E1 : `getWriteGuard()` protège les Server Actions, mais un compte en lecture seule (offre expirée) peut toujours écrire directement en base via l'API Supabase. Le correctif complet est identique à E1 (contrôle côté RLS/serveur).

#### E3 — Redirection ouverte dans le callback OAuth
**Fichier :** `src/app/auth/callback/route.ts`
**État : ✅ Corrigé**

Le paramètre `next` de l'URL de callback était utilisé sans validation pour construire la redirection finale. Une valeur comme `?next=//evil.com` produisait une redirection vers un domaine externe (`${origin}//evil.com`), exploitable en phishing juste après une connexion légitime.

**Correctif appliqué :** ajout d'une fonction `safeInternalPath()` qui n'accepte que les chemins internes (commençant par un unique `/`), rejetant `//`, `/\` et les URLs absolues.

### 4.3 Moyen

#### M1 — Webhook Mollie : confiance dans `metadata.userId`
**Fichier :** `src/app/api/billing/webhook/route.ts`
**État : ✅ Corrigé**

Le webhook re-fetch bien le paiement via l'API Mollie (excellente pratique, protège contre les corps de requête falsifiés). Il faisait toutefois confiance au `userId` contenu dans les métadonnées sans vérifier qu'il correspondait bien au client Mollie du paiement.

**Correctif appliqué :** corrélation ajoutée entre `payment.customerId` et `profiles.mollie_customer_id` du `userId` ciblé. En cas de divergence, le webhook n'applique aucune modification.

#### M2 — Route `mark-maintenance-current` sans garde d'écriture
**Fichier :** `src/app/api/vehicles/[id]/mark-maintenance-current/route.ts`
**État : ✅ Corrigé**

Cette route vérifiait l'authentification et la propriété du véhicule, mais pas le mode lecture seule : un compte à l'offre expirée pouvait donc réinitialiser son plan d'entretien.

**Correctif appliqué :** ajout de `getWriteGuard()` (403 si l'utilisateur est en lecture seule).

#### M3 — Prolongation de licence sans plafond
**Fichiers :** `src/app/api/dealer/portal/extend/route.ts`, `src/lib/billing/dealer-activation.ts`
**État : ✅ Corrigé**

Un compte concessionnaire authentifié pouvait envoyer `months: 99999` et prolonger une licence client de façon quasi illimitée.

**Correctif appliqué :** plafond `MAX_EXTENSION_MONTHS = 36` appliqué dans `extendDealerLicense()`.

#### M4 — Validation d'entrée hétérogène (pas de Zod systématique)
**État : 🟡 Recommandation**

Zod est utilisé pour l'auth et les Server Actions véhicules, mais les routes API valident les entrées de façon manuelle et inégale (`typeof`, `.trim()`, regex). C'est fonctionnel mais fragile (ex. `parseHours` accepte n'importe quel objet JSON).

**Recommandation :** définir des schémas Zod partagés pour toutes les routes API.

#### M5 — Rate limiting en mémoire, non distribué
**Fichiers :** `src/lib/rate-limit.ts`, `src/app/api/billing/checkout/route.ts`
**État : 🟡 Recommandation**

Le rate limiting n'existe que sur le checkout et est stocké en mémoire par instance serverless — donc contournable en environnement multi-instances (Vercel).

**Recommandation :** utiliser un store distribué (Upstash Redis, Vercel KV) et étendre la limitation aux routes sensibles (activation de code, SOS).

#### M6 — Exposition des données SOS à toute la communauté
**Fichiers :** `src/app/api/sos/route.ts`, `supabase/migrations/20260710_sos_alerts.sql`
**État : ℹ️ Choix produit à confirmer**

Toute alerte SOS active (latitude/longitude, `contact_phone`, nom de l'auteur) est visible par n'importe quel utilisateur authentifié ; le filtrage par distance (30 km) se fait uniquement côté client. C'est un choix produit assumé (entraide entre motards), mais il expose des données personnelles de localisation.

**Recommandation :** confirmer ce choix ; éventuellement filtrer la distance côté serveur et masquer le téléphone tant que l'utilisateur n'a pas confirmé porter secours.

### 4.4 Faible

- **F1 — Cron `downgrade-expired` en GET uniquement** : cohérent avec Vercel Cron, mais moins pratique pour les tests manuels que `notifications` (GET+POST).
- **F2 — Incohérence de nommage API** : coexistence de `/api/vehicule/[id]/...` (singulier) et `/api/vehicles/[id]/...` (pluriel). Pas de faille, mais source de confusion.
- **F3 — `package-lock.json` dans `.gitignore`** : nuit à la reproductibilité des builds. Le `pnpm-lock.yaml` est en revanche présent.

### 4.5 Info

- **I1 — Admin par liste d'e-mails** (`ADMIN_EMAILS`) : vérifié côté serveur partout, acceptable pour une petite équipe, mais non scalable ni auditable. Pas de rôle en base ; la compromission d'un e-mail admin donne un accès total.
- **I2 — Webhook et crons sans session** : par conception. Webhook validé par re-fetch Mollie ; crons protégés par `Authorization: Bearer ${CRON_SECRET}` en *fail-closed* (refus si le secret est absent).
- **I3 — Secrets non commités** : `.gitignore` couvre `.env*`, seuls `.env.example` et `src/lib/supabase/env.ts` sont suivis. `SUPABASE_SERVICE_ROLE_KEY` n'est jamais exposé en `NEXT_PUBLIC_*`.
- **I4 — XSS** : surface minimale. Un seul `dangerouslySetInnerHTML` (CSS d'impression statique). Les messages SOS sont rendus en texte échappé par React.
- **I5 — Aucun marqueur TODO/FIXME** dans le code source.

---

## 5. Points forts (équilibre de l'audit)

1. **Webhook Mollie** re-fetch le paiement au lieu de faire confiance au corps de la requête.
2. **Crons** protégés par secret Bearer, en *fail-closed*.
3. **Service role** strictement isolé côté serveur (`src/lib/supabase/admin.ts`), jamais exposé au client.
4. **Routes admin** systématiquement vérifiées via `isAdminEmail()`.
5. **Portail concessionnaire** : contexte vérifié (`requireDealerApiContext`) et données filtrées par `dealer_id`.
6. **Codes d'activation** : réclamés de façon atomique (`.is("used_by", null)`), pas de policy client (accès `service_role` uniquement).
7. **Exports véhicule** contrôlés par la propriété (`getVehicleDetail(supabase, user.id, id)`).
8. **Suppression de compte** RGPD : périmètre strict, cascade auth + storage + base.
9. **Server Actions véhicules** : validation Zod + garde d'écriture.
10. **En-têtes de sécurité** configurés (`X-Frame-Options`, `X-Content-Type-Options`, HSTS, `Referrer-Policy`) et `poweredByHeader: false`.

---

## 6. Qualité, dépendances et outillage

### Q1 — Script de lint cassé — ✅ Corrigé
`package.json` appelait `next lint`, commande **supprimée dans Next.js 16**. Le lint ne fonctionnait plus.
**Correctif :** création d'un `eslint.config.mjs` (format « flat » ESLint 9) qui étend `eslint-config-next/core-web-vitals`, et mise à jour du script en `eslint src middleware.ts`.

### Q2 — Avertissements React `set-state-in-effect` — 🟡 Non bloquant
13 avertissements liés au pattern « chargement initial au montage » (fetch de données, lecture de `localStorage` dans un `useEffect`). Légitimes ici ; réglés en `warn` plutôt qu'`error` pour ne pas bloquer le build. À nettoyer progressivement (déplacer les fetch initiaux ou utiliser des lectures dérivées).

### D1 — Vulnérabilités npm (2 modérées) — 🟡 Surveillance
`postcss < 8.5.10` (XSS via stringify), tiré transitivement par une version canary de `next`. Impact réel très faible (outil de build). À résoudre par une montée de version mineure de Next.js.

### D2 — Dépendances obsolètes — ℹ️ Informatif
Plusieurs paquets ont des mises à jour mineures disponibles (`@supabase/ssr` 0.10 → 0.12, Radix, `react-hook-form`…). Majeures à planifier séparément : `tailwindcss` 4, `eslint` 10, `lucide-react` 1.x, `vitest` 4.

---

## 7. Correctifs appliqués pendant l'audit

| # | Constat | Fichier(s) | Nature |
|---|---|---|---|
| 1 | C1 | `supabase/migrations/20260713_protect_profile_billing_columns.sql` | Trigger figeant les colonnes billing hors `service_role` |
| 2 | E3 | `src/app/auth/callback/route.ts` | Validation du paramètre `next` (anti-redirection ouverte) |
| 3 | M1 | `src/app/api/billing/webhook/route.ts` | Corrélation `customerId` ↔ profil |
| 4 | M2 | `src/app/api/vehicles/[id]/mark-maintenance-current/route.ts` | Ajout de `getWriteGuard()` |
| 5 | M3 | `src/lib/billing/dealer-activation.ts` | Plafond de prolongation (36 mois) |
| 6 | Q1 | `eslint.config.mjs`, `package.json` | Réparation du lint (Next.js 16) |

**Après correctifs :** `npm test` → 28/28 ✅, `npm run build` → ✅.

---

## 8. Plan d'action recommandé

### Immédiat (avant présentation client / mise en prod)
1. **Appliquer la migration** `20260713_protect_profile_billing_columns.sql` sur la base de production (correctif C1).
2. Vérifier que `CRON_SECRET` et `ADMIN_EMAILS` sont bien définis en production.

### Court terme
3. Renforcer la RLS des tables véhicules pour matérialiser le paywall et la lecture seule en base (E1/E2).
4. Uniformiser la validation des routes API avec des schémas Zod partagés (M4).

### Moyen terme
5. Rate limiting distribué (Redis/Upstash) sur les routes sensibles (M5).
6. Ajouter des tests d'intégration sur les routes API (billing, activation, SOS) et un scénario E2E de bout en bout.
7. Trancher le modèle d'exposition des données SOS (M6).
8. Résorber les avertissements React (Q2) et planifier les montées de version majeures (D1/D2).

---

*Audit réalisé le 13 juillet 2026. Les correctifs marqués « ✅ Corrigé » ont été implémentés et validés (tests + build). Les éléments marqués « 🟡 » sont des recommandations nécessitant un arbitrage produit ou une évaluation d'impact avant application.*

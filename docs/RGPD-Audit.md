# Audit RGPD — RideCloudMoto

> **Date de l'audit** : Juin 2026
> **Périmètre** : Application web RideCloudMoto (Next.js 16, Supabase, Vercel)
> **Responsable de traitement** : JavaChrist (Grohens Christian, EI), SIRET 338 593 312 000 30
> **Auditeur** : Audit interne automatisé via revue de code et architecture

Ce document constitue l'**audit de minimisation et de conformité RGPD** des routes API,
des accès à la base de données et du traitement des données personnelles dans
RideCloudMoto. Il accompagne la Politique de confidentialité (`/confidentialite`) et la
page « Vos droits RGPD » (`/rgpd`).

> RideCloudMoto est une déclinaison de RideCloud dédiée aux **motos et scooters** (gamme
> Voge). Cette version **n'embarque pas d'IA** (les plans d'entretien sont des templates
> constructeur codés en dur), ce qui réduit le périmètre des sous-traitants.

---

## 1. Données personnelles traitées

| Catégorie | Donnée | Source | Finalité | Base légale |
|---|---|---|---|---|
| Identité | E-mail | Inscription | Authentification, communication | Contrat (CGU) |
| Identité | Nom complet (facultatif) | Inscription | Personnalisation | Contrat |
| Identité | Mot de passe (hashé par Supabase) | Inscription | Authentification | Contrat |
| Métier | Véhicules (moto/scooter), kilométrage, immatriculation, VIN | Saisie utilisateur | Service principal | Contrat |
| Métier | Entretiens, modifications, plans d'entretien | Saisie utilisateur | Service principal | Contrat |
| Métier | Photos de véhicule | Téléversement | Service principal | Contrat |
| Métier | Documents PDF / images (factures, cartes grises) | Téléversement | Service principal | Contrat |
| Facturation | Identifiants Mollie (customer, subscription, mandate) | Abonnement Premium | Gestion de l'abonnement | Contrat |
| Technique | Cookies de session Supabase | Connexion | Authentification | Cookies strictement nécessaires (CNIL) |
| Technique | Endpoint de notification push (VAPID) | Opt-in notifications | Rappels d'entretien | Consentement |
| Technique | IP + user-agent (logs Vercel / Supabase) | Requêtes HTTP | Sécurité, prévention de la fraude | Intérêt légitime |

> **Aucune donnée sensible** au sens de l'art. 9 RGPD (santé, opinions, biométrie, etc.) n'est traitée.

---

## 2. Authentification & isolation des données

### 2.1 Vérifications côté serveur

Toutes les routes API et les pages protégées appellent `supabase.auth.getUser()`
**avant** tout accès à la base. Aucune route ne se fie au cookie côté client.

| Route / fonction | Vérifie `getUser()` ? | Filtre `user_id` ? | Verdict |
|---|---|---|---|
| `GET /api/vehicule/[id]/export` | ✅ | ✅ `.eq("user_id", user.id)` | OK |
| `GET /api/vehicule/[id]/export-zip` | ✅ | ✅ | OK |
| `POST /api/vehicles/[id]/mark-maintenance-current` | ✅ | ✅ | OK |
| `POST /api/push/subscribe` / `unsubscribe` | ✅ | ✅ | OK |
| `POST /api/billing/checkout` / `cancel` / `sync` | ✅ | ✅ | OK |
| `POST /api/account/delete` | ✅ | ✅ (suppression scoped + résiliation Mollie) | OK |
| `GET /api/cron/*` | Bearer `CRON_SECRET` | service_role | OK |
| `GET /auth/callback` | N/A (handshake PKCE) | N/A | OK |
| Server Actions véhicules / entretiens | Via SSR `getUser()` | ✅ | OK |

**Conclusion : 100 % des accès aux données sont scopés au `user_id` authentifié.**

### 2.2 Middleware

Le middleware (`src/lib/supabase/middleware.ts`) protège `/categories`, `/vehicules`,
`/vehicule`, `/parametres` (redirige vers `/login`), redirige les utilisateurs connectés
hors des pages d'auth, et exclut volontairement `/reset-password` pour le flow de récupération.

### 2.3 Storage (fichiers)

- Bucket `ridecloudmoto-files` (documents) : **non public**, diffusion via **Signed URLs**
  d'1 minute, path préfixé par `${userId}/...` → isolation stricte par RLS.
- Bucket `vehicle-photos` (photos de véhicule) : **public en lecture seule** (les photos ne
  sont pas des données sensibles), écriture/suppression réservées au propriétaire via RLS
  (`(storage.foldername(name))[1] = auth.uid()::text`).

---

## 3. Minimisation (art. 5.1.c RGPD)

### 3.1 Collecte minimale à l'inscription

Champs requis : `email`, `password`, et un nom complet facultatif. Aucun téléphone, adresse
ou date de naissance n'est demandé.

### 3.2 Données envoyées à des tiers

- **Mollie** : uniquement l'e-mail et les identifiants techniques nécessaires à l'abonnement.
- **Aucun service d'IA** : cette version ne transmet aucune donnée à un LLM.

### 3.3 Logs serveur

Aucun `console.log` n'expose d'e-mail, de mot de passe ou de token. Les rares traces
(`console.error`) ne contiennent que des contextes techniques.

---

## 4. Droits des personnes (art. 15-22)

| Droit | Implémentation | Page utilisateur |
|---|---|---|
| Information (art. 13-14) | Politique de confidentialité publique | `/confidentialite` |
| Accès (art. 15) | Export JSON par véhicule | Fiche véhicule (bouton « Exporter ») |
| Rectification (art. 16) | Édition libre dans l'application | `/vehicule/[id]` |
| Effacement (art. 17) | Suppression définitive avec double confirmation | `/parametres` |
| Portabilité (art. 20) | Export JSON + ZIP (données + fichiers) | Fiche véhicule |
| Opposition (art. 21) | Cookies strictement nécessaires uniquement ; push sur opt-in | — |
| Procédure | Email `info@moto.ridecloud.app` | `/rgpd` |

**Délai de réponse** : < 1 mois (art. 12.3 RGPD). Export et suppression sont **immédiats**.

---

## 5. Cookies & traceurs

- **Cookies déposés** : uniquement les cookies de session Supabase (`sb-*`).
- **Aucun cookie publicitaire** ni analytique.
- **Bannière d'information** non bloquante (`CookieBanner`).

---

## 6. Sécurité (art. 32)

| Mesure | État |
|---|---|
| HTTPS forcé en production (Vercel) + HSTS | ✅ |
| Mots de passe hashés (Supabase) | ✅ |
| PKCE pour les flows e-mail (signup, reset) | ✅ |
| Service role key **jamais** exposée côté client | ✅ |
| Clé VAPID privée côté serveur uniquement | ✅ |
| Variables d'environnement séparées (`NEXT_PUBLIC_*` vs serveur) | ✅ |
| RLS activée sur toutes les tables | ✅ |
| Routes cron protégées par `CRON_SECRET` | ✅ |
| Rate limiting (checkout, actions sensibles) | ✅ (mémoire ; Redis recommandé à l'échelle) |
| MFA Supabase Dashboard côté admin | ⚠️ À activer manuellement |

---

## 7. Sous-traitants (art. 28)

| Sous-traitant | Rôle | Localisation | DPA |
|---|---|---|---|
| **Vercel Inc.** | Hébergement applicatif + CDN | Région UE (cdg1, Paris) — CCT + DPF | DPA Vercel |
| **Supabase Inc.** | Base de données, auth, stockage | UE | DPA Supabase |
| **Mollie B.V.** | Paiements récurrents SEPA + carte (Premium) | Pays-Bas (UE) | DPA Mollie |
| **Resend, Inc.** (si activé) | Envoi des e-mails transactionnels | UE | DPA Resend |

> **Aucun sous-traitant IA** dans cette version (contrairement à RideCloud qui utilisait Mistral).
> Les sous-traitants ayant un siège hors UE sont couverts par des CCT / Data Privacy Framework.

---

## 8. Spécificités RideCloudMoto

- **Offre Premium concessionnaire** : 12 mois Premium offerts à l'inscription
  (`profiles.dealer_premium_until`). Aucune donnée bancaire collectée tant que l'utilisateur
  ne souscrit pas à l'abonnement payant. Aucune donnée transmise à Mollie pendant la période offerte.
- **Marque** : la gamme de référence est Voge, mais aucune donnée n'est partagée avec le
  constructeur ; les libellés marque ne sont pas exposés publiquement tant que l'autorisation
  n'est pas accordée.
- **Notices techniques** : ce sont des **liens externes** ; aucune donnée personnelle n'y transite.

---

## 9. Non-conformités résiduelles & recommandations

### Bloquantes : **aucune** à ce stade.

### Recommandées
1. **Rate limiting distribué** (Upstash Redis) au-delà de 10k req/min.
2. **Journal d'audit** (table `audit_log`) pour les actions sensibles (suppression, export).
3. **MFA utilisateurs** (Supabase TOTP) — optionnel.
4. **`SELECT *` → sélections explicites** pour figer le contrat des données retournées.
5. **Mention DPO/contact** : `info@moto.ridecloud.app` (désignation d'un DPO non obligatoire
   tant que l'effectif < 250 personnes et sans traitement à grande échelle de données sensibles).

---

## 10. Registre des traitements (art. 30)

| ID | Traitement | Finalité | Personnes | Données | Destinataires | Conservation | Sécurité |
|---|---|---|---|---|---|---|---|
| T1 | Gestion des comptes | Authentification, CGU | Utilisateurs | E-mail, mot de passe hashé | Supabase, Resend | Compte actif | Hash, HTTPS, RLS |
| T2 | Suivi véhicules | Service principal | Utilisateurs | Véhicules, entretiens, photos, documents | Supabase Storage | Compte actif | Buckets privés/publics, signed URLs |
| T3 | Abonnement Premium | Facturation | Abonnés | E-mail, identifiants Mollie | Mollie | Durée légale comptable | TLS, webhooks |
| T4 | Notifications push | Rappels d'entretien | Opt-in | Endpoint push | Service push navigateur | Jusqu'au retrait du consentement | VAPID |

---

## 11. Synthèse

✅ **RideCloudMoto est conforme au RGPD pour un SaaS B2C/B2B2C de réseau concessionnaire.**

Tous les droits fondamentaux sont implémentés et exerçables sans intervention manuelle.
L'architecture respecte les principes de minimisation, de sécurité par défaut et de
transparence. Le retrait de l'IA réduit le périmètre des sous-traitants par rapport à RideCloud.

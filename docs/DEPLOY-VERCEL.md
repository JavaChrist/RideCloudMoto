# Déploiement RideCloudMoto sur Vercel

> Guide pas-à-pas pour mettre en production RideCloudMoto sur Vercel.
> À suivre dans l'ordre. Compter **30 à 45 minutes** la première fois.

---

## 0. Pré-requis

- [x] Code poussé sur GitHub (branche `main` à jour)
- [x] Compte Vercel (gratuit ou Pro) — https://vercel.com/signup avec votre compte GitHub
- [x] Accès au DNS de votre domaine (registrar de votre choix)
- [x] Clés Supabase à portée de main (Dashboard → Project Settings → API)
- [x] Clé Mollie (`live_…` pour la production) et clés VAPID générées

---

## 1. Importer le projet sur Vercel

1. https://vercel.com/new
2. **Import Git Repository** → sélectionnez `RideCloudMoto`
3. Vercel détecte automatiquement Next.js, framework preset = **Next.js**
4. **Root Directory** : laisser `./`
5. **Build & Output Settings** : laisser par défaut (`next build` / `.next`)
6. **Ne pas cliquer Deploy tout de suite** → configurer les variables d'env d'abord

---

## 2. Variables d'environnement

Dans la page d'import, section **Environment Variables**, ajoutez :

| Nom | Valeur | Environnements |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://oqfplbrkaxkeyvhjegtf.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_…` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ…` (clé service_role — **secret**) | Production uniquement |
| `MOLLIE_API_KEY` | `live_…` (prod) / `test_…` (preview) | Production / Preview |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | `B…` | Production, Preview, Development |
| `VAPID_PRIVATE_KEY` | `…` (**secret**) | Production, Preview |
| `VAPID_CONTACT_EMAIL` | `mailto:support@ridecloudmoto.fr` | Production, Preview, Development |
| `CRON_SECRET` | `…` (`openssl rand -hex 32`) | Production |
| `ADMIN_EMAILS` | `admin@votre-domaine.fr` | Production, Preview |
| `DEALER_FREE_PREMIUM_MONTHS` | `12` (optionnel) | Production, Preview, Development |
| `NEXT_PUBLIC_SITE_URL` | `https://votre-domaine` (PAS localhost) | Production, Preview |

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` et `VAPID_PRIVATE_KEY` ne doivent JAMAIS être exposées
> côté client. Vercel les garde côté serveur tant que leur nom ne commence pas par `NEXT_PUBLIC_`.
>
> ℹ️ Pas de variable Mistral : cette version n'utilise pas d'IA (plans d'entretien Voge codés en dur).

Cliquez **Deploy**. Le premier build prend 2-3 minutes.

---

## 3. Configurer le domaine personnalisé

Une fois le premier déploiement réussi (sur `ridecloudmoto.vercel.app`) :

1. **Project Settings → Domains → Add**
2. Saisir votre domaine → **Add**
3. Suivez les instructions DNS de Vercel :
   - **Apex** : enregistrement `A` vers `76.76.21.21`
   - **www** : `CNAME` vers `cname.vercel-dns.com.`
4. Propagation : 5 à 30 minutes (jusqu'à 24 h en théorie). La pastille devient **verte**
   dans Vercel quand le DNS est OK. Vercel émet automatiquement un certificat TLS.

---

## 4. Configurer Supabase pour la production

### 4.1 Site URL & Redirect URLs

Supabase Dashboard → **Authentication → URL Configuration** :

- **Site URL** : `https://votre-domaine`
- **Redirect URLs** (ajoutez TOUTES ces entrées) :
  - `https://votre-domaine/auth/callback`
  - `https://votre-domaine/reset-password`
  - `http://localhost:3000/auth/callback` (dev local)
  - `https://*.vercel.app/auth/callback` (Preview deployments)

### 4.2 SMTP (recommandé : Resend)

**Project Settings → Authentication → SMTP Settings** :

- **Host** : `smtp.resend.com` · **Port** : `465` · **Username** : `resend`
- **Password** : votre `RESEND_API_KEY`
- **Sender** : `noreply@votre-domaine` / `RideCloudMoto`

### 4.3 Schéma & Storage

- Le schéma SQL (`supabase/schema.sql`) et les migrations (`supabase/migrations/`)
  doivent être appliqués sur le projet de production (SQL Editor ou CLI).
- Vérifier que les buckets `ridecloudmoto-files` (privé) et `vehicle-photos` (public)
  existent (Dashboard → Storage).

---

## 5. Configurer le webhook Mollie

Dashboard Mollie → **Développeurs → Webhooks** (ou via l'API) :

- URL du webhook d'abonnement : `https://votre-domaine/api/billing/webhook`

> En local, le webhook n'est pas appelable par Mollie ; le bouton **« Synchroniser »**
> dans `/parametres` sert de filet de sécurité.

---

## 6. Vérifications post-déploiement

1. **Ouvrez `https://votre-domaine`** → la landing RideCloudMoto s'affiche.
2. **Créez un compte test** → vérifiez la réception du mail de confirmation.
3. **Confirmez l'e-mail** → arrivée sur `/categories` avec **Premium offert 12 mois** actif.
4. **Ajoutez une moto/scooter Voge** → le plan d'entretien se génère, la fiche technique se remplit.
5. **`/parametres`** → testez « Supprimer mon compte » (RGPD art. 17).
6. **Headers de sécurité** :
   ```bash
   curl -sI https://votre-domaine | grep -iE "strict-transport|x-frame|content-type|referrer"
   ```

---

## 7. Crons Vercel

Définis dans `vercel.json` :

| Cron | Schedule | Rôle |
|---|---|---|
| `/api/cron/notifications` | `0 8 * * *` | Rappels d'entretien push (08h00 UTC) |
| `/api/cron/downgrade-expired` | `0 2 * * *` | Rétrogradation des abonnements expirés (02h00 UTC) |

Les crons envoient `Authorization: Bearer $CRON_SECRET` → la variable `CRON_SECRET`
doit être définie côté Vercel (sinon réponse 401).

---

## 8. Workflow de mise à jour

Tout push sur `main` déclenche un build + déploiement production (région `cdg1`).
Les pull requests sont déployées en **Preview** sur des URLs temporaires.

---

## 9. Rollback

1. Vercel → Project → Deployments
2. Trouvez le déploiement précédent (`✓ Ready`)
3. `⋯` → **Promote to Production** (instantané, sans rebuild)

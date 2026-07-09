# RideCloudMoto — Product Sheet

> Le carnet d'entretien intelligent de votre moto et de votre scooter, dans le cloud.

---

## 1. Informations générales

| Champ | Valeur |
| --- | --- |
| Nom de l'application | RideCloudMoto |
| Type d'application | SaaS web responsive + PWA installable |
| Catégorie | Productivité / Moto & Scooter / Lifestyle |
| Langue | Français (FR) |
| Statut du projet | En développement / pré-production |
| Plateformes | Web (desktop), Mobile (PWA iOS/Android), Tablette |
| Domaine | à définir (DNS + TLS automatique Vercel) |
| Modèle économique | Premium offert 12 mois par le concessionnaire, puis Freemium (Mollie) |
| Hébergement | Vercel (frontend, EU) + Supabase (DB, EU) |
| IA embarquée | Aucune — plans d'entretien constructeur codés en dur |
| Marque de référence | Voge (interne ; libellés non exposés publiquement) |

### Description courte

RideCloudMoto centralise la vie, l'entretien et les coûts de votre moto ou scooter dans un
carnet numérique, avec un plan d'entretien adapté à votre modèle et accessible partout.

### Description détaillée

RideCloudMoto est une plateforme web et PWA en français, dérivée de RideCloud, **dédiée aux
deux-roues** (motos et scooters). Elle remplace les carnets d'entretien papier, les classeurs
de factures et les rappels manuels. L'application centralise l'historique complet de chaque
véhicule (entretiens, modifications, documents, coûts) et **génère automatiquement un plan
d'entretien constructeur** selon le modèle et l'usage — sans recourir à une IA : les règles
sont des templates Voge codés en dur (vidange, chaîne / courroie de variateur, plaquettes,
liquides, soupapes, etc.).

Chaque utilisateur dispose d'un espace sécurisé où il peut :

- suivre plusieurs deux-roues en parallèle (1 en Gratuit, jusqu'à 20 en Premium),
- consulter la **fiche technique** de son modèle et sa **notice** (lien externe),
- recevoir des rappels et des **notifications push**,
- mettre à jour le compteur kilométrique à tout moment,
- visualiser ses coûts (mois / année / total / coût au km),
- exporter son dossier véhicule en JSON, ZIP ou PDF,
- ajouter des photos de son véhicule,
- archiver ses documents (carte grise, assurance, factures),
- supprimer son compte et toutes ses données en 1 clic (RGPD by design).

### Statut du projet

- **Phase actuelle** : développement / intégration concessionnaire.
- **Couverture fonctionnelle** : authentification PKCE, CRUD complet motos/scooters, plan
  d'entretien constructeur, fiches techniques & notices, exports, notifications push,
  abonnement Mollie avec **offre Premium 12 mois offerte**, conformité RGPD complète.
- **Prochaine étape** : déploiement, branding final Voge (sous réserve d'autorisation), onboarding réseau.

---

## 2. Positionnement produit

### Vision du produit

Devenir le carnet d'entretien numérique de référence des deux-roues d'un réseau concessionnaire
— celui qui suit la moto ou le scooter toute sa vie et fidélise le client à l'atelier.

### Objectif principal

Permettre à n'importe quel propriétaire de moto/scooter, sans expertise mécanique, de **savoir
exactement ce que son véhicule a vécu, ce qu'il doit faire, et combien il lui coûte**, en
quelques secondes par jour.

### Problèmes résolus

- **Perte d'historique** : factures perdues, carnet papier oublié.
- **Oubli des entretiens** : pas de rappels adaptés au modèle ni à l'usage.
- **Manque de visibilité financière** : coût réel inconnu.
- **Revente dévalorisée** : sans dossier propre, le deux-roues perd de la valeur.
- **Documentation dispersée** : notice et fiche technique introuvables au bon moment.

### Valeur ajoutée

- **Plan d'entretien constructeur** précis (intervalles Voge) ajusté à l'usage.
- **Fiche technique + notice** intégrées à chaque véhicule.
- **Spécialisation deux-roues** : motos + scooters, transmission chaîne et variateur CVT gérées.
- **Notifications push** de rappel.
- **Export / import portable** : l'utilisateur reste propriétaire de ses données.
- **PWA installable** : zéro friction, pas de store.
- **UI premium en français** aux couleurs de la marque (jaune / noir).
- **Offre concessionnaire** : 12 mois Premium offerts, fidélisation.
- **Conformité RGPD bout-en-bout** (sans sous-traitant IA).

### Différenciation

| Critère | RideCloudMoto | Apps concurrentes | Carnet papier / Excel |
| --- | --- | --- | --- |
| Plan d'entretien par modèle | Oui (templates constructeur) | Rare / générique | Non |
| Fiche technique + notice | Oui | Non | Non |
| Spécifique moto + scooter (CVT) | Oui | Partiel | Manuel |
| Notifications push | Oui | Basique | Non |
| Export ZIP / PDF / JSON | Oui | Très limité | Non |
| PWA sans store | Oui | Non | — |
| UI moderne, premium, française | Oui | UI vieillissante | — |
| KPI coûts (mois / an / total / km) | Oui | Partiel | Non |
| Offre Premium offerte par le concessionnaire | Oui (12 mois) | Non | — |
| Conformité RGPD totale | Oui | Variable | — |

---

## 3. Cible utilisateur

### Utilisateurs principaux

1. **Clients du réseau concessionnaire** ayant acheté une moto ou un scooter.
2. **Motards urbains et routiers** attachés à l'entretien.
3. **Scootéristes** (déplacements quotidiens) cherchant la simplicité.
4. **Acheteurs d'occasion** voulant repartir d'un dossier propre.

### Personas

**Persona 1 — Thomas, 34 ans** : possède une moto trail récente, méticuleux, veut des rappels
fiables et un dossier propre pour la revente.

**Persona 2 — Léa, 28 ans** : roule en scooter tous les jours, oublie ses vidanges, veut des
notifications automatiques et la notice à portée de main.

**Persona 3 — Sophie, 31 ans** : vient d'acheter une moto d'occasion à 50 000 km, veut un
dossier propre dès l'achat sans tâches en retard fictives.

### Besoins

- Centraliser son ou ses deux-roues.
- Ne plus rien oublier (vidange, chaîne/CVT, plaquettes, contrôle technique).
- Avoir un historique complet et exportable.
- Visualiser ses dépenses réelles.
- Accéder à la fiche technique et à la notice.
- Maîtriser ses données (export / suppression en 1 clic).

### Cas d'utilisation

1. **Onboarding** : "J'ajoute ma moto, le plan d'entretien se génère automatiquement."
2. **Quotidien** : "Je reçois une notification : plaquettes à contrôler bientôt."
3. **Fiche technique** : "Je consulte la cylindrée, les pneus et la capacité d'huile de mon modèle."
4. **Mise à jour compteur** : "Je saisis mes 15 230 km, les échéances se recalculent."
5. **Achat d'occasion** : "Le plan démarre depuis mon kilométrage actuel."
6. **Après un passage à l'atelier** : "J'ajoute la facture, je marque la vidange comme effectuée."
7. **Revente** : "J'exporte le dossier complet en PDF + ZIP."
8. **Sortie du service** : "Je supprime mon compte en 1 clic (RGPD art. 17)."

---

## 4. Fonctionnalités

### Authentification & comptes
- Auth Supabase **PKCE** (`@supabase/ssr`) : login, register, mot de passe oublié, reset.
- Acceptation CGU/RGPD obligatoire à l'inscription.
- Confirmation e-mail (SMTP, Resend recommandé).
- Filets de sécurité : `ensureProfile()` + trigger SQL `handle_new_user` (création profil +
  **offre Premium 12 mois**).

### Véhicules
- Catégories : **motos, scooters**.
- Ajout / édition / suppression (modale de confirmation `danger`).
- **Photo de véhicule** (bucket public `vehicle-photos`) + illustration par défaut soignée.
- Onglets fiche véhicule : **Plan**, **Historique**, **Fiche technique**, **Accessoires**, **Documents**.
- Mise à jour du compteur via modale dédiée.
- **Estimation kilométrique** intelligente entre deux relevés.

### Plan d'entretien (cœur produit)
- **Templates constructeur Voge** codés en dur, indexés par profil moteur/transmission
  (mono 300, bicylindre 500/650/900, scooter CVT 125/350…).
- Génération automatique à la création du véhicule (idempotente).
- Calcul des prochaines échéances (km + date) selon `last_done_*` + `interval_*`.
- Statuts dynamiques : `À venir`, `Bientôt`, `En retard`, `Effectué`.
- Pour l'occasion : le plan démarre au kilométrage courant.

### Fiche technique & notices
- Caractéristiques détaillées par modèle (cylindrée, puissance, couple, poids, réservoir,
  hauteur de selle, transmission, freins, pneumatiques, capacité d'huile, norme Euro).
- **Notice constructeur** via lien externe (maintenu par le réseau).

### Visualisation & rappels
- KPI **Coûts du véhicule** (mois / année / total / coût au km).
- Bloc **Rappels d'entretien** (en retard / bientôt).
- **Notifications push** (Web Push / VAPID) avec anti-spam.

### Exports
- Export **JSON** complet par véhicule.
- Export **PDF** (page imprimable).
- Export **ZIP** : données + documents joints.

### Paiements & abonnement
- **Offre concessionnaire** : 12 mois Premium offerts (`dealer_premium_until`).
- Intégration **Mollie** (SEPA + carte) avec subscriptions récurrentes.
- 2 plans : Gratuit / Premium (cf. section 9).
- Webhook `/api/billing/webhook` + bouton **« Synchroniser »** (filet de sécurité).
- Auto-sync post-paiement (`/parametres?billing=success`).
- Rétrogradation automatique à l'expiration (cron 02h00 UTC).
- Résiliation Mollie automatique lors de la suppression de compte.

### Confidentialité & RGPD
- Bannière cookies non bloquante.
- Suppression de compte effective (cascade Supabase + Storage + auth.users).
- Pages légales : CGU, mentions légales, politique de confidentialité, page `/rgpd`.
- Hébergement **EU only**. **Aucun sous-traitant IA**.

### Système UI / UX
- Modales modernes via `useConfirm()` (variantes info / warning / danger / success).
- Toasts Sonner, animations `tailwindcss-animate`.
- **Thème jaune / noir** de la marque, dégradés et glows, illustrations dédiées.

---

## 5. Expérience utilisateur

- **Design system** : shadcn/ui + Radix UI + Tailwind.
- **Iconographie** : Lucide React.
- **Ambiance visuelle** : jaune doré (`#FACC15`) + noir profond, halos dorés, cartes en relief.
  Inspiration moto sportive premium.
- **Mobile** : PWA installable, plein écran, navigation au pouce, KPI lisibles dès l'ouverture.
- **Desktop** : layout large, grille de véhicules, fiche détaillée à onglets.
- **Navigation** : Catégories → Liste véhicules → Détail véhicule (3 clics max).
- **Accessibilité** : composants Radix (ARIA, clavier, focus trap), contrastes AA, labels FR.

---

## 6. Branding

### Couleurs principales

| Rôle | Couleur | HEX |
| --- | --- | --- |
| Primaire (marque) | Jaune doré | `#FACC15` |
| Fond sombre | Noir | `#0A0A0A` |
| Succès / Effectué | Émeraude | `#10b981` |
| Alerte / Bientôt | Ambre | `#f59e0b` |
| Urgent / En retard | Rouge | `#ef4444` |
| Neutre / Bordures | Gris | `#e2e8f0` (clair) / `#1f1f1f` (sombre) |

### Ton de communication
- Clair, posé, expert sans être pédant.
- Vouvoiement côté marketing, tutoiement côté UI.
- Phrases courtes, verbes d'action. Pas de jargon mécanique inutile.

### Image de marque
- **Fiable** : on ne perd pas vos données, et on vous les rend en 1 clic.
- **Spécialiste deux-roues** : pensé pour la moto et le scooter.
- **Européenne** : hébergement EU, RGPD natif, paiements SEPA.

### Valeurs
Maîtrise · Sérénité · Transparence · Liberté (données exportables/supprimables) · Durabilité.

---

## 7. Marketing

### Proposition de valeur
**RideCloudMoto, c'est le carnet d'entretien intelligent de votre moto et de votre scooter —
un seul endroit pour suivre, anticiper et valoriser votre deux-roues.**

### Slogans possibles
- *La vie de votre deux-roues, enfin dans le cloud.*
- *Roulez. On s'occupe du reste.*
- *Ne ratez plus jamais un entretien.*
- *Une moto. Une histoire. Un cloud.*

### Arguments marketing
1. Un plan d'entretien adapté à **votre** modèle et à votre usage, pas un calendrier générique.
2. Fiche technique + notice intégrées à chaque véhicule.
3. PWA : zéro store, installation en 3 secondes.
4. Vos données vous appartiennent (export ZIP / PDF / JSON, suppression effective).
5. **12 mois Premium offerts** par votre concessionnaire.
6. Conçu en France, hébergé en Europe, **RGPD by design**.

### Bénéfices (avant / après)

| Avant | Avec RideCloudMoto |
| --- | --- |
| Factures perdues | Dossier numérique complet |
| Rappels oubliés | Plan constructeur + notifications |
| Revente difficile | Dossier transférable, valeur préservée |
| Pas de visibilité coûts | KPI clairs mois / an / km |
| Notice introuvable | Fiche technique + notice à portée de main |

---

## 8. Technique

### Stack technique

| Couche | Technologie |
| --- | --- |
| Framework | Next.js 16 (App Router, RSC, Server Actions) |
| Langage | TypeScript strict |
| UI | TailwindCSS + shadcn/ui + Radix UI + `tailwindcss-animate` |
| Icônes | Lucide React |
| Formulaires | React Hook Form + Zod |
| Dates | date-fns |
| Notifications UI | Sonner + modales custom `useConfirm` |
| Backend / BDD | Supabase (Postgres, Auth, Storage, RLS) |
| Auth | Supabase Auth PKCE (`@supabase/ssr`) |
| Paiements | Mollie API (`@mollie/api-client`) — SEPA + carte |
| Notifications | Web Push (VAPID, `web-push`) |
| Emails transactionnels | SMTP (Resend recommandé) via Supabase Auth |
| Export ZIP | JSZip |
| Tests | Vitest |
| Linting | ESLint 9 + eslint-config-next |

> **Pas d'IA** : aucune dépendance Mistral, pas de cache de plans IA.

### Tables principales (RLS activée partout)

- `profiles` (plan, plan_status, **dealer_premium_until**, mollie_*…)
- `vehicles` (category `motos`/`scooters`, marque, modele, annee, kilometrage, photo_url,
  usage_profile, avg_km_per_year, last_odometer_*…)
- `maintenance_plan_entries` (plan : titre, catégorie, intervalles, last_done_*, next_due_*,
  status, source, template_source `hardcoded`)
- `maintenance_entries` (historique réalisé)
- `upcoming_maintenance` (échéances manuelles)
- `modifications` (accessoires & tuning)
- `documents` (carte grise, assurance, factures)
- `push_subscriptions`, `notification_log`

### Routes API custom

- `POST /api/billing/checkout` — démarrage paiement Mollie
- `POST /api/billing/webhook` — webhook Mollie
- `POST /api/billing/cancel` / `POST /api/billing/sync`
- `POST /api/vehicles/[id]/mark-maintenance-current`
- `POST /api/push/subscribe` / `POST /api/push/unsubscribe`
- `POST /api/account/delete` — suppression RGPD (cascade + résiliation Mollie)
- `GET /api/vehicule/[id]/export` / `export-zip`
- `GET /api/cron/notifications` (08h00 UTC) / `GET /api/cron/downgrade-expired` (02h00 UTC)
- `GET /auth/callback` — callback PKCE + `ensureProfile()`

### Offre concessionnaire (logique clé)
- `getUserPlanState(profile)` : si `now() < dealer_premium_until` → `effectivePlan = premium`
  (offert) ; sinon repli sur l'abonnement Mollie réel.
- À l'inscription : `dealer_premium_until = now() + 12 mois` (configurable via `DEALER_FREE_PREMIUM_MONTHS`).

### Hébergement
- **Frontend** : Vercel (production, région `cdg1` Paris), déploiement continu via GitHub.
- **Backend & Storage** : Supabase (région EU).
- **TLS** : automatique via Vercel.

### Conformité légale
- CGU, mentions légales LCEN, politique de confidentialité, page `/rgpd`.
- Bannière cookies. Suppression de compte effective.
- Sous-traitants : Supabase, Vercel, Mollie, (Resend). **Aucun service IA.**

### PWA
- Manifest `public/manifest.webmanifest`, service worker `public/sw.js` (Web Push).
- Icônes multi-tailles + Apple touch icon. Installation iOS / Android / desktop sans store.

---

## 9. Business

### Modèle économique

**Premium offert 12 mois** par le concessionnaire à l'inscription (fidélisation), puis
**Freemium SaaS** : l'utilisateur reste gratuit (1 véhicule) ou souscrit Premium. Paiements
récurrents **Mollie** (SEPA + carte).

### Plans tarifaires

| Plan | Prix mensuel | Prix annuel | Cible | Inclus |
| --- | --- | --- | --- | --- |
| **Gratuit** | 0 € | 0 € | Découverte | **1 véhicule**, plan d'entretien, fiche technique, historique, suppression compte effective |
| **Premium** | **3,99 €/mois** | **39,99 €/an** | Particulier engagé | **jusqu'à 20 véhicules**, notifications push, exports JSON/ZIP/PDF, import documents |

> **Offre concessionnaire** : 12 mois Premium offerts à l'inscription, puis bascule en Premium
> payant ou retour au Gratuit. Pas de plan Family dans cette version.

### Public visé
- **B2B2C** : clients d'un réseau concessionnaire moto/scooter.
- **B2C** : motards et scootéristes FR souhaitant un suivi d'entretien simple.
- **Marché géographique** : France d'abord.

### Stratégie de lancement
1. **Phase 0 — Intégration concessionnaire** : déploiement, branding, catalogue Voge.
2. **Phase 1 — Distribution réseau** : remise de l'app aux clients à l'achat (12 mois offerts).
3. **Phase 2 — Rétention** : notifications d'entretien, retour à l'atelier, conversion Premium.

---

## 10. Réseaux sociaux

- **LinkedIn** : communication réseau / concessionnaire, build-in-public.
- **Instagram / TikTok** : tips d'entretien moto/scooter, démos produit, lifestyle deux-roues.
- **Sujets** : "3 entretiens que 80 % des motards oublient", "Combien coûte vraiment votre
  scooter ?", démos "Ajouter sa moto en 30 secondes".

---

## 11. Roadmap

### Livré
- Auth PKCE + filets de sécurité profil + offre Premium 12 mois.
- Catégories motos / scooters, CRUD complet, photos.
- Plan d'entretien constructeur Voge + fiche technique & notices.
- KPI coûts + rappels + notifications push.
- Export JSON / ZIP / PDF.
- Paiements Mollie (Gratuit / Premium).
- Conformité RGPD complète, PWA, UI jaune/noir.
- Tests Vitest sur la logique critique.

### Version 1 (1 à 3 mois)
- Onboarding guidé, recherche/filtres avancés, mode hors-ligne robuste.
- Illustrations par modèle plus précises, galerie photo.
- OAuth Google / Apple.

### Version 2 (3 à 6 mois)
- Notices PDF hébergées (en plus des liens externes).
- Intégration atelier concessionnaire (prise de RDV, rappels officiels).
- Statistiques multi-véhicules, export comptable.

### Version 3 et au-delà
- Espace pro concessionnaire (suivi parc clients, relances).
- "Passeport numérique du deux-roues" transférable à la revente.
- Internationalisation.

---

## 12. Conformité légale & RGPD

### Cadre réglementaire
- **RGPD** (UE 2016/679), **LCEN** (mentions légales), **Code de la consommation** (médiateur),
  **Directive ePrivacy** (cookies).

### Pages publiques
- `/cgu`, `/mentions-legales`, `/confidentialite`, `/rgpd`.

### Sous-traitants déclarés

| Sous-traitant | Fonction | Localisation |
| --- | --- | --- |
| Supabase Inc. | Base de données, auth, storage | UE |
| Vercel Inc. | Hébergement frontend + CDN | UE (cdg1, Paris) |
| Mollie B.V. | Paiements récurrents SEPA + carte | UE (Pays-Bas) |
| Resend, Inc. (si activé) | Emails transactionnels | UE |

> **Aucun sous-traitant IA.**

### Droits utilisateurs effectifs
- **Accès / Portabilité** : export JSON / ZIP / PDF.
- **Rectification** : édition libre depuis l'UI.
- **Effacement** : suppression de compte en cascade en quelques secondes.
- **Opposition** : cookies strictement nécessaires ; notifications push sur opt-in.
- **Contact** : `info@moto.ridecloud.app`.

### Sécurité technique
- TLS + HSTS, RLS sur toutes les tables, service role / VAPID privée côté serveur uniquement,
  crons protégés par `CRON_SECRET`, mots de passe hashés, rate limiting.

---

## Annexe — Identité technique synthétique

```text
Produit       : RideCloudMoto
Périmètre     : Motos + Scooters (gamme Voge, libellés non exposés publiquement)
Stack         : Next.js 16 · TypeScript · TailwindCSS · shadcn/ui · Supabase · PWA
IA            : Aucune (templates d'entretien constructeur codés en dur)
Notifications : Web Push (VAPID)
Paiements     : Mollie (SEPA + carte) — Gratuit / Premium 3,99 €
Offre         : 12 mois Premium offerts par le concessionnaire (dealer_premium_until)
Emails        : SMTP (Resend recommandé)
Statut        : En développement / pré-production
Couleur clé   : #FACC15 (jaune) · #0A0A0A (noir)
Modèle        : Premium offert puis Freemium SaaS récurrent
Conformité    : RGPD · LCEN · ePrivacy · médiateur de la consommation
Marché        : France
Support       : info@moto.ridecloud.app
```

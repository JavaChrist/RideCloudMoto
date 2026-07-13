# Roadmap RideCloudMoto

Idées et fonctionnalités à venir, notées au fil de l'eau.

## Communication e-mail concessionnaire → clients

**Idée (13/07/2026)** : permettre à un concessionnaire d'envoyer des e-mails à ses clients depuis l'application (promotions, rappels d'entretien, invitations, actualités de la concession).

### Points à cadrer avant implémentation

- **Ciblage** : le concessionnaire ne doit voir/contacter que *ses* clients (utilisateurs rattachés via `dealer_id` / codes d'activation). Jamais l'ensemble des utilisateurs.
- **Consentement RGPD** : ajouter un opt-in explicite côté utilisateur (« Accepter de recevoir des communications de mon concessionnaire »), avec lien de désinscription dans chaque e-mail. Stocker le consentement en base (date + statut).
- **Envoi** : passer par un fournisseur transactionnel (Resend, Brevo, Postmark…) plutôt que SMTP direct, avec un domaine d'envoi dédié (ex. `mail.ridecloud.app`) pour protéger la délivrabilité.
- **Templates** : quelques modèles brandés RideCloudMoto personnalisables (logo du concessionnaire déjà disponible via `app_logo_url`).
- **Garde-fous** : quota d'envois (anti-spam), prévisualisation obligatoire, éventuellement validation admin au début.
- **Suivi** : historique des campagnes envoyées par concessionnaire (date, sujet, nombre de destinataires).

### Pistes techniques

- Table `dealer_campaigns` (dealer_id, sujet, contenu, statut, envoyée_le) + table de consentement sur `profiles`.
- API `/api/dealer/campaigns` protégée par le rôle concessionnaire, envoi en tâche de fond.
- UI dans l'espace concessionnaire : liste des clients opt-in, éditeur simple, aperçu, envoi.

## Import de la base client d'un concessionnaire

**Idée (14/07/2026)** : permettre à un concessionnaire (ou à l'admin) d'importer sa base client existante pour générer en masse des codes d'activation pré-remplis.

### Principe

- Un « client » RideCloudMoto reste un utilisateur qui crée son propre compte : l'import ne crée pas de comptes, il crée des **codes d'activation** rattachés au concessionnaire avec les infos client (prénom, nom, e-mail, téléphone, modèle, date d'achat) — mêmes colonnes que l'export CSV existant.
- Le client reçoit ensuite son code (manuellement, ou automatiquement via la future fonctionnalité e-mail ci-dessus) et son compte est lié au concessionnaire à l'inscription.

### Format

- **CSV UTF-8, séparateur `;`** (symétrique de l'export existant, compatible Excel/DMS).
- Option : accepter aussi `.xlsx` via une librairie de parsing.

### Points à cadrer

- Validation ligne par ligne avec rapport d'erreurs (e-mails invalides, doublons déjà en base).
- Limite de taille / traitement par lot.
- RGPD : base légale = relation contractuelle du concessionnaire avec ses acheteurs ; données utilisées uniquement pour générer codes et invitations.

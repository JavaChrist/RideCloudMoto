# RideCloudMoto — Email Templates premium

Templates HTML responsives, branding **RideCloudMoto** (jaune/noir), à coller dans Supabase Dashboard.

## Fichiers fournis

| Fichier | Template Supabase | Sujet recommandé |
|---|---|---|
| `confirm-signup.html` | Confirm signup | Confirmez votre inscription sur RideCloudMoto |
| `reset-password.html` | Reset password | Réinitialisation de votre mot de passe RideCloudMoto |
| `magic-link.html` | Magic link | Votre lien de connexion sécurisé RideCloudMoto |
| `change-email.html` | Change email address | Confirmation de votre nouvelle adresse e-mail |

## Compatibilité

Gmail, Outlook 2007 → 365, Apple Mail, IONOS, Yahoo, Thunderbird. Fond clair fixe.

## Variables Supabase utilisées

- `{{ .ConfirmationURL }}` — URL du bouton CTA
- `{{ .Email }}` — adresse du destinataire (non affichée par défaut)
- `{{ .NewEmail }}` — nouvelle adresse (uniquement dans `change-email.html`)

> ⚠️ Ne pas remplacer ces placeholders à la main : Supabase les substitue à l'envoi.

## Installation dans Supabase

1. https://supabase.com/dashboard → projet RideCloudMoto
2. **Authentication → Emails → Templates**
3. Pour chaque template : coller le **sujet** recommandé, puis basculer le **Message body** en
   mode **Source/HTML**, tout remplacer par le contenu du fichier `.html`, puis **Save**.

## Branding (adapté RideCloudMoto)

- **Header** : fond **noir** (`#0a0a0a → #1a1a1a`), monogramme **RM** dans un carré **doré**
  (`#FACC15`), nom « RideCloud**Moto** » (Moto en doré), tagline « Le cloud de votre deux-roues ».
- **Bouton CTA** : fond **doré** (`#FACC15 → #f59e0b`), texte **noir**, ombre dorée.
- **Lien fallback** : `#b45309` (ambre, lisible sur fond blanc).
- **Footer** : « RideCloudMoto » + « L'entretien et l'historique de votre deux-roues, simplifiés. »

### Remplacer le monogramme « RM » par le vrai logo

Une fois l'app déployée publiquement, remplacez le bloc `<span ...>RM</span>` du header par une
image hébergée en HTTPS absolue (obligatoire pour Outlook) :

```html
<img src="https://votre-domaine/logo192.png"
     alt="RideCloudMoto"
     width="48" height="48"
     style="display:block;border-radius:14px;border:0;outline:none;text-decoration:none;" />
```

> Le logo `logo192.png` est déjà fourni dans `public/`. Tant que le domaine n'est pas en ligne,
> le monogramme **RM** doré sert de logo de repli (rendu garanti partout).

### Changer une couleur partout

Recherche/remplace dans les 4 fichiers :

- `#FACC15` → jaune doré de la marque (logo + CTA)
- `#f59e0b` → ambre (dégradé du CTA)
- `#0a0a0a` / `#1a1a1a` / `#171717` → noir du header
- `#b45309` → liens de repli
- `#0f172a` → texte principal · `#475569` → texte secondaire · `#94a3b8` → texte tertiaire
- `#e2e8f0` → bordures · `#f8fafc` → fond footer · `#f1f5f9` → fond page

### Sender SMTP

Dans Supabase → Authentication → Emails → **SMTP Settings** :

- **Sender email** : `noreply@votre-domaine`
- **Sender name** : `RideCloudMoto`

## Maintenance

- Source de vérité : ce dossier `docs/email-templates/` (versionné dans Git).
- En cas de modification du branding : éditer ici, puis recoller dans Supabase
  (les modifications faites dans le Dashboard ne sont pas versionnées).

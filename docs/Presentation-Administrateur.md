# RideCloudMoto — Présentation pour l'administrateur plateforme

> **Pour qui ?** L'équipe RideCloudMoto qui pilote la plateforme — l'exploitant.
> **En une phrase :** l'administrateur orchestre l'ensemble du réseau : il crée et configure les concessionnaires, gère les codes d'activation et fournit les supports marketing.

---

## 1. Le rôle de l'administrateur

Dans le modèle B2B2C, l'administrateur est le **chef d'orchestre** entre les concessionnaires et les clients finaux. Il ne s'occupe pas des données d'entretien des motards (privées), mais de **l'infrastructure commerciale** :

- **enrôler** les concessionnaires partenaires et configurer leur vitrine ;
- **gérer les équipes** de chaque concession (comptes du portail) ;
- **superviser les codes d'activation** (immatriculations) ;
- **produire les supports** (flyers personnalisés avec QR code).

Il dispose pour cela d'un **back-office** (`/admin/*`) accessible uniquement aux e-mails autorisés.

---

## 2. Comment l'accès admin est déterminé

L'accès administrateur est réservé aux adresses e-mail listées dans une variable de configuration serveur (`ADMIN_EMAILS`). La vérification est faite **côté serveur** sur chaque page et chaque route d'administration — il n'existe pas de « bouton caché » côté client.

> **Note de sécurité (voir l'audit) :** il n'y a pas de rôle stocké en base ; l'accès repose sur cette liste d'e-mails. C'est adapté à une petite équipe. La compromission d'un e-mail admin donnerait un accès complet — d'où l'importance de sécuriser ces comptes (mot de passe fort, vigilance phishing).

À la connexion, un administrateur est automatiquement routé vers le back-office ; un concessionnaire vers son portail ; un client vers son garage.

---

## 3. Le back-office, écran par écran

### Gestion des concessionnaires (`/admin/dealers`)
Le cœur de la configuration du réseau. Pour chaque concession, l'administrateur crée/modifie une fiche complète :

- **Identité** : nom, identifiant (slug), **logo**, logo d'app ;
- **Couleurs** : couleur principale et secondaire (elles remplacent le doré par défaut dans l'app des clients rattachés) ;
- **Coordonnées** : adresse, code postal, ville, téléphone, e-mail, site web ;
- **Localisation GPS** : latitude/longitude (pour l'itinéraire) ;
- **Horaires** d'ouverture ;
- **Marques** distribuées ;
- **Lien de prise de rendez-vous** ;
- **Durée de l'offre** gratuite (`offer_months`, 12 mois par défaut) ;
- **Statut actif/inactif**.

C'est ce qui alimente la page « Mon concessionnaire » vue par les clients.

### Gestion des équipes concessionnaire
Depuis la fiche d'un concessionnaire, l'administrateur rattache des **comptes utilisateurs** (par e-mail) à la concession, avec un rôle **Responsable** (owner) ou **Vendeur** (staff). Ce sont ces comptes qui pourront se connecter au portail concessionnaire.

### Gestion des codes d'activation (`/admin/dealer-codes`)
La supervision des codes (= immatriculations) sur toute la plateforme :

- **création** d'un code à partir d'une immatriculation, avec les informations client/véhicule ;
- **filtres** et recherche ;
- **impression** de fiches et **génération de QR codes** ;
- **export CSV** de l'ensemble des codes.

> Un administrateur peut donc enregistrer une vente à la place d'un concessionnaire, ou intervenir en support.

### Flyer personnalisé (`/admin/flyer`)
Génération d'un **flyer imprimable** au design de l'app, avec un **QR code dynamique** pointant vers l'inscription pré-remplie pour un code donné. Idéal pour fournir des supports prêts à l'emploi à un concessionnaire.

---

## 4. Ce qui tourne automatiquement (tâches planifiées)

L'administrateur n'a pas à intervenir au quotidien : deux **tâches automatiques** (crons) tournent en arrière-plan sur la plateforme.

| Tâche | Fréquence | Rôle |
|---|---|---|
| Rappels d'entretien | tous les jours à 8h | Envoie les notifications push aux clients ayant un entretien en retard ou à prévoir (max 1 rappel / 7 jours / client) |
| Rétrogradation des abonnements | tous les jours à 2h | Repasse en gratuit les abonnements Premium résiliés et arrivés à échéance |

Ces tâches sont **protégées par un secret** : elles ne peuvent être déclenchées que par la plateforme d'hébergement, pas depuis l'extérieur.

---

## 5. Le paiement (Premium) — vue d'ensemble

Les abonnements Premium sont gérés via **Mollie** :

- le client choisit mensuel (3,99 €) ou annuel (39,99 €) ;
- un premier paiement crée un **abonnement récurrent** ;
- un **webhook** met à jour l'accès automatiquement à chaque échéance ;
- la **résiliation** est possible depuis les paramètres du client.

L'administrateur n'a pas à traiter les paiements manuellement : le flux est **entièrement automatisé et sécurisé** (le webhook re-vérifie chaque paiement directement auprès de Mollie).

---

## 6. Périmètre et limites de l'administrateur

**Ce que l'administrateur peut faire :**
- créer/configurer concessionnaires, équipes et codes ;
- produire les supports marketing (flyers, QR) ;
- intervenir en support sur les codes et licences.

**Ce que l'administrateur ne fait PAS :**
- il ne consulte **pas** le contenu privé des carnets d'entretien des motards ;
- il ne gère pas les paiements à la main (automatisés via Mollie) ;
- il n'intervient pas dans les échanges SOS entre motards.

---

## 7. Conformité et données

- Données **hébergées en Europe**, isolées par utilisateur au niveau de la base (chaque motard n'accède qu'à ses propres données).
- **Suppression de compte** en self-service (RGPD), avec purge en cascade (compte, fichiers, données liées).
- Documentation dédiée : `docs/RGPD-Audit.md`.
- Pages légales intégrées (CGU, confidentialité, mentions légales, RGPD).

---

## En résumé pour l'administrateur

> « L'administrateur pilote tout le réseau depuis un back-office unique : il enrôle les concessionnaires, configure leur vitrine et leurs équipes, supervise les codes et fournit les flyers QR. Les rappels, les paiements et les rétrogradations tournent tout seuls — la plateforme s'auto-gère. »

**Trois arguments à retenir :**
1. **Pilotage centralisé** du réseau de concessionnaires (vitrines, équipes, codes).
2. **Automatisation** : rappels, facturation et cycle de vie des accès sans intervention.
3. **Cloisonnement des données** : l'admin gère le commercial, jamais le carnet privé des motards.

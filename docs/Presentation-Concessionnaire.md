# RideCloudMoto — Présentation pour le concessionnaire

> **Pour qui ?** Le concessionnaire / vendeur de motos et scooters — le partenaire distributeur.
> **En une phrase :** RideCloudMoto est un outil de fidélisation clé en main : vous offrez à chaque client un carnet d'entretien numérique à vos couleurs, et vous gardez le lien avec lui jusqu'à sa prochaine révision.

---

## 1. Pourquoi c'est intéressant pour vous

Le modèle est **B2B2C** : vous distribuez l'application à vos clients, et vous devenez un **partenaire de la plateforme**. Concrètement, RideCloudMoto vous aide à :

- **Fidéliser** : votre client garde une app à vos couleurs dans sa poche toute l'année.
- **Faire revenir à l'atelier** : les rappels d'entretien et la prolongation de licence après révision ramènent le client chez vous.
- **Vous différencier** : un service moderne offert avec chaque véhicule vendu.
- **Rester visible** : coordonnées, itinéraire, prise de rendez-vous et promotions affichés en permanence dans l'app du client.

Le tout **sans effort technique** : pas de code promo à gérer, pas d'application à maintenir.

---

## 2. Le principe en une image

```
Vente d'un véhicule
        │
        ▼
Vous enregistrez l'immatriculation dans le portail  ──►  un « code » est créé
        │
        ▼
Le client scanne le QR / saisit son immatriculation  ──►  son accès démarre (offert)
        │
        ▼
Il est rattaché à VOTRE concession  ──►  il voit vos coordonnées, promos, RDV
        │
        ▼
Après une révision, vous PROLONGEZ sa licence  ──►  il revient chez vous
```

**L'idée clé :** l'**immatriculation du véhicule sert de code d'activation**. Rien à inventer, rien à distribuer d'autre.

---

## 3. Votre accès : le portail

Vous accédez à un **portail dédié** (`/portail`) avec un **compte e-mail** créé par l'équipe RideCloudMoto. À la connexion, vous arrivez directement sur votre espace pro.

> Deux rôles existent (**Responsable** et **Vendeur**) ; les deux ont accès aux mêmes fonctions du portail.

Le portail comprend trois espaces :

### Tableau de bord (`/portail`)
Votre vue d'ensemble : nombre de **ventes enregistrées**, de **licences activées** (clients ayant démarré leur offre) et de **fiches en attente** d'activation.

### Nouvelle vente (`/portail/ventes/nouvelle`)
Votre geste quotidien à la livraison d'un véhicule :
1. Saisissez l'**immatriculation** (format `AB-123-CD`) — obligatoire, c'est le code du client.
2. Complétez si vous le souhaitez : modèle, date d'achat, coordonnées du client.
3. Validez : le code est prêt à être remis (via le flyer QR ou simplement en indiquant au client de saisir son immatriculation).

### Licences (`/portail/licences`)
La liste de tous vos clients, avec leur statut :

| Statut | Signification |
|---|---|
| **En attente** | Le code existe, le client ne l'a pas encore activé |
| **Activée** | Le client a créé son compte et démarré son offre |

Filtres : *Toutes*, *Activées*, *En attente*.

---

## 4. La fidélisation : prolonger une licence

C'est **le levier commercial** de l'outil. Pour une licence **activée**, un bouton **Prolonger** ajoute une nouvelle période d'accès gratuit :

- si l'offre est encore active → la durée s'ajoute à la date de fin ;
- si elle a expiré → elle repart d'aujourd'hui.

**Cas d'usage typique :** un client vient faire réviser sa moto → vous lui prolongez son accès d'un an → il repart avec un service offert et une bonne raison de revenir.

> **Une seule prolongation par licence.** Après usage, le bouton affiche « Prolongée » et n'est plus réutilisable (garde-fou anti-abus).

---

## 5. Votre vitrine dans l'app du client

Chaque client rattaché à votre concession voit une page **Mon concessionnaire** qui affiche :

- votre **logo** et vos **couleurs** (l'app s'adapte à votre marque) ;
- votre **adresse**, **téléphone**, **e-mail**, **site web** ;
- un bouton **Itinéraire GPS** ;
- un bouton **Prendre rendez-vous** ;
- vos **promotions** en cours ;
- vos **horaires** d'ouverture.

> La configuration (logo, couleurs, coordonnées, horaires, promotions, durée d'offre) est réalisée par l'équipe RideCloudMoto lors de la mise en place. Il suffit de nous transmettre vos éléments.

---

## 6. Le flyer avec QR code

Pour faciliter l'inscription en boutique :

- **Flyer prêt à l'emploi** : le QR code renvoie vers la page d'inscription pré-remplie ; il suffit d'imprimer.
- **Flyer vierge** : une zone où écrire le code à la main.

Le client scanne → crée son compte → saisit son immatriculation → c'est activé.

---

## 7. Questions fréquentes

**Le client a perdu son code ?**
Son code est son **immatriculation**. Il la ressaisit dans *Paramètres → activer un code*.

**Le client change de véhicule ?**
Enregistrez une nouvelle vente avec la nouvelle immatriculation.

**Que se passe-t-il à la fin de l'offre ?**
L'app du client passe en **lecture seule** : il garde son historique, ses factures et ses exports, mais ne peut plus rien ajouter. Il peut souscrire au **Premium**, ou vous pouvez **prolonger** sa licence.

**Puis-je voir le carnet d'entretien de mes clients ?**
**Non.** Le portail vous montre l'état des **licences** (activée / en attente) et les coordonnées saisies à la vente, mais **jamais** le contenu privé du carnet du client. C'est un gage de confiance pour lui.

**Comment ajouter un collègue au portail ?**
Contactez l'équipe RideCloudMoto : elle rattache le compte (par e-mail) à votre concession.

---

## En résumé pour le concessionnaire

> « À chaque vente, vous offrez à votre client un carnet d'entretien numérique à vos couleurs. Il pense à vous toute l'année, et vous le faites revenir à l'atelier en prolongeant son accès après chaque révision. Zéro maintenance de votre côté : l'immatriculation fait office de code. »

**Trois arguments à retenir :**
1. **Fidélisation active** : rappels + prolongation de licence = client qui revient.
2. **Visibilité permanente** : votre vitrine (coordonnées, RDV, promos) dans la poche du client.
3. **Simplicité totale** : un portail, un geste à la vente, aucune technique.

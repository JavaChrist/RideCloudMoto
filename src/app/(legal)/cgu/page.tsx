import { LegalPage } from "@/components/legal/legal-page";

export const metadata = { title: "Conditions générales d'utilisation" };

export default function CguPage() {
  return (
    <LegalPage
      title="Conditions Générales d'Utilisation"
      updatedAt="17 juin 2026"
      intro="Les présentes conditions régissent l'utilisation de l'application RideCloudMoto, carnet d'entretien numérique pour motos et scooters."
      sections={[
        {
          heading: "1. Objet",
          body: [
            "RideCloudMoto permet de suivre l'entretien, l'historique et la documentation de vos véhicules deux-roues.",
          ],
        },
        {
          heading: "2. Compte utilisateur",
          body: [
            "L'accès au service nécessite la création d'un compte avec une adresse e-mail valide et vérifiée. Vous êtes responsable de la confidentialité de vos identifiants.",
          ],
        },
        {
          heading: "3. Offre concessionnaire et abonnement",
          body: [
            "Une période Premium de 12 mois peut être offerte à l'inscription. À l'issue de cette période, l'accès aux fonctionnalités Premium nécessite la souscription d'un abonnement payant, sans engagement et résiliable à tout moment.",
          ],
        },
        {
          heading: "4. Données et entretien",
          body: [
            "Les plans d'entretien et fiches techniques sont fournis à titre indicatif. Ils ne se substituent pas aux préconisations officielles du constructeur ni à l'avis d'un professionnel.",
          ],
        },
        {
          heading: "5. Responsabilité",
          body: [
            "L'éditeur ne saurait être tenu responsable des dommages résultant d'un défaut d'entretien. L'utilisateur reste seul responsable de l'entretien effectif de son véhicule.",
          ],
        },
        {
          heading: "6. Résiliation et droit de rétractation",
          body: [
            "L'abonnement Premium est sans engagement et résiliable à tout moment depuis les paramètres ; il reste actif jusqu'à la fin de la période déjà payée.",
            "Conformément à l'article L221-28 du Code de la consommation, vous reconnaissez, en demandant l'exécution immédiate du service, renoncer à votre droit de rétractation une fois le service pleinement fourni.",
          ],
        },
        {
          heading: "7. Médiateur de la consommation",
          body: [
            "Conformément aux articles L611-1 et suivants du Code de la consommation, vous pouvez recourir gratuitement à un médiateur de la consommation en vue de la résolution amiable d'un litige. Les coordonnées du médiateur compétent sont communiquées sur demande à support@javachrist.fr.",
          ],
        },
        {
          heading: "8. Éditeur et contact",
          body: [
            "RideCloudMoto est édité par JavaChrist (Grohens Christian), entreprise individuelle, SIRET 338 593 312 000 30. Contact : support@javachrist.fr.",
          ],
        },
      ]}
    />
  );
}

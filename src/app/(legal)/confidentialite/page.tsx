import { LegalPage } from "@/components/legal/legal-page";

export const metadata = { title: "Politique de confidentialité" };

export default function ConfidentialitePage() {
  return (
    <LegalPage
      title="Politique de confidentialité"
      updatedAt="17 juin 2026"
      intro="Cette politique décrit comment RideCloudMoto collecte et traite vos données personnelles, conformément au RGPD."
      sections={[
        {
          heading: "Données collectées",
          body: [
            "Nous collectons votre adresse e-mail, votre nom, les informations relatives à vos véhicules (modèle, kilométrage, entretiens) et les documents que vous importez.",
          ],
        },
        {
          heading: "Finalités",
          body: [
            "Ces données servent uniquement à fournir le service : gestion du carnet d'entretien, rappels, notifications et gestion de l'abonnement.",
          ],
        },
        {
          heading: "Hébergement",
          body: [
            "Les données sont hébergées au sein de l'Union européenne (Supabase / Vercel, région Paris). Les paiements sont gérés par Mollie.",
          ],
        },
        {
          heading: "Conservation et suppression",
          body: [
            "Vos données sont conservées tant que votre compte est actif. Vous pouvez supprimer votre compte et l'ensemble de vos données à tout moment depuis les paramètres.",
          ],
        },
        {
          heading: "Vos droits",
          body: [
            "Vous disposez d'un droit d'accès, de rectification, d'effacement et de portabilité de vos données. Contactez-nous pour exercer ces droits.",
          ],
        },
      ]}
    />
  );
}

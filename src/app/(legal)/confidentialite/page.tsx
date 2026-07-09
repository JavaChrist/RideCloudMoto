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
            "Identité : adresse e-mail, nom complet (facultatif), mot de passe (hashé par Supabase).",
            "Données métier : véhicules (moto/scooter, modèle, kilométrage, immatriculation), entretiens, modifications, photos et documents que vous importez.",
            "Facturation : identifiants Mollie en cas d'abonnement Premium payant.",
            "Technique : cookies de session, endpoint de notification push (si activé), adresse IP et journaux techniques.",
          ],
        },
        {
          heading: "Finalités",
          body: [
            "Ces données servent uniquement à fournir le service : gestion du carnet d'entretien, plan d'entretien, rappels et notifications, et gestion de l'abonnement. Aucune donnée n'est utilisée à des fins publicitaires.",
          ],
        },
        {
          heading: "Hébergement",
          body: [
            "Les données sont hébergées au sein de l'Union européenne (Supabase et Vercel, région Paris).",
          ],
        },
        {
          heading: "Sous-traitants",
          body: [
            "Supabase Inc. (base de données, authentification, stockage — UE).",
            "Vercel Inc. (hébergement et CDN — région Paris, UE).",
            "Mollie B.V. (paiements SEPA et carte — Pays-Bas, UE), uniquement en cas d'abonnement payant.",
            "Cette application n'utilise aucun service d'intelligence artificielle et ne transmet vos données à aucun sous-traitant d'IA.",
          ],
        },
        {
          heading: "Conservation et suppression",
          body: [
            "Vos données sont conservées tant que votre compte est actif. Vous pouvez supprimer votre compte et l'ensemble de vos données à tout moment depuis les paramètres (effacement immédiat).",
          ],
        },
        {
          heading: "Vos droits",
          body: [
            "Vous disposez d'un droit d'accès, de rectification, d'effacement, de portabilité et d'opposition. Pour les exercer, contactez-nous à info@moto.ridecloud.app.",
          ],
        },
      ]}
    />
  );
}

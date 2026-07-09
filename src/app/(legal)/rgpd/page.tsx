import { LegalPage } from "@/components/legal/legal-page";

export const metadata = { title: "RGPD" };

export default function RgpdPage() {
  return (
    <LegalPage
      title="Protection des données (RGPD)"
      updatedAt="17 juin 2026"
      intro="RideCloudMoto s'engage à respecter le Règlement Général sur la Protection des Données."
      sections={[
        {
          heading: "Base légale",
          body: [
            "Le traitement de vos données repose sur l'exécution du contrat (fourniture du service) et votre consentement pour les notifications.",
          ],
        },
        {
          heading: "Droit à l'effacement",
          body: [
            "Depuis la page Paramètres, la suppression de votre compte entraîne l'effacement immédiat et définitif de l'ensemble de vos données (profil, véhicules, historiques, documents).",
          ],
        },
        {
          heading: "Portabilité",
          body: [
            "Vous pouvez exporter les données de chaque véhicule au format JSON ou ZIP depuis sa fiche.",
          ],
        },
        {
          heading: "Cookies",
          body: [
            "Seuls des cookies strictement nécessaires (session d'authentification, préférences d'affichage) sont utilisés. Aucun traceur publicitaire.",
          ],
        },
        {
          heading: "Sous-traitants",
          body: [
            "Vos données sont traitées par Supabase (base de données, UE), Vercel (hébergement, UE) et Mollie (paiements, UE, uniquement en cas d'abonnement payant). Aucun service d'intelligence artificielle n'est utilisé.",
          ],
        },
        {
          heading: "Contact & réclamation",
          body: [
            "Pour exercer vos droits, écrivez à info@moto.ridecloud.app. Vous disposez également du droit d'introduire une réclamation auprès de la CNIL (www.cnil.fr).",
          ],
        },
      ]}
    />
  );
}

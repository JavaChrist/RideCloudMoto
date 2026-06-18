import { LegalPage } from "@/components/legal/legal-page";

export const metadata = { title: "Mentions légales" };

export default function MentionsLegalesPage() {
  return (
    <LegalPage
      title="Mentions légales"
      updatedAt="17 juin 2026"
      sections={[
        {
          heading: "Éditeur",
          body: [
            "RideCloudMoto est édité par JavaChrist (Grohens Christian), entreprise individuelle, SIRET 338 593 312 000 30.",
            "Pour toute question, contactez l'éditeur à l'adresse support@javachrist.fr.",
          ],
        },
        {
          heading: "Directeur de la publication",
          body: ["Christian Grohens."],
        },
        {
          heading: "Hébergement",
          body: [
            "Frontend : Vercel Inc. — déploiement région cdg1 (Paris, Union européenne).",
            "Base de données, authentification et stockage : Supabase Inc. — Union européenne.",
            "Les données sont hébergées au sein de l'Union européenne.",
          ],
        },
        {
          heading: "Propriété intellectuelle",
          body: [
            "L'ensemble des contenus de l'application (textes, interface, code) est protégé. Les marques et modèles de véhicules cités appartiennent à leurs détenteurs respectifs.",
          ],
        },
        {
          heading: "Contact",
          body: ["support@javachrist.fr"],
        },
      ]}
    />
  );
}

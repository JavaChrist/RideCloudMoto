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
            "RideCloudMoto — application éditée par [Raison sociale de l'éditeur], [forme juridique], [adresse]. À compléter par l'éditeur / le concessionnaire.",
          ],
        },
        {
          heading: "Directeur de la publication",
          body: ["[Nom du directeur de la publication]."],
        },
        {
          heading: "Hébergement",
          body: [
            "Vercel Inc. (frontend) et Supabase (base de données), avec hébergement des données dans l'Union européenne.",
          ],
        },
        {
          heading: "Contact",
          body: ["support@ridecloudmoto.fr"],
        },
      ]}
    />
  );
}

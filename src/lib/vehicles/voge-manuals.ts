/**
 * Mapping modèle Voge → page du manuel constructeur officiel (vogefrance.fr).
 * On pointe vers les pages officielles (toujours à jour, pas de réhébergement).
 * Source : https://vogefrance.fr/documents/
 */

export interface VogeManual {
  label: string;
  url: string;
}

interface ManualEntry extends VogeManual {
  /** Codes normalisés (sans espaces/accents, majuscules), du plus spécifique au plus générique. */
  aliases: string[];
}

// Ordre important : les codes les plus spécifiques d'abord (ex. SR1ADV avant SR1).
const ENTRIES: ManualEntry[] = [
  // Scooter
  { label: "Scooter SR1 ADV 125", url: "https://vogefrance.fr/manuel-sr1-adv/", aliases: ["SR1ADV"] },
  { label: "Scooter SR16 125", url: "https://vogefrance.fr/manuel-sr16-fr/", aliases: ["SR16"] },
  { label: "Scooter SR4", url: "https://vogefrance.fr/manuel-voge-sr4max/", aliases: ["SR4"] },
  { label: "Scooter SR1 125", url: "https://vogefrance.fr/manuel-voge-sr1/", aliases: ["SR1"] },
  // Trail DS
  { label: "Trail DS900X", url: "https://vogefrance.fr/manuel-voge-ds900x/", aliases: ["DS900X", "900X"] },
  { label: "Trail DS800X Rally", url: "https://vogefrance.fr/manuel-ds800x-fr_/", aliases: ["DS800X", "800X"] },
  { label: "Trail DS625X", url: "https://vogefrance.fr/manuel-vogeds625x-fr/", aliases: ["DS625X", "625X"] },
  { label: "Trail DS525X", url: "https://vogefrance.fr/manuel-voge-525dsx/", aliases: ["DS525X", "525DSX", "525DS"] },
  { label: "Trail 650DS", url: "https://vogefrance.fr/manuel-voge-650ds-dsx/", aliases: ["650DSX", "650DS"] },
  { label: "Trail 500DS", url: "https://vogefrance.fr/manuel-voge-500ds/", aliases: ["500DS"] },
  { label: "Trail 300 Rally", url: "https://vogefrance.fr/manuel-voge-rally300/", aliases: ["300RALLY", "RALLY300"] },
  { label: "Trail 300DS", url: "https://vogefrance.fr/manuel-voge-300ds/", aliases: ["300DS"] },
  // Classic AC
  { label: "Classic 525 ACX", url: "https://vogefrance.fr/manuel-voge-525acx/", aliases: ["525ACX", "525AC"] },
  { label: "Classic 500AC", url: "https://vogefrance.fr/manuel-voge-500ac/", aliases: ["500AC"] },
  { label: "Classic 300AC", url: "https://vogefrance.fr/manuel-voge-300ac/", aliases: ["300AC"] },
  // Naked R
  { label: "Naked 525R", url: "https://vogefrance.fr/manuel-voge-525r/", aliases: ["525R", "R525"] },
  { label: "Naked 500R", url: "https://vogefrance.fr/manuel-voge-500r/", aliases: ["500R", "R500"] },
  { label: "Naked 300R", url: "https://vogefrance.fr/manuel-voge-300r/", aliases: ["300R", "R300"] },
  { label: "Naked 125R", url: "https://vogefrance.fr/manuel-voge-r125/", aliases: ["125R", "R125"] },
  // Electric ER
  { label: "Electric EF40 / EF40X", url: "https://vogefrance.fr/manuel-utilisateur-ef40ef40x/", aliases: ["EF40X", "EF40"] },
  { label: "Electric ER10", url: "https://vogefrance.fr/er10-presentation/", aliases: ["ER10"] },
];

function normalize(value: string | null | undefined): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

/**
 * Retrouve le manuel Voge correspondant au véhicule. Ne s'applique qu'aux
 * véhicules Voge (marque « Voge » ou marque non renseignée) pour éviter les
 * faux positifs (ex. une Honda « CB500R »).
 */
export function findVogeManual(
  marque: string | null | undefined,
  modele: string | null | undefined
): VogeManual | null {
  const brand = normalize(marque);
  if (brand && !brand.includes("VOGE")) return null;

  const model = normalize(modele);
  if (!model) return null;

  for (const entry of ENTRIES) {
    if (entry.aliases.some((alias) => model.includes(alias))) {
      return { label: entry.label, url: entry.url };
    }
  }
  return null;
}

import type { Metadata } from "next";
import Link from "next/link";
import {
  Hand,
  HeartHandshake,
  ShieldCheck,
  TriangleAlert,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Culture & entraide motard" };
export const dynamic = "force-dynamic";

const GOLDEN_RULES: { title: string; text: string }[] = [
  {
    title: "S'équiper toujours (ATGATT)",
    text: "« All The Gear, All The Time » : casque homologué, gants, blouson, pantalon et bottes à chaque sortie, même pour 5 minutes. La route ne prévient pas.",
  },
  {
    title: "Rouler pour être vu",
    text: "Considère que les autres ne t'ont pas vu. Positionne-toi dans le champ de vision, évite les angles morts et anticipe les portières, giratoires et intersections.",
  },
  {
    title: "Garder ses distances",
    text: "La distance de sécurité, c'est ton temps de réaction. Sur route mouillée ou froide, double-la. Mieux vaut arriver en retard qu'arriver couché.",
  },
  {
    title: "Adapter son allure",
    text: "La vitesse se règle sur la visibilité et l'adhérence, pas sur la limite. On ne dépasse jamais la distance sur laquelle on peut s'arrêter.",
  },
  {
    title: "Anticiper, freiner en douceur",
    text: "Regarde loin, lis la route (gravier, gasoil, marquages mouillés). Un freinage progressif vaut mieux qu'un blocage. Frein avant + arrière ensemble.",
  },
  {
    title: "L'entraide avant tout",
    text: "Un motard arrêté sur le bas-côté, on ralentit, on vérifie. Aujourd'hui c'est lui, demain ce sera toi. C'est tout l'esprit du bouton SOS de l'app.",
  },
  {
    title: "Dire merci, rester courtois",
    text: "Quand une voiture se pousse ou s'écarte pour te laisser passer, on remercie : jambe (ou pied) tendue sur le côté. Le respect partagé, c'est ce qui rend la route plus sûre pour tous.",
  },
];

const SIGNALS: { sign: string; meaning: string }[] = [
  {
    sign: "Tapoter le casque (main sur la tête)",
    meaning: "Police / contrôle plus loin, ou « allume tes feux ». Prudence.",
  },
  {
    sign: "Pied ou main pointés vers le sol",
    meaning: "Danger sur la chaussée : trou, gravier, gasoil, obstacle. Regarde où l'on montre.",
  },
  {
    sign: "Main qui monte et descend, paume vers le sol",
    meaning: "Ralentis, danger devant. On calme le rythme du groupe.",
  },
  {
    sign: "Bras tendu, main ouverte vers l'arrière",
    meaning: "Je vais m'arrêter / stop. Préviens ceux qui te suivent.",
  },
  {
    sign: "Jambe (ou pied) tendue sur le côté",
    meaning:
      "Merci ! Remerciement au conducteur qui se pousse ou s'écarte pour te laisser passer. Le geste le plus courant : on sort la jambe côté véhicule remercié.",
  },
  {
    sign: "Feux de détresse / warnings brefs",
    meaning: "Merci à une voiture qui s'écarte, ou signale un danger/ralentissement.",
  },
  {
    sign: "Pied qui remue de haut en bas",
    meaning: "Problème mécanique ou besoin de s'arrêter (essence, fatigue…).",
  },
  {
    sign: "Signe de la main / hochement de tête",
    meaning: "Merci, ou salut entre motards qui se croisent.",
  },
];

export default function EntraidePage() {
  return (
    <div className="container max-w-2xl space-y-8 py-4">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border bg-card p-6">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Users className="h-3.5 w-3.5" />
            Communauté
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
            Culture & entraide motard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Les règles d&apos;or, les signaux de la route et l&apos;histoire du salut
            entre motards. Parce qu&apos;à deux roues, on roule ensemble.
          </p>
          <Button asChild variant="outline" className="mt-4 gap-1.5">
            <Link href="/sos">
              <TriangleAlert className="h-4 w-4 text-red-600" />
              Un motard en détresse ? SOS
            </Link>
          </Button>
        </div>
      </div>

      {/* Règles d'or */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Les règles d&apos;or
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {GOLDEN_RULES.map((rule, i) => (
            <Card key={rule.title}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-start gap-2 text-base">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                    {i + 1}
                  </span>
                  {rule.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {rule.text}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Signaux */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <Hand className="h-5 w-5 text-primary" />
          Les signaux entre motards
        </h2>
        <p className="text-sm text-muted-foreground">
          En roulant en groupe ou en se croisant, les motards communiquent d&apos;un
          geste. Les usages varient selon les régions et les clubs : dans le doute,
          ralentis et reste attentif.
        </p>
        <div className="divide-y rounded-xl border">
          {SIGNALS.map((s) => (
            <div key={s.sign} className="flex flex-col gap-0.5 p-4">
              <span className="font-medium">{s.sign}</span>
              <span className="text-sm text-muted-foreground">{s.meaning}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Le salut */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <HeartHandshake className="h-5 w-5 text-primary" />
          Le salut motard
        </h2>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Un signe de reconnaissance</CardTitle>
            <CardDescription>
              Se saluer en se croisant, c&apos;est dire « on fait partie de la même
              famille, roule prudemment ». Selon la vitesse et la circulation, le salut
              prend plusieurs formes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <p className="font-semibold text-foreground">Les formes du salut</p>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                <li>
                  <strong>Le hochement de tête</strong> : le plus courant en ville ou à
                  vitesse élevée, quand lâcher le guidon n&apos;est pas prudent.
                </li>
                <li>
                  <strong>La main levée</strong> : bras ouvert vers l&apos;autre motard,
                  sur route dégagée.
                </li>
                <li>
                  <strong>Le pied qui se décolle</strong> : un salut discret, apprécié
                  des habitués.
                </li>
                <li>
                  <strong>Le salut en V</strong> : deux doigts (index et majeur) pointés
                  vers le bas, vers la route.
                </li>
              </ul>
            </div>

            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
              <p className="flex items-center gap-2 font-semibold text-foreground">
                <span className="text-lg">✌️</span> Les origines du salut en V
              </p>
              <p className="mt-2">
                Plusieurs histoires circulent, et c&apos;est ce qui fait sa légende. La
                plus répandue l&apos;attribue au champion du monde{" "}
                <strong>Barry Sheene</strong>, dans les années 1970 : il aurait
                popularisé ce geste, deux doigts tendus vers le sol, comme une
                signature.
              </p>
              <p className="mt-2">Les significations qu&apos;on lui prête :</p>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                <li>
                  <strong>Les deux roues</strong> : deux doigts pour les deux roues de la
                  moto.
                </li>
                <li>
                  <strong>« Garde tes deux roues au sol »</strong> : les doigts pointés
                  vers la route, comme un vœu de sécurité (« keep the rubber side
                  down »).
                </li>
                <li>
                  <strong>« Reste en vie »</strong> : un souhait de bonne route, entre
                  frères de bitume.
                </li>
                <li>
                  Un écho au <strong>V de la victoire / de la paix</strong>, tourné vers
                  le bas par humilité et respect de la route.
                </li>
              </ul>
              <p className="mt-2 text-xs">
                Aucune version n&apos;est « officielle » : l&apos;essentiel est le
                message, « roule prudemment, on est ensemble ».
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

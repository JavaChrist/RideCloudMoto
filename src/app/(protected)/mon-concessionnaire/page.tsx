import type { Metadata } from "next";
import Link from "next/link";
import {
  Calendar,
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  Navigation,
  Phone,
  Store,
  Tag,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getDealerWithPromotions } from "@/lib/dealer/dealer-info";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DealerMapCard } from "@/components/dealer/dealer-map-card";
import { formatDateShort } from "@/lib/utils/date";
import type { DealerHours, Profile } from "@/types/database";

export const metadata: Metadata = { title: "Mon concessionnaire" };
export const dynamic = "force-dynamic";

const DAY_ORDER: (keyof DealerHours)[] = [
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
  "dimanche",
];

export default async function MonConcessionnairePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profileData } = await supabase
    .from("profiles")
    .select("dealer_id")
    .eq("id", user!.id)
    .maybeSingle();

  const dealerId = (profileData as Pick<Profile, "dealer_id"> | null)?.dealer_id ?? null;
  const result = await getDealerWithPromotions(supabase, dealerId);

  if (!result) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Store className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle>Aucun concessionnaire associé</CardTitle>
            <CardDescription>
              Votre compte n&apos;est pas encore rattaché à un concessionnaire partenaire.
              Il le sera automatiquement lors de l&apos;activation d&apos;un code fourni à
              l&apos;achat de votre véhicule.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { dealer, promotions } = result;
  const mapsQuery = dealer.latitude != null && dealer.longitude != null
    ? `${dealer.latitude},${dealer.longitude}`
    : [dealer.address, dealer.postal_code, dealer.city].filter(Boolean).join(" ");
  const mapsUrl = mapsQuery
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`
    : null;
  const hours = (dealer.hours ?? {}) as DealerHours;
  const hasHours = DAY_ORDER.some((d) => hours[d]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* En-tête concessionnaire */}
      <Card className="overflow-hidden">
        <div className="brand-gradient h-2 w-full" aria-hidden />
        <CardHeader>
          <div className="flex items-center gap-4">
            {dealer.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={dealer.logo_url}
                alt={dealer.name}
                className="h-16 w-16 rounded-xl object-contain ring-1 ring-border"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/15">
                <Store className="h-8 w-8 text-primary" />
              </div>
            )}
            <div className="min-w-0">
              <CardTitle className="text-2xl">{dealer.name}</CardTitle>
              {dealer.brands.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {dealer.brands.map((b) => (
                    <Badge key={b} variant="secondary">
                      {b}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {(dealer.address || dealer.city) && (
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <p className="text-sm">
                {dealer.address}
                {dealer.address && (dealer.postal_code || dealer.city) ? <br /> : null}
                {[dealer.postal_code, dealer.city].filter(Boolean).join(" ")}
              </p>
            </div>
          )}
          {dealer.phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 shrink-0 text-primary" />
              <a href={`tel:${dealer.phone}`} className="text-sm hover:underline">
                {dealer.phone}
              </a>
            </div>
          )}
          {dealer.email && (
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 shrink-0 text-primary" />
              <a href={`mailto:${dealer.email}`} className="text-sm hover:underline">
                {dealer.email}
              </a>
            </div>
          )}
          {dealer.website && (
            <div className="flex items-center gap-3">
              <ExternalLink className="h-5 w-5 shrink-0 text-primary" />
              <a
                href={dealer.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm hover:underline"
              >
                {dealer.website.replace(/^https?:\/\//, "")}
              </a>
            </div>
          )}

          {dealer.latitude != null && dealer.longitude != null && (
            <DealerMapCard
              lat={dealer.latitude}
              lng={dealer.longitude}
              name={dealer.name}
              address={[dealer.address, dealer.postal_code, dealer.city]
                .filter(Boolean)
                .join(" ")}
            />
          )}

          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            {mapsUrl && (
              <Button asChild variant="outline" className="flex-1">
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                  <Navigation className="h-4 w-4" />
                  Itinéraire GPS
                </a>
              </Button>
            )}
            {dealer.booking_url && (
              <Button asChild className="flex-1">
                <a href={dealer.booking_url} target="_blank" rel="noopener noreferrer">
                  <Calendar className="h-4 w-4" />
                  Prendre rendez-vous
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Promotions */}
      {promotions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Tag className="h-5 w-5 text-primary" />
              Promotions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {promotions.map((promo) => (
              <div key={promo.id} className="rounded-lg border p-3">
                <p className="font-semibold">{promo.title}</p>
                {promo.description ? (
                  <p className="mt-1 text-sm text-muted-foreground">{promo.description}</p>
                ) : null}
                {promo.valid_until ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Valable jusqu&apos;au {formatDateShort(new Date(promo.valid_until))}
                  </p>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Horaires */}
      {hasHours && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-primary" />
              Horaires d&apos;ouverture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="divide-y">
              {DAY_ORDER.filter((d) => hours[d]).map((day) => (
                <div key={day} className="flex justify-between py-2 text-sm">
                  <dt className="capitalize text-muted-foreground">{day}</dt>
                  <dd className="font-medium">{hours[day]}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      )}

      <p className="text-center text-xs text-muted-foreground">
        <Link href="/categories" className="hover:underline">
          ← Retour à mon garage
        </Link>
      </p>
    </div>
  );
}

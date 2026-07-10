import Image from "next/image";
import { ArrowRight } from "lucide-react";

const RIDECLOUD_URL = process.env.NEXT_PUBLIC_RIDECLOUD_URL ?? "https://ridecloud.app";

/**
 * Promotion discrète de RideCloud (marque principale multi-véhicules) depuis
 * RideCloudMoto : voitures, utilitaires et autres véhicules.
 */
export function RideCloudCrossSell() {
  return (
    <a
      href={RIDECLOUD_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="card-glow group flex items-center gap-3 rounded-xl border bg-card/60 p-4"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
        <Image
          src="/ridecloud-logo.png"
          alt="RideCloud"
          width={40}
          height={40}
          className="h-full w-full object-contain p-1"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">
          Vous avez aussi une voiture ou un utilitaire ?
        </p>
        <p className="text-xs text-muted-foreground">
          Gérez tous vos véhicules avec RideCloud, la version multi-véhicules.
        </p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </a>
  );
}

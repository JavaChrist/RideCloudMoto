import Link from "next/link";
import Image from "next/image";
import { Gauge, Calendar, AlertTriangle, ArrowUpRight } from "lucide-react";
import type { Vehicle } from "@/types/database";
import { defaultIllustration } from "@/lib/data/demo";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface VehicleCardProps {
  vehicle: Vehicle;
  reminderCount?: number;
  estimatedKm?: number;
}

export function VehicleCard({ vehicle, reminderCount = 0, estimatedKm }: VehicleCardProps) {
  const title = vehicle.surnom || `${vehicle.marque} ${vehicle.modele}`;
  const hasPhoto = Boolean(vehicle.photo_url);
  const imageSrc = vehicle.photo_url || defaultIllustration(vehicle.category);

  return (
    <Link href={`/vehicule/${vehicle.id}`} className="group block">
      <Card className="card-glow overflow-hidden">
        <div className="relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 via-card to-card">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(40rem_20rem_at_50%_120%,rgba(250,204,21,0.18),transparent)]" />
          <Image
            src={imageSrc}
            alt={title}
            fill={hasPhoto}
            width={hasPhoto ? undefined : 260}
            height={hasPhoto ? undefined : 150}
            className={
              hasPhoto
                ? "object-cover"
                : "relative object-contain p-4 drop-shadow-[0_8px_16px_rgba(250,204,21,0.25)] transition-transform duration-300 group-hover:scale-105"
            }
          />
          {reminderCount > 0 ? (
            <Badge variant="warning" className="absolute right-3 top-3 gap-1">
              <AlertTriangle className="h-3 w-3" />
              {reminderCount}
            </Badge>
          ) : null}
          <span className="absolute right-3 bottom-3 rounded-full bg-background/70 px-2 py-0.5 text-xs font-medium text-foreground backdrop-blur">
            {vehicle.annee}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 p-4">
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold tracking-tight">{title}</h3>
            <p className="truncate text-xs text-muted-foreground">
              {vehicle.marque} {vehicle.modele}
            </p>
            <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Gauge className="h-3.5 w-3.5 text-primary" />
                {(estimatedKm ?? vehicle.kilometrage).toLocaleString("fr-FR")} km
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {vehicle.annee}
              </span>
            </div>
          </div>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </Card>
    </Link>
  );
}

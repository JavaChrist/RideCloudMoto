"use client";

import dynamic from "next/dynamic";

const DealerMap = dynamic(() => import("./dealer-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
      Chargement de la carte…
    </div>
  ),
});

export function DealerMapCard({
  lat,
  lng,
  name,
  address,
}: {
  lat: number;
  lng: number;
  name: string;
  address?: string;
}) {
  return (
    <div className="h-64 w-full overflow-hidden rounded-xl border">
      <DealerMap lat={lat} lng={lng} name={name} address={address} />
    </div>
  );
}

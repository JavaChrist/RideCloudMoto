"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { SOS_KIND_EMOJI, SOS_KIND_LABELS } from "@/lib/sos/sos";
import type { SosKind } from "@/types/database";

export interface SosMapAlert {
  id: string;
  latitude: number;
  longitude: number;
  kind: SosKind;
  author_name: string | null;
  is_mine: boolean;
  distanceKm: number | null;
}

const sosIcon = L.divIcon({
  className: "sos-map-pin",
  html: `<span style="position:relative;display:block;width:26px;height:26px;">
    <span class="sos-pulse-ring" style="position:absolute;inset:0;border-radius:9999px;background:#dc2626;"></span>
    <span style="position:absolute;inset:5px;border-radius:9999px;background:#dc2626;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.5);"></span>
  </span>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
  popupAnchor: [0, -14],
});

const meIcon = L.divIcon({
  className: "sos-map-pin",
  html: `<span style="display:block;width:18px;height:18px;border-radius:9999px;background:#2563eb;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.5);"></span>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

export default function SosMap({
  center,
  userPos,
  alerts,
  onSelect,
}: {
  center: { lat: number; lng: number };
  userPos: { lat: number; lng: number } | null;
  alerts: SosMapAlert[];
  onSelect?: (id: string) => void;
}) {
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={11}
      scrollWheelZoom
      style={{ height: "100%", width: "100%" }}
    >
      <Recenter lat={center.lat} lng={center.lng} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {userPos ? <Marker position={[userPos.lat, userPos.lng]} icon={meIcon} /> : null}
      {alerts.map((a) => (
        <Marker
          key={a.id}
          position={[a.latitude, a.longitude]}
          icon={sosIcon}
          eventHandlers={{ click: () => onSelect?.(a.id) }}
        >
          <Popup>
            <strong>
              {SOS_KIND_EMOJI[a.kind]} {SOS_KIND_LABELS[a.kind]}
            </strong>
            <br />
            {a.author_name ?? "Motard"}
            {a.distanceKm != null ? (
              <>
                <br />à {a.distanceKm.toFixed(1)} km
              </>
            ) : null}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import {
  TriangleAlert,
  MapPin,
  MapPinOff,
  Phone,
  Send,
  Bike,
  X,
  Check,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  SOS_KIND_EMOJI,
  SOS_KIND_LABELS,
  SOS_RADIUS_KM,
  distanceKm,
} from "@/lib/sos/sos";
import {
  getPushSubscriptionState,
  isPushSupported,
  subscribeToPush,
} from "@/lib/push/client";
import type { SosKind } from "@/types/database";
import type { SosMapAlert } from "./sos-map";

const SosMap = dynamic(() => import("./sos-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
      Chargement de la carte…
    </div>
  ),
});

// Centre par défaut : France métropolitaine
const DEFAULT_CENTER = { lat: 46.6, lng: 2.4 };
const KINDS: SosKind[] = ["panne", "chute", "perdu", "autre"];

interface AlertItem {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  kind: SosKind;
  note: string | null;
  contact_phone: string | null;
  status: string;
  created_at: string;
  author_name: string | null;
  is_mine: boolean;
}

interface ChatMessage {
  id: string;
  kind: "message" | "coming";
  body: string | null;
  created_at: string;
  author_name: string | null;
  is_mine: boolean;
}

export function SosClient() {
  const searchParams = useSearchParams();
  const focusParam = searchParams.get("focus");

  const [geoEnabled, setGeoEnabled] = useState(false);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const watchRef = useRef<number | null>(null);

  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(focusParam);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [kind, setKind] = useState<SosKind>("panne");
  const [note, setNote] = useState("");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);

  const [pushOn, setPushOn] = useState<boolean | null>(null);

  // Téléphone mémorisé localement pour ré-usage
  useEffect(() => {
    const saved = window.localStorage.getItem("sos_phone");
    if (saved) setPhone(saved);
  }, []);

  // État des notifications push (pour recevoir les réponses au SOS)
  useEffect(() => {
    if (!isPushSupported()) {
      setPushOn(false);
      return;
    }
    getPushSubscriptionState()
      .then(setPushOn)
      .catch(() => setPushOn(false));
  }, []);

  async function enablePush() {
    try {
      const ok = await subscribeToPush();
      setPushOn(ok);
    } catch {
      setPushOn(false);
    }
  }

  // Géolocalisation : le choix de l'utilisateur est mémorisé et réactivé
  // automatiquement (il reste actif jusqu'à désactivation manuelle).
  const startGeo = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setGeoError("La géolocalisation n'est pas disponible sur cet appareil.");
      return;
    }
    setGeoError(null);
    setGeoEnabled(true);
    window.localStorage.setItem("sos_geo", "1");
    if (watchRef.current != null) navigator.geolocation.clearWatch(watchRef.current);
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {
        setGeoError("Position refusée par le navigateur. Réactivez-la pour voir les SOS proches.");
        setGeoEnabled(false);
        window.localStorage.setItem("sos_geo", "0");
      },
      { enableHighAccuracy: true, maximumAge: 15000, timeout: 20000 }
    );
  }, []);

  const stopGeo = useCallback(() => {
    if (watchRef.current != null) navigator.geolocation.clearWatch(watchRef.current);
    watchRef.current = null;
    setGeoEnabled(false);
    setUserPos(null);
    setGeoError(null);
    window.localStorage.setItem("sos_geo", "0");
  }, []);

  const toggleGeo = useCallback(() => {
    if (geoEnabled) stopGeo();
    else startGeo();
  }, [geoEnabled, startGeo, stopGeo]);

  // Réactive la localisation au chargement si elle était activée
  useEffect(() => {
    if (window.localStorage.getItem("sos_geo") === "1") startGeo();
  }, [startGeo]);

  useEffect(
    () => () => {
      if (watchRef.current != null) navigator.geolocation.clearWatch(watchRef.current);
    },
    []
  );

  // Chargement + polling des alertes
  const loadAlerts = useCallback(async () => {
    try {
      const res = await fetch("/api/sos", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setAlerts(data.alerts ?? []);
    } catch {
      /* silencieux */
    }
  }, []);

  useEffect(() => {
    loadAlerts();
    const t = setInterval(loadAlerts, 15000);
    return () => clearInterval(t);
  }, [loadAlerts]);

  const myActive = useMemo(() => alerts.find((a) => a.is_mine), [alerts]);

  // Alertes avec distance + filtrage 30 km (si position connue)
  const withDistance = useMemo(() => {
    return alerts.map((a) => ({
      ...a,
      dist: userPos
        ? distanceKm(userPos.lat, userPos.lng, a.latitude, a.longitude)
        : null,
    }));
  }, [alerts, userPos]);

  const nearby = useMemo(() => {
    const filtered = userPos
      ? withDistance.filter((a) => a.is_mine || (a.dist ?? Infinity) <= SOS_RADIUS_KM)
      : withDistance;
    return filtered.sort((a, b) => (a.dist ?? Infinity) - (b.dist ?? Infinity));
  }, [withDistance, userPos]);

  const mapAlerts: SosMapAlert[] = useMemo(
    () =>
      nearby.map((a) => ({
        id: a.id,
        latitude: a.latitude,
        longitude: a.longitude,
        kind: a.kind,
        author_name: a.author_name,
        is_mine: a.is_mine,
        distanceKm: a.dist,
      })),
    [nearby]
  );

  const mapCenter = useMemo(() => {
    if (userPos) return userPos;
    const first = nearby[0];
    if (first) return { lat: first.latitude, lng: first.longitude };
    return DEFAULT_CENTER;
  }, [userPos, nearby]);

  const selected = useMemo(
    () => nearby.find((a) => a.id === selectedId) ?? null,
    [nearby, selectedId]
  );

  // Envoi du SOS
  async function sendSos() {
    if (!userPos) return;
    setSending(true);
    try {
      const trimmedPhone = phone.trim();
      if (trimmedPhone) window.localStorage.setItem("sos_phone", trimmedPhone);
      const res = await fetch("/api/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: userPos.lat,
          longitude: userPos.lng,
          kind,
          note: note.trim() || undefined,
          contactPhone: trimmedPhone || undefined,
        }),
      });
      if (res.ok) {
        setConfirmOpen(false);
        setNote("");
        await loadAlerts();
      }
    } finally {
      setSending(false);
    }
  }

  async function closeAlert(status: "resolved" | "cancelled") {
    if (!myActive) return;
    const closedId = myActive.id;
    // Retrait optimiste : le point disparaît immédiatement de la carte et de la liste
    setAlerts((prev) => prev.filter((a) => a.id !== closedId));
    if (selectedId === closedId) setSelectedId(null);
    try {
      await fetch(`/api/sos/${closedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    } finally {
      await loadAlerts();
    }
  }

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <TriangleAlert className="h-6 w-6 text-red-600" />
            SOS entraide motard
          </h1>
          <p className="text-sm text-muted-foreground">
            Un motard s&apos;arrête pour un autre. Alerte la communauté dans un rayon de{" "}
            {SOS_RADIUS_KM} km.
          </p>
        </div>
        <Button
          variant={geoEnabled ? "secondary" : "outline"}
          size="sm"
          onClick={toggleGeo}
          className="gap-1.5"
        >
          {geoEnabled ? <MapPin className="h-4 w-4" /> : <MapPinOff className="h-4 w-4" />}
          {geoEnabled ? "Localisation activée" : "Activer la localisation"}
        </Button>
      </div>

      {/* Rappel secours */}
      <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
        ⚠️ En cas d&apos;urgence vitale (blessé grave), appelez le{" "}
        <a href="tel:112" className="font-bold underline">
          112
        </a>{" "}
        en priorité. Le SOS entraide complète les secours, il ne les remplace pas.
      </div>

      {geoError ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
          {geoError}
        </div>
      ) : null}

      {pushOn === false && isPushSupported() ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
          <span className="text-muted-foreground">
            🔔 Active les notifications pour être prévenu quand un motard répond à ton SOS
            (même app fermée).
          </span>
          <Button size="sm" onClick={enablePush}>
            Activer
          </Button>
        </div>
      ) : null}

      {/* Carte — `isolate` crée un contexte d'empilement pour que la carte
          (et les contrôles Leaflet en z-index élevé) restent SOUS les dialogues. */}
      <div className="relative isolate h-72 w-full overflow-hidden rounded-xl border sm:h-96">
        <SosMap
          center={mapCenter}
          userPos={userPos}
          alerts={mapAlerts}
          onSelect={setSelectedId}
        />
      </div>

      {/* Mon alerte active */}
      {myActive ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-red-300 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/40">
          <div className="text-sm">
            <p className="font-semibold text-red-800 dark:text-red-200">
              🔴 Ton SOS est actif ({SOS_KIND_LABELS[myActive.kind]})
            </p>
            <p className="text-muted-foreground">
              Les motards proches sont prévenus. Ouvre le chat pour voir qui arrive.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => setSelectedId(myActive.id)}>
              <MessageCircle className="mr-1 h-4 w-4" /> Voir le chat
            </Button>
            <Button size="sm" variant="outline" onClick={() => closeAlert("cancelled")}>
              <X className="mr-1 h-4 w-4" /> Annuler
            </Button>
            <Button size="sm" variant="outline" onClick={() => closeAlert("resolved")}>
              <Check className="mr-1 h-4 w-4" /> C&apos;est résolu
            </Button>
          </div>
        </div>
      ) : (
        <Button
          size="lg"
          className="h-auto min-h-16 w-full whitespace-normal px-4 text-center text-base font-bold leading-tight text-white bg-red-600 hover:bg-red-700 sm:text-lg"
          disabled={!geoEnabled || !userPos}
          onClick={() => setConfirmOpen(true)}
        >
          <TriangleAlert className="mr-2 h-5 w-5 shrink-0" />
          {geoEnabled && userPos ? "Lancer un SOS" : "Activez la localisation pour lancer un SOS"}
        </Button>
      )}

      {/* Liste des alertes proches */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground">
          {userPos
            ? `Alertes dans un rayon de ${SOS_RADIUS_KM} km`
            : "Alertes actives (activez la localisation pour filtrer par distance)"}
        </h2>
        {nearby.filter((a) => !a.is_mine).length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
            Aucun motard en détresse pour le moment. 🏍️
          </p>
        ) : (
          <ul className="space-y-2">
            {nearby
              .filter((a) => !a.is_mine)
              .map((a) => (
                <li key={a.id}>
                  <button
                    onClick={() => setSelectedId(a.id)}
                    className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent"
                  >
                    <span className="text-2xl">{SOS_KIND_EMOJI[a.kind]}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">
                        {SOS_KIND_LABELS[a.kind]} — {a.author_name ?? "Motard"}
                      </span>
                      <span className="block truncate text-sm text-muted-foreground">
                        {a.note ? a.note : "Besoin d'aide"}
                        {a.dist != null ? ` · ${a.dist.toFixed(1)} km` : ""}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
          </ul>
        )}
      </div>

      {/* Dialog confirmation SOS */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TriangleAlert className="h-5 w-5 text-red-600" /> Confirmer le SOS
            </DialogTitle>
            <DialogDescription>
              Ta position et ton message seront envoyés aux motards dans un rayon de{" "}
              {SOS_RADIUS_KM} km.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Type d&apos;alerte</label>
              <div className="grid grid-cols-2 gap-2">
                {KINDS.map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setKind(k)}
                    className={`flex items-center gap-2 rounded-lg border p-2 text-sm transition-colors ${
                      kind === k
                        ? "border-red-500 bg-red-50 font-semibold dark:bg-red-950/40"
                        : "hover:bg-accent"
                    }`}
                  >
                    <span className="text-lg">{SOS_KIND_EMOJI[k]}</span>
                    {SOS_KIND_LABELS[k]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Message (optionnel)
              </label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ex. Moto en panne, je suis sur la bande d'arrêt d'urgence…"
                maxLength={280}
                rows={2}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Téléphone (optionnel, visible par les secouristes)
              </label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="06 12 34 56 78"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={sending}>
              Annuler
            </Button>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={sendSos}
              disabled={sending || !userPos}
            >
              {sending ? "Envoi…" : "Envoyer le SOS"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog détail + chat */}
      <SosDetailDialog
        alert={selected}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}

function SosDetailDialog({
  alert,
  onClose,
}: {
  alert: (AlertItem & { dist: number | null }) | null;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const id = alert?.id ?? null;

  const loadMessages = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/sos/${id}/messages`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data.messages ?? []);
    } catch {
      /* silencieux */
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    loadMessages();
    const t = setInterval(loadMessages, 8000);
    return () => clearInterval(t);
  }, [id, loadMessages]);

  async function post(kind: "message" | "coming") {
    if (!id) return;
    if (kind === "message" && !text.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/sos/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, body: kind === "message" ? text.trim() : undefined }),
      });
      if (res.ok) {
        setText("");
        await loadMessages();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={!!alert} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        {alert ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {SOS_KIND_EMOJI[alert.kind]} {SOS_KIND_LABELS[alert.kind]} —{" "}
                {alert.author_name ?? "Motard"}
              </DialogTitle>
              <DialogDescription>
                {alert.note || "Un motard a besoin d'aide."}
                {alert.dist != null ? ` · à ${alert.dist.toFixed(1)} km` : ""}
              </DialogDescription>
            </DialogHeader>

            {alert.is_mine ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
                C&apos;est ton alerte. Les motards qui arrivent répondront ici — reste joignable.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Button className="flex-1" onClick={() => post("coming")} disabled={busy}>
                  <Bike className="mr-1 h-4 w-4" /> J&apos;arrive !
                </Button>
                {alert.contact_phone ? (
                  <Button variant="outline" asChild className="flex-1">
                    <a href={`tel:${alert.contact_phone}`}>
                      <Phone className="mr-1 h-4 w-4" /> Appeler
                    </a>
                  </Button>
                ) : null}
                <Button variant="outline" asChild className="flex-1">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${alert.latitude},${alert.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MapPin className="mr-1 h-4 w-4" /> Itinéraire
                  </a>
                </Button>
              </div>
            )}

            {/* Chat */}
            <div className="max-h-60 space-y-2 overflow-y-auto rounded-lg border bg-muted/30 p-3">
              {messages.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground">
                  Aucun message. Écris pour coordonner l&apos;entraide.
                </p>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.is_mine ? "items-end" : "items-start"}`}
                  >
                    <span
                      className={`max-w-[85%] rounded-2xl px-3 py-1.5 text-sm ${
                        m.kind === "coming"
                          ? "bg-green-600 text-white"
                          : m.is_mine
                            ? "bg-primary text-primary-foreground"
                            : "bg-background border"
                      }`}
                    >
                      {m.kind === "coming" ? "🏍️ " : ""}
                      {m.body}
                    </span>
                    <span className="mt-0.5 text-[11px] text-muted-foreground">
                      {m.is_mine ? "Moi" : m.author_name ?? "Motard"}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    post("message");
                  }
                }}
                placeholder="Écrire un message…"
                maxLength={500}
              />
              <Button size="icon" onClick={() => post("message")} disabled={busy}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

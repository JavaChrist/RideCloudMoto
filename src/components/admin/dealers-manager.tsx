"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, MapPin, Pencil, Plus, RefreshCw, Store, X } from "lucide-react";
import type { Dealer } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DealerMembersSection } from "./dealer-members-section";

interface DealerFormState {
  id: string | null;
  name: string;
  slug: string;
  logo_url: string;
  app_logo_url: string;
  primary_color: string;
  secondary_color: string;
  address: string;
  postal_code: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  latitude: string;
  longitude: string;
  brands: string[];
  booking_url: string;
  offer_months: string;
  hours: string;
  is_active: boolean;
}

const EMPTY_FORM: DealerFormState = {
  id: null,
  name: "",
  slug: "",
  logo_url: "",
  app_logo_url: "",
  primary_color: "",
  secondary_color: "",
  address: "",
  postal_code: "",
  city: "",
  phone: "",
  email: "",
  website: "",
  latitude: "",
  longitude: "",
  brands: [],
  booking_url: "",
  offer_months: "12",
  hours: "",
  is_active: true,
};

function dealerToForm(d: Dealer): DealerFormState {
  return {
    id: d.id,
    name: d.name ?? "",
    slug: d.slug ?? "",
    logo_url: d.logo_url ?? "",
    app_logo_url: d.app_logo_url ?? "",
    primary_color: d.primary_color ?? "",
    secondary_color: d.secondary_color ?? "",
    address: d.address ?? "",
    postal_code: d.postal_code ?? "",
    city: d.city ?? "",
    phone: d.phone ?? "",
    email: d.email ?? "",
    website: d.website ?? "",
    latitude: d.latitude != null ? String(d.latitude) : "",
    longitude: d.longitude != null ? String(d.longitude) : "",
    brands: d.brands ?? [],
    booking_url: d.booking_url ?? "",
    offer_months: String(d.offer_months ?? 12),
    hours: d.hours ? JSON.stringify(d.hours, null, 2) : "",
    is_active: d.is_active,
  };
}

export function DealersManager() {
  const [dealers, setDealers] = React.useState<Dealer[]>([]);
  const [catalogBrands, setCatalogBrands] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState<DealerFormState>(EMPTY_FORM);
  const [showForm, setShowForm] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [dealersRes, catalogRes] = await Promise.all([
        fetch("/api/admin/dealers"),
        fetch("/api/admin/catalog"),
      ]);
      const data = await dealersRes.json();
      if (!dealersRes.ok) {
        toast.error(data.error ?? "Erreur de chargement");
        return;
      }
      setDealers(data.dealers ?? []);
      if (catalogRes.ok) {
        const catalog = await catalogRes.json();
        setCatalogBrands(
          ((catalog.brands ?? []) as { name: string; is_active: boolean }[])
            .filter((b) => b.is_active)
            .map((b) => b.name)
        );
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const [geocoding, setGeocoding] = React.useState(false);

  /** Remplit latitude/longitude à partir de l'adresse saisie (OpenStreetMap). */
  async function geocodeAddress() {
    const query = [form.address, form.postal_code, form.city, "France"]
      .map((v) => v.trim())
      .filter(Boolean)
      .join(", ");
    if (!form.address.trim() && !form.city.trim()) {
      toast.error("Renseigne d'abord l'adresse ou la ville.");
      return;
    }
    setGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
        { headers: { Accept: "application/json" } }
      );
      const results = (await res.json()) as { lat: string; lon: string }[];
      if (!results?.length) {
        toast.error("Adresse introuvable. Vérifie l'orthographe ou complète la ville.");
        return;
      }
      setForm((prev) => ({
        ...prev,
        latitude: Number(results[0].lat).toFixed(6),
        longitude: Number(results[0].lon).toFixed(6),
      }));
      toast.success("Coordonnées GPS trouvées.");
    } catch {
      toast.error("Service de géolocalisation indisponible. Réessaie plus tard.");
    } finally {
      setGeocoding(false);
    }
  }

  function toggleBrand(brand: string) {
    setForm((prev) => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter((b) => b !== brand)
        : [...prev.brands, brand],
    }));
  }

  function set<K extends keyof DealerFormState>(key: K, value: DealerFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function startCreate() {
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function startEdit(dealer: Dealer) {
    setForm(dealerToForm(dealer));
    setShowForm(true);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Le nom est requis.");
      return;
    }

    let hours: unknown = null;
    if (form.hours.trim()) {
      try {
        hours = JSON.parse(form.hours);
      } catch {
        toast.error("Horaires : JSON invalide.");
        return;
      }
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/dealers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: form.id,
          name: form.name.trim(),
          slug: form.slug.trim() || undefined,
          logo_url: form.logo_url.trim(),
          app_logo_url: form.app_logo_url.trim(),
          primary_color: form.primary_color.trim(),
          secondary_color: form.secondary_color.trim(),
          address: form.address.trim(),
          postal_code: form.postal_code.trim(),
          city: form.city.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          website: form.website.trim(),
          latitude: form.latitude.trim(),
          longitude: form.longitude.trim(),
          brands: form.brands,
          booking_url: form.booking_url.trim(),
          offer_months: Number(form.offer_months),
          hours,
          is_active: form.is_active,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Enregistrement impossible");
        return;
      }
      toast.success(form.id ? "Concessionnaire mis à jour" : "Concessionnaire créé");
      setShowForm(false);
      setForm(EMPTY_FORM);
      await load();
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Concessionnaires</h1>
          <p className="text-sm text-muted-foreground">
            Gérez les partenaires : identité, couleurs, coordonnées, horaires et durée
            de l&apos;offre.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/catalogue">Catalogue →</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/dealer-codes">Codes →</Link>
          </Button>
          {!showForm ? (
            <Button size="sm" onClick={startCreate}>
              <Plus className="h-4 w-4" />
              Nouveau
            </Button>
          ) : null}
        </div>
      </div>

      {showForm ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {form.id ? "Modifier le concessionnaire" : "Nouveau concessionnaire"}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowForm(false);
                  setForm(EMPTY_FORM);
                }}
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>
              Les champs vides restent facultatifs. La couleur principale s&apos;applique au
              thème des clients rattachés (format hex, ex. #FACC15).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="d-name">Nom *</Label>
                  <Input
                    id="d-name"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Voge Moto Lyon"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="d-slug">Slug (identifiant URL)</Label>
                  <Input
                    id="d-slug"
                    value={form.slug}
                    onChange={(e) => set("slug", e.target.value)}
                    placeholder="voge-moto-lyon (auto si vide)"
                  />
                  <p className="text-xs text-muted-foreground">
                    Identifiant technique unique (minuscules, sans espaces). Laisse vide :
                    il est généré automatiquement depuis le nom.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="d-logo">Logo concessionnaire (URL)</Label>
                  <Input
                    id="d-logo"
                    value={form.logo_url}
                    onChange={(e) => set("logo_url", e.target.value)}
                    placeholder="https://…/logo.png"
                  />
                  <p className="text-xs text-muted-foreground">
                    Affiché sur la page « Mon concessionnaire » et le flyer.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="d-app-logo">Logo app (header, aux couleurs de la marque)</Label>
                  <Input
                    id="d-app-logo"
                    value={form.app_logo_url}
                    onChange={(e) => set("app_logo_url", e.target.value)}
                    placeholder="/logo-kawa.png ou https://…/logo.png"
                  />
                  <p className="text-xs text-muted-foreground">
                    Remplace le logo RideCloudMoto dans le header des clients. Vide = logo par défaut.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Marques distribuées</Label>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 rounded-lg border px-3 py-2.5">
                    {/* Marques du catalogue + éventuelles marques historiques hors catalogue */}
                    {[...new Set([...catalogBrands, ...form.brands])].map((brand) => (
                      <label key={brand} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={form.brands.includes(brand)}
                          onChange={() => toggleBrand(brand)}
                        />
                        {brand}
                        {!catalogBrands.includes(brand) ? (
                          <span className="text-xs text-muted-foreground">(hors catalogue)</span>
                        ) : null}
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Le client rattaché ne verra que les modèles de ces marques. Aucune
                    coche = tout le catalogue. Marques gérées depuis la page Catalogue.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="d-primary">Couleur principale</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="d-primary"
                      value={form.primary_color}
                      onChange={(e) => set("primary_color", e.target.value)}
                      placeholder="#FACC15"
                    />
                    <input
                      type="color"
                      aria-label="Sélecteur couleur principale"
                      value={/^#[0-9a-fA-F]{6}$/.test(form.primary_color) ? form.primary_color : "#FACC15"}
                      onChange={(e) => set("primary_color", e.target.value.toUpperCase())}
                      className="h-9 w-10 shrink-0 cursor-pointer rounded border bg-background"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="d-secondary">Couleur secondaire</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="d-secondary"
                      value={form.secondary_color}
                      onChange={(e) => set("secondary_color", e.target.value)}
                      placeholder="#111111"
                    />
                    <input
                      type="color"
                      aria-label="Sélecteur couleur secondaire"
                      value={/^#[0-9a-fA-F]{6}$/.test(form.secondary_color) ? form.secondary_color : "#111111"}
                      onChange={(e) => set("secondary_color", e.target.value.toUpperCase())}
                      className="h-9 w-10 shrink-0 cursor-pointer rounded border bg-background"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="d-address">Adresse</Label>
                  <Input
                    id="d-address"
                    value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                    placeholder="12 rue des Motos"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="d-postal">Code postal</Label>
                  <Input
                    id="d-postal"
                    value={form.postal_code}
                    onChange={(e) => set("postal_code", e.target.value)}
                    placeholder="69000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="d-city">Ville</Label>
                  <Input
                    id="d-city"
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                    placeholder="Lyon"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="d-phone">Téléphone</Label>
                  <Input
                    id="d-phone"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="04 78 00 00 00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="d-email">E-mail</Label>
                  <Input
                    id="d-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="contact@voge-lyon.fr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="d-website">Site web</Label>
                  <Input
                    id="d-website"
                    value={form.website}
                    onChange={(e) => set("website", e.target.value)}
                    placeholder="https://voge-lyon.fr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="d-booking">Prise de rendez-vous (URL)</Label>
                  <Input
                    id="d-booking"
                    value={form.booking_url}
                    onChange={(e) => set("booking_url", e.target.value)}
                    placeholder="https://…/rdv"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Coordonnées GPS (carte « Mon concessionnaire »)</Label>
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      aria-label="Latitude"
                      value={form.latitude}
                      onChange={(e) => set("latitude", e.target.value)}
                      placeholder="Latitude (45.7640)"
                      className="max-w-44"
                    />
                    <Input
                      aria-label="Longitude"
                      value={form.longitude}
                      onChange={(e) => set("longitude", e.target.value)}
                      placeholder="Longitude (4.8357)"
                      className="max-w-44"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={geocodeAddress}
                      disabled={geocoding}
                    >
                      {geocoding ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MapPin className="h-4 w-4" />
                      )}
                      Trouver depuis l&apos;adresse
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Saisis l&apos;adresse, le code postal et la ville ci-dessus, puis clique
                    sur « Trouver depuis l&apos;adresse » pour remplir automatiquement.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="d-offer">Durée de l&apos;offre (mois)</Label>
                  <Input
                    id="d-offer"
                    type="number"
                    min={1}
                    value={form.offer_months}
                    onChange={(e) => set("offer_months", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="d-hours">Horaires (JSON)</Label>
                <Textarea
                  id="d-hours"
                  value={form.hours}
                  onChange={(e) => set("hours", e.target.value)}
                  rows={5}
                  className="font-mono text-xs"
                  placeholder={`{\n  "lundi": "9h-12h / 14h-19h",\n  "samedi": "9h-18h"\n}`}
                />
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => set("is_active", e.target.checked)}
                />
                Concessionnaire actif
              </label>

              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowForm(false);
                    setForm(EMPTY_FORM);
                  }}
                >
                  Annuler
                </Button>
              </div>
            </form>

            {form.id ? (
              <div className="mt-6 border-t pt-6">
                <DealerMembersSection dealerId={form.id} />
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Partenaires enregistrés</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : dealers.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun concessionnaire.</p>
          ) : (
            <div className="space-y-2">
              {dealers.map((dealer) => (
                <div
                  key={dealer.id}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                    style={{
                      backgroundColor: dealer.primary_color ?? "hsl(var(--muted))",
                    }}
                  >
                    <Store className="h-5 w-5 text-black/70" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 font-semibold">
                      {dealer.name}
                      {!dealer.is_active ? (
                        <Badge variant="secondary">Inactif</Badge>
                      ) : null}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {[dealer.city, dealer.brands.join(", ")].filter(Boolean).join(" · ") ||
                        dealer.slug}
                      {` · offre ${dealer.offer_months} mois`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => startEdit(dealer)}
                    aria-label={`Modifier ${dealer.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

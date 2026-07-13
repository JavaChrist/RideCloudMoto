"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, Pencil, Plus, RefreshCw, Trash2, X } from "lucide-react";
import type {
  CatalogBrand,
  CatalogMaintenanceProfile,
  CatalogModel,
  VehicleCategory,
} from "@/types/database";
import { CATEGORY_LABELS } from "@/lib/data/categories";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const selectClass =
  "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const CATEGORIES: VehicleCategory[] = ["motos", "scooters", "quads"];

/** "2020-2026" ou "2020, 2021, 2023" → liste d'années. */
function parseYears(input: string): number[] {
  const trimmed = input.trim();
  if (!trimmed) return [];
  const range = trimmed.match(/^(\d{4})\s*-\s*(\d{4})$/);
  if (range) {
    const from = Number(range[1]);
    const to = Number(range[2]);
    const out: number[] = [];
    for (let y = from; y <= to && out.length < 80; y++) out.push(y);
    return out;
  }
  return [...new Set(
    trimmed
      .split(/[,;\s]+/)
      .map((y) => Number(y))
      .filter((y) => Number.isInteger(y) && y >= 1950 && y <= 2100)
  )].sort();
}

/** Liste d'années → représentation compacte "2020-2026" si contiguë. */
function formatYears(years: number[]): string {
  if (!years || years.length === 0) return "";
  const sorted = [...years].sort((a, b) => a - b);
  const contiguous = sorted.every((y, i) => i === 0 || y === sorted[i - 1] + 1);
  if (contiguous && sorted.length > 1) return `${sorted[0]}-${sorted[sorted.length - 1]}`;
  return sorted.join(", ");
}

interface ModelFormState {
  id: string | null;
  brand_id: string;
  category: VehicleCategory;
  name: string;
  years: string;
  profile_id: string;
  notice_url: string;
  specs: string;
  is_active: boolean;
}

const EMPTY_MODEL: ModelFormState = {
  id: null,
  brand_id: "",
  category: "motos",
  name: "",
  years: "",
  profile_id: "",
  notice_url: "",
  specs: "",
  is_active: true,
};

export function CatalogManager() {
  const [brands, setBrands] = React.useState<CatalogBrand[]>([]);
  const [models, setModels] = React.useState<CatalogModel[]>([]);
  const [profiles, setProfiles] = React.useState<CatalogMaintenanceProfile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  // Formulaires
  const [brandForm, setBrandForm] = React.useState<{
    id: string | null;
    name: string;
    logo_url: string;
    is_active: boolean;
  } | null>(null);
  const [modelForm, setModelForm] = React.useState<ModelFormState | null>(null);
  const [profileForm, setProfileForm] = React.useState<{
    id: string | null;
    key: string;
    label: string;
    tasks: string;
  } | null>(null);
  const [brandFilter, setBrandFilter] = React.useState<string>("");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/catalog");
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Erreur de chargement");
        return;
      }
      setBrands(data.brands ?? []);
      setModels(data.models ?? []);
      setProfiles(data.profiles ?? []);
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function save(entity: "brand" | "model" | "profile", data: Record<string, unknown>) {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entity, data }),
      });
      const payload = await res.json();
      if (!res.ok) {
        toast.error(payload.error ?? "Enregistrement impossible");
        return false;
      }
      toast.success("Enregistré");
      await load();
      return true;
    } catch {
      toast.error("Erreur réseau");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function remove(entity: "brand" | "model" | "profile", id: string, label: string) {
    if (!window.confirm(`Supprimer « ${label} » ? Cette action est définitive.`)) return;
    try {
      const res = await fetch(`/api/admin/catalog?entity=${entity}&id=${id}`, {
        method: "DELETE",
      });
      const payload = await res.json();
      if (!res.ok) {
        toast.error(payload.error ?? "Suppression impossible");
        return;
      }
      toast.success("Supprimé");
      await load();
    } catch {
      toast.error("Erreur réseau");
    }
  }

  const brandName = React.useCallback(
    (id: string) => brands.find((b) => b.id === id)?.name ?? "?",
    [brands]
  );
  const profileLabel = React.useCallback(
    (id: string | null) => profiles.find((p) => p.id === id)?.label ?? "—",
    [profiles]
  );

  const visibleModels = models.filter((m) => !brandFilter || m.brand_id === brandFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Catalogue</h1>
          <p className="text-sm text-muted-foreground">
            Marques, modèles et plans d&apos;entretien proposés dans l&apos;application.
            Seul l&apos;administrateur peut modifier ce catalogue.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/dealers">Concessionnaires →</Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="modeles" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="modeles">Modèles</TabsTrigger>
          <TabsTrigger value="marques">Marques</TabsTrigger>
          <TabsTrigger value="profils">Entretien</TabsTrigger>
        </TabsList>

        {/* ── MODÈLES ─────────────────────────────────────────────────────── */}
        <TabsContent value="modeles" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className={`${selectClass} max-w-56`}
              aria-label="Filtrer par marque"
            >
              <option value="">Toutes les marques</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <Button size="sm" onClick={() => setModelForm({ ...EMPTY_MODEL, brand_id: brandFilter })}>
              <Plus className="h-4 w-4" />
              Nouveau modèle
            </Button>
          </div>

          {modelForm ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {modelForm.id ? "Modifier le modèle" : "Nouveau modèle"}
                  </CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => setModelForm(null)} aria-label="Fermer">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>
                  Années : plage « 2020-2026 » ou liste « 2020, 2022 ». Fiche technique :
                  JSON clé/valeur (clés connues : cylindree, puissance, couple, poids…).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  className="space-y-4"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    let specs: unknown = {};
                    if (modelForm.specs.trim()) {
                      try {
                        specs = JSON.parse(modelForm.specs);
                      } catch {
                        toast.error("Fiche technique : JSON invalide.");
                        return;
                      }
                    }
                    const ok = await save("model", {
                      id: modelForm.id,
                      brand_id: modelForm.brand_id,
                      category: modelForm.category,
                      name: modelForm.name,
                      years: parseYears(modelForm.years),
                      profile_id: modelForm.profile_id || null,
                      notice_url: modelForm.notice_url,
                      specs,
                      is_active: modelForm.is_active,
                    });
                    if (ok) setModelForm(null);
                  }}
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="m-brand">Marque *</Label>
                      <select
                        id="m-brand"
                        value={modelForm.brand_id}
                        onChange={(e) => setModelForm({ ...modelForm, brand_id: e.target.value })}
                        required
                        className={selectClass}
                      >
                        <option value="">Sélectionnez…</option>
                        {brands.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="m-category">Catégorie *</Label>
                      <select
                        id="m-category"
                        value={modelForm.category}
                        onChange={(e) =>
                          setModelForm({ ...modelForm, category: e.target.value as VehicleCategory })
                        }
                        className={selectClass}
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {CATEGORY_LABELS[c]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="m-name">Nom du modèle *</Label>
                      <Input
                        id="m-name"
                        value={modelForm.name}
                        onChange={(e) => setModelForm({ ...modelForm, name: e.target.value })}
                        placeholder="Z900"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="m-years">Années</Label>
                      <Input
                        id="m-years"
                        value={modelForm.years}
                        onChange={(e) => setModelForm({ ...modelForm, years: e.target.value })}
                        placeholder="2020-2026"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="m-profile">Plan d&apos;entretien</Label>
                      <select
                        id="m-profile"
                        value={modelForm.profile_id}
                        onChange={(e) => setModelForm({ ...modelForm, profile_id: e.target.value })}
                        className={selectClass}
                      >
                        <option value="">Générique (par catégorie)</option>
                        {profiles.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="m-notice">Notice constructeur (URL)</Label>
                      <Input
                        id="m-notice"
                        value={modelForm.notice_url}
                        onChange={(e) => setModelForm({ ...modelForm, notice_url: e.target.value })}
                        placeholder="https://…/manuel.pdf"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="m-specs">Fiche technique (JSON)</Label>
                    <Textarea
                      id="m-specs"
                      value={modelForm.specs}
                      onChange={(e) => setModelForm({ ...modelForm, specs: e.target.value })}
                      rows={6}
                      className="font-mono text-xs"
                      placeholder={`{\n  "cylindree": "948 cm³",\n  "puissance": "125 ch"\n}`}
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={modelForm.is_active}
                      onChange={(e) => setModelForm({ ...modelForm, is_active: e.target.checked })}
                    />
                    Modèle actif (proposé aux utilisateurs)
                  </label>
                  <Button type="submit" disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <p className="text-sm text-muted-foreground">Chargement…</p>
              ) : visibleModels.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun modèle.</p>
              ) : (
                <div className="space-y-2">
                  {visibleModels.map((m) => (
                    <div key={m.id} className="flex items-center gap-3 rounded-lg border p-3">
                      <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-center gap-2 font-semibold">
                          {brandName(m.brand_id)} {m.name}
                          <Badge variant="secondary">{CATEGORY_LABELS[m.category]}</Badge>
                          {!m.is_active ? <Badge variant="secondary">Inactif</Badge> : null}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {formatYears(m.years) || "Années non renseignées"} · {profileLabel(m.profile_id)}
                          {m.notice_url ? " · notice ✓" : ""}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setModelForm({
                            id: m.id,
                            brand_id: m.brand_id,
                            category: m.category,
                            name: m.name,
                            years: formatYears(m.years),
                            profile_id: m.profile_id ?? "",
                            notice_url: m.notice_url ?? "",
                            specs: Object.keys(m.specs ?? {}).length
                              ? JSON.stringify(m.specs, null, 2)
                              : "",
                            is_active: m.is_active,
                          })
                        }
                        aria-label={`Modifier ${m.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => remove("model", m.id, `${brandName(m.brand_id)} ${m.name}`)}
                        aria-label={`Supprimer ${m.name}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── MARQUES ─────────────────────────────────────────────────────── */}
        <TabsContent value="marques" className="space-y-4">
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={() => setBrandForm({ id: null, name: "", logo_url: "", is_active: true })}
            >
              <Plus className="h-4 w-4" />
              Nouvelle marque
            </Button>
          </div>

          {brandForm ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {brandForm.id ? "Modifier la marque" : "Nouvelle marque"}
                  </CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => setBrandForm(null)} aria-label="Fermer">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form
                  className="space-y-4"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const ok = await save("brand", {
                      id: brandForm.id,
                      name: brandForm.name,
                      logo_url: brandForm.logo_url,
                      is_active: brandForm.is_active,
                    });
                    if (ok) setBrandForm(null);
                  }}
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="b-name">Nom *</Label>
                      <Input
                        id="b-name"
                        value={brandForm.name}
                        onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                        placeholder="Kawasaki"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="b-logo">Logo (URL ou /fichier.png dans public)</Label>
                      <Input
                        id="b-logo"
                        value={brandForm.logo_url}
                        onChange={(e) => setBrandForm({ ...brandForm, logo_url: e.target.value })}
                        placeholder="/logo-kawasaki.png"
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={brandForm.is_active}
                      onChange={(e) => setBrandForm({ ...brandForm, is_active: e.target.checked })}
                    />
                    Marque active
                  </label>
                  <Button type="submit" disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <p className="text-sm text-muted-foreground">Chargement…</p>
              ) : brands.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune marque.</p>
              ) : (
                <div className="space-y-2">
                  {brands.map((b) => (
                    <div key={b.id} className="flex items-center gap-3 rounded-lg border p-3">
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-2 font-semibold">
                          {b.name}
                          {!b.is_active ? <Badge variant="secondary">Inactive</Badge> : null}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {models.filter((m) => m.brand_id === b.id).length} modèle(s)
                          {b.logo_url ? " · logo ✓" : ""}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setBrandForm({
                            id: b.id,
                            name: b.name,
                            logo_url: b.logo_url ?? "",
                            is_active: b.is_active,
                          })
                        }
                        aria-label={`Modifier ${b.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => remove("brand", b.id, b.name)}
                        aria-label={`Supprimer ${b.name}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── PROFILS D'ENTRETIEN ─────────────────────────────────────────── */}
        <TabsContent value="profils" className="space-y-4">
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={() => setProfileForm({ id: null, key: "", label: "", tasks: "[]" })}
            >
              <Plus className="h-4 w-4" />
              Nouveau profil
            </Button>
          </div>

          {profileForm ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {profileForm.id ? "Modifier le profil" : "Nouveau profil"}
                  </CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => setProfileForm(null)} aria-label="Fermer">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>
                  Tâches : tableau JSON. Champs : titre, categorie (Moteur, Transmission,
                  Freinage, Pneumatiques, Liquides, Contrôle, Révision), description,
                  intervalKm, intervalMonths, firstDueKm, priority (normal, important, urgent).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  className="space-y-4"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    let tasks: unknown;
                    try {
                      tasks = JSON.parse(profileForm.tasks || "[]");
                    } catch {
                      toast.error("Tâches : JSON invalide.");
                      return;
                    }
                    if (!Array.isArray(tasks)) {
                      toast.error("Les tâches doivent être un tableau JSON.");
                      return;
                    }
                    const ok = await save("profile", {
                      id: profileForm.id,
                      key: profileForm.key,
                      label: profileForm.label,
                      tasks,
                    });
                    if (ok) setProfileForm(null);
                  }}
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="p-key">Clé technique *</Label>
                      <Input
                        id="p-key"
                        value={profileForm.key}
                        onChange={(e) => setProfileForm({ ...profileForm, key: e.target.value })}
                        placeholder="moto_jap_4cylindres"
                        required
                        disabled={!!profileForm.id}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="p-label">Libellé *</Label>
                      <Input
                        id="p-label"
                        value={profileForm.label}
                        onChange={(e) => setProfileForm({ ...profileForm, label: e.target.value })}
                        placeholder="Moto japonaise — 4 cylindres"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="p-tasks">Tâches (JSON)</Label>
                    <Textarea
                      id="p-tasks"
                      value={profileForm.tasks}
                      onChange={(e) => setProfileForm({ ...profileForm, tasks: e.target.value })}
                      rows={14}
                      className="font-mono text-xs"
                      placeholder={`[\n  {\n    "titre": "Vidange huile moteur + filtre",\n    "categorie": "Moteur",\n    "intervalKm": 12000,\n    "intervalMonths": 12,\n    "priority": "important"\n  }\n]`}
                    />
                  </div>
                  <Button type="submit" disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <p className="text-sm text-muted-foreground">Chargement…</p>
              ) : profiles.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun profil.</p>
              ) : (
                <div className="space-y-2">
                  {profiles.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 rounded-lg border p-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{p.label}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {p.key} · {Array.isArray(p.tasks) ? p.tasks.length : 0} tâche(s) ·{" "}
                          {models.filter((m) => m.profile_id === p.id).length} modèle(s)
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setProfileForm({
                            id: p.id,
                            key: p.key,
                            label: p.label,
                            tasks: JSON.stringify(p.tasks ?? [], null, 2),
                          })
                        }
                        aria-label={`Modifier ${p.label}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => remove("profile", p.id, p.label)}
                        aria-label={`Supprimer ${p.label}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ImagePlus, Bike, X } from "lucide-react";
import type { VehicleCategory } from "@/types/database";
import {
  getModelsByCategory,
  findCatalogModel,
  CATEGORY_LABELS_SINGULAR,
} from "@/lib/data/vehicle-catalog";
import { FUEL_OPTIONS } from "@/lib/data/fuel-options";
import { USAGE_PROFILE_LABELS, USAGE_PROFILE_DESCRIPTIONS } from "@/lib/usage-profile";
import { defaultIllustration } from "@/lib/data/demo";
import { createClient } from "@/lib/supabase/client";
import { createVehicle, setVehiclePhoto } from "@/app/(protected)/vehicules/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const USAGE_PROFILES = ["daily", "often", "occasional", "rare"] as const;
const PHOTO_BUCKET = "vehicle-photos";
const MAX_PHOTO = 5 * 1024 * 1024;

const selectClass =
  "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function AddVehicleForm({
  defaultCategory,
  userId,
}: {
  defaultCategory?: VehicleCategory;
  userId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [category, setCategory] = React.useState<VehicleCategory>(defaultCategory ?? "motos");
  const [modele, setModele] = React.useState("");
  const [usage, setUsage] = React.useState<(typeof USAGE_PROFILES)[number]>("often");
  const [photoFile, setPhotoFile] = React.useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(null);
  const photoInputRef = React.useRef<HTMLInputElement>(null);

  const models = React.useMemo(() => getModelsByCategory(category), [category]);
  const selectedModel = findCatalogModel(category, modele);
  const availableYears = selectedModel?.annees ?? [];

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_PHOTO) {
      toast.error("Photo trop volumineuse (5 Mo max).");
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function clearPhoto() {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (photoInputRef.current) photoInputRef.current.value = "";
  }

  async function uploadPhoto(vehicleId: string): Promise<void> {
    if (!photoFile) return;
    const supabase = createClient();
    const ext = photoFile.name.split(".").pop() || "jpg";
    const path = `${userId}/${vehicleId}/photo-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from(PHOTO_BUCKET)
      .upload(path, photoFile, { upsert: true });
    if (error) {
      toast.warning("Véhicule créé, mais l'upload de la photo a échoué.");
      return;
    }
    const { data } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
    if (data?.publicUrl) await setVehiclePhoto(vehicleId, data.publicUrl);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    const payload = {
      category,
      marque: "Voge",
      modele,
      annee: Number(fd.get("annee")),
      kilometrage: Number(fd.get("kilometrage") || 0),
      date_mise_en_circulation: (fd.get("date_mise_en_circulation") as string) || null,
      date_achat: (fd.get("date_achat") as string) || null,
      carburant: (fd.get("carburant") as string) || "essence",
      immatriculation: (fd.get("immatriculation") as string) || null,
      vin: null,
      surnom: (fd.get("surnom") as string) || null,
      usage_profile: usage,
    };

    const res = await createVehicle(payload);
    if (!res.ok || !res.vehicleId) {
      setLoading(false);
      toast.error(res.error ?? "Erreur");
      return;
    }

    await uploadPhoto(res.vehicleId);

    toast.success("Véhicule ajouté. Plan d'entretien généré.");
    router.push(`/vehicule/${res.vehicleId}`);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bike className="h-5 w-5 text-primary" />
          Nouveau véhicule
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo */}
          <div className="space-y-2">
            <Label>Photo (optionnel)</Label>
            <div className="flex items-center gap-4">
              <div className="relative flex h-24 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-gradient-to-br from-primary/10 to-transparent">
                <Image
                  src={photoPreview || defaultIllustration(category)}
                  alt="Aperçu"
                  fill={!!photoPreview}
                  width={photoPreview ? undefined : 120}
                  height={photoPreview ? undefined : 80}
                  className={photoPreview ? "object-cover" : "object-contain p-2"}
                />
                {photoPreview ? (
                  <button
                    type="button"
                    onClick={clearPhoto}
                    className="absolute right-1 top-1 rounded-full bg-background/80 p-1"
                    aria-label="Retirer la photo"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
              <div>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
                <Button type="button" variant="outline" size="sm" onClick={() => photoInputRef.current?.click()}>
                  <ImagePlus className="h-4 w-4" />
                  Choisir une photo
                </Button>
                <p className="mt-1 text-xs text-muted-foreground">
                  Sinon, une illustration {CATEGORY_LABELS_SINGULAR[category].toLowerCase()} est utilisée.
                </p>
              </div>
            </div>
          </div>

          {/* Catégorie */}
          <div className="space-y-2">
            <Label>Catégorie</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["motos", "scooters"] as VehicleCategory[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setCategory(cat);
                    setModele("");
                  }}
                  className={`rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                    category === cat
                      ? "border-primary bg-accent text-accent-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  {CATEGORY_LABELS_SINGULAR[cat]}
                </button>
              ))}
            </div>
          </div>

          {/* Modèle */}
          <div className="space-y-2">
            <Label htmlFor="modele">Modèle</Label>
            <select
              id="modele"
              value={modele}
              onChange={(e) => setModele(e.target.value)}
              required
              className={selectClass}
            >
              <option value="">Sélectionnez un modèle…</option>
              {models.map((m) => (
                <option key={m.modele} value={m.modele}>
                  {m.modele}
                </option>
              ))}
            </select>
          </div>

          {/* Année + Kilométrage */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="annee">Année</Label>
              {availableYears.length > 0 ? (
                <select id="annee" name="annee" required className={selectClass}>
                  {[...availableYears].reverse().map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              ) : (
                <Input id="annee" name="annee" type="number" min={1990} required />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="kilometrage">Kilométrage</Label>
              <Input
                id="kilometrage"
                name="kilometrage"
                type="number"
                min={0}
                placeholder="Ex. 12500"
                required
              />
            </div>
          </div>

          {/* Carburant + Usage */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="carburant">Carburant</Label>
              <select id="carburant" name="carburant" defaultValue="essence" className={selectClass}>
                {FUEL_OPTIONS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="usage">Usage</Label>
              <select
                id="usage"
                value={usage}
                onChange={(e) => setUsage(e.target.value as (typeof USAGE_PROFILES)[number])}
                className={selectClass}
              >
                {USAGE_PROFILES.map((u) => (
                  <option key={u} value={u}>
                    {USAGE_PROFILE_LABELS[u]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="-mt-3 text-xs text-muted-foreground">{USAGE_PROFILE_DESCRIPTIONS[usage]}</p>

          {/* Détails optionnels */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="surnom">Surnom (optionnel)</Label>
              <Input id="surnom" name="surnom" placeholder="Ma trail" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="immatriculation">Immatriculation</Label>
              <Input id="immatriculation" name="immatriculation" placeholder="AA-123-BB" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_achat">Date d&apos;achat</Label>
              <Input id="date_achat" name="date_achat" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_mise_en_circulation">1ère mise en circulation</Label>
              <Input id="date_mise_en_circulation" name="date_mise_en_circulation" type="date" />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading || !modele}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ajouter le véhicule"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

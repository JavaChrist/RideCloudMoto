"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ensureMaintenancePlanForVehicle } from "@/lib/data/vehicle-repository";
import { getUserPlanState } from "@/lib/billing/limits";
import { getWriteGuard } from "@/lib/billing/write-guard";
import { avgKmPerYear } from "@/lib/usage-profile";
import { vehicleFormSchema } from "@/lib/validators/vehicle";
import { BRAND_INTERNAL } from "@/lib/data/vehicle-catalog";
import { isAdminEmail } from "@/lib/admin";
import type { Profile, UsageProfile, Vehicle, VehicleCategory } from "@/types/database";

export interface ActionResult {
  ok: boolean;
  error?: string;
  vehicleId?: string;
}

export async function createVehicle(input: unknown): Promise<ActionResult> {
  const parsed = vehicleFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Non authentifié" };

  // Limite de véhicules selon le plan effectif
  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const { ensureProfile } = await import("@/lib/billing/ensure-profile");
    await ensureProfile(createAdminClient(), user.id, user.email ?? "");
    const refetch = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    profile = refetch.data;
  }
  const state = getUserPlanState(profile as Profile);
  const isAdmin = isAdminEmail(user.email);

  if (!state.hasAccess && !isAdmin) {
    return {
      ok: false,
      error: "Activez votre code concessionnaire ou souscrivez au Premium pour ajouter un véhicule.",
    };
  }

  const { count } = await supabase
    .from("vehicles")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (!isAdmin && (count ?? 0) >= state.maxVehicles) {
    return {
      ok: false,
      error:
        state.effectivePlan === "free"
          ? "Limite atteinte. Passez en Premium pour ajouter plus de véhicules."
          : "Nombre maximal de véhicules atteint.",
    };
  }

  const v = parsed.data;
  const usage = (v.usage_profile ?? "often") as UsageProfile;

  const { data: inserted, error } = await supabase
    .from("vehicles")
    .insert({
      user_id: user.id,
      category: v.category as VehicleCategory,
      marque: v.marque || BRAND_INTERNAL,
      modele: v.modele,
      annee: v.annee,
      kilometrage: v.kilometrage,
      date_mise_en_circulation: v.date_mise_en_circulation || null,
      date_achat: v.date_achat || null,
      carburant: v.carburant || "essence",
      immatriculation: v.immatriculation || null,
      vin: v.vin || null,
      surnom: v.surnom || null,
      usage_profile: usage,
      avg_km_per_year: avgKmPerYear(v.category as VehicleCategory, usage),
      last_odometer_value: v.kilometrage,
      last_odometer_date: new Date().toISOString().slice(0, 10),
    })
    .select("*")
    .single();

  if (error || !inserted) {
    return { ok: false, error: error?.message ?? "Échec de la création" };
  }

  // Génération automatique du plan d'entretien (templates Voge)
  try {
    await ensureMaintenancePlanForVehicle(supabase, inserted as Vehicle);
  } catch (e) {
    console.error("[createVehicle] plan generation", e);
  }

  revalidatePath("/categories");
  revalidatePath(`/vehicules/${v.category}`);
  return { ok: true, vehicleId: (inserted as Vehicle).id };
}

export async function deleteVehicle(vehicleId: string): Promise<ActionResult> {
  const { supabase, userId, canWrite, reason } = await getWriteGuard();
  if (!userId) return { ok: false, error: "Non authentifié" };
  if (!canWrite) return { ok: false, error: reason ?? "Action non autorisée" };

  const { error } = await supabase
    .from("vehicles")
    .delete()
    .eq("id", vehicleId)
    .eq("user_id", userId);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/categories");
  return { ok: true };
}

export async function setVehiclePhoto(
  vehicleId: string,
  photoUrl: string | null
): Promise<ActionResult> {
  const { supabase, userId, canWrite, reason } = await getWriteGuard();
  if (!userId) return { ok: false, error: "Non authentifié" };
  if (!canWrite) return { ok: false, error: reason ?? "Action non autorisée" };

  const { error } = await supabase
    .from("vehicles")
    .update({ photo_url: photoUrl })
    .eq("id", vehicleId)
    .eq("user_id", userId);

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/vehicule/${vehicleId}`);
  return { ok: true };
}

export async function updateKilometrage(
  vehicleId: string,
  kilometrage: number
): Promise<ActionResult> {
  // Exception : la mise à jour du kilométrage reste autorisée même en lecture
  // seule (offre expirée), pour permettre un suivi minimal de l'usage.
  const { supabase, userId, canWrite, isReadOnly, reason } = await getWriteGuard();
  if (!userId) return { ok: false, error: "Non authentifié" };
  if (!canWrite && !isReadOnly) return { ok: false, error: reason ?? "Action non autorisée" };

  const { error } = await supabase
    .from("vehicles")
    .update({
      kilometrage,
      last_odometer_value: kilometrage,
      last_odometer_date: new Date().toISOString().slice(0, 10),
    })
    .eq("id", vehicleId)
    .eq("user_id", userId);

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/vehicule/${vehicleId}`);
  return { ok: true };
}

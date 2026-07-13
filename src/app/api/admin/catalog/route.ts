import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/admin";

export const dynamic = "force-dynamic";

/**
 * Gestion du catalogue multi-marques (admin uniquement) :
 * marques, modèles et profils d'entretien. Les concessionnaires n'y ont pas
 * accès en écriture — toute modification passe par l'administrateur.
 */

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) return null;
  return user;
}

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function clean(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t : null;
}

/** Catalogue complet : marques, profils et modèles. */
export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const admin = createAdminClient();
  const [brands, profiles, models] = await Promise.all([
    admin.from("catalog_brands").select("*").order("name"),
    admin.from("catalog_maintenance_profiles").select("*").order("label"),
    admin.from("catalog_models").select("*").order("name"),
  ]);

  const error = brands.error ?? profiles.error ?? models.error;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    brands: brands.data ?? [],
    profiles: profiles.data ?? [],
    models: models.data ?? [],
  });
}

/** Crée ou met à jour une marque, un modèle ou un profil d'entretien. */
export async function POST(request: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  const entity = body.entity;
  const data = (body.data ?? {}) as Record<string, unknown>;
  const id = clean(data.id);
  const admin = createAdminClient();

  if (entity === "brand") {
    const name = clean(data.name);
    if (!name) return NextResponse.json({ error: "Le nom de la marque est requis." }, { status: 400 });
    const payload = {
      name,
      slug: clean(data.slug) ?? slugify(name),
      logo_url: clean(data.logo_url),
      is_active: data.is_active === undefined ? true : Boolean(data.is_active),
    };
    const query = id
      ? admin.from("catalog_brands").update(payload).eq("id", id)
      : admin.from("catalog_brands").insert(payload);
    const { data: row, error } = await query.select("*").maybeSingle();
    if (error) {
      const message = error.code === "23505" ? "Cette marque (ou ce slug) existe déjà." : error.message;
      return NextResponse.json({ error: message }, { status: 400 });
    }
    return NextResponse.json({ brand: row });
  }

  if (entity === "model") {
    const name = clean(data.name);
    const brandId = clean(data.brand_id);
    const category = clean(data.category);
    if (!name || !brandId || !category) {
      return NextResponse.json(
        { error: "Marque, catégorie et nom du modèle sont requis." },
        { status: 400 }
      );
    }
    if (!["motos", "scooters", "quads"].includes(category)) {
      return NextResponse.json({ error: "Catégorie invalide." }, { status: 400 });
    }
    const years = Array.isArray(data.years)
      ? data.years.map((y) => Number(y)).filter((y) => Number.isInteger(y) && y >= 1950 && y <= 2100)
      : [];
    const specs =
      data.specs && typeof data.specs === "object" && !Array.isArray(data.specs)
        ? (data.specs as Record<string, unknown>)
        : {};
    const payload = {
      name,
      brand_id: brandId,
      category,
      years,
      specs,
      notice_url: clean(data.notice_url),
      profile_id: clean(data.profile_id),
      is_active: data.is_active === undefined ? true : Boolean(data.is_active),
    };
    const query = id
      ? admin.from("catalog_models").update(payload).eq("id", id)
      : admin.from("catalog_models").insert(payload);
    const { data: row, error } = await query.select("*").maybeSingle();
    if (error) {
      const message =
        error.code === "23505" ? "Ce modèle existe déjà pour cette marque et cette catégorie." : error.message;
      return NextResponse.json({ error: message }, { status: 400 });
    }
    return NextResponse.json({ model: row });
  }

  if (entity === "profile") {
    const key = clean(data.key);
    const label = clean(data.label);
    if (!key || !label) {
      return NextResponse.json({ error: "Clé et libellé du profil sont requis." }, { status: 400 });
    }
    if (!Array.isArray(data.tasks)) {
      return NextResponse.json({ error: "Les tâches doivent être un tableau JSON." }, { status: 400 });
    }
    const payload = { key: slugify(key).replace(/-/g, "_"), label, tasks: data.tasks };
    const query = id
      ? admin.from("catalog_maintenance_profiles").update(payload).eq("id", id)
      : admin.from("catalog_maintenance_profiles").insert(payload);
    const { data: row, error } = await query.select("*").maybeSingle();
    if (error) {
      const message = error.code === "23505" ? "Cette clé de profil existe déjà." : error.message;
      return NextResponse.json({ error: message }, { status: 400 });
    }
    return NextResponse.json({ profile: row });
  }

  return NextResponse.json({ error: "Entité inconnue." }, { status: 400 });
}

/** Supprime une marque (et ses modèles), un modèle ou un profil. */
export async function DELETE(request: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const entity = searchParams.get("entity");
  const id = clean(searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "Identifiant requis." }, { status: 400 });

  const tables: Record<string, string> = {
    brand: "catalog_brands",
    model: "catalog_models",
    profile: "catalog_maintenance_profiles",
  };
  const table = entity ? tables[entity] : undefined;
  if (!table) return NextResponse.json({ error: "Entité inconnue." }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin.from(table).delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

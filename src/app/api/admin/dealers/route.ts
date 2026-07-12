import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/admin";
import type { DealerHours } from "@/types/database";

export const dynamic = "force-dynamic";

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

function parseBrands(v: unknown): string[] {
  if (Array.isArray(v)) {
    return v.map((b) => String(b).trim()).filter(Boolean);
  }
  if (typeof v === "string") {
    return v
      .split(",")
      .map((b) => b.trim())
      .filter(Boolean);
  }
  return [];
}

function parseHours(v: unknown): DealerHours | null {
  if (v && typeof v === "object" && !Array.isArray(v)) {
    return v as DealerHours;
  }
  return null;
}

/** Liste des concessionnaires (admin). */
export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("dealers")
    .select("*")
    .order("name", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ dealers: data ?? [] });
}

/** Crée ou met à jour un concessionnaire (admin). */
export async function POST(request: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const name = clean(body.name);
  if (!name) {
    return NextResponse.json({ error: "Le nom est requis." }, { status: 400 });
  }

  const slug = clean(body.slug) ?? slugify(name);
  const offerMonthsRaw = Number(body.offer_months);
  const latitude = body.latitude != null && body.latitude !== "" ? Number(body.latitude) : null;
  const longitude = body.longitude != null && body.longitude !== "" ? Number(body.longitude) : null;

  const payload = {
    slug,
    name,
    logo_url: clean(body.logo_url),
    app_logo_url: clean(body.app_logo_url),
    primary_color: clean(body.primary_color),
    secondary_color: clean(body.secondary_color),
    address: clean(body.address),
    postal_code: clean(body.postal_code),
    city: clean(body.city),
    phone: clean(body.phone),
    email: clean(body.email),
    website: clean(body.website),
    latitude: Number.isFinite(latitude) ? latitude : null,
    longitude: Number.isFinite(longitude) ? longitude : null,
    hours: parseHours(body.hours),
    brands: parseBrands(body.brands),
    booking_url: clean(body.booking_url),
    offer_months: Number.isFinite(offerMonthsRaw) && offerMonthsRaw > 0 ? Math.round(offerMonthsRaw) : 12,
    is_active: body.is_active === undefined ? true : Boolean(body.is_active),
  };

  const admin = createAdminClient();
  const id = clean(body.id);

  if (id) {
    const { data, error } = await admin
      .from("dealers")
      .update(payload)
      .eq("id", id)
      .select("*")
      .maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ dealer: data });
  }

  const { data, error } = await admin
    .from("dealers")
    .insert(payload)
    .select("*")
    .maybeSingle();
  if (error) {
    const message = error.code === "23505" ? "Ce slug existe déjà." : error.message;
    return NextResponse.json({ error: message }, { status: 400 });
  }
  return NextResponse.json({ dealer: data });
}

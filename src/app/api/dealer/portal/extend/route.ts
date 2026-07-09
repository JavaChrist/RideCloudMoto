import { NextResponse } from "next/server";
import { requireDealerApiContext } from "@/lib/dealer/membership";
import { extendDealerLicense } from "@/lib/billing/dealer-activation";

export const dynamic = "force-dynamic";

/** Prolonge la licence d'un client (fidélisation après révision). */
export async function POST(request: Request) {
  const ctx = await requireDealerApiContext();
  if (!ctx) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  let body: { codeId?: string; months?: number };
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const codeId = body.codeId?.trim();
  if (!codeId) {
    return NextResponse.json({ error: "Fiche requise." }, { status: 400 });
  }

  const result = await extendDealerLicense(
    ctx.admin,
    ctx.membership.dealerId,
    codeId,
    body.months
  );

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, until: result.until });
}

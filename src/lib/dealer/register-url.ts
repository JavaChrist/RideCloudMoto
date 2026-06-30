import QRCode from "qrcode";
import { getPublicSiteUrl } from "@/lib/supabase/env";

export function buildRegisterUrl(code: string, baseUrl?: string): string {
  const base = (baseUrl ?? getPublicSiteUrl()).replace(/\/$/, "");
  return `${base}/register?code=${encodeURIComponent(code.trim().toUpperCase())}`;
}

/** Génère un QR code en data URL (client ou serveur) — fiable à l'impression. */
export async function buildQrCodeDataUrl(data: string, size = 200): Promise<string> {
  return QRCode.toDataURL(data, { width: size, margin: 1, errorCorrectionLevel: "M" });
}

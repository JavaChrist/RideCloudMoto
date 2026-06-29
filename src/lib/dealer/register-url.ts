import { getSiteUrl } from "@/lib/supabase/env";

export function buildRegisterUrl(code: string, baseUrl?: string): string {
  const base = (baseUrl ?? getSiteUrl()).replace(/\/$/, "");
  return `${base}/register?code=${encodeURIComponent(code.trim().toUpperCase())}`;
}

/** URL d'image QR (api.qrserver.com) — usage admin / impression uniquement. */
export function buildQrCodeImageUrl(data: string, size = 200): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&format=svg&data=${encodeURIComponent(data)}`;
}

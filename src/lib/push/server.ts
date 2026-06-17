import webpush from "web-push";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { PushSubscriptionRow } from "@/types/database";

let configured = false;

function ensureConfigured() {
  if (configured) return;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const contact = process.env.VAPID_CONTACT_EMAIL ?? "mailto:support@ridecloudmoto.fr";
  if (!publicKey || !privateKey) throw new Error("Clés VAPID manquantes.");
  webpush.setVapidDetails(contact, publicKey, privateKey);
  configured = true;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

/**
 * Envoie une notification à toutes les souscriptions d'un utilisateur.
 * Nettoie automatiquement les souscriptions expirées (404/410).
 */
export async function sendPushToUser(
  admin: SupabaseClient,
  userId: string,
  payload: PushPayload
): Promise<{ sent: number; removed: number }> {
  ensureConfigured();

  const { data: subs } = await admin
    .from("push_subscriptions")
    .select("*")
    .eq("user_id", userId);

  let sent = 0;
  let removed = 0;
  const body = JSON.stringify(payload);

  for (const sub of (subs ?? []) as PushSubscriptionRow[]) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        body
      );
      sent += 1;
    } catch (err: unknown) {
      const statusCode = (err as { statusCode?: number })?.statusCode;
      if (statusCode === 404 || statusCode === 410) {
        await admin.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
        removed += 1;
      }
    }
  }

  return { sent, removed };
}

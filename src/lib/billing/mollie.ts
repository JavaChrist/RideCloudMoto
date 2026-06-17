import createMollieClient, { type MollieClient } from "@mollie/api-client";

let client: MollieClient | null = null;

export function getMollieClient(): MollieClient {
  if (client) return client;
  const apiKey = process.env.MOLLIE_API_KEY;
  if (!apiKey) throw new Error("MOLLIE_API_KEY manquant");
  client = createMollieClient({ apiKey });
  return client;
}

export function isMollieConfigured(): boolean {
  return Boolean(process.env.MOLLIE_API_KEY);
}

export function formatMollieAmount(amount: number): string {
  return amount.toFixed(2);
}

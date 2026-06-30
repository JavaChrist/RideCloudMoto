import { format, formatDistanceToNowStrict } from "date-fns";
import { fr } from "date-fns/locale";

/** Parse une date ISO (YYYY-MM-DD) en date locale, sans décalage UTC. */
export function parseIsoDateLocal(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  const d =
    typeof date === "string" && /^\d{4}-\d{2}-\d{2}/.test(date)
      ? parseIsoDateLocal(date)
      : typeof date === "string"
        ? new Date(date)
        : date;
  if (Number.isNaN(d.getTime())) return "—";
  return format(d, "d MMMM yyyy", { locale: fr });
}

export function formatDateShort(date: string | Date | null | undefined): string {
  if (!date) return "—";
  const d =
    typeof date === "string" && /^\d{4}-\d{2}-\d{2}/.test(date)
      ? parseIsoDateLocal(date)
      : typeof date === "string"
        ? new Date(date)
        : date;
  if (Number.isNaN(d.getTime())) return "—";
  return format(d, "dd/MM/yyyy", { locale: fr });
}

export function isoToFrenchDate(iso: string): string {
  if (!iso) return "";
  const d = parseIsoDateLocal(iso);
  if (Number.isNaN(d.getTime())) return "";
  return format(d, "dd/MM/yyyy", { locale: fr });
}

export function parseFrenchDateToIso(input: string): string | null {
  const match = input.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const d = new Date(year, month - 1, day);
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) {
    return null;
  }
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Formate la saisie utilisateur en jj/mm/aaaa pendant la frappe. */
export function formatFrenchDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function fromNow(date: string | Date | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";
  return formatDistanceToNowStrict(d, { locale: fr, addSuffix: true });
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function daysBetween(a: Date, b: Date): number {
  const ms = b.getTime() - a.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

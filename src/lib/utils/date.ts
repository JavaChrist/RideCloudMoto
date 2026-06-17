import { format, formatDistanceToNowStrict } from "date-fns";
import { fr } from "date-fns/locale";

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";
  return format(d, "d MMMM yyyy", { locale: fr });
}

export function formatDateShort(date: string | Date | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";
  return format(d, "dd/MM/yyyy", { locale: fr });
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

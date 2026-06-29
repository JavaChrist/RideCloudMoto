export type DealerUrgency = "normal" | "warning" | "urgent" | "critical";

export interface DealerCountdown {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

export function getDealerCountdown(until: Date, at: Date = new Date()): DealerCountdown {
  const totalMs = Math.max(0, until.getTime() - at.getTime());
  const totalSec = Math.floor(totalMs / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  return { totalMs, days, hours, minutes, seconds, expired: totalMs <= 0 };
}

export function getDealerUrgency(daysLeft: number): DealerUrgency {
  if (daysLeft <= 1) return "critical";
  if (daysLeft <= 7) return "urgent";
  if (daysLeft <= 30) return "warning";
  return "normal";
}

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Affichage HH:MM:SS (ou JJ j HH:MM:SS si >= 1 jour). */
export function formatCountdownDisplay(c: DealerCountdown): string {
  const time = `${pad2(c.hours)}:${pad2(c.minutes)}:${pad2(c.seconds)}`;
  if (c.days > 0) {
    return `${c.days} j ${time}`;
  }
  return time;
}

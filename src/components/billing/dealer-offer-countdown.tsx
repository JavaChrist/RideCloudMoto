"use client";

import * as React from "react";
import Link from "next/link";
import { Clock, Sparkles } from "lucide-react";
import {
  formatCountdownDisplay,
  getDealerCountdown,
  getDealerUrgency,
  pad2,
  type DealerUrgency,
} from "@/lib/billing/dealer-countdown";
import { formatDateShort } from "@/lib/utils/date";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const URGENCY_STYLES: Record<
  DealerUrgency,
  { banner: string; digit: string; label: string }
> = {
  normal: {
    banner: "border-primary/25 bg-primary/10",
    digit: "bg-primary/15 text-foreground",
    label: "text-muted-foreground",
  },
  warning: {
    banner: "border-warning/40 bg-warning/15",
    digit: "bg-warning/20 text-foreground",
    label: "text-warning-foreground/80",
  },
  urgent: {
    banner: "border-orange-500/50 bg-orange-500/10",
    digit: "bg-orange-500/20 text-foreground",
    label: "text-orange-700 dark:text-orange-300",
  },
  critical: {
    banner: "border-destructive/50 bg-destructive/10",
    digit: "bg-destructive/15 text-destructive",
    label: "text-destructive",
  },
};

interface DealerOfferCountdownProps {
  expiresAt: string;
  variant?: "banner" | "card";
  className?: string;
}

export function DealerOfferCountdown({
  expiresAt,
  variant = "banner",
  className,
}: DealerOfferCountdownProps) {
  const until = React.useMemo(() => new Date(expiresAt), [expiresAt]);
  const [now, setNow] = React.useState(() => new Date());

  React.useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const countdown = getDealerCountdown(until, now);
  const urgency = getDealerUrgency(countdown.days);
  const styles = URGENCY_STYLES[urgency];

  if (countdown.expired) {
    return null;
  }

  const message =
    urgency === "critical"
      ? "Votre offre se termine très bientôt — souscrivez au Premium pour garder l'accès."
      : urgency === "urgent"
        ? "Plus que quelques jours d'accès gratuit. Pensez à passer en Premium."
        : "À la fin de l'offre, l'accès nécessitera un abonnement Premium.";

  if (variant === "card") {
    return (
      <div
        className={cn(
          "rounded-xl border p-4",
          styles.banner,
          className
        )}
      >
        <DealerCountdownContent
          countdown={countdown}
          until={until}
          styles={styles}
          message={message}
          layout="card"
        />
      </div>
    );
  }

  return (
    <div className={cn("border-b", styles.banner, className)}>
      <div className="container py-3">
        <DealerCountdownContent
          countdown={countdown}
          until={until}
          styles={styles}
          message={message}
          layout="banner"
        />
      </div>
    </div>
  );
}

function DealerCountdownContent({
  countdown,
  until,
  styles,
  message,
  layout,
}: {
  countdown: ReturnType<typeof getDealerCountdown>;
  until: Date;
  styles: (typeof URGENCY_STYLES)[DealerUrgency];
  message: string;
  layout: "banner" | "card";
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        layout === "banner" && "sm:flex-row sm:items-center sm:justify-between"
      )}
    >
      <div className="min-w-0 space-y-1">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Clock className="h-4 w-4 shrink-0" />
          Offre concessionnaire · temps restant
        </p>
        <p className={cn("text-xs", styles.label)}>{message}</p>
        <p className="text-xs text-muted-foreground">
          Expire le <strong>{formatDateShort(until)}</strong>
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 font-mono tabular-nums">
          {countdown.days > 0 ? (
            <>
              <CountdownUnit value={countdown.days} label="j" styles={styles} wide />
              <span className="text-lg font-bold text-muted-foreground">:</span>
            </>
          ) : null}
          <CountdownUnit value={countdown.hours} label="h" styles={styles} />
          <span className="text-lg font-bold text-muted-foreground">:</span>
          <CountdownUnit value={countdown.minutes} label="m" styles={styles} />
          <span className="text-lg font-bold text-muted-foreground">:</span>
          <CountdownUnit value={countdown.seconds} label="s" styles={styles} />
        </div>
        <Button size="sm" asChild className="shrink-0">
          <Link href="/parametres">
            <Sparkles className="h-4 w-4" />
            Passer en Premium
          </Link>
        </Button>
      </div>

      <p className="sr-only" aria-live="polite">
        {formatCountdownDisplay(countdown)} restants avant la fin de l&apos;offre gratuite
      </p>
    </div>
  );
}

function CountdownUnit({
  value,
  label,
  styles,
  wide,
}: {
  value: number;
  label: string;
  styles: (typeof URGENCY_STYLES)[DealerUrgency];
  wide?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span
        className={cn(
          "flex min-w-[2.5rem] items-center justify-center rounded-md px-2 py-1 text-lg font-bold",
          wide && "min-w-[3rem]",
          styles.digit
        )}
      >
        {wide ? value : pad2(value)}
      </span>
      <span className="text-[10px] uppercase text-muted-foreground">{label}</span>
    </div>
  );
}

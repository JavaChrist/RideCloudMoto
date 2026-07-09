"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2, RefreshCw, Sparkles } from "lucide-react";
import type { DealerActivationCode } from "@/types/database";
import { formatDealerCodeDisplay } from "@/lib/billing/dealer-activation";
import { formatDateShort } from "@/lib/utils/date";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StatusFilter = "all" | "unused" | "used";

export function DealerLicensesTable() {
  const [codes, setCodes] = React.useState<DealerActivationCode[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<StatusFilter>("all");
  const [extendingId, setExtendingId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dealer/portal/codes?status=${filter}&limit=300`);
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Erreur de chargement");
        return;
      }
      setCodes(data.codes ?? []);
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function handleExtend(codeId: string) {
    setExtendingId(codeId);
    try {
      const res = await fetch("/api/dealer/portal/extend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codeId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Prolongation impossible");
        return;
      }
      toast.success(
        `Licence prolongée jusqu'au ${formatDateShort(new Date(data.until))}`
      );
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setExtendingId(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-base">Licences</CardTitle>
          <Button variant="ghost" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          {(["all", "used", "unused"] as const).map((s) => (
            <Button
              key={s}
              type="button"
              size="sm"
              variant={filter === s ? "default" : "outline"}
              onClick={() => setFilter(s)}
            >
              {s === "all" ? "Toutes" : s === "used" ? "Activées" : "En attente"}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Chargement…</p>
        ) : codes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune licence pour ce filtre.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="border-b bg-muted/40 text-left">
                <tr>
                  <th className="p-3">Immatriculation</th>
                  <th className="p-3">Client</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Modèle</th>
                  <th className="p-3">Achat</th>
                  <th className="p-3">Statut</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {codes.map((row) => {
                  const isUsed = !!row.used_by;
                  const customerName = [row.customer_first_name, row.customer_last_name]
                    .filter(Boolean)
                    .join(" ");
                  return (
                    <tr key={row.id} className="border-b align-top last:border-0">
                      <td className="p-3 font-mono font-semibold tracking-wider">
                        {formatDealerCodeDisplay(row.code)}
                      </td>
                      <td className="p-3">{customerName || "—"}</td>
                      <td className="p-3 text-xs">
                        {row.customer_email ? (
                          <div className="break-all">{row.customer_email}</div>
                        ) : null}
                        {row.customer_phone ? (
                          <div className="text-muted-foreground">{row.customer_phone}</div>
                        ) : null}
                        {!row.customer_email && !row.customer_phone ? "—" : null}
                      </td>
                      <td className="p-3">{row.vehicle_model ?? "—"}</td>
                      <td className="p-3 text-muted-foreground">
                        {row.purchase_date ? formatDateShort(row.purchase_date) : "—"}
                      </td>
                      <td className="p-3">
                        {isUsed ? (
                          <Badge variant="success">Activée</Badge>
                        ) : (
                          <Badge variant="secondary">En attente</Badge>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {isUsed ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleExtend(row.id)}
                            disabled={extendingId === row.id}
                          >
                            {extendingId === row.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Sparkles className="h-4 w-4" />
                            )}
                            Prolonger
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            En attente d&apos;activation
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

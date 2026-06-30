"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Copy,
  ExternalLink,
  Loader2,
  Printer,
  RefreshCw,
  FileImage,
} from "lucide-react";
import type { DealerActivationCode } from "@/types/database";
import { formatDealerCodeDisplay } from "@/lib/billing/dealer-activation";
import { buildQrCodeImageUrl, buildRegisterUrl } from "@/lib/dealer/register-url";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DealerCodePrintSheet } from "./dealer-code-print-sheet";

interface DealerCodesManagerProps {
  siteUrl: string;
}

export function DealerCodesManager({ siteUrl }: DealerCodesManagerProps) {
  const [dealerName, setDealerName] = React.useState("");
  const [plateInput, setPlateInput] = React.useState("");
  const [registeringPlate, setRegisteringPlate] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [filterStatus, setFilterStatus] = React.useState<"all" | "unused" | "used">("unused");
  const [filterDealer, setFilterDealer] = React.useState("");
  const [codes, setCodes] = React.useState<DealerActivationCode[]>([]);
  const [dealers, setDealers] = React.useState<string[]>([]);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [printCodes, setPrintCodes] = React.useState<
    { code: string; dealerName: string | null; registerUrl: string }[] | null
  >(null);

  const loadCodes = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status: filterStatus, limit: "100" });
      if (filterDealer) params.set("dealer", filterDealer);
      const res = await fetch(`/api/admin/dealer-codes?${params}`);
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Erreur de chargement");
        return;
      }
      setCodes(data.codes ?? []);
      setDealers(data.dealers ?? []);
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterDealer]);

  React.useEffect(() => {
    loadCodes();
  }, [loadCodes]);

  async function handleRegisterPlate(e: React.FormEvent) {
    e.preventDefault();
    if (!dealerName.trim()) {
      toast.error("Indiquez le nom du concessionnaire.");
      return;
    }
    if (!plateInput.trim()) {
      toast.error("Indiquez l'immatriculation.");
      return;
    }
    setRegisteringPlate(true);
    try {
      const res = await fetch("/api/admin/dealer-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plate: plateInput.trim(),
          dealerName: dealerName.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Enregistrement impossible");
        return;
      }
      const code = data.codes[0] as string;
      toast.success(`Immatriculation ${formatDealerCodeDisplay(code)} enregistrée`);
      setPlateInput("");
      setSelected(new Set([code]));
      await loadCodes();
      openPrintSheet([
        {
          code,
          dealerName: dealerName.trim(),
          registerUrl: buildRegisterUrl(code, siteUrl),
        },
      ]);
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setRegisteringPlate(false);
    }
  }

  function openPrintSheet(
    items: { code: string; dealerName: string | null; registerUrl: string }[]
  ) {
    setPrintCodes(items);
    setTimeout(() => window.print(), 150);
  }

  function toggleSelect(code: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  function copyText(text: string, label: string) {
    navigator.clipboard.writeText(text).then(
      () => toast.success(`${label} copié`),
      () => toast.error("Copie impossible")
    );
  }

  const selectedItems = codes
    .filter((c) => selected.has(c.code))
    .map((c) => ({
      code: c.code,
      dealerName: c.dealer_name,
      registerUrl: buildRegisterUrl(c.code, siteUrl),
    }));

  return (
    <>
      <div className="space-y-6 print:hidden">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Codes concessionnaire</h1>
            <p className="text-sm text-muted-foreground">
              Générez des codes à usage unique, QR d&apos;inscription et flyers par point de vente.
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/parametres">← Paramètres</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Enregistrer un véhicule livré</CardTitle>
            <CardDescription>
              Le numéro d&apos;immatriculation du véhicule livré devient le code d&apos;activation.
              Le client saisira la même plaque dans l&apos;application pour bénéficier de 12 mois
              gratuits. Format SIV attendu : <strong>AB-123-CD</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegisterPlate} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dealer-name">Point de vente / concessionnaire</Label>
                <Input
                  id="dealer-name"
                  placeholder="Ex. Voge Moto Lyon"
                  value={dealerName}
                  onChange={(e) => setDealerName(e.target.value)}
                  list="dealer-suggestions"
                />
                <datalist id="dealer-suggestions">
                  {dealers.map((d) => (
                    <option key={d} value={d} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-2">
                <Label htmlFor="plate-input">Immatriculation du véhicule livré</Label>
                <Input
                  id="plate-input"
                  placeholder="Ex. AB-123-CD"
                  value={plateInput}
                  onChange={(e) => setPlateInput(e.target.value.toUpperCase())}
                  className="font-mono uppercase tracking-wider"
                />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={registeringPlate}>
                  {registeringPlate ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Enregistrer l'immatriculation"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="text-base">Codes existants</CardTitle>
              <Button variant="ghost" size="sm" onClick={loadCodes} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Actualiser
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {(["all", "unused", "used"] as const).map((s) => (
                <Button
                  key={s}
                  type="button"
                  size="sm"
                  variant={filterStatus === s ? "default" : "outline"}
                  onClick={() => setFilterStatus(s)}
                >
                  {s === "all" ? "Tous" : s === "unused" ? "Disponibles" : "Utilisés"}
                </Button>
              ))}
              <select
                className="h-9 rounded-md border bg-background px-3 text-sm"
                value={filterDealer}
                onChange={(e) => setFilterDealer(e.target.value)}
              >
                <option value="">Tous les concessionnaires</option>
                {dealers.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Chargement…</p>
            ) : codes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun code pour ces filtres.</p>
            ) : (
              <div className="space-y-2">
                {selected.size > 0 ? (
                  <div className="flex flex-wrap gap-2 pb-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => openPrintSheet(selectedItems)}
                    >
                      <Printer className="h-4 w-4" />
                      Imprimer {selected.size} étiquette(s)
                    </Button>
                  </div>
                ) : null}
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full min-w-[640px] text-sm">
                    <thead className="border-b bg-muted/40 text-left">
                      <tr>
                        <th className="p-3 w-10" />
                        <th className="p-3">Code</th>
                        <th className="p-3">Concessionnaire</th>
                        <th className="p-3">Statut</th>
                        <th className="p-3">Créé le</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {codes.map((row) => {
                        const registerUrl = buildRegisterUrl(row.code, siteUrl);
                        const isUsed = !!row.used_by;
                        return (
                          <tr key={row.id} className="border-b last:border-0">
                            <td className="p-3">
                              <input
                                type="checkbox"
                                checked={selected.has(row.code)}
                                onChange={() => toggleSelect(row.code)}
                                disabled={isUsed}
                                aria-label={`Sélectionner ${row.code}`}
                              />
                            </td>
                            <td className="p-3 font-mono font-semibold tracking-wider">
                              {formatDealerCodeDisplay(row.code)}
                            </td>
                            <td className="p-3">{row.dealer_name ?? "—"}</td>
                            <td className="p-3">
                              {isUsed ? (
                                <Badge variant="secondary">Utilisé</Badge>
                              ) : (
                                <Badge variant="default">Disponible</Badge>
                              )}
                            </td>
                            <td className="p-3 text-muted-foreground">
                              {new Date(row.created_at).toLocaleDateString("fr-FR")}
                            </td>
                            <td className="p-3">
                              <div className="flex justify-end gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  title="Copier le code"
                                  onClick={() => copyText(row.code, "Code")}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  title="Copier le lien d'inscription"
                                  onClick={() => copyText(registerUrl, "Lien")}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                                {!isUsed ? (
                                  <>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      title="Imprimer étiquette"
                                      onClick={() =>
                                        openPrintSheet([
                                          {
                                            code: row.code,
                                            dealerName: row.dealer_name,
                                            registerUrl,
                                          },
                                        ])
                                      }
                                    >
                                      <Printer className="h-4 w-4" />
                                    </Button>
                                    <Button type="button" variant="ghost" size="icon" asChild title="Flyer A4">
                                      <Link
                                        href={`/admin/flyer?code=${encodeURIComponent(row.code)}${row.dealer_name ? `&dealer=${encodeURIComponent(row.dealer_name)}` : ""}`}
                                        target="_blank"
                                      >
                                        <FileImage className="h-4 w-4" />
                                      </Link>
                                    </Button>
                                  </>
                                ) : null}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Flyer vierge (modèle)</CardTitle>
            <CardDescription>
              Version à remplir à la main — zone « Votre code » laissée blank pour écriture au stylo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <a href="/flyer-concessionnaire.html" target="_blank" rel="noopener noreferrer">
                <FileImage className="h-4 w-4" />
                Ouvrir le flyer modèle
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      {printCodes ? (
        <DealerCodePrintSheet
          items={printCodes.map((item) => ({
            ...item,
            qrUrl: buildQrCodeImageUrl(item.registerUrl, 180),
          }))}
          onClose={() => setPrintCodes(null)}
        />
      ) : null}
    </>
  );
}

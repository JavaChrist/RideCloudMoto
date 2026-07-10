"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Copy,
  Download,
  ExternalLink,
  Loader2,
  Printer,
  RefreshCw,
  FileImage,
} from "lucide-react";
import type { DealerActivationCode } from "@/types/database";
import { formatDealerCodeDisplay } from "@/lib/billing/dealer-activation";
import { buildQrCodeDataUrl, buildRegisterUrl } from "@/lib/dealer/register-url";
import { formatDateShort } from "@/lib/utils/date";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FrenchDateInput } from "@/components/ui/french-date-input";
import { DealerCodePrintSheet } from "./dealer-code-print-sheet";

interface DealerCodesManagerProps {
  siteUrl: string;
}

export function DealerCodesManager({ siteUrl }: DealerCodesManagerProps) {
  const [dealerName, setDealerName] = React.useState("");
  const [plateInput, setPlateInput] = React.useState("");
  const [customerFirstName, setCustomerFirstName] = React.useState("");
  const [customerLastName, setCustomerLastName] = React.useState("");
  const [customerEmail, setCustomerEmail] = React.useState("");
  const [customerPhone, setCustomerPhone] = React.useState("");
  const [vehicleModel, setVehicleModel] = React.useState("");
  const [purchaseDate, setPurchaseDate] = React.useState("");
  const [registeringPlate, setRegisteringPlate] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [filterStatus, setFilterStatus] = React.useState<"all" | "unused" | "used">("unused");
  const [filterDealer, setFilterDealer] = React.useState("");
  const [codes, setCodes] = React.useState<DealerActivationCode[]>([]);
  const [dealers, setDealers] = React.useState<string[]>([]);
  const [structuredDealers, setStructuredDealers] = React.useState<
    { id: string; name: string }[]
  >([]);
  const [dealerId, setDealerId] = React.useState("");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [printCodes, setPrintCodes] = React.useState<
    { code: string; dealerName: string | null; registerUrl: string; qrUrl: string }[] | null
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
      setStructuredDealers(data.structuredDealers ?? []);
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
          dealerId: dealerId || undefined,
          customerFirstName: customerFirstName.trim(),
          customerLastName: customerLastName.trim(),
          customerEmail: customerEmail.trim(),
          customerPhone: customerPhone.trim(),
          vehicleModel: vehicleModel.trim(),
          purchaseDate: purchaseDate || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Enregistrement impossible");
        return;
      }
      const code = data.codes[0] as string;
      toast.success(`Immatriculation ${formatDealerCodeDisplay(code)} enregistrée`);
      const registeredDealerName = dealerName.trim();
      setPlateInput("");
      setCustomerFirstName("");
      setCustomerLastName("");
      setCustomerEmail("");
      setCustomerPhone("");
      setVehicleModel("");
      setPurchaseDate("");
      setSelected(new Set([code]));
      await loadCodes();
      await openPrintSheet([
        {
          code,
          dealerName: registeredDealerName,
          registerUrl: buildRegisterUrl(code, siteUrl),
        },
      ]);
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setRegisteringPlate(false);
    }
  }

  function handleExportCsv() {
    const params = new URLSearchParams({ status: filterStatus });
    if (filterDealer) params.set("dealer", filterDealer);
    window.location.href = `/api/admin/dealer-codes/export?${params}`;
  }

  async function openPrintSheet(
    items: { code: string; dealerName: string | null; registerUrl: string }[]
  ) {
    const withQr = await Promise.all(
      items.map(async (item) => ({
        ...item,
        qrUrl: await buildQrCodeDataUrl(item.registerUrl, 180),
      }))
    );
    setPrintCodes(withQr);
    requestAnimationFrame(() => {
      setTimeout(() => window.print(), 200);
    });
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
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/dealers">Concessionnaires →</Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Enregistrer un véhicule livré</CardTitle>
            <CardDescription>
              Le numéro d&apos;immatriculation devient le code d&apos;activation. Le client saisira
              la même plaque dans l&apos;application pour bénéficier de 12 mois gratuits.
              Format SIV : <strong>AB-123-CD</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegisterPlate} className="space-y-6">
              <section className="grid gap-4 sm:grid-cols-2">
                <h3 className="sm:col-span-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Véhicule & concessionnaire
                </h3>
                {structuredDealers.length > 0 ? (
                  <div className="space-y-2">
                    <Label htmlFor="dealer-select">Concessionnaire partenaire</Label>
                    <select
                      id="dealer-select"
                      className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                      value={dealerId}
                      onChange={(e) => {
                        const id = e.target.value;
                        setDealerId(id);
                        const found = structuredDealers.find((d) => d.id === id);
                        if (found) setDealerName(found.name);
                      }}
                    >
                      <option value="">— Aucun (saisie libre) —</option>
                      {structuredDealers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}
                <div className="space-y-2">
                  <Label htmlFor="dealer-name">Point de vente / concessionnaire *</Label>
                  <Input
                    id="dealer-name"
                    placeholder="Ex. Voge Moto Lyon"
                    value={dealerName}
                    onChange={(e) => setDealerName(e.target.value)}
                    list="dealer-suggestions"
                    required
                  />
                  <datalist id="dealer-suggestions">
                    {dealers.map((d) => (
                      <option key={d} value={d} />
                    ))}
                  </datalist>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plate-input">Immatriculation *</Label>
                  <Input
                    id="plate-input"
                    placeholder="Ex. AB-123-CD"
                    value={plateInput}
                    onChange={(e) => setPlateInput(e.target.value.toUpperCase())}
                    className="font-mono uppercase tracking-wider"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicle-model">Modèle du véhicule</Label>
                  <Input
                    id="vehicle-model"
                    placeholder="Ex. Voge 525 DS"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchase-date">Date d&apos;achat</Label>
                  <FrenchDateInput
                    id="purchase-date"
                    value={purchaseDate}
                    onChange={setPurchaseDate}
                  />
                </div>
              </section>

              <section className="grid gap-4 sm:grid-cols-2">
                <h3 className="sm:col-span-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Client
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="customer-first-name">Prénom</Label>
                  <Input
                    id="customer-first-name"
                    placeholder="Jean"
                    value={customerFirstName}
                    onChange={(e) => setCustomerFirstName(e.target.value)}
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer-last-name">Nom</Label>
                  <Input
                    id="customer-last-name"
                    placeholder="Dupont"
                    value={customerLastName}
                    onChange={(e) => setCustomerLastName(e.target.value)}
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer-email">E-mail</Label>
                  <Input
                    id="customer-email"
                    type="email"
                    placeholder="jean.dupont@exemple.fr"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer-phone">Téléphone</Label>
                  <Input
                    id="customer-phone"
                    type="tel"
                    placeholder="06 12 34 56 78"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    autoComplete="off"
                  />
                </div>
              </section>

              <Button type="submit" disabled={registeringPlate}>
                {registeringPlate ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Enregistrer la fiche"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="text-base">Fiches enregistrées</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCsv}
                  disabled={loading || codes.length === 0}
                >
                  <Download className="h-4 w-4" />
                  Exporter (CSV)
                </Button>
                <Button variant="ghost" size="sm" onClick={loadCodes} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  Actualiser
                </Button>
              </div>
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
                  <table className="w-full min-w-[1000px] text-sm">
                    <thead className="border-b bg-muted/40 text-left">
                      <tr>
                        <th className="p-3 w-10" />
                        <th className="p-3">Immatriculation</th>
                        <th className="p-3">Client</th>
                        <th className="p-3">Contact</th>
                        <th className="p-3">Modèle</th>
                        <th className="p-3">Concessionnaire</th>
                        <th className="p-3">Date d&apos;achat</th>
                        <th className="p-3">Statut</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {codes.map((row) => {
                        const registerUrl = buildRegisterUrl(row.code, siteUrl);
                        const isUsed = !!row.used_by;
                        const customerName = [row.customer_first_name, row.customer_last_name]
                          .filter(Boolean)
                          .join(" ");
                        return (
                          <tr key={row.id} className="border-b last:border-0 align-top">
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
                            <td className="p-3">{row.dealer_name ?? "—"}</td>
                            <td className="p-3 text-muted-foreground">
                              {row.purchase_date ? formatDateShort(row.purchase_date) : "—"}
                            </td>
                            <td className="p-3">
                              {isUsed ? (
                                <Badge variant="secondary">Utilisé</Badge>
                              ) : (
                                <Badge variant="default">Disponible</Badge>
                              )}
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
        <DealerCodePrintSheet items={printCodes} onClose={() => setPrintCodes(null)} />
      ) : null}
    </>
  );
}

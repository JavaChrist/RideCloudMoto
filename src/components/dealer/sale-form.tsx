"use client";

import * as React from "react";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";
import { formatDealerCodeDisplay } from "@/lib/billing/dealer-activation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FrenchDateInput } from "@/components/ui/french-date-input";

export function DealerSaleForm() {
  const [plate, setPlate] = React.useState("");
  const [vehicleModel, setVehicleModel] = React.useState("");
  const [purchaseDate, setPurchaseDate] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [lastCode, setLastCode] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!plate.trim()) {
      toast.error("Indiquez l'immatriculation.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/dealer/portal/codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plate: plate.trim(),
          vehicleModel: vehicleModel.trim(),
          purchaseDate: purchaseDate || null,
          customerFirstName: firstName.trim(),
          customerLastName: lastName.trim(),
          customerEmail: email.trim(),
          customerPhone: phone.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Enregistrement impossible");
        return;
      }
      setLastCode(data.code as string);
      toast.success(`Vente enregistrée : ${formatDealerCodeDisplay(data.code)}`);
      setPlate("");
      setVehicleModel("");
      setPurchaseDate("");
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {lastCode ? (
        <div className="flex items-start gap-3 rounded-xl border border-success/40 bg-success/10 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
          <div className="text-sm">
            <p className="font-semibold">
              Vente enregistrée — code {formatDealerCodeDisplay(lastCode)}
            </p>
            <p className="text-muted-foreground">
              Votre client saisira cette immatriculation dans l&apos;application pour activer
              son offre. Il sera automatiquement rattaché à votre concession.
            </p>
          </div>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Enregistrer une vente</CardTitle>
          <CardDescription>
            L&apos;immatriculation du véhicule livré devient le code d&apos;activation
            (format SIV : <strong>AB-123-CD</strong>).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="grid gap-4 sm:grid-cols-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:col-span-2">
                Véhicule
              </h3>
              <div className="space-y-2">
                <Label htmlFor="s-plate">Immatriculation *</Label>
                <Input
                  id="s-plate"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value.toUpperCase())}
                  placeholder="AB-123-CD"
                  className="font-mono uppercase tracking-wider"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-model">Modèle du véhicule</Label>
                <Input
                  id="s-model"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  placeholder="Ex. Voge 525 DS"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-date">Date d&apos;achat</Label>
                <FrenchDateInput id="s-date" value={purchaseDate} onChange={setPurchaseDate} />
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:col-span-2">
                Client
              </h3>
              <div className="space-y-2">
                <Label htmlFor="s-first">Prénom</Label>
                <Input
                  id="s-first"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-last">Nom</Label>
                <Input
                  id="s-last"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-email">E-mail</Label>
                <Input
                  id="s-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-phone">Téléphone</Label>
                <Input
                  id="s-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="off"
                />
              </div>
            </section>

            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer la vente"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

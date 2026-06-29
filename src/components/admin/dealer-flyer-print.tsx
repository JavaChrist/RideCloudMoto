"use client";

import * as React from "react";
import { Printer } from "lucide-react";
import { formatDealerCodeDisplay } from "@/lib/billing/dealer-activation";
import { buildQrCodeImageUrl, buildRegisterUrl } from "@/lib/dealer/register-url";
import { Button } from "@/components/ui/button";

interface DealerFlyerPrintProps {
  code: string;
  dealerName: string | null;
  siteUrl: string;
}

export function DealerFlyerPrint({ code, dealerName, siteUrl }: DealerFlyerPrintProps) {
  const registerUrl = buildRegisterUrl(code, siteUrl);
  const qrUrl = buildQrCodeImageUrl(registerUrl, 200);

  React.useEffect(() => {
    document.title = `Flyer RideCloudMoto — ${code}`;
  }, [code]);

  return (
    <div className="min-h-dvh bg-neutral-200 py-6 print:bg-white print:py-0">
      <div className="mx-auto mb-4 flex max-w-[210mm] justify-end gap-2 px-4 print:hidden">
        <Button type="button" onClick={() => window.print()}>
          <Printer className="h-4 w-4" />
          Imprimer le flyer
        </Button>
      </div>

      <article className="mx-auto w-[210mm] overflow-hidden bg-white shadow-xl print:shadow-none">
        <header className="bg-gradient-to-br from-neutral-800 via-neutral-950 to-amber-950 px-9 pb-20 pt-8 text-white">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FACC15] text-sm font-extrabold text-neutral-950">
                RM
              </div>
              <div>
                <div className="text-xl font-bold">
                  RideCloud<span className="text-[#FACC15]">Moto</span>
                </div>
                <div className="text-[11px] uppercase tracking-wider text-amber-200/80">
                  Le cloud de votre deux-roues
                </div>
              </div>
            </div>
            <span className="rounded-full border border-amber-400/40 bg-white/10 px-3 py-1 text-xs">
              Offre concessionnaire
            </span>
          </div>
          <h1 className="max-w-xl text-[2rem] font-extrabold leading-tight tracking-tight">
            La vie de votre deux-roues, enfin dans le cloud.
          </h1>
          {dealerName ? (
            <p className="mt-3 text-sm text-amber-100/90">Remis par {dealerName}</p>
          ) : null}
        </header>

        <section className="-mt-14 px-9">
          <div className="grid grid-cols-[160px_1fr] gap-6 rounded-2xl border bg-white p-6 shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrUrl} alt="QR inscription" width={148} height={148} className="rounded-xl border" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
                Offert par votre concessionnaire
              </p>
              <h2 className="mt-1 text-2xl font-extrabold">Scannez. Installez. Roulez.</h2>
              <p className="mt-2 text-sm text-neutral-600">
                Plan Gratuit 12 mois · 1 véhicule · Plan d&apos;entretien complet
              </p>
              <div className="mt-4 rounded-xl border-2 border-dashed border-amber-400 bg-amber-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
                  Votre code d&apos;activation
                </p>
                <p className="mt-1 font-mono text-3xl font-extrabold tracking-[0.15em] text-neutral-900">
                  {formatDealerCodeDisplay(code)}
                </p>
              </div>
              <p className="mt-3 break-all text-xs text-neutral-400">{registerUrl}</p>
            </div>
          </div>
        </section>

        <section className="px-9 py-8">
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              "Plan d'entretien constructeur",
              "Rappels intelligents",
              "Fiche technique",
              "Suivi des coûts",
            ].map((f) => (
              <div key={f} className="rounded-lg border bg-neutral-50 p-3 font-medium">
                {f}
              </div>
            ))}
          </div>
        </section>

        <footer className="border-t px-9 py-5 text-center text-xs text-neutral-500">
          ride-cloud-moto.vercel.app · support@javachrist.fr
        </footer>
      </article>
    </div>
  );
}

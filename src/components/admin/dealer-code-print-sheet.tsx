"use client";

import * as React from "react";
import { formatDealerCodeDisplay } from "@/lib/billing/dealer-activation";

export interface PrintCodeItem {
  code: string;
  dealerName: string | null;
  registerUrl: string;
  qrUrl: string;
}

interface DealerCodePrintSheetProps {
  items: PrintCodeItem[];
  onClose: () => void;
}

/** Feuille d'étiquettes QR + code — visible uniquement à l'impression. */
export function DealerCodePrintSheet({ items, onClose }: DealerCodePrintSheetProps) {
  React.useEffect(() => {
    const afterPrint = () => onClose();
    window.addEventListener("afterprint", afterPrint);
    return () => window.removeEventListener("afterprint", afterPrint);
  }, [onClose]);

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `@media print {
            body * { visibility: hidden !important; }
            .dealer-print-sheet, .dealer-print-sheet * { visibility: visible !important; }
            .dealer-print-sheet { position: absolute; left: 0; top: 0; width: 100%; }
          }`,
        }}
      />
      <div className="dealer-print-sheet fixed inset-0 z-50 overflow-auto bg-white p-8 print:static print:p-0">
        <div className="mx-auto grid max-w-[210mm] grid-cols-2 gap-6 print:grid-cols-2 print:gap-8">
          {items.map((item) => (
            <div
              key={item.code}
              className="flex flex-col items-center rounded-xl border-2 border-dashed border-neutral-300 p-5 text-center break-inside-avoid"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                RideCloudMoto · {item.dealerName ?? "Concessionnaire"}
              </p>
              <p className="mt-2 text-lg font-bold">Votre code d&apos;activation</p>
              <p className="my-3 font-mono text-3xl font-extrabold tracking-[0.12em]">
                {formatDealerCodeDisplay(item.code)}
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.qrUrl}
                alt={`QR ${item.code}`}
                width={160}
                height={160}
                className="rounded-lg border"
              />
              <p className="mt-3 text-xs text-neutral-600">Scannez pour créer votre compte</p>
              <p className="mt-1 break-all text-[10px] text-neutral-400">{item.registerUrl}</p>
              <p className="mt-3 text-[11px] text-neutral-500">
                12 mois gratuits · 1 véhicule · Offert à l&apos;achat
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

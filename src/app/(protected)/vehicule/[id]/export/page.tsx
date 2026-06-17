import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getVehicleDetail } from "@/lib/data/vehicle-repository";
import { fuelLabel } from "@/lib/data/fuel-options";
import { formatDate } from "@/lib/utils/date";
import { formatEur, computeVehicleCosts } from "@/lib/costs";

export const dynamic = "force-dynamic";
export const metadata = { title: "Carnet d'entretien" };

export default async function VehicleExportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const detail = await getVehicleDetail(supabase, user!.id, id);
  if (!detail) notFound();

  const { vehicle, maintenanceEntries, modifications } = detail;
  const costs = computeVehicleCosts(vehicle, maintenanceEntries, modifications);
  const title = vehicle.surnom || `${vehicle.marque} ${vehicle.modele}`;

  return (
    <div className="mx-auto max-w-2xl space-y-6 bg-white p-8 text-black print:p-0">
      <header className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-gray-600">
            {vehicle.marque} {vehicle.modele} · {vehicle.annee} · {fuelLabel(vehicle.carburant)}
          </p>
        </div>
        <p className="text-xs text-gray-500">RideCloudMoto · {formatDate(new Date())}</p>
      </header>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Synthèse</h2>
        <ul className="text-sm">
          <li>Kilométrage : {vehicle.kilometrage.toLocaleString("fr-FR")} km</li>
          <li>Coût total : {formatEur(costs.total)}</li>
          <li>Coût annuel moyen : {formatEur(costs.perYear)}</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Historique d&apos;entretien</h2>
        {maintenanceEntries.length === 0 ? (
          <p className="text-sm text-gray-600">Aucun entretien enregistré.</p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-1">Date</th>
                <th>Opération</th>
                <th>Km</th>
                <th className="text-right">Coût</th>
              </tr>
            </thead>
            <tbody>
              {maintenanceEntries.map((e) => (
                <tr key={e.id} className="border-b">
                  <td className="py-1">{formatDate(e.date_entretien)}</td>
                  <td>{e.titre}</td>
                  <td>{e.kilometrage.toLocaleString("fr-FR")}</td>
                  <td className="text-right">{e.cout != null ? formatEur(e.cout) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {modifications.length > 0 ? (
        <section>
          <h2 className="mb-2 text-lg font-semibold">Accessoires & modifications</h2>
          <ul className="text-sm">
            {modifications.map((m) => (
              <li key={m.id}>
                {m.titre}
                {m.cout != null ? ` — ${formatEur(m.cout)}` : ""}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

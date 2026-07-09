import { redirect } from "next/navigation";
import { getDealerPortalContext } from "@/lib/dealer/membership";
import { DealerShell } from "@/components/layout/dealer-shell";

export const dynamic = "force-dynamic";

export default async function DealerLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getDealerPortalContext();

  // Non concessionnaire : renvoyer vers l'espace approprié.
  if (!ctx) {
    redirect("/login");
  }

  return (
    <DealerShell dealerName={ctx.dealer.name} email={ctx.user.email ?? ""}>
      {children}
    </DealerShell>
  );
}

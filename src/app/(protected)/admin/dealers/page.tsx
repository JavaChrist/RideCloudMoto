import type { Metadata } from "next";
import { DealersManager } from "@/components/admin/dealers-manager";

export const metadata: Metadata = { title: "Admin — Concessionnaires" };
export const dynamic = "force-dynamic";

export default function AdminDealersPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <DealersManager />
    </div>
  );
}

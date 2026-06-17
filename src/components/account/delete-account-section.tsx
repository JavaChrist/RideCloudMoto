"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, TriangleAlert } from "lucide-react";
import { useConfirm } from "@/components/providers/confirm-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function DeleteAccountSection() {
  const router = useRouter();
  const confirm = useConfirm();
  const [loading, setLoading] = React.useState(false);

  async function handleDelete() {
    const ok = await confirm({
      title: "Supprimer définitivement votre compte ?",
      description:
        "Tous vos véhicules, historiques, documents et votre abonnement seront supprimés. Cette action est irréversible.",
      confirmText: "Supprimer mon compte",
      cancelText: "Annuler",
      variant: "danger",
    });
    if (!ok) return;
    setLoading(true);
    const res = await fetch("/api/account/delete", { method: "POST" });
    if (res.ok) {
      toast.success("Compte supprimé.");
      router.push("/");
      router.refresh();
    } else {
      setLoading(false);
      toast.error("Échec de la suppression.");
    }
  }

  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base text-destructive">
          <TriangleAlert className="h-4 w-4" />
          Zone de danger
        </CardTitle>
        <CardDescription>
          La suppression de votre compte efface définitivement toutes vos données (RGPD).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="destructive" onClick={handleDelete} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Supprimer mon compte"}
        </Button>
      </CardContent>
    </Card>
  );
}

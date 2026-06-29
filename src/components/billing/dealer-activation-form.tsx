"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DealerActivationFormProps {
  compact?: boolean;
}

export function DealerActivationForm({ compact = false }: DealerActivationFormProps) {
  const router = useRouter();
  const [code, setCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();
    if (trimmed.length < 6) {
      toast.error("Format invalide (ex. AB-123-CD).");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/dealer/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Activation impossible.");
        return;
      }
      toast.success("Offre concessionnaire activée !");
      setCode("");
      router.refresh();
    } catch {
      toast.error("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? "flex gap-2" : "space-y-3"}>
      <div className={compact ? "min-w-0 flex-1" : "space-y-2"}>
        {!compact ? (
          <Label htmlFor="dealer-code">Code concessionnaire</Label>
        ) : null}
        <Input
          id="dealer-code"
          placeholder="Ex. AB-123-CD"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          autoComplete="off"
          spellCheck={false}
          className="font-mono uppercase tracking-wider"
        />
      </div>
      <Button type="submit" disabled={loading} className={compact ? "shrink-0" : "w-full"}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Activer"}
      </Button>
    </form>
  );
}

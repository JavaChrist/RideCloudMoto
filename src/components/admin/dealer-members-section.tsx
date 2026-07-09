"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface Member {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  email: string | null;
}

export function DealerMembersSection({ dealerId }: { dealerId: string }) {
  const [members, setMembers] = React.useState<Member[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<"staff" | "owner">("staff");
  const [adding, setAdding] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/dealers/members?dealerId=${dealerId}`);
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Erreur de chargement");
        return;
      }
      setMembers(data.members ?? []);
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }, [dealerId]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Indiquez un e-mail.");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/admin/dealers/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealerId, email: email.trim(), role }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Ajout impossible");
        return;
      }
      toast.success("Compte rattaché");
      setEmail("");
      await load();
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(id: string) {
    try {
      const res = await fetch(`/api/admin/dealers/members?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Suppression impossible");
        return;
      }
      toast.success("Compte retiré");
      await load();
    } catch {
      toast.error("Erreur réseau");
    }
  }

  return (
    <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
      <div>
        <h3 className="text-sm font-semibold">Comptes du portail</h3>
        <p className="text-xs text-muted-foreground">
          Les comptes rattachés accèdent au portail concessionnaire (enregistrer une
          vente, suivre et prolonger les licences). Si le compte n&apos;existe pas encore,
          une invitation par e-mail est envoyée.
        </p>
      </div>

      <form onSubmit={handleAdd} className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-1">
          <Label htmlFor="member-email">E-mail du compte</Label>
          <Input
            id="member-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vendeur@concession.fr"
            autoComplete="off"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="member-role">Rôle</Label>
          <select
            id="member-role"
            className="h-9 rounded-md border bg-background px-3 text-sm"
            value={role}
            onChange={(e) => setRole(e.target.value as "staff" | "owner")}
          >
            <option value="staff">Vendeur</option>
            <option value="owner">Responsable</option>
          </select>
        </div>
        <Button type="submit" disabled={adding}>
          {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          Ajouter
        </Button>
      </form>

      {loading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : members.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucun compte rattaché.</p>
      ) : (
        <ul className="space-y-2">
          {members.map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between gap-3 rounded-md border bg-background p-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm">{m.email ?? m.user_id}</p>
                <Badge variant="secondary" className="mt-0.5">
                  {m.role === "owner" ? "Responsable" : "Vendeur"}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemove(m.id)}
                aria-label="Retirer"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

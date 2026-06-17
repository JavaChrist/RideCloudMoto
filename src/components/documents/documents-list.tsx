"use client";

import * as React from "react";
import { toast } from "sonner";
import { FileText, Upload, Trash2, Loader2, ExternalLink } from "lucide-react";
import type { VehicleDocument } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils/date";
import { useConfirm } from "@/components/providers/confirm-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const BUCKET = "ridecloudmoto-files";
const MAX_SIZE = 10 * 1024 * 1024;

export function DocumentsList({
  vehicleId,
  userId,
  documents,
  canUpload,
}: {
  vehicleId: string;
  userId: string;
  documents: VehicleDocument[];
  canUpload: boolean;
}) {
  const confirm = useConfirm();
  const [uploading, setUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_SIZE) {
      toast.error("Fichier trop volumineux (10 Mo max).");
      return;
    }
    setUploading(true);
    const supabase = createClient();
    const path = `${userId}/${vehicleId}/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file);
    if (upErr) {
      setUploading(false);
      toast.error(upErr.message);
      return;
    }
    const { error: dbErr } = await supabase.from("documents").insert({
      user_id: userId,
      vehicle_id: vehicleId,
      nom_fichier: file.name,
      type_fichier: file.type || "application/octet-stream",
      url: path,
      taille: file.size,
    });
    setUploading(false);
    if (dbErr) toast.error(dbErr.message);
    else {
      toast.success("Document ajouté.");
      window.location.reload();
    }
  }

  async function openDoc(doc: VehicleDocument) {
    const supabase = createClient();
    const { data } = await supabase.storage.from(BUCKET).createSignedUrl(doc.url, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
    else toast.error("Impossible d'ouvrir le document.");
  }

  async function handleDelete(doc: VehicleDocument) {
    const ok = await confirm({
      title: "Supprimer ce document ?",
      variant: "danger",
      confirmText: "Supprimer",
    });
    if (!ok) return;
    const supabase = createClient();
    await supabase.storage.from(BUCKET).remove([doc.url]);
    await supabase.from("documents").delete().eq("id", doc.id);
    toast.success("Document supprimé.");
    window.location.reload();
  }

  return (
    <div className="space-y-3">
      {canUpload ? (
        <div className="flex justify-end">
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={handleUpload}
            accept=".pdf,.jpg,.jpeg,.png,.webp"
          />
          <Button size="sm" variant="outline" disabled={uploading} onClick={() => inputRef.current?.click()}>
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Importer un document
          </Button>
        </div>
      ) : (
        <p className="rounded-lg border border-dashed p-3 text-center text-xs text-muted-foreground">
          L&apos;import de documents (factures, carte grise…) est réservé au Premium.
        </p>
      )}

      {documents.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">Aucun document.</p>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="flex items-center justify-between gap-3 p-4">
                <button
                  onClick={() => openDoc(doc)}
                  className="flex min-w-0 items-center gap-2 text-left"
                >
                  <FileText className="h-4 w-4 shrink-0 text-primary" />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{doc.nom_fichier}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(doc.created_at)}</span>
                  </span>
                  <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
                </button>
                <Button variant="ghost" size="icon" aria-label="Supprimer" onClick={() => handleDelete(doc)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

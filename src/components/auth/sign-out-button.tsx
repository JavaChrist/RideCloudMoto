"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function SignOutButton({
  className,
  iconOnly,
}: {
  className?: string;
  iconOnly?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  async function handleSignOut() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <Button
      variant="ghost"
      size={iconOnly ? "icon" : "sm"}
      onClick={handleSignOut}
      disabled={loading}
      className={className}
      aria-label="Déconnexion"
    >
      <LogOut className="h-4 w-4" />
      {!iconOnly ? " Déconnexion" : null}
    </Button>
  );
}

import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SubscriptionSection } from "@/components/billing/subscription-section";
import { PushNotificationsSection } from "@/components/notifications/push-notifications-section";
import { DeleteAccountSection } from "@/components/account/delete-account-section";
import { BillingSuccessHandler } from "@/components/billing/billing-success-handler";
import { SignOutButton } from "@/components/auth/sign-out-button";
import type { Profile } from "@/types/database";

export const metadata: Metadata = { title: "Paramètres" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Suspense>
        <BillingSuccessHandler />
      </Suspense>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-sm text-muted-foreground">{user!.email}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Compte</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>
            <span className="text-muted-foreground">Nom : </span>
            {(profile as Profile)?.full_name ?? "—"}
          </p>
          <p>
            <span className="text-muted-foreground">E-mail : </span>
            {user!.email}
          </p>
          {isAdminEmail(user!.email) ? (
            <div className="space-y-2 pt-2">
              <p className="text-xs font-medium text-primary">Compte administrateur</p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/dealer-codes">Codes concessionnaire</Link>
              </Button>
            </div>
          ) : null}
          <div className="pt-3">
            <SignOutButton />
          </div>
        </CardContent>
      </Card>

      {profile ? <SubscriptionSection profile={profile as Profile} /> : null}

      <PushNotificationsSection />

      <DeleteAccountSection />
    </div>
  );
}

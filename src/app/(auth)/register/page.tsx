import { Suspense } from "react";
import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Créer un compte" };

interface RegisterPageProps {
  searchParams: Promise<{ code?: string }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { code } = await searchParams;

  return (
    <Suspense>
      <RegisterForm initialDealerCode={code?.trim().toUpperCase() ?? ""} />
    </Suspense>
  );
}

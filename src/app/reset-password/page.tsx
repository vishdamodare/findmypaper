import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/field";
import { ResetForm } from "@/components/auth/reset-form";

export const metadata: Metadata = { title: "Reset password" };

export default async function Reset({ searchParams }: PageProps<"/reset-password">) {
  const sp = await searchParams;
  const token = Array.isArray(sp.token) ? sp.token[0] : sp.token;
  return (
    <AuthShell title="Choose a new password" subtitle="Use at least 8 characters.">
      {token ? <ResetForm token={token} /> : <p className="text-sm text-destructive">This reset link is missing its token.</p>}
    </AuthShell>
  );
}

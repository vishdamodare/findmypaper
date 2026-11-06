import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { googleEnabled } from "@/auth";
import { AuthShell } from "@/components/auth/field";
import { RegisterForm } from "@/components/auth/register-form";
import { getSessionUser } from "@/lib/session";

export const metadata: Metadata = { title: "Sign up" };

export default async function Register() {
  if (await getSessionUser()) redirect("/dashboard");
  return (
    <AuthShell title="Create your account" subtitle="Free for students. Takes less than a minute.">
      <RegisterForm google={googleEnabled} />
      <p className="mt-5 text-center text-sm text-muted-foreground">Already registered? <Link href="/login" className="text-primary hover:underline">Log in</Link></p>
    </AuthShell>
  );
}

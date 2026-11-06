import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { googleEnabled } from "@/auth";
import { AuthShell } from "@/components/auth/field";
import { LoginForm, safeNext } from "@/components/auth/login-form";
import { getSessionUser } from "@/lib/session";

export const metadata: Metadata = { title: "Log in" };

export default async function Login({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const next = Array.isArray(sp.next) ? sp.next[0] : sp.next;
  if (await getSessionUser()) redirect(safeNext(next));
  return (
    <AuthShell title="Welcome back" subtitle="Log in to save resources and track your downloads.">
      <LoginForm next={next} google={googleEnabled} />
      <p className="mt-5 text-center text-sm text-muted-foreground">New here? <Link href="/register" className="text-primary hover:underline">Create an account</Link></p>
    </AuthShell>
  );
}

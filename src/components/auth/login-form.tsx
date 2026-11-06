"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loginSchema } from "@/lib/validators";
import type { z } from "zod";
import { Field } from "./field";

type V = z.infer<typeof loginSchema>;
export const safeNext = (n?: string) => (n && n.startsWith("/") && !n.startsWith("//") ? n : "/dashboard");

export function LoginForm({ next, google }: { next?: string; google: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<V>({ resolver: zodResolver(loginSchema) });
  const dest = safeNext(next);

  return (
    <form
      noValidate className="space-y-4"
      onSubmit={handleSubmit(async (v) => {
        setError("");
        const res = await signIn("credentials", { ...v, redirect: false });
        if (res?.error) return setError("Incorrect email or password");
        router.push(dest);
        router.refresh();
      })}
    >
      <Field label="Email" type="email" autoComplete="email" reg={register("email")} error={errors.email?.message} />
      <Field label="Password" type="password" autoComplete="current-password" reg={register("password")} error={errors.password?.message} />
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="h-10 w-full" disabled={isSubmitting}>{isSubmitting && <Loader2 className="animate-spin" />} Log in</Button>
      <Link href="/forgot-password" className="block text-center text-sm text-primary hover:underline">Forgot password?</Link>
      {google && (
        <>
          <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
          <Button type="button" variant="outline" className="h-10 w-full" onClick={() => signIn("google", { redirectTo: dest })}>Continue with Google</Button>
        </>
      )}
    </form>
  );
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { registerUser } from "@/lib/actions/auth";
import { registerSchema } from "@/lib/validators";
import { Field } from "./field";

type V = z.infer<typeof registerSchema>;

export function RegisterForm({ google }: { google: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<V>({ resolver: zodResolver(registerSchema) });

  return (
    <form
      noValidate className="space-y-4"
      onSubmit={handleSubmit(async (v) => {
        setError("");
        const res = await registerUser(v);
        if (!res.ok) return setError(res.error);
        const login = await signIn("credentials", { email: v.email, password: v.password, redirect: false });
        if (login?.error) return setError("Account created, but automatic login failed. Please log in.");
        router.push("/profile");
        router.refresh();
      })}
    >
      <Field label="Full name" autoComplete="name" reg={register("name")} error={errors.name?.message} />
      <Field label="Email" type="email" autoComplete="email" reg={register("email")} error={errors.email?.message} />
      <Field label="Password" type="password" autoComplete="new-password" reg={register("password")} error={errors.password?.message} />
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="h-10 w-full" disabled={isSubmitting}>{isSubmitting && <Loader2 className="animate-spin" />} Create account</Button>
      {google && <Button type="button" variant="outline" className="h-10 w-full" onClick={() => signIn("google", { redirectTo: "/profile" })}>Sign up with Google</Button>}
    </form>
  );
}

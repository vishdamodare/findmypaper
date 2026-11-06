"use client";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { requestPasswordReset } from "@/lib/actions/auth";
import { forgotSchema } from "@/lib/validators";
import { Field } from "./field";

export function ForgotForm() {
  const [state, setState] = useState<{ error?: string; sent?: boolean; devLink?: string }>({});
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof forgotSchema>>({ resolver: zodResolver(forgotSchema) });
  if (state.sent)
    return (
      <div className="space-y-3 text-sm">
        <p>If an account exists for that email, a reset link has been generated. It expires in 1 hour.</p>
        {state.devLink ? <p className="rounded-lg bg-muted p-3">Email delivery is not configured in this environment. Dev reset link: <Link className="break-all text-primary underline" href={state.devLink}>open reset page</Link></p> : <p className="text-muted-foreground">Check your inbox, or contact the administrator if email delivery is not set up.</p>}
      </div>
    );
  return (
    <form noValidate className="space-y-4" onSubmit={handleSubmit(async (v) => {
      const r = await requestPasswordReset(v);
      setState(r.ok ? { sent: true, devLink: r.devLink } : { error: r.error });
    })}>
      <Field label="Email" type="email" autoComplete="email" reg={register("email")} error={errors.email?.message} />
      {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" className="h-10 w-full" disabled={isSubmitting}>{isSubmitting && <Loader2 className="animate-spin" />} Send reset link</Button>
    </form>
  );
}

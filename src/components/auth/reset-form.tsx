"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { resetPassword } from "@/lib/actions/auth";
import { registerSchema } from "@/lib/validators";
import { Field } from "./field";

export function ResetForm({ token }: { token: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<{ password: string }>({ resolver: zodResolver(registerSchema.pick({ password: true })) });
  return (
    <form noValidate className="space-y-4" onSubmit={handleSubmit(async (v) => {
      const r = await resetPassword({ token, password: v.password });
      if (!r.ok) return setError(r.error);
      toast.success("Password updated. Please log in.");
      router.push("/login");
    })}>
      <Field label="New password" type="password" autoComplete="new-password" reg={register("password")} error={errors.password?.message} />
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="h-10 w-full" disabled={isSubmitting}>{isSubmitting && <Loader2 className="animate-spin" />} Update password</Button>
    </form>
  );
}

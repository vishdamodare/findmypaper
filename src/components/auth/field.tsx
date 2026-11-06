import type { UseFormRegisterReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function Field({ label, error, reg, type = "text", autoComplete }: { label: string; error?: string; reg: UseFormRegisterReturn; type?: string; autoComplete?: string }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={reg.name}>{label}</Label>
      <Input id={reg.name} type={type} autoComplete={autoComplete} aria-invalid={!!error} className="h-10" {...reg} />
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">{subtitle}</p>
      <div className="rounded-2xl border bg-card p-6 shadow-sm">{children}</div>
    </div>
  );
}

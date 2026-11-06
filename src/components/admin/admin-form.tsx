"use client";
import { useRef, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Res = { ok: true; id?: string } | { ok: false; error: string };

export function AdminForm({ action, submitLabel, success, reset = true, className, children, onDone }: {
  action: (fd: FormData) => Promise<Res>; submitLabel: string; success: string; reset?: boolean; className?: string; children: React.ReactNode; onDone?: (id?: string) => void;
}) {
  const ref = useRef<HTMLFormElement>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <form ref={ref} className={className} onSubmit={(e) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      start(async () => {
        const r = await action(fd);
        if (!r.ok) return void toast.error(r.error);
        toast.success(success);
        if (reset) ref.current?.reset();
        router.refresh();
        onDone?.(r.id);
      });
    }}>
      {children}
      <Button type="submit" disabled={pending} className="h-10">{pending && <Loader2 className="animate-spin" />} {submitLabel}</Button>
    </form>
  );
}

export function DeleteButton({ action, label, confirmText }: { action: () => Promise<Res>; label: string; confirmText: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <Button variant="ghost" size="icon-sm" aria-label={label} disabled={pending} className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => {
      if (!confirm(confirmText)) return;
      start(async () => {
        const r = await action();
        if (!r.ok) return void toast.error(r.error);
        toast.success("Deleted");
        router.refresh();
      });
    }}>
      {pending ? <Loader2 className="animate-spin" /> : <Trash2 />}
    </Button>
  );
}

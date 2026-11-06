"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SORTS } from "@/lib/sorts";

export function SortSelect({ value }: { value: string }) {
  const router = useRouter();
  const path = usePathname();
  const sp = useSearchParams();
  return (
    <label className="flex items-center gap-2 text-sm text-muted-foreground">
      Sort by
      <select
        value={value} aria-label="Sort resources"
        onChange={(e) => { const p = new URLSearchParams(sp); p.set("sort", e.target.value); p.delete("page"); router.push(`${path}?${p}`); }}
        className="h-9 rounded-lg border border-input bg-background px-2 text-sm text-foreground"
      >
        {Object.entries(SORTS).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
      </select>
    </label>
  );
}

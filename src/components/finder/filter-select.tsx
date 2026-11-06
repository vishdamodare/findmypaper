import { Loader2 } from "lucide-react";

export type Opt = { value: string; label: string };

export function FilterSelect({
  label, value, onChange, options, placeholder, disabled, loading, hint,
}: {
  label: string; value: string; onChange: (v: string) => void; options: Opt[];
  placeholder: string; disabled?: boolean; loading?: boolean; hint?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="relative block">
        <select
          value={value}
          disabled={disabled || loading}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-full appearance-none rounded-lg border border-input bg-background px-3 pr-9 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">{loading ? "Loading…" : disabled && hint ? hint : placeholder}</option>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-3 grid place-items-center text-muted-foreground">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m3 4.5 3 3 3-3" /></svg>}
        </span>
      </span>
    </label>
  );
}

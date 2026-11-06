export const inputCls = "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40";

export function Sel({ name, label, options, required = true, defaultValue }: { name: string; label: string; options: { value: string; label: string }[]; required?: boolean; defaultValue?: string }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <select name={name} required={required} defaultValue={defaultValue ?? ""} className={inputCls}>
        <option value="">Select…</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

export function Txt({ name, label, type = "text", required = true, defaultValue, placeholder }: { name: string; label: string; type?: string; required?: boolean; defaultValue?: string | number; placeholder?: string }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input name={name} type={type} required={required} defaultValue={defaultValue} placeholder={placeholder} className={inputCls} />
    </label>
  );
}

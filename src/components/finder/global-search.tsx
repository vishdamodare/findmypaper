"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, FileText, GraduationCap, Search } from "lucide-react";

type Suggestions = {
  subjects: { id: string; name: string; code: string }[];
  resources: { id: string; title: string }[];
  universities: { id: string; name: string }[];
};

export function GlobalSearch({ size = "lg", autoFocus }: { size?: "lg" | "md"; autoFocus?: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [res, setRes] = useState<{ q: string; data: Suggestions } | null>(null);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (q.trim().length < 2) return;
    const ac = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/suggest?q=${encodeURIComponent(q.trim())}`, { signal: ac.signal }).then((r) => r.json()).then((data) => setRes({ q, data })).catch(() => {});
    }, 200);
    return () => { clearTimeout(t); ac.abort(); };
  }, [q]);
  useEffect(() => {
    const close = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const data = res && q.trim().length >= 2 ? res.data : null;
  const empty = data && !data.subjects.length && !data.resources.length && !data.universities.length;
  const row = "flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent";

  return (
    <div ref={box} className="relative w-full">
      <form onSubmit={(e) => { e.preventDefault(); setOpen(false); router.push(`/resources?q=${encodeURIComponent(q.trim())}`); }}>
        <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
        <input
          autoFocus={autoFocus} value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)}
          placeholder="Search subjects, codes, notes, PYQs…" aria-label="Search resources" autoComplete="off"
          className={`w-full rounded-xl border border-input bg-background pr-28 pl-12 shadow-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 ${size === "lg" ? "h-14 text-base" : "h-11 text-sm"}`}
        />
        <button type="submit" className="absolute top-1/2 right-2 h-10 -translate-y-1/2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">Search</button>
      </form>
      {open && data && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border bg-popover py-1 text-left shadow-lg">
          {empty && <p className="px-4 py-3 text-sm text-muted-foreground">No suggestions. Press Enter to search everything.</p>}
          {data.subjects.map((s) => <Link key={s.id} href={`/subjects/${s.id}`} className={row} onClick={() => setOpen(false)}><BookOpen className="size-4 text-primary" /><span className="flex-1 truncate">{s.name}</span><span className="text-xs text-muted-foreground">{s.code}</span></Link>)}
          {data.resources.map((r) => <Link key={r.id} href={`/resources/${r.id}`} className={row} onClick={() => setOpen(false)}><FileText className="size-4 text-primary" /><span className="truncate">{r.title}</span></Link>)}
          {data.universities.map((u) => <Link key={u.id} href={`/resources?universityId=${u.id}`} className={row} onClick={() => setOpen(false)}><GraduationCap className="size-4 text-primary" /><span className="truncate">{u.name}</span></Link>)}
        </div>
      )}
    </div>
  );
}

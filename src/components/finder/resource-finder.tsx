"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RotateCcw, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterSelect } from "./filter-select";
import { useOptions } from "./use-options";

export type FinderValues = {
  q: string; universityId: string; courseId: string; branchId: string; regulationId: string;
  academicYearId: string; studentYear: string; semester: string; subjectId: string; categoryId: string;
};
export const EMPTY: FinderValues = { q: "", universityId: "", courseId: "", branchId: "", regulationId: "", academicYearId: "", studentYear: "", semester: "", subjectId: "", categoryId: "" };
const YEARS = ["FE", "SE", "TE", "BE"];

// Changing a field clears everything that depends on it.
const DEPENDENTS: Partial<Record<keyof FinderValues, (keyof FinderValues)[]>> = {
  universityId: ["courseId", "branchId", "regulationId", "subjectId"],
  courseId: ["branchId", "subjectId"],
  branchId: ["subjectId"],
  regulationId: ["subjectId"],
  studentYear: ["semester", "subjectId"],
  semester: ["subjectId"],
};

type Named = { id: string; name: string };

export function ResourceFinder({ initial, sort }: { initial?: Partial<FinderValues>; sort?: string }) {
  const router = useRouter();
  const [v, setV] = useState<FinderValues>({ ...EMPTY, ...initial });
  const [searching, setSearching] = useState(false);
  const [count, setCount] = useState<{ key: string; total: number } | null>(null);

  const set = (k: keyof FinderValues, val: string) =>
    setV((cur) => {
      const next = { ...cur, [k]: val };
      for (const d of DEPENDENTS[k] ?? []) next[d] = "";
      return next;
    });

  const unis = useOptions<Named>("universities", {});
  const courses = useOptions<Named>("courses", { universityId: v.universityId }, !!v.universityId);
  const branches = useOptions<Named & { code: string }>("branches", { courseId: v.courseId }, !!v.courseId);
  const regs = useOptions<Named>("regulations", { universityId: v.universityId }, !!v.universityId);
  const years = useOptions<{ id: string; label: string }>("academicYears", {});
  const sems = useOptions<{ number: number; studentYear: string }>("semesters", { studentYear: v.studentYear });
  const cats = useOptions<Named>("categories", {});
  const subjects = useOptions<{ id: string; name: string; code: string }>(
    "subjects",
    { branchId: v.branchId, regulationId: v.regulationId, studentYear: v.studentYear, semester: v.semester },
    !!v.branchId,
  );

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    (Object.keys(v) as (keyof FinderValues)[]).forEach((k) => v[k] && p.set(k, v[k]));
    return p.toString();
  }, [v]);

  // live "N resources match" (debounced)
  useEffect(() => {
    const ac = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/resources/count?${qs}`, { signal: ac.signal }).then((r) => r.json()).then((d) => setCount({ key: qs, total: d.total })).catch(() => {});
    }, 250);
    return () => { clearTimeout(t); ac.abort(); };
  }, [qs]);

  const go = (params: string) => { setSearching(true); router.push(`/resources${params ? `?${params}` : ""}`); };
  const submit = (e: React.FormEvent) => { e.preventDefault(); go(sort ? `${qs}${qs ? "&" : ""}sort=${sort}` : qs); };
  const clear = () => { setV(EMPTY); setSearching(false); if (initial) router.push("/resources"); };

  const chips = ([
    ["q", v.q ? `“${v.q}”` : ""],
    ["universityId", unis.data.find((x) => x.id === v.universityId)?.name],
    ["courseId", courses.data.find((x) => x.id === v.courseId)?.name],
    ["branchId", branches.data.find((x) => x.id === v.branchId)?.code],
    ["regulationId", regs.data.find((x) => x.id === v.regulationId)?.name],
    ["academicYearId", years.data.find((x) => x.id === v.academicYearId)?.label],
    ["studentYear", v.studentYear],
    ["semester", v.semester && `Sem ${v.semester}`],
    ["subjectId", subjects.data.find((x) => x.id === v.subjectId)?.name],
    ["categoryId", cats.data.find((x) => x.id === v.categoryId)?.name],
  ] as [keyof FinderValues, string | undefined][]).filter(([k, label]) => v[k] && label);

  const countLoading = !count || count.key !== qs;
  const opts = <T,>(rows: T[], f: (r: T) => { value: string; label: string }) => rows.map(f);
  const semRows = sems.data;

  return (
    <form onSubmit={submit} className="space-y-5 rounded-2xl border bg-card p-5 shadow-sm md:p-6">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={v.q} onChange={(e) => set("q", e.target.value)} placeholder="Search by keyword, subject, code or title…" aria-label="Search keywords"
          className="h-11 w-full rounded-lg border border-input bg-background pr-3 pl-9 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <FilterSelect label="University" value={v.universityId} onChange={(x) => set("universityId", x)} loading={unis.loading} placeholder="Select university" options={opts(unis.data, (o) => ({ value: o.id, label: o.name }))} />
        <FilterSelect label="Course / Degree" value={v.courseId} onChange={(x) => set("courseId", x)} disabled={!v.universityId} hint="Select university first" loading={courses.loading} placeholder="Select course" options={opts(courses.data, (o) => ({ value: o.id, label: o.name }))} />
        <FilterSelect label="Branch / Department" value={v.branchId} onChange={(x) => set("branchId", x)} disabled={!v.courseId} hint="Select course first" loading={branches.loading} placeholder="Select branch" options={opts(branches.data, (o) => ({ value: o.id, label: `${o.name} (${o.code})` }))} />
        <FilterSelect label="Regulation / Pattern" value={v.regulationId} onChange={(x) => set("regulationId", x)} disabled={!v.universityId} hint="Select university first" loading={regs.loading} placeholder="Any pattern" options={opts(regs.data, (o) => ({ value: o.id, label: o.name }))} />
        <FilterSelect label="Academic year" value={v.academicYearId} onChange={(x) => set("academicYearId", x)} loading={years.loading} placeholder="Any year" options={opts(years.data, (o) => ({ value: o.id, label: o.label }))} />
        <FilterSelect label="Student year" value={v.studentYear} onChange={(x) => set("studentYear", x)} placeholder="Any year" options={YEARS.map((y) => ({ value: y, label: y }))} />
        <FilterSelect label="Semester" value={v.semester} onChange={(x) => set("semester", x)} loading={sems.loading} placeholder="Any semester" options={opts(semRows, (o) => ({ value: String(o.number), label: `Semester ${o.number}` }))} />
        <FilterSelect label="Subject" value={v.subjectId} onChange={(x) => set("subjectId", x)} disabled={!v.branchId} hint="Select branch first" loading={subjects.loading} placeholder={subjects.data.length || subjects.loading ? "Select subject" : "No subjects for this combination"} options={opts(subjects.data, (o) => ({ value: o.id, label: o.name }))} />
        <FilterSelect label="Resource type" value={v.categoryId} onChange={(x) => set("categoryId", x)} loading={cats.loading} placeholder="All types" options={opts(cats.data, (o) => ({ value: o.id, label: o.name }))} />
      </div>

      {chips.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Active filters">
          {chips.map(([k, label]) => (
            <li key={k}>
              <button type="button" onClick={() => set(k, "")} className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground hover:bg-accent/70">
                {label} <X className="size-3" aria-label={`Remove ${label}`} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" disabled={searching} className="h-10 px-5">
          {searching ? <Loader2 className="animate-spin" /> : <Search />} Search
        </Button>
        <Button type="button" variant="ghost" size="lg" className="h-10" onClick={clear} disabled={!chips.length}><RotateCcw /> Clear filters</Button>
        <p className="ml-auto text-sm text-muted-foreground" aria-live="polite">
          {countLoading ? <span className="inline-flex items-center gap-1.5"><Loader2 className="size-3.5 animate-spin" /> Counting…</span> : <><strong className="text-foreground">{count!.total.toLocaleString("en-IN")}</strong> resource{count!.total === 1 ? "" : "s"} match</>}
        </p>
      </div>
    </form>
  );
}

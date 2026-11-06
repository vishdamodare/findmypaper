import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { ResourceFinder } from "@/components/finder/resource-finder";

export const metadata: Metadata = { title: "Subjects" };

export default async function Subjects({ searchParams }: PageProps<"/subjects">) {
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim();
  const subjects = await db.subject.findMany({
    where: q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { code: { contains: q, mode: "insensitive" } }] } : {},
    select: { id: true, name: true, code: true, semester: { select: { number: true, studentYear: true } }, regulation: { select: { name: true } }, branch: { select: { code: true, course: { select: { university: { select: { name: true } } } } } }, _count: { select: { resources: true } } },
    orderBy: [{ branch: { course: { university: { name: "asc" } } } }, { semester: { number: "asc" } }, { name: "asc" }],
    take: 200,
  });
  const groups = Map.groupBy(subjects, (s) => s.branch.course.university.name);
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Subjects</h1>
      <form className="my-6 flex max-w-md gap-2"><input name="q" defaultValue={q} placeholder="Filter by name or code…" aria-label="Filter subjects" className="h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm" /><button className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">Filter</button></form>
      {subjects.length === 0 && <p className="text-muted-foreground">No subjects match “{q}”.</p>}
      {[...groups].map(([uni, list]) => (
        <section key={uni} className="mb-10">
          <h2 className="mb-3 text-lg font-semibold">{uni}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((s) => (
              <Link key={s.id} href={`/subjects/${s.id}`} className="rounded-xl border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent/40">
                <p className="font-medium">{s.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.code} · {s.branch.code} · {s.semester.studentYear} Sem {s.semester.number} · {s.regulation.name}</p>
                <p className="mt-2 text-xs font-medium text-primary">{s._count.resources} resources</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
      <div className="mt-16"><h2 className="mb-3 text-lg font-semibold">Looking for something specific?</h2><ResourceFinder /></div>
    </div>
  );
}

import type { Metadata } from "next";
import { AdminForm, DeleteButton } from "@/components/admin/admin-form";
import { Sel, Txt } from "@/components/admin/ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createSubject, deleteSubject } from "@/lib/actions/admin";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Manage subjects" };

export default async function AdminSubjects({ searchParams }: PageProps<"/admin/subjects">) {
  const sp = await searchParams;
  const q = String((Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? "").trim();
  const [branches, regs, sems, subjects] = await Promise.all([
    db.branch.findMany({ select: { id: true, code: true, name: true, course: { select: { name: true, university: { select: { name: true } } } } }, orderBy: { name: "asc" } }),
    db.regulation.findMany({ select: { id: true, name: true, university: { select: { name: true } } }, orderBy: { name: "asc" } }),
    db.semester.findMany({ orderBy: { number: "asc" } }),
    db.subject.findMany({
      where: q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { code: { contains: q, mode: "insensitive" } }] } : {},
      select: { id: true, code: true, name: true, semester: { select: { number: true } }, regulation: { select: { name: true } }, branch: { select: { code: true, course: { select: { university: { select: { name: true } } } } } }, _count: { select: { resources: true } } },
      orderBy: [{ createdAt: "desc" }], take: 100,
    }),
  ]);
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-tight">Subjects</h1>
      <section className="rounded-2xl border bg-card p-6">
        <h2 className="mb-4 font-semibold">Add subject</h2>
        <AdminForm action={createSubject} submitLabel="Add subject" success="Subject added" className="grid items-end gap-4 sm:grid-cols-2">
          <Txt name="code" label="Subject code" placeholder="e.g. EXTC501" /><Txt name="name" label="Subject name" />
          <Sel name="branchId" label="Branch" options={branches.map((b) => ({ value: b.id, label: `${b.course.university.name} · ${b.course.name} · ${b.code}` }))} />
          <Sel name="regulationId" label="Regulation / pattern" options={regs.map((r) => ({ value: r.id, label: `${r.university.name} · ${r.name}` }))} />
          <Sel name="semesterId" label="Semester" options={sems.map((s) => ({ value: s.id, label: `Semester ${s.number} (${s.studentYear})` }))} />
        </AdminForm>
      </section>
      <form className="flex max-w-sm gap-2"><input name="q" defaultValue={q} placeholder="Search name or code…" aria-label="Search subjects" className="h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm" /><button className="h-10 rounded-lg border px-4 text-sm font-medium hover:bg-muted">Search</button></form>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <Table>
          <TableHeader><TableRow><TableHead>Subject</TableHead><TableHead>University</TableHead><TableHead>Branch</TableHead><TableHead>Sem</TableHead><TableHead>Pattern</TableHead><TableHead className="text-right">Files</TableHead><TableHead className="w-12" /></TableRow></TableHeader>
          <TableBody>
            {subjects.map((s) => (
              <TableRow key={s.id}>
                <TableCell><span className="font-medium">{s.name}</span><span className="block text-xs text-muted-foreground">{s.code}</span></TableCell>
                <TableCell>{s.branch.course.university.name}</TableCell><TableCell>{s.branch.code}</TableCell><TableCell>{s.semester.number}</TableCell><TableCell>{s.regulation.name}</TableCell>
                <TableCell className="text-right">{s._count.resources}</TableCell>
                <TableCell><DeleteButton label={`Delete ${s.name}`} confirmText={`Delete “${s.name}” and its ${s._count.resources} resource(s)?`} action={deleteSubject.bind(null, s.id)} /></TableCell>
              </TableRow>
            ))}
            {!subjects.length && <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">No subjects found.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminForm, DeleteButton } from "@/components/admin/admin-form";
import { Sel, Txt } from "@/components/admin/ui";
import { createMaster, deleteMaster, type MasterKind } from "@/lib/actions/admin";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Academic data" };

function Block({ title, kind, fields, rows }: { title: string; kind: MasterKind; fields: ReactNode; rows: { id: string; label: string }[] }) {
  return (
    <section className="rounded-2xl border bg-card p-6">
      <h2 className="mb-4 font-semibold">{title}</h2>
      <AdminForm action={createMaster.bind(null, kind)} submitLabel="Add" success={`${title.replace(/s$/, "")} added`} className="mb-5 grid items-end gap-3 sm:grid-cols-[repeat(auto-fit,minmax(150px,1fr))]">{fields}</AdminForm>
      <ul className="max-h-64 divide-y overflow-y-auto rounded-lg border text-sm">
        {rows.map((r) => <li key={r.id} className="flex items-center justify-between gap-2 px-3 py-1.5"><span className="truncate">{r.label}</span><DeleteButton label={`Delete ${r.label}`} confirmText={`Delete “${r.label}”? Everything under it is deleted too.`} action={deleteMaster.bind(null, kind, r.id)} /></li>)}
        {!rows.length && <li className="px-3 py-4 text-center text-muted-foreground">Nothing yet.</li>}
      </ul>
    </section>
  );
}

export default async function Academics() {
  const [unis, courses, branches, regs, years, sems, cats] = await Promise.all([
    db.university.findMany({ orderBy: { name: "asc" } }),
    db.course.findMany({ include: { university: true }, orderBy: { name: "asc" } }),
    db.branch.findMany({ include: { course: { include: { university: true } } }, orderBy: { name: "asc" } }),
    db.regulation.findMany({ include: { university: true }, orderBy: { name: "asc" } }),
    db.academicYear.findMany({ orderBy: { startYear: "desc" } }),
    db.semester.findMany({ orderBy: { number: "asc" } }),
    db.resourceCategory.findMany({ orderBy: { name: "asc" } }),
  ]);
  const uniOpts = unis.map((u) => ({ value: u.id, label: u.name }));
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">Academic data</h1><p className="mt-1 text-muted-foreground">Everything students filter by comes from here. Deleting an item also deletes what is under it.</p></div>
      <Block title="Universities" kind="university" fields={<><Txt name="name" label="Name" /><Txt name="city" label="City" required={false} /></>} rows={unis.map((u) => ({ id: u.id, label: u.name }))} />
      <Block title="Courses" kind="course" fields={<><Sel name="universityId" label="University" options={uniOpts} /><Txt name="name" label="Course (e.g. BE)" /></>} rows={courses.map((c) => ({ id: c.id, label: `${c.university.name} · ${c.name}` }))} />
      <Block title="Branches" kind="branch" fields={<><Sel name="courseId" label="Course" options={courses.map((c) => ({ value: c.id, label: `${c.university.name} · ${c.name}` }))} /><Txt name="name" label="Branch name" /><Txt name="code" label="Code" /></>} rows={branches.map((b) => ({ id: b.id, label: `${b.course.university.name} · ${b.course.name} · ${b.name} (${b.code})` }))} />
      <Block title="Regulations / patterns" kind="regulation" fields={<><Sel name="universityId" label="University" options={uniOpts} /><Txt name="name" label="Pattern (e.g. NEP)" /></>} rows={regs.map((r) => ({ id: r.id, label: `${r.university.name} · ${r.name}` }))} />
      <Block title="Academic years" kind="academicYear" fields={<Txt name="startYear" label="Start year" type="number" placeholder="2027" />} rows={years.map((y) => ({ id: y.id, label: y.label }))} />
      <Block title="Semesters" kind="semester" fields={<><Txt name="number" label="Number" type="number" /><Sel name="studentYear" label="Student year" options={["FE", "SE", "TE", "BE"].map((y) => ({ value: y, label: y }))} /></>} rows={sems.map((s) => ({ id: s.id, label: `Semester ${s.number} · ${s.studentYear}` }))} />
      <Block title="Resource categories" kind="category" fields={<><Txt name="name" label="Name" /><Txt name="description" label="Description" required={false} /></>} rows={cats.map((c) => ({ id: c.id, label: c.name }))} />
    </div>
  );
}

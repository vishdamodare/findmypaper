import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminForm } from "@/components/admin/admin-form";
import { Sel, Txt, inputCls } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { updateResource } from "@/lib/actions/admin";

export const metadata: Metadata = { title: "Edit resource" };

export default async function EditResource({ params }: PageProps<"/admin/resources/[id]">) {
  const { id } = await params;
  const [r, subjects, cats, years] = await Promise.all([
    db.resource.findUnique({ where: { id } }),
    db.subject.findMany({ select: { id: true, name: true, code: true, semester: { select: { number: true } }, branch: { select: { code: true, course: { select: { university: { select: { name: true } } } } } } }, orderBy: [{ branch: { course: { university: { name: "asc" } } } }, { name: "asc" }] }),
    db.resourceCategory.findMany({ orderBy: { name: "asc" } }),
    db.academicYear.findMany({ orderBy: { startYear: "desc" } }),
  ]);
  if (!r) notFound();
  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Edit resource</h1>
      <div className="rounded-2xl border bg-card p-6">
        <AdminForm action={updateResource.bind(null, id)} submitLabel="Save changes" success="Resource updated" reset={false} className="space-y-4">
          <Txt name="title" label="Title" defaultValue={r.title} />
          <Sel name="subjectId" label="Subject" defaultValue={r.subjectId} options={subjects.map((s) => ({ value: s.id, label: `${s.branch.course.university.name} · ${s.branch.code} · Sem ${s.semester.number} · ${s.name} (${s.code})` }))} />
          <Sel name="categoryId" label="Resource type" defaultValue={r.categoryId} options={cats.map((c) => ({ value: c.id, label: c.name }))} />
          <Sel name="academicYearId" label="Academic year" defaultValue={r.academicYearId} options={years.map((y) => ({ value: y.id, label: y.label }))} />
          <label className="block space-y-1.5"><span className="text-xs font-medium text-muted-foreground">Description</span><textarea name="description" rows={3} defaultValue={r.description ?? ""} className={`${inputCls} h-auto py-2`} /></label>
        </AdminForm>
        <p className="mt-4 text-xs text-muted-foreground">To change the file itself, delete this resource and upload a new one.</p>
      </div>
    </div>
  );
}

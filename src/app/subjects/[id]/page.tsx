import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ResourceCard } from "@/components/resource/resource-card";
import { db } from "@/lib/db";
import { resourceSelect } from "@/lib/queries";
import { getSessionUser } from "@/lib/session";

export async function generateMetadata({ params }: PageProps<"/subjects/[id]">): Promise<Metadata> {
  const s = await db.subject.findUnique({ where: { id: (await params).id }, select: { name: true } });
  return { title: s?.name ?? "Subject" };
}

export default async function SubjectPage({ params, searchParams }: PageProps<"/subjects/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const cat = Array.isArray(sp.category) ? sp.category[0] : sp.category;
  const user = await getSessionUser();
  const subject = await db.subject.findUnique({
    where: { id },
    select: { name: true, code: true, semester: true, regulation: true, branch: { select: { name: true, course: { select: { name: true, university: true } } } } },
  });
  if (!subject) notFound();
  const [cats, resources] = await Promise.all([
    db.resourceCategory.findMany({ select: { name: true, slug: true, _count: { select: { resources: { where: { subjectId: id } } } } }, orderBy: { name: "asc" } }),
    db.resource.findMany({ where: { subjectId: id, ...(cat && { category: { slug: cat } }) }, select: resourceSelect(user?.id), orderBy: { downloadCount: "desc" } }),
  ]);
  const pill = (active: boolean) => `rounded-full border px-3 py-1 text-sm ${active ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted"}`;
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="text-sm text-muted-foreground">{subject.branch.course.university.name} · {subject.branch.course.name} · {subject.branch.name}</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight">{subject.name}</h1>
      <p className="mt-1 text-muted-foreground">{subject.code} · {subject.semester.studentYear} Semester {subject.semester.number} · {subject.regulation.name}</p>
      <div className="my-6 flex flex-wrap gap-2">
        <Link href={`/subjects/${id}`} className={pill(!cat)}>All</Link>
        {cats.filter((c) => c._count.resources).map((c) => <Link key={c.slug} href={`/subjects/${id}?category=${c.slug}`} className={pill(cat === c.slug)}>{c.name.replace(" (PYQs)", "")} ({c._count.resources})</Link>)}
      </div>
      {resources.length ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{resources.map((r) => <ResourceCard key={r.id} r={r} />)}</div> : <p className="rounded-2xl border border-dashed py-16 text-center text-muted-foreground">No resources uploaded for this subject yet.</p>}
    </div>
  );
}

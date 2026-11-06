import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { BookmarkButton } from "@/components/resource/bookmark-button";
import { PdfViewer } from "@/components/resource/pdf-viewer-lazy";
import { ResourceCard } from "@/components/resource/resource-card";
import { db } from "@/lib/db";
import { fileFormat, formatBytes, resourceSelect } from "@/lib/queries";
import { getSessionUser } from "@/lib/session";

export async function generateMetadata({ params }: PageProps<"/resources/[id]">): Promise<Metadata> {
  const { id } = await params;
  const r = await db.resource.findUnique({ where: { id }, select: { title: true } });
  return { title: r?.title ?? "Resource" };
}

export default async function ResourcePage({ params }: PageProps<"/resources/[id]">) {
  const { id } = await params;
  const user = await getSessionUser();
  const r = await db.resource.findUnique({ where: { id }, select: resourceSelect(user?.id) });
  if (!r) notFound();
  const related = await db.resource.findMany({ where: { subjectId: r.subject.id, id: { not: r.id } }, select: resourceSelect(user?.id), orderBy: { downloadCount: "desc" }, take: 3 });
  const { branch, regulation, semester } = r.subject;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <nav className="mb-4 text-sm text-muted-foreground"><Link href="/resources" className="hover:text-foreground">Resources</Link> / <Link href={`/subjects/${r.subject.id}`} className="hover:text-foreground">{r.subject.name}</Link></nav>
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-4">
          <div className="flex items-start gap-2">
            <h1 className="flex-1 text-2xl font-bold tracking-tight">{r.title}</h1>
            <BookmarkButton id={r.id} initial={!!r.bookmarks?.length} />
          </div>
          {r.description && <p className="text-muted-foreground">{r.description}</p>}
          {r.mimeType === "application/pdf" ? (
            <div className="h-[75vh] overflow-hidden rounded-2xl border"><PdfViewer resourceId={r.id} fileName={r.fileName} /></div>
          ) : (
            <p className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">Preview is only available for PDF files. Download the file to open it.</p>
          )}
        </div>
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <a href={`/api/resources/${r.id}/download`} className={buttonVariants({ size: "lg", className: "h-11 w-full" })}><Download /> Download {fileFormat(r.fileName)}</a>
          <dl className="divide-y rounded-2xl border bg-card text-sm">
            {([
              ["Type", r.category.name], ["Subject", `${r.subject.name} (${r.subject.code})`], ["University", branch.course.university.name],
              ["Course / Branch", `${branch.course.name} · ${branch.name}`], ["Pattern", regulation.name], ["Semester", `${semester.studentYear} · Semester ${semester.number}`],
              ["Academic year", r.academicYear.label], ["File", `${fileFormat(r.fileName)} · ${formatBytes(r.fileSize)}`],
              ["Uploaded", r.createdAt.toLocaleDateString("en-IN", { dateStyle: "medium" })], ["Downloads", r.downloadCount.toLocaleString("en-IN")],
            ] as const).map(([k, v]) => <div key={k} className="flex justify-between gap-4 px-4 py-2.5"><dt className="text-muted-foreground">{k}</dt><dd className="text-right font-medium">{v}</dd></div>)}
          </dl>
          {r.isDemo && <Badge variant="outline" className="border-amber-400 text-amber-600">Demo placeholder – not a real university document</Badge>}
        </aside>
      </div>
      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-4 text-xl font-semibold">More for {r.subject.name}</h2>
          <div className="grid gap-5 md:grid-cols-3">{related.map((x) => <ResourceCard key={x.id} r={x} />)}</div>
        </section>
      )}
    </div>
  );
}

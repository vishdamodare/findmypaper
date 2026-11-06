import Link from "next/link";
import { CalendarDays, Download, FileText, HardDrive } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { fileFormat, formatBytes, type ResourceItem } from "@/lib/queries";
import { BookmarkButton } from "./bookmark-button";
import { PreviewButton } from "./preview-button";

const fmtDate = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export function ResourceCard({ r }: { r: ResourceItem }) {
  const format = fileFormat(r.fileName);
  return (
    <article className="group flex flex-col rounded-2xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground"><FileText className="size-5" /></span>
        <div className="min-w-0 flex-1">
          <Link href={`/resources/${r.id}`} className="line-clamp-2 font-semibold leading-snug hover:text-primary">{r.title}</Link>
          <Link href={`/subjects/${r.subject.id}`} className="mt-0.5 block truncate text-sm text-muted-foreground hover:text-foreground">{r.subject.name}</Link>
        </div>
        <BookmarkButton id={r.id} initial={!!r.bookmarks?.length} />
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge>{r.category.name.replace(" (PYQs)", "")}</Badge>
        <Badge variant="secondary">{r.academicYear.label}</Badge>
        <Badge variant="outline">Sem {r.subject.semester.number} · {r.subject.semester.studentYear}</Badge>
        {r.isDemo && <Badge variant="outline" className="border-amber-400 text-amber-600">Demo</Badge>}
      </div>
      {r.description && <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{r.description}</p>}
      <dl className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-1"><CalendarDays className="size-3.5" />{fmtDate(r.createdAt)}</div>
        <div className="flex items-center gap-1"><HardDrive className="size-3.5" />{format} · {formatBytes(r.fileSize)}</div>
        <div className="flex items-center gap-1"><Download className="size-3.5" />{r.downloadCount.toLocaleString("en-IN")} downloads</div>
      </dl>
      <div className="mt-auto flex gap-2 pt-4">
        <a href={`/api/resources/${r.id}/download`} className={buttonVariants({ className: "flex-1" })}><Download /> Download</a>
        <PreviewButton id={r.id} title={r.title} fileName={r.fileName} isPdf={r.mimeType === "application/pdf"} />
      </div>
    </article>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Upload } from "lucide-react";
import { DeleteButton } from "@/components/admin/admin-form";
import { Pagination } from "@/components/resource/pagination";
import { buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/db";
import { deleteResource } from "@/lib/actions/admin";
import { fileFormat, formatBytes } from "@/lib/queries";

export const metadata: Metadata = { title: "Manage resources" };
const SIZE = 20;

export default async function AdminResources({ searchParams }: PageProps<"/admin/resources">) {
  const sp = await searchParams;
  const q = String((Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? "").trim();
  const page = Math.max(1, parseInt(String(Array.isArray(sp.page) ? sp.page[0] : sp.page ?? "1"), 10) || 1);
  const where = q ? { OR: [{ title: { contains: q, mode: "insensitive" as const } }, { subject: { name: { contains: q, mode: "insensitive" as const } } }] } : {};
  const [total, rows] = await Promise.all([
    db.resource.count({ where }),
    db.resource.findMany({ where, select: { id: true, title: true, fileName: true, fileSize: true, downloadCount: true, isDemo: true, category: { select: { name: true } }, subject: { select: { name: true } }, academicYear: { select: { label: true } } }, orderBy: { createdAt: "desc" }, skip: (page - 1) * SIZE, take: SIZE }),
  ]);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Resources <span className="text-base font-normal text-muted-foreground">({total})</span></h1>
        <Link href="/admin/upload" className={buttonVariants()}><Upload /> Upload</Link>
      </div>
      <form className="flex max-w-sm gap-2"><input name="q" defaultValue={q} placeholder="Search title or subject…" aria-label="Search resources" className="h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm" /><button className="h-10 rounded-lg border px-4 text-sm font-medium hover:bg-muted">Search</button></form>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <Table>
          <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Type</TableHead><TableHead>Year</TableHead><TableHead>File</TableHead><TableHead className="text-right">Downloads</TableHead><TableHead className="w-24" /></TableRow></TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="max-w-xs"><Link href={`/resources/${r.id}`} className="block truncate font-medium hover:text-primary">{r.title}</Link><span className="text-xs text-muted-foreground">{r.subject.name}</span></TableCell>
                <TableCell>{r.category.name.replace(" (PYQs)", "")}</TableCell>
                <TableCell>{r.academicYear.label}</TableCell>
                <TableCell className="whitespace-nowrap">{fileFormat(r.fileName)} · {formatBytes(r.fileSize)}</TableCell>
                <TableCell className="text-right tabular-nums">{r.downloadCount}</TableCell>
                <TableCell><div className="flex justify-end"><Link href={`/admin/resources/${r.id}`} aria-label="Edit" className={buttonVariants({ variant: "ghost", size: "icon-sm" })}><Pencil /></Link><DeleteButton label={`Delete ${r.title}`} confirmText={`Delete “${r.title}” and its file?`} action={deleteResource.bind(null, r.id)} /></div></TableCell>
              </TableRow>
            ))}
            {!rows.length && <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">No resources found.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
      <Pagination page={page} pages={Math.max(1, Math.ceil(total / SIZE))} params={{ q }} />
    </div>
  );
}

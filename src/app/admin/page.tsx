import type { Metadata } from "next";
import Link from "next/link";
import { Download, FileText, Users } from "lucide-react";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminHome() {
  const [students, resources, downloads, popular] = await Promise.all([
    db.user.count({ where: { admin: null } }),
    db.resource.count(),
    db.download.count(),
    db.resource.findMany({ select: { id: true, title: true, downloadCount: true, subject: { select: { name: true } } }, orderBy: { downloadCount: "desc" }, take: 8 }),
  ]);
  const stat = [["Total students", students, Users], ["Resources", resources, FileText], ["Total downloads", downloads, Download]] as const;
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-tight">Admin overview</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        {stat.map(([k, n, Icon]) => <div key={k} className="rounded-2xl border bg-card p-5"><Icon className="size-5 text-primary" /><p className="mt-3 text-3xl font-semibold">{n.toLocaleString("en-IN")}</p><p className="text-sm text-muted-foreground">{k}</p></div>)}
      </div>
      <section>
        <h2 className="mb-3 text-lg font-semibold">Most popular resources</h2>
        <ol className="divide-y rounded-xl border bg-card">
          {popular.map((r, i) => (
            <li key={r.id} className="flex items-center gap-3 px-4 py-3 text-sm">
              <span className="w-5 text-muted-foreground">{i + 1}</span>
              <Link href={`/resources/${r.id}`} className="min-w-0 flex-1 truncate font-medium hover:text-primary">{r.title}<span className="ml-2 font-normal text-muted-foreground">{r.subject.name}</span></Link>
              <span className="tabular-nums">{r.downloadCount.toLocaleString("en-IN")}</span>
            </li>
          ))}
          {!popular.length && <li className="p-6 text-center text-sm text-muted-foreground">No resources yet.</li>}
        </ol>
      </section>
    </div>
  );
}

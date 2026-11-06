import Link from "next/link";
import { db } from "@/lib/db";

export async function DownloadHistory({ userId, take = 20 }: { userId: string; take?: number }) {
  const rows = await db.download.findMany({
    where: { userId, resource: { isNot: undefined } },
    select: { id: true, createdAt: true, resource: { select: { id: true, title: true, subject: { select: { name: true } } } } },
    orderBy: { createdAt: "desc" },
    take,
  });
  if (!rows.length) return <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">You haven’t downloaded anything yet.</p>;
  return (
    <ul className="divide-y rounded-xl border bg-card">
      {rows.map((d) => (
        <li key={d.id} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
          <div className="min-w-0"><Link href={`/resources/${d.resource.id}`} className="block truncate font-medium hover:text-primary">{d.resource.title}</Link><span className="text-xs text-muted-foreground">{d.resource.subject.name}</span></div>
          <time className="shrink-0 text-xs text-muted-foreground">{d.createdAt.toLocaleDateString("en-IN", { dateStyle: "medium" })}</time>
        </li>
      ))}
    </ul>
  );
}

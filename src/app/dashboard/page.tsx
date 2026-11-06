import type { Metadata } from "next";
import Link from "next/link";
import { Bookmark, Download, UserCog } from "lucide-react";
import { DownloadHistory } from "@/components/resource/download-history";
import { ResourceCard } from "@/components/resource/resource-card";
import { buttonVariants } from "@/components/ui/button";
import { db } from "@/lib/db";
import { searchResources } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Dashboard" };

export default async function Dashboard() {
  const session = await requireUser("/dashboard");
  const u = await db.user.findUniqueOrThrow({ where: { id: session.id }, include: { university: true, branch: true, _count: { select: { bookmarks: true, downloads: true } } } });
  const hasProfile = !!(u.branchId && u.semesterNo);
  const recommended = hasProfile
    ? await searchResources({ universityId: u.universityId ?? undefined, branchId: u.branchId ?? undefined, semester: String(u.semesterNo), sort: "downloads" }, u.id)
    : null;
  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hi, {u.name.split(" ")[0]} 👋</h1>
        <p className="mt-1 text-muted-foreground">{hasProfile ? `${u.university?.name} · ${u.branch?.code} · Semester ${u.semesterNo}` : "Complete your profile to see resources picked for your semester."}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/saved" className="rounded-2xl border bg-card p-5 hover:border-primary/40"><Bookmark className="size-5 text-primary" /><p className="mt-3 text-2xl font-semibold">{u._count.bookmarks}</p><p className="text-sm text-muted-foreground">Saved resources</p></Link>
        <div className="rounded-2xl border bg-card p-5"><Download className="size-5 text-primary" /><p className="mt-3 text-2xl font-semibold">{u._count.downloads}</p><p className="text-sm text-muted-foreground">Downloads</p></div>
        <Link href="/profile" className="rounded-2xl border bg-card p-5 hover:border-primary/40"><UserCog className="size-5 text-primary" /><p className="mt-3 text-lg font-semibold">{hasProfile ? "Edit profile" : "Complete profile"}</p><p className="text-sm text-muted-foreground">University, branch, semester</p></Link>
      </div>
      {recommended && (
        <section>
          <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-semibold">Popular for your semester</h2><Link href={`/resources?universityId=${u.universityId}&branchId=${u.branchId}&semester=${u.semesterNo}`} className="text-sm text-primary hover:underline">View all {recommended.total}</Link></div>
          {recommended.items.length ? <div className="grid gap-5 md:grid-cols-3">{recommended.items.slice(0, 3).map((r) => <ResourceCard key={r.id} r={r} />)}</div> : <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">No resources uploaded for your branch and semester yet.</p>}
        </section>
      )}
      {!hasProfile && <Link href="/profile" className={buttonVariants()}>Complete profile</Link>}
      <section><h2 className="mb-4 text-xl font-semibold">Recent downloads</h2><DownloadHistory userId={u.id} take={5} /></section>
    </div>
  );
}

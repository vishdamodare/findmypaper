import type { Metadata } from "next";
import Link from "next/link";
import { ProfileForm } from "@/components/profile/profile-form";
import { DownloadHistory } from "@/components/resource/download-history";
import { ResourceCard } from "@/components/resource/resource-card";
import { db } from "@/lib/db";
import { resourceSelect } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Profile" };

export default async function Profile() {
  const session = await requireUser("/profile");
  const u = await db.user.findUniqueOrThrow({ where: { id: session.id } });
  const saved = await db.resource.findMany({ where: { bookmarks: { some: { userId: u.id } } }, select: resourceSelect(u.id), orderBy: { createdAt: "desc" }, take: 3 });
  return (
    <div className="mx-auto max-w-5xl space-y-12 px-4 py-12">
      <section>
        <h1 className="text-3xl font-bold tracking-tight">Your profile</h1>
        <p className="mt-1 mb-6 text-muted-foreground">Set your academic details to get relevant suggestions on your dashboard.</p>
        <div className="rounded-2xl border bg-card p-6">
          <ProfileForm initial={{ name: u.name, email: u.email, universityId: u.universityId ?? "", courseId: u.courseId ?? "", branchId: u.branchId ?? "", academicYearId: u.academicYearId ?? "", semesterNo: u.semesterNo?.toString() ?? "" }} />
        </div>
      </section>
      <section>
        <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-semibold">Saved resources</h2><Link href="/saved" className="text-sm text-primary hover:underline">View all</Link></div>
        {saved.length ? <div className="grid gap-5 md:grid-cols-3">{saved.map((r) => <ResourceCard key={r.id} r={r} />)}</div> : <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">Nothing saved yet. Tap the bookmark icon on any resource.</p>}
      </section>
      <section><h2 className="mb-4 text-xl font-semibold">Download history</h2><DownloadHistory userId={u.id} /></section>
    </div>
  );
}

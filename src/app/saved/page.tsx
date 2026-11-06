import type { Metadata } from "next";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { ResourceCard } from "@/components/resource/resource-card";
import { buttonVariants } from "@/components/ui/button";
import { db } from "@/lib/db";
import { resourceSelect } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Saved resources" };

export default async function Saved() {
  const user = await requireUser("/saved");
  const items = await db.resource.findMany({ where: { bookmarks: { some: { userId: user.id } } }, select: resourceSelect(user.id), orderBy: { createdAt: "desc" } });
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Saved resources</h1>
      {items.length ? (
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{items.map((r) => <ResourceCard key={r.id} r={r} />)}</div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed py-20 text-center">
          <Bookmark className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-4 font-medium">No saved resources yet</p>
          <Link href="/explore" className={buttonVariants({ className: "mt-5" })}>Explore resources</Link>
        </div>
      )}
    </div>
  );
}

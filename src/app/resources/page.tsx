import type { Metadata } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { ResourceFinder } from "@/components/finder/resource-finder";
import { ResourceCard } from "@/components/resource/resource-card";
import { SortSelect } from "@/components/resource/sort-select";
import { Pagination } from "@/components/resource/pagination";
import { buttonVariants } from "@/components/ui/button";
import { searchResources, type ResourceFilters } from "@/lib/queries";
import { getSessionUser } from "@/lib/session";

export const metadata: Metadata = { title: "Resources" };

export default async function Resources({ searchParams }: PageProps<"/resources">) {
  const raw = await searchParams;
  const f: ResourceFilters = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]));
  const user = await getSessionUser();
  const { items, total, page, pages, sort } = await searchResources(f, user?.id);
  const { page: _p, sort: _s, ...rest } = f;
  void _p; void _s;

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <ResourceFinder key={JSON.stringify(raw)} initial={{ q: f.q, universityId: f.universityId, courseId: f.courseId, branchId: f.branchId, regulationId: f.regulationId, academicYearId: f.academicYearId, studentYear: f.studentYear, semester: f.semester, subjectId: f.subjectId, categoryId: f.categoryId }} sort={sort} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">{total.toLocaleString("en-IN")} resource{total === 1 ? "" : "s"} found{f.category ? ` · ${f.category.replace(/-/g, " ")}` : ""}</h1>
        <SortSelect value={sort} />
      </div>
      {items.length ? (
        <>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{items.map((r) => <ResourceCard key={r.id} r={r} />)}</div>
          <Pagination page={page} pages={pages} params={{ ...rest, sort }} />
        </>
      ) : (
        <div className="rounded-2xl border border-dashed py-20 text-center">
          <SearchX className="mx-auto size-10 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">No resources match these filters</h2>
          <p className="mt-1 text-sm text-muted-foreground">Try removing a filter or searching with different keywords.</p>
          <Link href="/resources" className={buttonVariants({ variant: "outline", className: "mt-5" })}>Clear all filters</Link>
        </div>
      )}
    </div>
  );
}

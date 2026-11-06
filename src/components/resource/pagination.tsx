import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function Pagination({ page, pages, params }: { page: number; pages: number; params: Record<string, string | undefined> }) {
  if (pages <= 1) return null;
  const href = (n: number) => {
    const p = new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][]);
    p.set("page", String(n));
    return `?${p}`;
  };
  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-3">
      {page > 1 ? <Link href={href(page - 1)} className={buttonVariants({ variant: "outline" })}><ChevronLeft /> Previous</Link> : <span className={buttonVariants({ variant: "outline", className: "pointer-events-none opacity-50" })}><ChevronLeft /> Previous</span>}
      <span className="text-sm text-muted-foreground">Page {page} of {pages}</span>
      {page < pages ? <Link href={href(page + 1)} className={buttonVariants({ variant: "outline" })}>Next <ChevronRight /></Link> : <span className={buttonVariants({ variant: "outline", className: "pointer-events-none opacity-50" })}>Next <ChevronRight /></span>}
    </nav>
  );
}

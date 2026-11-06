import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Section({ title, subtitle, href, children }: { title: string; subtitle?: string; href?: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
        </div>
        {href && <Link href={href} className="flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline">View all <ArrowRight className="size-4" /></Link>}
      </div>
      {children}
    </section>
  );
}

import Link from "next/link";
import { ArrowRight, BookMarked, ClipboardList, FileQuestion, FileText, FlaskConical, Library, ListChecks, NotebookText, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { GlobalSearch } from "@/components/finder/global-search";
import { ResourceCard } from "@/components/resource/resource-card";
import { Section } from "@/components/site/section";
import { Reveal } from "@/components/site/reveal";
import { homeSections, searchResources } from "@/lib/queries";
import { getSessionUser } from "@/lib/session";

const CATEGORIES = [
  { slug: "notes", title: "Notes", desc: "Chapter-wise notes from toppers", icon: NotebookText },
  { slug: "pyq", title: "PYQs", desc: "Previous year question papers", icon: FileQuestion },
  { slug: "syllabus", title: "Syllabus", desc: "Module and credit breakdowns", icon: ListChecks },
  { slug: "question-bank", title: "Question Banks", desc: "Practice questions by module", icon: ClipboardList },
  { slug: "practical-files", title: "Practical Files", desc: "Experiment write-ups", icon: FlaskConical },
  { slug: "assignments", title: "Assignments", desc: "Assignment sheets and solutions", icon: FileText },
  { slug: "reference-materials", title: "Reference Books", desc: "Books and further reading", icon: Library },
  { slug: "study-materials", title: "Study Materials", desc: "Formula sheets and summaries", icon: BookMarked },
];
const STEPS = [
  ["Select your university and course", "Pick your university, degree and branch."],
  ["Choose your year, semester and subject", "Filters only show what exists for your exact combination."],
  ["Download the resources you need", "Preview in the browser, then download or save for later."],
];

export default async function Home() {
  const user = await getSessionUser();
  const { latest, popular, subjects, stats } = await homeSections(user?.id);

  return (
    <>
      <section className="border-b bg-gradient-to-b from-accent/60 to-background">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center md:py-28">
          <p className="mx-auto mb-5 inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-primary"><Sparkles className="size-3.5" /> Built for university students</p>
          <h1 className="text-4xl font-bold tracking-tight text-balance md:text-6xl">Everything You Need to Study. All in One Place.</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground text-balance">Find notes, previous year question papers, assignments, practicals and study materials for your university.</p>
          <div className="mx-auto mt-9 max-w-2xl"><GlobalSearch /></div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/explore" className={buttonVariants({ size: "lg", className: "h-11 px-5" })}>Explore Resources <ArrowRight /></Link>
            <Link href="/subjects" className={buttonVariants({ size: "lg", variant: "outline", className: "h-11 px-5" })}>Browse Subjects</Link>
          </div>
          <dl className="mx-auto mt-12 grid max-w-md grid-cols-3 gap-4 text-sm">
            {[["Resources", stats.resources], ["Subjects", stats.subjects], ["Universities", stats.universities]].map(([k, n]) => (
              <div key={k}><dd className="text-2xl font-semibold">{n}</dd><dt className="text-muted-foreground">{k}</dt></div>
            ))}
          </dl>
        </div>
      </section>

      <Section title="Quick access" subtitle="Jump straight to the kind of material you need.">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {CATEGORIES.map((c, i) => (
            <Reveal key={c.slug} delay={i * 0.03}>
              <Link href={`/resources?category=${c.slug}`} className="group block h-full rounded-2xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                <span className="grid size-11 place-items-center rounded-xl bg-accent text-accent-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground"><c.icon className="size-5" /></span>
                <h3 className="mt-4 font-semibold">{c.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section title="How it works">
        <ol className="grid gap-4 md:grid-cols-3">
          {STEPS.map(([t, d], i) => (
            <li key={t} className="rounded-2xl border bg-card p-6">
              <span className="grid size-9 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">{i + 1}</span>
              <h3 className="mt-4 font-semibold">{t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Popular subjects" href="/subjects">
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {subjects.map((s) => (
            <Link key={s.id} href={`/subjects/${s.id}`} className="rounded-xl border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent/40">
              <p className="font-medium leading-snug">{s.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.branch.code} · Sem {s.semester.number} · {s._count.resources} resources</p>
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Recently uploaded" href="/resources?sort=latest">
        <div className="grid gap-4 md:grid-cols-2">{latest.map((r) => <ResourceCard key={r.id} r={r} />)}</div>
      </Section>
      <Section title="Most downloaded" subtitle="What other students are grabbing right now." href="/resources?sort=downloads">
        <div className="grid gap-4 md:grid-cols-2">{popular.map((r) => <ResourceCard key={r.id} r={r} />)}</div>
      </Section>
      <Section title="Featured study materials" href="/resources?category=study-materials">
        <FeaturedStudy userId={user?.id} />
      </Section>
    </>
  );
}

async function FeaturedStudy({ userId }: { userId?: string }) {
  const { items } = await searchResources({ category: "study-materials", sort: "downloads" }, userId);
  return <div className="grid gap-4 md:grid-cols-3">{items.slice(0, 3).map((r) => <ResourceCard key={r.id} r={r} />)}</div>;
}

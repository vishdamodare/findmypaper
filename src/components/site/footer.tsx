import Link from "next/link";
import { Mail, MapPin } from "lucide-react";
import { Logo } from "./logo";

const cols = [
  { title: "Explore", links: [["Find resources", "/explore"], ["All resources", "/resources"], ["Subjects", "/subjects"], ["Saved", "/saved"]] },
  { title: "Account", links: [["Log in", "/login"], ["Sign up", "/register"], ["Profile", "/profile"], ["Dashboard", "/dashboard"]] },
  { title: "Company", links: [["About us", "/about"]] },
];

export function Footer() {
  return (
    <footer className="mt-20 border-t bg-muted/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">Notes, PYQs, assignments and study materials, organised by your university, branch and semester.</p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground"><Mail className="size-4" /> hello@findmypaper.local</p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="size-4" /> India</p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h3 className="mb-3 text-sm font-semibold">{c.title}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {c.links.map(([l, h]) => <li key={h}><Link href={h} className="hover:text-foreground">{l}</Link></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} FindMyPaper. Demo resources are placeholders, not real university papers.</div>
    </footer>
  );
}

import Link from "next/link";
import { BarChart3, BookOpen, Database, FileText, Upload } from "lucide-react";
import { requireAdmin } from "@/lib/session";

const links = [
  ["/admin", "Overview", BarChart3], ["/admin/resources", "Resources", FileText], ["/admin/upload", "Upload", Upload],
  ["/admin/subjects", "Subjects", BookOpen], ["/admin/academics", "Academic data", Database],
] as const;

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();
  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[200px_1fr]">
      <nav className="flex gap-1 overflow-x-auto md:flex-col" aria-label="Admin">
        {links.map(([href, label, Icon]) => (
          <Link key={href} href={href} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground hover:bg-muted hover:text-foreground"><Icon className="size-4" /> {label}</Link>
        ))}
      </nav>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

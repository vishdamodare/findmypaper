import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { buttonVariants } from "@/components/ui/button";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";
import { MobileNav } from "./mobile-nav";

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore Resources" },
  { href: "/subjects", label: "Subjects" },
  { href: "/about", label: "About Us" },
];

export async function Navbar() {
  const user = await getSessionUser();
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <MobileNav links={NAV_LINKS} />
        <Logo />
        <nav className="ml-6 hidden gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">{l.label}</Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <UserMenu name={user.name ?? "Student"} email={user.email ?? ""} isAdmin={user.isAdmin} />
          ) : (
            <>
              <Link href="/login" className={buttonVariants({ variant: "ghost" })}>Log in</Link>
              <Link href="/register" className={buttonVariants()}>Sign up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

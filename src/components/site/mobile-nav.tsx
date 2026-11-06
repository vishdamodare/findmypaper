"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function MobileNav({ links }: { links: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger aria-label="Open menu" className="grid size-9 place-items-center rounded-lg hover:bg-muted md:hidden"><Menu className="size-5" /></SheetTrigger>
      <SheetContent side="left" className="w-72">
        <SheetTitle className="px-4 pt-4 text-lg">Menu</SheetTitle>
        <nav className="flex flex-col gap-1 p-3">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted">{l.label}</Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

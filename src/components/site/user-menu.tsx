"use client";
import Link from "next/link";
import { Bookmark, LayoutDashboard, LogOut, Shield, User } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { logout } from "@/lib/actions/session";

export function UserMenu({ name, email, isAdmin }: { name: string; email: string; isAdmin: boolean }) {
  const item = (href: string, label: string, Icon: typeof User) => (
    <DropdownMenuItem render={<Link href={href} />}><Icon /> {label}</DropdownMenuItem>
  );
  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label="Open profile menu" className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
        <Avatar><AvatarFallback className="bg-accent font-medium text-accent-foreground">{name.slice(0, 1).toUpperCase()}</AvatarFallback></Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col"><span className="text-sm font-medium text-foreground">{name}</span><span className="truncate">{email}</span></DropdownMenuLabel>
        <DropdownMenuSeparator />
        {item("/dashboard", "Dashboard", LayoutDashboard)}
        {item("/profile", "Profile", User)}
        {item("/saved", "Saved resources", Bookmark)}
        {isAdmin && item("/admin", "Admin panel", Shield)}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => logout()}><LogOut /> Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

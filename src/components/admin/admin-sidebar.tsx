"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BarChart3, BookOpen, FileSpreadsheet, FolderOpen, Images, LayoutDashboard, LogOut, Mail, Menu, Plus, Settings, Tags, User, Wrench, X } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/creations", label: "Creations", icon: Images },
  { href: "/admin/creations/new", label: "Add Creation", icon: Plus },
  { href: "/admin/creations/import", label: "Import Excel", icon: FileSpreadsheet },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/ai-tools", label: "AI Tools", icon: Wrench },
  { href: "/admin/tutorials", label: "Tutorials", icon: BookOpen },
  { href: "/admin/profile", label: "Profile", icon: User },
  { href: "/admin/media", label: "Media Library", icon: FolderOpen },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/messages", label: "Contact Messages", icon: Mail },
  { href: "/admin/settings", label: "Website Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const nav = (
    <nav className="flex h-full flex-col gap-1 p-4" aria-label="Admin">
      <p className="px-3 pb-4 font-display text-2xl">Vault admin</p>
      {links.map((link) => {
        const nested = links.some((other) => other.href !== link.href && other.href.startsWith(`${link.href}/`) && pathname.startsWith(other.href));
        const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href) && !nested;
        const Icon = link.icon;
        return (
          <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className={cn("flex items-center gap-3 rounded-xl px-3 py-2 text-sm", active ? "bg-white/10 text-ink" : "text-muted hover:bg-white/5 hover:text-ink")}>
            <Icon size={16} />
            {link.label}
          </Link>
        );
      })}
      <form action={logoutAction} className="mt-auto">
        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted hover:text-ink" type="submit">
          <LogOut size={16} />
          Logout
        </button>
      </form>
    </nav>
  );
  return (
    <>
      <button type="button" className="fixed left-4 top-4 z-40 grid h-11 w-11 place-items-center rounded-full border border-line bg-background md:hidden" aria-label="Open admin menu" onClick={() => setOpen(true)}>
        <Menu size={18} />
      </button>
      <aside className="hidden border-r border-line bg-background md:block">{nav}</aside>
      {open ? (
        <div className="fixed inset-0 z-50 bg-black/70 md:hidden" onClick={() => setOpen(false)}>
          <div className="h-full w-72 bg-background" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="absolute right-4 top-4" aria-label="Close admin menu" onClick={() => setOpen(false)}>
              <X size={18} />
            </button>
            {nav}
          </div>
        </div>
      ) : null}
    </>
  );
}

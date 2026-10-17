"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Award, FolderKanban, Inbox, ImageIcon, LayoutDashboard, LogOut, Menu, Newspaper, Settings, Wrench, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

// Add an entry here when an admin section ships; nothing links to pages that don't exist yet.
const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/inquiries", label: "Inquiries", icon: Inbox },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/services", label: "Services", icon: Wrench },
  { href: "/admin/credentials", label: "Credentials", icon: Award },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/settings", label: "Profile & contact", icon: Settings },
] as const;

export function AdminShell({ email, signOut, children }: { email: string; signOut: () => Promise<void>; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const links = (
    <ul className="space-y-1">
      {nav.map(({ href, label, icon: Icon }) => (
        <li key={href}>
          <Link href={href} onClick={() => setOpen(false)} aria-current={active(href) ? "page" : undefined}
            className={cn("flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm", active(href) ? "bg-elevated text-accent" : "text-muted hover:bg-surface hover:text-foreground")}>
            <Icon className="size-4" aria-hidden />{label}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="hidden border-r border-border bg-surface/40 p-4 lg:block">
        <p className="flex items-center gap-2.5 px-3 py-2 font-display text-base font-semibold"><Logo size={28} />Admin</p>
        <nav aria-label="Admin">{links}</nav>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-border bg-background/90 px-4 backdrop-blur sm:px-6">
          <button type="button" className="inline-flex size-11 items-center justify-center rounded-lg border border-border lg:hidden" aria-expanded={open} aria-controls="admin-drawer" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((v) => !v)}>
            {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
          <p className="hidden truncate text-sm text-muted sm:block lg:ml-0">Signed in as <span className="text-foreground">{email}</span></p>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/" target="_blank" className="inline-flex min-h-11 items-center px-3 text-sm text-muted hover:text-foreground">View site</Link>
            <form action={signOut}><button className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 text-sm hover:bg-surface"><LogOut className="size-4" aria-hidden />Sign out</button></form>
          </div>
        </header>
        {open && <nav id="admin-drawer" aria-label="Admin mobile" className="border-b border-border bg-background p-3 lg:hidden">{links}</nav>}
        <main id="admin-main" className="mx-auto w-full max-w-6xl p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

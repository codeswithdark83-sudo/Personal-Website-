"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Award, Bell, BookOpenCheck, ChevronDown, FolderKanban, ImageIcon, Inbox, LayoutDashboard, LogOut, Menu, Moon, Newspaper, Search, Settings, Sun, Wrench, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

// Add an entry here when an admin section ships; nothing links to pages that don't exist yet.
const groups = [
  { title: null, items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }] },
  { title: "Content", items: [
    { href: "/admin/projects", label: "Projects", icon: FolderKanban },
    { href: "/admin/case-studies", label: "Case Studies", icon: BookOpenCheck },
    { href: "/admin/blog", label: "Blog", icon: Newspaper },
    { href: "/admin/services", label: "Services", icon: Wrench },
    { href: "/admin/credentials", label: "Credentials", icon: Award },
  ] },
  { title: "Management", items: [
    { href: "/admin/inquiries", label: "Inquiries", icon: Inbox },
    { href: "/admin/media", label: "Media Library", icon: ImageIcon },
    { href: "/admin/settings", label: "Site Settings", icon: Settings },
  ] },
] as const;

function ThemeSwitch() {
  const { resolvedTheme, setTheme } = useTheme();
  // false while server-rendering and hydrating, true afterwards, so the theme state never mismatches.
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const dark = mounted ? resolvedTheme !== "light" : true;
  const base = "grid size-8 place-items-center rounded-full transition-colors";
  return (
    <div className="flex items-center rounded-full border border-border bg-surface p-1" role="group" aria-label="Theme">
      <button type="button" aria-label="Light theme" aria-pressed={!dark} onClick={() => setTheme("light")} className={cn(base, !dark ? "bg-accent-strong text-white" : "text-muted hover:text-foreground")}><Sun className="size-4" aria-hidden /></button>
      <button type="button" aria-label="Dark theme" aria-pressed={dark} onClick={() => setTheme("dark")} className={cn(base, dark ? "bg-accent-strong text-white" : "text-muted hover:text-foreground")}><Moon className="size-4" aria-hidden /></button>
    </div>
  );
}

export function AdminShell({ email, newInquiries, signOut, children }: { email: string; newInquiries: number; signOut: () => Promise<void>; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const search = useRef<HTMLInputElement>(null);
  const menu = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); menu.current?.removeAttribute("open"); }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); search.current?.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
  const links = (
    <div className="space-y-5">
      {groups.map((g, gi) => (
        <div key={gi}>
          {g.title && <p className="px-3 pb-2 text-xs font-medium text-muted">{g.title}</p>}
          <ul className="space-y-1">
            {g.items.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link href={href} onClick={() => setOpen(false)} aria-current={active(href) ? "page" : undefined}
                  className={cn("flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm transition-colors", active(href) ? "bg-accent-strong/25 text-foreground ring-1 ring-accent-strong/40" : "text-muted hover:bg-surface hover:text-foreground")}>
                  <Icon className="size-[18px]" aria-hidden /><span className="flex-1">{label}</span>
                  {label === "Inquiries" && newInquiries > 0 && <span className="rounded-full bg-accent-strong px-2 py-0.5 text-[11px] font-medium text-white">{newInquiries}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[15.5rem_1fr]">
      <aside className="hidden flex-col border-r border-border bg-surface/40 p-4 lg:sticky lg:top-0 lg:flex lg:h-dvh">
        <Link href="/admin" className="flex items-center gap-3 px-2 py-2">
          <Logo size={34} />
          <span className="leading-tight"><span className="block font-display text-base font-semibold">{siteConfig.name}</span><span className="block text-xs text-muted">Portfolio Admin</span></span>
        </Link>
        <nav aria-label="Admin" className="mt-6 flex-1 overflow-y-auto">{links}</nav>
        <div className="rounded-xl border border-border bg-surface p-3.5 text-xs">
          <p className="flex items-center gap-2 text-sm font-medium"><span className="size-2 rounded-full bg-success" aria-hidden />Site Status</p>
          <p className="mt-2 font-medium text-success">Online</p>
          <p className="mt-1 text-muted">Your portfolio is live and accessible to visitors.</p>
        </div>
        <form action={signOut} className="mt-3 flex items-center gap-3 px-1 py-2">
          <span className="grid size-9 place-items-center rounded-full bg-accent-strong/25 text-xs font-semibold text-accent" aria-hidden>JK</span>
          <span className="min-w-0 flex-1 leading-tight"><span className="block truncate text-sm font-medium">{siteConfig.name}</span><span className="block text-xs text-muted">Administrator</span></span>
          <button className="grid size-9 place-items-center rounded-lg text-muted hover:bg-surface hover:text-foreground" aria-label="Sign out"><LogOut className="size-4" aria-hidden /></button>
        </form>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur sm:px-6">
          <button type="button" className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg border border-border lg:hidden" aria-expanded={open} aria-controls="admin-drawer" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((v) => !v)}>
            {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
          <form action="/admin/search" role="search" className="relative min-w-0 max-w-xl flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
            <input ref={search} name="q" type="search" required minLength={2} maxLength={60} placeholder="Search projects, blog posts, inquiries…" aria-label="Search the admin"
              className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-14 text-sm outline-none placeholder:text-muted focus:border-accent" />
            <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-border px-1.5 py-0.5 text-[11px] text-muted sm:block">Ctrl K</kbd>
          </form>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:block"><ThemeSwitch /></div>
            <Link href="/admin/inquiries" aria-label={newInquiries ? `${newInquiries} new inquiries` : "Inquiries"} className="relative grid size-11 place-items-center rounded-full border border-border bg-surface text-muted hover:text-foreground">
              <Bell className="size-[18px]" aria-hidden />
              {newInquiries > 0 && <span className="absolute right-1.5 top-1.5 grid min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] font-semibold leading-4 text-white">{newInquiries > 9 ? "9+" : newInquiries}</span>}
            </Link>
            <details ref={menu} className="relative">
              <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2.5 rounded-xl px-1.5 hover:bg-surface [&::-webkit-details-marker]:hidden">
                <span className="grid size-9 place-items-center rounded-full bg-accent-strong/25 text-xs font-semibold text-accent" aria-hidden>JK</span>
                <span className="hidden text-left leading-tight md:block"><span className="block text-sm font-medium">{siteConfig.name}</span><span className="block text-xs text-accent">Administrator</span></span>
                <ChevronDown className="hidden size-4 text-muted md:block" aria-hidden />
              </summary>
              <div className="absolute right-0 top-[calc(100%+0.5rem)] w-64 rounded-xl border border-border bg-surface p-2 shadow-xl">
                <p className="truncate px-3 py-2 text-xs text-muted">Signed in as <span className="text-foreground">{email}</span></p>
                <div className="px-1 pb-1 sm:hidden"><ThemeSwitch /></div>
                <Link href="/" target="_blank" onClick={() => menu.current?.removeAttribute("open")} className="flex min-h-10 items-center rounded-lg px-3 text-sm hover:bg-elevated">View site</Link>
                <form action={signOut}><button className="flex min-h-10 w-full items-center gap-2 rounded-lg px-3 text-sm hover:bg-elevated"><LogOut className="size-4" aria-hidden />Sign out</button></form>
              </div>
            </details>
          </div>
        </header>
        {open && (
          <nav id="admin-drawer" aria-label="Admin mobile" className="max-h-[75dvh] overflow-y-auto border-b border-border bg-background p-3 lg:hidden">{links}</nav>
        )}
        <main id="admin-main" className="mx-auto w-full max-w-[1500px] p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

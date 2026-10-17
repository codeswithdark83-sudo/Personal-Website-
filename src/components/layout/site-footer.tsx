import Link from "next/link";
import { navLinks, siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-surface/40">
      <div className="container-page flex flex-col gap-8 py-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <p className="font-display text-lg font-semibold">{siteConfig.name}</p>
          <p className="mt-2 text-sm text-muted">{siteConfig.headline}. Built with Next.js, Supabase and Tailwind CSS.</p>
        </div>
        <nav aria-label="Footer">
          <ul className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm text-muted sm:grid-cols-3">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-block py-1 hover:text-foreground">{l.label}</Link>
              </li>
            ))}
            <li><Link href="/privacy" className="inline-block py-1 hover:text-foreground">Privacy</Link></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
      </div>
    </footer>
  );
}

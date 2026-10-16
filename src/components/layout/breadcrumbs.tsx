import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((it, i) => (
          <li key={it.label} className="flex items-center gap-1">
            {it.href ? <Link href={it.href} className="hover:text-foreground">{it.label}</Link> : <span aria-current="page" className="text-foreground">{it.label}</span>}
            {i < items.length - 1 && <ChevronRight className="size-3.5" aria-hidden />}
          </li>
        ))}
      </ol>
    </nav>
  );
}

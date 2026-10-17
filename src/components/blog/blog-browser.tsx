"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { BlogPost } from "@/types/content";

const field = "min-h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm placeholder:text-muted";

export function BlogBrowser({ posts }: { posts: BlogPost[] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const cats = useMemo(() => [...new Set(posts.map((p) => p.category))], [posts]);
  const visible = posts.filter((p) => (cat === "all" || p.category === cat) && (!q.trim() || (p.title + p.excerpt).toLowerCase().includes(q.trim().toLowerCase())));

  return (
    <div>
      <form role="search" onSubmit={(e) => e.preventDefault()} className="grid gap-3 sm:grid-cols-[1fr_14rem]">
        <div className="relative">
          <label htmlFor="blog-search" className="sr-only">Search articles</label>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <input id="blog-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search articles…" className={`${field} pl-9`} />
        </div>
        <div>
          <label htmlFor="blog-cat" className="sr-only">Category</label>
          <select id="blog-cat" value={cat} onChange={(e) => setCat(e.target.value)} className={field}>
            <option value="all">All Categories</option>{cats.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </form>
      {visible.length === 0 ? <p className="mt-8 text-muted">No articles found.</p> : (
        <ul className="mt-6 grid gap-4">
          {visible.map((p) => (
            <li key={p.slug}>
              <article className="relative flex items-center justify-between gap-4 rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent/60 sm:p-6">
                <div className="min-w-0">
                <Badge>{p.category}</Badge>
                <h2 className="mt-3 text-lg font-semibold sm:text-xl"><Link href={`/blog/${p.slug}`} className="after:absolute after:inset-0">{p.title}</Link></h2>
                <p className="mt-1 text-sm text-muted">{p.excerpt}</p>
                <p className="mt-3 text-xs text-muted"><time dateTime={p.publishedAt}>{new Date(p.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</time> · {p.readingMinutes} min read</p>
                </div>
                <ArrowRight className="size-5 shrink-0 text-accent" aria-hidden />
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

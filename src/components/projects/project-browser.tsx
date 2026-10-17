"use client";

import { useMemo, useState } from "react";
import { Search, SearchX } from "lucide-react";
import { ProjectCard } from "./project-card";
import type { Project } from "@/types/content";

const field = "min-h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted";

/** Client-side search + filtering over the already-published project list. */
export function ProjectBrowser({ projects }: { projects: Project[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [tech, setTech] = useState("all");
  const [sort, setSort] = useState<"featured" | "az">("featured");

  const categories = useMemo(() => [...new Set(projects.map((p) => p.category))].sort(), [projects]);
  const techs = useMemo(() => [...new Set(projects.flatMap((p) => p.technologies))].sort(), [projects]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = projects.filter((p) =>
      (!q || p.title.toLowerCase().includes(q)) &&
      (category === "all" || p.category === category) &&
      (tech === "all" || p.technologies.includes(tech)));
    return sort === "az"
      ? [...list].sort((a, b) => a.title.localeCompare(b.title))
      : [...list].sort((a, b) => Number(b.featured) - Number(a.featured));
  }, [projects, query, category, tech, sort]);

  return (
    <div>
      <form role="search" aria-label="Filter projects" onSubmit={(e) => e.preventDefault()} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <label htmlFor="project-search" className="sr-only">Search projects by title</label>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <input id="project-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search projects…" className={`${field} pl-9`} />
        </div>
        <div>
          <label htmlFor="project-category" className="sr-only">Category</label>
          <select id="project-category" value={category} onChange={(e) => setCategory(e.target.value)} className={field}>
            <option value="all">All Categories</option>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="project-tech" className="sr-only">Technology</label>
          <select id="project-tech" value={tech} onChange={(e) => setTech(e.target.value)} className={field}>
            <option value="all">All Technologies</option>
            {techs.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="project-sort" className="sr-only">Sort</label>
          <select id="project-sort" value={sort} onChange={(e) => setSort(e.target.value as "featured" | "az")} className={field}>
            <option value="featured">Featured first</option>
            <option value="az">A → Z</option>
          </select>
        </div>
      </form>

      <p className="mt-4 text-sm text-muted" role="status" aria-live="polite">{visible.length} project{visible.length === 1 ? "" : "s"}</p>

      {visible.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-xl border border-dashed border-border py-16 text-center">
          <SearchX className="size-8 text-muted" aria-hidden />
          <p className="mt-3 font-medium">No projects match your filters</p>
          <button type="button" onClick={() => { setQuery(""); setCategory("all"); setTech("all"); }} className="mt-3 min-h-11 text-sm text-accent">Clear filters</button>
        </div>
      ) : (
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((p) => <li key={p.slug}><ProjectCard project={p} /></li>)}
        </ul>
      )}
    </div>
  );
}

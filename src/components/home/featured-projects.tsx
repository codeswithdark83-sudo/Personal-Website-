import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProjectCard } from "@/components/projects/project-card";
import type { Project } from "@/types/content";

export function FeaturedProjects({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null;
  return (
    <section className="container-page mt-20 sm:mt-28">
      <div className="flex items-end justify-between gap-4">
        <SectionHeading title="Featured Projects" />
        <Link href="/projects" className="inline-flex min-h-11 shrink-0 items-center gap-1 text-sm text-accent">View all <ArrowRight className="size-4" aria-hidden /></Link>
      </div>
      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => <li key={p.slug}><ProjectCard project={p} /></li>)}
      </ul>
    </section>
  );
}

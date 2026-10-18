import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProjectThumb } from "./project-thumb";
import type { Project } from "@/types/content";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="lift group relative flex h-full flex-col gap-4 rounded-xl border border-border bg-surface p-4 hover:border-accent/60">
      <ProjectThumb title={project.title} coverUrl={project.coverUrl} placeholder={project.isPlaceholder} />
      <div className="flex flex-1 flex-col">
        <h3 className="text-lg font-semibold">
          <Link href={`/projects/${project.slug}`} className="after:absolute after:inset-0">{project.title}</Link>
        </h3>
        <p className="mt-1 text-sm text-muted">{project.summary}</p>
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Technologies">
          {project.technologies.map((t) => <li key={t}><Badge>{t}</Badge></li>)}
        </ul>
        <span className="mt-4 inline-flex items-center gap-1 pt-1 text-sm text-accent">
          View details <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </span>
      </div>
    </article>
  );
}

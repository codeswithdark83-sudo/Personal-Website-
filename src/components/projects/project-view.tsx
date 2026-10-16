import { ArrowLeft, ExternalLink } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { GithubIcon } from "@/components/ui/brand-icons";
import { Markdown } from "@/components/ui/markdown";
import { ProjectThumb } from "./project-thumb";
import { ProjectCard } from "./project-card";
import { ContactCTA } from "@/components/home/contact-cta";
import type { Project } from "@/types/content";

/** Shared by the public case-study page and the admin preview so both always render identically. */
export function ProjectView({ project, related = [], preview = false }: { project: Project; related?: Project[]; preview?: boolean }) {
  return (
    <article className="container-page py-8 sm:py-12">
      {!preview && <Breadcrumbs items={[{ label: "Projects", href: "/projects" }, { label: project.title }]} />}
      <header className="mt-6 grid gap-8 lg:grid-cols-2 lg:items-center">
        <div>
          <h1 className="text-3xl font-semibold sm:text-5xl">{project.title}</h1>
          <p className="mt-3 text-muted">{project.summary}</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            <li><Badge>{project.projectType}</Badge></li>
            {project.technologies.map((t) => <li key={t}><Badge>{t}</Badge></li>)}
          </ul>
          <div className="mt-6 flex flex-col gap-3 xs:flex-row">
            {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-accent-strong px-5 text-sm font-medium text-white"><ExternalLink className="size-4" aria-hidden />Live Demo</a>}
            {project.repositoryUrl && <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-5 text-sm font-medium"><GithubIcon className="size-4" />Source Code</a>}
            {!project.liveUrl && !project.repositoryUrl && <p className="text-sm text-muted">Live demo and source links have not been added yet.</p>}
          </div>
        </div>
        <ProjectThumb title={project.title} coverUrl={project.coverUrl} placeholder={project.isPlaceholder} />
      </header>

      {project.isPlaceholder && (
        <p role="note" className="mt-8 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm">This is a sample entry. Replace it with a real project from the admin dashboard.</p>
      )}

      {project.sections.length > 0 && (
        <div className="mt-10 grid gap-10 lg:grid-cols-[16rem_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <nav aria-label="Table of contents" className="rounded-xl border border-border bg-surface p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted">Table of contents</p>
              <ol className="mt-3 max-h-60 space-y-1 overflow-y-auto text-sm lg:max-h-[60dvh]">
                {project.sections.map((s, i) => (
                  <li key={s.id + i}><a href={`#${s.id}`} className="flex min-h-9 items-center gap-2 text-muted hover:text-accent"><span className="font-mono text-xs">{i + 1}.</span>{s.title}</a></li>
                ))}
              </ol>
            </nav>
          </aside>
          <div className="min-w-0 space-y-10">
            {project.sections.map((s, i) => (
              <section key={s.id + i} id={s.id} className="scroll-mt-24">
                <h2 className="text-xl font-semibold sm:text-2xl"><span className="mr-2 font-mono text-sm text-accent">{i + 1}.</span>{s.title}</h2>
                <div className="mt-3 max-w-prose"><Markdown>{s.body}</Markdown></div>
              </section>
            ))}
          </div>
        </div>
      )}

      {related.length > 0 && (
        <section className="mt-16" aria-labelledby="related">
          <h2 id="related" className="text-2xl font-semibold">Related projects</h2>
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{related.map((p) => <li key={p.slug}><ProjectCard project={p} /></li>)}</ul>
        </section>
      )}
      {!preview && <><div className="mt-10"><ButtonLink href="/projects" variant="ghost"><ArrowLeft className="size-4" aria-hidden />Back to projects</ButtonLink></div><ContactCTA /></>}
    </article>
  );
}

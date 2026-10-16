import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { ProjectBrowser } from "@/components/projects/project-browser";
import { getProjects } from "@/lib/content";

export const metadata: Metadata = { title: "Projects", description: "A collection of recent work, each with a detailed case study.", alternates: { canonical: "/projects" } };

// Public content is cached and refreshed at most every 5 minutes; admin edits also revalidate on demand.
export const revalidate = 300;

export default async function ProjectsPage() {
  const projects = await getProjects();
  return (
    <>
      <PageHeader title="My Projects" description="A collection of my recent work. Each project comes with a detailed case study, tech stack and live links where available." />
      <div className="container-page py-10">
        {projects.length === 0 ? <p className="rounded-xl border border-dashed border-border py-16 text-center text-muted">No projects have been published yet. Check back soon.</p> : <ProjectBrowser projects={projects} />}
      </div>
    </>
  );
}

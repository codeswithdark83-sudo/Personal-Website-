import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectView } from "@/components/projects/project-view";
import { JsonLd } from "@/components/seo/json-ld";
import { getProject, getProjects } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getProjects()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProject((await params).slug);
  if (!project) return {};
  return pageMetadata({ title: project.title, description: project.summary, path: `/projects/${project.slug}` });
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const [project, all] = await Promise.all([getProject(slug), getProjects()]);
  if (!project) notFound();
  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "CreativeWork", name: project.title, description: project.summary,
        url: `${siteConfig.url}/projects/${project.slug}`, author: { "@type": "Person", name: siteConfig.name },
        keywords: project.technologies.join(", "), ...(project.coverUrl ? { image: project.coverUrl.startsWith("/") ? `${siteConfig.url}${project.coverUrl}` : project.coverUrl } : {}),
        ...(project.liveUrl ? { sameAs: [project.liveUrl] } : {}),
      }} />
      <ProjectView project={project} related={all.filter((p) => p.slug !== project.slug).slice(0, 3)} />
    </>
  );
}

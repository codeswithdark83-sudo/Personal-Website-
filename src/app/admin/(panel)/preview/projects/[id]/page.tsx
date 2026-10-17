import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { loadProjects } from "@/lib/content";
import { ProjectView } from "@/components/projects/project-view";

export const metadata = { title: "Project preview" };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ProjectPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const { supabase } = await requireAdmin();
  const row = (await supabase.from("projects").select("slug,status").eq("id", id).limit(1)).data?.[0];
  if (!row) notFound();
  const project = (await loadProjects(supabase, true)).find((p) => p.slug === row.slug);
  if (!project) notFound();
  return (
    <div className="space-y-4">
      <p role="status" className="rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm">
        Preview — {row.status === "published" ? "this project is live." : "this draft is not visible to visitors."}{" "}
        <Link href={`/admin/projects/${id}`} className="font-medium text-accent">Back to editor</Link>
      </p>
      <ProjectView project={project} preview />
    </div>
  );
}

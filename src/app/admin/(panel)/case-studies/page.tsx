import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin";
import { cn } from "@/lib/utils";

export const metadata = { title: "Case Studies" };

const FIELDS = ["problem", "goals", "role", "approach", "solution", "architecture", "challenges", "outcomes", "lessons_learned"] as const;

export default async function CaseStudiesPage() {
  const { supabase } = await requireAdmin();
  const [projects, studies] = await Promise.all([
    supabase.from("projects").select("id,title,status,updated_at").order("sort_order").order("updated_at", { ascending: false }),
    supabase.from("case_studies").select("*"),
  ]);
  if (projects.error || studies.error) throw new Error("Failed to load case studies");
  const by = new Map((studies.data ?? []).map((s) => [s.project_id, s]));
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold sm:text-3xl">Case Studies</h1><p className="mt-1 text-sm text-muted">Each project has one case study. Open a project to write or edit its sections.</p></div>
      {!projects.data?.length ? <p className="rounded-xl border border-dashed border-border py-14 text-center text-muted">No projects yet. Add a project to start its case study.</p> : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.data.map((p) => {
            const cs = by.get(p.id);
            const filled = cs ? FIELDS.filter((f) => (cs[f] ?? "").trim()).length + (Array.isArray(cs.content_blocks) ? cs.content_blocks.length : 0) : 0;
            const pct = Math.min(100, Math.round((Math.min(filled, FIELDS.length) / FIELDS.length) * 100));
            return (
              <li key={p.id}>
                <Link href={`/admin/projects/${p.id}`} className="block h-full rounded-xl border border-border bg-surface p-5 hover:border-accent/60">
                  <div className="flex items-start justify-between gap-3"><h2 className="font-semibold">{p.title}</h2><span className={cn("shrink-0 rounded-md px-2 py-1 text-xs", p.status === "published" ? "bg-success/15 text-success" : "bg-warning/20 text-warning")}>{p.status === "published" ? "Published" : "Draft"}</span></div>
                  <p className="mt-3 text-xs text-muted">{cs ? `${Math.min(filled, FIELDS.length)} of ${FIELDS.length} sections written` : "No case study yet"}</p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-elevated" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Case study completeness"><div className="h-full rounded-full bg-accent-strong" style={{ width: `${pct}%` }} /></div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth/admin";
import { cn } from "@/lib/utils";

export const metadata = { title: "Projects" };

export default async function ProjectsAdminPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("projects").select("id,title,slug,status,featured,category,updated_at").order("sort_order").order("created_at", { ascending: false });
  if (error) throw new Error("Failed to load projects");
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-semibold sm:text-3xl">Projects</h1><p className="mt-1 text-sm text-muted">Only published projects appear on the public site.</p></div>
        <Link href="/admin/projects/new" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-accent-strong px-4 text-sm font-medium text-white"><Plus className="size-4" aria-hidden />New project</Link>
      </div>
      {data.length === 0 ? <p className="rounded-xl border border-border bg-surface p-6 text-sm text-muted">No projects yet. Create your first one.</p> : (
        <ul className="divide-y divide-border rounded-xl border border-border bg-surface">
          {data.map((p) => (
            <li key={p.id}>
              <Link href={`/admin/projects/${p.id}`} className="flex min-h-14 flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-elevated/50">
                <span className="min-w-0"><span className="block truncate font-medium">{p.title}</span><span className="block truncate text-xs text-muted">{p.category} · /{p.slug}</span></span>
                <span className="flex items-center gap-2 text-xs">
                  {p.featured && <span className="rounded-full border border-border px-2 py-0.5 text-muted">Featured</span>}
                  <span className={cn("rounded-full px-2 py-0.5", p.status === "published" ? "bg-success/15 text-success" : "bg-elevated text-muted")}>{p.status === "published" ? "Published" : "Draft"}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

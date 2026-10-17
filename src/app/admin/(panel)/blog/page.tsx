import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth/admin";
import { cn } from "@/lib/utils";

export const metadata = { title: "Blog" };

export default async function BlogAdminPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("blog_posts").select("id,title,slug,status,category").order("created_at", { ascending: false });
  if (error) throw new Error("Failed to load articles");
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-semibold sm:text-3xl">Blog</h1><p className="mt-1 text-sm text-muted">Only published articles appear on the site.</p></div>
        <Link href="/admin/blog/new" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-accent-strong px-4 text-sm font-medium text-white"><Plus className="size-4" aria-hidden />New article</Link>
      </div>
      {data.length === 0 ? <p className="rounded-xl border border-border bg-surface p-6 text-sm text-muted">No articles yet.</p> : (
        <ul className="divide-y divide-border rounded-xl border border-border bg-surface">
          {data.map((p) => (
            <li key={p.id}><Link href={`/admin/blog/${p.id}`} className="flex min-h-14 items-center justify-between gap-2 px-4 py-3 hover:bg-elevated/50">
              <span className="min-w-0"><span className="block truncate font-medium">{p.title}</span><span className="block truncate text-xs text-muted">{p.category} · /{p.slug}</span></span>
              <span className={cn("rounded-full px-2 py-0.5 text-xs", p.status === "published" ? "bg-success/15 text-success" : "bg-elevated text-muted")}>{p.status === "published" ? "Published" : "Draft"}</span>
            </Link></li>
          ))}
        </ul>
      )}
    </div>
  );
}

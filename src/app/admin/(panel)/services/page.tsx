import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth/admin";
import { cn } from "@/lib/utils";

export const metadata = { title: "Services" };

export default async function ServicesAdminPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("services").select("id,title,slug,status").order("sort_order");
  if (error) throw new Error("Failed to load services");
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-semibold sm:text-3xl">Services</h1><p className="mt-1 text-sm text-muted">What you offer to clients.</p></div>
        <Link href="/admin/services/new" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-accent-strong px-4 text-sm font-medium text-white"><Plus className="size-4" aria-hidden />New service</Link>
      </div>
      {data.length === 0 ? <p className="rounded-xl border border-border bg-surface p-6 text-sm text-muted">No services yet.</p> : (
        <ul className="divide-y divide-border rounded-xl border border-border bg-surface">
          {data.map((s) => (
            <li key={s.id}><Link href={`/admin/services/${s.id}`} className="flex min-h-14 items-center justify-between gap-2 px-4 py-3 hover:bg-elevated/50">
              <span className="truncate font-medium">{s.title}</span>
              <span className={cn("rounded-full px-2 py-0.5 text-xs", s.status === "published" ? "bg-success/15 text-success" : "bg-elevated text-muted")}>{s.status === "published" ? "Published" : "Draft"}</span>
            </Link></li>
          ))}
        </ul>
      )}
    </div>
  );
}

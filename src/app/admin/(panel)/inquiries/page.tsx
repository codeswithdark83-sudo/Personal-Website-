import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin";
import { cn } from "@/lib/utils";
import { INQUIRY_STATUSES } from "@/lib/inquiry-status";

export const metadata = { title: "Inquiries" };
const PAGE = 20;
const pretty = (s: string) => s.replace("_", " ").replace(/^\w/, (c) => c.toUpperCase());

export default async function InquiriesPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string; sort?: string }> }) {
  const sp = await searchParams;
  const { supabase } = await requireAdmin();
  const status = INQUIRY_STATUSES.find((s) => s === sp.status);
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const asc = sp.sort === "oldest";
  // Strip characters that have meaning inside a PostgREST filter string.
  const q = (sp.q ?? "").replace(/[^\p{L}\p{N}@.\s_-]/gu, "").trim().slice(0, 80);

  let query = supabase.from("inquiries").select("id,name,email,project_type,status,created_at,follow_up_at,email_notification", { count: "exact" });
  if (status) query = query.eq("status", status);
  if (q) query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%,company.ilike.%${q}%,brief.ilike.%${q}%`);
  const { data, count, error } = await query.order("created_at", { ascending: asc }).range((page - 1) * PAGE, page * PAGE - 1);
  if (error) throw new Error("Failed to load inquiries");
  const pages = Math.max(1, Math.ceil((count ?? 0) / PAGE));
  const href = (over: Record<string, string | undefined>) => {
    const p = new URLSearchParams(); const m = { q, status, sort: sp.sort, page: String(page), ...over };
    for (const [k, v] of Object.entries(m)) if (v) p.set(k, v);
    return `/admin/inquiries?${p}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-semibold sm:text-3xl">Inquiries</h1><p className="mt-1 text-sm text-muted">{count ?? 0} found</p></div>
        <a href="/admin/export/inquiries" className="inline-flex min-h-11 items-center rounded-lg border border-border bg-surface px-4 text-sm hover:bg-elevated">Download CSV</a>
      </div>
      <form className="flex flex-wrap gap-3" role="search">
        <input name="q" defaultValue={q} placeholder="Search name, email, company…" aria-label="Search inquiries" className="min-h-11 min-w-0 flex-1 rounded-lg border border-border bg-background px-3 text-sm" />
        <select name="status" defaultValue={status ?? ""} aria-label="Filter by status" className="min-h-11 rounded-lg border border-border bg-background px-3 text-sm">
          <option value="">All statuses</option>{INQUIRY_STATUSES.map((s) => <option key={s} value={s}>{pretty(s)}</option>)}
        </select>
        <select name="sort" defaultValue={sp.sort ?? "newest"} aria-label="Sort" className="min-h-11 rounded-lg border border-border bg-background px-3 text-sm"><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select>
        <button className="min-h-11 rounded-lg bg-accent-strong px-5 text-sm font-medium text-white">Apply</button>
      </form>
      {data.length === 0 ? <p className="rounded-xl border border-border bg-surface p-6 text-sm text-muted">No inquiries match.</p> : (
        <ul className="divide-y divide-border rounded-xl border border-border bg-surface">
          {data.map((i) => (
            <li key={i.id}>
              <Link href={`/admin/inquiries/${i.id}`} className="flex min-h-14 flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-elevated/50">
                <span className="min-w-0"><span className="block truncate font-medium">{i.name}</span><span className="block truncate text-xs text-muted">{i.project_type} · {i.email} · {new Date(i.created_at).toLocaleDateString("en-IN")}</span></span>
                <span className="flex items-center gap-2 text-xs">
                  {i.email_notification === "failed" && <span className="rounded-full bg-danger/15 px-2 py-0.5 text-danger">Email failed</span>}
                  <span className={cn("rounded-full px-2 py-0.5", i.status === "new" ? "bg-accent-strong/20 text-accent" : "bg-elevated text-muted")}>{pretty(i.status)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {pages > 1 && (
        <nav aria-label="Pagination" className="flex items-center justify-between text-sm">
          {page > 1 ? <Link className="min-h-11 content-center px-3 text-accent" href={href({ page: String(page - 1) })}>← Previous</Link> : <span />}
          <span className="text-muted">Page {page} of {pages}</span>
          {page < pages ? <Link className="min-h-11 content-center px-3 text-accent" href={href({ page: String(page + 1) })}>Next →</Link> : <span />}
        </nav>
      )}
    </div>
  );
}

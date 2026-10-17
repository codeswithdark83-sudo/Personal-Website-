import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata = { title: "Dashboard" };

const STATUSES = ["new", "contacted", "qualified", "proposal_sent", "won", "closed"] as const;
const label = (s: string) => s.replace("_", " ").replace(/^\w/, (c) => c.toUpperCase());

function Metric({ title, value, hint }: { title: string; value: number | string; hint?: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="text-sm text-muted">{title}</p>
      <p className="mt-2 font-display text-3xl font-semibold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export default async function DashboardPage() {
  const { supabase } = await requireAdmin();
  const count = async (table: "projects" | "blog_posts", status: "draft" | "published") => {
    const { count: n, error } = await supabase.from(table).select("*", { count: "exact", head: true }).eq("status", status);
    if (error) throw new Error(`Failed to load ${table} count`);
    return n ?? 0;
  };
  const [pub, draft, posts, postDrafts, inquiries, profile, recentProjects, recentPosts] = await Promise.all([
    count("projects", "published"), count("projects", "draft"), count("blog_posts", "published"), count("blog_posts", "draft"),
    supabase.from("inquiries").select("status"), supabase.from("profiles").select("availability_status").limit(1),
    supabase.from("projects").select("id,title,status,updated_at").order("updated_at", { ascending: false }).limit(4),
    supabase.from("blog_posts").select("id,title,status,updated_at").order("updated_at", { ascending: false }).limit(4),
  ]);
  if (inquiries.error) throw new Error("Failed to load inquiries");
  const byStatus = Object.fromEntries(STATUSES.map((s) => [s, 0])) as Record<string, number>;
  for (const r of inquiries.data ?? []) byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
  const total = inquiries.data?.length ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">Live numbers from your database.</p>
      </div>
      <nav aria-label="Quick actions" className="flex flex-wrap gap-2">
        {[["/admin/projects/new", "New project"], ["/admin/blog/new", "New article"], ["/admin/services/new", "New service"], ["/admin/credentials", "Edit skills"], ["/admin/settings", "Contact details"]].map(([href, text]) => (
          <Link key={href} href={href!} className="inline-flex min-h-11 items-center rounded-lg border border-border bg-surface px-4 text-sm font-medium hover:bg-elevated">{text}</Link>
        ))}
      </nav>
      <div className="grid gap-4 xs:grid-cols-2 lg:grid-cols-4">
        <Metric title="Published projects" value={pub} />
        <Metric title="Draft projects" value={draft} />
        <Metric title="Published articles" value={posts} />
        <Metric title="Draft articles" value={postDrafts} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-surface p-5" aria-labelledby="inq">
          <h2 id="inq" className="text-lg font-semibold">Inquiries <span className="text-sm font-normal text-muted">({total} total)</span></h2>
          {total === 0 ? <p className="mt-3 text-sm text-muted">No inquiries yet.</p> : (
            <ul className="mt-4 space-y-2">
              {STATUSES.map((s) => (
                <li key={s} className="flex items-center gap-3 text-sm">
                  <span className="w-28 shrink-0 text-muted">{label(s)}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded bg-elevated"><span className="block h-full bg-accent-strong" style={{ width: `${(byStatus[s]! / total) * 100}%` }} /></span>
                  <span className="w-6 text-right tabular-nums">{byStatus[s]}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="rounded-xl border border-border bg-surface p-5">
          <h2 className="text-lg font-semibold">Availability</h2>
          <p className="mt-3 text-sm">{profile.data?.[0] ? label(profile.data[0].availability_status) : "Not set"}</p>
        </section>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {([["Recently edited projects", "projects", recentProjects.data], ["Recently edited articles", "blog", recentPosts.data]] as const).map(([title, base, rows]) => (
          <section key={base} className="rounded-xl border border-border bg-surface p-5">
            <h2 className="text-lg font-semibold">{title}</h2>
            {!rows?.length ? <p className="mt-3 text-sm text-muted">Nothing here yet.</p> : (
              <ul className="mt-3 divide-y divide-border">
                {rows.map((r) => (
                  <li key={r.id}>
                    <Link href={`/admin/${base}/${r.id}`} className="flex min-h-11 items-center justify-between gap-3 py-2 text-sm hover:text-accent">
                      <span className="truncate">{r.title}</span>
                      <span className="shrink-0 text-xs text-muted">{r.status === "published" ? "Published" : "Draft"}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin";
import { INQUIRY_STATUSES } from "@/lib/inquiry-status";
import { cn } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

const pretty = (s: string) => s.replace("_", " ").replace(/^\w/, (c) => c.toUpperCase());
// One hue per status; the legend also prints the numbers so colour is never the only cue.
const COLORS: Record<string, string> = { new: "#3d7bff", contacted: "#78a6ff", qualified: "#10b981", proposal_sent: "#f59e0b", won: "#a78bfa", closed: "#64748b" };
const date = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

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
  const [pub, draft, posts, postDrafts, inquiries, recent, profile, recentProjects, recentPosts] = await Promise.all([
    count("projects", "published"), count("projects", "draft"), count("blog_posts", "published"), count("blog_posts", "draft"),
    supabase.from("inquiries").select("status"),
    supabase.from("inquiries").select("id,name,project_type,status,created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("profiles").select("availability_status").limit(1),
    supabase.from("projects").select("id,title,status,updated_at").order("updated_at", { ascending: false }).limit(4),
    supabase.from("blog_posts").select("id,title,status,updated_at").order("updated_at", { ascending: false }).limit(4),
  ]);
  if (inquiries.error || recent.error) throw new Error("Failed to load inquiries");

  const byStatus = Object.fromEntries(INQUIRY_STATUSES.map((s) => [s, 0])) as Record<string, number>;
  for (const r of inquiries.data ?? []) byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
  const total = inquiries.data?.length ?? 0;
  const present = INQUIRY_STATUSES.filter((s) => byStatus[s]);
  const stops = present.map((s, i) => {
    const before = present.slice(0, i).reduce((n, k) => n + byStatus[k]!, 0);
    return `${COLORS[s]} ${(before / total) * 100}% ${((before + byStatus[s]!) / total) * 100}%`;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">Welcome back! Here&apos;s what&apos;s happening with your portfolio.</p>
      </div>

      <nav aria-label="Quick actions" className="flex flex-wrap gap-2">
        {[["/admin/projects/new", "New project"], ["/admin/blog/new", "New article"], ["/admin/services/new", "New service"], ["/admin/media", "Upload media"], ["/admin/settings", "Contact details"]].map(([href, text]) => (
          <Link key={href} href={href!} className="inline-flex min-h-11 items-center rounded-lg border border-border bg-surface px-4 text-sm font-medium hover:bg-elevated">{text}</Link>
        ))}
      </nav>

      <div className="grid gap-4 xs:grid-cols-2 lg:grid-cols-4">
        <Metric title="Total projects" value={pub + draft} hint={`${pub} published · ${draft} draft`} />
        <Metric title="Published articles" value={posts} hint={`${postDrafts} draft`} />
        <Metric title="New inquiries" value={byStatus.new ?? 0} hint={`${total} in total`} />
        <Metric title="Availability" value={profile.data?.[0] ? pretty(profile.data[0].availability_status) : "Not set"} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[22rem_1fr]">
        <section className="rounded-xl border border-border bg-surface p-5" aria-labelledby="inq">
          <h2 id="inq" className="text-lg font-semibold">Inquiry status</h2>
          {total === 0 ? <p className="mt-3 text-sm text-muted">No inquiries yet.</p> : (
            <div className="mt-4 flex flex-col items-center gap-5 xs:flex-row">
              <div role="img" aria-label={`${total} inquiries by status`} className="grid size-32 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(${stops.join(", ")})` }}>
                <div className="grid size-20 place-items-center rounded-full bg-surface text-center"><span className="font-display text-xl font-semibold">{total}</span></div>
              </div>
              <ul className="w-full space-y-1.5 text-sm">
                {INQUIRY_STATUSES.map((s) => (
                  <li key={s} className="flex items-center gap-2"><span className="size-2.5 rounded-full" style={{ background: COLORS[s] }} aria-hidden /><span className="flex-1 text-muted">{pretty(s)}</span><span className="tabular-nums">{byStatus[s]}</span></li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="min-w-0 rounded-xl border border-border bg-surface p-5" aria-labelledby="rec">
          <div className="flex items-center justify-between gap-3"><h2 id="rec" className="text-lg font-semibold">Recent inquiries</h2><Link href="/admin/inquiries" className="text-sm text-accent">View all</Link></div>
          {!recent.data?.length ? <p className="mt-3 text-sm text-muted">No inquiries yet.</p> : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[28rem] text-left text-sm">
                <thead className="text-xs text-muted"><tr><th className="py-2 pr-3 font-medium">Name</th><th className="py-2 pr-3 font-medium">Type</th><th className="py-2 pr-3 font-medium">Status</th><th className="py-2 font-medium">Date</th></tr></thead>
                <tbody className="divide-y divide-border">
                  {recent.data.map((r) => (
                    <tr key={r.id}>
                      <td className="py-2.5 pr-3"><Link href={`/admin/inquiries/${r.id}`} className="font-medium hover:text-accent">{r.name}</Link></td>
                      <td className="py-2.5 pr-3 text-muted">{r.project_type}</td>
                      <td className="py-2.5 pr-3"><span className={cn("rounded-full px-2 py-0.5 text-xs", r.status === "new" ? "bg-accent-strong/20 text-accent" : "bg-elevated text-muted")}>{pretty(r.status)}</span></td>
                      <td className="py-2.5 text-muted">{date(r.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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

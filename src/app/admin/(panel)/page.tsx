import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUp, CalendarDays, ChevronRight, Eye, FileText, FolderKanban, ImageIcon, Layers, Mail, Minus, PenLine, Plus, Newspaper, Wrench } from "lucide-react";
import { BarChart, LineChart, PieChart, CHART_COLORS } from "@/components/admin/charts";
import { requireAdmin } from "@/lib/auth/admin";
import { INQUIRY_STATUSES } from "@/lib/inquiry-status";
import { publicAssetUrl } from "@/lib/supabase/public";
import { cn } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

const TZ = "Asia/Kolkata";
const RANGES = [7, 30, 90] as const;
const DAY = 864e5;
const nowMs = () => Date.now();
const pretty = (s: string) => s.replace("_", " ").replace(/^\w/, (c) => c.toUpperCase());
const shortDate = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: TZ });
const dateTime = (iso: string) => `${shortDate(iso)} · ${new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", timeZone: TZ })}`;
const dayIndex = (iso: string) => Math.floor(Date.parse(new Date(iso).toLocaleDateString("en-CA", { timeZone: TZ })) / DAY);
const STATUS_COLORS: Record<string, string> = { new: "#3d7bff", contacted: "#22d3ee", qualified: "#10b981", proposal_sent: "#f59e0b", won: "#a78bfa", closed: "#64748b" };
const BADGE: Record<string, string> = {
  new: "bg-accent-strong/20 text-accent", contacted: "bg-cyan-500/15 text-cyan-400", qualified: "bg-success/15 text-success",
  proposal_sent: "bg-warning/20 text-warning", won: "bg-violet-500/20 text-violet-400", closed: "bg-elevated text-muted",
};

function must<T>(res: { data: T | null; error: { message: string } | null }, what: string): T {
  if (res.error) throw new Error(`Failed to load ${what}`);
  return res.data ?? ([] as unknown as T);
}

function Card({ title, action, children, className }: { title: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("min-w-0 rounded-xl border border-border bg-surface p-5", className)}>
      <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-base font-semibold">{title}</h2>{action}</div>
      {children}
    </section>
  );
}
const ViewAll = ({ href }: { href: string }) => <Link href={href} className="inline-flex items-center gap-1 text-xs text-accent hover:underline">View all <ArrowRight className="size-3.5" aria-hidden /></Link>;

function Stat({ icon: Icon, title, value, delta }: { icon: typeof FolderKanban; title: string; value: number; delta: number }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-surface p-5">
      <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-accent-strong/20 text-accent"><Icon className="size-5" aria-hidden /></span>
      <div className="min-w-0">
        <p className="truncate text-sm text-muted">{title}</p>
        <p className="font-display text-3xl font-semibold leading-tight">{value}</p>
        <p className={cn("flex items-center gap-1 text-xs", delta > 0 ? "text-success" : "text-muted")}>
          {delta > 0 ? <ArrowUp className="size-3" aria-hidden /> : <Minus className="size-3" aria-hidden />}{delta} in 30 days
        </p>
      </div>
    </div>
  );
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const range = ((r) => (RANGES as readonly number[]).includes(r) ? r : 7)(Number((await searchParams).range));
  const { supabase } = await requireAdmin();
  const count = async (table: "services" | "certifications" | "education" | "experiences") => {
    const { count: n, error } = await supabase.from(table).select("*", { count: "exact", head: true });
    if (error) throw new Error(`Failed to load ${table}`);
    return n ?? 0;
  };
  const [projects, posts, services, certs, edu, exp, inquiries, media] = await Promise.all([
    supabase.from("projects").select("id,title,slug,status,category,project_type,cover_image_path,created_at,updated_at,published_at").order("updated_at", { ascending: false }),
    supabase.from("blog_posts").select("id,title,status,created_at,updated_at,published_at").order("updated_at", { ascending: false }),
    supabase.from("services").select("id,title,status,created_at,updated_at").order("updated_at", { ascending: false }),
    count("certifications"), count("education"), count("experiences"),
    supabase.from("inquiries").select("id,name,project_type,status,created_at").order("created_at", { ascending: false }),
    supabase.from("media_assets").select("id,path,created_at").order("created_at", { ascending: false }).limit(3),
  ]);
  const P = must(projects, "projects"), B = must(posts, "blog posts"), S = must(services, "services"), I = must(inquiries, "inquiries"), M = must(media, "media");

  const monthAgo = nowMs() - 30 * DAY;
  const recent = (iso: string | null) => !!iso && Date.parse(iso) >= monthAgo;
  const published = P.filter((p) => p.status === "published"), drafts = P.filter((p) => p.status === "draft");
  const postsLive = B.filter((p) => p.status === "published");
  const newInq = I.filter((i) => i.status === "new");

  // Inquiries per day (or per week for 90 days) ending today.
  const step = range === 90 ? 7 : 1, buckets = Math.ceil(range / step), today = dayIndex(new Date(nowMs()).toISOString());
  const series = Array.from({ length: buckets }, (_, k) => {
    const end = today - (buckets - 1 - k) * step;
    const label = new Date((end) * DAY).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });
    const value = I.filter((i) => { const d = dayIndex(i.created_at); return d <= end && d > end - step; }).length;
    return { label, value };
  });
  const inRange = series.reduce((n, p) => n + p.value, 0);

  const byCategory = [...P.reduce((m, p) => m.set(p.category || "General", (m.get(p.category || "General") ?? 0) + 1), new Map<string, number>())].map(([label, value]) => ({ label, value }));
  const byType = [...I.reduce((m, i) => m.set(i.project_type || "Other", (m.get(i.project_type || "Other") ?? 0) + 1), new Map<string, number>())].map(([label, value]) => ({ label, value }));
  const credentials = certs + edu + exp;

  // Activity feed built only from real rows.
  const activity = [
    ...I.slice(0, 5).map((i) => ({ at: i.created_at, icon: Mail, tone: "bg-danger/20 text-danger", text: `New inquiry received from ${i.name}` })),
    ...P.slice(0, 5).map((p) => ({ at: p.updated_at, icon: PenLine, tone: "bg-accent-strong/25 text-accent", text: `Project “${p.title}” ${Math.abs(Date.parse(p.updated_at) - Date.parse(p.created_at)) < 60000 ? "created" : "updated"}` })),
    ...B.slice(0, 5).map((b) => ({ at: b.updated_at, icon: Newspaper, tone: "bg-success/20 text-success", text: `Blog post “${b.title}” ${b.status === "published" ? "published" : "saved as draft"}` })),
    ...S.slice(0, 3).map((s) => ({ at: s.updated_at, icon: Layers, tone: "bg-teal-500/20 text-teal-400", text: `Service “${s.title}” ${Math.abs(Date.parse(s.updated_at) - Date.parse(s.created_at)) < 60000 ? "added" : "updated"}` })),
    ...M.map((m) => ({ at: m.created_at, icon: ImageIcon, tone: "bg-violet-500/20 text-violet-400", text: "New media file uploaded" })),
  ].sort((a, b) => Date.parse(b.at) - Date.parse(a.at)).slice(0, 5);

  const actions = [
    { href: "/admin/projects/new", label: "Add New Project", icon: Plus }, { href: "/admin/blog/new", label: "Write Blog Post", icon: PenLine },
    { href: "/admin/services/new", label: "Add Service", icon: Layers }, { href: "/admin/inquiries", label: "View Inquiries", icon: Mail },
    { href: "/admin/media", label: "Manage Media", icon: ImageIcon },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">Overview of your portfolio and recent activity</p>
        </div>
        <nav aria-label="Date range" className="flex items-center gap-1 rounded-xl border border-border bg-surface p-1">
          <CalendarDays className="mx-2 size-4 text-muted" aria-hidden />
          {RANGES.map((r) => (
            <Link key={r} href={r === 7 ? "/admin" : `/admin?range=${r}`} aria-current={r === range ? "true" : undefined}
              className={cn("whitespace-nowrap rounded-lg px-3 py-1.5 text-sm", r === range ? "bg-accent-strong text-white" : "text-muted hover:text-foreground")}><span className="sm:hidden">{r}d</span><span className="hidden sm:inline">Last {r} days</span></Link>
          ))}
        </nav>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Stat icon={FolderKanban} title="Total Projects" value={P.length} delta={P.filter((p) => recent(p.created_at)).length} />
        <Stat icon={Eye} title="Published Projects" value={published.length} delta={published.filter((p) => recent(p.published_at)).length} />
        <Stat icon={FileText} title="Draft Projects" value={drafts.length} delta={drafts.filter((p) => recent(p.created_at)).length} />
        <Stat icon={Newspaper} title="Blog Posts" value={B.length} delta={B.filter((p) => recent(p.created_at)).length} />
        <Stat icon={Mail} title="New Inquiries" value={newInq.length} delta={newInq.filter((i) => recent(i.created_at)).length} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_1.35fr_1fr]">
        <Card title="Project Status"><PieChart centerLabel="Total" data={[{ label: "Published", value: published.length, color: "#3d7bff" }, { label: "Draft", value: drafts.length, color: "#f59e0b" }]} emptyText="No projects yet." /></Card>
        <Card title="Inquiries Overview" action={<span className="rounded-lg border border-border px-2.5 py-1 text-xs text-muted">{inRange} in last {range} days</span>}>
          <LineChart points={series} label={`Inquiries over the last ${range} days`} />
        </Card>
        <Card title="Content Distribution">
          <BarChart label="Content by type" bars={[{ label: "Projects", value: P.length }, { label: "Blog Posts", value: B.length }, { label: "Services", value: services.error ? 0 : S.length }, { label: "Credentials", value: credentials }]} />
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.25fr_1.25fr_0.8fr]">
        <Card title="Recent Projects" action={<ViewAll href="/admin/projects" />}>
          {!P.length ? <p className="py-6 text-sm text-muted">No projects yet.</p> : (
            <div className="overflow-x-auto"><table className="w-full text-left text-sm">
              <thead className="text-xs text-muted"><tr><th className="py-2 pr-3 font-medium">Title</th><th className="py-2 pr-3 font-medium">Status</th><th className="py-2 font-medium">Updated</th></tr></thead>
              <tbody className="divide-y divide-border">
                {P.slice(0, 5).map((p) => {
                  const cover = publicAssetUrl(p.cover_image_path);
                  return (
                    <tr key={p.id}>
                      <td className="w-full max-w-0 py-2.5 pr-3"><Link href={`/admin/projects/${p.id}`} className="flex min-w-0 items-center gap-3 hover:text-accent">
                        {cover ? <Image src={cover} alt="" width={36} height={36} className="size-9 shrink-0 rounded-md object-cover" /> : <span className="grid size-9 shrink-0 place-items-center rounded-md bg-elevated text-xs font-semibold text-muted">{p.title.slice(0, 1)}</span>}
                        <span className="min-w-0"><span className="block truncate font-medium">{p.title}</span><span className="block truncate text-xs text-muted">{p.project_type}</span></span>
                      </Link></td>
                      <td className="py-2.5 pr-3"><span className={cn("rounded-md px-2 py-1 text-xs", p.status === "published" ? "bg-success/15 text-success" : "bg-warning/20 text-warning")}>{pretty(p.status)}</span></td>
                      <td className="whitespace-nowrap py-2.5 pl-2 text-xs text-muted">{shortDate(p.updated_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table></div>
          )}
        </Card>

        <Card title="Recent Inquiries" action={<ViewAll href="/admin/inquiries" />}>
          {!I.length ? <p className="py-6 text-sm text-muted">No inquiries yet. New messages from the contact form appear here.</p> : (
            <div className="overflow-x-auto"><table className="w-full text-left text-sm">
              <thead className="text-xs text-muted"><tr><th className="py-2 pr-3 font-medium">Name</th><th className="hidden sm:table-cell xl:hidden 2xl:table-cell py-2 pr-3 font-medium">Project type</th><th className="py-2 pr-3 font-medium">Status</th><th className="py-2 font-medium">Date</th></tr></thead>
              <tbody className="divide-y divide-border">
                {I.slice(0, 5).map((r) => (
                  <tr key={r.id}>
                    <td className="py-2.5 pr-3"><Link href={`/admin/inquiries/${r.id}`} className="font-medium hover:text-accent">{r.name}</Link></td>
                    <td className="hidden sm:table-cell xl:hidden 2xl:table-cell max-w-[9rem] truncate py-2.5 pr-3 text-muted">{r.project_type}</td>
                    <td className="py-2.5 pr-3"><span className={cn("whitespace-nowrap rounded-md px-2 py-1 text-xs", BADGE[r.status])}>{pretty(r.status)}</span></td>
                    <td className="whitespace-nowrap py-2.5 text-xs text-muted">{shortDate(r.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          )}
        </Card>

        <Card title="Quick Actions">
          <ul className="space-y-2">
            {actions.map(({ href, label, icon: Icon }) => (
              <li key={href}><Link href={href} className="flex min-h-11 items-center gap-3 rounded-lg border border-border px-3 text-sm hover:border-accent/60 hover:bg-elevated"><Icon className="size-[18px] text-accent" aria-hidden /><span className="flex-1">{label}</span><ChevronRight className="size-4 text-muted" aria-hidden /></Link></li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Inquiries by Status"><PieChart centerLabel="Inquiries" emptyText="No inquiries yet." data={INQUIRY_STATUSES.map((s) => ({ label: pretty(s), value: I.filter((i) => i.status === s).length, color: STATUS_COLORS[s] }))} /></Card>
        <Card title="Projects by Category"><PieChart hole={0} emptyText="No projects yet." data={byCategory.map((d, i) => ({ ...d, color: CHART_COLORS[i % CHART_COLORS.length] }))} /></Card>
        <Card title="Inquiries by Project Type"><PieChart hole={0} emptyText="No inquiries yet." data={byType.map((d, i) => ({ ...d, color: CHART_COLORS[(i + 2) % CHART_COLORS.length] }))} /></Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.3fr_1.1fr_0.8fr]">
        <Card title="Traffic Overview">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <p className="text-sm">Visitor numbers are collected by Vercel Web Analytics, not stored in this database, so they are not charted here.</p>
              <p className="mt-2 text-sm text-muted">Open your Vercel project and choose the Analytics tab to see visitors, page views and top pages.</p>
            </div>
            <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-accent-strong px-4 text-sm font-medium text-white">Open Vercel <ArrowRight className="size-4" aria-hidden /></a>
          </div>
        </Card>
        <Card title="Recent Activity">
          {!activity.length ? <p className="py-6 text-sm text-muted">Activity appears here as you work.</p> : (
            <ul className="space-y-3">
              {activity.map((a, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className={cn("grid size-9 shrink-0 place-items-center rounded-full", a.tone)}><a.icon className="size-4" aria-hidden /></span>
                  <span className="min-w-0"><span className="block truncate text-sm">{a.text}</span><span className="block text-xs text-muted">{dateTime(a.at)}</span></span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <section className="flex min-w-0 flex-col justify-between rounded-xl border border-border bg-gradient-to-br from-accent-strong/25 to-surface p-5">
          <div>
            <Wrench className="size-7 text-accent" aria-hidden />
            <h2 className="mt-4 font-display text-xl font-semibold">Build something great today</h2>
            <p className="mt-2 text-sm text-muted">Keep creating, keep improving. Your next opportunity is just one project away.</p>
          </div>
          <Link href="/" target="_blank" className="mt-5 inline-flex min-h-11 w-fit items-center rounded-lg bg-accent-strong px-4 text-sm font-medium text-white">View Portfolio</Link>
        </section>
      </div>
    </div>
  );
}

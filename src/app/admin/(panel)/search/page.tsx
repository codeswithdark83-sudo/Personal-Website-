import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  // Keep only characters that are safe inside a PostgREST filter, so a query can never alter the filter itself.
  const q = ((await searchParams).q ?? "").replace(/[^\p{L}\p{N}\s@._-]/gu, "").trim().slice(0, 60);
  const { supabase } = await requireAdmin();
  const like = `%${q}%`;
  const [projects, posts, inquiries, services] = q.length < 2 ? [null, null, null, null] : await Promise.all([
    supabase.from("projects").select("id,title,status").ilike("title", like).limit(10),
    supabase.from("blog_posts").select("id,title,status").ilike("title", like).limit(10),
    supabase.from("inquiries").select("id,name,email,project_type").or(`name.ilike.${like},email.ilike.${like},project_type.ilike.${like}`).limit(10),
    supabase.from("services").select("id,title,status").ilike("title", like).limit(10),
  ]);
  const groups = [
    { title: "Projects", rows: (projects?.data ?? []).map((r) => ({ id: r.id, href: `/admin/projects/${r.id}`, label: r.title, meta: r.status })) },
    { title: "Blog posts", rows: (posts?.data ?? []).map((r) => ({ id: r.id, href: `/admin/blog/${r.id}`, label: r.title, meta: r.status })) },
    { title: "Inquiries", rows: (inquiries?.data ?? []).map((r) => ({ id: r.id, href: `/admin/inquiries/${r.id}`, label: r.name, meta: `${r.email} · ${r.project_type}` })) },
    { title: "Services", rows: (services?.data ?? []).map((r) => ({ id: r.id, href: `/admin/services/${r.id}`, label: r.title, meta: r.status })) },
  ];
  const total = groups.reduce((n, g) => n + g.rows.length, 0);
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold sm:text-3xl">Search</h1><p className="mt-1 text-sm text-muted">{q.length < 2 ? "Type at least 2 characters in the search box." : `${total} result${total === 1 ? "" : "s"} for “${q}”`}</p></div>
      {q.length >= 2 && total === 0 && <p className="rounded-xl border border-dashed border-border py-14 text-center text-muted">Nothing matched. Try a different word.</p>}
      {groups.filter((g) => g.rows.length).map((g) => (
        <section key={g.title} className="rounded-xl border border-border bg-surface p-5">
          <h2 className="text-base font-semibold">{g.title}</h2>
          <ul className="mt-3 divide-y divide-border">
            {g.rows.map((r) => (
              <li key={r.id}><Link href={r.href} className="flex min-h-11 items-center justify-between gap-4 py-2 text-sm hover:text-accent"><span className="truncate font-medium">{r.label}</span><span className="shrink-0 truncate text-xs text-muted">{r.meta}</span></Link></li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

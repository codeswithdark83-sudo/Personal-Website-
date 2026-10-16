import { beforeEach, describe, expect, it, vi } from "vitest";

type Row = Record<string, unknown>;
let tables: Record<string, Row[]> = {};
let failTable: string | null = null;
let configured = true;

// Minimal chainable stand-in for the Supabase query builder: supports select/eq/order/limit and await.
function builder(table: string) {
  let rows = [...(tables[table] ?? [])];
  const b = {
    select: () => b,
    eq: (col: string, val: unknown) => { rows = rows.filter((r) => r[col] === val); return b; },
    order: () => b,
    limit: (n: number) => { rows = rows.slice(0, n); return b; },
    then: (resolve: (v: unknown) => void) =>
      resolve(failTable === table ? { data: null, error: { message: "boom" } } : { data: rows, error: null }),
  };
  return b;
}

vi.mock("@/lib/supabase/public", () => ({
  createPublicClient: () => (configured ? { from: builder } : null),
  publicAssetUrl: (p?: string | null) => (p ? `https://cdn.test/${p}` : undefined),
}));

const load = () => import("@/lib/content");

beforeEach(() => { tables = {}; failTable = null; configured = true; });

describe("content layer (Supabase configured)", () => {
  it("returns empty lists — not placeholders — when the database has no published rows", async () => {
    const c = await load();
    expect(await c.getProjects()).toEqual([]);
    expect(await c.getServices()).toEqual([]);
    expect(await c.getPosts()).toEqual([]);
  });

  it("maps a project with technologies, cover URL and case-study sections", async () => {
    tables = {
      projects: [{ id: "p1", slug: "alpha", title: "Alpha", summary: "s", description: "Overview text", category: "Web", project_type: "Web App", featured: true, status: "published", cover_image_path: "covers/a.png", live_url: null, repository_url: "https://github.com/x/y", timeline_label: null }],
      technologies: [{ id: "t1", name: "Next.js" }, { id: "t2", name: "Supabase" }],
      project_technologies: [{ project_id: "p1", technology_id: "t1" }, { project_id: "p1", technology_id: "t2" }, { project_id: "other", technology_id: "t1" }],
      case_studies: [{ project_id: "p1", problem: "The problem", goals: "  ", content_blocks: [{ title: "Custom", body: "b" }, { nope: 1 }] }],
    };
    const [p] = await (await load()).getProjects();
    expect(p).toMatchObject({ slug: "alpha", technologies: ["Next.js", "Supabase"], coverUrl: "https://cdn.test/covers/a.png", repositoryUrl: "https://github.com/x/y", isPlaceholder: false });
    expect(p!.sections.map((s) => s.title)).toEqual(["Project overview", "Problem statement", "Custom"]); // blank goals + malformed block dropped
  });

  it("computes reading time from the body and never reports 0 minutes", async () => {
    tables = { blog_posts: [{ slug: "a", title: "A", excerpt: "", body: "word ".repeat(450), category: "X", tags: [], status: "published", published_at: "2026-01-02", created_at: "2026-01-01", cover_image_path: null }] };
    const [post] = await (await load()).getPosts();
    expect(post!.readingMinutes).toBe(2);
    tables = { blog_posts: [{ ...tables.blog_posts![0], body: "" }] };
    expect((await (await load()).getPosts())[0]!.readingMinutes).toBe(1);
  });

  it("groups skills by category and excludes the scheduling link from social icons", async () => {
    tables = {
      skills: [{ name: "React", category: "Frontend", visible: true }, { name: "Node.js", category: "Backend", visible: true }, { name: "Vue", category: "Frontend", visible: true }],
      social_links: [{ platform: "github", url: "https://github.com/x", visible: true }, { platform: "scheduling", url: "https://cal.test", visible: true }],
    };
    const c = await load();
    expect(await c.getSkills()).toEqual([{ category: "Frontend", skills: ["React", "Vue"] }, { category: "Backend", skills: ["Node.js"] }]);
    expect(await c.getSocialLinks()).toEqual([{ platform: "github", url: "https://github.com/x", label: "GitHub" }]);
  });

  it("formats experience periods and treats a missing end date as Present", async () => {
    tables = { experiences: [{ role: "Dev", organization: "Acme", start_date: "2024-03-01", end_date: null, visible: true }] };
    expect((await (await load()).getExperience())[0]!.period).toBe("2024 – Present");
  });

  it("throws (so error.tsx can recover) when the database query fails instead of hiding data", async () => {
    failTable = "projects";
    await expect((await load()).getProjects()).rejects.toThrow(/Failed to load projects/);
  });

  it("reads contact settings defensively", async () => {
    tables = { site_settings: [{ key: "contact", value: { email: "a@b.co", whatsapp_number: "911", whatsapp_prefill: 5 } }] };
    expect(await (await load()).getContactSettings()).toEqual({ email: "a@b.co", whatsappNumber: "911", whatsappPrefill: undefined });
  });
});

describe("content layer (Supabase NOT configured)", () => {
  it("falls back to clearly-labelled placeholder content", async () => {
    configured = false;
    const projects = await (await load()).getProjects();
    expect(projects.length).toBeGreaterThan(0);
    expect(projects.every((p) => p.isPlaceholder)).toBe(true);
  });
});

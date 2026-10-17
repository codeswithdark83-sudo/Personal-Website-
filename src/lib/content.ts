// Single data-access seam for public content.
// - Supabase configured  -> real published rows only (RLS enforces this; empty tables give empty states).
// - Supabase NOT configured -> clearly-labelled placeholder content so local setup still renders.
// Errors from a configured database are thrown so error.tsx shows a recoverable state instead of silently hiding data.
import type { SupabaseClient } from "@supabase/supabase-js";
import { createPublicClient, publicAssetUrl } from "@/lib/supabase/public";
import {
  fallbackExperience, placeholderEducation, placeholderJourney, placeholderPosts, placeholderProjects,
  placeholderServices, placeholderSkills,
} from "@/lib/placeholder-content";
import type { Database, Json } from "@/types/database";

export type DbClient = SupabaseClient<Database>;
import type { BlogPost, Project, SectionBlock, Service, SkillGroup, SocialLink, TimelineEntry } from "@/types/content";

function db() { return createPublicClient(); }

function must<T>(res: { data: T | null; error: { message: string } | null }, what: string): T {
  if (res.error) throw new Error(`Failed to load ${what}: ${res.error.message}`);
  return res.data ?? ([] as unknown as T);
}

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function parseBlocks(json: Json): SectionBlock[] {
  if (!Array.isArray(json)) return [];
  return json.flatMap((b) => {
    if (b && typeof b === "object" && !Array.isArray(b) && typeof b.title === "string" && typeof b.body === "string") {
      return [{ id: typeof b.id === "string" && b.id ? b.id : slugify(b.title), title: b.title, body: b.body }];
    }
    return [];
  });
}

// ---------- Projects ----------
/** `client` + `includeDrafts` let the admin preview use its own session; public callers get published rows only. */
export async function loadProjects(client?: DbClient, includeDrafts = false): Promise<Project[]> {
  const c = client ?? db();
  if (!c) return placeholderProjects;
  const base = c.from("projects").select("*");
  const [projects, studies, links, techs] = await Promise.all([
    (includeDrafts ? base : base.eq("status", "published")).order("sort_order").order("published_at", { ascending: false }),
    c.from("case_studies").select("*"),
    c.from("project_technologies").select("*"),
    c.from("technologies").select("*"),
  ]);
  const techName = new Map(must(techs, "technologies").map((t) => [t.id, t.name]));
  const studyBy = new Map(must(studies, "case studies").map((s) => [s.project_id, s]));
  return must(projects, "projects").map((p) => {
    const cs = studyBy.get(p.id);
    const named: [string, string | null | undefined][] = [
      ["Project overview", p.description],
      ["Problem statement", cs?.problem], ["Goals and requirements", cs?.goals], ["My role and responsibilities", cs?.role],
      ["Planning and design decisions", cs?.approach], ["System architecture", cs?.architecture],
      ["Solutions and trade-offs", cs?.solution], ["Technical challenges", cs?.challenges],
      ["Verified results", cs?.outcomes], ["Lessons learned", cs?.lessons_learned],
    ];
    const sections: SectionBlock[] = [
      ...named.filter(([, body]) => body && body.trim()).map(([title, body]) => ({ id: slugify(title), title, body: body as string })),
      ...(cs ? parseBlocks(cs.content_blocks) : []),
    ];
    return {
      slug: p.slug, title: p.title, summary: p.summary, category: p.category, projectType: p.project_type,
      technologies: must(links, "project technologies").filter((l) => l.project_id === p.id).map((l) => techName.get(l.technology_id)).filter((n): n is string => !!n),
      featured: p.featured, liveUrl: p.live_url ?? undefined, repositoryUrl: p.repository_url ?? undefined,
      timeline: p.timeline_label ?? undefined, sections, coverUrl: publicAssetUrl(p.cover_image_path), isPlaceholder: false,
    };
  });
}

export const getProjects = () => loadProjects();
export async function getProject(slug: string) { return (await loadProjects()).find((p) => p.slug === slug) ?? null; }
export async function getFeaturedProjects() { return (await loadProjects()).filter((p) => p.featured).slice(0, 3); }

// ---------- Services ----------
export async function getServices(): Promise<Service[]> {
  const c = db();
  if (!c) return placeholderServices;
  const rows = must(await c.from("services").select("*").eq("status", "published").order("sort_order"), "services");
  return rows.map((s) => ({
    slug: s.slug, title: s.title, description: s.description, icon: s.icon, deliverables: s.deliverables,
    targetClient: s.target_client ?? undefined, pricingNote: s.pricing_note ?? undefined, timelineNote: s.timeline_note ?? undefined,
  }));
}

// ---------- Credentials ----------
export async function getSkills(): Promise<SkillGroup[]> {
  const c = db();
  if (!c) return placeholderSkills;
  const rows = must(await c.from("skills").select("*").eq("visible", true).order("sort_order"), "skills");
  const groups = new Map<string, string[]>();
  for (const r of rows) groups.set(r.category, [...(groups.get(r.category) ?? []), r.name]);
  return [...groups].map(([category, skills]) => ({ category, skills }));
}

const year = (d: string | null) => (d ? new Date(d).getUTCFullYear().toString() : null);
const period = (start: string | null, end: string | null) => {
  const [a, b] = [year(start), year(end)];
  if (!a && !b) return "";
  return `${a ?? ""} – ${b ?? "Present"}`;
};

export async function getEducation(): Promise<TimelineEntry[]> {
  const c = db();
  if (!c) return placeholderEducation;
  const rows = must(await c.from("education").select("*").eq("visible", true).order("sort_order"), "education");
  return rows.map((e) => ({ title: e.qualification, subtitle: e.institution, period: period(e.start_date, e.end_date), description: e.description ?? undefined }));
}

export async function getExperience(): Promise<TimelineEntry[]> {
  const c = db();
  if (!c) return fallbackExperience;
  const rows = must(await c.from("experiences").select("*").eq("visible", true).order("sort_order"), "experience");
  return rows.map((e) => ({ title: e.role, subtitle: e.organization, period: period(e.start_date, e.end_date), description: e.description ?? undefined, url: e.url ?? undefined }));
}

export async function getCertifications(): Promise<TimelineEntry[]> {
  const c = db();
  if (!c) return [];
  const rows = must(await c.from("certifications").select("*").eq("visible", true).order("sort_order"), "certifications");
  return rows.map((r) => ({
    title: r.title, subtitle: r.issuer, period: year(r.issued_on) ?? "",
    description: r.credential_id ? `Credential ID: ${r.credential_id}` : undefined, url: r.verification_url ?? undefined,
  }));
}

function settingsObject(v: Json | undefined) { return v && typeof v === "object" && !Array.isArray(v) ? v : null; }

async function getSetting(key: string): Promise<Json | undefined> {
  const c = db();
  if (!c) return undefined;
  return must(await c.from("site_settings").select("value").eq("key", key).limit(1), `setting ${key}`)[0]?.value;
}

/** About-page journey: owner-written entries stored in site_settings.journey (editable in admin). */
export async function getJourney(): Promise<TimelineEntry[]> {
  if (!db()) return placeholderJourney;
  const v = await getSetting("journey");
  if (!Array.isArray(v)) return [];
  return v.flatMap((e) => {
    const o = settingsObject(e);
    return o && typeof o.label === "string" && typeof o.text === "string" ? [{ period: o.label, title: o.text, subtitle: "" }] : [];
  });
}

export type AboutContent = { title: string; body: string };
const fallbackAbout: AboutContent = {
  title: "Turning Ideas into Real Web Solutions",
  body: "I’m a passionate full-stack developer who enjoys building modern web applications. I focus on writing clean code, creating great user experiences, and solving real problems with technology.",
};
export async function getAbout(): Promise<AboutContent> {
  const o = settingsObject(await getSetting("about"));
  return o && typeof o.title === "string" && typeof o.body === "string" ? { title: o.title, body: o.body } : fallbackAbout;
}

// ---------- Blog ----------
export async function loadPosts(client?: DbClient, includeDrafts = false): Promise<BlogPost[]> {
  const c = client ?? db();
  if (!c) return placeholderPosts;
  const base = c.from("blog_posts").select("*");
  const rows = must(await (includeDrafts ? base : base.eq("status", "published")).order("published_at", { ascending: false }), "posts");
  return rows.map((p) => ({
    slug: p.slug, title: p.title, excerpt: p.excerpt, category: p.category, tags: p.tags,
    publishedAt: p.published_at ?? p.created_at, readingMinutes: Math.max(1, Math.round(p.body.trim().split(/\s+/).length / 200)),
    body: p.body, coverUrl: publicAssetUrl(p.cover_image_path), isPlaceholder: false,
  }));
}
export const getPosts = () => loadPosts();
export async function getPost(slug: string) { return (await getPosts()).find((p) => p.slug === slug) ?? null; }

// ---------- Profile, contact, social ----------
export type Profile = {
  displayName: string; headline: string; bio: string; location?: string;
  avatarUrl?: string; resumeUrl?: string; availability: "available" | "limited" | "unavailable";
};

const fallbackProfile: Profile = {
  displayName: "Jatin Kr. Koli", headline: "Full Stack Developer",
  bio: "I build modern, scalable and user-friendly web applications. Passionate about clean code, great user experiences, and turning ideas into reality.",
  location: "Haryana, India", availability: "available",
};

export async function getProfile(): Promise<Profile> {
  const c = db();
  if (!c) return fallbackProfile;
  const row = must(await c.from("profiles").select("*").limit(1), "profile")[0];
  if (!row) return fallbackProfile;
  return {
    displayName: row.display_name, headline: row.headline, bio: row.bio, location: row.location_label ?? undefined, availability: row.availability_status,
    avatarUrl: publicAssetUrl(row.avatar_path), resumeUrl: publicAssetUrl(row.resume_path),
  };
}

const labels: Record<SocialLink["platform"], string> = { github: "GitHub", linkedin: "LinkedIn", instagram: "Instagram", whatsapp: "WhatsApp", email: "Email" };

/** Owner-supplied links, used only when the database is not configured (keeps a fresh deploy usable). */
const fallbackSocialLinks: SocialLink[] = [
  { platform: "github", url: "https://github.com/codeswithdark83-sudo", label: "GitHub" },
  { platform: "linkedin", url: "https://www.linkedin.com/in/jatin-kr-koli/", label: "LinkedIn" },
  { platform: "instagram", url: "https://www.instagram.com/codeswithdark/", label: "Instagram" },
  { platform: "whatsapp", url: "https://wa.me/917827486302", label: "WhatsApp" },
  { platform: "email", url: "mailto:codeswithdark83@gmail.com", label: "Email" },
];

export async function getSocialLinks(): Promise<SocialLink[]> {
  const c = db();
  if (!c) return fallbackSocialLinks;
  const rows = must(await c.from("social_links").select("*").eq("visible", true).order("sort_order"), "social links");
  return rows.flatMap((r) => (r.platform === "scheduling" ? [] : [{ platform: r.platform, url: r.url, label: labels[r.platform] }]));
}

export type ContactSettings = { email?: string; whatsappNumber?: string; whatsappPrefill?: string };
export async function getContactSettings(): Promise<ContactSettings> {
  const c = db();
  if (!c) return { email: "codeswithdark83@gmail.com", whatsappNumber: "917827486302" };
  const row = must(await c.from("site_settings").select("value").eq("key", "contact").limit(1), "contact settings")[0];
  const v = row?.value;
  if (!v || typeof v !== "object" || Array.isArray(v)) return {};
  const str = (x: unknown) => (typeof x === "string" && x ? x : undefined);
  return { email: str(v.email), whatsappNumber: str(v.whatsapp_number), whatsappPrefill: str(v.whatsapp_prefill) };
}

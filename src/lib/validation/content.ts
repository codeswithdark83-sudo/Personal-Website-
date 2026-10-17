import { z } from "zod";
import { SLUG_RE } from "@/lib/slug";

const text = (max: number) => z.string().trim().max(max);
const required = (max: number, label: string) => z.string().trim().min(1, `${label} is required`).max(max, `${label} is too long`);
const httpUrl = z.string().trim().max(500)
  .refine((v) => v === "" || /^https?:\/\/[^\s]+$/i.test(v), "Must start with http:// or https://")
  .transform((v) => v || null);
const optionalText = (max: number) => text(max).transform((v) => v || null);
const intField = z.coerce.number().int().min(-9999).max(9999).default(0);
const slugField = z.string().trim().toLowerCase().max(120).refine((v) => v === "" || SLUG_RE.test(v), "Use lowercase letters, numbers and single hyphens");
const status = z.enum(["draft", "published"]);
const date = z.string().trim().refine((v) => v === "" || /^\d{4}-\d{2}-\d{2}$/.test(v), "Use YYYY-MM-DD").transform((v) => v || null);

export const blockSchema = z.object({ id: text(80).optional(), title: required(160, "Section title"), body: text(20000) });
export const blocksSchema = z.array(blockSchema).max(40);

export const projectSchema = z.object({
  title: required(160, "Title"), slug: slugField, summary: text(500), description: text(20000),
  live_url: httpUrl, repository_url: httpUrl,
  project_type: required(80, "Project type"), category: required(80, "Category"),
  timeline_label: optionalText(120), featured: z.boolean(), status, sort_order: intField,
  technologies: z.array(text(60).min(1)).max(30),
  problem: optionalText(20000), goals: optionalText(20000), role: optionalText(20000), approach: optionalText(20000),
  solution: optionalText(20000), architecture: optionalText(20000), challenges: optionalText(20000),
  outcomes: optionalText(20000), lessons_learned: optionalText(20000),
  blocks: blocksSchema,
});

export const serviceSchema = z.object({
  title: required(160, "Title"), slug: slugField, description: text(1000),
  icon: z.enum(["monitor", "code", "layers", "cart", "plug", "wrench"]),
  target_client: optionalText(300), scope: optionalText(3000), pricing_note: optionalText(500), timeline_note: optionalText(300),
  deliverables: z.array(text(200).min(1)).max(30), cta_label: required(60, "Button label"),
  status, sort_order: intField,
});

export const postSchema = z.object({
  title: required(200, "Title"), slug: slugField, excerpt: text(600), body: text(200000),
  category: required(80, "Category"), tags: z.array(text(40).min(1)).max(15),
  seo_title: optionalText(70), seo_description: optionalText(170), status,
});

export const skillSchema = z.object({ name: required(80, "Name"), category: required(80, "Category"), sort_order: intField, visible: z.boolean() });
export const experienceSchema = z.object({
  role: required(160, "Role"), organization: required(160, "Organization"), description: optionalText(3000),
  start_date: date, end_date: date, url: httpUrl, sort_order: intField, visible: z.boolean(),
});
export const educationSchema = z.object({
  qualification: required(200, "Qualification"), institution: required(200, "Institution"), description: optionalText(3000),
  start_date: date, end_date: date, sort_order: intField, visible: z.boolean(),
});
export const certificationSchema = z.object({
  title: required(200, "Title"), issuer: required(160, "Issuer"), issued_on: date, expires_on: date,
  credential_id: optionalText(120), verification_url: httpUrl, sort_order: intField, visible: z.boolean(),
});

export const profileSchema = z.object({
  display_name: required(120, "Display name"), headline: text(200), bio: text(4000), location_label: optionalText(120),
  availability_status: z.enum(["available", "limited", "unavailable"]),
});

export const socialLinksSchema = z.object({
  github: httpUrl, linkedin: httpUrl, instagram: httpUrl, scheduling: httpUrl,
  email: z.string().trim().max(254).refine((v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Enter a valid email address").transform((v) => v || null),
  whatsapp_number: z.string().trim().refine((v) => v === "" || /^\+?[0-9 ()-]{7,20}$/.test(v), "Enter a phone number with country code").transform((v) => v.replace(/\D/g, "") || null),
  whatsapp_prefill: optionalText(300),
});

export type ActionResult = { ok: boolean; error?: string; fieldErrors?: Record<string, string[]>; message?: string; redirectTo?: string };

export function fieldErrorsFrom(err: z.ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of err.issues) (out[String(issue.path[0] ?? "form")] ??= []).push(issue.message);
  return out;
}

/** Splits textarea/comma input into trimmed, de-duplicated, non-empty items. */
export function splitList(raw: FormDataEntryValue | null, sep: RegExp = /[\n,]/): string[] {
  return [...new Set(String(raw ?? "").split(sep).map((s) => s.trim()).filter(Boolean))];
}

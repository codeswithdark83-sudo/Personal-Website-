"use server";

import { redirect } from "next/navigation";
import { getAdminOrNull } from "@/lib/auth/admin";
import { projectSchema, splitList, type ActionResult } from "@/lib/validation/content";
import { slugify } from "@/lib/slug";
import { buildStoragePath, validateUpload } from "@/lib/uploads";
import { bool, dbError, NOT_AUTHORISED, parseWith, revalidatePublic, str } from "../../_lib/helpers";

const CASE_FIELDS = ["problem", "goals", "role", "approach", "solution", "architecture", "challenges", "outcomes", "lessons_learned"] as const;

export async function saveProjectAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const admin = await getAdminOrNull();
  if (!admin) return NOT_AUTHORISED;
  const { supabase } = admin;

  let blocks: unknown = [];
  try { blocks = JSON.parse(str(fd, "blocks") || "[]"); } catch { return { ok: false, error: "Extra sections could not be read. Reload and try again." }; }

  const parsed = parseWith(projectSchema, {
    title: str(fd, "title"), slug: str(fd, "slug"), summary: str(fd, "summary"), description: str(fd, "description"),
    live_url: str(fd, "live_url"), repository_url: str(fd, "repository_url"),
    project_type: str(fd, "project_type"), category: str(fd, "category"), timeline_label: str(fd, "timeline_label"),
    featured: bool(fd, "featured"), status: str(fd, "status"), sort_order: str(fd, "sort_order") || 0,
    technologies: splitList(fd.get("technologies")),
    ...Object.fromEntries(CASE_FIELDS.map((k) => [k, str(fd, k)])),
    blocks,
  });
  if (!parsed.ok) return parsed.result;
  const d = parsed.data;
  const slug = d.slug || slugify(d.title);
  if (!slug) return { ok: false, error: "Could not build a slug from the title.", fieldErrors: { slug: ["Enter a slug"] } };

  const id = str(fd, "id");
  const existing = id ? (await supabase.from("projects").select("published_at,cover_image_path").eq("id", id).limit(1)).data?.[0] : undefined;
  if (id && !existing) return { ok: false, error: "That project no longer exists." };

  // Optional cover image: magic-byte validated, server-generated path.
  let coverPath = existing?.cover_image_path ?? null;
  const cover = fd.get("cover");
  if (cover instanceof File && cover.size > 0) {
    const check = await validateUpload(cover, "public-assets", true);
    if (!check.ok) return { ok: false, error: check.error, fieldErrors: { cover: [check.error] } };
    const path = buildStoragePath("projects", check.ext);
    const up = await supabase.storage.from("public-assets").upload(path, cover, { contentType: check.mime, upsert: false });
    if (up.error) return { ok: false, error: "Image upload failed. Please try again." };
    coverPath = path;
  }
  if (bool(fd, "remove_cover")) coverPath = null;

  const row = {
    title: d.title, slug, summary: d.summary, description: d.description, live_url: d.live_url, repository_url: d.repository_url,
    project_type: d.project_type, category: d.category, timeline_label: d.timeline_label, featured: d.featured,
    status: d.status, sort_order: d.sort_order, cover_image_path: coverPath,
    published_at: d.status === "published" ? (existing?.published_at ?? new Date().toISOString()) : null,
  };

  let projectId = id;
  if (id) {
    const { error } = await supabase.from("projects").update(row).eq("id", id);
    if (error) return dbError(error);
  } else {
    const { data, error } = await supabase.from("projects").insert(row).select("id").single();
    if (error) return dbError(error);
    projectId = data.id;
  }

  const cs = { project_id: projectId, content_blocks: d.blocks, ...Object.fromEntries(CASE_FIELDS.map((k) => [k, d[k]])) };
  const csRes = await supabase.from("case_studies").upsert(cs, { onConflict: "project_id" });
  if (csRes.error) return dbError(csRes.error);

  // Technologies: upsert by unique name, then replace the project's links.
  if (d.technologies.length) {
    const t = await supabase.from("technologies").upsert(d.technologies.map((name) => ({ name })), { onConflict: "name" });
    if (t.error) return dbError(t.error);
  }
  const techRows = d.technologies.length ? (await supabase.from("technologies").select("id,name").in("name", d.technologies)).data ?? [] : [];
  const del = await supabase.from("project_technologies").delete().eq("project_id", projectId);
  if (del.error) return dbError(del.error);
  if (techRows.length) {
    const ins = await supabase.from("project_technologies").insert(techRows.map((t) => ({ project_id: projectId, technology_id: t.id })));
    if (ins.error) return dbError(ins.error);
  }

  revalidatePublic();
  if (!id) return { ok: true, message: "Project created.", redirectTo: `/admin/projects/${projectId}` };
  return { ok: true, message: d.status === "published" ? "Saved and live on the site." : "Saved as draft." };
}

export async function deleteProjectAction(fd: FormData): Promise<void> {
  const admin = await getAdminOrNull();
  if (!admin) redirect("/admin/login");
  const id = str(fd, "id");
  if (!id) return;
  const { error } = await admin.supabase.from("projects").delete().eq("id", id);
  if (error) throw new Error("Delete failed");
  revalidatePublic();
  redirect("/admin/projects");
}

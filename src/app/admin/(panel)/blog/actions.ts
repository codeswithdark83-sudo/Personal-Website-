"use server";

import { redirect } from "next/navigation";
import { getAdminOrNull } from "@/lib/auth/admin";
import { postSchema, splitList, type ActionResult } from "@/lib/validation/content";
import { slugify } from "@/lib/slug";
import { dbError, NOT_AUTHORISED, parseWith, revalidatePublic, str } from "../../_lib/helpers";

export async function savePostAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const admin = await getAdminOrNull();
  if (!admin) return NOT_AUTHORISED;
  const { supabase } = admin;
  const parsed = parseWith(postSchema, {
    title: str(fd, "title"), slug: str(fd, "slug"), excerpt: str(fd, "excerpt"), body: str(fd, "body"), category: str(fd, "category"),
    tags: splitList(fd.get("tags")), seo_title: str(fd, "seo_title"), seo_description: str(fd, "seo_description"), status: str(fd, "status"),
  });
  if (!parsed.ok) return parsed.result;
  const d = parsed.data;
  const id = str(fd, "id");
  const existing = id ? (await supabase.from("blog_posts").select("published_at").eq("id", id).limit(1)).data?.[0] : undefined;
  const row = { ...d, slug: d.slug || slugify(d.title), published_at: d.status === "published" ? (existing?.published_at ?? new Date().toISOString()) : null };
  if (id) {
    const { error } = await supabase.from("blog_posts").update(row).eq("id", id);
    if (error) return dbError(error);
    revalidatePublic();
    return { ok: true, message: d.status === "published" ? "Saved and live on the site." : "Saved as draft." };
  }
  const { data, error } = await supabase.from("blog_posts").insert(row).select("id").single();
  if (error) return dbError(error);
  revalidatePublic();
  return { ok: true, message: "Article created.", redirectTo: `/admin/blog/${data.id}` };
}

export async function deletePostAction(fd: FormData): Promise<void> {
  const admin = await getAdminOrNull();
  if (!admin) redirect("/admin/login");
  const id = str(fd, "id");
  if (!id) return;
  const { error } = await admin.supabase.from("blog_posts").delete().eq("id", id);
  if (error) throw new Error("Delete failed");
  revalidatePublic();
  redirect("/admin/blog");
}

"use server";

import { redirect } from "next/navigation";
import { getAdminOrNull } from "@/lib/auth/admin";
import { serviceSchema, splitList, type ActionResult } from "@/lib/validation/content";
import { slugify } from "@/lib/slug";
import { dbError, NOT_AUTHORISED, parseWith, revalidatePublic, str } from "../../_lib/helpers";

export async function saveServiceAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const admin = await getAdminOrNull();
  if (!admin) return NOT_AUTHORISED;
  const parsed = parseWith(serviceSchema, {
    title: str(fd, "title"), slug: str(fd, "slug"), description: str(fd, "description"), icon: str(fd, "icon"),
    target_client: str(fd, "target_client"), scope: str(fd, "scope"), pricing_note: str(fd, "pricing_note"), timeline_note: str(fd, "timeline_note"),
    deliverables: splitList(fd.get("deliverables"), /\n/), cta_label: str(fd, "cta_label"), status: str(fd, "status"), sort_order: str(fd, "sort_order") || 0,
  });
  if (!parsed.ok) return parsed.result;
  const d = parsed.data;
  const row = { ...d, slug: d.slug || slugify(d.title) };
  const id = str(fd, "id");
  if (id) {
    const { error } = await admin.supabase.from("services").update(row).eq("id", id);
    if (error) return dbError(error);
    revalidatePublic();
    return { ok: true, message: "Service saved." };
  }
  const { data, error } = await admin.supabase.from("services").insert(row).select("id").single();
  if (error) return dbError(error);
  revalidatePublic();
  return { ok: true, message: "Service created.", redirectTo: `/admin/services/${data.id}` };
}

export async function deleteServiceAction(fd: FormData): Promise<void> {
  const admin = await getAdminOrNull();
  if (!admin) redirect("/admin/login");
  const id = str(fd, "id");
  if (!id) return;
  const { error } = await admin.supabase.from("services").delete().eq("id", id);
  if (error) throw new Error("Delete failed");
  revalidatePublic();
  redirect("/admin/services");
}

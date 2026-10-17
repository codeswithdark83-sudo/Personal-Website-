"use server";

import { revalidatePath } from "next/cache";
import { getAdminOrNull } from "@/lib/auth/admin";
import { buildStoragePath, validateUpload } from "@/lib/uploads";
import type { ActionResult } from "@/lib/validation/content";
import { NOT_AUTHORISED, str } from "../../_lib/helpers";

const MAX_FILES = 10;

export async function uploadMediaAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const admin = await getAdminOrNull();
  if (!admin) return NOT_AUTHORISED;
  const files = fd.getAll("files").filter((f): f is File => f instanceof File && f.size > 0).slice(0, MAX_FILES);
  if (files.length === 0) return { ok: false, error: "Choose at least one file." };
  const alt = str(fd, "alt_text").trim().slice(0, 200) || null;

  let done = 0;
  for (const file of files) {
    const check = await validateUpload(file, "public-assets");
    if (!check.ok) return { ok: false, error: `${file.name.slice(0, 60)}: ${check.error}` };
    const path = buildStoragePath("library", check.ext);
    const up = await admin.supabase.storage.from("public-assets").upload(path, file, { contentType: check.mime, upsert: false });
    if (up.error) return { ok: false, error: "Upload failed. Please try again." };
    const row = await admin.supabase.from("media_assets").insert({ bucket: "public-assets", path, alt_text: alt, mime_type: check.mime, size_bytes: check.size });
    if (row.error) {
      await admin.supabase.storage.from("public-assets").remove([path]);
      return { ok: false, error: "Could not record the upload. Please try again." };
    }
    done += 1;
  }
  revalidatePath("/admin/media");
  return { ok: true, message: done === 1 ? "File uploaded." : `${done} files uploaded.` };
}

export async function deleteMediaAction(fd: FormData): Promise<void> {
  const admin = await getAdminOrNull();
  if (!admin) return;
  const id = str(fd, "id");
  if (!id) return;
  const found = (await admin.supabase.from("media_assets").select("bucket,path").eq("id", id).limit(1)).data?.[0];
  if (!found) return;
  const rm = await admin.supabase.storage.from(found.bucket).remove([found.path]);
  if (rm.error) throw new Error("Delete failed");
  const del = await admin.supabase.from("media_assets").delete().eq("id", id);
  if (del.error) throw new Error("Delete failed");
  revalidatePath("/admin/media");
}

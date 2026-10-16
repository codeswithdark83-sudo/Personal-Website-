"use server";

import { z } from "zod";
import { getAdminOrNull } from "@/lib/auth/admin";
import type { ActionResult } from "@/lib/validation/content";
import { dbError, NOT_AUTHORISED, parseWith, str } from "../../_lib/helpers";
import { revalidatePath } from "next/cache";
import { INQUIRY_STATUSES } from "@/lib/inquiry-status";


const updateSchema = z.object({
  id: z.uuid(),
  status: z.enum(INQUIRY_STATUSES),
  next_action: z.string().trim().max(300).transform((v) => v || null),
  follow_up_at: z.string().trim().refine((v) => v === "" || /^\d{4}-\d{2}-\d{2}$/.test(v), "Use a valid date").transform((v) => v || null),
});

export async function updateInquiryAction(_p: ActionResult, fd: FormData): Promise<ActionResult> {
  const admin = await getAdminOrNull();
  if (!admin) return NOT_AUTHORISED;
  const parsed = parseWith(updateSchema, { id: str(fd, "id"), status: str(fd, "status"), next_action: str(fd, "next_action"), follow_up_at: str(fd, "follow_up_at") });
  if (!parsed.ok) return parsed.result;
  const { id, ...patch } = parsed.data;
  const { error } = await admin.supabase.from("inquiries").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return dbError(error);
  revalidatePath("/admin/inquiries");
  return { ok: true, message: "Inquiry updated." };
}

const noteSchema = z.object({ id: z.uuid(), note: z.string().trim().min(1, "Write a note first").max(5000) });

export async function addNoteAction(_p: ActionResult, fd: FormData): Promise<ActionResult> {
  const admin = await getAdminOrNull();
  if (!admin) return NOT_AUTHORISED;
  const parsed = parseWith(noteSchema, { id: str(fd, "id"), note: str(fd, "note") });
  if (!parsed.ok) return parsed.result;
  const { error } = await admin.supabase.from("inquiry_notes").insert({ inquiry_id: parsed.data.id, note: parsed.data.note, author_id: admin.user.id });
  if (error) return dbError(error);
  revalidatePath(`/admin/inquiries/${parsed.data.id}`);
  return { ok: true, message: "Note added." };
}

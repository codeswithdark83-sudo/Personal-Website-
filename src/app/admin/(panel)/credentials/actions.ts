"use server";

import { getAdminOrNull } from "@/lib/auth/admin";
import { certificationSchema, educationSchema, experienceSchema, skillSchema, type ActionResult } from "@/lib/validation/content";
import { bool, dbError, NOT_AUTHORISED, parseWith, revalidatePublic, str } from "../../_lib/helpers";

const TABLES = ["skills", "experiences", "education", "certifications"] as const;
type T = (typeof TABLES)[number];

async function save(table: T, fd: FormData, input: Record<string, unknown>, schema: Parameters<typeof parseWith>[0]): Promise<ActionResult> {
  const admin = await getAdminOrNull();
  if (!admin) return NOT_AUTHORISED;
  const parsed = parseWith(schema, input);
  if (!parsed.ok) return parsed.result;
  const id = str(fd, "id");
  // Table names come from the fixed list above; the cast only appeases the generic client typing.
  const q = admin.supabase.from(table) as unknown as { update: (v: unknown) => { eq: (c: string, v: string) => Promise<{ error: { code?: string; message: string } | null }> }; insert: (v: unknown) => Promise<{ error: { code?: string; message: string } | null }> };
  const { error } = id ? await q.update(parsed.data).eq("id", id) : await q.insert(parsed.data);
  if (error) return dbError(error);
  revalidatePublic();
  return { ok: true, message: id ? "Saved." : "Added." };
}

const common = (fd: FormData) => ({ sort_order: str(fd, "sort_order") || 0, visible: bool(fd, "visible") });

export const saveSkillAction = async (_p: ActionResult, fd: FormData) =>
  save("skills", fd, { name: str(fd, "name"), category: str(fd, "category"), ...common(fd) }, skillSchema);
export const saveExperienceAction = async (_p: ActionResult, fd: FormData) =>
  save("experiences", fd, { role: str(fd, "role"), organization: str(fd, "organization"), description: str(fd, "description"), start_date: str(fd, "start_date"), end_date: str(fd, "end_date"), url: str(fd, "url"), ...common(fd) }, experienceSchema);
export const saveEducationAction = async (_p: ActionResult, fd: FormData) =>
  save("education", fd, { qualification: str(fd, "qualification"), institution: str(fd, "institution"), description: str(fd, "description"), start_date: str(fd, "start_date"), end_date: str(fd, "end_date"), ...common(fd) }, educationSchema);
export const saveCertificationAction = async (_p: ActionResult, fd: FormData) =>
  save("certifications", fd, { title: str(fd, "title"), issuer: str(fd, "issuer"), issued_on: str(fd, "issued_on"), expires_on: str(fd, "expires_on"), credential_id: str(fd, "credential_id"), verification_url: str(fd, "verification_url"), ...common(fd) }, certificationSchema);

export async function deleteCredentialAction(tableName: string, fd: FormData): Promise<void> {
  const admin = await getAdminOrNull();
  if (!admin) return;
  const table = tableName as T;
  const id = str(fd, "id");
  if (!TABLES.includes(table) || !id) return;
  const { error } = await admin.supabase.from(table).delete().eq("id", id);
  if (error) throw new Error("Delete failed");
  revalidatePublic();
}

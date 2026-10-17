import "server-only";
import { revalidatePath } from "next/cache";
import type { ZodType } from "zod";
import { fieldErrorsFrom, type ActionResult } from "@/lib/validation/content";

export const str = (fd: FormData, k: string) => String(fd.get(k) ?? "");
export const bool = (fd: FormData, k: string) => fd.get(k) === "on";

export function parseWith<T>(schema: ZodType<T>, input: unknown): { ok: true; data: T } | { ok: false; result: ActionResult } {
  const r = schema.safeParse(input);
  if (r.success) return { ok: true, data: r.data };
  return { ok: false, result: { ok: false, error: "Please fix the highlighted fields.", fieldErrors: fieldErrorsFrom(r.error) } };
}

/** Public pages are cached (ISR); refresh them after any content change so publish/unpublish is immediate. */
export function revalidatePublic() { revalidatePath("/", "layout"); }

export const NOT_AUTHORISED: ActionResult = { ok: false, error: "Your session has expired or you are not authorised. Please sign in again." };

/** Maps Postgres errors to friendly text without leaking internals. */
export function dbError(error: { code?: string; message: string }): ActionResult {
  if (error.code === "23505") return { ok: false, error: "That slug or name is already in use. Choose another." };
  if (error.code === "42501") return NOT_AUTHORISED;
  if (error.code === "23514") return { ok: false, error: "A value is out of the allowed range or format." };
  console.error("[admin] database error", error.code);
  return { ok: false, error: "Something went wrong saving your changes. Please try again." };
}

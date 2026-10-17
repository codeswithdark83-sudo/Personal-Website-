"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase/server";
import { clientIp, rateLimit } from "@/lib/rate-limit/memory";
import { safeAdminRedirect } from "@/lib/auth/safe-redirect";
import type { ActionResult } from "@/lib/validation/content";

const loginSchema = z.object({ email: z.string().trim().toLowerCase().email().max(254), password: z.string().min(1).max(200) });
const GENERIC = "Invalid email or password.";

export async function signInAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { ok: false, error: GENERIC };

  const ip = clientIp(await headers());
  const limit = rateLimit(`login:${ip}:${parsed.data.email}`, 5, 60_000);
  if (!limit.allowed) return { ok: false, error: `Too many attempts. Try again in ${limit.retryAfterSec} seconds.` };

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { ok: false, error: GENERIC };

  // Authenticated is not enough: the account must be on the admin allowlist.
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) {
    await supabase.auth.signOut();
    return { ok: false, error: GENERIC }; // same message: don't reveal that the account exists
  }
  return { ok: true, redirectTo: safeAdminRedirect(String(formData.get("next") ?? "")) };
}

export async function signOutAction() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

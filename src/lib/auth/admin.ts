import "server-only";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

/**
 * Verifies, on the server, that the caller has a valid Supabase session AND is on the admin allowlist.
 * `getUser()` validates the JWT with Supabase (unlike `getSession()`, which trusts the cookie).
 * Use at the top of every admin page and every server action.
 */
export async function requireAdmin() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error || !isAdmin) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=forbidden");
  }
  return { supabase, user };
}

/** Same check for server actions that must return an error object instead of redirecting. */
export async function getAdminOrNull() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: isAdmin } = await supabase.rpc("is_admin");
  return isAdmin ? { supabase, user } : null;
}

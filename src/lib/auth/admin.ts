import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

const configured = () => !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * One auth check per request, shared by the layout, the page and any server action (React `cache`).
 * `getClaims()` verifies the session token's signature (locally for asymmetric signing keys, otherwise via
 * the Auth server) — unlike `getSession()`, it never trusts the cookie blindly. The `is_admin` RPC still runs on
 * every request, so removing someone from the allowlist takes effect immediately.
 */
const loadAdmin = cache(async () => {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return { supabase, user: null, isAdmin: false };
  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  return { supabase, user: { id: claims.sub, email: typeof claims.email === "string" ? claims.email : undefined }, isAdmin: !error && isAdmin === true };
});

/** For admin pages: redirects anonymous or non-allowlisted callers to the login page. */
export async function requireAdmin() {
  // Without Supabase configured there is no way to sign in, so send visitors to the login page (which says so).
  if (!configured()) redirect("/admin/login");
  const { supabase, user, isAdmin } = await loadAdmin();
  if (!user) redirect("/admin/login");
  if (!isAdmin) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=forbidden");
  }
  return { supabase, user };
}

/** Same check for server actions that must return an error object instead of redirecting. */
export async function getAdminOrNull() {
  if (!configured()) return null;
  const { supabase, user, isAdmin } = await loadAdmin();
  return user && isAdmin ? { supabase, user } : null;
}

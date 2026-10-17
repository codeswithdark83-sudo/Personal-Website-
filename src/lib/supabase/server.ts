import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import { requireEnv } from "./env";

/** Session-aware client for admin pages and server actions (reads the auth cookies). Never cache its output. */
export async function createServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient<Database>(requireEnv("NEXT_PUBLIC_SUPABASE_URL"), requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"), {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(list) {
        try { list.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch { /* called from a Server Component; the proxy refreshes sessions */ }
      },
    },
  });
}

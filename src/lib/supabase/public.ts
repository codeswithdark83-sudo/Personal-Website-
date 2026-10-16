import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getPublicSupabaseEnv } from "./env";

/**
 * Cookie-free anonymous client for public pages. Because it carries no user session, pages that use it
 * can be statically rendered / ISR-cached; RLS limits it to published content. Null when unconfigured.
 */
export function createPublicClient() {
  const env = getPublicSupabaseEnv();
  if (!env) return null;
  return createClient<Database>(env.url, env.key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function publicAssetUrl(path: string | null | undefined): string | undefined {
  const env = getPublicSupabaseEnv();
  if (!path || !env) return undefined;
  return `${env.url}/storage/v1/object/public/public-assets/${path.split("/").map(encodeURIComponent).join("/")}`;
}

export function getPublicSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? { url, key } : null;
}

export const isSupabaseConfigured = () => getPublicSupabaseEnv() !== null;

/** Throws a setup error that names the missing variable but never prints any secret value. */
export function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required environment variable ${name}. See .env.example and the README.`);
  return v;
}

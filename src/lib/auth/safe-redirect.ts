/** Prevents open redirects: only same-site paths under /admin are accepted, everything else falls back. */
export function safeAdminRedirect(next: string | null | undefined, fallback = "/admin"): string {
  if (!next || typeof next !== "string") return fallback;
  if (!next.startsWith("/admin") || next.startsWith("//") || next.includes("\\") || /[\r\n]/.test(next)) return fallback;
  return next;
}

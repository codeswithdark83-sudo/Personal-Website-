/** URL-safe slug: lowercase ascii letters/digits separated by single hyphens (matches the DB check constraint). */
export function slugify(input: string): string {
  return input
    .normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
    .slice(0, 120).replace(/-+$/g, "");
}
export const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

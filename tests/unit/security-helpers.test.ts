import { describe, expect, it } from "vitest";
import { slugify } from "@/lib/slug";
import { safeAdminRedirect } from "@/lib/auth/safe-redirect";
import { buildStoragePath, validateUpload, MAX_IMAGE_BYTES } from "@/lib/uploads";
import { projectSchema, serviceSchema, socialLinksSchema, splitList } from "@/lib/validation/content";

const file = (bytes: number[], name = "x.png", type = "image/png", pad = 0) =>
  new File([new Uint8Array([...bytes, ...new Array(pad).fill(0)])], name, { type });
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

describe("slugify", () => {
  it("produces DB-safe slugs", () => {
    expect(slugify("  Hello, World! ")).toBe("hello-world");
    expect(slugify("Café Crème — 2026")).toBe("cafe-creme-2026");
    expect(slugify("../../etc/passwd")).toBe("etc-passwd");
    expect(slugify("!!!")).toBe("");
  });
});

describe("safeAdminRedirect (open-redirect protection)", () => {
  it("allows only /admin paths", () => {
    expect(safeAdminRedirect("/admin/projects")).toBe("/admin/projects");
    for (const bad of ["https://evil.com", "//evil.com", "/\\evil.com", "/projects", "javascript:alert(1)", "/admin\r\nSet-Cookie: x=1", "", null, undefined]) {
      expect(safeAdminRedirect(bad as string)).toBe("/admin");
    }
  });
});

describe("upload validation", () => {
  it("accepts a real PNG and reports the true type", async () => {
    expect(await validateUpload(file(PNG), "public-assets", true)).toMatchObject({ ok: true, mime: "image/png", ext: "png" });
  });
  it("rejects a file whose bytes don't match its claimed type (e.g. script renamed .png)", async () => {
    const r = await validateUpload(new File(["<script>alert(1)</script>"], "evil.png", { type: "image/png" }), "public-assets", true);
    expect(r.ok).toBe(false);
  });
  it("rejects SVG and unknown types even if the header claims an image", async () => {
    expect((await validateUpload(new File(["<svg xmlns='http://www.w3.org/2000/svg'/>"], "a.svg", { type: "image/svg+xml" }), "public-assets", true)).ok).toBe(false);
  });
  it("rejects oversized and empty files", async () => {
    expect((await validateUpload(file(PNG, "big.png", "image/png", MAX_IMAGE_BYTES), "public-assets", true)).ok).toBe(false);
    expect((await validateUpload(new File([], "e.png"), "public-assets", true)).ok).toBe(false);
  });
  it("does not allow a PDF where only images are accepted (cover images)", async () => {
    expect((await validateUpload(file([0x25, 0x50, 0x44, 0x46], "a.pdf", "application/pdf"), "public-assets", true)).ok).toBe(false);
    expect((await validateUpload(file([0x25, 0x50, 0x44, 0x46], "a.pdf", "application/pdf"), "public-assets", false)).ok).toBe(true);
  });
  it("ignores client filenames when building storage paths", () => {
    const p = buildStoragePath("../../Projects!", "png");
    expect(p).toMatch(/^projects\/[0-9a-f-]{36}\.png$/);
  });
});

describe("validation schemas", () => {
  const base = { title: "T", slug: "", summary: "", description: "", live_url: "", repository_url: "", project_type: "Web", category: "General", timeline_label: "", featured: false, status: "draft", sort_order: "0", technologies: [], problem: "", goals: "", role: "", approach: "", solution: "", architecture: "", challenges: "", outcomes: "", lessons_learned: "", blocks: [] };
  it("accepts a minimal project and normalises blanks to null", () => {
    const r = projectSchema.safeParse(base);
    expect(r.success && r.data.live_url).toBe(null);
  });
  it("rejects javascript: and data: URLs and bad slugs", () => {
    expect(projectSchema.safeParse({ ...base, live_url: "javascript:alert(1)" }).success).toBe(false);
    expect(projectSchema.safeParse({ ...base, repository_url: "data:text/html,x" }).success).toBe(false);
    expect(projectSchema.safeParse({ ...base, slug: "Bad Slug!" }).success).toBe(false);
  });
  it("rejects an invalid status and an empty title", () => {
    expect(projectSchema.safeParse({ ...base, status: "archived" }).success).toBe(false);
    expect(projectSchema.safeParse({ ...base, title: "  " }).success).toBe(false);
  });
  it("validates service icon and social links", () => {
    expect(serviceSchema.safeParse({ title: "S", slug: "", description: "", icon: "rocket", target_client: "", scope: "", pricing_note: "", timeline_note: "", deliverables: [], cta_label: "Go", status: "draft", sort_order: 0 }).success).toBe(false);
    const ok = socialLinksSchema.safeParse({ github: "https://github.com/x", linkedin: "", instagram: "", scheduling: "", email: "a@b.co", whatsapp_number: "+91 78274-86302", whatsapp_prefill: "" });
    expect(ok.success && ok.data.whatsapp_number).toBe("917827486302");
    expect(socialLinksSchema.safeParse({ github: "", linkedin: "", instagram: "", scheduling: "", email: "not-an-email", whatsapp_number: "", whatsapp_prefill: "" }).success).toBe(false);
  });
  it("splitList trims, drops blanks and de-duplicates", () => {
    expect(splitList("a, b\n\n a ,c")).toEqual(["a", "b", "c"]);
  });
});

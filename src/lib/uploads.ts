// Upload validation. The browser-supplied MIME type is never trusted: the file's leading bytes must match.
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;

type Kind = { mime: string; ext: string; match: (b: Uint8Array) => boolean };
const startsWith = (b: Uint8Array, sig: number[], offset = 0) => sig.every((v, i) => b[offset + i] === v);

export const ALLOWED_PUBLIC: Kind[] = [
  { mime: "image/png", ext: "png", match: (b) => startsWith(b, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]) },
  { mime: "image/jpeg", ext: "jpg", match: (b) => startsWith(b, [0xff, 0xd8, 0xff]) },
  { mime: "image/webp", ext: "webp", match: (b) => startsWith(b, [0x52, 0x49, 0x46, 0x46]) && startsWith(b, [0x57, 0x45, 0x42, 0x50], 8) },
  { mime: "application/pdf", ext: "pdf", match: (b) => startsWith(b, [0x25, 0x50, 0x44, 0x46]) },
];
export const ALLOWED_PRIVATE: Kind[] = ALLOWED_PUBLIC.filter((k) => k.mime !== "image/webp");

export type UploadCheck = { ok: true; mime: string; ext: string; size: number } | { ok: false; error: string };

export async function validateUpload(file: File, bucket: "public-assets" | "private-documents", imagesOnly = false): Promise<UploadCheck> {
  if (!file || file.size === 0) return { ok: false, error: "Choose a file to upload." };
  const limit = imagesOnly || bucket === "public-assets" ? MAX_IMAGE_BYTES : MAX_DOCUMENT_BYTES;
  if (file.size > limit) return { ok: false, error: `File is too large (max ${Math.round(limit / 1024 / 1024)} MB).` };
  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const allowed = (bucket === "public-assets" ? ALLOWED_PUBLIC : ALLOWED_PRIVATE).filter((k) => !imagesOnly || k.mime.startsWith("image/"));
  const kind = allowed.find((k) => k.match(head));
  if (!kind) return { ok: false, error: imagesOnly ? "Unsupported file. Use PNG, JPEG or WebP images." : "Unsupported file type." };
  return { ok: true, mime: kind.mime, ext: kind.ext, size: file.size };
}

/** Server-generated path: the client-supplied filename is never used, so no traversal or overwrite tricks. */
export function buildStoragePath(folder: string, ext: string): string {
  const safeFolder = folder.replace(/[^a-z0-9-]/gi, "").toLowerCase() || "misc";
  return `${safeFolder}/${crypto.randomUUID()}.${ext}`;
}

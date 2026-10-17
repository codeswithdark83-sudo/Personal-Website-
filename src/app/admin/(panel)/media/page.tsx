import { FileText } from "lucide-react";
import { requireAdmin } from "@/lib/auth/admin";
import { ActionForm, DeleteButton, Field, SubmitButton } from "@/components/admin/form-kit";
import { deleteMediaAction, uploadMediaAction } from "./actions";

export const metadata = { title: "Media library" };
const kb = (n: number) => (n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

export default async function MediaPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("media_assets").select("*").eq("bucket", "public-assets").order("created_at", { ascending: false }).limit(200);
  if (error) throw new Error("Failed to load media");
  const url = (path: string) => supabase.storage.from("public-assets").getPublicUrl(path).data.publicUrl;

  return (
    <div className="space-y-8">
      <div><h1 className="text-2xl font-semibold sm:text-3xl">Media library</h1><p className="mt-1 text-sm text-muted">Images and PDFs you upload here are public. Copy a link to use it in Markdown or as a resume link.</p></div>

      <section className="rounded-xl border border-border bg-surface p-5" aria-label="Upload">
        <ActionForm action={uploadMediaAction} resetOnSuccess className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <Field name="files" label="Files" type="file" hint="PNG, JPEG, WebP or PDF, up to 5 MB each, 10 at a time." />
          <Field name="alt_text" label="Description (alt text)" maxLength={200} hint="Describe the image for screen readers." />
          <SubmitButton>Upload</SubmitButton>
        </ActionForm>
      </section>

      {data.length === 0 ? <p className="rounded-xl border border-border bg-surface p-6 text-sm text-muted">Nothing uploaded yet.</p> : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((m) => (
            <li key={m.id} className="min-w-0 space-y-3 rounded-xl border border-border bg-surface p-4">
              <div className="grid h-36 place-items-center overflow-hidden rounded-lg bg-elevated">
                {m.mime_type.startsWith("image/")
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={url(m.path)} alt={m.alt_text ?? ""} loading="lazy" className="size-full object-cover" />
                  : <FileText className="size-10 text-muted" aria-hidden />}
              </div>
              <p className="text-xs text-muted">{m.mime_type} · {kb(m.size_bytes)}{m.alt_text ? ` · ${m.alt_text}` : ""}</p>
              <label className="sr-only" htmlFor={`u-${m.id}`}>Public link</label>
              <input id={`u-${m.id}`} readOnly value={url(m.path)} className="min-h-11 w-full rounded-lg border border-border bg-background px-3 font-mono text-xs" />
              <DeleteButton action={deleteMediaAction} id={m.id} what="this file" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

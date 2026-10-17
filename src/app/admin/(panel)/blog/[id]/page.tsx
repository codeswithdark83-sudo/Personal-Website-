import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { ActionForm, DeleteButton, Field, SubmitButton } from "@/components/admin/form-kit";
import { deletePostAction, savePostAction } from "../actions";

export const metadata = { title: "Edit article" };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const isNew = id === "new";
  if (!isNew && !UUID.test(id)) notFound();
  const p = isNew ? null : (await supabase.from("blog_posts").select("*").eq("id", id).limit(1)).data?.[0] ?? null;
  if (!isNew && !p) notFound();
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/blog" className="text-sm text-muted hover:text-foreground">← All articles</Link>
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">{p ? p.title : "New article"}</h1>
        {p?.status === "published" && <Link href={`/blog/${p.slug}`} target="_blank" className="mt-1 inline-block text-sm text-accent">View live page ↗</Link>}
      </div>
      <ActionForm action={savePostAction} className="space-y-6">
        {p && <input type="hidden" name="id" value={p.id} />}
        <section className="grid gap-4 rounded-xl border border-border bg-surface p-5 sm:grid-cols-2">
          <Field name="title" label="Title" required defaultValue={p?.title} className="sm:col-span-2" />
          <Field name="slug" label="URL slug" defaultValue={p?.slug} hint="Leave empty to create from the title." mono />
          <Field name="category" label="Category" required defaultValue={p?.category ?? "General"} />
          <Field name="excerpt" label="Excerpt" as="textarea" rows={2} defaultValue={p?.excerpt} className="sm:col-span-2" />
          <Field name="body" label="Article (Markdown)" as="textarea" rows={16} defaultValue={p?.body} mono className="sm:col-span-2" />
          <Field name="tags" label="Tags" defaultValue={p?.tags.join(", ")} hint="Comma separated." className="sm:col-span-2" />
          <Field name="seo_title" label="SEO title" defaultValue={p?.seo_title} maxLength={70} />
          <Field name="seo_description" label="SEO description" defaultValue={p?.seo_description} maxLength={170} />
          <Field name="status" label="Status" as="select" defaultValue={p?.status ?? "draft"} options={[{ value: "draft", label: "Draft (hidden)" }, { value: "published", label: "Published (live)" }]} />
        </section>
        <SubmitButton>{p ? "Save changes" : "Create article"}</SubmitButton>
      </ActionForm>
      {p && <div className="border-t border-border pt-6"><DeleteButton action={deletePostAction} id={p.id} what="this article" /></div>}
    </div>
  );
}

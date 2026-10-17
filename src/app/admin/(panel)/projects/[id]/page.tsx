import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { BlocksEditor, Checkbox, DeleteButton, Field, SubmitButton, ActionForm } from "@/components/admin/form-kit";
import { deleteProjectAction, saveProjectAction } from "../actions";

export const metadata = { title: "Edit project" };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const isNew = id === "new";
  if (!isNew && !UUID.test(id)) notFound();

  const p = isNew ? null : (await supabase.from("projects").select("*").eq("id", id).limit(1)).data?.[0] ?? null;
  if (!isNew && !p) notFound();
  const cs = p ? (await supabase.from("case_studies").select("*").eq("project_id", p.id).limit(1)).data?.[0] ?? null : null;
  let techs: string[] = [];
  if (p) {
    const links = (await supabase.from("project_technologies").select("technology_id").eq("project_id", p.id)).data ?? [];
    if (links.length) techs = ((await supabase.from("technologies").select("name").in("id", links.map((l) => l.technology_id))).data ?? []).map((t) => t.name);
  }
  const blocks = Array.isArray(cs?.content_blocks) ? (cs!.content_blocks as { id?: string; title: string; body: string }[]) : [];
  const coverUrl = p?.cover_image_path ? supabase.storage.from("public-assets").getPublicUrl(p.cover_image_path).data.publicUrl : null;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/projects" className="text-sm text-muted hover:text-foreground">← All projects</Link>
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">{p ? p.title : "New project"}</h1>
        {p && <div className="mt-1 flex flex-wrap gap-4 text-sm"><Link href={`/admin/preview/projects/${p.id}`} className="text-accent">Preview</Link>{p.status === "published" && <Link href={`/projects/${p.slug}`} target="_blank" className="text-accent">View live page ↗</Link>}</div>}
      </div>

      <ActionForm action={saveProjectAction} className="space-y-8">
        {p && <input type="hidden" name="id" value={p.id} />}
        <section className="grid gap-4 rounded-xl border border-border bg-surface p-5 sm:grid-cols-2" aria-label="Basics">
          <Field name="title" label="Title" required defaultValue={p?.title} maxLength={160} />
          <Field name="slug" label="URL slug" defaultValue={p?.slug} hint="Leave empty to create from the title." mono />
          <Field name="summary" label="Short summary" as="textarea" rows={2} defaultValue={p?.summary} maxLength={500} className="sm:col-span-2" />
          <Field name="description" label="Description (Markdown)" as="textarea" rows={6} defaultValue={p?.description} className="sm:col-span-2" />
          <Field name="project_type" label="Project type" required defaultValue={p?.project_type ?? "Web application"} />
          <Field name="category" label="Category" required defaultValue={p?.category ?? "Full stack"} />
          <Field name="live_url" label="Live URL" type="url" defaultValue={p?.live_url} placeholder="https://" />
          <Field name="repository_url" label="Repository URL" type="url" defaultValue={p?.repository_url} placeholder="https://github.com/…" />
          <Field name="timeline_label" label="Timeline" defaultValue={p?.timeline_label} hint="e.g. “3 weeks”. Leave empty if unknown." />
          <Field name="sort_order" label="Sort order" type="number" defaultValue={p?.sort_order ?? 0} hint="Lower numbers appear first." />
          <Field name="technologies" label="Technologies" as="textarea" rows={2} defaultValue={techs.join(", ")} hint="Comma or line separated." className="sm:col-span-2" />
        </section>

        <section className="space-y-4 rounded-xl border border-border bg-surface p-5" aria-label="Cover image">
          <h2 className="text-lg font-semibold">Cover image</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {coverUrl && <img src={coverUrl} alt="Current cover" className="max-h-48 rounded-lg border border-border" />}
          <Field name="cover" label="Upload new image" type="file" hint="PNG, JPEG or WebP, up to 5 MB." />
          {coverUrl && <Checkbox name="remove_cover" label="Remove current cover" />}
        </section>

        <section className="grid gap-4 rounded-xl border border-border bg-surface p-5" aria-label="Case study">
          <div><h2 className="text-lg font-semibold">Case study</h2><p className="text-sm text-muted">Optional. Only fill what is true; empty sections are hidden on the public page.</p></div>
          {([["problem", "Problem"], ["goals", "Goals"], ["role", "My role"], ["approach", "Approach"], ["solution", "Solution"], ["architecture", "Architecture"], ["challenges", "Challenges"], ["outcomes", "Outcomes"], ["lessons_learned", "Lessons learned"]] as const).map(([k, l]) => (
            <Field key={k} name={k} label={`${l} (Markdown)`} as="textarea" rows={4} defaultValue={cs?.[k]} />
          ))}
          <div><h3 className="mb-3 text-base font-semibold">Extra sections</h3><BlocksEditor name="blocks" initial={blocks} /></div>
        </section>

        <section className="flex flex-wrap items-end gap-4 rounded-xl border border-border bg-surface p-5" aria-label="Publishing">
          <Field name="status" label="Status" as="select" defaultValue={p?.status ?? "draft"} options={[{ value: "draft", label: "Draft (hidden)" }, { value: "published", label: "Published (live)" }]} />
          <Checkbox name="featured" label="Show on home page" defaultChecked={p?.featured} />
        </section>

        <div className="flex flex-wrap gap-3"><SubmitButton>{p ? "Save changes" : "Create project"}</SubmitButton></div>
      </ActionForm>

      {p && <div className="border-t border-border pt-6"><DeleteButton action={deleteProjectAction} id={p.id} what="this project" /></div>}
    </div>
  );
}

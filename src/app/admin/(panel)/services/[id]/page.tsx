import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { ActionForm, DeleteButton, Field, SubmitButton } from "@/components/admin/form-kit";
import { deleteServiceAction, saveServiceAction } from "../actions";

export const metadata = { title: "Edit service" };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const icons = ["monitor", "code", "layers", "cart", "plug", "wrench"].map((v) => ({ value: v, label: v }));

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const isNew = id === "new";
  if (!isNew && !UUID.test(id)) notFound();
  const s = isNew ? null : (await supabase.from("services").select("*").eq("id", id).limit(1)).data?.[0] ?? null;
  if (!isNew && !s) notFound();
  return (
    <div className="space-y-6">
      <div><Link href="/admin/services" className="text-sm text-muted hover:text-foreground">← All services</Link><h1 className="mt-2 text-2xl font-semibold sm:text-3xl">{s ? s.title : "New service"}</h1></div>
      <ActionForm action={saveServiceAction} className="space-y-6">
        {s && <input type="hidden" name="id" value={s.id} />}
        <section className="grid gap-4 rounded-xl border border-border bg-surface p-5 sm:grid-cols-2">
          <Field name="title" label="Title" required defaultValue={s?.title} />
          <Field name="slug" label="URL slug" defaultValue={s?.slug} hint="Leave empty to create from the title." mono />
          <Field name="description" label="Description" as="textarea" rows={3} defaultValue={s?.description} className="sm:col-span-2" />
          <Field name="icon" label="Icon" as="select" defaultValue={s?.icon ?? "code"} options={icons} />
          <Field name="cta_label" label="Button label" required defaultValue={s?.cta_label ?? "Get a quote"} />
          <Field name="target_client" label="Who it is for" defaultValue={s?.target_client} />
          <Field name="timeline_note" label="Timeline note" defaultValue={s?.timeline_note} hint="Leave empty if unknown." />
          <Field name="pricing_note" label="Pricing note" defaultValue={s?.pricing_note} hint="No invented prices; leave empty if unsure." className="sm:col-span-2" />
          <Field name="scope" label="Scope" as="textarea" rows={4} defaultValue={s?.scope} className="sm:col-span-2" />
          <Field name="deliverables" label="Deliverables" as="textarea" rows={4} defaultValue={s?.deliverables.join("\n")} hint="One per line." className="sm:col-span-2" />
          <Field name="sort_order" label="Sort order" type="number" defaultValue={s?.sort_order ?? 0} />
          <Field name="status" label="Status" as="select" defaultValue={s?.status ?? "draft"} options={[{ value: "draft", label: "Draft (hidden)" }, { value: "published", label: "Published (live)" }]} />
        </section>
        <SubmitButton>{s ? "Save changes" : "Create service"}</SubmitButton>
      </ActionForm>
      {s && <div className="border-t border-border pt-6"><DeleteButton action={deleteServiceAction} id={s.id} what="this service" /></div>}
    </div>
  );
}

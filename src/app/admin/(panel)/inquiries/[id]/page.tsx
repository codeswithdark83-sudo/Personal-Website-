import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { ActionForm, Field, SubmitButton } from "@/components/admin/form-kit";
import { INQUIRY_STATUSES } from "@/lib/inquiry-status";
import { addNoteAction, updateInquiryAction } from "../actions";

export const metadata = { title: "Inquiry" };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function InquiryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const { supabase } = await requireAdmin();
  const i = (await supabase.from("inquiries").select("*").eq("id", id).limit(1)).data?.[0];
  if (!i) notFound();
  const notes = (await supabase.from("inquiry_notes").select("id,note,created_at").eq("inquiry_id", id).order("created_at", { ascending: false })).data ?? [];
  const rows: [string, string | null][] = [["Email", i.email], ["Company", i.company], ["Phone", i.phone], ["Project type", i.project_type], ["Project name", i.project_title], ["Budget", i.budget_range], ["Timeline", i.timeline], ["Prefers", i.preferred_contact], ["Received", new Date(i.created_at).toLocaleString("en-IN")], ["Email alert", i.email_notification]];
  return (
    <div className="space-y-6">
      <div><Link href="/admin/inquiries" className="text-sm text-muted hover:text-foreground">← All inquiries</Link><h1 className="mt-2 text-2xl font-semibold sm:text-3xl">{i.name}</h1></div>
      <section className="rounded-xl border border-border bg-surface p-5" aria-label="Details">
        <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          {rows.filter(([, v]) => v).map(([k, v]) => <div key={k} className="min-w-0"><dt className="text-muted">{k}</dt><dd className="break-words">{k === "Email" ? <a className="text-accent" href={`mailto:${v}`}>{v}</a> : v}</dd></div>)}
        </dl>
        <h2 className="mt-5 text-sm text-muted">Brief</h2>
        <p className="mt-1 whitespace-pre-wrap break-words text-sm">{i.brief}</p>
      </section>
      <ActionForm action={updateInquiryAction} className="grid gap-4 rounded-xl border border-border bg-surface p-5 sm:grid-cols-2">
        <input type="hidden" name="id" value={i.id} />
        <Field name="status" label="Status" as="select" defaultValue={i.status} options={INQUIRY_STATUSES.map((s) => ({ value: s, label: s.replace("_", " ") }))} />
        <Field name="follow_up_at" label="Follow up on" type="date" defaultValue={i.follow_up_at} />
        <Field name="next_action" label="Next action" defaultValue={i.next_action} maxLength={300} className="sm:col-span-2" />
        <div className="sm:col-span-2"><SubmitButton>Save</SubmitButton></div>
      </ActionForm>
      <section className="space-y-4 rounded-xl border border-border bg-surface p-5" aria-label="Private notes">
        <h2 className="text-lg font-semibold">Private notes</h2>
        <ActionForm action={addNoteAction} resetOnSuccess className="space-y-3">
          <input type="hidden" name="id" value={i.id} />
          <Field name="note" label="Add a note" as="textarea" rows={3} maxLength={5000} />
          <SubmitButton variant="secondary">Add note</SubmitButton>
        </ActionForm>
        {notes.length === 0 ? <p className="text-sm text-muted">No notes yet.</p> : (
          <ul className="space-y-3">{notes.map((n) => <li key={n.id} className="rounded-lg bg-elevated p-3 text-sm"><p className="whitespace-pre-wrap break-words">{n.note}</p><p className="mt-1 text-xs text-muted">{new Date(n.created_at).toLocaleString("en-IN")}</p></li>)}</ul>
        )}
      </section>
    </div>
  );
}

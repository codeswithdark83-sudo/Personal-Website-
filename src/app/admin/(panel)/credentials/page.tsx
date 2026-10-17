import { requireAdmin } from "@/lib/auth/admin";
import { ActionForm, Checkbox, DeleteButton, Field, SubmitButton } from "@/components/admin/form-kit";
import {
  deleteCredentialAction, saveCertificationAction, saveEducationAction, saveExperienceAction, saveSkillAction,
} from "./actions";

export const metadata = { title: "Credentials & skills" };

type Row = Record<string, unknown> & { id?: string };
const v = (r: Row | undefined, k: string) => (r?.[k] as string | number | null | undefined) ?? "";

function Shell({ title, summary, children, open }: { title: string; summary?: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details open={open} className="rounded-xl border border-border bg-surface">
      <summary className="flex min-h-12 cursor-pointer items-center justify-between gap-3 px-4 py-2 text-sm font-medium"><span className="truncate">{title}</span>{summary && <span className="truncate text-xs font-normal text-muted">{summary}</span>}</summary>
      <div className="border-t border-border p-4">{children}</div>
    </details>
  );
}

function Common({ r }: { r?: Row }) {
  return (<>
    <Field name="sort_order" label="Sort order" type="number" defaultValue={r ? Number(r.sort_order) : 0} />
    <Checkbox name="visible" label="Visible on site" defaultChecked={r ? Boolean(r.visible) : true} />
  </>);
}

function SkillFields({ r }: { r?: Row }) {
  return (<><Field name="name" label="Skill" required defaultValue={v(r, "name")} /><Field name="category" label="Category" required defaultValue={v(r, "category")} hint="e.g. Frontend, Backend, Database, Tools" /><Common r={r} /></>);
}
function ExperienceFields({ r }: { r?: Row }) {
  return (<><Field name="role" label="Role" required defaultValue={v(r, "role")} /><Field name="organization" label="Organization" required defaultValue={v(r, "organization")} />
    <Field name="start_date" label="Start (YYYY-MM-DD)" defaultValue={v(r, "start_date")} /><Field name="end_date" label="End (YYYY-MM-DD)" defaultValue={v(r, "end_date")} hint="Empty = current." />
    <Field name="url" label="Link" type="url" defaultValue={v(r, "url")} /><Field name="description" label="Description" as="textarea" rows={3} defaultValue={v(r, "description")} className="sm:col-span-2" /><Common r={r} /></>);
}
function EducationFields({ r }: { r?: Row }) {
  return (<><Field name="qualification" label="Qualification" required defaultValue={v(r, "qualification")} /><Field name="institution" label="Institution" required defaultValue={v(r, "institution")} />
    <Field name="start_date" label="Start (YYYY-MM-DD)" defaultValue={v(r, "start_date")} /><Field name="end_date" label="End (YYYY-MM-DD)" defaultValue={v(r, "end_date")} />
    <Field name="description" label="Description" as="textarea" rows={3} defaultValue={v(r, "description")} className="sm:col-span-2" /><Common r={r} /></>);
}
function CertFields({ r }: { r?: Row }) {
  return (<><Field name="title" label="Title" required defaultValue={v(r, "title")} /><Field name="issuer" label="Issuer" required defaultValue={v(r, "issuer")} />
    <Field name="issued_on" label="Issued (YYYY-MM-DD)" defaultValue={v(r, "issued_on")} /><Field name="expires_on" label="Expires (YYYY-MM-DD)" defaultValue={v(r, "expires_on")} />
    <Field name="credential_id" label="Credential ID" defaultValue={v(r, "credential_id")} /><Field name="verification_url" label="Verification URL" type="url" defaultValue={v(r, "verification_url")} /><Common r={r} /></>);
}

type Cfg = { table: "skills" | "experiences" | "education" | "certifications"; heading: string; note?: string; action: Parameters<typeof ActionForm>[0]["action"]; Fields: (p: { r?: Row }) => React.JSX.Element; label: (r: Row) => string; sub: (r: Row) => string };
const sections: Cfg[] = [
  { table: "skills", heading: "Skills", note: "Only list skills you can stand behind.", action: saveSkillAction, Fields: SkillFields, label: (r) => String(r.name), sub: (r) => String(r.category) },
  { table: "experiences", heading: "Experience", note: "Employment, internships, freelance. Add only what is real.", action: saveExperienceAction, Fields: ExperienceFields, label: (r) => `${r.role}`, sub: (r) => String(r.organization) },
  { table: "education", heading: "Education", action: saveEducationAction, Fields: EducationFields, label: (r) => String(r.qualification), sub: (r) => String(r.institution) },
  { table: "certifications", heading: "Certifications", note: "Add only verifiable certifications.", action: saveCertificationAction, Fields: CertFields, label: (r) => String(r.title), sub: (r) => String(r.issuer) },
];

export default async function CredentialsAdminPage() {
  const { supabase } = await requireAdmin();
  const data = await Promise.all(sections.map(async (s) => {
    const { data, error } = await supabase.from(s.table).select("*").order("sort_order");
    if (error) throw new Error(`Failed to load ${s.table}`);
    return data as Row[];
  }));
  return (
    <div className="space-y-10">
      <div><h1 className="text-2xl font-semibold sm:text-3xl">Credentials & skills</h1><p className="mt-1 text-sm text-muted">Open an item to edit it. Nothing is shown publicly unless “Visible” is ticked.</p></div>
      {sections.map((s, i) => (
        <section key={s.table} className="space-y-3" aria-labelledby={`h-${s.table}`}>
          <div><h2 id={`h-${s.table}`} className="text-xl font-semibold">{s.heading}</h2>{s.note && <p className="text-sm text-muted">{s.note}</p>}</div>
          {data[i]!.length === 0 && <p className="text-sm text-muted">Nothing added yet.</p>}
          {data[i]!.map((r) => (
            <Shell key={String(r.id)} title={s.label(r)} summary={`${s.sub(r)}${r.visible ? "" : " · hidden"}`}>
              <ActionForm action={s.action} className="grid gap-4 sm:grid-cols-2">
                <input type="hidden" name="id" value={String(r.id)} />
                <s.Fields r={r} />
                <div className="sm:col-span-2"><SubmitButton>Save</SubmitButton></div>
              </ActionForm>
              <div className="mt-4 border-t border-border pt-4"><DeleteButton action={deleteCredentialAction.bind(null, s.table)} id={String(r.id)} what="this item" /></div>
            </Shell>
          ))}
          <Shell title={`+ Add ${s.heading.toLowerCase()}`}>
            <ActionForm action={s.action} resetOnSuccess className="grid gap-4 sm:grid-cols-2"><s.Fields /><div className="sm:col-span-2"><SubmitButton>Add</SubmitButton></div></ActionForm>
          </Shell>
        </section>
      ))}
    </div>
  );
}

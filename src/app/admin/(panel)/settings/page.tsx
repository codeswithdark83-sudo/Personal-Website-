import { requireAdmin } from "@/lib/auth/admin";
import { ActionForm, Field, SubmitButton } from "@/components/admin/form-kit";
import { saveContactAction, saveProfileAction } from "./actions";

export const metadata = { title: "Profile & contact" };

export default async function SettingsPage() {
  const { supabase } = await requireAdmin();
  const profile = (await supabase.from("profiles").select("*").limit(1)).data?.[0];
  const links = (await supabase.from("social_links").select("platform,url")).data ?? [];
  const link = (p: string) => links.find((l) => l.platform === p)?.url ?? "";
  const contact = (await supabase.from("site_settings").select("value").eq("key", "contact").limit(1)).data?.[0]?.value;
  const c = contact && typeof contact === "object" && !Array.isArray(contact) ? contact : {};
  const s = (v: unknown) => (typeof v === "string" ? v : "");
  return (
    <div className="space-y-10">
      <div><h1 className="text-2xl font-semibold sm:text-3xl">Profile & contact</h1><p className="mt-1 text-sm text-muted">Shown across the public site.</p></div>

      <ActionForm action={saveProfileAction} className="space-y-4">
        <section className="grid gap-4 rounded-xl border border-border bg-surface p-5 sm:grid-cols-2" aria-label="Profile">
          <h2 className="text-lg font-semibold sm:col-span-2">Profile</h2>
          <Field name="display_name" label="Display name" required defaultValue={profile?.display_name} />
          <Field name="location_label" label="Location" defaultValue={profile?.location_label} />
          <Field name="headline" label="Headline" defaultValue={profile?.headline} className="sm:col-span-2" />
          <Field name="bio" label="Bio" as="textarea" rows={5} defaultValue={profile?.bio} className="sm:col-span-2" />
          <Field name="availability_status" label="Availability" as="select" defaultValue={profile?.availability_status ?? "available"}
            options={[{ value: "available", label: "Available for work" }, { value: "limited", label: "Limited availability" }, { value: "unavailable", label: "Not available" }]} />
        </section>
        <SubmitButton>Save profile</SubmitButton>
      </ActionForm>

      <ActionForm action={saveContactAction} className="space-y-4">
        <section className="grid gap-4 rounded-xl border border-border bg-surface p-5 sm:grid-cols-2" aria-label="Contact">
          <h2 className="text-lg font-semibold sm:col-span-2">Contact & social links</h2>
          <Field name="email" label="Email" type="email" defaultValue={s(c.email)} />
          <Field name="whatsapp_number" label="WhatsApp number" defaultValue={s(c.whatsapp_number)} hint="With country code, e.g. +91 …" />
          <Field name="whatsapp_prefill" label="WhatsApp starter message" defaultValue={s(c.whatsapp_prefill)} className="sm:col-span-2" />
          <Field name="github" label="GitHub" type="url" defaultValue={link("github")} />
          <Field name="linkedin" label="LinkedIn" type="url" defaultValue={link("linkedin")} />
          <Field name="instagram" label="Instagram" type="url" defaultValue={link("instagram")} />
          <Field name="scheduling" label="Booking link (optional)" type="url" defaultValue={link("scheduling")} />
        </section>
        <SubmitButton>Save contact details</SubmitButton>
      </ActionForm>
    </div>
  );
}

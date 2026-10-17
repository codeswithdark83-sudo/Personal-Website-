"use server";

import { getAdminOrNull } from "@/lib/auth/admin";
import { profileSchema, socialLinksSchema, type ActionResult } from "@/lib/validation/content";
import { dbError, NOT_AUTHORISED, parseWith, revalidatePublic, str } from "../../_lib/helpers";

export async function saveProfileAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const admin = await getAdminOrNull();
  if (!admin) return NOT_AUTHORISED;
  const parsed = parseWith(profileSchema, {
    display_name: str(fd, "display_name"), headline: str(fd, "headline"), bio: str(fd, "bio"),
    location_label: str(fd, "location_label"), availability_status: str(fd, "availability_status"),
  });
  if (!parsed.ok) return parsed.result;
  const { supabase } = admin;
  const existing = (await supabase.from("profiles").select("id").limit(1)).data?.[0];
  const { error } = existing
    ? await supabase.from("profiles").update(parsed.data).eq("id", existing.id)
    : await supabase.from("profiles").insert(parsed.data);
  if (error) return dbError(error);
  revalidatePublic();
  return { ok: true, message: "Profile saved." };
}

export async function saveContactAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const admin = await getAdminOrNull();
  if (!admin) return NOT_AUTHORISED;
  const parsed = parseWith(socialLinksSchema, {
    github: str(fd, "github"), linkedin: str(fd, "linkedin"), instagram: str(fd, "instagram"), scheduling: str(fd, "scheduling"),
    email: str(fd, "email"), whatsapp_number: str(fd, "whatsapp_number"), whatsapp_prefill: str(fd, "whatsapp_prefill"),
  });
  if (!parsed.ok) return parsed.result;
  const d = parsed.data;
  const { supabase } = admin;

  const wanted: { platform: "github" | "linkedin" | "instagram" | "scheduling" | "email" | "whatsapp"; url: string | null; sort: number }[] = [
    { platform: "github", url: d.github, sort: 10 }, { platform: "linkedin", url: d.linkedin, sort: 20 },
    { platform: "instagram", url: d.instagram, sort: 30 }, { platform: "whatsapp", url: d.whatsapp_number ? `https://wa.me/${d.whatsapp_number}` : null, sort: 40 },
    { platform: "email", url: d.email ? `mailto:${d.email}` : null, sort: 50 }, { platform: "scheduling", url: d.scheduling, sort: 60 },
  ];
  for (const w of wanted) {
    const { error } = w.url
      ? await supabase.from("social_links").upsert({ platform: w.platform, url: w.url, visible: true, sort_order: w.sort }, { onConflict: "platform" })
      : await supabase.from("social_links").delete().eq("platform", w.platform);
    if (error) return dbError(error);
  }
  const { error } = await supabase.from("site_settings").upsert(
    { key: "contact", value: { email: d.email ?? "", whatsapp_number: d.whatsapp_number ?? "", whatsapp_prefill: d.whatsapp_prefill ?? "" }, is_public: true },
    { onConflict: "key" });
  if (error) return dbError(error);
  revalidatePublic();
  return { ok: true, message: "Contact details saved." };
}

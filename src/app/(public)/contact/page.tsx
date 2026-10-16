import type { Metadata } from "next";
import { Mail, MessageCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { InquiryWizard } from "@/components/contact/inquiry-wizard";
import { SocialLinks } from "@/components/layout/social-links";
import { getContactSettings, getSocialLinks } from "@/lib/content";

export const metadata: Metadata = { title: "Contact", description: "Tell me about your project and I will get back to you.", alternates: { canonical: "/contact" } };
export const revalidate = 300;

export default async function ContactPage() {
  const [contact, links] = await Promise.all([getContactSettings(), getSocialLinks()]);
  const wa = contact.whatsappNumber ? `https://wa.me/${contact.whatsappNumber}${contact.whatsappPrefill ? `?text=${encodeURIComponent(contact.whatsappPrefill)}` : ""}` : null;
  return (
    <>
      <PageHeader title="Get In Touch" description="Have a project in mind? Tell me a little about it and I will reply personally." />
      <div className="container-page grid gap-8 pb-16 lg:grid-cols-[1fr_20rem]">
        <InquiryWizard />
        <aside className="space-y-4" aria-label="Other ways to reach me">
          <div className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="text-lg font-semibold">Prefer to message directly?</h2>
            <ul className="mt-3 space-y-3 text-sm">
              {contact.email && <li><a className="flex min-h-11 items-center gap-2 hover:text-accent" href={`mailto:${contact.email}`}><Mail className="size-4" aria-hidden />{contact.email}</a></li>}
              {wa && <li><a className="flex min-h-11 items-center gap-2 hover:text-accent" href={wa} target="_blank" rel="noopener noreferrer"><MessageCircle className="size-4" aria-hidden />WhatsApp</a></li>}
            </ul>
          </div>
          <SocialLinks links={links} />
        </aside>
      </div>
    </>
  );
}

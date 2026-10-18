import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { ArrowUpRight, Mail } from "lucide-react";
import { CoffeeButton } from "@/components/ui/coffee-button";
import { PageHeader } from "@/components/layout/page-header";
import { InquiryWizard } from "@/components/contact/inquiry-wizard";
import { GithubIcon, InstagramIcon, LinkedinIcon, WhatsappIcon } from "@/components/ui/brand-icons";
import { getContactSettings, getSocialLinks } from "@/lib/content";

export const metadata: Metadata = pageMetadata({ title: "Contact", description: "Tell me about your project and I will get back to you.", path: "/contact" });
export const revalidate = 300;

const channels = {
  email: { icon: Mail, title: "Email", hint: "Send me an email" },
  whatsapp: { icon: WhatsappIcon, title: "WhatsApp", hint: "Chat on WhatsApp" },
  linkedin: { icon: LinkedinIcon, title: "LinkedIn", hint: "Connect with me" },
  github: { icon: GithubIcon, title: "GitHub", hint: "View my repositories" },
  instagram: { icon: InstagramIcon, title: "Instagram", hint: "Follow me" },
} as const;

export default async function ContactPage() {
  const [contact, links] = await Promise.all([getContactSettings(), getSocialLinks()]);
  const cards = (Object.keys(channels) as (keyof typeof channels)[]).flatMap((k) => {
    const l = links.find((x) => x.platform === k);
    return l ? [{ ...l, ...channels[k] }] : [];
  });
  return (
    <>
      <PageHeader title="Get In Touch" description="Have a project in mind or just want to say hello? I'd love to hear from you. Reach out through any of the channels below." />
      <div className="container-page space-y-10 py-10">
        {cards.length > 0 && (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Contact channels">
            {cards.map(({ platform, url, icon: Icon, title, hint }) => (
              <li key={platform} className="min-w-0">
                <a href={url} target={platform === "email" ? undefined : "_blank"} rel="noopener noreferrer" className="flex min-h-20 items-center gap-4 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent/60">
                  <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-accent-strong/15 text-accent"><Icon className="size-5" /></span>
                  <span className="min-w-0 flex-1"><span className="block font-medium">{title}</span><span className="block truncate text-sm text-muted">{platform === "email" ? contact.email || hint : hint}</span></span>
                  <ArrowUpRight className="size-4 shrink-0 text-muted" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        )}
        <section aria-labelledby="form-title" className="mx-auto max-w-3xl">
          <h2 id="form-title" className="mb-1 text-xl font-semibold">Or send me a message</h2>
          <p className="mb-5 text-sm text-muted">Fill out the form below and I&apos;ll get back to you as soon as possible.</p>
          <InquiryWizard />
        </section>
        <p className="flex flex-col items-center gap-3 text-center text-sm text-muted">Enjoying my work? You can support it with a coffee.<CoffeeButton /></p>
      </div>
    </>
  );
}

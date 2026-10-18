import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { Check } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { ServiceIcon } from "@/components/services/service-icon";
import { ContactCTA } from "@/components/home/contact-cta";
import { getServices } from "@/lib/content";

export const metadata: Metadata = pageMetadata({ title: "Services", description: "Web development services for businesses and individuals.", path: "/services" });

// Public content is cached and refreshed at most every 5 minutes; admin edits also revalidate on demand.
export const revalidate = 300;

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <>
      <PageHeader title="My Services" description="I offer a range of web development services to help you build your ideas and grow your business." />
      <div className="container-page py-10">
        {services.length === 0 && <p className="rounded-xl border border-dashed border-border py-16 text-center text-muted">Services will be listed here soon.</p>}
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <li key={s.slug}>
              <Card className="h-full">
                <span className="flex size-11 items-center justify-center rounded-lg bg-accent-strong/15 text-accent"><ServiceIcon name={s.icon} className="size-5" /></span>
                <h2 className="mt-4 text-lg font-semibold">{s.title}</h2>
                <p className="mt-1 text-sm text-muted">{s.description}</p>
                <ul className="mt-4 space-y-1.5 text-sm">
                  {s.deliverables.map((d) => <li key={d} className="flex items-start gap-2"><Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />{d}</li>)}
                </ul>
              </Card>
            </li>
          ))}
        </ul>
        <ContactCTA />
      </div>
    </>
  );
}

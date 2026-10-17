import Link from "next/link";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card } from "@/components/ui/card";
import { ServiceIcon } from "@/components/services/service-icon";
import type { Service } from "@/types/content";

export function ServicesPreview({ services }: { services: Service[] }) {
  return (
    <section className="container-page mt-20 sm:mt-28">
      <SectionHeading eyebrow="Services" title="How I can help" description="A range of web development services to help you grow your business." />
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.slice(0, 6).map((s) => (
          <li key={s.slug}>
            <Card className="h-full">
              <ServiceIcon name={s.icon} className="size-6 text-accent" />
              <h3 className="mt-4 text-base font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted">{s.description}</p>
            </Card>
          </li>
        ))}
      </ul>
      <Link href="/services" className="mt-4 inline-flex min-h-11 items-center text-sm text-accent">All services →</Link>
    </section>
  );
}

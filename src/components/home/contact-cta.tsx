import { ButtonLink } from "@/components/ui/button";

export function ContactCTA() {
  return (
    <section className="container-page mt-20 sm:mt-28">
      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-10 md:flex md:items-center md:justify-between md:gap-8">
        <div>
          <h2 className="text-2xl font-semibold sm:text-3xl">Have a project in mind?</h2>
          <p className="mt-2 text-muted">Let&apos;s turn your idea into reality. Get in touch and let&apos;s discuss your requirements.</p>
        </div>
        <ButtonLink href="/contact" className="mt-6 w-full md:mt-0 md:w-auto">Get in Touch</ButtonLink>
      </div>
    </section>
  );
}

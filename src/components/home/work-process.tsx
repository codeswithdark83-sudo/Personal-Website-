import { SectionHeading } from "@/components/ui/section-heading";
import { processSteps } from "@/lib/placeholder-content";

export function WorkProcess() {
  return (
    <section className="container-page mt-20 sm:mt-28">
      <SectionHeading eyebrow="Process" title="How we'll work together" />
      <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {processSteps.map((s, i) => (
          <li key={s.title} className="rounded-xl border border-border bg-surface p-5">
            <span className="font-mono text-xs text-accent">0{i + 1}</span>
            <h3 className="mt-2 text-base font-semibold">{s.title}</h3>
            <p className="mt-1 text-sm text-muted">{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

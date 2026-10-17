import { SectionHeading } from "@/components/ui/section-heading";

export function PageHeader({ title, description, eyebrow, children }: { title: string; description?: string; eyebrow?: string; children?: React.ReactNode }) {
  return (
    <div className="glow border-b border-border/60">
      <div className="container-page flex flex-col gap-6 py-12 sm:py-16 md:flex-row md:items-end md:justify-between">
        <SectionHeading as="h1" eyebrow={eyebrow} title={title} description={description} />
        {children}
      </div>
    </div>
  );
}

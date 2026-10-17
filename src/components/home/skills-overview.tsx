import Link from "next/link";
import { SectionHeading } from "@/components/ui/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { SkillGroup } from "@/types/content";

export function SkillsOverview({ groups }: { groups: SkillGroup[] }) {
  return (
    <section className="container-page mt-20 sm:mt-28">
      <SectionHeading eyebrow="Toolbox" title="Technical skills" description="Technologies I work with." />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {groups.map((g) => (
          <Card key={g.category}>
            <h3 className="text-sm font-medium text-muted">{g.category}</h3>
            <ul className="mt-3 flex flex-wrap gap-2">{g.skills.map((s) => <li key={s}><Badge className="text-sm px-2.5 py-1">{s}</Badge></li>)}</ul>
          </Card>
        ))}
      </div>
      <Link href="/credentials" className="mt-4 inline-flex min-h-11 items-center text-sm text-accent">Full credentials →</Link>
    </section>
  );
}

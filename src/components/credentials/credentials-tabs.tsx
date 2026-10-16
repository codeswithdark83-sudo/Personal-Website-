"use client";

import { useId, useState } from "react";
import { Timeline } from "./timeline";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SkillGroup, TimelineEntry } from "@/types/content";

type Props = { skills: SkillGroup[]; education: TimelineEntry[]; certifications: TimelineEntry[]; experience: TimelineEntry[] };

export function CredentialsTabs({ skills, education, certifications, experience }: Props) {
  const tabs = ["Skills", "Education", "Certifications", "Experience"] as const;
  const [active, setActive] = useState<(typeof tabs)[number]>("Skills");
  const id = useId();

  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const next = (i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length;
    setActive(tabs[next]!);
    document.getElementById(`${id}-tab-${next}`)?.focus();
  };

  return (
    <div>
      <div role="tablist" aria-label="Credentials" className="-mx-4 flex gap-1 overflow-x-auto border-b border-border px-4 sm:mx-0 sm:px-0">
        {tabs.map((t, i) => (
          <button key={t} id={`${id}-tab-${i}`} role="tab" type="button" aria-selected={active === t} aria-controls={`${id}-panel`} tabIndex={active === t ? 0 : -1}
            onClick={() => setActive(t)} onKeyDown={(e) => onKey(e, i)}
            className={cn("min-h-11 shrink-0 border-b-2 px-4 text-sm", active === t ? "border-accent text-accent" : "border-transparent text-muted hover:text-foreground")}>
            {t}
          </button>
        ))}
      </div>
      <div id={`${id}-panel`} role="tabpanel" className="pt-8">
        {active === "Skills" && (
          <div className="grid gap-6 md:grid-cols-3">
            {skills.map((g) => (
              <section key={g.category} className="rounded-xl border border-border bg-surface p-5">
                <h3 className="text-sm font-medium text-muted">{g.category}</h3>
                <ul className="mt-3 flex flex-wrap gap-2">{g.skills.map((s) => <li key={s}><Badge className="px-2.5 py-1 text-sm">{s}</Badge></li>)}</ul>
              </section>
            ))}
          </div>
        )}
        {active === "Education" && <Timeline entries={education} empty="No education added yet." />}
        {active === "Certifications" && <Timeline entries={certifications} empty="No certifications have been added. Only verified certifications are listed here." />}
        {active === "Experience" && <Timeline entries={experience} empty="No work experience has been added yet." />}
      </div>
    </div>
  );
}

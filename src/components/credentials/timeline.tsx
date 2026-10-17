import type { TimelineEntry } from "@/types/content";

export function Timeline({ entries, empty }: { entries: TimelineEntry[]; empty: string }) {
  if (entries.length === 0) return <p className="text-sm text-muted">{empty}</p>;
  return (
    <ol className="relative space-y-6 border-l border-border pl-6">
      {entries.map((e) => (
        <li key={e.title + e.period} className="relative">
          <span className="absolute -left-[1.85rem] top-1.5 size-2.5 rounded-full bg-accent ring-4 ring-background" aria-hidden />
          <p className="font-mono text-xs text-accent">{e.period}</p>
          <h3 className="mt-1 text-base font-semibold">{e.title}</h3>
          {e.subtitle && <p className="text-sm text-muted">{e.subtitle}</p>}
          {e.description && <p className="mt-1 text-sm text-muted">{e.description}</p>}
        </li>
      ))}
    </ol>
  );
}

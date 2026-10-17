import Image from "next/image";

// Shows the uploaded cover image when there is one; otherwise clearly-labelled placeholder artwork.
export function ProjectThumb({ title, coverUrl, placeholder = true }: { title: string; coverUrl?: string; placeholder?: boolean }) {
  if (coverUrl) {
    return (
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg border border-border bg-elevated">
        <Image src={coverUrl} alt={`${title} screenshot`} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
      </div>
    );
  }
  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg border border-border bg-elevated" role="img" aria-label={`${title} preview${placeholder ? " (placeholder)" : ""}`}>
      <div className="absolute inset-0 bg-[radial-gradient(70%_80%_at_70%_0%,color-mix(in_srgb,var(--accent-strong)_35%,transparent),transparent)]" />
      <div className="absolute inset-x-3 top-3 flex gap-1" aria-hidden>
        <span className="size-1.5 rounded-full bg-muted/50" /><span className="size-1.5 rounded-full bg-muted/50" /><span className="size-1.5 rounded-full bg-muted/50" />
      </div>
      <div className="absolute inset-x-3 bottom-3 top-8 grid grid-cols-[1fr_2fr] gap-2" aria-hidden>
        <div className="rounded bg-background/50" /><div className="rounded bg-background/30" />
      </div>
      {placeholder && <span className="absolute right-2 top-2 rounded bg-background/70 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted">Placeholder</span>}
    </div>
  );
}

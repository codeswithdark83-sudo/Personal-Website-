import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow, title, description, as: Tag = "h2", className,
}: { eyebrow?: string; title: string; description?: string; as?: "h1" | "h2"; className?: string }) {
  return (
    <div className={cn("max-w-2xl", className)}>
      {eyebrow && <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-accent">{eyebrow}</p>}
      <Tag className={cn("font-semibold", Tag === "h1" ? "text-3xl sm:text-4xl lg:text-5xl" : "text-2xl sm:text-3xl")}>{title}</Tag>
      {description && <p className="mt-3 text-base text-muted">{description}</p>}
    </div>
  );
}

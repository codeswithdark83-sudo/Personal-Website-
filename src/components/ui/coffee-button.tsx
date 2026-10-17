import { Coffee } from "lucide-react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function CoffeeButton({ className }: { className?: string }) {
  return (
    <a
      href={siteConfig.coffeeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-medium transition-colors hover:border-accent hover:text-accent", className)}
    >
      <Coffee className="size-4" aria-hidden />
      Buy me a coffee
    </a>
  );
}

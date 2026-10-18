import { cn } from "@/lib/utils";

export function Card({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("lift rounded-xl border border-border bg-surface p-5 hover:border-accent/50 sm:p-6", className)} {...rest} />;
}

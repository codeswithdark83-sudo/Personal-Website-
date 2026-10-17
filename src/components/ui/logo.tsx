import Image from "next/image";
import { cn } from "@/lib/utils";

/** The "D" mark (transparent background, so it sits directly on any theme). */
export function Logo({ size = 32, className }: { size?: number; className?: string }) {
  return <Image src="/images/logo.png" alt="" width={size} height={size} priority className={cn("shrink-0", className)} />;
}

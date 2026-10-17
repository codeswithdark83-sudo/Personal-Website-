import Image from "next/image";
import { cn } from "@/lib/utils";

/** The "D" mark. The artwork has its own light background, so it is shown as a rounded tile on any theme. */
export function Logo({ size = 32, className }: { size?: number; className?: string }) {
  return <Image src="/images/logo.png" alt="" width={size} height={size} priority className={cn("shrink-0 rounded-lg", className)} />;
}

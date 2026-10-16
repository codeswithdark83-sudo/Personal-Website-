import { Code2, Layers, Monitor, Plug, ShoppingCart, Wrench } from "lucide-react";
import type { Service } from "@/types/content";

const map = { monitor: Monitor, code: Code2, layers: Layers, cart: ShoppingCart, plug: Plug, wrench: Wrench } as const;

export function ServiceIcon({ name, className }: { name: Service["icon"]; className?: string }) {
  const Icon = map[name];
  return <Icon className={className} aria-hidden />;
}

"use client";

import dynamic from "next/dynamic";
import { use3dAllowed, useOnScreen } from "./use-3d";

const HeroCanvas = dynamic(() => import("./hero-canvas"), { ssr: false });

/** Decorative 3D layer for the hero. Renders nothing (the 2D design stands alone) when 3D isn't appropriate. */
export function HeroScene() {
  const allowed = use3dAllowed();
  const [ref, visible] = useOnScreen<HTMLDivElement>();
  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">
      {allowed ? <HeroCanvas active={visible} /> : null}
    </div>
  );
}

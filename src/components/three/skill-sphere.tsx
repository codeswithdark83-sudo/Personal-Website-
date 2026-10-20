"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { DragState, use3dAllowed, useOnScreen } from "./use-3d";
import type { SkillGroup } from "@/types/content";

const SphereCanvas = dynamic(() => import("./sphere-canvas"), { ssr: false });
const PALETTE = ["#22d3ee", "#5b8cff", "#8b5cf6", "#34d399", "#fbbf24", "#f472b6"];

/** A draggable 3D cloud of skills. Purely decorative: the full skill list is rendered as text right below it. */
export function SkillSphere({ groups }: { groups: SkillGroup[] }) {
  const allowed = use3dAllowed();
  const [ref, visible] = useOnScreen<HTMLDivElement>();
  const [drag] = useState(() => new DragState());
  const words = useMemo(
    () => [...new Map(groups.flatMap((g, gi) => g.skills.map((s) => [s, { text: s, color: PALETTE[gi % PALETTE.length] ?? "#5b8cff" }] as const))).values()].slice(0, 42),
    [groups],
  );
  if (!allowed || words.length < 6) return null;

  return (
    <div
      ref={ref}
      aria-hidden
      className="relative mt-8 h-[300px] cursor-grab select-none overflow-hidden rounded-2xl border border-border bg-surface/60 active:cursor-grabbing sm:h-[420px]"
      style={{ touchAction: "pan-y" }}
      onPointerDown={(e) => { drag.start(e.clientX, e.clientY); e.currentTarget.setPointerCapture(e.pointerId); }}
      onPointerMove={(e) => drag.move(e.clientX, e.clientY)}
      onPointerUp={() => drag.end()}
      onPointerCancel={() => drag.end()}
    >
      <SphereCanvas words={words} active={visible} drag={drag} />
      <p className="pointer-events-none absolute bottom-3 left-0 right-0 text-center text-xs text-muted">Drag to spin</p>
    </div>
  );
}

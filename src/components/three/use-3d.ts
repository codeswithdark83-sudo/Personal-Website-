"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/** One cheap, cached check: can this device comfortably run a WebGL scene? Always false on the server. */
let cached: boolean | undefined;
function capable(): boolean {
  if (cached !== undefined) return cached;
  try {
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    const weak = (nav.deviceMemory ?? 8) <= 2 || (nav.hardwareConcurrency ?? 8) <= 2 || nav.connection?.saveData === true;
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    cached = !!gl && !weak;
  } catch {
    cached = false;
  }
  return cached;
}

const reducedQuery = () => window.matchMedia("(prefers-reduced-motion: reduce)");
const subscribeMotion = (cb: () => void) => {
  const q = reducedQuery();
  q.addEventListener("change", cb);
  return () => q.removeEventListener("change", cb);
};

/** True only on the client, when the user has not asked for reduced motion and the device can handle WebGL. */
export function use3dAllowed(): boolean {
  const calm = useSyncExternalStore(subscribeMotion, () => reducedQuery().matches, () => true);
  const can = useSyncExternalStore(() => () => {}, capable, () => false);
  return can && !calm;
}

/** Whether the element is on screen, so off-screen scenes stop rendering. Returns a callback ref, so it also works for elements that mount later. */
export function useOnScreen<T extends Element>() {
  const [el, setEl] = useState<T | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!el) return;
    const io = new IntersectionObserver((entries) => { const e = entries[0]; if (e) setVisible(e.isIntersecting); }, { rootMargin: "120px" });
    io.observe(el);
    return () => io.disconnect();
  }, [el]);
  return [setEl, visible] as const;
}

/** Pointer position normalised to -1..1 across the window, kept in a ref (no re-renders). */
export function usePointerRef() {
  const p = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const move = (e: PointerEvent) => {
      p.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      p.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);
  return p;
}

/** Spin state for a draggable object. All mutation goes through methods so React's immutability lint stays happy. */
export class DragState {
  vx = 0.12;
  vy = 0;
  down = false;
  private lx = 0;
  private ly = 0;
  start(x: number, y: number) { this.down = true; this.lx = x; this.ly = y; }
  move(x: number, y: number) {
    if (!this.down) return;
    this.vx = (x - this.lx) * 0.36;
    this.vy = (y - this.ly) * 0.36;
    this.lx = x; this.ly = y;
  }
  end() { this.down = false; }
  /** Ease back to the idle spin when not being dragged. */
  tick(dt: number) {
    if (this.down) return;
    this.vx += (0.12 - this.vx) * Math.min(1, dt * 1.5);
    this.vy *= Math.exp(-dt * 2.5);
  }
}

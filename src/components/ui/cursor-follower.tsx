"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE = "a, button, summary, label, select, input, textarea, [role='button'], [role='tab']";

/** A small dot that tracks the pointer plus a ring that trails it. The system cursor stays visible. */
export function CursorFollower() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine) and (hover: hover)").matches;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || calm) return;

    const root = document.documentElement;
    let x = 0, y = 0, rx = 0, ry = 0, frame = 0, started = false;

    const loop = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      frame = requestAnimationFrame(loop);
    };
    const move = (e: PointerEvent) => {
      x = e.clientX; y = e.clientY;
      if (dot.current) dot.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (!started) { started = true; rx = x; ry = y; root.classList.add("cursor-on"); frame = requestAnimationFrame(loop); }
      const over = (e.target as Element | null)?.closest?.(INTERACTIVE);
      ring.current?.setAttribute("data-hover", over ? "true" : "false");
    };
    const down = () => ring.current?.setAttribute("data-down", "true");
    const up = () => ring.current?.setAttribute("data-down", "false");
    const leave = () => root.classList.remove("cursor-on");
    const enter = () => { if (started) root.classList.add("cursor-on"); };

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    document.addEventListener("mouseleave", leave);
    document.addEventListener("mouseenter", enter);
    return () => {
      cancelAnimationFrame(frame);
      root.classList.remove("cursor-on");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.removeEventListener("mouseleave", leave);
      document.removeEventListener("mouseenter", enter);
    };
  }, []);

  return (
    <>
      <div ref={ring} className="cursor-ring" aria-hidden />
      <div ref={dot} className="cursor-dot" aria-hidden />
    </>
  );
}

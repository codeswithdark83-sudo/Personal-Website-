"use client";

import { useEffect, useRef } from "react";

type Dot = { x: number; y: number; z: number; r: number; hue: number; a: number; tw: number; sp: number };

const COLORS_DARK = ["34,211,238", "91,140,255", "139,92,246", "165,180,252"]; // cyan, blue, violet, soft indigo
const COLORS_LIGHT = ["14,116,144", "36,89,214", "109,40,217", "67,56,202"];

/** Tiny seeded PRNG: the same dot layout on every load, and no impure calls during render. */
function rng(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Glowing dots that drift slowly behind the whole site. Nearer dots are bigger and move more with scrolling and the
 * pointer, which gives the page depth. One cheap 2D canvas, paused when the tab is hidden; reduced-motion users get
 * a still picture.
 */
export function DotField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    const weak = (nav.deviceMemory ?? 8) <= 2 || (nav.hardwareConcurrency ?? 8) <= 2 || nav.connection?.saveData === true;
    const root = document.documentElement;
    const isLight = () => root.classList.contains("light");

    let w = 0, h = 0, dpr = 1, dots: Dot[] = [], light = isLight();
    let px = 0, py = 0, tx = 0, ty = 0, scrollY = window.scrollY, last = performance.now(), frame = 0, running = false;

    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2); // full device resolution so dots stay sharp
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      const r = rng(11);
      const count = Math.round(Math.min(260, Math.max(90, (w * h) / 6500)) * (weak ? 0.5 : 1));
      dots = Array.from({ length: count }, () => {
        const z = 0.25 + r() * 0.75;
        return { x: r() * w, y: r() * h, z, r: 0.7 + z * 2.1 + r() * 0.8, hue: Math.floor(r() * 4), a: 0.55 + r() * 0.45, tw: r() * Math.PI * 2, sp: 0.6 + r() * 0.8 };
      });
    };

    const draw = (dt: number, t: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const palette = light ? COLORS_LIGHT : COLORS_DARK;
      px += (tx - px) * Math.min(1, dt * 3); py += (ty - py) * Math.min(1, dt * 3);
      for (const d of dots) {
        if (!calm) {
          d.y -= dt * (5 + d.z * 14) * d.sp;           // slow upward drift
          d.x += Math.sin(t * 0.0004 * d.sp + d.tw) * dt * 6 * d.z;
          if (d.y < -20) d.y = h + 20;
        }
        // Scroll parallax: nearer dots slide further, so they seem to sit at different depths.
        let y = (d.y - scrollY * d.z * 0.35) % (h + 40);
        if (y < -20) y += h + 40;
        const x = ((d.x + px * d.z * 26) % (w + 40) + w + 40) % (w + 40) - 20;
        const tw = calm ? 1 : 0.75 + 0.25 * Math.sin(t * 0.0012 * d.sp + d.tw);
        const rgb = palette[d.hue] ?? palette[0]!;
        const a = Math.min(1, d.a * tw * (light ? 0.9 : 1));
        const yy = y + py * d.z * 18;
        const rad = d.r * 0.85; // crisp solid core
        // A faint ring-less halo (low alpha) gives a glow without blurring the dot itself.
        ctx.fillStyle = `rgba(${rgb},${(a * 0.16).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(x, yy, rad * 2.4, 0, 6.2832); ctx.fill();
        ctx.fillStyle = `rgba(${rgb},${a.toFixed(3)})`;
        ctx.beginPath(); ctx.arc(x, yy, rad, 0, 6.2832); ctx.fill();
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      draw(dt, now);
      frame = running ? requestAnimationFrame(tick) : 0;
    };
    const start = () => { if (calm || running || document.hidden) return; running = true; last = performance.now(); frame = requestAnimationFrame(tick); };
    const stop = () => { running = false; if (frame) cancelAnimationFrame(frame); frame = 0; };

    const onScroll = () => { scrollY = window.scrollY; if (calm) draw(0, 0); };
    const onMove = (e: PointerEvent) => { tx = (e.clientX / w) * 2 - 1; ty = (e.clientY / h) * 2 - 1; };
    const onResize = () => { build(); draw(0, 0); };
    const onVisibility = () => (document.hidden ? stop() : start());
    const themeObserver = new MutationObserver(() => {
      const now = isLight();
      if (now === light) return;
      light = now; if (calm) draw(0, 0);
    });

    build(); draw(0, 0); start();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    themeObserver.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => {
      stop();
      themeObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-0 size-full" />;
}

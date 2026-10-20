"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import type { DragState } from "./use-3d";

export type SphereWord = { text: string; color: string };

const R = 2.1;

function labelTexture(text: string, color: string) {
  const c = document.createElement("canvas");
  const g = c.getContext("2d")!;
  const font = "600 34px Inter, system-ui, sans-serif";
  g.font = font;
  const w = Math.ceil(g.measureText(text).width) + 44, h = 64;
  c.width = w; c.height = h;
  g.font = font;
  g.fillStyle = "rgba(11,13,18,0.82)";
  g.strokeStyle = color; g.lineWidth = 3;
  g.beginPath(); g.roundRect(2, 2, w - 4, h - 4, 30); g.fill(); g.stroke();
  g.fillStyle = "#f4f6fb"; g.textBaseline = "middle"; g.textAlign = "center";
  g.fillText(text, w / 2, h / 2 + 2);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return { texture: t, aspect: w / h };
}

function Sphere({ words, drag }: { words: SphereWord[]; drag: DragState }) {
  const group = useRef<THREE.Group>(null);
  const sprites = useRef<(THREE.Sprite | null)[]>([]);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const items = useMemo(() => {
    const n = words.length, golden = Math.PI * (3 - Math.sqrt(5));
    return words.map((w, i) => {
      const y = 1 - (i / Math.max(1, n - 1)) * 2, r = Math.sqrt(1 - y * y), th = golden * i;
      return { ...w, pos: new THREE.Vector3(Math.cos(th) * r * R, y * R, Math.sin(th) * r * R), ...labelTexture(w.text, w.color) };
    });
  }, [words]);
  useEffect(() => () => items.forEach((i) => i.texture.dispose()), [items]);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    drag.tick(dt);
    g.rotation.y += drag.vx * dt;
    g.rotation.x = THREE.MathUtils.clamp(g.rotation.x + drag.vy * dt, -1.1, 1.1);
    items.forEach((it, i) => {
      const s = sprites.current[i];
      if (!s) return;
      tmp.copy(it.pos).applyEuler(g.rotation);
      const depth = (tmp.z + R) / (2 * R); // 0 = back, 1 = front
      s.material.opacity = 0.15 + depth * 0.85;
      const k = 0.26 + depth * 0.2;
      s.scale.set(k * it.aspect, k, 1);
    });
  });

  return (
    <group ref={group}>
      {items.map((it, i) => (
        <sprite key={it.text} ref={(el) => { sprites.current[i] = el; }} position={it.pos}>
          <spriteMaterial map={it.texture} transparent depthWrite={false} />
        </sprite>
      ))}
    </group>
  );
}

export default function SphereCanvas({ words, active, drag }: { words: SphereWord[]; active: boolean; drag: DragState }) {
  return (
    <Canvas frameloop={active ? "always" : "never"} dpr={[1, 1.75]} camera={{ position: [0, 0, 6.2], fov: 45 }} gl={{ alpha: true, antialias: true }} style={{ pointerEvents: "none" }} aria-hidden>
      <Sphere words={words} drag={drag} />
    </Canvas>
  );
}

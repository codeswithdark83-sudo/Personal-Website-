"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { usePointerRef } from "./use-3d";

const S = 2.2; // logo size in world units
const R = 27; // stroke radius, in the 512-unit logo grid
const P = (x: number, y: number) => new THREE.Vector3((x - 256) / 512 * S, -(y - 256) / 512 * S, 0);
const stroke = (curve: THREE.Curve<THREE.Vector3>) => new THREE.TubeGeometry(curve, 48, (R / 512) * S, 20, false);
const cap = (x: number, y: number) => new THREE.SphereGeometry((R / 512) * S, 20, 16).translate(...P(x, y).toArray());
const line = (a: [number, number], b: [number, number]) => new THREE.LineCurve3(P(...a), P(...b));

/** The JK monogram from the site logo, rebuilt as a solid 3D shape with the cyan → blue → violet gradient. */
function buildLogo() {
  const stem = new THREE.CurvePath<THREE.Vector3>();
  stem.add(line([262, 92], [262, 324]));
  stem.add(new THREE.CubicBezierCurve3(P(262, 324), P(262, 382), P(226, 416), P(176, 416)));
  stem.add(new THREE.CubicBezierCurve3(P(176, 416), P(140, 416), P(116, 400), P(102, 372)));
  const parts = [
    stroke(stem), cap(262, 92), cap(102, 372),
    stroke(line([262, 272], [396, 98])), cap(262, 272), cap(396, 98),
    stroke(line([316, 200], [402, 414])), cap(316, 200), cap(402, 414),
  ].map((g) => (g.index ? g.toNonIndexed() : g));
  const geo = mergeGeometries(parts, false)!;
  const pos = geo.attributes.position;
  if (!pos) throw new Error("logo geometry has no positions");
  const c = new THREE.Color();
  const cyan = new THREE.Color("#22d3ee"), blue = new THREE.Color("#5b8cff"), violet = new THREE.Color("#8b5cf6");
  const colors = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const t = THREE.MathUtils.clamp((pos.getX(i) / S + 0.5 + (0.5 - (pos.getY(i) / S + 0.5)) * 0.6) / 1.3, 0, 1);
    if (t < 0.5) c.copy(cyan).lerp(blue, t * 2); else c.copy(blue).lerp(violet, (t - 0.5) * 2);
    colors.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.center();
  return geo;
}

function Logo({ pointer }: { pointer: React.RefObject<{ x: number; y: number }> }) {
  const group = useRef<THREE.Group>(null);
  const geometry = useMemo(() => buildLogo(), []);
  const { viewport } = useThree();
  const wide = viewport.width / viewport.height > 1.25;
  // Sit near the portrait: right-hand side on wide screens, upper right on phones.
  const base = useMemo(() => new THREE.Vector3(wide ? viewport.width * 0.365 : viewport.width * 0.27, wide ? viewport.height * 0.33 : viewport.height * 0.36, 0), [wide, viewport.width, viewport.height]);
  const scale = Math.min(viewport.width, viewport.height) * (wide ? 0.31 : 0.22);

  useFrame(({ clock }, dt) => {
    const g = group.current;
    if (!g) return;
    const t = clock.elapsedTime;
    const k = 1 - Math.exp(-dt * 4);
    g.rotation.y += ((pointer.current.x * 0.9 + Math.sin(t * 0.6) * 0.35) - g.rotation.y) * k;
    g.rotation.x += ((pointer.current.y * 0.5 + Math.cos(t * 0.5) * 0.12) - g.rotation.x) * k;
    g.position.set(base.x + pointer.current.x * 0.12, base.y + Math.sin(t * 1.1) * 0.12 - pointer.current.y * 0.08, 0);
  });

  return (
    <group ref={group} scale={scale / S}>
      <mesh geometry={geometry}>
        <meshPhysicalMaterial vertexColors metalness={0.35} roughness={0.28} clearcoat={1} clearcoatRoughness={0.15} emissive="#1d3b8f" emissiveIntensity={0.35} />
      </mesh>
    </group>
  );
}

function dotTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)"); grad.addColorStop(0.4, "rgba(255,255,255,0.6)"); grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

/** Small deterministic PRNG so the particle field is stable and the render stays pure. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Particles({ pointer, count }: { pointer: React.RefObject<{ x: number; y: number }>; count: number }) {
  const ref = useRef<THREE.Points>(null);
  const sprite = useMemo(() => dotTexture(), []);
  const { positions, colors } = useMemo(() => {
    const rnd = mulberry32(7);
    const positions = new Float32Array(count * 3), colors = new Float32Array(count * 3);
    const a = new THREE.Color("#22d3ee"), b = new THREE.Color("#8b5cf6"), c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const r = 3 + rnd() * 5, th = rnd() * Math.PI * 2, ph = Math.acos(2 * rnd() - 1);
      positions.set([r * Math.sin(ph) * Math.cos(th), r * Math.sin(ph) * Math.sin(th) * 0.7, r * Math.cos(ph) - 2], i * 3);
      c.copy(a).lerp(b, rnd()); colors.set([c.r, c.g, c.b], i * 3);
    }
    return { positions, colors };
  }, [count]);

  useFrame(({ clock }, dt) => {
    const p = ref.current;
    if (!p) return;
    const k = 1 - Math.exp(-dt * 2.5);
    p.rotation.y += (clock.elapsedTime * 0.04 + pointer.current.x * 0.35 - p.rotation.y) * k;
    p.rotation.x += (pointer.current.y * 0.2 - p.rotation.x) * k;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.09} map={sprite} alphaMap={sprite} sizeAttenuation vertexColors transparent opacity={0.75} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

export default function HeroCanvas({ active }: { active: boolean }) {
  const pointer = usePointerRef();
  const small = typeof window !== "undefined" && window.innerWidth < 768;
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 6], fov: 45 }}
      gl={{ alpha: true, antialias: !small, powerPreference: "high-performance" }}
      style={{ pointerEvents: "none" }}
      aria-hidden
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 4, 5]} intensity={2.2} />
      <pointLight position={[-4, -2, 3]} intensity={30} color="#22d3ee" />
      <pointLight position={[4, 2, -2]} intensity={25} color="#8b5cf6" />
      <Particles pointer={pointer} count={small ? 380 : 900} />
      <Logo pointer={pointer} />
    </Canvas>
  );
}

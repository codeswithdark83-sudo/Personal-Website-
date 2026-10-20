"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { usePointerRef } from "./use-3d";

type Pointer = React.RefObject<{ x: number; y: number }>;
type ShapeSpec = { kind: "knot" | "ico" | "ring" | "octa" | "wire" | "cube"; x: number; y: number; z: number; size: number; color: string; spin: number; depth: number; mobile?: boolean };

// Positions are fractions of the visible width/height. Most sit on the right, behind and around the portrait; text stays clear.
const SPECS: ShapeSpec[] = [
  { kind: "ring", x: 0.30, y: 0.02, z: -1.2, size: 1.55, color: "#5b8cff", spin: 0.25, depth: 0.5, mobile: true },
  { kind: "knot", x: 0.41, y: 0.28, z: -0.4, size: 0.5, color: "#8b5cf6", spin: 0.5, depth: 1.0, mobile: true },
  { kind: "ico", x: 0.40, y: -0.31, z: -0.6, size: 0.55, color: "#22d3ee", spin: 0.4, depth: 0.9, mobile: true },
  { kind: "octa", x: 0.17, y: 0.38, z: -2.0, size: 0.42, color: "#5b8cff", spin: 0.6, depth: 0.7 },
  { kind: "cube", x: -0.02, y: -0.37, z: -2.4, size: 0.4, color: "#8b5cf6", spin: 0.45, depth: 0.6 },
  { kind: "wire", x: -0.5, y: 0.36, z: -3.2, size: 0.6, color: "#22d3ee", spin: 0.18, depth: 0.4 },
  { kind: "wire", x: 0.12, y: 0.00, z: -4.2, size: 1.7, color: "#5b8cff", spin: 0.1, depth: 0.25 },
];

// Phones: the photo sits at the top, so shapes are placed in pixels from the top-centre and kept clear of the text below.
type PhoneSpec = { kind: ShapeSpec["kind"]; dx: number; top: number; r: number; color: string; spin: number; depth: number; z: number };
const PHONE_SPECS: PhoneSpec[] = [
  { kind: "ring", dx: 0, top: 150, r: 128, color: "#5b8cff", spin: 0.25, depth: 0.4, z: -1.2 },
  { kind: "knot", dx: 150, top: 108, r: 24, color: "#8b5cf6", spin: 0.5, depth: 0.9, z: -0.4 },
  { kind: "ico", dx: -150, top: 246, r: 24, color: "#22d3ee", spin: 0.4, depth: 0.8, z: -0.6 },
];

function ShapeGeometry({ kind }: { kind: ShapeSpec["kind"] }) {
  switch (kind) {
    case "knot": return <torusKnotGeometry args={[1, 0.32, 140, 18]} />;
    case "ico": return <icosahedronGeometry args={[1, 0]} />;
    case "ring": return <torusGeometry args={[1, 0.035, 20, 120]} />;
    case "octa": return <octahedronGeometry args={[1, 0]} />;
    case "cube": return <boxGeometry args={[1.3, 1.3, 1.3]} />;
    default: return <icosahedronGeometry args={[1, 1]} />;
  }
}

type Placed = { kind: ShapeSpec["kind"]; bx: number; by: number; z: number; size: number; color: string; spin: number; depth: number };

/** One floating, slowly spinning 3D shape that drifts with the pointer (nearer shapes move more). */
function Shape({ p, pointer }: { p: Placed; pointer: Pointer }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }, dt) => {
    const m = ref.current;
    if (!m) return;
    const t = clock.elapsedTime;
    m.rotation.x += dt * p.spin * 0.7;
    m.rotation.y += dt * p.spin;
    const k = 1 - Math.exp(-dt * 3);
    const tx = p.bx + pointer.current.x * 0.35 * p.depth;
    const ty = p.by + Math.sin(t * 0.8 + p.bx * 3) * 0.1 - pointer.current.y * 0.25 * p.depth;
    m.position.x += (tx - m.position.x) * k;
    m.position.y += (ty - m.position.y) * k;
  });

  const wire = p.kind === "wire";
  return (
    <mesh ref={ref} scale={p.size} position={[p.bx, p.by, p.z]}>
      <ShapeGeometry kind={p.kind} />
      {wire ? (
        <meshBasicMaterial color={p.color} wireframe transparent opacity={0.28} />
      ) : (
        <meshPhysicalMaterial color={p.color} metalness={0.55} roughness={0.22} clearcoat={1} clearcoatRoughness={0.12} emissive={p.color} emissiveIntensity={0.18} flatShading={p.kind === "ico" || p.kind === "octa" || p.kind === "cube"} />
      )}
    </mesh>
  );
}

function Shapes({ pointer }: { pointer: Pointer }) {
  const { viewport, size } = useThree();
  const wide = viewport.width / viewport.height > 1.25;
  const wpp = viewport.width / size.width; // world units per CSS pixel
  // Shapes further back look smaller and pulled toward the centre, so scale their placement by the camera distance (6).
  const f = (z: number) => (6 - z) / 6;
  const placed: Placed[] = wide
    ? SPECS.map((s) => ({ ...s, bx: s.x * viewport.width * f(s.z), by: s.y * viewport.height * f(s.z), size: s.size * f(s.z) }))
    : PHONE_SPECS.map((s) => ({ ...s, bx: s.dx * wpp * f(s.z), by: (viewport.height / 2 - s.top * wpp) * f(s.z), size: s.r * wpp * f(s.z) }));
  return <>{placed.map((p, i) => <Shape key={i} p={p} pointer={pointer} />)}</>;
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

function Particles({ pointer, count }: { pointer: Pointer; count: number }) {
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
      <Shapes pointer={pointer} />
    </Canvas>
  );
}

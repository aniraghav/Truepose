"use client";

import { useLayoutEffect, useMemo, useRef, type MutableRefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, Float } from "@react-three/drei";
import { EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import { accent, cssVar } from "@/lib/theme";

/* A 3D goniometer: the instrument used to measure range of motion.
   Outer neon arc = left side, inner white arc = right side. Matte, no glow (client brief). */

export type Angles = { l: number; r: number };

type SceneProps = {
  hover: MutableRefObject<number | null>;   // pointer x across the visual, 0..1, or null
  onAngles: (a: Angles) => void;
  onReady: () => void;
  active: boolean;
  effects: boolean;
};

/* Colours come from the CSS tokens in app/globals.css (this module only loads in the browser) */
const PANEL = cssVar("--bg", "#0f141b"); // same as the page, so the dial sits on the banner with no visible box
const NEON = new THREE.Color(accent());
const WHITE = new THREE.Color(cssVar("--text", "#f5f3ee"));
const OFF = new THREE.Color(cssVar("--dial-off", "#263244"));
const BODY = cssVar("--dial-body", "#18212c");
const RIM = cssVar("--dial-rim", "#34404f");
const ARM = cssVar("--dial-arm", "#8592a3");
const HUB = cssVar("--dial-hub", "#c9d2dc");
const TICK = cssVar("--faint", "#5b687a");
const R_OUT = 2.25;
const R_IN = 1.8;

function SegmentRing({ radius, count, on, thickness, angles, side }: {
  radius: number; count: number; on: THREE.Color; thickness: number;
  angles: MutableRefObject<Angles>; side: keyof Angles;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const lit = useRef(-1);
  const seg = ((2 * Math.PI * radius) / count) * 0.62;

  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const d = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 2;
      d.position.set(radius * Math.sin(t), radius * Math.cos(t), 0);
      d.rotation.set(0, 0, -t + Math.PI / 2);
      d.updateMatrix();
      m.setMatrixAt(i, d.matrix);
      m.setColorAt(i, OFF);
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    (m.material as THREE.Material).needsUpdate = true;
  }, [count, radius]);

  useFrame(() => {
    const m = ref.current;
    if (!m) return;
    const n = Math.round((angles.current[side] / 360) * count);
    if (n === lit.current) return;
    lit.current = n;
    for (let i = 0; i < count; i++) m.setColorAt(i, i < n ? on : OFF);
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <capsuleGeometry args={[thickness, seg, 4, 8]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}

function Ticks() {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const d = new THREE.Object3D();
    for (let i = 0; i < 72; i++) {
      const t = (i / 72) * Math.PI * 2;
      const long = i % 6 === 0;
      const r = long ? 2.62 : 2.66;
      d.position.set(r * Math.sin(t), r * Math.cos(t), 0.02);
      d.rotation.set(0, 0, -t);
      d.scale.set(1, long ? 2.2 : 1, 1);
      d.updateMatrix();
      m.setMatrixAt(i, d.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, 72]}>
      <boxGeometry args={[0.022, 0.09, 0.02]} />
      <meshStandardMaterial color={TICK} roughness={0.6} />
    </instancedMesh>
  );
}

function Goniometer({ hover, onAngles }: Pick<SceneProps, "hover" | "onAngles">) {
  const angles = useRef<Angles>({ l: 138, r: 112 });
  const group = useRef<THREE.Group>(null);
  const arm = useRef<THREE.Group>(null);
  const tilt = useMemo(() => new THREE.Vector2(), []);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const h = hover.current;
    const idleL = 138 + 16 * Math.sin(t * 0.55) + 7 * Math.sin(t * 1.3);
    const idleR = 112 + 20 * Math.sin(t * 0.45 + 1);
    const targetL = h === null ? idleL : 60 + h * 140;
    const targetR = h === null ? idleR : 75 + h * 95;
    const k = 1 - Math.pow(0.001, dt);            // frame rate independent easing
    const a = angles.current;
    a.l += (targetL - a.l) * k * 0.9;
    a.r += (targetR - a.r) * k * 0.7;
    onAngles(a);

    if (arm.current) arm.current.rotation.z = -THREE.MathUtils.degToRad(a.l);
    tilt.lerp(state.pointer, 0.05);
    if (group.current) {
      group.current.rotation.x = -0.42 + tilt.y * 0.12;
      group.current.rotation.y = 0.38 + tilt.x * 0.22;
    }
  });

  return (
    <group ref={group}>
      {/* Body of the instrument */}
      <mesh position={[0, 0, -0.16]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[2.95, 2.95, 0.22, 96]} />
        <meshStandardMaterial color={BODY} metalness={0.55} roughness={0.38} />
      </mesh>
      <mesh position={[0, 0, -0.04]}>
        <torusGeometry args={[2.95, 0.035, 12, 128]} />
        <meshStandardMaterial color={RIM} metalness={0.8} roughness={0.25} />
      </mesh>

      <Ticks />
      <SegmentRing radius={R_OUT} count={64} on={NEON} thickness={0.07} angles={angles} side="l" />
      <SegmentRing radius={R_IN} count={52} on={WHITE} thickness={0.05} angles={angles} side="r" />

      {/* Moving arm (left reading) */}
      <group ref={arm} position={[0, 0, 0.12]}>
        <mesh position={[0, R_OUT / 2, 0]}>
          <capsuleGeometry args={[0.04, R_OUT, 4, 12]} />
          <meshBasicMaterial color={NEON} toneMapped={false} />
        </mesh>
        <mesh position={[0, R_OUT, 0]}>
          <sphereGeometry args={[0.13, 24, 24]} />
          <meshBasicMaterial color={NEON} toneMapped={false} />
        </mesh>
      </group>

      {/* Fixed arm (zero line) */}
      <mesh position={[0, R_OUT / 2, 0.1]}>
        <capsuleGeometry args={[0.025, R_OUT, 4, 8]} />
        <meshStandardMaterial color={ARM} />
      </mesh>
      <mesh position={[0, 0, 0.16]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.14, 32]} />
        <meshStandardMaterial color={HUB} metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
}

export default function HeroScene({ hover, onAngles, onReady, active, effects }: SceneProps) {
  return (
    <Canvas
      className="scene"
      dpr={[1, 1.75]}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0, 10.5], fov: 38 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onCreated={() => onReady()}
      aria-hidden="true"
    >
      <color attach="background" args={[PANEL]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 4, 6]} intensity={1.1} />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={2.2} position={[4, 3, 5]} scale={[6, 2, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[-5, -2, 3]} scale={[4, 4, 1]} />
        <Lightformer form="ring" intensity={1.5} color={NEON} position={[0, 6, -4]} scale={3} />
      </Environment>

      <Float speed={1.1} rotationIntensity={0.18} floatIntensity={0.45}>
        <Goniometer hover={hover} onAngles={onAngles} />
      </Float>

      {effects && (
        <EffectComposer multisampling={4}>
          <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.35} />
          <Vignette offset={0.32} darkness={0.55} />
        </EffectComposer>
      )}
    </Canvas>
  );
}

"use client";

import { useRef, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";
import { CarModel } from "./CarModel";
import { GateBarrier } from "./GateBarrier";
import { ParkingEnvironment } from "./ParkingEnvironment";
import { useCarControls } from "@/hooks/useCarControls";
import { SimulationState } from "@/hooks/useParkingSimulation";

// World bounds (matches ParkingEnvironment)
const BOUNDS = { minX: -17, maxX: 17, minZ: -17, maxZ: 26 };
const SPEED = 6;
const TURN_SPEED = 1.8;
const FRICTION = 0.88;

// Gate trigger zones
const ENTRY_GATE_POS = { x: -4.5, z: 18 };
const EXIT_GATE_POS = { x: 8.5, z: 18 };
const TRIGGER_RADIUS = 3.2;

function distance(ax: number, az: number, bx: number, bz: number) {
  return Math.sqrt((ax - bx) ** 2 + (az - bz) ** 2);
}

interface CarControllerProps {
  simState: SimulationState;
  onEntryZone: () => void;
  onExitedEntryGate: () => void;
  onExitZone: () => void;
  onExitedExitGate: () => void;
  carPosRef: React.RefObject<{ x: number; z: number; rot: number }>;
}

function CarController({
  simState,
  onEntryZone,
  onExitedEntryGate,
  onExitZone,
  onExitedExitGate,
  carPosRef,
}: CarControllerProps) {
  const movement = useCarControls();
  const posRef = useRef(new THREE.Vector3(-4.5, 0, 24));
  const rotRef = useRef(Math.PI);
  const velocityRef = useRef(0);
  const hasTriggeredEntry = useRef(false);
  const hasPassedEntry = useRef(false);
  const hasTriggeredExit = useRef(false);
  const hasPassedExit = useRef(false);
  const carGroupRef = useRef<THREE.Group>(null);

  // Reset triggers when simulation resets
  useEffect(() => {
    if (simState.phase === "IDLE") {
      hasTriggeredEntry.current = false;
      hasPassedEntry.current = false;
      hasTriggeredExit.current = false;
      hasPassedExit.current = false;
      posRef.current.set(-4.5, 0, 24);
      rotRef.current = Math.PI;
      velocityRef.current = 0;
    }
  }, [simState.phase]);

  useFrame((_, delta) => {
    const phase = simState.phase;
    const isOcrActive =
      phase === "OCR_SCANNING" ||
      phase === "EXIT_OCR_SCANNING" ||
      phase === "EXIT_PAYMENT";

    // Block movement during OCR/payment
    if (!isOcrActive) {
      // Steering
      if (movement.left) rotRef.current += TURN_SPEED * delta;
      if (movement.right) rotRef.current -= TURN_SPEED * delta;

      // Acceleration
      if (movement.forward) {
        velocityRef.current = Math.min(velocityRef.current + SPEED * delta * 2, SPEED);
      } else if (movement.backward) {
        velocityRef.current = Math.max(velocityRef.current - SPEED * delta * 2, -SPEED * 0.6);
      } else if (movement.brake) {
        velocityRef.current *= 0.85;
      } else {
        velocityRef.current *= FRICTION;
      }

      if (Math.abs(velocityRef.current) < 0.01) velocityRef.current = 0;

      // Move in facing direction
      const dx = Math.sin(rotRef.current) * velocityRef.current * delta;
      const dz = Math.cos(rotRef.current) * velocityRef.current * delta;

      let nx = posRef.current.x + dx;
      let nz = posRef.current.z + dz;

      // Cek Collision untuk Gate Masuk (Entry Gate) - X berada di sekitar -4.5
      if (!simState.entryGateOpen && Math.abs(nx - ENTRY_GATE_POS.x) < 2) {
        // Jika mobil datang dari Z > 18.5 dan mencoba masuk ke Z <= 18.5
        if (posRef.current.z > 18.5 && nz <= 18.5) {
          nz = 18.5; // Tahan di depan portal
          velocityRef.current = 0; // Hentikan mobil
        }
      }

      // Cek Collision untuk Gate Keluar (Exit Gate) - X berada di sekitar 8.5
      if (!simState.exitGateOpen && Math.abs(nx - EXIT_GATE_POS.x) < 2) {
        // Jika mobil datang dari dalam (Z < 17.5) dan mencoba keluar ke Z >= 17.5
        if (posRef.current.z < 17.5 && nz >= 17.5) {
          nz = 17.5; // Tahan di dalam portal
          velocityRef.current = 0; // Hentikan mobil
        }
      }

      nx = THREE.MathUtils.clamp(nx, BOUNDS.minX, BOUNDS.maxX);
      nz = THREE.MathUtils.clamp(nz, BOUNDS.minZ, BOUNDS.maxZ);
      posRef.current.set(nx, 0, nz);
    } else {
      velocityRef.current = 0;
    }

    // Update car group directly
    if (carGroupRef.current) {
      carGroupRef.current.position.copy(posRef.current);
      carGroupRef.current.rotation.y = rotRef.current;
    }

    const nx = posRef.current.x;
    const nz = posRef.current.z;

    // Trigger zone checks
    const distEntry = distance(nx, nz, ENTRY_GATE_POS.x, ENTRY_GATE_POS.z);
    const distExit = distance(nx, nz, EXIT_GATE_POS.x, EXIT_GATE_POS.z);

    // Entry gate trigger
    if (!hasTriggeredEntry.current && (phase === "IDLE" || phase === "APPROACHING_ENTRY")) {
      if (distEntry < TRIGGER_RADIUS) {
        hasTriggeredEntry.current = true;
        onEntryZone();
      }
    }

    // Car passed entry gate
    if (!hasPassedEntry.current && phase === "ENTRY_GATE_OPEN") {
      if (distEntry > TRIGGER_RADIUS + 1) {
        hasPassedEntry.current = true;
        onExitedEntryGate();
      }
    }

    // Exit gate trigger
    if (!hasTriggeredExit.current && (phase === "PARKED" || phase === "APPROACHING_EXIT")) {
      if (distExit < TRIGGER_RADIUS) {
        hasTriggeredExit.current = true;
        onExitZone();
      }
    }

    // Car passed exit gate
    if (!hasPassedExit.current && phase === "EXIT_GATE_OPEN") {
      if (distExit > TRIGGER_RADIUS + 1) {
        hasPassedExit.current = true;
        onExitedExitGate();
      }
    }

    // Mutate the shared ref
    if (carPosRef.current) {
      carPosRef.current.x = posRef.current.x;
      carPosRef.current.z = posRef.current.z;
      carPosRef.current.rot = rotRef.current;
    }

    // Dispatch event for HUD minimap (runs outside canvas)
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("car-moved", {
        detail: { x: posRef.current.x, z: posRef.current.z, rot: rotRef.current }
      }));
    }
  });

  return (
    <group ref={carGroupRef}>
      <CarModel position={[0, 0, 0]} rotation={0} />
    </group>
  );
}

// Follow camera
function FollowCamera({ carPosRef }: { carPosRef: React.RefObject<{ x: number; z: number; rot: number }> }) {
  const { camera } = useThree();
  const smoothPos = useRef(new THREE.Vector3(-4.5, 8, 35));

  useFrame(() => {
    const target = carPosRef.current;
    if (!target) return;
    const desired = new THREE.Vector3(
      target.x,
      9, // height
      target.z + 11
    );
    smoothPos.current.lerp(desired, 0.04);
    camera.position.copy(smoothPos.current);
    camera.lookAt(new THREE.Vector3(target.x, 0.5, target.z - 2));
  });

  return null;
}

interface ParkingSceneProps {
  simState: SimulationState;
  onEntryZone: () => void;
  onExitedEntryGate: () => void;
  onExitZone: () => void;
  onExitedExitGate: () => void;
}

export function ParkingScene({
  simState,
  onEntryZone,
  onExitedEntryGate,
  onExitZone,
  onExitedExitGate,
}: ParkingSceneProps) {
  // Shared ref for follow camera (mutated by CarController)
  const carPosRef = useRef({ x: -4.5, z: 24, rot: Math.PI });

  return (
    <Canvas
      shadows
      camera={{ position: [0, 9, 11], fov: 55, near: 0.1, far: 300 }}
      style={{ width: "100%", height: "100%" }}
      gl={{ antialias: true, alpha: false }}
    >
      {/* Sky & Stars */}
      <color attach="background" args={["#020818"]} />
      <Stars radius={120} depth={60} count={4000} factor={4} fade speed={0.5} />

      {/* Ambient light */}
      <ambientLight intensity={0.35} color="#A8D0FF" />

      {/* Moon-like directional light */}
      <directionalLight
        position={[15, 25, 10]}
        intensity={1.2}
        color="#D6E8FF"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={100}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
        shadow-bias={-0.001}
      />

      {/* Entry gate area fill light */}
      <pointLight position={[-4.5, 5, 20]} color="#22C55E" intensity={15} distance={12} />
      {/* Exit gate area fill light */}
      <pointLight position={[8.5, 5, 20]} color="#EF4444" intensity={12} distance={12} />
      {/* General area fill */}
      <pointLight position={[0, 12, 0]} color="#3B82F6" intensity={8} distance={30} />

      {/* === PARKING ENVIRONMENT === */}
      <ParkingEnvironment />

      {/* === ENTRY GATE === */}
      <GateBarrier
        position={[-4.5, 0, 18]}
        isOpen={simState.entryGateOpen}
        type="entry"
        label="● GATE MASUK"
      />

      {/* === EXIT GATE === */}
      <GateBarrier
        position={[8.5, 0, 18]}
        isOpen={simState.exitGateOpen}
        type="exit"
        label="● GATE KELUAR"
      />

      {/* === CAR CONTROLLER === */}
      <CarController
        simState={simState}
        onEntryZone={onEntryZone}
        onExitedEntryGate={onExitedEntryGate}
        onExitZone={onExitZone}
        onExitedExitGate={onExitedExitGate}
        carPosRef={carPosRef}
      />

      {/* === FOLLOW CAMERA === */}
      <FollowCamera carPosRef={carPosRef} />
    </Canvas>
  );
}

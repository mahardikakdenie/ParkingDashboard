"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

interface GateBarrierProps {
  position: [number, number, number];
  isOpen: boolean;
  type: "entry" | "exit";
  label?: string;
}

export function GateBarrier({ position, isOpen, type, label }: GateBarrierProps) {
  const barrierArmRef = useRef<THREE.Mesh>(null);
  const targetRotation = isOpen ? -Math.PI / 2 : 0; // Rotate from 0 to -90deg when open

  useFrame((_, delta) => {
    if (barrierArmRef.current) {
      // Smooth lerp to target rotation
      barrierArmRef.current.rotation.z = THREE.MathUtils.lerp(
        barrierArmRef.current.rotation.z,
        targetRotation,
        delta * 3.5
      );
    }
  });

  const postColor = type === "entry" ? "#F59E0B" : "#EF4444";
  const stripeColors = ["#FBBF24", "#111827"];
  const armColor = type === "entry" ? "#22C55E" : "#EF4444";
  const labelColor = type === "entry" ? "#4ADE80" : "#F87171";
  const labelBg = type === "entry" ? "#14532D" : "#7F1D1D";

  return (
    <group position={position}>
      {/* === GATE POST === */}
      <mesh position={[-1.4, 0.75, 0]} castShadow>
        <boxGeometry args={[0.18, 1.5, 0.18]} />
        <meshStandardMaterial color={postColor} roughness={0.5} />
      </mesh>

      {/* Post stripes */}
      {[0.5, 0.0, -0.5].map((y, i) => (
        <mesh key={i} position={[-1.4, y, 0]}>
          <boxGeometry args={[0.19, 0.14, 0.19]} />
          <meshStandardMaterial color={stripeColors[i % 2]} />
        </mesh>
      ))}

      {/* === DETECTOR BOX (OCR camera housing) === */}
      <mesh position={[-1.4, 1.5, 0.1]} castShadow>
        <boxGeometry args={[0.3, 0.2, 0.22]} />
        <meshStandardMaterial color="#1F2937" roughness={0.7} />
      </mesh>
      {/* Camera lens */}
      <mesh position={[-1.4, 1.5, 0.22]}>
        <circleGeometry args={[0.06, 12]} />
        <meshStandardMaterial color="#DC2626" emissive="#DC2626" emissiveIntensity={0.9} />
      </mesh>
      {/* OCR label on detector */}
      <Text
        position={[-1.4, 1.5, 0.23]}
        fontSize={0.07}
        color="#FF4444"
        anchorX="center"
        anchorY="middle"
      >
        OCR
      </Text>

      {/* === BARRIER ARM (pivot from post) === */}
      <group position={[-1.4, 1.5, 0]}>
        <mesh ref={barrierArmRef} position={[1.5, 0, 0]}>
          {/* The arm: centered at pivot so rotation works */}
          <group position={[1.5, 0, 0]}>
            <mesh castShadow>
              <boxGeometry args={[3.0, 0.1, 0.12]} />
              <meshStandardMaterial color={armColor} roughness={0.4} emissive={armColor} emissiveIntensity={0.15} />
            </mesh>
            {/* Stripes on arm */}
            {[-1.2, -0.6, 0, 0.6, 1.2].map((x, i) => (
              <mesh key={i} position={[x, 0, 0]}>
                <boxGeometry args={[0.2, 0.11, 0.13]} />
                <meshStandardMaterial color={i % 2 === 0 ? "#FFFFFF" : armColor} />
              </mesh>
            ))}
          </group>
        </mesh>
      </group>

      {/* === COUNTER-WEIGHT === */}
      <mesh position={[-1.4 - 0.4, 1.5, 0]} castShadow>
        <boxGeometry args={[0.5, 0.18, 0.18]} />
        <meshStandardMaterial color="#374151" roughness={0.5} />
      </mesh>

      {/* === ROAD SURFACE MARKINGS (stop line) === */}
      <mesh position={[0, 0.01, 0]} receiveShadow>
        <boxGeometry args={[4, 0.02, 0.3]} />
        <meshStandardMaterial color="#FBBF24" roughness={0.9} />
      </mesh>

      {/* === GATE LABEL SIGN === */}
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[2.4, 0.55, 0.06]} />
        <meshStandardMaterial color={labelBg} roughness={0.7} />
      </mesh>
      <Text
        position={[0, 2.5, 0.05]}
        fontSize={0.22}
        color={labelColor}
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/roboto/v32/KFOmCnqEu92Fr1Me5Q.ttf"
        fontWeight="bold"
      >
        {label || (type === "entry" ? "● MASUK" : "● KELUAR")}
      </Text>

      {/* === GATE OPEN/CLOSED LIGHT === */}
      <mesh position={[0, 2.1, 0.05]}>
        <circleGeometry args={[0.12, 12]} />
        <meshStandardMaterial
          color={isOpen ? "#22C55E" : "#EF4444"}
          emissive={isOpen ? "#22C55E" : "#EF4444"}
          emissiveIntensity={1}
        />
      </mesh>
    </group>
  );
}

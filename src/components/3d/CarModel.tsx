"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

interface CarModelProps {
  position?: [number, number, number];
  rotation?: number;
}

export function CarModel({ position, rotation }: CarModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const leftFrontWheelRef = useRef<THREE.Mesh>(null);
  const rightFrontWheelRef = useRef<THREE.Mesh>(null);
  const leftBackWheelRef = useRef<THREE.Mesh>(null);
  const rightBackWheelRef = useRef<THREE.Mesh>(null);

  // Animate wheels spinning
  useFrame((_, delta) => {
    if (groupRef.current && position !== undefined) {
      groupRef.current.position.set(position[0], position[1], position[2]);
    }
    if (groupRef.current && rotation !== undefined) {
      groupRef.current.rotation.y = rotation;
    }
    const spinSpeed = 2;
    [leftFrontWheelRef, rightFrontWheelRef, leftBackWheelRef, rightBackWheelRef].forEach(ref => {
      if (ref.current) {
        ref.current.rotation.x += delta * spinSpeed;
      }
    });
  });

  const carBodyColor = "#DC2626";   // Vibrant red (Ayla red)
  const carRoofColor = "#B91C1C";   // Darker red for roof
  const glassMaterial = { color: "#93C5FD", transparent: true, opacity: 0.6 };
  const wheelColor = "#1F2937";
  const hubColor = "#6B7280";
  const lightYellow = "#FDE68A";
  const lightRed = "#FCA5A5";

  return (
    <group ref={groupRef}>
      {/* === BODY MAIN (lower) === */}
      <mesh position={[0, 0.38, 0]} castShadow>
        <boxGeometry args={[1.8, 0.5, 3.8]} />
        <meshStandardMaterial color={carBodyColor} roughness={0.3} metalness={0.6} />
      </mesh>

      {/* === BODY UPPER / CABIN === */}
      <mesh position={[0, 0.82, -0.1]} castShadow>
        <boxGeometry args={[1.6, 0.55, 2.2]} />
        <meshStandardMaterial color={carBodyColor} roughness={0.3} metalness={0.6} />
      </mesh>

      {/* === ROOF (slightly rounded look via scale) === */}
      <mesh position={[0, 1.12, -0.1]} castShadow>
        <boxGeometry args={[1.5, 0.12, 2.0]} />
        <meshStandardMaterial color={carRoofColor} roughness={0.35} metalness={0.5} />
      </mesh>

      {/* === HOOD/BONNET (front sloped) === */}
      <mesh position={[0, 0.55, 1.2]} rotation={[-0.15, 0, 0]} castShadow>
        <boxGeometry args={[1.7, 0.12, 0.8]} />
        <meshStandardMaterial color={carBodyColor} roughness={0.3} metalness={0.6} />
      </mesh>

      {/* === TRUNK (rear) === */}
      <mesh position={[0, 0.6, -1.4]} castShadow>
        <boxGeometry args={[1.7, 0.18, 0.5]} />
        <meshStandardMaterial color={carBodyColor} roughness={0.3} metalness={0.5} />
      </mesh>

      {/* === WINDSHIELD (front glass) === */}
      <mesh position={[0, 0.85, 0.88]} rotation={[-0.45, 0, 0]}>
        <boxGeometry args={[1.4, 0.55, 0.05]} />
        <meshStandardMaterial {...glassMaterial} />
      </mesh>

      {/* === REAR WINDOW === */}
      <mesh position={[0, 0.85, -1.12]} rotation={[0.45, 0, 0]}>
        <boxGeometry args={[1.35, 0.45, 0.05]} />
        <meshStandardMaterial {...glassMaterial} />
      </mesh>

      {/* === SIDE WINDOWS LEFT === */}
      <mesh position={[-0.81, 0.88, -0.1]}>
        <boxGeometry args={[0.05, 0.35, 1.6]} />
        <meshStandardMaterial {...glassMaterial} />
      </mesh>

      {/* === SIDE WINDOWS RIGHT === */}
      <mesh position={[0.81, 0.88, -0.1]}>
        <boxGeometry args={[0.05, 0.35, 1.6]} />
        <meshStandardMaterial {...glassMaterial} />
      </mesh>

      {/* === FRONT BUMPER === */}
      <mesh position={[0, 0.22, 1.95]} castShadow>
        <boxGeometry args={[1.75, 0.28, 0.12]} />
        <meshStandardMaterial color="#111827" roughness={0.7} />
      </mesh>

      {/* === REAR BUMPER === */}
      <mesh position={[0, 0.22, -1.95]} castShadow>
        <boxGeometry args={[1.75, 0.28, 0.12]} />
        <meshStandardMaterial color="#111827" roughness={0.7} />
      </mesh>

      {/* === HEADLIGHTS (Left & Right) === */}
      <mesh position={[-0.58, 0.42, 1.96]}>
        <boxGeometry args={[0.4, 0.18, 0.04]} />
        <meshStandardMaterial color={lightYellow} emissive={lightYellow} emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[0.58, 0.42, 1.96]}>
        <boxGeometry args={[0.4, 0.18, 0.04]} />
        <meshStandardMaterial color={lightYellow} emissive={lightYellow} emissiveIntensity={0.8} />
      </mesh>

      {/* === TAILLIGHTS (Left & Right) === */}
      <mesh position={[-0.58, 0.42, -1.96]}>
        <boxGeometry args={[0.4, 0.18, 0.04]} />
        <meshStandardMaterial color={lightRed} emissive={lightRed} emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0.58, 0.42, -1.96]}>
        <boxGeometry args={[0.4, 0.18, 0.04]} />
        <meshStandardMaterial color={lightRed} emissive={lightRed} emissiveIntensity={0.6} />
      </mesh>

      {/* === GRILLE === */}
      <mesh position={[0, 0.35, 1.97]}>
        <boxGeometry args={[0.7, 0.18, 0.04]} />
        <meshStandardMaterial color="#1F2937" roughness={0.8} />
      </mesh>

      {/* === WHEELS (4x) === */}
      {/* Front Left */}
      <mesh ref={leftFrontWheelRef} position={[-0.95, 0.22, 1.1]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.28, 0.28, 0.2, 16]} />
        <meshStandardMaterial color={wheelColor} roughness={0.8} />
      </mesh>
      <mesh position={[-0.99, 0.22, 1.1]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.16, 0.16, 0.22, 8]} />
        <meshStandardMaterial color={hubColor} metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Front Right */}
      <mesh ref={rightFrontWheelRef} position={[0.95, 0.22, 1.1]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.28, 0.28, 0.2, 16]} />
        <meshStandardMaterial color={wheelColor} roughness={0.8} />
      </mesh>
      <mesh position={[0.99, 0.22, 1.1]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.16, 0.16, 0.22, 8]} />
        <meshStandardMaterial color={hubColor} metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Rear Left */}
      <mesh ref={leftBackWheelRef} position={[-0.95, 0.22, -1.1]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.28, 0.28, 0.2, 16]} />
        <meshStandardMaterial color={wheelColor} roughness={0.8} />
      </mesh>
      <mesh position={[-0.99, 0.22, -1.1]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.16, 0.16, 0.22, 8]} />
        <meshStandardMaterial color={hubColor} metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Rear Right */}
      <mesh ref={rightBackWheelRef} position={[0.95, 0.22, -1.1]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.28, 0.28, 0.2, 16]} />
        <meshStandardMaterial color={wheelColor} roughness={0.8} />
      </mesh>
      <mesh position={[0.99, 0.22, -1.1]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.16, 0.16, 0.22, 8]} />
        <meshStandardMaterial color={hubColor} metalness={0.8} roughness={0.2} />
      </mesh>

      {/* === LICENSE PLATE FRONT === */}
      <mesh position={[0, 0.38, 2.01]}>
        <boxGeometry args={[0.6, 0.14, 0.02]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
      <Text
        position={[0, 0.38, 2.03]}
        fontSize={0.075}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/roboto/v32/KFOmCnqEu92Fr1Me5Q.ttf"
      >
        B 8789 DI
      </Text>

      {/* === LICENSE PLATE REAR === */}
      <mesh position={[0, 0.38, -2.01]}>
        <boxGeometry args={[0.6, 0.14, 0.02]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
      <Text
        position={[0, 0.38, -2.03]}
        fontSize={0.075}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
        rotation={[0, Math.PI, 0]}
        font="https://fonts.gstatic.com/s/roboto/v32/KFOmCnqEu92Fr1Me5Q.ttf"
      >
        B 8789 DI
      </Text>

      {/* === DOOR HANDLES === */}
      <mesh position={[-0.92, 0.7, 0.4]}>
        <boxGeometry args={[0.04, 0.05, 0.15]} />
        <meshStandardMaterial color="#9CA3AF" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0.92, 0.7, 0.4]}>
        <boxGeometry args={[0.04, 0.05, 0.15]} />
        <meshStandardMaterial color="#9CA3AF" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

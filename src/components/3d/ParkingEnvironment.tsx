"use client";

// Static parked cars in random slots
const PARKED_CARS = [
  { position: [-8, 0.38, -8] as [number, number, number], color: "#1D4ED8", rotation: 0 },
  { position: [-4, 0.38, -8] as [number, number, number], color: "#065F46", rotation: 0 },
  { position: [4, 0.38, -8] as [number, number, number], color: "#92400E", rotation: 0 },
  { position: [-8, 0.38, 8] as [number, number, number], color: "#5B21B6", rotation: Math.PI },
  { position: [4, 0.38, 8] as [number, number, number], color: "#9D174D", rotation: Math.PI },
];

function StaticCar({ position, color, rotation }: { position: [number, number, number]; color: string; rotation: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Body */}
      <mesh castShadow>
        <boxGeometry args={[1.7, 0.48, 3.6]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 0.45, -0.1]} castShadow>
        <boxGeometry args={[1.5, 0.5, 2.0]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Wheels */}
      {([-0.9, 0.9] as number[]).map((x) =>
        ([-1.0, 1.0] as number[]).map((z) => (
          <mesh key={`${x}-${z}`} position={[x, -0.18, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.26, 0.26, 0.18, 12]} />
            <meshStandardMaterial color="#111827" roughness={0.9} />
          </mesh>
        ))
      )}
    </group>
  );
}

function ParkingSlot({ position, occupied }: { position: [number, number, number]; occupied: boolean }) {
  return (
    <group position={position}>
      {/* Slot background */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[3.2, 5.0]} />
        <meshStandardMaterial color={occupied ? "#1E3A5F" : "#1E293B"} roughness={0.9} />
      </mesh>
      {/* Slot lines */}
      {/* Left line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1.55, 0.015, 0]}>
        <planeGeometry args={[0.08, 5.0]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.9} opacity={0.8} transparent />
      </mesh>
      {/* Right line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1.55, 0.015, 0]}>
        <planeGeometry args={[0.08, 5.0]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.9} opacity={0.8} transparent />
      </mesh>
    </group>
  );
}

function Tree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Trunk */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.15, 1.2, 8]} />
        <meshStandardMaterial color="#78350F" roughness={0.9} />
      </mesh>
      {/* Foliage layers */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <coneGeometry args={[0.8, 1.2, 8]} />
        <meshStandardMaterial color="#166534" roughness={0.8} />
      </mesh>
      <mesh position={[0, 2.3, 0]} castShadow>
        <coneGeometry args={[0.55, 0.9, 8]} />
        <meshStandardMaterial color="#15803D" roughness={0.8} />
      </mesh>
      <mesh position={[0, 2.85, 0]} castShadow>
        <coneGeometry args={[0.3, 0.6, 8]} />
        <meshStandardMaterial color="#16A34A" roughness={0.8} />
      </mesh>
    </group>
  );
}

function SecurityBooth({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Booth main structure */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <boxGeometry args={[1.4, 1.5, 1.2]} />
        <meshStandardMaterial color="#334155" roughness={0.5} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 1.58, 0]} castShadow>
        <boxGeometry args={[1.6, 0.12, 1.4]} />
        <meshStandardMaterial color="#1E3A8A" roughness={0.5} />
      </mesh>
      {/* Window */}
      <mesh position={[0, 0.85, 0.61]}>
        <boxGeometry args={[0.8, 0.5, 0.05]} />
        <meshStandardMaterial color="#93C5FD" transparent opacity={0.6} />
      </mesh>
      {/* Door */}
      <mesh position={[0, 0.45, 0.61]}>
        <boxGeometry args={[0.45, 0.9, 0.04]} />
        <meshStandardMaterial color="#1E293B" roughness={0.7} />
      </mesh>
    </group>
  );
}

function RoadArrow({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <planeGeometry args={[0.5, 1.2]} />
        <meshStandardMaterial color="#FBBF24" opacity={0.7} transparent roughness={0.9} />
      </mesh>
    </group>
  );
}

export function ParkingEnvironment() {
  // Parking slot positions (top row and bottom row)
  const topSlots = [-10, -6, -2, 2, 6, 10];
  const bottomSlots = [-10, -6, -2, 2, 6, 10];
  const occupiedTop = new Set([0, 2, 4]);   // indices of occupied top slots
  const occupiedBottom = new Set([1, 3]);    // indices of occupied bottom slots

  return (
    <group>
      {/* ===== GROUND PLANE ===== */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#0F172A" roughness={0.9} />
      </mesh>

      {/* ===== PARKING AREA SURFACE ===== */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <planeGeometry args={[32, 36]} />
        <meshStandardMaterial color="#1E293B" roughness={0.8} />
      </mesh>

      {/* ===== DRIVING LANE ===== */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]}>
        <planeGeometry args={[8, 36]} />
        <meshStandardMaterial color="#111827" roughness={0.7} />
      </mesh>

      {/* Lane dashed center line */}
      {[-12, -8, -4, 0, 4, 8, 12].map((z, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, z]}>
          <planeGeometry args={[0.1, 2.5]} />
          <meshStandardMaterial color="#FBBF24" opacity={0.5} transparent roughness={0.9} />
        </mesh>
      ))}

      {/* ===== PARKING SLOTS - TOP ROW ===== */}
      {topSlots.map((x, i) => (
        <ParkingSlot key={`top-${i}`} position={[x - 3, 0, -12]} occupied={occupiedTop.has(i)} />
      ))}

      {/* ===== PARKING SLOTS - BOTTOM ROW ===== */}
      {bottomSlots.map((x, i) => (
        <ParkingSlot key={`bot-${i}`} position={[x - 3, 0, 12]} occupied={occupiedBottom.has(i)} />
      ))}

      {/* ===== STATIC PARKED CARS ===== */}
      {PARKED_CARS.map((car, i) => (
        <StaticCar key={i} {...car} />
      ))}

      {/* ===== BOUNDARY WALLS ===== */}
      {/* North Wall */}
      <mesh position={[0, 1.0, -18]} castShadow receiveShadow>
        <boxGeometry args={[36, 2.0, 0.4]} />
        <meshStandardMaterial color="#1E3A8A" roughness={0.6} />
      </mesh>
      {/* Top cap stripe */}
      <mesh position={[0, 2.08, -18]}>
        <boxGeometry args={[36, 0.16, 0.5]} />
        <meshStandardMaterial color="#3B82F6" emissive="#3B82F6" emissiveIntensity={0.3} />
      </mesh>

      {/* West Wall */}
      <mesh position={[-18, 1.0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 2.0, 36]} />
        <meshStandardMaterial color="#1E3A8A" roughness={0.6} />
      </mesh>
      <mesh position={[-18, 2.08, 0]}>
        <boxGeometry args={[0.5, 0.16, 36]} />
        <meshStandardMaterial color="#3B82F6" emissive="#3B82F6" emissiveIntensity={0.3} />
      </mesh>

      {/* East Wall */}
      <mesh position={[18, 1.0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 2.0, 36]} />
        <meshStandardMaterial color="#1E3A8A" roughness={0.6} />
      </mesh>
      <mesh position={[18, 2.08, 0]}>
        <boxGeometry args={[0.5, 0.16, 36]} />
        <meshStandardMaterial color="#3B82F6" emissive="#3B82F6" emissiveIntensity={0.3} />
      </mesh>

      {/* South Wall - split with gate openings */}
      {/* Left section */}
      <mesh position={[-11, 1.0, 18]} castShadow receiveShadow>
        <boxGeometry args={[14, 2.0, 0.4]} />
        <meshStandardMaterial color="#1E3A8A" roughness={0.6} />
      </mesh>
      <mesh position={[-11, 2.08, 18]}>
        <boxGeometry args={[14, 0.16, 0.5]} />
        <meshStandardMaterial color="#3B82F6" emissive="#3B82F6" emissiveIntensity={0.3} />
      </mesh>
      {/* Middle section between gates */}
      <mesh position={[3, 1.0, 18]} castShadow receiveShadow>
        <boxGeometry args={[4, 2.0, 0.4]} />
        <meshStandardMaterial color="#1E3A8A" roughness={0.6} />
      </mesh>
      <mesh position={[3, 2.08, 18]}>
        <boxGeometry args={[4, 0.16, 0.5]} />
        <meshStandardMaterial color="#3B82F6" emissive="#3B82F6" emissiveIntensity={0.3} />
      </mesh>
      {/* Right section */}
      <mesh position={[13, 1.0, 18]} castShadow receiveShadow>
        <boxGeometry args={[10, 2.0, 0.4]} />
        <meshStandardMaterial color="#1E3A8A" roughness={0.6} />
      </mesh>
      <mesh position={[13, 2.08, 18]}>
        <boxGeometry args={[10, 0.16, 0.5]} />
        <meshStandardMaterial color="#3B82F6" emissive="#3B82F6" emissiveIntensity={0.3} />
      </mesh>

      {/* ===== ENTRY/EXIT ROAD SURFACES ===== */}
      {/* Entry road */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[-4.5, 0.004, 22]}>
        <planeGeometry args={[6, 8]} />
        <meshStandardMaterial color="#111827" roughness={0.7} />
      </mesh>
      {/* Exit road */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[8.5, 0.004, 22]}>
        <planeGeometry args={[6, 8]} />
        <meshStandardMaterial color="#111827" roughness={0.7} />
      </mesh>

      {/* ===== TREES ===== */}
      <Tree position={[-16, 0, -14]} />
      <Tree position={[-16, 0, 0]} />
      <Tree position={[-16, 0, 14]} />
      <Tree position={[16, 0, -14]} />
      <Tree position={[16, 0, 0]} />
      <Tree position={[16, 0, 14]} />
      <Tree position={[-8, 0, -20]} />
      <Tree position={[0, 0, -20]} />
      <Tree position={[8, 0, -20]} />

      {/* ===== SECURITY BOOTH ===== */}
      <SecurityBooth position={[-15, 0, 17]} />

      {/* ===== ROAD ARROWS ===== */}
      <RoadArrow position={[-4.5, 0, 20]} rotation={0} />
      <RoadArrow position={[8.5, 0, 20]} rotation={Math.PI} />
      <RoadArrow position={[0, 0, 0]} rotation={0} />
      <RoadArrow position={[0, 0, -6]} rotation={0} />

      {/* ===== LIGHT POLES ===== */}
      {[[-14, 0, -10], [14, 0, -10], [-14, 0, 10], [14, 0, 10]].map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          <mesh position={[0, 2.5, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.09, 5.0, 8]} />
            <meshStandardMaterial color="#374151" roughness={0.6} metalness={0.4} />
          </mesh>
          <mesh position={[0.35, 5.0, 0]}>
            <boxGeometry args={[0.7, 0.1, 0.1]} />
            <meshStandardMaterial color="#374151" roughness={0.6} />
          </mesh>
          <mesh position={[0.7, 4.95, 0]}>
            <boxGeometry args={[0.3, 0.15, 0.25]} />
            <meshStandardMaterial color="#FDE68A" emissive="#FDE68A" emissiveIntensity={0.8} />
          </mesh>
          <pointLight position={[0.7, 4.7, 0]} color="#FDE68A" intensity={30} distance={12} castShadow />
        </group>
      ))}

      {/* ===== PARKING NUMBER MARKERS ===== */}
      {topSlots.map((x, i) => (
        <mesh key={`topnum-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[x - 3, 0.013, -14]}>
          <planeGeometry args={[0.6, 0.4]} />
          <meshStandardMaterial color="#334155" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

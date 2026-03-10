import { useMemo } from 'react'
import * as THREE from 'three'
import type { Seat, Tool } from '../types'

/* ═══════════════════════════════════════════
   3D Café Items on Counter
   Mug (LatheGeometry), Laptop (Box), Book (Box)
   ═══════════════════════════════════════════ */

const SEAT_COUNT = 6
const X_START = -3.6
const X_END = 3.6
const COUNTER_Y = -1.78  // slightly above counter surface
const COUNTER_Z = 1.6    // on the counter

/* ── Coffee Mug (LatheGeometry) ── */
function CoffeeMug3D({ position }: { position: [number, number, number] }) {
  const mugGeo = useMemo(() => {
    // Profile points for lathe: bottom to top, right side
    const pts = [
      new THREE.Vector2(0.0, 0.0),    // center bottom
      new THREE.Vector2(0.14, 0.0),   // bottom edge
      new THREE.Vector2(0.15, 0.01),  // bottom chamfer
      new THREE.Vector2(0.15, 0.28),  // side wall
      new THREE.Vector2(0.16, 0.30),  // lip flare
      new THREE.Vector2(0.155, 0.31), // lip top
      new THREE.Vector2(0.13, 0.30),  // inner lip
      new THREE.Vector2(0.12, 0.28),  // inner wall top
      new THREE.Vector2(0.12, 0.02),  // inner wall bottom
      new THREE.Vector2(0.0, 0.02),   // inner bottom
    ]
    return new THREE.LatheGeometry(pts, 24)
  }, [])

  const handleGeo = useMemo(() => {
    return new THREE.TorusGeometry(0.08, 0.018, 8, 16, Math.PI)
  }, [])

  return (
    <group position={position}>
      {/* Mug body */}
      <mesh geometry={mugGeo} castShadow receiveShadow>
        <meshStandardMaterial
          color="#e8ddd0"
          roughness={0.85}
          metalness={0.0}
        />
      </mesh>

      {/* Handle */}
      <mesh
        geometry={handleGeo}
        position={[0.16, 0.16, 0]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
      >
        <meshStandardMaterial
          color="#e8ddd0"
          roughness={0.85}
          metalness={0.0}
        />
      </mesh>

      {/* Coffee liquid surface */}
      <mesh position={[0, 0.26, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.115, 16]} />
        <meshStandardMaterial
          color="#2a1508"
          roughness={0.3}
          metalness={0.0}
        />
      </mesh>
    </group>
  )
}

/* ── Laptop (BoxGeometry) ── */
function Laptop3D({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Base / keyboard */}
      <mesh position={[0, 0.015, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.45, 0.02, 0.30]} />
        <meshStandardMaterial
          color="#2a2a2e"
          roughness={0.6}
          metalness={0.3}
        />
      </mesh>

      {/* Screen — slightly tilted back */}
      <group position={[0, 0.025, -0.14]} rotation={[-0.25, 0, 0]}>
        <mesh position={[0, 0.16, 0]} castShadow>
          <boxGeometry args={[0.44, 0.30, 0.008]} />
          <meshStandardMaterial
            color="#1a1a1e"
            roughness={0.5}
            metalness={0.3}
          />
        </mesh>

        {/* Screen glow */}
        <mesh position={[0, 0.16, 0.005]}>
          <planeGeometry args={[0.38, 0.24]} />
          <meshBasicMaterial
            color="#4488cc"
            transparent
            opacity={0.15}
          />
        </mesh>

        {/* Screen light emission */}
        <pointLight
          position={[0, 0.16, 0.05]}
          color="#6699cc"
          intensity={0.08}
          distance={1.5}
          decay={2}
        />
      </group>
    </group>
  )
}

/* ── Book (BoxGeometry) ── */
function Book3D({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Book cover */}
      <mesh position={[0, 0.04, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.22, 0.06, 0.30]} />
        <meshStandardMaterial
          color="#6b3a2a"
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>

      {/* Pages (slightly inset, lighter) */}
      <mesh position={[0.005, 0.04, 0]}>
        <boxGeometry args={[0.19, 0.05, 0.28]} />
        <meshStandardMaterial
          color="#f0e8d8"
          roughness={0.95}
          metalness={0.0}
        />
      </mesh>
    </group>
  )
}

/* ── Notebook + Pen ── */
function Notebook3D({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Notebook */}
      <mesh position={[0, 0.015, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.24, 0.02, 0.32]} />
        <meshStandardMaterial
          color="#3a3530"
          roughness={0.85}
          metalness={0.0}
        />
      </mesh>

      {/* Pen */}
      <mesh
        position={[0.08, 0.035, 0.02]}
        rotation={[0, 0.3, Math.PI / 2]}
        castShadow
      >
        <cylinderGeometry args={[0.008, 0.008, 0.22, 8]} />
        <meshStandardMaterial
          color="#1a1a1e"
          roughness={0.4}
          metalness={0.5}
        />
      </mesh>
    </group>
  )
}

/* ── Item selector by tool type ── */
function SeatItem({ tool, position }: { tool: Tool; position: [number, number, number] }) {
  switch (tool) {
    case 'laptop':
      return <Laptop3D position={position} />
    case 'book':
      return <Book3D position={position} />
    case 'notebook':
      return <Notebook3D position={position} />
    default:
      return null
  }
}

/* ── All items on the counter ── */
export function CafeItems({ seats }: { seats: Seat[] }) {
  const xStep = SEAT_COUNT > 1 ? (X_END - X_START) / (SEAT_COUNT - 1) : 0

  return (
    <group>
      {seats.map((seat, i) => {
        if (!seat.occupied) return null
        const x = X_START + i * xStep

        return (
          <group key={seat.id}>
            {/* Coffee mug — always present when occupied */}
            <CoffeeMug3D position={[x + 0.25, COUNTER_Y, COUNTER_Z]} />

            {/* Tool item */}
            {seat.tool && seat.tool !== 'none' && (
              <SeatItem
                tool={seat.tool}
                position={[x - 0.1, COUNTER_Y, COUNTER_Z - 0.2]}
              />
            )}
          </group>
        )
      })}
    </group>
  )
}

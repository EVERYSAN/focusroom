import { useMemo } from 'react'
import * as THREE from 'three'
import type { Seat } from '../types'

/* ═══════════════════════════════════════════
   3D Bar Stools
   CylinderGeometry seat + 4 legs + footrest ring
   ═══════════════════════════════════════════ */

const SEAT_COUNT = 6
const X_START = -3.6
const X_END = 3.6
const STOOL_Y = -3.2    // stool seat height
const STOOL_Z = 3.8     // in front of counter
const FLOOR_Y = -4.5    // floor level

/* ── Single Stool ── */
function BarStool({ position, occupied }: { position: [number, number, number]; occupied: boolean }) {
  const seatGeo = useMemo(() => new THREE.CylinderGeometry(0.18, 0.17, 0.06, 16), [])
  const legGeo = useMemo(() => new THREE.CylinderGeometry(0.012, 0.014, 1.2, 6), [])
  const ringGeo = useMemo(() => new THREE.TorusGeometry(0.12, 0.008, 6, 16), [])

  const metalMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1a1815',
    roughness: 0.5,
    metalness: 0.6,
  }), [])

  const seatMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: occupied ? '#3a2a1a' : '#2a2018',
    roughness: 0.8,
    metalness: 0.05,
  }), [occupied])

  const legPositions: [number, number, number][] = [
    [0.1, -0.6, 0.1],
    [-0.1, -0.6, 0.1],
    [0.1, -0.6, -0.1],
    [-0.1, -0.6, -0.1],
  ]

  const legTilts: [number, number, number][] = [
    [0.08, 0, -0.08],
    [0.08, 0, 0.08],
    [-0.08, 0, -0.08],
    [-0.08, 0, 0.08],
  ]

  return (
    <group position={position}>
      {/* Seat cushion */}
      <mesh geometry={seatGeo} material={seatMat} castShadow receiveShadow />

      {/* 4 Legs */}
      {legPositions.map((pos, i) => (
        <mesh
          key={i}
          geometry={legGeo}
          material={metalMat}
          position={pos}
          rotation={legTilts[i]}
          castShadow
        />
      ))}

      {/* Footrest ring */}
      <mesh
        geometry={ringGeo}
        material={metalMat}
        position={[0, -0.85, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      />
    </group>
  )
}

export function Stools3D({ seats }: { seats: Seat[] }) {
  const xStep = SEAT_COUNT > 1 ? (X_END - X_START) / (SEAT_COUNT - 1) : 0

  return (
    <group>
      {seats.map((seat, i) => {
        const x = X_START + i * xStep
        return (
          <BarStool
            key={seat.id}
            position={[x, STOOL_Y, STOOL_Z]}
            occupied={seat.occupied}
          />
        )
      })}
    </group>
  )
}

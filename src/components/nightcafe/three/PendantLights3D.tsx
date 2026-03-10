import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Seat } from '../types'
import { getWarmthLevel } from '../CafeSeat'

const SEAT_COUNT = 6
const X_START = -2.2
const X_END = 2.2
const Y_POS = -1.8   // near bottom of window
const Z_POS = 2.0     // in front of glass

/* Warmth → intensity + color mapping */
const WARMTH_CONFIG = [
  { intensity: 0, color: new THREE.Color('#000000') },       // 0: off
  { intensity: 0.4, color: new THREE.Color('#FFA040') },     // 1: warm-up
  { intensity: 0.7, color: new THREE.Color('#FF8C20') },     // 2: focused
  { intensity: 1.2, color: new THREE.Color('#FFD080') },     // 3: deep focus
]

interface PendantLights3DProps {
  seats: Seat[]
}

export function PendantLights3D({ seats }: PendantLights3DProps) {
  const lightsRef = useRef<(THREE.PointLight | null)[]>([])

  // Smooth lerp each frame
  useFrame(() => {
    for (let i = 0; i < SEAT_COUNT; i++) {
      const light = lightsRef.current[i]
      if (!light) continue

      const seat = seats[i]
      const warmth = seat?.occupied ? getWarmthLevel(seat.joinedAt) : 0
      const target = WARMTH_CONFIG[warmth] || WARMTH_CONFIG[0]

      // Lerp intensity
      light.intensity = THREE.MathUtils.lerp(light.intensity, target.intensity, 0.04)
      // Lerp color
      light.color.lerp(target.color, 0.04)
    }
  })

  const xStep = SEAT_COUNT > 1 ? (X_END - X_START) / (SEAT_COUNT - 1) : 0

  return (
    <group>
      {Array.from({ length: SEAT_COUNT }).map((_, i) => {
        const x = X_START + i * xStep
        return (
          <pointLight
            key={i}
            ref={(el) => { lightsRef.current[i] = el }}
            position={[x, Y_POS, Z_POS]}
            intensity={0}
            distance={5}
            decay={2}
            color="#000000"
          />
        )
      })}
    </group>
  )
}

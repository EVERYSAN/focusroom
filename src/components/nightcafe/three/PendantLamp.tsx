import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Seat } from '../types'
import { getWarmthLevel } from '../CafeSeat'

/* ═══════════════════════════════════════════
   3D Pendant Lamp
   LatheGeometry shade + SpotLight with shadows
   ═══════════════════════════════════════════ */

const X_START = -3.6
const X_END = 3.6
const Y_CEILING = 3.5
const Y_LAMP = 0.5
const Z_POS = 2.0

/* Warmth → light config
   "occupied" seats always get at least a dim light (warmth 0 when occupied)
   Unoccupied = truly off */
const WARMTH_OFF = {
  spot: 0, point: 0, emissive: 0,
  color: new THREE.Color('#000000'), spotAngle: 0.5,
}
const WARMTH_CONFIG = [
  // 0: just joined (<10 min) — dim warm glow
  { spot: 2.0, point: 0.4, emissive: 0.4, color: new THREE.Color('#FF9030'), spotAngle: 0.55 },
  // 1: warm-up (10-30 min)
  { spot: 4.0, point: 0.8, emissive: 0.7, color: new THREE.Color('#FFA040'), spotAngle: 0.6 },
  // 2: focused (30-60 min)
  { spot: 6.0, point: 1.2, emissive: 1.0, color: new THREE.Color('#FFB050'), spotAngle: 0.65 },
  // 3: deep focus (>60 min)
  { spot: 9.0, point: 1.8, emissive: 1.5, color: new THREE.Color('#FFD080'), spotAngle: 0.7 },
]

interface PendantLampProps {
  index: number
  seat: Seat
  total: number
}

export function PendantLamp({ index, seat, total }: PendantLampProps) {
  const spotRef = useRef<THREE.SpotLight>(null)
  const pointRef = useRef<THREE.PointLight>(null)
  const bulbRef = useRef<THREE.Mesh>(null)
  const targetRef = useRef<THREE.Object3D>(null)

  const xStep = total > 1 ? (X_END - X_START) / (total - 1) : 0
  const x = X_START + index * xStep

  const shadeGeo = useMemo(() => {
    const pts = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.06, 0.0),
      new THREE.Vector2(0.18, -0.12),
      new THREE.Vector2(0.17, -0.13),
      new THREE.Vector2(0.05, -0.01),
      new THREE.Vector2(0.0, -0.01),
    ]
    return new THREE.LatheGeometry(pts, 24)
  }, [])

  /* Wire SpotLight target after mount */
  useEffect(() => {
    if (spotRef.current && targetRef.current) {
      spotRef.current.target = targetRef.current
      spotRef.current.target.updateMatrixWorld()
    }
  }, [])

  useFrame(() => {
    const isOccupied = seat?.occupied ?? false
    const warmth = isOccupied ? getWarmthLevel(seat.joinedAt) : -1
    const cfg = warmth >= 0 ? (WARMTH_CONFIG[warmth] || WARMTH_CONFIG[0]) : WARMTH_OFF
    const lerpSpeed = 0.08 // faster lerp

    // SpotLight
    if (spotRef.current) {
      spotRef.current.intensity = THREE.MathUtils.lerp(
        spotRef.current.intensity, cfg.spot, lerpSpeed
      )
      spotRef.current.color.lerp(cfg.color, lerpSpeed)
      spotRef.current.angle = THREE.MathUtils.lerp(
        spotRef.current.angle, cfg.spotAngle, lerpSpeed
      )
    }

    // PointLight (soft fill)
    if (pointRef.current) {
      pointRef.current.intensity = THREE.MathUtils.lerp(
        pointRef.current.intensity, cfg.point, lerpSpeed
      )
      pointRef.current.color.lerp(cfg.color, lerpSpeed)
    }

    // Bulb emissive glow
    if (bulbRef.current) {
      const mat = bulbRef.current.material as THREE.MeshStandardMaterial
      const targetEmissive = cfg.color.clone().multiplyScalar(cfg.emissive)
      mat.emissive.lerp(targetEmissive, lerpSpeed)
      mat.emissiveIntensity = THREE.MathUtils.lerp(
        mat.emissiveIntensity, cfg.emissive > 0 ? 3.0 : 0, lerpSpeed
      )
    }
  })

  return (
    <group position={[x, Y_LAMP, Z_POS]}>
      {/* Cord */}
      <mesh position={[0, (Y_CEILING - Y_LAMP) / 2, 0]}>
        <cylinderGeometry args={[0.005, 0.005, Y_CEILING - Y_LAMP, 4]} />
        <meshStandardMaterial color="#2a2520" roughness={0.9} />
      </mesh>

      {/* Shade */}
      <mesh geometry={shadeGeo} castShadow>
        <meshStandardMaterial
          color="#2a2018"
          roughness={0.8}
          metalness={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Bulb */}
      <mesh ref={bulbRef} position={[0, -0.06, 0]}>
        <sphereGeometry args={[0.04, 12, 8]} />
        <meshStandardMaterial
          color="#fff8e0"
          emissive="#000000"
          emissiveIntensity={0}
          roughness={0.3}
        />
      </mesh>

      {/* SpotLight target */}
      <object3D ref={targetRef} position={[0, -3.5, 0.5]} />

      {/* SpotLight (main directional down) */}
      <spotLight
        ref={spotRef}
        position={[0, -0.1, 0]}
        intensity={0}
        color="#000000"
        angle={0.5}
        penumbra={0.7}
        distance={10}
        decay={2}
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
        shadow-bias={-0.001}
      />

      {/* PointLight (soft omnidirectional fill) */}
      <pointLight
        ref={pointRef}
        position={[0, -0.15, 0]}
        intensity={0}
        color="#000000"
        distance={5}
        decay={2}
      />
    </group>
  )
}

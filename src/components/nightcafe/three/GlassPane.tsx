import { useMemo } from 'react'
import * as THREE from 'three'

/* ── Water droplet positions (randomized once) ── */
interface Droplet {
  x: number
  y: number
  z: number
  radius: number
}

function generateDroplets(count: number): Droplet[] {
  const drops: Droplet[] = []
  for (let i = 0; i < count; i++) {
    drops.push({
      x: (Math.random() - 0.5) * 5.5,
      y: (Math.random() - 0.5) * 4,
      z: 1.52 + Math.random() * 0.02, // just in front of glass
      radius: 0.015 + Math.random() * 0.04,
    })
  }
  return drops
}

/* ── Single water droplet ── */
function WaterDroplet({ drop }: { drop: Droplet }) {
  return (
    <mesh position={[drop.x, drop.y, drop.z]}>
      <sphereGeometry args={[drop.radius, 12, 8]} />
      <meshPhysicalMaterial
        color="#aaccdd"
        transparent
        opacity={0.35}
        roughness={0.05}
        metalness={0}
        transmission={0.6}
        ior={1.33}
        thickness={0.02}
        envMapIntensity={0.2}
      />
    </mesh>
  )
}

/* ── Glass Pane + Droplets ── */
export function GlassPane() {
  const droplets = useMemo(() => generateDroplets(14), [])

  return (
    <group>
      {/* Main glass pane — very subtle, mostly transparent */}
      <mesh position={[0, 0, 1.5]}>
        <planeGeometry args={[8, 6]} />
        <meshPhysicalMaterial
          color="#1a2030"
          transparent
          opacity={0.04}
          roughness={0.15}
          metalness={0}
          envMapIntensity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Condensation haze — a slightly foggy overlay */}
      <mesh position={[0, -0.8, 1.51]}>
        <planeGeometry args={[7, 3]} />
        <meshBasicMaterial
          color="#8090a0"
          transparent
          opacity={0.015}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Water droplets */}
      {droplets.map((drop, i) => (
        <WaterDroplet key={i} drop={drop} />
      ))}
    </group>
  )
}

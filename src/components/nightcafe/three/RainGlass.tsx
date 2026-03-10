import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/* ═══════════════════════════════════════════
   Rain-on-Glass Effect
   Canvas2D dynamic normal map + MeshPhysicalMaterial
   ═══════════════════════════════════════════ */

const CANVAS_SIZE = 512
const LARGE_DROP_COUNT = 18
const SMALL_DROP_COUNT = 50

interface RainDrop {
  x: number
  y: number
  speed: number
  radius: number
  trail: number[]  // previous y positions for trail
  wobble: number
  wobbleSpeed: number
  phase: number
}

interface SmallDrop {
  x: number
  y: number
  radius: number
  opacity: number
}

function createLargeDrops(): RainDrop[] {
  const drops: RainDrop[] = []
  for (let i = 0; i < LARGE_DROP_COUNT; i++) {
    drops.push({
      x: Math.random() * CANVAS_SIZE,
      y: Math.random() * CANVAS_SIZE,
      speed: 0.3 + Math.random() * 0.8,
      radius: 4 + Math.random() * 8,
      trail: [],
      wobble: 1 + Math.random() * 2,
      wobbleSpeed: 0.5 + Math.random() * 1.5,
      phase: Math.random() * Math.PI * 2,
    })
  }
  return drops
}

function createSmallDrops(): SmallDrop[] {
  const drops: SmallDrop[] = []
  for (let i = 0; i < SMALL_DROP_COUNT; i++) {
    drops.push({
      x: Math.random() * CANVAS_SIZE,
      y: Math.random() * CANVAS_SIZE,
      radius: 1.5 + Math.random() * 3,
      opacity: 0.3 + Math.random() * 0.7,
    })
  }
  return drops
}

/* Draw a single water droplet as a normal-mapped circle on the canvas */
function drawDroplet(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  radius: number,
  strength: number = 1.0,
) {
  // Normal map encodes normals as RGB: R=x, G=y, B=z
  // Flat surface = (128, 128, 255) = pointing straight out
  // Droplet bends light inward at edges, creating refraction

  const r2 = radius * radius
  const step = Math.max(1, Math.floor(radius / 6))

  for (let dy = -radius; dy <= radius; dy += step) {
    for (let dx = -radius; dx <= radius; dx += step) {
      const dist2 = dx * dx + dy * dy
      if (dist2 > r2) continue

      const px = Math.round(cx + dx)
      const py = Math.round(cy + dy)
      if (px < 0 || px >= CANVAS_SIZE || py < 0 || py >= CANVAS_SIZE) continue

      const dist = Math.sqrt(dist2) / radius
      const falloff = 1 - dist * dist  // quadratic falloff

      // Normal direction: points away from center
      const nx = (dx / radius) * falloff * strength
      const ny = (dy / radius) * falloff * strength

      // Encode to 0-255: 128 = neutral
      const r = Math.round(128 + nx * 127)
      const g = Math.round(128 - ny * 127)  // flip Y for GL convention
      const b = 255  // z always up

      const alpha = falloff * strength * 0.85

      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
      ctx.fillRect(px, py, step, step)
    }
  }
}

/* Draw trail (streak behind a falling drop) */
function drawTrail(
  ctx: CanvasRenderingContext2D,
  x: number,
  trail: number[],
  radius: number,
) {
  for (let i = 0; i < trail.length; i++) {
    const age = i / trail.length  // 0 = newest, 1 = oldest
    const trailRadius = radius * (0.3 + 0.4 * (1 - age))
    const strength = (1 - age) * 0.4
    drawDroplet(ctx, x, trail[i], trailRadius, strength)
  }
}

export function RainGlass() {
  const meshRef = useRef<THREE.Mesh>(null)

  const { ctx, normalTexture, largeDrops, smallDrops } = useMemo(() => {
    const cvs = document.createElement('canvas')
    cvs.width = CANVAS_SIZE
    cvs.height = CANVAS_SIZE
    const context = cvs.getContext('2d')!

    const tex = new THREE.CanvasTexture(cvs)
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.RepeatWrapping

    return {
      canvas: cvs,
      ctx: context,
      normalTexture: tex,
      largeDrops: createLargeDrops(),
      smallDrops: createSmallDrops(),
    }
  }, [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    // Clear to neutral normal (128, 128, 255)
    ctx.fillStyle = 'rgb(128, 128, 255)'
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

    // Update & draw large flowing drops
    for (const drop of largeDrops) {
      // Move down
      drop.y += drop.speed
      // Wobble sideways
      drop.x += Math.sin(t * drop.wobbleSpeed + drop.phase) * drop.wobble * 0.15

      // Store trail
      drop.trail.unshift(drop.y)
      if (drop.trail.length > 12) drop.trail.pop()

      // Reset when off-screen
      if (drop.y > CANVAS_SIZE + drop.radius * 2) {
        drop.y = -drop.radius * 2
        drop.x = Math.random() * CANVAS_SIZE
        drop.trail = []
      }

      // Wrap X
      if (drop.x < 0) drop.x += CANVAS_SIZE
      if (drop.x >= CANVAS_SIZE) drop.x -= CANVAS_SIZE

      // Draw trail first (behind)
      drawTrail(ctx, drop.x, drop.trail, drop.radius)
      // Draw main droplet
      drawDroplet(ctx, drop.x, drop.y, drop.radius, 1.0)
    }

    // Draw static small drops (they stay in place, shimmer slightly)
    for (const drop of smallDrops) {
      const shimmer = 0.6 + 0.4 * Math.sin(t * 0.3 + drop.x * 0.1)
      drawDroplet(ctx, drop.x, drop.y, drop.radius, drop.opacity * shimmer)
    }

    normalTexture.needsUpdate = true
  })

  return (
    <group>
      {/* Main glass pane */}
      <mesh ref={meshRef} position={[0, 1.0, 1.5]}>
        <planeGeometry args={[9, 7]} />
        <meshPhysicalMaterial
          color="#1a2030"
          transparent
          opacity={0.06}
          roughness={0.12}
          metalness={0}
          transmission={0.92}
          ior={1.5}
          thickness={0.5}
          normalMap={normalTexture}
          normalScale={new THREE.Vector2(0.15, 0.15)}
          envMapIntensity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Condensation haze — lower part of glass */}
      <mesh position={[0, -0.2, 1.51]}>
        <planeGeometry args={[8, 3]} />
        <meshBasicMaterial
          color="#8090a0"
          transparent
          opacity={0.02}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

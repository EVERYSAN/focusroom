import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import * as THREE from 'three'

/* ── Procedural circular gradient texture ── */
function makeBokehTexture(color: string, size = 128): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const r = size / 2
  const g = ctx.createRadialGradient(r, r, 0, r, r, r)
  g.addColorStop(0, color)
  g.addColorStop(0.35, color)
  g.addColorStop(0.6, color.replace(/[\d.]+\)$/, '0.3)'))
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

/* ── Bokeh orb definition ── */
interface Orb {
  x: number; y: number; z: number
  scale: number
  color: string
  driftSpeed: number
  driftAmp: number
  phase: number
  opacity: number
}

/* ── Generate random orb configs ── */
function generateOrbs(): Orb[] {
  const orbs: Orb[] = []

  // Warm amber/orange — city building lights (15)
  const warmColors = [
    'rgba(255,180,60,0.9)',
    'rgba(255,160,40,0.85)',
    'rgba(255,200,80,0.8)',
    'rgba(240,150,50,0.85)',
    'rgba(255,190,70,0.75)',
  ]
  for (let i = 0; i < 15; i++) {
    orbs.push({
      x: (Math.random() - 0.5) * 8,
      y: (Math.random() - 0.2) * 5 + 1.0,
      z: -2 + Math.random() * 2,
      scale: 0.35 + Math.random() * 0.7,
      color: warmColors[i % warmColors.length],
      driftSpeed: 0.15 + Math.random() * 0.2,
      driftAmp: 0.01 + Math.random() * 0.02,
      phase: Math.random() * Math.PI * 2,
      opacity: 0.6 + Math.random() * 0.4,
    })
  }

  // Cool blue/cyan — street lamps, neon (7)
  const coolColors = [
    'rgba(140,180,255,0.7)',
    'rgba(120,200,240,0.65)',
    'rgba(160,170,255,0.6)',
    'rgba(100,190,255,0.7)',
  ]
  for (let i = 0; i < 7; i++) {
    orbs.push({
      x: (Math.random() - 0.5) * 8,
      y: (Math.random() - 0.2) * 5 + 1.0,
      z: -2 + Math.random() * 2,
      scale: 0.2 + Math.random() * 0.45,
      color: coolColors[i % coolColors.length],
      driftSpeed: 0.12 + Math.random() * 0.18,
      driftAmp: 0.008 + Math.random() * 0.015,
      phase: Math.random() * Math.PI * 2,
      opacity: 0.5 + Math.random() * 0.4,
    })
  }

  // Accent — red/green signs, traffic lights (5)
  const accentColors = [
    'rgba(255,80,80,0.6)',
    'rgba(80,255,120,0.55)',
    'rgba(255,60,90,0.5)',
    'rgba(60,220,100,0.5)',
    'rgba(255,100,60,0.55)',
  ]
  for (let i = 0; i < 5; i++) {
    orbs.push({
      x: (Math.random() - 0.5) * 7,
      y: (Math.random() - 0.2) * 4 + 0.8,
      z: -2 + Math.random() * 1.5,
      scale: 0.15 + Math.random() * 0.25,
      color: accentColors[i],
      driftSpeed: 0.1 + Math.random() * 0.15,
      driftAmp: 0.005 + Math.random() * 0.01,
      phase: Math.random() * Math.PI * 2,
      opacity: 0.4 + Math.random() * 0.35,
    })
  }

  // Tiny twinkle dots (8)
  for (let i = 0; i < 8; i++) {
    orbs.push({
      x: (Math.random() - 0.5) * 9,
      y: (Math.random() - 0.2) * 5 + 0.5,
      z: -3 + Math.random() * 2,
      scale: 0.08 + Math.random() * 0.12,
      color: `rgba(255,${200 + Math.floor(Math.random() * 55)},${150 + Math.floor(Math.random() * 80)},0.8)`,
      driftSpeed: 0.2 + Math.random() * 0.3,
      driftAmp: 0.003 + Math.random() * 0.005,
      phase: Math.random() * Math.PI * 2,
      opacity: 0.3 + Math.random() * 0.5,
    })
  }

  return orbs
}

/* ── Single Bokeh Orb ── */
function BokehOrb({ orb, texture }: { orb: Orb; texture: THREE.CanvasTexture }) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    ref.current.position.x = orb.x + Math.sin(t * orb.driftSpeed + orb.phase) * orb.driftAmp
    ref.current.position.y = orb.y + Math.cos(t * orb.driftSpeed * 0.7 + orb.phase) * orb.driftAmp * 0.6
  })

  return (
    <Billboard position={[orb.x, orb.y, orb.z]} follow lockX={false} lockY={false} lockZ={false}>
      <mesh ref={ref} scale={orb.scale}>
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial
          map={texture}
          transparent
          opacity={orb.opacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </Billboard>
  )
}

/* ── Bokeh Lights Group ── */
export function BokehLights() {
  const orbs = useMemo(generateOrbs, [])

  // Generate one texture per orb (grouped by color for efficiency)
  const textures = useMemo(() => {
    const cache = new Map<string, THREE.CanvasTexture>()
    return orbs.map(orb => {
      if (!cache.has(orb.color)) {
        cache.set(orb.color, makeBokehTexture(orb.color))
      }
      return cache.get(orb.color)!
    })
  }, [orbs])

  return (
    <group>
      {orbs.map((orb, i) => (
        <BokehOrb key={i} orb={orb} texture={textures[i]} />
      ))}
    </group>
  )
}

import { useMemo } from 'react'
import * as THREE from 'three'

/* ═══════════════════════════════════════════
   3D Wooden Counter
   Canvas2D procedural wood texture + MeshStandardMaterial
   (MeshStandardMaterial responds to lights & shadows)
   ═══════════════════════════════════════════ */

/* ── Generate procedural wood texture via Canvas2D ── */
function generateWoodTexture(width = 512, height = 256): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  // Base dark wood color
  ctx.fillStyle = '#4a2e18'
  ctx.fillRect(0, 0, width, height)

  // Wood grain lines — multiple passes
  for (let pass = 0; pass < 3; pass++) {
    const lineCount = [40, 25, 15][pass]
    const opacity = [0.15, 0.1, 0.2][pass]
    const lineWidth = [1, 2, 0.5][pass]

    for (let i = 0; i < lineCount; i++) {
      const y = Math.random() * height
      const color = Math.random() > 0.5
        ? `rgba(80, 50, 20, ${opacity})`
        : `rgba(120, 75, 35, ${opacity * 0.7})`

      ctx.beginPath()
      ctx.strokeStyle = color
      ctx.lineWidth = lineWidth

      // Wavy grain line
      ctx.moveTo(0, y)
      for (let x = 0; x < width; x += 4) {
        const wobble = Math.sin(x * 0.02 + i * 0.5) * 3 + Math.sin(x * 0.005 + i * 1.2) * 6
        ctx.lineTo(x, y + wobble)
      }
      ctx.stroke()
    }
  }

  // Knots (dark spots)
  for (let i = 0; i < 3; i++) {
    const kx = Math.random() * width
    const ky = Math.random() * height
    const kr = 8 + Math.random() * 15
    const grad = ctx.createRadialGradient(kx, ky, 0, kx, ky, kr)
    grad.addColorStop(0, 'rgba(30, 18, 8, 0.4)')
    grad.addColorStop(0.5, 'rgba(40, 25, 12, 0.2)')
    grad.addColorStop(1, 'rgba(60, 35, 15, 0)')
    ctx.fillStyle = grad
    ctx.fillRect(kx - kr, ky - kr, kr * 2, kr * 2)
  }

  // Light streaks (reflection highlights)
  for (let i = 0; i < 8; i++) {
    const y = Math.random() * height
    ctx.fillStyle = `rgba(180, 140, 90, ${0.03 + Math.random() * 0.04})`
    ctx.fillRect(0, y, width, 1 + Math.random() * 2)
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(2, 1)
  return tex
}

export function Counter3D() {
  const woodTex = useMemo(() => generateWoodTexture(), [])

  const topMat = useMemo(() => new THREE.MeshStandardMaterial({
    map: woodTex,
    color: '#8a6040',
    roughness: 0.65,
    metalness: 0.05,
  }), [woodTex])

  const frontMat = useMemo(() => new THREE.MeshStandardMaterial({
    map: woodTex,
    color: '#5a3a20',
    roughness: 0.8,
    metalness: 0.03,
  }), [woodTex])

  const edgeMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#3e2210',
    roughness: 0.6,
    metalness: 0.1,
  }), [])

  return (
    <group position={[0, -1.8, 2.0]}>
      {/* Counter top surface — receives spotlights */}
      <mesh
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        material={topMat}
      >
        <planeGeometry args={[10, 2.2]} />
      </mesh>

      {/* Counter front face */}
      <mesh
        position={[0, -0.75, 1.1]}
        receiveShadow
        material={frontMat}
      >
        <planeGeometry args={[10, 1.5]} />
      </mesh>

      {/* Counter top edge (rounded lip) */}
      <mesh
        position={[0, -0.02, 1.1]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
        material={edgeMat}
      >
        <cylinderGeometry args={[0.04, 0.04, 10, 8, 1, false]} />
      </mesh>

      {/* Subtle warm glow on counter surface */}
      <mesh position={[0, 0.005, 0.3]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 1.5]} />
        <meshBasicMaterial
          color="#ffd080"
          transparent
          opacity={0.02}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'

/* ── Props ── */

interface DeskSceneProps {
  memberCount: number
  isHome: boolean
}

/* ── Helpers ── */

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}

/* ── Sub-components (all render inside R3F Canvas) ── */

/** Dark walnut desk surface — large plane with subtle vignette via vertex colors */
function DeskSurface() {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(16, 10, 32, 20)
    // Darken edges for vignette effect
    const pos = g.attributes.position
    const colors = new Float32Array(pos.count * 3)
    const cx = 0, cy = 0
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const dx = (x - cx) / 8   // half-width
      const dy = (y - cy) / 5   // half-height
      const dist = Math.sqrt(dx * dx + dy * dy)
      const fade = 1.0 - clamp(dist * 0.35, 0, 0.45)
      // Dark walnut base: #3B2F2F → rgb(59, 47, 47)
      colors[i * 3]     = (59 / 255) * fade
      colors[i * 3 + 1] = (47 / 255) * fade
      colors[i * 3 + 2] = (47 / 255) * fade
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return g
  }, [])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <primitive object={geo} attach="geometry" />
      <meshStandardMaterial vertexColors roughness={0.85} metalness={0.05} />
    </mesh>
  )
}

/** Notebook — closed (cover down) or opening (cover lifts) */
function Notebook({ isOpen }: { isOpen: boolean }) {
  const pivotRef = useRef<THREE.Group>(null)
  const targetAngle = isOpen ? -Math.PI * 0.75 : 0

  useFrame((_, delta) => {
    if (!pivotRef.current) return
    const cur = pivotRef.current.rotation.x
    pivotRef.current.rotation.x = THREE.MathUtils.lerp(cur, targetAngle, delta * 2.5)
  })

  return (
    <group position={[-1.5, 0.02, 0.5]}>
      {/* Base pages */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.4, 0.04, 3.2]} />
        <meshStandardMaterial color="#f0ebe0" roughness={0.9} />
      </mesh>
      {/* Faint page lines */}
      <mesh position={[0, 0.025, 0]}>
        <boxGeometry args={[2.3, 0.001, 3.1]} />
        <meshStandardMaterial color="#e8e2d5" roughness={0.95} />
      </mesh>
      {/* Cover — pivots at left (spine) edge */}
      <group position={[-1.2, 0.025, 0]} ref={pivotRef}>
        <mesh position={[1.2, 0.02, 0]}>
          <boxGeometry args={[2.4, 0.05, 3.2]} />
          <meshStandardMaterial color="#5C4033" roughness={0.8} metalness={0.02} />
        </mesh>
      </group>
    </group>
  )
}

/** Pen — thin cylinder lying beside the notebook */
function Pen() {
  return (
    <group position={[1.2, 0.06, 1.2]} rotation={[0, 0.3, Math.PI / 2]}>
      {/* Body */}
      <mesh>
        <cylinderGeometry args={[0.04, 0.04, 2.2, 8]} />
        <meshStandardMaterial color="#2C2C2C" roughness={0.6} metalness={0.3} />
      </mesh>
      {/* Clip / accent band */}
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.15, 8]} />
        <meshStandardMaterial color="#8B7355" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Tip */}
      <mesh position={[0, -1.15, 0]}>
        <coneGeometry args={[0.04, 0.12, 8]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
      </mesh>
    </group>
  )
}

/** Coffee cup — cylinder with torus rim, positioned top-right */
function CoffeeCup() {
  return (
    <group position={[4.8, 0.02, -2.8]}>
      {/* Saucer */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 0.06, 24]} />
        <meshStandardMaterial color="#e8ddd0" roughness={0.85} />
      </mesh>
      {/* Cup body */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.42, 0.38, 0.6, 24]} />
        <meshStandardMaterial color="#f0e6d3" roughness={0.8} />
      </mesh>
      {/* Coffee surface */}
      <mesh position={[0, 0.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.38, 24]} />
        <meshStandardMaterial color="#3E2723" roughness={0.3} />
      </mesh>
      {/* Handle */}
      <mesh position={[0.55, 0.35, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.18, 0.04, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#f0e6d3" roughness={0.8} />
      </mesh>
    </group>
  )
}

/** Dust particles — InstancedMesh for performance, slow sinusoidal drift */
function DustParticles({ count }: { count: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  // Generate stable random positions/speeds once
  const data = useMemo(() => {
    const positions: THREE.Vector3[] = []
    const speeds: { x: number; y: number; z: number }[] = []
    const offsets: number[] = []
    const scales: number[] = []

    for (let i = 0; i < count; i++) {
      positions.push(new THREE.Vector3(
        (Math.random() - 0.5) * 14,
        0.3 + Math.random() * 2.5,
        (Math.random() - 0.5) * 9,
      ))
      speeds.push({
        x: 0.02 + Math.random() * 0.06,
        y: 0.03 + Math.random() * 0.05,
        z: 0.02 + Math.random() * 0.06,
      })
      offsets.push(Math.random() * Math.PI * 2)
      scales.push(0.5 + Math.random() * 1.0)
    }
    return { positions, speeds, offsets, scales }
  }, [count])

  // Set initial transforms
  useEffect(() => {
    if (!meshRef.current) return
    for (let i = 0; i < count; i++) {
      dummy.position.copy(data.positions[i])
      dummy.scale.setScalar(data.scales[i])
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [count, data, dummy])

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime

    for (let i = 0; i < count; i++) {
      const p = data.positions[i]
      const s = data.speeds[i]
      const o = data.offsets[i]

      dummy.position.set(
        p.x + Math.sin(t * s.x + o) * 0.15,
        p.y + Math.sin(t * s.y + o * 1.3) * 0.08,
        p.z + Math.cos(t * s.z + o * 0.7) * 0.15,
      )
      dummy.scale.setScalar(data.scales[i])
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.015, 4, 4]} />
      <meshBasicMaterial color="#d4c4a8" transparent opacity={0.3} />
    </instancedMesh>
  )
}

/** Coffee steam — semi-transparent planes rising from the cup */
function CoffeeSteam() {
  const planeRefs = useRef<(THREE.Mesh | null)[]>([])

  const steamData = useMemo(() =>
    Array.from({ length: 3 }, (_, i) => ({
      offset: (i / 3) * Math.PI * 2,
      speed: 0.15 + Math.random() * 0.1,
      drift: 0.02 + Math.random() * 0.02,
    })),
    [],
  )

  useFrame((state) => {
    const t = state.clock.elapsedTime
    planeRefs.current.forEach((mesh, i) => {
      if (!mesh) return
      const d = steamData[i]
      // Rise cycle: 0→1 over ~6s, then reset
      const cycle = ((t * d.speed + d.offset) % 1.0)
      const y = cycle * 1.2
      mesh.position.y = 0.9 + y
      mesh.position.x = Math.sin(t * 0.5 + d.offset) * d.drift
      mesh.position.z = Math.cos(t * 0.7 + d.offset) * d.drift

      // Fade: appear→peak→fade
      const alpha = cycle < 0.3
        ? cycle / 0.3 * 0.12
        : 0.12 * (1 - (cycle - 0.3) / 0.7)
      const mat = mesh.material as THREE.MeshBasicMaterial
      mat.opacity = Math.max(0, alpha)
    })
  })

  return (
    <group position={[4.8, 0, -2.8]}>
      {steamData.map((_, i) => (
        <mesh
          key={i}
          ref={el => { planeRefs.current[i] = el }}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.3, 0.3]} />
          <meshBasicMaterial
            color="#e8ddd0"
            transparent
            opacity={0}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

/** Responsive zoom — keeps desk filling viewport across screen sizes */
function ResponsiveZoom() {
  const { camera, size } = useThree()

  useEffect(() => {
    const cam = camera as THREE.OrthographicCamera
    // Base zoom for 1280px width; scale proportionally
    const baseZoom = 80
    const scale = Math.min(size.width / 1280, size.height / 720)
    cam.zoom = baseZoom * Math.max(0.5, scale)
    cam.updateProjectionMatrix()
  }, [camera, size])

  return null
}

/* ── Main component ── */

export function DeskScene({ memberCount, isHome }: DeskSceneProps) {
  const dustCount = clamp(memberCount * 15, 200, 500)

  return (
    <Canvas
      orthographic
      camera={{
        position: [0, 10, 0.8],
        zoom: 80,
        near: 0.1,
        far: 100,
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
      gl={{ antialias: true, alpha: false }}
    >
      <color attach="background" args={['#1a1510']} />

      {/* Warm lighting */}
      <ambientLight intensity={0.4} color="#ffeedd" />
      <pointLight position={[3, 5, -2]} intensity={0.6} color="#ffddaa" distance={20} />
      <pointLight position={[-4, 4, 3]} intensity={0.2} color="#ffe8cc" distance={15} />

      {/* Responsive camera */}
      <ResponsiveZoom />

      {/* Scene objects */}
      <DeskSurface />
      <Notebook isOpen={!isHome} />
      <Pen />
      <CoffeeCup />
      <DustParticles count={dustCount} />
      <CoffeeSteam />
    </Canvas>
  )
}

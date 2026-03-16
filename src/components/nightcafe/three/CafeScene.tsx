import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'
import { BokehLights } from './BokehLights'
import { RainGlass } from './RainGlass'
import { Counter3D } from './Counter3D'
import { CafeItems } from './CafeItems'
import { PendantLamp } from './PendantLamp'
import { Stools3D } from './Stools3D'
import { Floor } from './Floor'
import { CinematicEffects } from './CinematicEffects'
import type { Seat } from '../types'

const SEAT_COUNT = 6

interface CafeSceneProps {
  seats: Seat[]
}

export function CafeScene({ seats }: CafeSceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        alpha: false,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
      }}
      camera={{ fov: 50, position: [0, -0.5, 9], near: 0.1, far: 100 }}
      style={{ position: 'fixed', inset: 0, zIndex: 1 }}
    >
      {/* Warm ambient fill */}
      <ambientLight intensity={0.15} color="#ffd8a0" />

      {/* Subtle fill from below (floor bounce) */}
      <hemisphereLight
        color="#3a2510"
        groundColor="#0a0604"
        intensity={0.1}
      />

      <color attach="background" args={['#080604']} />
      {/* Fog pushed far back — only fades distant background, not interior */}
      <fog attach="fog" args={['#080604', 22, 50]} />

      <Suspense fallback={null}>
        {/* HDRI environment map — subtle reflections on all PBR surfaces */}
        <Environment
          preset="night"
          background={false}
          environmentIntensity={0.3}
        />

        {/* Background city bokeh */}
        <BokehLights />

        {/* Rain on glass window */}
        <RainGlass />

        {/* 6 pendant lamps with SpotLights */}
        {Array.from({ length: SEAT_COUNT }).map((_, i) => (
          <PendantLamp key={i} index={i} seat={seats[i]} total={SEAT_COUNT} />
        ))}

        {/* Wooden counter */}
        <Counter3D />

        {/* Items on counter (mug, laptop, book per seat) */}
        <CafeItems seats={seats} />

        {/* 6 stools */}
        <Stools3D seats={seats} />

        {/* Dark floor */}
        <Floor />

        {/* Post-processing */}
        <CinematicEffects />
      </Suspense>
    </Canvas>
  )
}

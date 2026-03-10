import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { BokehLights } from './BokehLights'
import { RainParticles } from './RainParticles'
import { GlassPane } from './GlassPane'
import { PendantLights3D } from './PendantLights3D'
import { SceneEffects } from './SceneEffects'
import type { Seat } from '../types'

interface WindowSceneProps {
  seats: Seat[]
}

export function WindowScene({ seats }: WindowSceneProps) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      camera={{ fov: 50, position: [0, 0, 5], near: 0.1, far: 50 }}
      style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'transparent' }}
    >
      {/* Soft ambient fill — very dark, just enough to see glass */}
      <ambientLight intensity={0.08} color="#ffd8a0" />

      <Suspense fallback={null}>
        {/* City bokeh lights in the background */}
        <BokehLights />

        {/* Rain falling in front of bokeh, behind glass */}
        <RainParticles />

        {/* Glass pane with water droplets */}
        <GlassPane />

        {/* 6 pendant point-lights driven by seat occupancy */}
        <PendantLights3D seats={seats} />

        {/* Post-processing: Bloom */}
        <SceneEffects />
      </Suspense>
    </Canvas>
  )
}

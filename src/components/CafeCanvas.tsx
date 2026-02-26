import { Suspense, useState, useEffect, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { useProgress } from '@react-three/drei'
import { CafeScene } from './CafeScene'
import { ACESFilmicToneMapping, Vector3 } from 'three'

const CAMERA_TARGET = new Vector3(1, 1.5, -2)

function LoadingOverlay() {
  const { progress } = useProgress()
  return (
    <div
      className="fixed inset-0 flex items-center justify-center transition-opacity duration-700"
      style={{ zIndex: 5, background: '#1a1510' }}
    >
      <div className="text-center">
        <p className="font-serif text-xl text-[#d4c4a8] mb-3">
          Preparing your space...
        </p>
        <div className="w-48 h-1 bg-[#2a2218] rounded-full overflow-hidden mx-auto">
          <div
            className="h-full bg-[#b8a994] rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-[#7a6b58] mt-2">
          {Math.round(progress)}%
        </p>
      </div>
    </div>
  )
}

/** Point the camera at the cafe interior on mount */
function CameraSetup() {
  const { camera } = useThree()
  useEffect(() => {
    camera.lookAt(CAMERA_TARGET)
  }, [camera])
  return null
}

export function CafeCanvas() {
  const [loaded, setLoaded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Force a resize event after mount so R3F picks up the correct container size
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'))
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      {!loaded && <LoadingOverlay />}
      <div
        ref={containerRef}
        className="fixed inset-0"
        style={{ zIndex: 0, pointerEvents: 'none' }}
      >
        <Canvas
          camera={{
            position: [4, 2, 3],
            fov: 50,
            near: 0.1,
            far: 100,
          }}
          dpr={[1, 1.5]}
          gl={{
            antialias: true,
            toneMapping: ACESFilmicToneMapping,
            toneMappingExposure: 1.0,
          }}
          style={{ width: '100%', height: '100%' }}
          onCreated={() => setLoaded(true)}
        >
          {/* Point camera at cafe interior */}
          <CameraSetup />

          {/* Fog for atmospheric depth */}
          <fog attach="fog" args={['#1a1510', 6, 18]} />

          {/* Warm ambient light */}
          <ambientLight intensity={0.4} color="#ffe4c4" />

          {/* Main overhead cafe lamp */}
          <pointLight
            position={[3, 4, 1]}
            intensity={1.5}
            color="#ffd699"
            distance={15}
            decay={2}
          />

          {/* Secondary fill light from window side */}
          <pointLight
            position={[6, 3, 3]}
            intensity={0.6}
            color="#ffcc88"
            distance={12}
            decay={2}
          />

          {/* Warm backlight for depth */}
          <pointLight
            position={[-2, 3, -2]}
            intensity={0.4}
            color="#ff9944"
            distance={10}
            decay={2}
          />

          {/* Rim light for depth */}
          <directionalLight
            position={[5, 3, -5]}
            intensity={0.3}
            color="#c4a882"
          />

          <Suspense fallback={null}>
            <CafeScene />
          </Suspense>
        </Canvas>
      </div>
    </>
  )
}

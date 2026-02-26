import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import type { Group } from 'three'
import * as THREE from 'three'

const MODEL_PATH = '/models/Cafe.glb'

// Start fetching the model as early as possible
useGLTF.preload(MODEL_PATH)

export function CafeScene() {
  const { scene } = useGLTF(MODEL_PATH)
  const groupRef = useRef<Group>(null)
  const mouseRef = useRef({ x: 0, y: 0 })

  // Clone scene to avoid mutation issues with StrictMode
  const clonedScene = useMemo(() => {
    const clone = scene.clone()
    // Disable any baked-in lights from the model
    clone.traverse((child) => {
      if ((child as THREE.Light).isLight) {
        child.visible = false
      }
    })
    return clone
  }, [scene])

  // Use window mousemove instead of R3F mouse (canvas has pointer-events:none)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  // Subtle parallax rotation based on mouse position
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        mouseRef.current.x * 0.02,
        0.05
      )
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        mouseRef.current.y * 0.01,
        0.05
      )
    }
  })

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} />
    </group>
  )
}

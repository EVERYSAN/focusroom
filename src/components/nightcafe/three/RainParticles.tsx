import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const RAIN_COUNT = 300
const SPREAD_X = 7
const SPREAD_Y = 6
const Z_MIN = 0.5
const Z_MAX = 2.5
const SPEED_MIN = 0.03
const SPEED_MAX = 0.08

/* ── Custom shader for elongated rain streaks ── */
const rainVertexShader = `
  attribute float aSpeed;
  attribute float aOpacity;
  varying float vOpacity;
  void main() {
    vOpacity = aOpacity;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = max(1.5, 3.0 * (1.0 / -mvPosition.z));
    gl_Position = projectionMatrix * mvPosition;
  }
`

const rainFragmentShader = `
  varying float vOpacity;
  void main() {
    // Elongated vertical shape: wider at center, narrow at edges
    vec2 uv = gl_PointCoord;
    float dist = abs(uv.x - 0.5) * 2.0;
    float alpha = smoothstep(1.0, 0.2, dist) * vOpacity;
    // Slight vertical fade for streak look
    float yFade = smoothstep(0.0, 0.3, uv.y) * smoothstep(1.0, 0.7, uv.y);
    alpha *= yFade;
    gl_FragColor = vec4(0.7, 0.75, 0.85, alpha * 0.35);
  }
`

export function RainParticles() {
  const meshRef = useRef<THREE.Points>(null)

  const { positions, speeds, opacities } = useMemo(() => {
    const pos = new Float32Array(RAIN_COUNT * 3)
    const spd = new Float32Array(RAIN_COUNT)
    const opa = new Float32Array(RAIN_COUNT)

    for (let i = 0; i < RAIN_COUNT; i++) {
      const i3 = i * 3
      pos[i3] = (Math.random() - 0.5) * SPREAD_X      // x
      pos[i3 + 1] = (Math.random() - 0.5) * SPREAD_Y  // y (start random)
      pos[i3 + 2] = Z_MIN + Math.random() * (Z_MAX - Z_MIN) // z
      spd[i] = SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN)
      opa[i] = 0.15 + Math.random() * 0.5
    }

    return { positions: pos, speeds: spd, opacities: opa }
  }, [])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1))
    geo.setAttribute('aOpacity', new THREE.BufferAttribute(opacities, 1))
    return geo
  }, [positions, speeds, opacities])

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: rainVertexShader,
      fragmentShader: rainFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  }, [])

  useFrame(() => {
    if (!meshRef.current) return
    const posAttr = meshRef.current.geometry.attributes.position as THREE.BufferAttribute
    const arr = posAttr.array as Float32Array

    for (let i = 0; i < RAIN_COUNT; i++) {
      const i3 = i * 3
      arr[i3 + 1] -= speeds[i] // move down

      // Reset when below view
      if (arr[i3 + 1] < -SPREAD_Y / 2 - 0.5) {
        arr[i3 + 1] = SPREAD_Y / 2 + Math.random() * 1.0
        arr[i3] = (Math.random() - 0.5) * SPREAD_X
      }
    }
    posAttr.needsUpdate = true
  })

  return (
    <points ref={meshRef} geometry={geometry} material={material} />
  )
}

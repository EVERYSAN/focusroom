import * as THREE from 'three'

/* ═══════════════════════════════════════════
   Dark Café Floor
   Receives shadows from pendant lights
   ═══════════════════════════════════════════ */

export function Floor() {
  return (
    <group>
      {/* Main floor surface */}
      <mesh
        position={[0, -4.5, 2.5]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[20, 12]} />
        <meshStandardMaterial
          color="#0e0a06"
          roughness={0.92}
          metalness={0.05}
        />
      </mesh>

      {/* Subtle warm reflection on floor from lights above */}
      <mesh
        position={[0, -4.49, 2.5]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[12, 6]} />
        <meshBasicMaterial
          color="#ffd080"
          transparent
          opacity={0.01}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

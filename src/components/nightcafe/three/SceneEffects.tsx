import { EffectComposer, Bloom } from '@react-three/postprocessing'

export function SceneEffects() {
  return (
    <EffectComposer>
      <Bloom
        intensity={0.7}
        luminanceThreshold={0.25}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
    </EffectComposer>
  )
}

import {
  EffectComposer,
  Bloom,
  Vignette,
  DepthOfField,
} from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'

/* ═══════════════════════════════════════════
   Cinematic Post-Processing
   Bloom + Vignette + Depth of Field
   (ACES Filmic tone mapping is set on Canvas gl)
   ═══════════════════════════════════════════ */

export function CinematicEffects() {
  return (
    <EffectComposer multisampling={0}>
      {/* Bloom for pendant glow + bokeh enhancement */}
      <Bloom
        intensity={1.2}
        luminanceThreshold={0.15}
        luminanceSmoothing={0.9}
        mipmapBlur
      />

      {/* Depth of Field — gentle, focus on counter/mid area */}
      <DepthOfField
        focusDistance={0.04}
        focalLength={0.06}
        bokehScale={2}
        height={480}
      />

      {/* Cinematic vignette — slightly lighter */}
      <Vignette
        eskil={false}
        offset={0.3}
        darkness={0.7}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  )
}

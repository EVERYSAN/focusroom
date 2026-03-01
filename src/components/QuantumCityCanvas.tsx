import { useRef, useEffect, useCallback } from 'react'
import { ja } from '../lib/i18n'

/* ── Types ── */

interface Props {
  memberCount: number
  spotlight?: { name?: string; label?: string }
}

interface Particle {
  x: number          // ratio 0-1 (mapped to canvas on draw)
  y: number          // ratio 0-1
  r: number          // radius px (CSS pixels)
  hue: number
  sat: number
  lit: number
  alpha: number
  dAlpha: number     // brightness drift per frame
  dHue: number       // hue drift per frame
  jitterX: number    // micro-sway velocity
  jitterY: number
}

/* ── Constants ── */

const MIN_PARTICLES = 30
const MAX_PARTICLES = 120
const SPOTLIGHT_INTERVAL_MIN = 12_000
const SPOTLIGHT_INTERVAL_MAX = 16_000

/* ── Helpers ── */

/** Box-Muller: returns value ~N(0,1), clamped to [-3,3] */
function gaussRand(): number {
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  const n = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  return Math.max(-3, Math.min(3, n))
}

/** Center-biased position: mean=0.5, spread covers ~0.1-0.9 */
function centeredRand(): number {
  return Math.max(0.02, Math.min(0.98, 0.5 + gaussRand() * 0.18))
}

function pickHue(): number {
  const roll = Math.random()
  if (roll < 0.05) return 280 + Math.random() * 15     // rare purple
  if (roll < 0.10) return 120 + Math.random() * 20     // rare green
  if (roll < 0.55) return 200 + Math.random() * 40     // blue-white (dominant)
  if (roll < 0.80) return 20  + Math.random() * 25     // warm amber
  return Math.random() * 360                             // near-white / wild
}

function createParticle(): Particle {
  const r = 1.5 + Math.random() * 2.5 + (Math.random() < 0.12 ? Math.random() * 2 : 0)
  return {
    x: centeredRand(),
    y: centeredRand(),
    r,
    hue: pickHue(),
    sat: 15 + Math.random() * 25,
    lit: 45 + Math.random() * 35,
    alpha: 0.3 + Math.random() * 0.5,
    dAlpha: (Math.random() - 0.5) * 0.006,
    dHue: (Math.random() - 0.5) * 0.1,
    jitterX: (Math.random() - 0.5) * 0.00008,
    jitterY: (Math.random() - 0.5) * 0.00008,
  }
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}

/* ── Component ── */

export function QuantumCityCanvas({ memberCount, spotlight }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const spotlightIdxRef = useRef(0)
  const spotlightPhaseRef = useRef<'in' | 'out'>('in')
  const spotlightTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const rafRef = useRef(0)
  const sizeRef = useRef({ w: 0, h: 0 })

  // Target particle count from memberCount
  const targetCount = clamp(memberCount * 3, MIN_PARTICLES, MAX_PARTICLES)

  /* ── Particle pool management ── */
  const syncParticleCount = useCallback((target: number) => {
    const particles = particlesRef.current
    while (particles.length < target) {
      particles.push(createParticle())
    }
    while (particles.length > target) {
      particles.pop()
    }
  }, [])

  /* ── Spotlight rotation ── */
  const advanceSpotlight = useCallback(() => {
    spotlightPhaseRef.current = 'out'
    setTimeout(() => {
      const len = particlesRef.current.length
      if (len > 0) {
        spotlightIdxRef.current = Math.floor(Math.random() * len)
      }
      spotlightPhaseRef.current = 'in'
    }, 600)
  }, [])

  const scheduleSpotlight = useCallback(() => {
    const delay = SPOTLIGHT_INTERVAL_MIN +
      Math.random() * (SPOTLIGHT_INTERVAL_MAX - SPOTLIGHT_INTERVAL_MIN)
    spotlightTimerRef.current = setTimeout(() => {
      advanceSpotlight()
      scheduleSpotlight()
    }, delay)
  }, [advanceSpotlight])

  /* ── Canvas setup + animation loop ── */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Init particles
    syncParticleCount(targetCount)

    // Sizing
    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.parentElement!.getBoundingClientRect()
      const w = rect.width
      const h = rect.height
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      sizeRef.current = { w, h }
    }
    resize()

    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement!)

    // Animation
    const draw = () => {
      const { w, h } = sizeRef.current
      if (w === 0 || h === 0) { rafRef.current = requestAnimationFrame(draw); return }

      // Trail: dim previous frame
      ctx.fillStyle = 'rgba(15, 17, 21, 0.12)'
      ctx.fillRect(0, 0, w, h)

      const particles = particlesRef.current
      const spotIdx = spotlightIdxRef.current
      const spotPhase = spotlightPhaseRef.current

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // Drift
        p.alpha += p.dAlpha
        if (p.alpha > 0.82 || p.alpha < 0.18) p.dAlpha *= -1
        p.alpha = clamp(p.alpha, 0.15, 0.85)

        p.hue += p.dHue
        if (p.hue > 360) p.hue -= 360
        if (p.hue < 0) p.hue += 360

        // Micro-jitter
        p.x += p.jitterX
        p.y += p.jitterY
        if (p.x < 0.01 || p.x > 0.99) p.jitterX *= -1
        if (p.y < 0.01 || p.y > 0.99) p.jitterY *= -1
        p.x = clamp(p.x, 0.01, 0.99)
        p.y = clamp(p.y, 0.01, 0.99)

        const px = p.x * w
        const py = p.y * h
        const isSpot = i === spotIdx

        // Determine draw params
        let r = p.r
        let blur = p.r * 4
        let alpha = p.alpha
        if (isSpot) {
          r += 1.5
          blur += 6
          alpha = clamp(alpha + 0.15, 0, 1)
        }

        const color = `hsla(${p.hue}, ${p.sat}%, ${p.lit}%, ${alpha})`

        ctx.save()
        ctx.globalCompositeOperation = 'lighter'
        ctx.shadowBlur = blur
        ctx.shadowColor = color
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(px, py, r, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      // Update spotlight overlay position
      if (overlayRef.current && particles.length > 0) {
        const sp = particles[spotIdx]
        if (sp) {
          const el = overlayRef.current
          el.style.left = `${sp.x * w + 14}px`
          el.style.top = `${sp.y * h - 10}px`
          el.style.opacity = spotPhase === 'in' ? '1' : '0'
        }
      }

      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)

    // Start spotlight rotation
    scheduleSpotlight()

    return () => {
      cancelAnimationFrame(rafRef.current)
      clearTimeout(spotlightTimerRef.current)
      ro.disconnect()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // React to memberCount changes → adjust particle pool
  useEffect(() => {
    syncParticleCount(targetCount)
  }, [targetCount, syncParticleCount])

  const spotName = spotlight?.name
  const spotLabel = spotlight?.label

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          borderRadius: 'inherit',
        }}
      />
      {/* Spotlight HTML overlay */}
      <div
        ref={overlayRef}
        className="quantum-spotlight-overlay"
        style={{ opacity: 0 }}
      >
        <div className="quantum-spotlight-overlay__line1">
          {spotName
            ? ja.spotlight.focusing(spotName)
            : ja.welcome.someoneFocusing}
        </div>
        <div className="quantum-spotlight-overlay__line2">
          {spotLabel ?? ja.spotlight.nowDefault}
        </div>
      </div>
    </>
  )
}

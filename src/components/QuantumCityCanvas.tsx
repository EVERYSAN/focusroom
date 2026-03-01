import { useRef, useEffect, useCallback, useState } from 'react'
import { ja } from '../lib/i18n'

/* ── Types ── */

interface SpotlightEntry {
  name: string
  label: string
  opacity: number   // 0→1 fade state
}

interface Props {
  memberCount: number
  /** Display names for spotlight — canvas picks from these */
  memberNames: string[]
}

interface Particle {
  x: number          // ratio 0-1
  y: number          // ratio 0-1
  r: number          // radius px (CSS pixels)
  hue: number
  sat: number
  lit: number
  alpha: number
  dAlpha: number
  dHue: number
  jitterX: number
  jitterY: number
}

/* ── Constants ── */

const MIN_PARTICLES = 30
const MAX_PARTICLES = 140
const SPOTLIGHT_COUNT = 3
const ROTATE_INTERVAL_MIN = 12_000
const ROTATE_INTERVAL_MAX = 16_000

/* ── Helpers ── */

function gaussRand(): number {
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  const n = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  return Math.max(-3, Math.min(3, n))
}

function centeredRand(): number {
  return Math.max(0.02, Math.min(0.98, 0.5 + gaussRand() * 0.18))
}

function pickHue(): number {
  const roll = Math.random()
  if (roll < 0.05) return 280 + Math.random() * 15
  if (roll < 0.10) return 120 + Math.random() * 20
  if (roll < 0.55) return 200 + Math.random() * 40
  if (roll < 0.80) return 20  + Math.random() * 25
  return Math.random() * 360
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

/** Pick a random index not in `exclude`, from range [0, len) */
function pickUnique(len: number, exclude: number[]): number {
  if (len <= exclude.length) return 0
  let idx: number
  do { idx = Math.floor(Math.random() * len) } while (exclude.includes(idx))
  return idx
}

/* ── Component ── */

export function QuantumCityCanvas({ memberCount, memberNames }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const rafRef = useRef(0)
  const sizeRef = useRef({ w: 0, h: 0 })

  // 3-spotlight indices into particle array
  const spotIndicesRef = useRef<number[]>([0, 1, 2])
  const spotTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Spotlight text state (React-rendered)
  const [spotlights, setSpotlights] = useState<SpotlightEntry[]>([])
  const memberNamesRef = useRef(memberNames)
  memberNamesRef.current = memberNames

  const targetCount = clamp(memberCount * 3, MIN_PARTICLES, MAX_PARTICLES)

  /* ── Particle pool ── */
  const syncParticleCount = useCallback((target: number) => {
    const p = particlesRef.current
    while (p.length < target) p.push(createParticle())
    while (p.length > target) p.pop()
  }, [])

  /* ── Build spotlight text entries from current indices ── */
  const buildSpotlightEntries = useCallback((): SpotlightEntry[] => {
    const names = memberNamesRef.current
    const indices = spotIndicesRef.current
    return indices.map(idx => {
      const name = names[idx % (names.length || 1)] ?? undefined
      return {
        name: name
          ? ja.spotlight.focusing(name)
          : ja.welcome.someoneFocusing,
        label: ja.spotlight.nowDefault,
        opacity: 1,
      }
    })
  }, [])

  /* ── Rotate 1 of 3 spotlights ── */
  const rotateOneSpotlight = useCallback(() => {
    const len = particlesRef.current.length
    if (len < SPOTLIGHT_COUNT) return
    const indices = spotIndicesRef.current

    // Pick which slot to replace (0, 1, or 2)
    const slot = Math.floor(Math.random() * SPOTLIGHT_COUNT)

    // Fade out the slot being replaced
    setSpotlights(prev => prev.map((s, i) => i === slot ? { ...s, opacity: 0 } : s))

    // After fade-out, swap index and fade in
    setTimeout(() => {
      const others = indices.filter((_, i) => i !== slot)
      indices[slot] = pickUnique(len, others)
      spotIndicesRef.current = [...indices]
      setSpotlights(buildSpotlightEntries())
    }, 400)
  }, [buildSpotlightEntries])

  const scheduleRotation = useCallback(() => {
    const delay = ROTATE_INTERVAL_MIN +
      Math.random() * (ROTATE_INTERVAL_MAX - ROTATE_INTERVAL_MIN)
    spotTimerRef.current = setTimeout(() => {
      rotateOneSpotlight()
      scheduleRotation()
    }, delay)
  }, [rotateOneSpotlight])

  /* ── Canvas setup + animation ── */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    syncParticleCount(targetCount)

    // Init spotlight indices (unique)
    const len = particlesRef.current.length
    const a = pickUnique(len, [])
    const b = pickUnique(len, [a])
    const c = pickUnique(len, [a, b])
    spotIndicesRef.current = [a, b, c]
    setSpotlights(buildSpotlightEntries())

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

    // Draw loop
    const draw = () => {
      const { w, h } = sizeRef.current
      if (w === 0 || h === 0) { rafRef.current = requestAnimationFrame(draw); return }

      // Full clear
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 1
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = '#0f1115'
      ctx.fillRect(0, 0, w, h)

      const particles = particlesRef.current
      const spotSet = new Set(spotIndicesRef.current)

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
        const isSpot = spotSet.has(i)

        let r = p.r
        let blur = p.r * 2.5
        let alpha = p.alpha
        if (isSpot) {
          r += 1.5
          blur += 3
          alpha = clamp(alpha + 0.12, 0, 1)
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

      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)
    scheduleRotation()

    return () => {
      cancelAnimationFrame(rafRef.current)
      clearTimeout(spotTimerRef.current)
      ro.disconnect()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync particle count on memberCount change
  useEffect(() => {
    syncParticleCount(targetCount)
  }, [targetCount, syncParticleCount])

  // Keep spotlight text in sync when names change
  useEffect(() => {
    setSpotlights(buildSpotlightEntries())
  }, [memberNames.length, buildSpotlightEntries])

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
      {/* Fixed-position 3-line spotlight overlay (glass) */}
      <div className="quantum-spotlight-panel">
        {spotlights.map((s, i) => (
          <div
            key={i}
            className="quantum-spotlight-panel__row"
            style={{ opacity: s.opacity, transitionDelay: `${i * 80}ms` }}
          >
            <span className="quantum-spotlight-panel__name">{s.name}</span>
            <span className="quantum-spotlight-panel__label">{s.label}</span>
          </div>
        ))}
      </div>
    </>
  )
}

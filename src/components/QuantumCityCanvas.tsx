import { useRef, useEffect, useCallback } from 'react'
import { ja } from '../lib/i18n'

/* ── Types ── */

interface SpotlightEntry {
  name: string
  label: string
  opacity: number
}

interface Props {
  memberCount: number
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

const MIN_PARTICLES = 60
const MAX_PARTICLES = 220
const SPOTLIGHT_COUNT = 3
const ROTATE_INTERVAL_MIN = 12_000
const ROTATE_INTERVAL_MAX = 16_000
const LABEL_SMOOTH = 0.12    // EMA smoothing for label positions

/* ── Helpers ── */

function gaussRand(): number {
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  const n = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  return Math.max(-3, Math.min(3, n))
}

/** Spread particles across entire viewport with mild center bias */
function spreadRand(): number {
  if (Math.random() < 0.7) {
    return 0.05 + Math.random() * 0.90
  }
  return Math.max(0.05, Math.min(0.95, 0.5 + gaussRand() * 0.25))
}

function pickHue(): number {
  const roll = Math.random()
  if (roll < 0.05) return 280 + Math.random() * 15
  if (roll < 0.10) return 120 + Math.random() * 20
  if (roll < 0.55) return 200 + Math.random() * 40
  if (roll < 0.80) return 20  + Math.random() * 25
  return Math.random() * 360
}

/** 3-tier size distribution: 70% micro, 25% normal, 5% large accent */
function createParticle(): Particle {
  const sizeRoll = Math.random()
  let r: number
  if (sizeRoll < 0.70) {
    r = 0.8 + Math.random() * 1.4        // 0.8–2.2 micro
  } else if (sizeRoll < 0.95) {
    r = 2.2 + Math.random() * 2.3        // 2.2–4.5 normal
  } else {
    r = 4.5 + Math.random() * 3.0        // 4.5–7.5 large accent
  }

  // Larger particles jitter less (feel heavier)
  const jitterScale = r < 2.2 ? 1.0 : r < 4.5 ? 0.6 : 0.3

  // Alpha tiers: micro dimmer, large slightly brighter
  let alpha: number
  if (r < 2.2) {
    alpha = 0.20 + Math.random() * 0.40
  } else if (r < 4.5) {
    alpha = 0.30 + Math.random() * 0.50
  } else {
    alpha = 0.35 + Math.random() * 0.45
  }

  return {
    x: spreadRand(),
    y: spreadRand(),
    r,
    hue: pickHue(),
    sat: 15 + Math.random() * 25,
    lit: 45 + Math.random() * 35,
    alpha,
    dAlpha: (Math.random() - 0.5) * 0.006,
    dHue: (Math.random() - 0.5) * 0.1,
    jitterX: (Math.random() - 0.5) * 0.00015 * jitterScale,
    jitterY: (Math.random() - 0.5) * 0.00015 * jitterScale,
  }
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}

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

  // Spotlight: DOM-ref driven (no React state, 60fps)
  const spotTextRef = useRef<SpotlightEntry[]>([])
  const labelRefs = useRef<(HTMLDivElement | null)[]>([null, null, null])
  const prevPosRef = useRef([
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ])

  const memberNamesRef = useRef(memberNames)
  memberNamesRef.current = memberNames

  const targetCount = clamp(memberCount * 6, MIN_PARTICLES, MAX_PARTICLES)

  /* ── Particle pool ── */
  const syncParticleCount = useCallback((target: number) => {
    const p = particlesRef.current
    while (p.length < target) p.push(createParticle())
    while (p.length > target) p.pop()
  }, [])

  /* ── Build spotlight text entries ── */
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

  /** Write spotlight text directly to DOM (bypass React) */
  const writeLabelText = useCallback((entries: SpotlightEntry[]) => {
    spotTextRef.current = entries
    entries.forEach((entry, i) => {
      const el = labelRefs.current[i]
      if (!el) return
      const nameEl = el.querySelector('.spot-label__name')
      const subEl = el.querySelector('.spot-label__sub')
      if (nameEl) nameEl.textContent = entry.name
      if (subEl) subEl.textContent = entry.label
      el.style.opacity = String(entry.opacity)
    })
  }, [])

  /* ── Rotate 1 of 3 spotlights ── */
  const rotateOneSpotlight = useCallback(() => {
    const len = particlesRef.current.length
    if (len < SPOTLIGHT_COUNT) return
    const indices = spotIndicesRef.current
    const slot = Math.floor(Math.random() * SPOTLIGHT_COUNT)

    // Fade out
    const el = labelRefs.current[slot]
    if (el) el.style.opacity = '0'

    // After fade-out, swap index and fade in
    setTimeout(() => {
      const others = indices.filter((_, i) => i !== slot)
      indices[slot] = pickUnique(len, others)
      spotIndicesRef.current = [...indices]
      writeLabelText(buildSpotlightEntries())
    }, 400)
  }, [buildSpotlightEntries, writeLabelText])

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

    // Write initial text after refs are ready
    requestAnimationFrame(() => {
      writeLabelText(buildSpotlightEntries())
    })

    // Sizing — full viewport
    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const w = window.innerWidth
      const h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      sizeRef.current = { w, h }
    }
    resize()
    window.addEventListener('resize', resize)

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
        // shadowBlur scales with particle size tier
        let blur: number
        if (p.r < 2.2) {
          blur = p.r * 1.5          // micro: subtle
        } else if (p.r < 4.5) {
          blur = p.r * 2.5          // normal
        } else {
          blur = p.r * 3.5          // large accent: dramatic
        }
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

      /* ── Position spotlight labels (direct DOM, no React) ── */
      const spotIndices = spotIndicesRef.current
      const labelTargets: { x: number; y: number }[] = []

      for (let s = 0; s < SPOTLIGHT_COUNT; s++) {
        const idx = spotIndices[s]
        const p = particles[idx]
        if (!p) { labelTargets.push({ x: 0, y: 0 }); continue }

        const px = p.x * w
        const py = p.y * h

        // Default: offset right-up from particle
        let lx = px + 14
        let ly = py - 14

        // Edge detection: flip if near edges (label ~160px wide, ~36px tall)
        if (lx + 160 > w) lx = px - 174
        if (ly < 4) ly = py + 14
        if (ly + 36 > h) ly = py - 50
        lx = Math.max(4, Math.min(w - 164, lx))
        ly = Math.max(4, Math.min(h - 40, ly))

        labelTargets.push({ x: lx, y: ly })
      }

      // Overlap avoidance: push apart if within 36px vertically
      for (let i = 0; i < labelTargets.length; i++) {
        for (let j = i + 1; j < labelTargets.length; j++) {
          const dy = Math.abs(labelTargets[j].y - labelTargets[i].y)
          const dx = Math.abs(labelTargets[j].x - labelTargets[i].x)
          if (dy < 36 && dx < 160) {
            labelTargets[i].y -= 12
            labelTargets[j].y += 12
          }
        }
      }

      // Smooth (EMA) and write transform to DOM
      const prev = prevPosRef.current
      for (let s = 0; s < SPOTLIGHT_COUNT; s++) {
        const el = labelRefs.current[s]
        if (!el || !labelTargets[s]) continue
        const t = labelTargets[s]

        // Initialize on first frame
        if (prev[s].x === 0 && prev[s].y === 0) {
          prev[s].x = t.x
          prev[s].y = t.y
        } else {
          prev[s].x += (t.x - prev[s].x) * LABEL_SMOOTH
          prev[s].y += (t.y - prev[s].y) * LABEL_SMOOTH
        }

        el.style.transform = `translate(${Math.round(prev[s].x)}px, ${Math.round(prev[s].y)}px)`
      }

      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)
    scheduleRotation()

    return () => {
      cancelAnimationFrame(rafRef.current)
      clearTimeout(spotTimerRef.current)
      window.removeEventListener('resize', resize)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync particle count on memberCount change
  useEffect(() => {
    syncParticleCount(targetCount)
  }, [targetCount, syncParticleCount])

  // Keep spotlight text in sync when names change
  useEffect(() => {
    writeLabelText(buildSpotlightEntries())
  }, [memberNames.length, buildSpotlightEntries, writeLabelText])

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      {/* 3 floating spotlight labels — positioned by rAF, not React */}
      {[0, 1, 2].map(i => (
        <div
          key={i}
          ref={el => { labelRefs.current[i] = el }}
          className="spot-label"
          style={{ transform: 'translate(0px, 0px)', opacity: 0 }}
        >
          <span className="spot-label__name" />
          <span className="spot-label__sub" />
        </div>
      ))}
    </>
  )
}

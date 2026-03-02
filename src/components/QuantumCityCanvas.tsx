import { useRef, useEffect, useCallback } from 'react'
import { ja } from '../lib/i18n'

/* ── Types ── */

interface WhisperEntry {
  name: string
  postText: string
}

interface RecentPost {
  user_id: string
  text: string
  type: string
}

interface Props {
  memberCount: number
  memberNames: string[]
  recentPosts?: RecentPost[]
}

/* ── Default focus posts — 淡々とした作業の気配 ── */
const DEFAULT_FOCUS_POSTS = [
  'とりあえず5分だけ手を動かす',
  '資料を開いて見出しだけ作る',
  '画面を閉じて、目の前の作業に戻る',
  '今はただ、机に向かう',
  'メモを1行だけ書く',
  'コードを読むだけでもOK',
  '最初の一歩だけやる',
  'タブを1つ閉じる',
  '手を止めずに、まず書く',
  '考えすぎない。手を動かす',
  '深呼吸して、次の1行',
  'ひとまず開く。それだけでいい',
]

/* ── Realistic display names (used when no real members) ── */
const GHOST_NAMES = [
  'yuki_design', 'ken_codes', 'mio_writes',
  'sora_dev', 'haru_pm', 'riku_data',
  'aoi_uiux', 'tomo_eng', 'nana_create',
  'ren_build', 'saki_plan', 'kota_ship',
]

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
const WHISPER_SLOTS = 4
const WHISPER_INTERVAL_MIN = 18_000
const WHISPER_INTERVAL_MAX = 28_000
const LABEL_SMOOTH = 0.10    // EMA smoothing for whisper positions

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

export function QuantumCityCanvas({ memberCount, memberNames, recentPosts }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const rafRef = useRef(0)
  const sizeRef = useRef({ w: 0, h: 0 })

  // Whisper state: which particle each slot tracks, and whether it's visible
  const whisperIndicesRef = useRef<number[]>([0, 1, 2, 3])
  const whisperVisibleRef = useRef<boolean[]>([false, false, false, false])
  const whisperTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const whisperSeqRef = useRef(0) // tracks which ghost/post to use next

  // Whisper: DOM-ref driven (no React state, 60fps)
  const labelRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null])
  const prevPosRef = useRef([
    { x: 0, y: 0 }, { x: 0, y: 0 },
    { x: 0, y: 0 }, { x: 0, y: 0 },
  ])

  const memberNamesRef = useRef(memberNames)
  memberNamesRef.current = memberNames

  const recentPostsRef = useRef(recentPosts)
  recentPostsRef.current = recentPosts

  const targetCount = clamp(memberCount * 6, MIN_PARTICLES, MAX_PARTICLES)

  /* ── Particle pool ── */
  const syncParticleCount = useCallback((target: number) => {
    const p = particlesRef.current
    while (p.length < target) p.push(createParticle())
    while (p.length > target) p.pop()
  }, [])

  /* ── Build a single whisper entry ── */
  const buildWhisperEntry = useCallback((seq: number): WhisperEntry => {
    const names = memberNamesRef.current
    const posts = recentPostsRef.current ?? []

    // Pick name
    const realName = names[seq % (names.length || 1)]
    const isGuest = !realName || realName === 'Guest' || realName.startsWith('Guest #')
    const displayName = isGuest
      ? GHOST_NAMES[seq % GHOST_NAMES.length]
      : realName

    // Pick post
    const focusPosts = posts.filter(p => p.type !== 'idea')
    const postText = focusPosts.length > 0
      ? focusPosts[seq % focusPosts.length].text
      : DEFAULT_FOCUS_POSTS[seq % DEFAULT_FOCUS_POSTS.length]

    return {
      name: ja.spotlight.focusing(displayName),
      postText,
    }
  }, [])

  /** Write whisper text + trigger fade class on a single slot */
  const showWhisper = useCallback((slot: number) => {
    const el = labelRefs.current[slot]
    if (!el) return

    const seq = whisperSeqRef.current++
    const entry = buildWhisperEntry(seq)

    // Assign to a new particle
    const len = particlesRef.current.length
    const others = whisperIndicesRef.current.filter((_, i) => i !== slot)
    whisperIndicesRef.current[slot] = pickUnique(len, others)

    // Reset position for smooth start
    const p = particlesRef.current[whisperIndicesRef.current[slot]]
    if (p) {
      const { w, h } = sizeRef.current
      prevPosRef.current[slot] = { x: p.x * w, y: p.y * h - 20 }
    }

    // Write text
    const nameEl = el.querySelector('.whisper__name')
    const postEl = el.querySelector('.whisper__post')
    if (nameEl) nameEl.textContent = entry.name
    if (postEl) postEl.textContent = entry.postText

    // Fade in
    el.classList.remove('whisper--out')
    el.classList.add('whisper--in')
    whisperVisibleRef.current[slot] = true
  }, [buildWhisperEntry])

  const hideWhisper = useCallback((slot: number) => {
    const el = labelRefs.current[slot]
    if (!el) return
    el.classList.remove('whisper--in')
    el.classList.add('whisper--out')
    whisperVisibleRef.current[slot] = false
  }, [])

  /* ── Rotate 1 whisper at a time (calm, one-by-one) ── */
  const rotateOneWhisper = useCallback(() => {
    const slot = Math.floor(Math.random() * WHISPER_SLOTS)

    // Fade out this slot
    hideWhisper(slot)

    // After fade-out (900ms), show with new content
    setTimeout(() => {
      showWhisper(slot)
    }, 1000)
  }, [showWhisper, hideWhisper])

  const scheduleWhisperCycle = useCallback(() => {
    const delay = WHISPER_INTERVAL_MIN +
      Math.random() * (WHISPER_INTERVAL_MAX - WHISPER_INTERVAL_MIN)
    whisperTimerRef.current = setTimeout(() => {
      rotateOneWhisper()
      scheduleWhisperCycle()
    }, delay)
  }, [rotateOneWhisper])

  /* ── Canvas setup + animation ── */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    syncParticleCount(targetCount)

    // Init whisper indices (unique)
    const len = particlesRef.current.length
    const a = pickUnique(len, [])
    const b = pickUnique(len, [a])
    const c = pickUnique(len, [a, b])
    const d = pickUnique(len, [a, b, c])
    whisperIndicesRef.current = [a, b, c, d]

    // Stagger whisper appearances one by one
    setTimeout(() => showWhisper(0), 800)
    setTimeout(() => showWhisper(1), 4_000)
    setTimeout(() => showWhisper(2), 9_000)
    setTimeout(() => showWhisper(3), 15_000)

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
      const whisperSet = new Set(whisperIndicesRef.current)

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
        const isWhisper = whisperSet.has(i)

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

        if (isWhisper) {
          r += 1.2
          blur += 2
          alpha = clamp(alpha + 0.08, 0, 1)
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

      /* ── Position whisper labels (direct DOM, no React) ── */
      const indices = whisperIndicesRef.current
      const labelTargets: { x: number; y: number }[] = []

      for (let s = 0; s < WHISPER_SLOTS; s++) {
        const idx = indices[s]
        const p = particles[idx]
        if (!p) { labelTargets.push({ x: 0, y: 0 }); continue }

        const px = p.x * w
        const py = p.y * h

        // Position text near particle (offset up-left slightly)
        let lx = px - 60
        let ly = py - 36

        // Edge clamping with 16px viewport padding
        lx = Math.max(16, Math.min(w - 160, lx))
        ly = Math.max(16, Math.min(h - 50, ly))

        labelTargets.push({ x: lx, y: ly })
      }

      // Overlap avoidance: push apart if within 60px vertically
      for (let i = 0; i < labelTargets.length; i++) {
        for (let j = i + 1; j < labelTargets.length; j++) {
          const dy = Math.abs(labelTargets[j].y - labelTargets[i].y)
          const dx = Math.abs(labelTargets[j].x - labelTargets[i].x)
          if (dy < 60 && dx < 160) {
            labelTargets[i].y -= 20
            labelTargets[j].y += 20
          }
        }
      }

      // Smooth (EMA) and write transform to DOM
      const prev = prevPosRef.current
      for (let s = 0; s < WHISPER_SLOTS; s++) {
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
    scheduleWhisperCycle()

    return () => {
      cancelAnimationFrame(rafRef.current)
      clearTimeout(whisperTimerRef.current)
      window.removeEventListener('resize', resize)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync particle count on memberCount change
  useEffect(() => {
    syncParticleCount(targetCount)
  }, [targetCount, syncParticleCount])

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
      {/* 4 whisper slots — halo + text, positioned by rAF */}
      {[0, 1, 2, 3].map(i => (
        <div
          key={i}
          ref={el => { labelRefs.current[i] = el }}
          className="whisper"
          style={{ transform: 'translate(0px, 0px)' }}
        >
          <span className="whisper__name" />
          <span className="whisper__post" />
        </div>
      ))}
    </>
  )
}

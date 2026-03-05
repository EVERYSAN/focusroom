/**
 * CafeScene — layered desk scene for the focus room.
 *
 * Architecture (bottom → top):
 *   1. Desk Layer      — desk_texture.png (clean wood surface)
 *   2. Objects Layer    — individual transparent PNGs (notebook, pen, coffee)
 *   3. Atmosphere Layer — CSS dust particles + steam wisps
 *   4. Sticky Layer     — sticky_base.png + text (NPC chatter)
 *   5. Vignette Layer   — CSS radial-gradient edge darkening
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { fragmentize, DEFAULT_HOME_FRAGMENTS } from '../lib/fragments'

/* ── Types ── */

interface RecentPost {
  user_id: string
  text: string
  type: string
}

interface CafeSceneProps {
  isHome: boolean
  recentPosts?: RecentPost[]
}

/* ── Sticky Note System ── */

const SLOT_COUNT = 4
const FADE_MIN = 8_000
const FADE_MAX = 14_000
const SPAWN_MIN = 10_000
const SPAWN_MAX = 20_000

const STICKY_SLOTS: { left: string; top: string; rotate: string }[] = [
  { left: '10%',  top: '20%',  rotate: '-3deg' },
  { left: '8%',   top: '62%',  rotate: '2deg' },
  { left: '62%',  top: '68%',  rotate: '-1.5deg' },
  { left: '60%',  top: '16%',  rotate: '2.5deg' },
]

interface StickySlot {
  text: string
  visible: boolean
  key: number
}

/* ── Dust Mote Data ── */

const DUST_COUNT = 12
const dustMotes = Array.from({ length: DUST_COUNT }, (_, i) => ({
  x: `${10 + (i * 7.3) % 80}%`,
  y: `${8 + (i * 11.7) % 84}%`,
  delay: `${(i * 1.8) % 12}s`,
  dur: `${10 + (i % 5) * 3}s`,
  size: 1.5 + (i % 3) * 0.5,
}))

/* ── Asset paths ── */

const ASSETS = {
  desk: '/assets/desk_texture.png',
  notebook: '/assets/notebook.png',
  pen: '/assets/pen.png',
  coffee: '/assets/coffee.png',
  stickyBase: '/assets/sticky_base.png',
} as const

/* ── Component ── */

export function CafeScene({ isHome, recentPosts }: CafeSceneProps) {
  const [deskLoaded, setDeskLoaded] = useState(false)

  /* Preload desk texture */
  useEffect(() => {
    const img = new Image()
    img.onload = () => setDeskLoaded(true)
    img.src = ASSETS.desk
  }, [])

  /* ── Sticky note state ── */
  const [slots, setSlots] = useState<StickySlot[]>(
    Array.from({ length: SLOT_COUNT }, () => ({ text: '', visible: false, key: 0 })),
  )

  const seqRef = useRef(0)
  const spawnTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const fadeTimersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const recentPostsRef = useRef(recentPosts)
  recentPostsRef.current = recentPosts

  const pickText = useCallback((): string => {
    const posts = recentPostsRef.current ?? []
    const focus = posts.filter(p => p.type !== 'idea')
    const seq = seqRef.current++
    if (focus.length > 0) {
      return fragmentize(focus[seq % focus.length].text)
    }
    return DEFAULT_HOME_FRAGMENTS[seq % DEFAULT_HOME_FRAGMENTS.length]
  }, [])

  const showSlot = useCallback((slotIdx: number) => {
    const text = pickText()
    setSlots(prev => {
      const next = [...prev]
      next[slotIdx] = { text, visible: true, key: prev[slotIdx].key + 1 }
      return next
    })
    const fadeDelay = FADE_MIN + Math.random() * (FADE_MAX - FADE_MIN)
    fadeTimersRef.current[slotIdx] = setTimeout(() => {
      setSlots(prev => {
        const next = [...prev]
        next[slotIdx] = { ...next[slotIdx], visible: false }
        return next
      })
    }, fadeDelay)
  }, [pickText])

  const scheduleSpawn = useCallback(() => {
    const delay = SPAWN_MIN + Math.random() * (SPAWN_MAX - SPAWN_MIN)
    spawnTimerRef.current = setTimeout(() => {
      const slot = Math.floor(Math.random() * SLOT_COUNT)
      showSlot(slot)
      scheduleSpawn()
    }, delay)
  }, [showSlot])

  const clearAll = useCallback(() => {
    clearTimeout(spawnTimerRef.current)
    fadeTimersRef.current.forEach(t => clearTimeout(t))
    fadeTimersRef.current = []
  }, [])

  useEffect(() => {
    if (isHome) {
      setTimeout(() => showSlot(0), 1_200)
      setTimeout(() => showSlot(2), 4_000)
      setTimeout(() => showSlot(1), 8_000)
      setTimeout(() => showSlot(3), 13_000)
      scheduleSpawn()
    } else {
      clearAll()
      setSlots(prev => prev.map(s => ({ ...s, visible: false })))
    }
    return clearAll
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHome])

  return (
    <div className="scene" aria-hidden="true">

      {/* ═══ Layer 1: Desk Surface ═══ */}
      <div
        className={`scene__desk ${deskLoaded ? 'scene__desk--loaded' : ''}`}
        style={{ backgroundImage: `url(${ASSETS.desk})` }}
      />

      {/* ═══ Layer 2: Objects (individual PNGs) ═══ */}
      <div className="scene__objects">
        <img src={ASSETS.notebook} alt="" className="scene__obj scene__obj--notebook" draggable={false} />
        <img src={ASSETS.pen}      alt="" className="scene__obj scene__obj--pen"      draggable={false} />
        <img src={ASSETS.coffee}   alt="" className="scene__obj scene__obj--coffee"   draggable={false} />
      </div>

      {/* ═══ Layer 3: Atmosphere ═══ */}
      <div className="scene__atmosphere">
        <div className="scene__steam">
          <span className="steam-wisp steam-wisp--1" />
          <span className="steam-wisp steam-wisp--2" />
          <span className="steam-wisp steam-wisp--3" />
        </div>
        <div className="scene__dust">
          {dustMotes.map((m, i) => (
            <span
              key={i}
              className="dust-mote"
              style={{
                '--x': m.x,
                '--y': m.y,
                '--delay': m.delay,
                '--dur': m.dur,
                '--size': `${m.size}px`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      </div>

      {/* ═══ Layer 4: Sticky Notes (PNG base + text) ═══ */}
      <div className="scene__stickies">
        {slots.map((slot, i) => (
          <div
            key={`${i}-${slot.key}`}
            className={`scene__sticky ${slot.visible ? 'scene__sticky--in' : 'scene__sticky--out'}`}
            style={{
              left: STICKY_SLOTS[i].left,
              top: STICKY_SLOTS[i].top,
              '--rotate': STICKY_SLOTS[i].rotate,
              '--breathe-phase': `${i * 3.5}s`,
            } as React.CSSProperties}
          >
            <img
              src={ASSETS.stickyBase}
              alt=""
              className="scene__sticky-bg"
              draggable={false}
            />
            <span className="scene__sticky-text">{slot.text}</span>
          </div>
        ))}
      </div>

      {/* ═══ Layer 5: Vignette ═══ */}
      <div className="scene__vignette" />
    </div>
  )
}

import { useState, useEffect, useRef, useCallback } from 'react'
import { fragmentize, DEFAULT_HOME_FRAGMENTS } from '../lib/fragments'

/* ── Types ── */

interface RecentPost {
  user_id: string
  text: string
  type: string
}

interface DeskOverlayProps {
  isHome: boolean
  recentPosts?: RecentPost[]
}

/* ── Constants ── */

const FRAG_SLOTS = 4
const FRAG_FADE_MIN = 8_000
const FRAG_FADE_MAX = 14_000
const FRAG_SPAWN_MIN = 10_000
const FRAG_SPAWN_MAX = 20_000

/** Fixed desk-slot positions (% of viewport) */
const SLOT_POSITIONS = [
  { left: '22%', top: '32%' },   // notebook top-right area
  { left: '58%', top: '26%' },   // desk top-right
  { left: '18%', top: '62%' },   // desk bottom-left
  { left: '52%', top: '58%' },   // notebook bottom-right
]

/** Slight random rotation for each fragment (paper-like) */
const SLOT_ROTATIONS = ['-1.5deg', '2deg', '-0.8deg', '1.2deg']

/* ── Component ── */

interface FragSlot {
  text: string
  visible: boolean
  key: number
}

export function DeskOverlay({ isHome, recentPosts }: DeskOverlayProps) {
  const [slots, setSlots] = useState<FragSlot[]>(
    Array.from({ length: FRAG_SLOTS }, () => ({ text: '', visible: false, key: 0 })),
  )

  const seqRef = useRef(0)
  const spawnTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const fadeTimersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const recentPostsRef = useRef(recentPosts)
  recentPostsRef.current = recentPosts

  /** Pick next fragment text */
  const pickText = useCallback((): string => {
    const posts = recentPostsRef.current ?? []
    const focus = posts.filter(p => p.type !== 'idea')
    const seq = seqRef.current++
    if (focus.length > 0) {
      return fragmentize(focus[seq % focus.length].text)
    }
    return DEFAULT_HOME_FRAGMENTS[seq % DEFAULT_HOME_FRAGMENTS.length]
  }, [])

  /** Show one fragment slot */
  const showSlot = useCallback((slotIdx: number) => {
    const text = pickText()
    setSlots(prev => {
      const next = [...prev]
      next[slotIdx] = { text, visible: true, key: prev[slotIdx].key + 1 }
      return next
    })

    // Schedule auto-fade
    const fadeDelay = FRAG_FADE_MIN + Math.random() * (FRAG_FADE_MAX - FRAG_FADE_MIN)
    fadeTimersRef.current[slotIdx] = setTimeout(() => {
      setSlots(prev => {
        const next = [...prev]
        next[slotIdx] = { ...next[slotIdx], visible: false }
        return next
      })
    }, fadeDelay)
  }, [pickText])

  /** Schedule next spawn */
  const scheduleSpawn = useCallback(() => {
    const delay = FRAG_SPAWN_MIN + Math.random() * (FRAG_SPAWN_MAX - FRAG_SPAWN_MIN)
    spawnTimerRef.current = setTimeout(() => {
      const slot = Math.floor(Math.random() * FRAG_SLOTS)
      showSlot(slot)
      scheduleSpawn()
    }, delay)
  }, [showSlot])

  /** Clear all timers */
  const clearAll = useCallback(() => {
    clearTimeout(spawnTimerRef.current)
    fadeTimersRef.current.forEach(t => clearTimeout(t))
    fadeTimersRef.current = []
  }, [])

  // React to isHome
  useEffect(() => {
    if (isHome) {
      // Stagger initial fragments
      setTimeout(() => showSlot(0), 1_500)
      setTimeout(() => showSlot(1), 5_000)
      setTimeout(() => showSlot(2), 10_000)
      setTimeout(() => showSlot(3), 16_000)
      scheduleSpawn()
    } else {
      // Stop spawning; existing fragments fade naturally
      clearAll()
      // Let visible ones fade out gently (don't force-hide)
      setSlots(prev => prev.map(s => ({ ...s, visible: false })))
    }

    return clearAll
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHome])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      {slots.map((slot, i) => (
        <div
          key={`${i}-${slot.key}`}
          className={`desk-fragment ${slot.visible ? 'desk-fragment--in' : 'desk-fragment--out'}`}
          style={{
            position: 'absolute',
            left: SLOT_POSITIONS[i].left,
            top: SLOT_POSITIONS[i].top,
            transform: `rotate(${SLOT_ROTATIONS[i]})`,
          }}
        >
          {slot.text}
        </div>
      ))}
    </div>
  )
}

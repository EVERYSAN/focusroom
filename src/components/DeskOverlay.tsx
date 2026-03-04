/**
 * DeskOverlay — ambient sticky notes floating on the desk.
 *
 * Like NPC chatter in a game: not meant to be read carefully,
 * but to give a sense of "others are working here too".
 *
 * Notes appear as yellow paper stuck to the desk surface,
 * fade in softly, breathe gently, then fade out.
 */

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

const SLOT_COUNT = 4
const FADE_MIN = 8_000
const FADE_MAX = 14_000
const SPAWN_MIN = 10_000
const SPAWN_MAX = 20_000

/**
 * Slot positions — matching reference image desk layout:
 * 1. Upper-left (near notebook edge)
 * 2. Lower-left (below notebook)
 * 3. Lower-right (beside pen)
 * 4. Upper-right (near coffee cup)
 */
const SLOTS: { left: string; top: string; rotate: string }[] = [
  { left: '12%',  top: '18%',  rotate: '-3deg' },
  { left: '10%',  top: '64%',  rotate: '1.5deg' },
  { left: '58%',  top: '68%',  rotate: '-1deg' },
  { left: '56%',  top: '15%',  rotate: '2.5deg' },
]

/* ── Component ── */

interface StickySlot {
  text: string
  visible: boolean
  key: number
}

export function DeskOverlay({ isHome, recentPosts }: DeskOverlayProps) {
  const [slots, setSlots] = useState<StickySlot[]>(
    Array.from({ length: SLOT_COUNT }, () => ({ text: '', visible: false, key: 0 })),
  )

  const seqRef = useRef(0)
  const spawnTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const fadeTimersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const recentPostsRef = useRef(recentPosts)
  recentPostsRef.current = recentPosts

  /** Pick next fragment text (max ~18 chars) */
  const pickText = useCallback((): string => {
    const posts = recentPostsRef.current ?? []
    const focus = posts.filter(p => p.type !== 'idea')
    const seq = seqRef.current++
    if (focus.length > 0) {
      return fragmentize(focus[seq % focus.length].text)
    }
    return DEFAULT_HOME_FRAGMENTS[seq % DEFAULT_HOME_FRAGMENTS.length]
  }, [])

  /** Show one sticky slot */
  const showSlot = useCallback((slotIdx: number) => {
    const text = pickText()
    setSlots(prev => {
      const next = [...prev]
      next[slotIdx] = { text, visible: true, key: prev[slotIdx].key + 1 }
      return next
    })

    // Schedule auto-fade
    const fadeDelay = FADE_MIN + Math.random() * (FADE_MAX - FADE_MIN)
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
    const delay = SPAWN_MIN + Math.random() * (SPAWN_MAX - SPAWN_MIN)
    spawnTimerRef.current = setTimeout(() => {
      const slot = Math.floor(Math.random() * SLOT_COUNT)
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
      // Stagger initial fragments — feel alive from the start
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
    <div className="desk-overlay" aria-hidden="true">
      {slots.map((slot, i) => (
        <div
          key={`${i}-${slot.key}`}
          className={`sticky-note ${slot.visible ? 'sticky-note--in' : 'sticky-note--out'}`}
          style={{
            left: SLOTS[i].left,
            top: SLOTS[i].top,
            '--rotate': SLOTS[i].rotate,
            '--breathe-phase': `${i * 3.5}s`,
          } as React.CSSProperties}
        >
          <span className="sticky-note__text">{slot.text}</span>
        </div>
      ))}
    </div>
  )
}

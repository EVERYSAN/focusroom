/**
 * StickyWhispers — Paper-like sticky notes that fade in/out on the desk.
 *
 * - Max 2 visible at a time
 * - 4 fixed zones on the desk (no random positions)
 * - Each whisper shows for 8–14 s then fades
 * - 12–20 s between spawns
 * - Text: fragmentized post + small author name
 * - Micro-sway animation (rotate ±0.8°, translateY 0→2px)
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { fragmentize, DEFAULT_HOME_FRAGMENTS } from '../lib/fragments'
import type { PresenceMember } from '../types'

/* ── Types ── */

interface RecentPost {
  user_id: string
  text: string
  type: string
}

interface Props {
  recentPosts?: RecentPost[]
  members: PresenceMember[]
  isActive: boolean
}

/* ── Constants ── */

const MAX_VISIBLE = 2
const DISPLAY_MIN = 8_000
const DISPLAY_MAX = 14_000
const SPAWN_MIN = 12_000
const SPAWN_MAX = 20_000

/** Fixed zones on the desk where whispers may appear */
const WHISPER_ZONES = [
  { left: '14%', top: '32%', rotate: '-1.5deg' },
  { left: '54%', top: '24%', rotate: '1deg' },
  { left: '16%', top: '64%', rotate: '2deg' },
  { left: '50%', top: '70%', rotate: '-0.8deg' },
]

/* ── Internal state ── */

interface Whisper {
  id: number
  text: string
  author: string
  zoneIndex: number
  visible: boolean
}

/* ── Component ── */

export function StickyWhispers({ recentPosts, members, isActive }: Props) {
  const [whispers, setWhispers] = useState<Whisper[]>([])

  const seqRef = useRef(0)
  const spawnTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const fadeTimersRef = useRef(
    new Map<number, ReturnType<typeof setTimeout>>(),
  )
  const usedZonesRef = useRef<Set<number>>(new Set())

  // Keep latest values in refs for stable callbacks
  const recentPostsRef = useRef(recentPosts)
  const membersRef = useRef(members)
  recentPostsRef.current = recentPosts
  membersRef.current = members

  /* Pick next text + author */
  const pickContent = useCallback((): { text: string; author: string } => {
    const posts = recentPostsRef.current ?? []
    const focus = posts.filter(p => p.type !== 'idea')
    const seq = seqRef.current++

    if (focus.length > 0) {
      const post = focus[seq % focus.length]
      const member = membersRef.current.find(m => m.userId === post.user_id)
      return {
        text: fragmentize(post.text),
        author: member?.displayName ?? 'Guest',
      }
    }

    return {
      text: DEFAULT_HOME_FRAGMENTS[seq % DEFAULT_HOME_FRAGMENTS.length],
      author: '',
    }
  }, [])

  /* Pick a zone that isn't currently occupied */
  const pickZone = useCallback((): number => {
    const available = WHISPER_ZONES.map((_, i) => i).filter(
      i => !usedZonesRef.current.has(i),
    )
    if (available.length === 0)
      return Math.floor(Math.random() * WHISPER_ZONES.length)
    return available[Math.floor(Math.random() * available.length)]
  }, [])

  /* Spawn one whisper */
  const spawnWhisper = useCallback(() => {
    const { text, author } = pickContent()
    const zoneIndex = pickZone()
    const id = Date.now() + Math.random()

    usedZonesRef.current.add(zoneIndex)

    setWhispers(prev => {
      const active = prev.filter(w => w.visible)
      const next = [...active]
      // Evict oldest if full
      if (next.length >= MAX_VISIBLE) {
        const oldest = next.shift()!
        usedZonesRef.current.delete(oldest.zoneIndex)
      }
      return [...next, { id, text, author, zoneIndex, visible: true }]
    })

    // Schedule fade-out
    const displayTime = DISPLAY_MIN + Math.random() * (DISPLAY_MAX - DISPLAY_MIN)
    const fadeTimer = setTimeout(() => {
      setWhispers(prev =>
        prev.map(w => (w.id === id ? { ...w, visible: false } : w)),
      )
      usedZonesRef.current.delete(zoneIndex)
      // Remove from DOM after transition
      setTimeout(() => {
        setWhispers(prev => prev.filter(w => w.id !== id))
      }, 800)
    }, displayTime)

    fadeTimersRef.current.set(id, fadeTimer)
  }, [pickContent, pickZone])

  /* Recurring spawn scheduler */
  const scheduleSpawn = useCallback(() => {
    const delay = SPAWN_MIN + Math.random() * (SPAWN_MAX - SPAWN_MIN)
    spawnTimerRef.current = setTimeout(() => {
      spawnWhisper()
      scheduleSpawn()
    }, delay)
  }, [spawnWhisper])

  /* Cleanup */
  const clearAll = useCallback(() => {
    clearTimeout(spawnTimerRef.current)
    fadeTimersRef.current.forEach(t => clearTimeout(t))
    fadeTimersRef.current.clear()
    usedZonesRef.current.clear()
  }, [])

  /* Lifecycle */
  useEffect(() => {
    if (isActive) {
      setTimeout(() => spawnWhisper(), 1_500)
      setTimeout(() => spawnWhisper(), 5_000)
      scheduleSpawn()
    } else {
      clearAll()
      setWhispers([])
    }
    return clearAll
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive])

  return (
    <div className="whispers-layer">
      {whispers.map(w => {
        const zone = WHISPER_ZONES[w.zoneIndex]
        return (
          <div
            key={w.id}
            className={`whisper-note ${w.visible ? 'whisper-note--in' : 'whisper-note--out'}`}
            style={{
              left: zone.left,
              top: zone.top,
              '--rotate': zone.rotate,
              '--sway-phase': `${(w.zoneIndex * 4.2) % 18}s`,
            } as React.CSSProperties}
          >
            <span className="whisper-note__text">{w.text}</span>
            {w.author && (
              <span className="whisper-note__author">— {w.author}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

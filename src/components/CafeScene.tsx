/**
 * CafeScene — Illustration-style late-night cafe desk.
 *
 * Architecture (bottom → top):
 *   1. Desk          — desk_texture.png zoomed 125%
 *   2. Stylize       — grain + desaturation (illustration feel)
 *   3. Props         — CSS desk clutter (clips, leaves, coffee ring, memo)
 *   4. Atmosphere    — fine dust particles
 *   5. Light         — warm spot from upper-left
 *   6. Seats         — Meeple figures at desk edge
 *   7. Sticky        — Paper whisper notes (#F6E7A7)
 *   8. Vignette      — edge darkening
 *   9. UI            — minimal text + sit-down button
 *   +  Mini Card     — popup on meeple tap
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { SeatsLayer, SEAT_POSITIONS, type SeatMember } from './SeatsLayer'
import { StickyWhispers } from './StickyWhispers'
import { DeskUiLayer } from './DeskUiLayer'
import { MiniCard } from './MiniCard'
import type { PresenceMember } from '../types'

/* ── Types ── */

interface RecentPost {
  user_id: string
  text: string
  type: string
}

interface CafeSceneProps {
  isHome: boolean
  recentPosts?: RecentPost[]
  members: PresenceMember[]
  selfUserId: string
  isSeated: boolean
  onSitDown: () => void
  onOpenMenu: () => void
}

/* ── Asset paths ── */

const DESK_TEXTURE = '/assets/desk_texture.png'

/* ── Desk Props — scattered small items ── */

/** Positions compensated for 125% zoom + 16% inset container */
const DESK_PROPS: {
  type: 'clip' | 'leaf' | 'ring' | 'memo'
  x: number
  y: number
  rot: number
}[] = [
  { type: 'clip', x: 30, y: 36, rot: 18 },
  { type: 'leaf', x: 65, y: 30, rot: -22 },
  { type: 'ring', x: 68, y: 62, rot: 0 },
  { type: 'memo', x: 33, y: 64, rot: -5 },
  { type: 'clip', x: 62, y: 70, rot: -32 },
  { type: 'leaf', x: 38, y: 30, rot: 38 },
  { type: 'memo', x: 64, y: 40, rot: 3 },
  { type: 'leaf', x: 55, y: 72, rot: -12 },
  { type: 'ring', x: 36, y: 50, rot: 0 },
  { type: 'clip', x: 48, y: 28, rot: -15 },
]

/* ── Dust — fine particles ── */

const DUST_COUNT = 22
const dustMotes = Array.from({ length: DUST_COUNT }, (_, i) => ({
  x: `${6 + ((i * 7.3) % 88)}%`,
  y: `${4 + ((i * 11.7) % 92)}%`,
  delay: `${(i * 2.1) % 20}s`,
  dur: `${16 + (i % 6) * 3}s`,
  size: 0.8 + (i % 3) * 0.4,
}))

/* ── Component ── */

export function CafeScene({
  isHome,
  recentPosts,
  members,
  selfUserId,
  isSeated,
  onSitDown,
  onOpenMenu,
}: CafeSceneProps) {
  const [deskLoaded, setDeskLoaded] = useState(false)
  const sceneRef = useRef<HTMLDivElement>(null)

  /* Preload desk texture */
  useEffect(() => {
    const img = new Image()
    img.onload = () => setDeskLoaded(true)
    img.src = DESK_TEXTURE
  }, [])

  /* ── Micro-parallax (mouse/gyro → subtle shift) ── */
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  const handlePointerMove = useCallback((e: MouseEvent) => {
    const cx = window.innerWidth / 2
    const cy = window.innerHeight / 2
    const dx = ((e.clientX - cx) / cx) * 5
    const dy = ((e.clientY - cy) / cy) * 3
    setOffset({ x: dx, y: dy })
  }, [])

  const handleDeviceOrientation = useCallback((e: DeviceOrientationEvent) => {
    const gamma = e.gamma ?? 0
    const beta = e.beta ?? 0
    const dx = (gamma / 45) * 6
    const dy = ((beta - 45) / 45) * 4
    setOffset({ x: Math.max(-6, Math.min(6, dx)), y: Math.max(-4, Math.min(4, dy)) })
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handlePointerMove, { passive: true })
    window.addEventListener('deviceorientation', handleDeviceOrientation, { passive: true })
    return () => {
      window.removeEventListener('mousemove', handlePointerMove)
      window.removeEventListener('deviceorientation', handleDeviceOrientation)
    }
  }, [handlePointerMove, handleDeviceOrientation])

  /* ── Mini Card state ── */
  const [selectedSeat, setSelectedSeat] = useState<{
    member: SeatMember
    index: number
  } | null>(null)

  const handleMeepleTap = (member: SeatMember, seatIndex: number) => {
    if (selectedSeat?.index === seatIndex) {
      setSelectedSeat(null)
    } else {
      setSelectedSeat({ member, index: seatIndex })
    }
  }

  useEffect(() => {
    if (!isHome) setSelectedSeat(null)
  }, [isHome])

  /* Camera zoom 125% + parallax offset */
  const parallaxStyle = {
    transform: `translate(${offset.x}px, ${offset.y}px) scale(1.25)`,
  }

  return (
    <div className="scene" ref={sceneRef} aria-hidden={!isHome}>
      {/* Parallax + zoom wrapper */}
      <div className="scene__parallax" style={parallaxStyle}>

        {/* ═══ Layer 1: Desk Surface ═══ */}
        <div
          className={`scene__desk ${deskLoaded ? 'scene__desk--loaded' : ''}`}
          style={{ backgroundImage: `url(${DESK_TEXTURE})` }}
        />

        {/* ═══ Layer 2: Stylize (illustration feel) ═══ */}
        <div className="scene__stylize" />
        <div className="scene__grain" />

        {/* ═══ Layer 3: Desk Props (scattered small items) ═══ */}
        <div className="scene__props">
          {DESK_PROPS.map((p, i) => (
            <span
              key={i}
              className={`desk-prop desk-prop--${p.type}`}
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                '--prop-rot': `${p.rot}deg`,
              } as React.CSSProperties}
            />
          ))}
        </div>

        {/* ═══ Layer 4: Atmosphere (fine dust) ═══ */}
        <div className="scene__atmosphere">
          <div className="scene__dust">
            {dustMotes.map((m, i) => (
              <span
                key={i}
                className="dust-mote"
                style={
                  {
                    '--x': m.x,
                    '--y': m.y,
                    '--delay': m.delay,
                    '--dur': m.dur,
                    '--size': `${m.size}px`,
                  } as React.CSSProperties
                }
              />
            ))}
          </div>
        </div>

        {/* ═══ Layer 5: Warm Light (upper-left) ═══ */}
        <div className="scene__light" />

        {/* ═══ Layer 6: Meeple Seats ═══ */}
        {isHome && (
          <SeatsLayer
            members={members}
            selfUserId={selfUserId}
            isSeated={isSeated}
            onMeepleTap={handleMeepleTap}
          />
        )}

        {/* ═══ Layer 7: Sticky Whispers ═══ */}
        <StickyWhispers
          recentPosts={recentPosts}
          members={members}
          isActive={isHome}
        />
      </div>

      {/* ═══ Layer 8: Vignette (outside parallax) ═══ */}
      <div className="scene__vignette" />

      {/* ═══ Layer 9: UI Overlay ═══ */}
      {isHome && (
        <DeskUiLayer
          members={members}
          isSeated={isSeated}
          onSitDown={onSitDown}
          onOpenMenu={onOpenMenu}
        />
      )}

      {/* ═══ Mini Card ═══ */}
      {selectedSeat && isHome && (
        <div
          className={`mini-card-anchor ${SEAT_POSITIONS[selectedSeat.index].y < 25 ? 'mini-card-anchor--below' : ''}`}
          style={{
            left: `${SEAT_POSITIONS[selectedSeat.index].x}%`,
            top: `${SEAT_POSITIONS[selectedSeat.index].y}%`,
          }}
        >
          <MiniCard
            member={selectedSeat.member}
            onClose={() => setSelectedSeat(null)}
          />
        </div>
      )}
    </div>
  )
}

/**
 * CafeScene — layered desk scene for the focus room.
 *
 * Architecture (bottom → top):
 *   1. Desk Layer       — desk_texture.png (clean wood surface)
 *   2. Objects Layer     — individual transparent PNGs (notebook, pen, coffee)
 *   3. Atmosphere Layer  — CSS dust particles + steam wisps
 *   4. Seats Layer       — Meeple figures around the desk edge
 *   5. Sticky Layer      — Whisper notes that fade in/out on the desk
 *   6. Vignette Layer    — CSS radial-gradient edge darkening
 *   7. UI Layer          — Calm text + "席につく" button
 *   +  Mini Card         — Popup on meeple tap
 */

import { useState, useEffect } from 'react'
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

/* ── Dust Mote Data ── */

const DUST_COUNT = 12
const dustMotes = Array.from({ length: DUST_COUNT }, (_, i) => ({
  x: `${10 + ((i * 7.3) % 80)}%`,
  y: `${8 + ((i * 11.7) % 84)}%`,
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
} as const

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

  /* Preload desk texture */
  useEffect(() => {
    const img = new Image()
    img.onload = () => setDeskLoaded(true)
    img.src = ASSETS.desk
  }, [])

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

  // Close mini card when leaving home
  useEffect(() => {
    if (!isHome) setSelectedSeat(null)
  }, [isHome])

  return (
    <div className="scene" aria-hidden={!isHome}>
      {/* ═══ Layer 1: Desk Surface ═══ */}
      <div
        className={`scene__desk ${deskLoaded ? 'scene__desk--loaded' : ''}`}
        style={{ backgroundImage: `url(${ASSETS.desk})` }}
      />

      {/* ═══ Layer 2: Objects (individual PNGs) ═══ */}
      <div className="scene__objects">
        <img
          src={ASSETS.notebook}
          alt=""
          className="scene__obj scene__obj--notebook"
          draggable={false}
        />
        <img
          src={ASSETS.pen}
          alt=""
          className="scene__obj scene__obj--pen"
          draggable={false}
        />
        <img
          src={ASSETS.coffee}
          alt=""
          className="scene__obj scene__obj--coffee"
          draggable={false}
        />
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

      {/* ═══ Layer 4: Meeple Seats ═══ */}
      {isHome && (
        <SeatsLayer
          members={members}
          selfUserId={selfUserId}
          onMeepleTap={handleMeepleTap}
        />
      )}

      {/* ═══ Layer 5: Sticky Whispers ═══ */}
      <StickyWhispers
        recentPosts={recentPosts}
        members={members}
        isActive={isHome}
      />

      {/* ═══ Layer 6: Vignette ═══ */}
      <div className="scene__vignette" />

      {/* ═══ Layer 7: UI Overlay ═══ */}
      {isHome && (
        <DeskUiLayer
          members={members}
          isSeated={isSeated}
          onSitDown={onSitDown}
          onOpenMenu={onOpenMenu}
        />
      )}

      {/* ═══ Mini Card (on meeple tap) ═══ */}
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

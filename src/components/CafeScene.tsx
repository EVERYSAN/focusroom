/**
 * CafeScene — layered desk scene for the focus room.
 *
 * Architecture (bottom → top):
 *   1. Desk Layer       — desk_texture.png (clean wood surface)
 *   2. Stylize Overlay  — grain + desaturation filter (illustration feel)
 *   3. Objects Layer     — individual transparent PNGs (notebook, pen, coffee)
 *   4. Atmosphere Layer  — dust particles (subtle, slow)
 *   5. Light Layer       — soft spot light from upper-left
 *   6. Seats Layer       — Meeple figures around the desk edge
 *   7. Sticky Layer      — Whisper notes that fade in/out on the desk
 *   8. Vignette Layer    — CSS radial-gradient edge darkening
 *   9. UI Layer          — Calm text on notebook + "この席に座る" button
 *   +  Mini Card         — Popup on meeple tap
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

const ASSETS = {
  desk: '/assets/desk_texture.png',
  notebook: '/assets/notebook.png',
  pen: '/assets/pen.png',
  coffee: '/assets/coffee.png',
} as const

/* ── Dust — fewer, slower, subtler ── */

const DUST_COUNT = 18
const dustMotes = Array.from({ length: DUST_COUNT }, (_, i) => ({
  x: `${8 + ((i * 7.3) % 84)}%`,
  y: `${5 + ((i * 11.7) % 90)}%`,
  delay: `${(i * 2.3) % 18}s`,
  dur: `${18 + (i % 5) * 4}s`,
  size: 1 + (i % 3) * 0.4,
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
    img.src = ASSETS.desk
  }, [])

  /* ── Micro-parallax (mouse/gyro → 4-10px shift) ── */
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  const handlePointerMove = useCallback((e: MouseEvent) => {
    const cx = window.innerWidth / 2
    const cy = window.innerHeight / 2
    const dx = ((e.clientX - cx) / cx) * 6  // max ±6px
    const dy = ((e.clientY - cy) / cy) * 4  // max ±4px
    setOffset({ x: dx, y: dy })
  }, [])

  const handleDeviceOrientation = useCallback((e: DeviceOrientationEvent) => {
    const gamma = e.gamma ?? 0 // left-right tilt
    const beta = e.beta ?? 0   // front-back tilt
    const dx = (gamma / 45) * 8  // max ±8px
    const dy = ((beta - 45) / 45) * 5  // max ±5px
    setOffset({ x: Math.max(-8, Math.min(8, dx)), y: Math.max(-5, Math.min(5, dy)) })
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

  // Close mini card when leaving home
  useEffect(() => {
    if (!isHome) setSelectedSeat(null)
  }, [isHome])

  const parallaxStyle = {
    transform: `translate(${offset.x}px, ${offset.y}px)`,
  }

  return (
    <div className="scene" ref={sceneRef} aria-hidden={!isHome}>
      {/* Parallax wrapper — entire desk shifts subtly */}
      <div className="scene__parallax" style={parallaxStyle}>

        {/* ═══ Layer 1: Desk Surface ═══ */}
        <div
          className={`scene__desk ${deskLoaded ? 'scene__desk--loaded' : ''}`}
          style={{ backgroundImage: `url(${ASSETS.desk})` }}
        />

        {/* ═══ Layer 2: Stylize Overlay (illustration feel) ═══ */}
        <div className="scene__stylize" />
        <div className="scene__grain" />

        {/* ═══ Layer 3: Objects (individual PNGs) ═══ */}
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

        {/* ═══ Layer 4: Atmosphere (dust only, no steam) ═══ */}
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

        {/* ═══ Layer 5: Soft Light (upper-left spot) ═══ */}
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

      {/* ═══ Layer 9: UI Overlay (outside parallax) ═══ */}
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

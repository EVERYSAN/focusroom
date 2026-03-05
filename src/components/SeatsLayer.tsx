/**
 * SeatsLayer — Wooden meeple figures at the desk edge.
 *
 * 36px wooden board-game meeples.
 * 5-color palette: blue, green, orange, mustard, purple.
 * Placed at desk edge (80% line).
 * Scale-breathing with phase offset.
 */

import { useState, useEffect } from 'react'
import type { PresenceMember, FocusStatus } from '../types'

/* ── Constants ── */

const MAX_SEATS = 8

/** Desk edge positions — compensated for 125% zoom + 16% inset */
export const SEAT_POSITIONS = [
  { x: 34, y: 32 },  // top-left
  { x: 50, y: 28 },  // top-center
  { x: 66, y: 32 },  // top-right
  { x: 69, y: 44 },  // right-upper
  { x: 69, y: 56 },  // right-lower
  { x: 66, y: 68 },  // bottom-right
  { x: 50, y: 72 },  // bottom-center
  { x: 34, y: 68 },  // bottom-left
]

/** 5-color meeple palette */
const MEEPLE_COLORS = [
  '#5B7B9A', // blue
  '#6B8C5A', // green
  '#C4835A', // orange
  '#B8973F', // mustard
  '#8A6B94', // purple
]

/* ── Types ── */

export type SeatMember = PresenceMember & { __ghost?: boolean }

/* ── Helpers ── */

function buildSeats(members: PresenceMember[]): SeatMember[] {
  const real: SeatMember[] = members
    .slice(0, MAX_SEATS)
    .map(m => ({ ...m, __ghost: false }))
  const need = Math.max(0, MAX_SEATS - real.length)
  const ghosts: SeatMember[] = Array.from({ length: need }, (_, i) => ({
    userId: `ghost-${i}`,
    displayName: `Guest #${(i + 0x10).toString(16).toUpperCase()}`,
    focusStatus: 'focusing' as FocusStatus,
    joinedAt: new Date(Date.now() - (i + 1) * 180_000).toISOString(),
    __ghost: true,
  }))
  return [...real, ...ghosts]
}

/* ── Meeple SVG ── */

const BODY_D =
  'M10 14 C10 12 12 10.5 15 10.5 C18 10.5 20 12 20 14' +
  ' L23 17 L29 20 L27 23.5 L22 21 L23.5 35 L6.5 35' +
  ' L8 21 L3 23.5 L1 20 L7 17 Z'

function MeepleSvg({ color, index }: { color: string; index: number }) {
  const sId = `ms${index}`
  const hId = `mh${index}`

  return (
    <svg viewBox="0 0 30 36" className="seat__svg" aria-hidden="true">
      <defs>
        <linearGradient id={sId} x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity={0.22} />
          <stop offset="100%" stopColor="#000" stopOpacity={0.14} />
        </linearGradient>
        <radialGradient id={hId} cx="0.30" cy="0.15" r="0.55" fx="0.30" fy="0.15">
          <stop offset="0%" stopColor="#fff" stopOpacity={0.26} />
          <stop offset="100%" stopColor="#fff" stopOpacity={0} />
        </radialGradient>
      </defs>

      <circle cx="15" cy="7" r="5.5" fill={color} />
      <path d={BODY_D} fill={color} />

      <circle cx="15" cy="7" r="5.5" fill={`url(#${sId})`} />
      <path d={BODY_D} fill={`url(#${sId})`} />

      <circle cx="15" cy="7" r="5.5" fill={`url(#${hId})`} />
      <path d={BODY_D} fill={`url(#${hId})`} />

      <circle cx="15" cy="7" r="5.5" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="0.6" />
      <path d={BODY_D} fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="0.6" />
    </svg>
  )
}

/* ── Component ── */

interface Props {
  members: PresenceMember[]
  selfUserId: string
  isSeated: boolean
  onMeepleTap: (member: SeatMember, seatIndex: number) => void
}

export function SeatsLayer({ members, selfUserId, isSeated, onMeepleTap }: Props) {
  const seats = buildSeats(members)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    if (isSeated && !hasAnimated) {
      setHasAnimated(true)
    }
  }, [isSeated, hasAnimated])

  return (
    <div className="seats-layer">
      {seats.map((seat, i) => {
        const pos = SEAT_POSITIONS[i]
        const isYou = seat.userId === selfUserId
        const isGhost = !!seat.__ghost
        const isIdle =
          seat.focusStatus === 'idle' || seat.focusStatus === 'break'
        const showBounce = isYou && isSeated && hasAnimated

        const cls = [
          'seat',
          isYou && 'seat--you',
          isGhost && 'seat--ghost',
          isIdle && !isGhost && 'seat--idle',
          !isIdle && !isGhost && 'seat--focusing',
          showBounce && 'seat--entering',
        ]
          .filter(Boolean)
          .join(' ')

        return (
          <button
            key={seat.userId}
            className={cls}
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              '--breathe-dur': `${6 + (i % 4) * 0.8}s`,
              '--breathe-phase': `${-(i * 1.1) % 9}s`,
            } as React.CSSProperties}
            onClick={e => {
              e.stopPropagation()
              onMeepleTap(seat, i)
            }}
            aria-label={seat.displayName}
          >
            <MeepleSvg
              color={MEEPLE_COLORS[i % MEEPLE_COLORS.length]}
              index={i}
            />
          </button>
        )
      })}
    </div>
  )
}

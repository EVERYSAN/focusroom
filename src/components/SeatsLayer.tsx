/**
 * SeatsLayer — Wooden meeple figures scattered on the desk.
 *
 * - 60px wooden board-game meeples (3D SVG with filters)
 * - 5-color palette: blue, green, orange, brown, purple
 * - Scattered around notebook (matching reference image)
 * - Status indicator icons (💡 idea, ☕ break)
 * - 🔥 work time label next to each meeple
 * - Scale-breathing with phase offset
 */

import { useState, useEffect } from 'react'
import type { PresenceMember, FocusStatus } from '../types'

/* ── Constants ── */

const MAX_SEATS = 8

/** Meeple positions — scattered around notebook, compensated for 125% zoom + 16% inset */
export const SEAT_POSITIONS = [
  { x: 28, y: 26, rot: -12 },   // top-left
  { x: 48, y: 20, rot: 5 },     // top-center
  { x: 64, y: 24, rot: -8 },    // top-right
  { x: 72, y: 42, rot: 15 },    // right-upper
  { x: 72, y: 58, rot: -5 },    // right-lower
  { x: 62, y: 72, rot: 10 },    // bottom-right
  { x: 42, y: 74, rot: -6 },    // bottom-center
  { x: 26, y: 62, rot: 8 },     // left-lower
]

/** 5-color meeple palette (matching reference) */
const MEEPLE_COLORS = [
  '#4A7FBA', // blue
  '#5D9E4B', // green
  '#D4853A', // orange
  '#A67735', // brown/mustard
  '#8A5BA0', // purple
]

/** Status icons mapped to focus status */
const STATUS_ICONS: Record<string, string> = {
  idea: '💡',
  break: '☕',
}

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

/** Calculate elapsed minutes from joinedAt to now */
function getElapsedMinutes(joinedAt: string): number {
  const diff = Date.now() - new Date(joinedAt).getTime()
  return Math.max(0, Math.floor(diff / 60_000))
}

/* ── 3D Meeple SVG ── */

const BODY_D =
  'M10 14 C10 12 12 10.5 15 10.5 C18 10.5 20 12 20 14' +
  ' L23 17 L29 20 L27 23.5 L22 21 L23.5 35 L6.5 35' +
  ' L8 21 L3 23.5 L1 20 L7 17 Z'

function MeepleSvg({ color, index }: { color: string; index: number }) {
  const sId = `ms${index}`
  const hId = `mh${index}`
  const fId = `mf${index}`

  return (
    <svg viewBox="0 0 30 36" className="seat__svg" aria-hidden="true">
      <defs>
        {/* Shading gradient (top-bright → bottom-dark) */}
        <linearGradient id={sId} x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity={0.30} />
          <stop offset="100%" stopColor="#000" stopOpacity={0.25} />
        </linearGradient>
        {/* Highlight from upper-left (lamp) */}
        <radialGradient id={hId} cx="0.28" cy="0.12" r="0.55" fx="0.28" fy="0.12">
          <stop offset="0%" stopColor="#fff" stopOpacity={0.40} />
          <stop offset="100%" stopColor="#fff" stopOpacity={0} />
        </radialGradient>
        {/* Drop shadow filter for 3D feel */}
        <filter id={fId} x="-20%" y="-10%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="blur" />
          <feOffset dx="0" dy="2" result="offsetBlur" />
          <feFlood floodColor="#000" floodOpacity="0.3" />
          <feComposite in2="offsetBlur" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g filter={`url(#${fId})`}>
        {/* Base color */}
        <circle cx="15" cy="7" r="5.5" fill={color} />
        <path d={BODY_D} fill={color} />

        {/* Shading overlay */}
        <circle cx="15" cy="7" r="5.5" fill={`url(#${sId})`} />
        <path d={BODY_D} fill={`url(#${sId})`} />

        {/* Highlight overlay */}
        <circle cx="15" cy="7" r="5.5" fill={`url(#${hId})`} />
        <path d={BODY_D} fill={`url(#${hId})`} />

        {/* Edge stroke for definition */}
        <circle cx="15" cy="7" r="5.5" fill="none" stroke="rgba(0,0,0,0.20)" strokeWidth="0.5" />
        <path d={BODY_D} fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="0.5" />
      </g>
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

  // Tick every 60s to update work-time labels
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60_000)
    return () => clearInterval(id)
  }, [])

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

        // Determine status icon
        const statusIcon = !isGhost ? STATUS_ICONS[seat.focusStatus ?? ''] : undefined

        // Work time
        const elapsedMin = getElapsedMinutes(seat.joinedAt)

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
              '--seat-rot': `${pos.rot}deg`,
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
            {statusIcon && (
              <span className="seat__status-icon">{statusIcon}</span>
            )}
            {/* 🔥 Work time label */}
            {elapsedMin > 0 && (
              <span className="seat__timer">
                🔥 {elapsedMin}分
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

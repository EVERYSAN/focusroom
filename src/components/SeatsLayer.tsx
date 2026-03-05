/**
 * SeatsLayer — Wooden meeple figures placed around the desk.
 *
 * Design: "Board-game wooden meeple on a late-night cafe desk"
 * NOT UI icons — physical objects with:
 *   1) Contact shadow (downward drop-shadow on desk)
 *   2) Gradient body (lighter top from lamp, darker bottom)
 *   3) Lamp highlight (radialGradient upper-left)
 *   4) Subtle edge darkening (thin stroke, not a drawn line)
 *   5) Micro-glow for focusing state (warm, faint)
 *
 * States:
 *   focusing — default, warm micro-glow
 *   idle     — opacity 0.55, no glow
 *   you      — slightly stronger gold glow
 *   ghost    — very dim (placeholder seats)
 *
 * Breathing: scale 1.0 ↔ 1.04, 6–9s, phase offset per seat.
 * Max 8 seats. Positions pulled inward to "sit at the desk edge."
 */

import { useState, useEffect } from 'react'
import type { PresenceMember, FocusStatus } from '../types'

/* ── Constants ── */

const MAX_SEATS = 8

/** Fixed positions — pulled closer to desk center for "gathering" feel */
export const SEAT_POSITIONS = [
  { x: 27, y: 22 },  // top-left
  { x: 50, y: 19 },  // top-center
  { x: 73, y: 22 },  // top-right
  { x: 77, y: 40 },  // right-upper
  { x: 77, y: 60 },  // right-lower
  { x: 73, y: 78 },  // bottom-right
  { x: 50, y: 81 },  // bottom-center
  { x: 27, y: 78 },  // bottom-left
]

/**
 * Muted "kusumi-iro" palette — looks like painted wooden meeples
 * under dim cafe lighting. NOT pastel, NOT saturated.
 */
const MEEPLE_COLORS = [
  '#8c7058', // warm walnut
  '#6b7c5a', // moss green
  '#7a6a8c', // dusty plum
  '#8c6a58', // burnt sienna
  '#5a748c', // slate blue
  '#8c7a58', // raw umber
  '#5a8c78', // dark teal
  '#8c5a6a', // berry
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

/* ══════════════════════════════════════════════
   Meeple SVG — "Wooden board-game piece"
   ══════════════════════════════════════════════
   viewBox 0 0 30 36
   Head:  circle (15, 7) r=5.5
   Body:  classic meeple silhouette (arms out, wide base)
   Layers (bottom → top):
     ① Base color fill
     ② Linear gradient shade (light top → dark bottom)
     ③ Radial highlight (lamp from upper-left)
     ④ Edge shadow (thin dark stroke)
   ══════════════════════════════════════════════ */

const BODY_D =
  'M10 14 C10 12 12 10.5 15 10.5 C18 10.5 20 12 20 14' +
  ' L23 17 L29 20 L27 23.5 L22 21 L23.5 35 L6.5 35' +
  ' L8 21 L3 23.5 L1 20 L7 17 Z'

function MeepleSvg({ color, index }: { color: string; index: number }) {
  const sId = `ms${index}` // shade gradient
  const hId = `mh${index}` // highlight gradient

  return (
    <svg viewBox="0 0 30 36" className="seat__svg" aria-hidden="true">
      <defs>
        {/* Shade: lighter top (lamp above) → darker bottom */}
        <linearGradient id={sId} x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity={0.20} />
          <stop offset="100%" stopColor="#000" stopOpacity={0.12} />
        </linearGradient>
        {/* Highlight: warm spot from upper-left (desk lamp) */}
        <radialGradient id={hId} cx="0.30" cy="0.15" r="0.55" fx="0.30" fy="0.15">
          <stop offset="0%" stopColor="#fff" stopOpacity={0.24} />
          <stop offset="100%" stopColor="#fff" stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* ① Base color */}
      <circle cx="15" cy="7" r="5.5" fill={color} />
      <path d={BODY_D} fill={color} />

      {/* ② Shade gradient (3D roundness) */}
      <circle cx="15" cy="7" r="5.5" fill={`url(#${sId})`} />
      <path d={BODY_D} fill={`url(#${sId})`} />

      {/* ③ Lamp highlight (upper-left glow) */}
      <circle cx="15" cy="7" r="5.5" fill={`url(#${hId})`} />
      <path d={BODY_D} fill={`url(#${hId})`} />

      {/* ④ Edge shadow (thin ambient outline — NOT a drawn border) */}
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

  // Track when user first sits down → trigger bounce animation
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
        // Show bounce for "you" meeple on first seat
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
              // Breathing duration: 6–9s, different per seat
              '--breathe-dur': `${6 + (i % 4) * 0.8}s`,
              // Phase offset: stagger so no two breathe in sync
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

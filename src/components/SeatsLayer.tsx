/**
 * SeatsLayer — Meeple figures seated around the desk perimeter.
 *
 * - Max 8 seats, filled with real members + ghost dummies
 * - Preset % positions (no random)
 * - Breathing scale animation (1.0 ↔ 1.03) with staggered phase
 * - Tap a meeple → bubble event to parent for MiniCard
 */

import type { PresenceMember, FocusStatus } from '../types'

/* ── Constants ── */

const MAX_SEATS = 8

/** Fixed positions around the desk edge (% of scene) */
export const SEAT_POSITIONS = [
  { x: 20, y: 12 },
  { x: 50, y: 10 },
  { x: 80, y: 12 },
  { x: 90, y: 35 },
  { x: 90, y: 65 },
  { x: 80, y: 88 },
  { x: 50, y: 90 },
  { x: 20, y: 88 },
]

/** Muted woody palette — looks like painted wooden meeples */
const MEEPLE_COLORS = [
  '#a08460', // warm brown
  '#7a8c6a', // sage green
  '#8a7a9c', // dusty purple
  '#9c7a6a', // terracotta
  '#6a849c', // steel blue
  '#9c8a6a', // ochre
  '#7a9c8c', // teal
  '#9c6a7a', // mauve
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

function MeepleSvg({ color }: { color: string }) {
  return (
    <svg
      viewBox="0 0 24 28"
      fill={color}
      className="seat__svg"
      aria-hidden="true"
    >
      {/* Head */}
      <circle cx="12" cy="5" r="4.5" />
      {/* Body + arms + legs */}
      <path d="M2.5 27 V20.5 L0 17 H8 V13.5 C8 11.5 9.8 10 12 10 C14.2 10 16 11.5 16 13.5 V17 H24 L21.5 20.5 V27 Z" />
    </svg>
  )
}

/* ── Component ── */

interface Props {
  members: PresenceMember[]
  selfUserId: string
  onMeepleTap: (member: SeatMember, seatIndex: number) => void
}

export function SeatsLayer({ members, selfUserId, onMeepleTap }: Props) {
  const seats = buildSeats(members)

  return (
    <div className="seats-layer">
      {seats.map((seat, i) => {
        const pos = SEAT_POSITIONS[i]
        const isYou = seat.userId === selfUserId
        const isGhost = !!seat.__ghost
        const isIdle =
          seat.focusStatus === 'idle' || seat.focusStatus === 'break'

        const cls = [
          'seat',
          isYou && 'seat--you',
          isGhost && 'seat--ghost',
          isIdle && !isGhost && 'seat--idle',
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
              '--breathe-dur': `${6 + (i % 3)}s`,
              '--breathe-phase': `${-(i * 1.3) % 8}s`,
            } as React.CSSProperties}
            onClick={e => {
              e.stopPropagation()
              onMeepleTap(seat, i)
            }}
            aria-label={seat.displayName}
          >
            <MeepleSvg color={MEEPLE_COLORS[i % MEEPLE_COLORS.length]} />
          </button>
        )
      })}
    </div>
  )
}

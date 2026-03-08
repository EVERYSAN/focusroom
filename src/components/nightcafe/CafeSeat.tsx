import type { Seat } from './types'
import { formatElapsed } from './useElapsed'

/* ── SVG icons for tools ── */
const LaptopIcon = () => (
  <svg viewBox="0 0 40 28" className="seat-tool-icon">
    <rect x="4" y="2" width="32" height="20" rx="2" fill="#4a4035" stroke="#6b5f4f" strokeWidth="1" />
    <rect x="7" y="5" width="26" height="14" rx="1" fill="#2d5a7b" opacity="0.6" />
    <rect x="0" y="22" width="40" height="4" rx="2" fill="#5a4f42" />
  </svg>
)

const BookIcon = () => (
  <svg viewBox="0 0 32 28" className="seat-tool-icon">
    <rect x="2" y="3" width="28" height="22" rx="1" fill="#8b6f4e" />
    <rect x="4" y="5" width="24" height="18" rx="1" fill="#f5eed6" />
    <line x1="16" y1="5" x2="16" y2="23" stroke="#d4c9a8" strokeWidth="0.5" />
    <line x1="7" y1="10" x2="14" y2="10" stroke="#c4b899" strokeWidth="0.8" />
    <line x1="7" y1="13" x2="13" y2="13" stroke="#c4b899" strokeWidth="0.8" />
    <line x1="18" y1="10" x2="25" y2="10" stroke="#c4b899" strokeWidth="0.8" />
    <line x1="18" y1="13" x2="24" y2="13" stroke="#c4b899" strokeWidth="0.8" />
  </svg>
)

const NotebookIcon = () => (
  <svg viewBox="0 0 30 28" className="seat-tool-icon">
    <rect x="3" y="2" width="24" height="24" rx="1" fill="#e8dcc8" />
    <rect x="3" y="2" width="4" height="24" fill="#c45c3e" rx="1" />
    <line x1="10" y1="8" x2="24" y2="8" stroke="#b8a88a" strokeWidth="0.6" />
    <line x1="10" y1="12" x2="22" y2="12" stroke="#b8a88a" strokeWidth="0.6" />
    <line x1="10" y1="16" x2="20" y2="16" stroke="#b8a88a" strokeWidth="0.6" />
    {/* pen */}
    <line x1="22" y1="18" x2="28" y2="6" stroke="#4a4035" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
)

const ToolIcon = ({ tool }: { tool: string }) => {
  switch (tool) {
    case 'laptop':   return <LaptopIcon />
    case 'book':     return <BookIcon />
    case 'notebook': return <NotebookIcon />
    default:         return null
  }
}

/* ── Coffee mug SVG ── */
const CoffeeMug = () => (
  <div className="seat-mug-wrap">
    <svg viewBox="0 0 28 30" className="seat-mug">
      <ellipse cx="12" cy="27" rx="10" ry="2.5" fill="#3a3228" opacity="0.3" />
      <rect x="2" y="8" width="20" height="18" rx="3" fill="#d4a574" />
      <ellipse cx="12" cy="8" rx="10" ry="3.5" fill="#c49660" />
      <ellipse cx="12" cy="8" rx="8" ry="2.5" fill="#3b2812" />
      {/* handle */}
      <path d="M22 12 Q28 12 28 18 Q28 22 22 22" fill="none" stroke="#c49660" strokeWidth="2.5" />
    </svg>
    {/* steam */}
    <div className="steam-container">
      <div className="steam steam-1" />
      <div className="steam steam-2" />
      <div className="steam steam-3" />
    </div>
  </div>
)

/* ── Pendant light SVG ── */
const PendantLight = ({ on }: { on: boolean }) => (
  <div className={`seat-light ${on ? 'light-on' : 'light-off'}`}>
    <svg viewBox="0 0 40 50" className="pendant-svg">
      <line x1="20" y1="0" x2="20" y2="15" stroke="#555" strokeWidth="1.5" />
      <path d="M10 15 Q10 12 20 12 Q30 12 30 15 L28 30 Q28 32 20 32 Q12 32 12 30 Z"
        fill={on ? '#f5d28a' : '#665d50'} />
      <ellipse cx="20" cy="32" rx="8" ry="2" fill={on ? '#f0c560' : '#554e42'} />
    </svg>
    {on && <div className="light-glow" />}
  </div>
)

/* ── Chair SVG ── */
const Chair = () => (
  <svg viewBox="0 0 36 40" className="seat-chair">
    <rect x="4" y="0" width="28" height="16" rx="3" fill="#5a4a38" />
    <rect x="6" y="16" width="24" height="6" rx="2" fill="#6b5b48" />
    <rect x="6" y="22" width="4" height="16" rx="1" fill="#4a3c2c" />
    <rect x="26" y="22" width="4" height="16" rx="1" fill="#4a3c2c" />
    <rect x="8" y="34" width="20" height="3" rx="1" fill="#4a3c2c" />
  </svg>
)

/* ── Main seat component ── */
export function CafeSeat({ seat }: { seat: Seat }) {
  const { occupied, name, activity, joinedAt, tool } = seat

  return (
    <div className={`cafe-seat ${occupied ? 'occupied' : 'vacant'}`}>
      <PendantLight on={occupied} />

      <div className="seat-counter-surface">
        {occupied && tool && tool !== 'none' && (
          <div className="seat-tool">
            <ToolIcon tool={tool} />
          </div>
        )}
        {occupied && <CoffeeMug />}
      </div>

      <Chair />

      {occupied && name && (
        <div className="seat-info">
          <span className="seat-name">{name}</span>
          {activity && <span className="seat-activity">{activity}</span>}
          {joinedAt && (
            <span className="seat-time">🔥 {formatElapsed(joinedAt)}</span>
          )}
        </div>
      )}

      {!occupied && (
        <div className="seat-info vacant-info">
          <span className="seat-vacant-label">空席</span>
        </div>
      )}
    </div>
  )
}

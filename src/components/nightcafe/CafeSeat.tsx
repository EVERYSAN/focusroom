import type { Seat } from './types'
import { formatElapsed } from './useElapsed'

/* Warmth level based on session duration (quiet, stepped) */
export function getWarmthLevel(joinedAt?: Date): number {
  if (!joinedAt) return 0
  const minutes = Math.floor((Date.now() - joinedAt.getTime()) / 60_000)
  if (minutes >= 60) return 3
  if (minutes >= 30) return 2
  if (minutes >= 10) return 1
  return 0
}

/* ══════════════════════════════════════════
   Enhanced SVG Icons — larger, more detailed
   ══════════════════════════════════════════ */

const LaptopIcon = () => (
  <svg viewBox="0 0 80 55" className="seat-tool-icon">
    {/* Shadow under laptop */}
    <ellipse cx="40" cy="52" rx="36" ry="3" fill="rgba(0,0,0,0.25)" />
    {/* Screen bezel */}
    <rect x="8" y="2" width="64" height="38" rx="3" fill="#3a3530" stroke="#4a4540" strokeWidth="1" />
    {/* Screen */}
    <rect x="11" y="5" width="58" height="32" rx="1.5" fill="#1a2332" />
    {/* Code lines */}
    <rect x="15" y="10" width="28" height="1.5" rx="0.75" fill="#4ade80" opacity="0.55" />
    <rect x="15" y="14" width="38" height="1.5" rx="0.75" fill="#60a5fa" opacity="0.45" />
    <rect x="19" y="18" width="30" height="1.5" rx="0.75" fill="#e2e8f0" opacity="0.25" />
    <rect x="19" y="22" width="22" height="1.5" rx="0.75" fill="#fbbf24" opacity="0.35" />
    <rect x="15" y="26" width="34" height="1.5" rx="0.75" fill="#e2e8f0" opacity="0.25" />
    <rect x="19" y="30" width="18" height="1.5" rx="0.75" fill="#a78bfa" opacity="0.3" />
    {/* Screen glow */}
    <rect x="11" y="5" width="58" height="32" rx="1.5" fill="url(#screenGlow)" opacity="0.15" />
    {/* Keyboard base */}
    <path d="M4 40 L76 40 L80 48 Q80 52 76 52 L4 52 Q0 52 0 48 L4 40 Z" fill="#2a2824" />
    {/* Keyboard surface */}
    <rect x="14" y="42" width="52" height="6" rx="1" fill="#333028" />
    {/* Trackpad */}
    <rect x="30" y="45" width="20" height="4" rx="1.5" fill="#2a2824" stroke="#3a3530" strokeWidth="0.5" />
    <defs>
      <linearGradient id="screenGlow" x1="0.5" y1="0" x2="0.5" y2="1">
        <stop offset="0%" stopColor="#60a5fa" />
        <stop offset="100%" stopColor="transparent" />
      </linearGradient>
    </defs>
  </svg>
)

const BookIcon = () => (
  <svg viewBox="0 0 72 50" className="seat-tool-icon">
    {/* Shadow */}
    <ellipse cx="36" cy="48" rx="32" ry="2.5" fill="rgba(0,0,0,0.2)" />
    {/* Spine shadow */}
    <rect x="34" y="4" width="4" height="40" fill="rgba(0,0,0,0.15)" />
    {/* Left page */}
    <path d="M4 6 Q4 4 6 4 L34 4 L34 44 L6 44 Q4 44 4 42 Z" fill="#f5eed6" />
    <path d="M4 6 Q4 4 6 4 L34 4 L34 44 L6 44 Q4 44 4 42 Z" fill="none" stroke="#d4c9a8" strokeWidth="0.5" />
    {/* Right page */}
    <path d="M38 4 L66 4 Q68 4 68 6 L68 42 Q68 44 66 44 L38 44 Z" fill="#f8f2e0" />
    <path d="M38 4 L66 4 Q68 4 68 6 L68 42 Q68 44 66 44 L38 44 Z" fill="none" stroke="#d4c9a8" strokeWidth="0.5" />
    {/* Left page text lines */}
    <line x1="9" y1="12" x2="30" y2="12" stroke="#c4b899" strokeWidth="0.7" />
    <line x1="9" y1="16" x2="28" y2="16" stroke="#c4b899" strokeWidth="0.7" />
    <line x1="9" y1="20" x2="31" y2="20" stroke="#c4b899" strokeWidth="0.7" />
    <line x1="9" y1="24" x2="26" y2="24" stroke="#c4b899" strokeWidth="0.7" />
    <line x1="9" y1="28" x2="29" y2="28" stroke="#c4b899" strokeWidth="0.7" />
    <line x1="9" y1="32" x2="24" y2="32" stroke="#c4b899" strokeWidth="0.7" />
    {/* Right page text lines */}
    <line x1="42" y1="12" x2="63" y2="12" stroke="#c4b899" strokeWidth="0.7" />
    <line x1="42" y1="16" x2="60" y2="16" stroke="#c4b899" strokeWidth="0.7" />
    <line x1="42" y1="20" x2="64" y2="20" stroke="#c4b899" strokeWidth="0.7" />
    <line x1="42" y1="24" x2="58" y2="24" stroke="#c4b899" strokeWidth="0.7" />
    <line x1="42" y1="28" x2="62" y2="28" stroke="#c4b899" strokeWidth="0.7" />
    {/* Book cover edges visible */}
    <rect x="2" y="3" width="68" height="44" rx="2" fill="none" stroke="#8b6f4e" strokeWidth="1.5" />
  </svg>
)

const NotebookIcon = () => (
  <svg viewBox="0 0 65 48" className="seat-tool-icon">
    {/* Shadow */}
    <ellipse cx="28" cy="46" rx="26" ry="2" fill="rgba(0,0,0,0.2)" />
    {/* Notebook body */}
    <rect x="4" y="2" width="48" height="42" rx="2" fill="#e8dcc8" />
    {/* Red spine/binding */}
    <rect x="4" y="2" width="6" height="42" fill="#c45c3e" rx="1" />
    {/* Spiral binding dots */}
    <circle cx="7" cy="8" r="1.5" fill="#a04030" />
    <circle cx="7" cy="16" r="1.5" fill="#a04030" />
    <circle cx="7" cy="24" r="1.5" fill="#a04030" />
    <circle cx="7" cy="32" r="1.5" fill="#a04030" />
    <circle cx="7" cy="40" r="1.5" fill="#a04030" />
    {/* Lines */}
    <line x1="14" y1="10" x2="48" y2="10" stroke="#b8a88a" strokeWidth="0.5" />
    <line x1="14" y1="16" x2="46" y2="16" stroke="#b8a88a" strokeWidth="0.5" />
    <line x1="14" y1="22" x2="44" y2="22" stroke="#b8a88a" strokeWidth="0.5" />
    <line x1="14" y1="28" x2="42" y2="28" stroke="#b8a88a" strokeWidth="0.5" />
    <line x1="14" y1="34" x2="40" y2="34" stroke="#b8a88a" strokeWidth="0.5" />
    {/* Handwriting hint */}
    <path d="M16 12 Q22 9 28 13 Q32 15 38 11" fill="none" stroke="#6b5f4f" strokeWidth="0.6" opacity="0.3" />
    <path d="M16 18 Q24 15 32 19" fill="none" stroke="#6b5f4f" strokeWidth="0.6" opacity="0.3" />
    {/* Pen laying beside */}
    <line x1="54" y1="38" x2="62" y2="8" stroke="#4a4035" strokeWidth="2" strokeLinecap="round" />
    <line x1="62" y1="8" x2="63" y2="5" stroke="#2a2520" strokeWidth="1.5" strokeLinecap="round" />
    {/* Page corner fold */}
    <path d="M48 40 L52 44 L52 40 Z" fill="#d4c9b0" />
  </svg>
)

export const ToolIcon = ({ tool }: { tool: string }) => {
  switch (tool) {
    case 'laptop':   return <LaptopIcon />
    case 'book':     return <BookIcon />
    case 'notebook': return <NotebookIcon />
    default:         return null
  }
}

/* ── Coffee mug SVG (enhanced) ── */
export const CoffeeMug = () => (
  <div className="seat-mug-wrap">
    <svg viewBox="0 0 44 48" className="seat-mug">
      {/* Shadow */}
      <ellipse cx="18" cy="44" rx="16" ry="3" fill="rgba(0,0,0,0.2)" />
      {/* Mug body */}
      <path d="M2 14 L2 38 Q2 42 6 42 L30 42 Q34 42 34 38 L34 14 Z" fill="#d4a574" />
      {/* Mug body gradient overlay */}
      <path d="M2 14 L2 38 Q2 42 6 42 L30 42 Q34 42 34 38 L34 14 Z"
        fill="url(#mugShade)" />
      {/* Mug rim (top ellipse) */}
      <ellipse cx="18" cy="14" rx="16" ry="5" fill="#c49660" />
      {/* Coffee surface */}
      <ellipse cx="18" cy="14" rx="13" ry="3.5" fill="#3b2812" />
      {/* Coffee highlight */}
      <ellipse cx="14" cy="13" rx="5" ry="1.5" fill="rgba(100,70,30,0.3)" />
      {/* Handle */}
      <path d="M34 20 Q42 20 42 28 Q42 34 34 34" fill="none" stroke="#c49660" strokeWidth="3.5" strokeLinecap="round" />
      <defs>
        <linearGradient id="mugShade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(0,0,0,0.1)" />
          <stop offset="50%" stopColor="transparent" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.15)" />
        </linearGradient>
      </defs>
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
export const PendantLight = ({ on, warmth = 0 }: { on: boolean; warmth?: number }) => (
  <div className={`seat-light ${on ? `light-on warmth-${warmth}` : 'light-off'}`}>
    <svg viewBox="0 0 40 50" className="pendant-svg">
      <line x1="20" y1="0" x2="20" y2="15" stroke="#555" strokeWidth="1.5" />
      <path d="M10 15 Q10 12 20 12 Q30 12 30 15 L28 30 Q28 32 20 32 Q12 32 12 30 Z"
        fill={on ? '#f5d28a' : '#665d50'} />
      <ellipse cx="20" cy="32" rx="8" ry="2" fill={on ? '#f0c560' : '#554e42'} />
    </svg>
    {on && <div className="light-glow" />}
  </div>
)

/* ── Stool SVG (replaces Chair) ── */
export const Stool = ({ occupied = false }: { occupied?: boolean }) => (
  <svg viewBox="0 0 54 58" className="seat-stool">
    {/* Shadow on floor */}
    <ellipse cx="27" cy="56" rx="20" ry="2.5" fill="rgba(0,0,0,0.25)" />
    {/* Seat (ellipse viewed at angle) */}
    <ellipse cx="27" cy="14" rx="24" ry="9"
      fill={occupied ? '#8B6914' : '#5a4a38'} />
    {/* Seat top highlight */}
    <ellipse cx="27" cy="12" rx="19" ry="6"
      fill="none" stroke="rgba(255,220,160,0.15)" strokeWidth="0.8" />
    {/* Seat surface grain */}
    <ellipse cx="27" cy="14" rx="20" ry="7"
      fill="url(#stoolGrain)" opacity="0.3" />
    {/* 4 legs */}
    <line x1="12" y1="20" x2="8" y2="52" stroke="#3a2810" strokeWidth="3" strokeLinecap="round" />
    <line x1="42" y1="20" x2="46" y2="52" stroke="#3a2810" strokeWidth="3" strokeLinecap="round" />
    <line x1="19" y1="22" x2="16" y2="52" stroke="#3a2810" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="35" y1="22" x2="38" y2="52" stroke="#3a2810" strokeWidth="2.5" strokeLinecap="round" />
    {/* Cross bar */}
    <line x1="12" y1="38" x2="42" y2="38" stroke="#3a2810" strokeWidth="2.5" strokeLinecap="round" />
    <defs>
      <radialGradient id="stoolGrain" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stopColor="rgba(255,200,120,0.2)" />
        <stop offset="100%" stopColor="transparent" />
      </radialGradient>
    </defs>
  </svg>
)

/* ── Small pencil icon for activity edit ── */
export const EditPencil = () => (
  <svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M11 1.5l3.5 3.5M2 11l7-7 3.5 3.5-7 7H2v-3.5z" />
  </svg>
)

/* ── Exported helpers ── */
export { formatElapsed }
export type { Seat }

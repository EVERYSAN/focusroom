import { dummySeats } from './dummyData'
import { useElapsedTick } from './useElapsed'
import { CafeSeat } from './CafeSeat'
import './nightcafe.css'

export function NightCafe() {
  useElapsedTick()

  return (
    <div className="nightcafe">
      {/* ambient overlay layers */}
      <div className="nc-bg" />
      <div className="nc-vignette" />

      {/* distant ambient ceiling lights */}
      <div className="nc-ambient-lights">
        <div className="nc-ambient-light" />
        <div className="nc-ambient-light" />
        <div className="nc-ambient-light" />
      </div>

      {/* header */}
      <header className="nc-header">
        <h1 className="nc-title">FocusRoom</h1>
        <p className="nc-subtitle">静かな夜カフェで、誰かと一緒に集中する</p>
      </header>

      {/* counter area */}
      <div className="nc-counter-area">
        {/* back wall with shelf silhouettes */}
        <div className="nc-back-wall">
          <div className="nc-shelf" />
          <div className="nc-shelf nc-shelf-2" />
        </div>
        <div className="nc-counter-bar" />
        <div className="nc-seats-scroll">
          <div className="nc-seats">
            {dummySeats.map((seat) => (
              <CafeSeat key={seat.id} seat={seat} />
            ))}
          </div>
        </div>
      </div>

      {/* floor area below counter */}
      <div className="nc-floor" />

      {/* bottom bar (placeholder) */}
      <nav className="nc-bottom-bar">
        <button className="nc-nav-btn" aria-label="スケジュール">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="16" y1="2" x2="16" y2="6" />
          </svg>
        </button>
        <button className="nc-nav-btn nc-nav-main" aria-label="入室">
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <button className="nc-nav-btn" aria-label="ブックマーク">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M5 3h14v18l-7-4-7 4V3z" />
          </svg>
        </button>
      </nav>
    </div>
  )
}

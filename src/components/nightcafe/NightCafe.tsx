import { useState, useCallback, useEffect, useRef } from 'react'
import { useElapsedTick } from './useElapsed'
import { useCafePresence } from './useCafePresence'
import { CafeSeat } from './CafeSeat'
import './nightcafe.css'

/* Per-seat layout config for gentle curve effect.
   Edge seats sit slightly higher (further away in perspective)
   and are scaled down; chairs angle inward. */
const seatLayout = [
  { offsetY: -12, chairRotate:  8, scale: 0.89 },
  { offsetY:  -5, chairRotate:  4, scale: 0.95 },
  { offsetY:   0, chairRotate:  1, scale: 1    },
  { offsetY:   0, chairRotate: -1, scale: 1    },
  { offsetY:  -5, chairRotate: -4, scale: 0.95 },
  { offsetY: -12, chairRotate: -8, scale: 0.89 },
]

export function NightCafe() {
  useElapsedTick()

  /* ── Realtime presence ── */
  const {
    seats, joiningIndices, mySeatIndex, occupiedCount, isFull,
    sitDown, updateActivity, events, clearEvent,
  } = useCafePresence('default')

  const isSeated = mySeatIndex !== null

  /* ── Auto-clear events after animation (4s) ── */
  const eventTimersRef = useRef<Map<string, number>>(new Map())
  useEffect(() => {
    for (const ev of events) {
      if (eventTimersRef.current.has(ev.id)) continue
      const timerId = window.setTimeout(() => {
        clearEvent(ev.id)
        eventTimersRef.current.delete(ev.id)
      }, 4200)
      eventTimersRef.current.set(ev.id, timerId)
    }
  }, [events, clearEvent])

  /* ── Entry overlay state ── */
  const [entryVisible, setEntryVisible] = useState(true)
  const [entryFading, setEntryFading] = useState(false)
  const [inputValue, setInputValue] = useState('')

  /* ── Full-café toast ── */
  const [showFullToast, setShowFullToast] = useState(false)

  /* ── Activity edit state ── */
  const [editOpen, setEditOpen] = useState(false)
  const [editValue, setEditValue] = useState('')

  // When café becomes full while the overlay is still showing,
  // dismiss the overlay and show the toast instead so the user can watch.
  useEffect(() => {
    if (isFull && entryVisible && !isSeated) {
      setEntryFading(true)
      setTimeout(() => {
        setEntryVisible(false)
        setShowFullToast(true)
      }, 400)
    }
    // When a seat opens up while the toast is showing, hide the toast
    // and re-show the entry overlay.
    if (!isFull && showFullToast && !isSeated) {
      setShowFullToast(false)
      setEntryFading(false)
      setEntryVisible(true)
    }
  }, [isFull, entryVisible, showFullToast, isSeated])

  const handleJoin = useCallback(async () => {
    const activity = inputValue.trim()
    if (!activity || isFull) return
    setEntryFading(true)
    await sitDown(activity)
    setTimeout(() => setEntryVisible(false), 400)
  }, [inputValue, sitDown, isFull])

  const handleUpdate = useCallback(async () => {
    const activity = editValue.trim()
    if (!activity) return
    await updateActivity(activity)
    setEditOpen(false)
    setEditValue('')
  }, [editValue, updateActivity])

  return (
    <div className="nightcafe">
      {/* ambient overlay layers */}
      <div className="nc-bg" />
      <div className="nc-vignette" />

      {/* café window — rainy night scene */}
      <div className="nc-window" aria-hidden="true">
        <div className="nc-window-scene">
          <div className="nc-city-glow" />
        </div>
        <div className="nc-rain-layer nc-rain-1" />
        <div className="nc-rain-layer nc-rain-2" />
        <div className="nc-glass-drop" style={{ left: '11%', animationDelay: '0s', animationDuration: '5.2s' }} />
        <div className="nc-glass-drop" style={{ left: '27%', animationDelay: '2.1s', animationDuration: '6.8s' }} />
        <div className="nc-glass-drop" style={{ left: '44%', animationDelay: '4.5s', animationDuration: '5.6s' }} />
        <div className="nc-glass-drop" style={{ left: '62%', animationDelay: '1.4s', animationDuration: '7.2s' }} />
        <div className="nc-glass-drop" style={{ left: '80%', animationDelay: '3.8s', animationDuration: '6.0s' }} />
        <div className="nc-window-mullion" />
      </div>

      {/* distant ambient ceiling lights */}
      <div className="nc-ambient-lights">
        <div className="nc-ambient-light" />
        <div className="nc-ambient-light" />
        <div className="nc-ambient-light" />
      </div>

      {/* header */}
      <header className="nc-header">
        <h1 className="nc-title">FocusRoom</h1>
        {isSeated || showFullToast ? (
          <p className="nc-people-count">
            今夜のカフェ <span className="nc-count-num">{occupiedCount}人</span>が集中しています
          </p>
        ) : (
          <p className="nc-subtitle">静かな夜カフェで、誰かと一緒に集中する</p>
        )}
      </header>

      {/* quiet event log — ephemeral toasts for join/leave */}
      {events.length > 0 && (
        <div className="nc-event-strip">
          {events.map((ev) => (
            <div key={ev.id} className="nc-event-item">
              {ev.type === 'join'
                ? `${ev.displayName} が入室しました`
                : `${ev.displayName} が退出しました`}
            </div>
          ))}
        </div>
      )}

      {/* counter area */}
      <div className="nc-counter-area">
        {/* back wall with shelf silhouettes */}
        <div className="nc-back-wall">
          <div className="nc-shelf" />
          <div className="nc-shelf nc-shelf-2" />
        </div>
        <div className="nc-counter-bar" />
        <div className="nc-counter-edge" />
        <div className="nc-seats-wrap">
          <div className="nc-seats">
            {seats.map((seat, i) => {
              const layout = seatLayout[i]
              return (
                <CafeSeat
                  key={seat.id}
                  seat={seat}
                  chairRotate={layout.chairRotate}
                  joining={joiningIndices.has(i)}
                  isMine={mySeatIndex === i}
                  onEditActivity={() => setEditOpen(true)}
                  style={{
                    transform: `translateY(${layout.offsetY}px) scale(${layout.scale})`,
                  }}
                />
              )
            })}
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
        <button
          className="nc-nav-btn nc-nav-main"
          aria-label={isSeated ? '活動を変更' : '入室'}
          onClick={isSeated ? () => setEditOpen(true) : undefined}
        >
          {isSeated ? (
            /* pencil icon */
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 1 1 3.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          ) : (
            /* plus icon */
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          )}
        </button>
        <button className="nc-nav-btn" aria-label="ブックマーク">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M5 3h14v18l-7-4-7 4V3z" />
          </svg>
        </button>
      </nav>

      {/* Full-café toast — floats above bottom bar so user can still see the café */}
      {showFullToast && (
        <div className="nc-full-toast">
          満席です — 席が空いたら入室できます
        </div>
      )}

      {/* Activity edit overlay */}
      {editOpen && (
        <div className="nc-edit-overlay" onClick={() => setEditOpen(false)}>
          <div className="nc-edit-card" onClick={(e) => e.stopPropagation()}>
            <p className="nc-edit-label">今やっていることを変更</p>
            <form onSubmit={(e) => { e.preventDefault(); handleUpdate() }}>
              <input
                className="nc-edit-input"
                placeholder="例: 読書、勉強、デザイン..."
                maxLength={20}
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
              />
              <button type="submit" className="nc-edit-btn" disabled={!editValue.trim()}>
                変更する
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Entry overlay — shown on first visit */}
      {entryVisible && (
        <div className={`nc-entry-overlay ${entryFading ? 'fading' : ''}`}>
          <div className="nc-entry-card">
            <p className="nc-entry-greeting">Welcome to FocusRoom</p>
            <p className="nc-entry-label">今日は何をしますか？</p>
            <form onSubmit={(e) => { e.preventDefault(); handleJoin() }}>
              <input
                className="nc-entry-input"
                placeholder="例: React開発、読書、レポート..."
                maxLength={20}
                autoFocus
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <button
                type="submit"
                className="nc-entry-btn"
                disabled={!inputValue.trim() || isFull}
              >
                {isFull ? '満席です' : '入室する'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

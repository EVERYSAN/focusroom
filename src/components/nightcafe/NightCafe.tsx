import { useState, useCallback, useEffect, useRef } from 'react'
import { useElapsedTick } from './useElapsed'
import { useCafePresence } from './useCafePresence'
import {
  PendantLight, ToolIcon, CoffeeMug, Stool, EditPencil,
  getWarmthLevel, formatElapsed,
} from './CafeSeat'
import './nightcafe.css'

/* ── Layout: 6 seats ── */
const SEAT_COUNT = 6

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

  useEffect(() => {
    if (isFull && entryVisible && !isSeated) {
      setEntryFading(true)
      setTimeout(() => {
        setEntryVisible(false)
        setShowFullToast(true)
      }, 400)
    }
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

  /* ── Occupied seats for status overlay ── */
  const occupiedSeats = seats.filter(s => s.occupied)

  return (
    <div className="nightcafe">
      {/* ══ Background layers ══ */}
      <div className="nc-bg" />
      <div className="nc-vignette" />

      {/* ══════════════════════════════════
          ZONE 1 — Window (hero, top ~50%)
          ══════════════════════════════════ */}
      <div className="nc-window-zone" aria-hidden="true">
        {/* Night sky + city bokeh */}
        <div className="nc-window-scene">
          <div className="nc-city-glow" />
        </div>

        {/* Rain layers */}
        <div className="nc-rain-layer nc-rain-1" />
        <div className="nc-rain-layer nc-rain-2" />

        {/* Glass water drops */}
        <div className="nc-glass-drop" style={{ left: '11%', animationDelay: '0s', animationDuration: '5.2s' }} />
        <div className="nc-glass-drop" style={{ left: '27%', animationDelay: '2.1s', animationDuration: '6.8s' }} />
        <div className="nc-glass-drop" style={{ left: '44%', animationDelay: '4.5s', animationDuration: '5.6s' }} />
        <div className="nc-glass-drop" style={{ left: '62%', animationDelay: '1.4s', animationDuration: '7.2s' }} />
        <div className="nc-glass-drop" style={{ left: '80%', animationDelay: '3.8s', animationDuration: '6.0s' }} />

        {/* Glass condensation haze */}
        <div className="nc-condensation" />

        {/* Wooden window frame */}
        <div className="nc-window-frame">
          <div className="nc-window-mullion" />
        </div>

        {/* Pendant lights (one per seat, hanging from top) */}
        <div className="nc-pendant-row">
          {seats.map((seat, i) => {
            const warmth = seat.occupied ? getWarmthLevel(seat.joinedAt) : 0
            return (
              <div key={seat.id} className="nc-pendant-slot">
                <PendantLight on={seat.occupied} warmth={warmth} />
              </div>
            )
          })}
        </div>
      </div>

      {/* ══ Status overlay ON the window ══ */}
      {(isSeated || showFullToast) && (
        <div className="nc-status-overlay">
          <p className="nc-status-title">
            いま <span className="nc-status-count">{occupiedCount}人</span>が集中しています
          </p>
          <div className="nc-status-members">
            {occupiedSeats.map(s => (
              <span className={`nc-status-card ${mySeatIndex !== null && seats[mySeatIndex]?.id === s.id ? 'is-me' : ''}`} key={s.id}>
                <span className="nc-status-dot" />
                <span className="nc-status-name">{mySeatIndex !== null && seats[mySeatIndex]?.id === s.id ? 'あなた' : s.name}</span>
                {s.joinedAt && (
                  <span className="nc-status-fire">🔥 {formatElapsed(s.joinedAt)}</span>
                )}
                {s.activity && <span className="nc-status-activity">{s.activity}</span>}
              </span>
            ))}
          </div>
          {/* Event toasts */}
          {events.length > 0 && (
            <div className="nc-status-events">
              {events.map(ev => (
                <div key={ev.id} className="nc-status-event">
                  • {ev.type === 'join'
                    ? `${ev.displayName} が入室しました`
                    : `${ev.displayName} が退出しました`}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Subtitle when not seated */}
      {!isSeated && !showFullToast && (
        <div className="nc-window-subtitle">
          <p>静かな夜カフェで、誰かと一緒に集中する</p>
        </div>
      )}

      {/* ══════════════════════════════════
          ZONE 2 — Counter (wood surface + items)
          ══════════════════════════════════ */}
      <div className="nc-counter-zone">
        <div className="nc-counter-surface" />

        {/* Items on counter (tool + mug per seat) */}
        <div className="nc-counter-items">
          {seats.map((seat, i) => (
            <div
              key={seat.id}
              className={`nc-counter-item ${seat.occupied ? 'occupied' : 'vacant'}`}
            >
              {seat.occupied && seat.tool && seat.tool !== 'none' && (
                <div className="nc-item-tool">
                  <ToolIcon tool={seat.tool} />
                </div>
              )}
              {seat.occupied && <CoffeeMug />}
            </div>
          ))}
        </div>

        <div className="nc-counter-edge" />
      </div>

      {/* ══════════════════════════════════
          ZONE 3 — Stools + labels
          ══════════════════════════════════ */}
      <div className="nc-stool-zone">
        <div className="nc-stools">
          {seats.map((seat, i) => (
            <div
              key={seat.id}
              className={`nc-stool-seat ${seat.occupied ? 'occupied' : 'vacant'} ${mySeatIndex === i ? 'my-seat' : ''}`}
            >
              <Stool occupied={seat.occupied} />
              {seat.occupied && seat.name ? (
                <div className="nc-stool-label">
                  <span className="nc-stool-name">{mySeatIndex === i ? 'あなた' : seat.name}</span>
                  {seat.joinedAt && (
                    <span className="nc-stool-time">🔥 {formatElapsed(seat.joinedAt)}</span>
                  )}
                  {seat.activity && (
                    <span className="nc-stool-activity">
                      {seat.activity}
                      {mySeatIndex === i && (
                        <button className="nc-stool-edit" onClick={() => setEditOpen(true)} aria-label="活動を変更">
                          <EditPencil />
                        </button>
                      )}
                    </span>
                  )}
                </div>
              ) : (
                <div className="nc-stool-label vacant-label" />
              )}
            </div>
          ))}
        </div>
        <div className="nc-floor-gradient" />
      </div>

      {/* ══ Bottom nav bar ══ */}
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
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 1 1 3.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          ) : (
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

      {/* ══ Full-café toast ══ */}
      {showFullToast && (
        <div className="nc-full-toast">
          満席です — 席が空いたら入室できます
        </div>
      )}

      {/* ══ Activity edit overlay ══ */}
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

      {/* ══ Entry overlay — shown on first visit ══ */}
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

/**
 * NoteCardUI — Paper-style notebook card in the center of the desk.
 *
 * Replaces the old notebook.png image with a functional UI card.
 * Shows:
 *   - Top banner: 「今この部屋で◯人が集中しています」
 *   - "Workwiz" brand title
 *   - User list: name + activity + elapsed time
 *   - "席につく" button (when not seated)
 *
 * Style: beige paper background, faint ruled lines, subtle shadow.
 */

import { useState, useEffect } from 'react'
import type { PresenceMember } from '../types'
import { ja } from '../lib/i18n'

/* ── Ghost member data for empty seats ── */

const GHOST_ACTIVITIES = [
  'React開発中',
  '資格勉強',
  '読書',
  'デザイン作業',
  'レポート作成',
  '英語学習',
  'コード書き中',
  '論文執筆',
]

function buildDisplayMembers(members: PresenceMember[], selfUserId: string): DisplayMember[] {
  // Real members first
  const real: DisplayMember[] = members.map(m => ({
    userId: m.userId,
    displayName: m.displayName,
    activity: m.activity || '',
    joinedAt: m.joinedAt,
    isGhost: false,
    isSelf: m.userId === selfUserId,
  }))

  // Fill ghosts up to at least 5 visible rows
  const need = Math.max(0, 5 - real.length)
  const ghosts: DisplayMember[] = Array.from({ length: need }, (_, i) => ({
    userId: `ghost-${i}`,
    displayName: `Guest #${(i + 0x10).toString(16).toUpperCase()}`,
    activity: GHOST_ACTIVITIES[i % GHOST_ACTIVITIES.length],
    joinedAt: new Date(Date.now() - (i + 1) * 180_000).toISOString(),
    isGhost: true,
    isSelf: false,
  }))

  return [...real, ...ghosts]
}

interface DisplayMember {
  userId: string
  displayName: string
  activity: string
  joinedAt: string
  isGhost: boolean
  isSelf: boolean
}

/* ── Time formatting ── */

function formatElapsed(joinedAt: string): string {
  const diff = Date.now() - new Date(joinedAt).getTime()
  const totalMin = Math.max(0, Math.floor(diff / 60_000))
  if (totalMin < 60) {
    return `${totalMin}分`
  }
  const hours = Math.floor(totalMin / 60)
  const mins = totalMin % 60
  return mins > 0 ? `${hours}時間${mins}分` : `${hours}時間`
}

/* ── Component ── */

interface Props {
  members: PresenceMember[]
  selfUserId: string
  isSeated: boolean
  onSitDown: () => void
}

export function NoteCardUI({ members, selfUserId, isSeated, onSitDown }: Props) {
  const displayMembers = buildDisplayMembers(members, selfUserId)

  // Count for banner
  const othersCount = members.filter(m => m.userId !== selfUserId).length
  const totalCount = members.length
  const bannerText =
    totalCount === 0
      ? ja.roomBanner.empty
      : othersCount === 0
        ? ja.roomBanner.onlyYou
        : ja.roomBanner.focusing(totalCount)

  // Tick every 60s to refresh elapsed times
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="note-card-layer">
      <div className="note-card">
        {/* Ruled lines background via CSS */}
        <div className="note-card__lines" aria-hidden="true" />

        {/* Content */}
        <div className="note-card__content">
          {/* Banner */}
          <p className="note-card__banner">{bannerText}</p>

          {/* Brand */}
          <h1 className="note-card__brand">Workwiz</h1>
          <p className="note-card__subtitle">{ja.noteCard.subtitle}</p>

          {/* Divider */}
          <div className="note-card__divider" />

          {/* User list */}
          <ul className="note-card__list">
            {displayMembers.map(m => (
              <li
                key={m.userId}
                className={[
                  'note-card__row',
                  m.isGhost && 'note-card__row--ghost',
                  m.isSelf && 'note-card__row--self',
                ].filter(Boolean).join(' ')}
              >
                <span className="note-card__name">
                  {m.isSelf ? `${m.displayName} (${ja.noteCard.you})` : m.displayName}
                </span>
                <span className="note-card__activity">
                  {m.activity || (m.isGhost ? m.activity : ja.noteCard.defaultActivity)}
                </span>
                <span className="note-card__elapsed">
                  🔥 {formatElapsed(m.joinedAt)}
                </span>
              </li>
            ))}
          </ul>

          {/* Sit down button */}
          {!isSeated && (
            <button className="note-card__btn" onClick={onSitDown}>
              {ja.actions.sitDown}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

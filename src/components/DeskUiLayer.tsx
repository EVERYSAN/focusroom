/**
 * DeskUiLayer — Minimal UI overlay for Workwiz.
 *
 * Top:    「今この部屋で◯人が集中しています」
 * Center: App brand "Workwiz" (small, subtle)
 * Bottom: 「席につく」 button (when not seated)
 */

import type { PresenceMember } from '../types'
import { ja } from '../lib/i18n'

/* ── Component ── */

interface Props {
  members: PresenceMember[]
  selfUserId: string
  isSeated: boolean
  onSitDown: () => void
}

export function DeskUiLayer({ members, selfUserId, isSeated, onSitDown }: Props) {
  // Count others (exclude self)
  const othersCount = members.filter(m => m.userId !== selfUserId).length
  const totalCount = members.length

  // Banner message
  const bannerText =
    othersCount === 0
      ? ja.roomBanner.onlyYou
      : ja.roomBanner.focusing(totalCount)

  return (
    <div className="ui-layer">
      {/* ── Top banner: online count ── */}
      <div className="ui-layer__top-banner">
        <p className="ui-layer__banner-text">{bannerText}</p>
      </div>

      {/* ── Center: brand + sit-down ── */}
      <div className="ui-layer__center">
        <h1 className="ui-layer__brand">Workwiz</h1>

        {!isSeated && (
          <button className="ui-layer__btn" onClick={onSitDown}>
            {ja.actions.sitDown}
          </button>
        )}
      </div>
    </div>
  )
}

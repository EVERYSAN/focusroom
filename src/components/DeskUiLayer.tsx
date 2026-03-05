/**
 * DeskUiLayer — UI overlay matching reference image layout.
 *
 * - Top area:    「今、静かに集中している人がいます」
 * - Member list: 「🔒 ◯◯が集中しています」 (up to 3 visible)
 * - Button:      「席につく」— wooden embossed style (bottom-right)
 * - Menu:        「•••」 bottom-right dot button
 */

import type { PresenceMember } from '../types'
import { ja } from '../lib/i18n'

/* ── Component ── */

interface Props {
  members: PresenceMember[]
  isSeated: boolean
  onSitDown: () => void
  onOpenMenu: () => void
}

export function DeskUiLayer({ members, isSeated, onSitDown, onOpenMenu }: Props) {
  const focusingMembers = members.filter(
    m => m.focusStatus === 'focusing',
  ).slice(0, 3)

  return (
    <div className="ui-layer">
      {/* ── Top area: calm text + member list ── */}
      <div className="ui-layer__top">
        <p className="ui-layer__primary">{ja.welcome.primary}</p>
        <div className="ui-layer__member-list">
          {focusingMembers.map(m => (
            <p key={m.userId} className="ui-layer__member-row">
              <span className="ui-layer__lock">🔒</span>
              {' '}
              {ja.spotlight.focusing(m.displayName)}
            </p>
          ))}
          {focusingMembers.length === 0 && (
            <p className="ui-layer__member-row">
              {ja.spotlight.nowDefault}
            </p>
          )}
        </div>
      </div>

      {/* ── Bottom-right: sit button + menu ── */}
      <div className="ui-layer__bottom">
        {!isSeated && (
          <button className="ui-layer__btn" onClick={onSitDown}>
            席につく
          </button>
        )}
        <button
          className="ui-layer__more"
          onClick={onOpenMenu}
          aria-label="メニュー"
        >
          •••
        </button>
      </div>
    </div>
  )
}

/**
 * DeskUiLayer — UI overlay centered above the notebook.
 *
 * All text + button form one centered group above the desk notebook,
 * making them feel part of the same physical space.
 *
 * - Primary:   「今、静かに集中している人がいます」
 * - Members:   「🔒 ◯◯が集中しています」 (up to 3)
 * - Status:    「いま：作業中」 (when no focused members)
 * - Button:    「席につく」— wooden embossed
 * - Menu:      「•••」 bottom-right
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
      {/* ── Centered group above notebook ── */}
      <div className="ui-layer__center">
        <p className="ui-layer__primary">{ja.welcome.primary}</p>

        {focusingMembers.length > 0 ? (
          <div className="ui-layer__member-list">
            {focusingMembers.map(m => (
              <p key={m.userId} className="ui-layer__member-row">
                <span className="ui-layer__lock">🔒</span>
                {' '}
                {ja.spotlight.focusing(m.displayName)}
              </p>
            ))}
          </div>
        ) : (
          <p className="ui-layer__member-row">
            {ja.spotlight.nowDefault}
          </p>
        )}

        {!isSeated && (
          <button className="ui-layer__btn" onClick={onSitDown}>
            席につく
          </button>
        )}
      </div>

      {/* ── Bottom-right: menu only ── */}
      <div className="ui-layer__bottom">
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

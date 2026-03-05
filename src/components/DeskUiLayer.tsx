/**
 * DeskUiLayer — Minimal text "printed on the notebook" + label-style button.
 *
 * - Main:  「今も、静かに集中している人がいます」
 * - Sub:   「◯◯さんが集中しています」 (rotates every ~15 s)
 * - Button: 「この席に座る」 — looks like a label stuck to the notebook
 * - Small "•••" menu to access other tabs
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import type { PresenceMember } from '../types'
import { ja } from '../lib/i18n'

/* ── Constants ── */

const ROTATE_INTERVAL = 15_000
const FADE_DURATION = 600

/* ── Component ── */

interface Props {
  members: PresenceMember[]
  isSeated: boolean
  onSitDown: () => void
  onOpenMenu: () => void
}

export function DeskUiLayer({ members, isSeated, onSitDown, onOpenMenu }: Props) {
  const [currentName, setCurrentName] = useState<string | null>(null)
  const [fading, setFading] = useState(false)

  const membersRef = useRef(members)
  membersRef.current = members
  const indexRef = useRef(0)

  const pickName = useCallback(() => {
    const ms = membersRef.current
    if (ms.length === 0) return null
    const idx = indexRef.current % ms.length
    indexRef.current++
    return ms[idx].displayName
  }, [])

  useEffect(() => {
    setCurrentName(pickName())

    const interval = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setCurrentName(pickName())
        setFading(false)
      }, FADE_DURATION)
    }, ROTATE_INTERVAL)

    return () => clearInterval(interval)
  }, [pickName, members.length])

  const subText = currentName
    ? ja.spotlight.focusing(currentName)
    : ja.spotlight.nowDefault

  return (
    <div className="ui-layer">
      {/* Calm text group — positioned over the notebook */}
      <div className="ui-layer__text-group">
        <p className="ui-layer__primary">{ja.welcome.primary}</p>
        <p
          className={`ui-layer__secondary ${fading ? 'ui-layer__secondary--fading' : ''}`}
        >
          {subText}
        </p>
      </div>

      {/* Label-style button — "stuck to the notebook" */}
      {!isSeated && (
        <button className="ui-layer__btn" onClick={onSitDown}>
          この席に座る
        </button>
      )}

      {/* Minimal nav — bottom corner */}
      <button
        className="ui-layer__more"
        onClick={onOpenMenu}
        aria-label="メニュー"
      >
        •••
      </button>
    </div>
  )
}

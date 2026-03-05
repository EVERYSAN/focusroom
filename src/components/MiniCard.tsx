/**
 * MiniCard — Small popup when a meeple is tapped.
 *
 * Shows: name, "集中しています", [フォロー] button.
 * Closes on outside click.
 */

import { useEffect, useRef } from 'react'
import type { PresenceMember } from '../types'
import { ja } from '../lib/i18n'

interface Props {
  member: PresenceMember & { __ghost?: boolean }
  onClose: () => void
}

export function MiniCard({ member, onClose }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    // Use mousedown (fires on NEXT interaction, not the current click)
    // and delay registration to skip the current event cycle entirely
    const raf = requestAnimationFrame(() => {
      document.addEventListener('mousedown', handler)
    })
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('mousedown', handler)
    }
  }, [onClose])

  const statusLabel =
    member.focusStatus === 'focusing'
      ? ja.memberStatus.focusing
      : member.focusStatus === 'break'
        ? ja.memberStatus.break
        : ja.memberStatus.idle

  return (
    <div ref={cardRef} className="mini-card">
      <span className="mini-card__name">{member.displayName}</span>
      <span className="mini-card__status">{statusLabel}</span>
      {!member.__ghost && (
        <button
          className="mini-card__follow"
          onClick={e => {
            e.stopPropagation()
            /* MVP: follow is a no-op placeholder */
          }}
        >
          フォロー
        </button>
      )}
    </div>
  )
}

/**
 * EntryLog — Quiet join/leave notifications at bottom-left.
 *
 * Shows up to 3 entries, auto-fades after 5 seconds.
 * Green dot = joined, gray dot = left.
 */

import { ja } from '../lib/i18n'
import type { EntryLogItem } from '../hooks/useEntryLog'

interface Props {
  entries: EntryLogItem[]
}

export function EntryLog({ entries }: Props) {
  if (entries.length === 0) return null

  return (
    <div className="entry-log">
      {entries.map(entry => (
        <div
          key={entry.id}
          className={`entry-log__item entry-log__item--${entry.type}`}
        >
          <span className={`entry-log__dot entry-log__dot--${entry.type}`} />
          <span className="entry-log__text">
            {entry.type === 'join'
              ? ja.entryLog.joined(entry.displayName)
              : ja.entryLog.left(entry.displayName)
            }
          </span>
        </div>
      ))}
    </div>
  )
}

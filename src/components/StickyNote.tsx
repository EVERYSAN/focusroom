import { useEffect, useState } from 'react'
import type { Note } from '../types'
import { relativeTime } from '../lib/time'
import { ja } from '../lib/i18n'

const TYPE_TAG_STYLES: Record<string, { color: string; label: string }> = {
  start: { color: 'bg-blue-950 text-blue-300', label: ja.categories.start },
  progress: { color: 'bg-amber-950 text-amber-300', label: ja.categories.progress },
  done: { color: 'bg-green-950 text-green-300', label: ja.categories.done },
  idea: { color: 'bg-purple-950 text-purple-300', label: ja.categories.idea },
}

interface Props {
  note: Note
  onMouseEnter: (id: string) => void
  onMouseLeave: (id: string) => void
}

export function StickyNote({ note, onMouseEnter, onMouseLeave }: Props) {
  const [visible, setVisible] = useState(false)
  const tag = TYPE_TAG_STYLES[note.type]

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(t)
  }, [])

  return (
    <div
      className={`
        paper-card rounded-lg px-4 py-3
        transition-all duration-250 ease-out
        ${visible ? 'opacity-[0.92] translate-y-0' : 'opacity-0 translate-y-2'}
      `}
      onMouseEnter={() => onMouseEnter(note.id)}
      onMouseLeave={() => onMouseLeave(note.id)}
    >
      <div className="flex items-center justify-between mb-1">
        <span className={`text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded ${tag.color}`}>
          {tag.label}
        </span>
        <span className="text-[10px] text-[var(--text-muted)]">{relativeTime(note.created_at)}</span>
      </div>
      <p className="text-sm text-[var(--text-primary)] leading-relaxed">{note.text}</p>
    </div>
  )
}

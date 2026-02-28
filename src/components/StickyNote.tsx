import { useEffect, useState } from 'react'
import type { Note } from '../types'
import { relativeTime } from '../lib/time'

const TYPE_TAG_STYLES: Record<string, { color: string; label: string }> = {
  start: { color: 'bg-blue-50 text-blue-700', label: 'Start' },
  progress: { color: 'bg-amber-50 text-amber-700', label: 'Progress' },
  done: { color: 'bg-green-50 text-green-700', label: 'Done' },
  idea: { color: 'bg-purple-50 text-purple-700', label: 'Idea' },
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
        <span className="text-[10px] text-[#b0a090]">{relativeTime(note.created_at)}</span>
      </div>
      <p className="text-sm text-[#4a3a2a] leading-relaxed">{note.text}</p>
    </div>
  )
}

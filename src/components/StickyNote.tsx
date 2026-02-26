import { useEffect, useState } from 'react'
import type { Note } from '../types'

const TYPE_TAG_STYLES: Record<string, { color: string; label: string }> = {
  start: { color: 'bg-blue-900/30 text-blue-300/80', label: 'Start' },
  progress: { color: 'bg-amber-900/30 text-amber-300/80', label: 'Progress' },
  done: { color: 'bg-green-900/30 text-green-300/80', label: 'Done' },
  idea: { color: 'bg-purple-900/30 text-purple-300/80', label: 'Idea' },
}

interface Props {
  note: Note
  onMouseEnter: (id: string) => void
  onMouseLeave: (id: string) => void
}

export function StickyNote({ note, onMouseEnter, onMouseLeave }: Props) {
  const [visible, setVisible] = useState(false)
  const tag = TYPE_TAG_STYLES[note.type]

  // Enter animation
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
      <span className={`text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded ${tag.color}`}>
        {tag.label}
      </span>
      <p className="text-sm text-[#d4c4a8] mt-1.5 leading-relaxed">{note.text}</p>
    </div>
  )
}

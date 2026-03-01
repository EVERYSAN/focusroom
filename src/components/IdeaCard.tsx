import type { Note } from '../types'

export function IdeaCard({ note }: { note: Note }) {
  return (
    <div className="idea-card">
      <span className="text-amber-500 text-sm shrink-0">💡</span>
      <p className="text-sm text-[var(--text-primary)] leading-snug flex-1 min-w-0 break-words">
        {note.text}
      </p>
    </div>
  )
}

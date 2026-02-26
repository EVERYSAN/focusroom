import type { Note } from '../types'

export function IdeaCard({ note }: { note: Note }) {
  return (
    <div className="idea-card">
      <span className="text-purple-300/80 text-sm">&#x1f4a1;</span>
      <p className="text-sm text-[#d4c4a8] leading-snug flex-1 min-w-0 break-words">
        {note.text}
      </p>
    </div>
  )
}

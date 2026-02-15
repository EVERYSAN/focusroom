import type { Note } from '../types'
import { StickyNote } from './StickyNote'

interface Props {
  notes: Note[]
  hiddenCount: number
  onPauseFade?: (id: string) => void
  onResumeFade?: (id: string) => void
}

export function StickyWall({ notes, hiddenCount, onPauseFade, onResumeFade }: Props) {
  return (
    <div className="fixed right-4 bottom-4 w-72 flex flex-col gap-2 z-50">
      {hiddenCount > 0 && (
        <div className="text-xs text-[#9a8b78] text-right pr-1">
          +{hiddenCount} updates
        </div>
      )}
      {notes.map(note => (
        <StickyNote
          key={note.id}
          note={note}
          onMouseEnter={id => onPauseFade?.(id)}
          onMouseLeave={id => onResumeFade?.(id)}
        />
      ))}
    </div>
  )
}

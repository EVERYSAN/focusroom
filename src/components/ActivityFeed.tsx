import type { Note } from '../types'
import { StickyNote } from './StickyNote'

interface Props {
  notes: Note[]
  hiddenCount: number
  onPauseFade: (id: string) => void
  onResumeFade: (id: string) => void
}

export function ActivityFeed({ notes, hiddenCount, onPauseFade, onResumeFade }: Props) {
  return (
    <div className="panel">
      <h2 className="font-serif text-xl text-[#5a4a3a] mb-4">Activity</h2>

      {hiddenCount > 0 && (
        <div className="text-xs text-[#9a8b78] mb-2">
          +{hiddenCount} updates
        </div>
      )}

      <div className="activity-feed">
        {notes.length === 0 ? (
          <p className="text-sm text-[#b8a994]">No recent updates</p>
        ) : (
          notes.map(note => (
            <StickyNote
              key={note.id}
              note={note}
              onMouseEnter={onPauseFade}
              onMouseLeave={onResumeFade}
            />
          ))
        )}
      </div>
    </div>
  )
}

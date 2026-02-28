import { useState } from 'react'
import type { Note } from '../types'
import { ActivityEntryRow } from './ActivityEntry'
import { IdeaCard } from './IdeaCard'

type Filter = 'all' | 'following' | 'friends'

interface Props {
  notes: Note[]
  hiddenCount: number
  ideas: Note[]
  onPauseFade: (id: string) => void
  onResumeFade: (id: string) => void
}

export function ActivityFeed({ notes, hiddenCount, ideas, onPauseFade, onResumeFade }: Props) {
  const [filter, setFilter] = useState<Filter>('all')

  return (
    <div className="panel">
      <h2 className="font-serif text-lg font-semibold text-[#4a3a2a] mb-3">Activity</h2>

      {/* Filter tabs */}
      <div className="filter-tabs">
        {(['all', 'following', 'friends'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`filter-tab ${filter === f ? 'filter-tab--active' : ''}`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Burst badge */}
      {hiddenCount > 0 && (
        <div className="mb-3">
          <span className="burst-badge">+{hiddenCount} updates</span>
        </div>
      )}

      {/* Activity entries */}
      <div
        className="activity-feed"
        onMouseEnter={() => notes.forEach(n => onPauseFade(n.id))}
        onMouseLeave={() => notes.forEach(n => onResumeFade(n.id))}
      >
        {notes.length === 0 ? (
          <p className="text-sm text-[#b0a090] py-4 text-center">
            No recent updates in this room
          </p>
        ) : (
          notes.map(note => (
            <ActivityEntryRow key={note.id} note={note} />
          ))
        )}
      </div>

      {/* Ideas section */}
      {ideas.length > 0 && (
        <div className="ideas-section">
          <h3 className="text-xs text-[#8a7a6a] uppercase tracking-wider mb-2">
            💡 Ideas
          </h3>
          {ideas.map(idea => <IdeaCard key={idea.id} note={idea} />)}
        </div>
      )}
    </div>
  )
}

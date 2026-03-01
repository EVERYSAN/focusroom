import { useState } from 'react'
import type { Note } from '../types'
import { ActivityEntryRow } from './ActivityEntry'
import { IdeaCard } from './IdeaCard'
import { ja } from '../lib/i18n'

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
      <h2 className="font-serif text-lg font-semibold text-[var(--text-primary)] mb-3">{ja.activity.title}</h2>

      {/* Filter tabs */}
      <div className="filter-tabs">
        {([['all', ja.activity.all], ['following', ja.activity.following], ['friends', ja.activity.friends]] as const).map(([f, label]) => (
          <button
            key={f}
            onClick={() => setFilter(f as Filter)}
            className={`filter-tab ${filter === f ? 'filter-tab--active' : ''}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Burst badge */}
      {hiddenCount > 0 && (
        <div className="mb-3">
          <span className="burst-badge">{ja.activity.updates(hiddenCount)}</span>
        </div>
      )}

      {/* Activity entries */}
      <div
        className="activity-feed"
        onMouseEnter={() => notes.forEach(n => onPauseFade(n.id))}
        onMouseLeave={() => notes.forEach(n => onResumeFade(n.id))}
      >
        {notes.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] py-4 text-center">
            {ja.activity.noUpdates}
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
          <h3 className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-2">
            {ja.activity.ideas}
          </h3>
          {ideas.map(idea => <IdeaCard key={idea.id} note={idea} />)}
        </div>
      )}
    </div>
  )
}

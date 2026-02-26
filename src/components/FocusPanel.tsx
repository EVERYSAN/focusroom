import { useState } from 'react'
import { StatsPanel } from './StatsPanel'
import { PostForm } from './PostForm'
import { TypingIndicator } from './TypingIndicator'
import { MemberRow } from './MemberRow'
import { IdeaCard } from './IdeaCard'
import type { Stats, NoteType, Note, Member } from '../types'
import type { PresenceUser } from '../hooks/usePresence'

type Filter = 'all' | 'following' | 'friends'

interface Props {
  members: Member[]
  ideas: Note[]
  stats: Stats
  onPost: (type: NoteType, text: string) => Promise<string | null>
  typingUsers: PresenceUser[]
  onTypingChange: (isTyping: boolean) => void
}

export function FocusPanel({ members, ideas, stats, onPost, typingUsers, onTypingChange }: Props) {
  const [filter, setFilter] = useState<Filter>('all')

  return (
    <div className="panel">
      <h1 className="font-serif text-3xl text-[#e8ddd0] mb-1 tracking-wide text-center">
        Focus Room
      </h1>
      <p className="text-sm text-[#9a8b78] mb-6 text-center">
        A calm space for quiet co-working
      </p>

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

      {/* Member list */}
      <div className="member-list">
        {members.map(m => (
          <MemberRow key={m.id} member={m} />
        ))}
      </div>

      {/* Typing indicator */}
      <TypingIndicator typingUsers={typingUsers} />

      {/* Recent Ideas */}
      {ideas.length > 0 && (
        <div className="ideas-section">
          <h3 className="text-xs text-[#7a6b58] uppercase tracking-wider mb-2">Recent Ideas</h3>
          {ideas.map(idea => (
            <IdeaCard key={idea.id} note={idea} />
          ))}
        </div>
      )}

      {/* Split post forms */}
      <div className="mt-5 w-full space-y-3">
        <PostForm
          onPost={onPost}
          onTypingChange={onTypingChange}
          categories={['start', 'progress', 'done']}
          placeholder="What are you working on?"
        />
        <PostForm
          onPost={onPost}
          categories={['idea']}
          placeholder="Share an idea..."
        />
      </div>

      {/* Stats (compact) */}
      <div className="mt-4 flex justify-center opacity-70">
        <StatsPanel stats={stats} />
      </div>
    </div>
  )
}

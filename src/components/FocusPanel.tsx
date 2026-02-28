import { PostForm } from './PostForm'
import { MemberRow } from './MemberRow'
import { IdeaCard } from './IdeaCard'
import { StatsPanel } from './StatsPanel'
import type { Room, PresenceMember, Stats, NoteType, Note } from '../types'

type Filter = 'all' | 'following' | 'friends'

interface Props {
  room: Room | undefined
  members: PresenceMember[]
  ideas: Note[]
  stats: Stats
  onPost: (type: NoteType, text: string) => Promise<string | null>
  typingUsers: PresenceUser[]
  onTypingChange: (isTyping: boolean) => void
}

export function FocusPanel({
  room, members, ideas, stats, onPost,
  elapsed, isRunning, onStart, onPause, onReset,
}: Props) {
  const roomName = room?.name ?? 'Room'

  return (
    <div className="panel">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl font-semibold text-[#4a3a2a]">
          In the {roomName}
        </h2>
        <div className="flex items-center gap-2">
          <button className="text-xs text-[#8a7a6a] border border-[#e8e0d8] rounded-lg px-3 py-1.5 hover:bg-[#f5f0ea] transition-colors cursor-pointer">
            Filter ◇
          </button>
          <button className="text-[#8a7a6a] hover:text-[#4a3a2a] transition-colors cursor-pointer text-lg">
            •••
          </button>
        </div>
      </div>

      {/* Timer */}
      <div className="focus-timer">
        <div className="focus-timer__display">{formatTime(elapsed)}</div>
        <div className="flex gap-2 mt-3">
          {isRunning ? (
            <button onClick={onPause} className="focus-timer__btn">Pause</button>
          ) : (
            <button onClick={onStart} className="focus-timer__btn">
              {elapsed > 0 ? 'Resume' : 'Start'}
            </button>
          )}
          {elapsed > 0 && (
            <button onClick={onReset} className="focus-timer__btn focus-timer__btn--secondary">
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Members */}
      <div className="mt-4">
        <h3 className="text-xs text-[#8a7a6a] uppercase tracking-wider mb-2">
          Members ({members.length})
        </h3>
        {members.length === 0 ? (
          <p className="text-sm text-[#b0a090] py-2">Waiting for others to join...</p>
        ) : (
          <div>
            {members.map(m => <MemberRow key={m.userId} member={m} />)}
          </div>
        )}
      </div>

      {/* Recent Ideas */}
      {ideas.length > 0 && (
        <div className="ideas-section">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">💡</span>
            <h3 className="text-xs text-[#8a7a6a] uppercase tracking-wider">Recent Ideas</h3>
            <span className="text-[10px] bg-[#f0e8e0] text-[#8a7a6a] px-1.5 py-0.5 rounded-full">
              {ideas.length}
            </span>
          </div>
          {ideas.map(idea => <IdeaCard key={idea.id} note={idea} />)}
        </div>
      )}

      {/* Post forms */}
      <div className="mt-5 w-full space-y-3">
        <PostForm onPost={onPost} categories={['start', 'progress', 'done']} placeholder="Share a focus update..." />
        <PostForm onPost={onPost} categories={['idea']} placeholder="Share an insight..." />
      </div>

      {/* Action buttons */}
      <div className="action-buttons">
        <button className="action-btn action-btn--outline">Enter room</button>
        <button
          className="action-btn action-btn--gold"
          onClick={isRunning ? onPause : onStart}
        >
          🌱 {isRunning ? 'Pause' : 'Start focus'}
        </button>
        <button className="action-btn action-btn--salmon">💡 Share insight</button>
      </div>

      {/* Stats */}
      <div className="mt-4 flex justify-center">
        <StatsPanel stats={stats} />
      </div>
    </div>
  )
}

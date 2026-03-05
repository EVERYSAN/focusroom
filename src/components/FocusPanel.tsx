import { PostForm } from './PostForm'
import { IdeaCard } from './IdeaCard'
import { StatsPanel } from './StatsPanel'
import { ja } from '../lib/i18n'
import type { Room, PresenceMember, Stats, NoteType, Note, FocusStatus } from '../types'

export type Tab = 'focus' | 'people' | 'ideas' | 'today' | 'tools'

/* ── Helpers ── */

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function getInitials(name: string): string {
  return name.replace('Guest #', '').slice(0, 2)
}

const STATUS_DOT: Record<FocusStatus, string> = {
  focusing: 'status-dot--focusing',
  break: 'status-dot--break',
  idle: 'status-dot--idle',
}

const STATUS_LABEL: Record<FocusStatus, string> = {
  focusing: ja.memberStatus.focusing,
  break: ja.memberStatus.break,
  idle: ja.memberStatus.idle,
}

/* ── Component ── */

interface Props {
  room: Room | undefined
  members: PresenceMember[]
  ideas: Note[]
  stats: Stats
  onPost: (type: NoteType, text: string) => Promise<string | null>
  elapsed: number
  isRunning: boolean
  onStart: () => void
  onPause: () => void
  onReset: () => void
  selfUserId: string
  activeTab: Tab
  onTabChange: (t: Tab) => void
}

export function FocusPanel({
  room, members, ideas, stats, onPost,
  elapsed, isRunning, onStart, onPause, onReset,
  selfUserId, activeTab, onTabChange,
}: Props) {
  const roomName = room?.name ?? 'Room'

  // Focus tab is now handled by the desk scene — this panel only renders for other tabs.
  // This component won't even mount when activeTab === 'focus' (see App.tsx).

  const tabs: { key: Tab; label: string }[] = [
    { key: 'focus', label: ja.tabs.focus },
    { key: 'people', label: ja.tabs.people },
    { key: 'ideas', label: ja.tabs.ideas },
    { key: 'today', label: ja.tabs.today },
    { key: 'tools', label: ja.tabs.tools },
  ]

  return (
    <div className="panel">
      {/* Header + Tabs */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl font-semibold text-[var(--text-primary)]">
          {ja.focusPanel.inRoom(roomName)}
        </h2>
      </div>

      <div className="filter-tabs mb-4">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => onTabChange(t.key)}
            className={`filter-tab ${activeTab === t.key ? 'filter-tab--active' : ''}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── 人 Tab — member grid ── */}
      {activeTab === 'people' && (
        <div className="py-4">
          <div className="grid grid-cols-3 gap-4 justify-items-center max-h-[420px] overflow-y-auto">
            {members.map((m, i) => (
              <div
                key={m.userId}
                className="flex flex-col items-center gap-1.5 memberDot"
                style={{
                  '--breathe': `${5.5 + (i % 5) * 0.25}s`,
                  '--phase': `-${(i * 1.7) % 6}s`,
                } as React.CSSProperties}
              >
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-[var(--bg-surface)] flex items-center justify-center text-lg font-semibold text-[var(--text-secondary)]">
                    {getInitials(m.displayName)}
                  </div>
                  <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[var(--bg-panel)] ${STATUS_DOT[m.focusStatus]}`} />
                </div>
                <span className="text-xs text-[var(--text-primary)] font-medium truncate max-w-[80px] text-center">
                  {m.displayName}
                </span>
                <span className="text-[10px] text-[var(--text-muted)]">
                  {STATUS_LABEL[m.focusStatus]}
                </span>
              </div>
            ))}
          </div>

          {/* Post form in people tab */}
          <div className="mt-6 w-full">
            <PostForm onPost={onPost} categories={['start', 'progress', 'done']} placeholder={ja.postForm.focusPlaceholder} />
          </div>

          <div className="mt-4 flex justify-center">
            <StatsPanel stats={stats} />
          </div>
        </div>
      )}

      {/* ── ひらめき Tab ── */}
      {activeTab === 'ideas' && (
        <>
          {ideas.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] py-6 text-center">{ja.focusPanel.noIdeasYet}</p>
          ) : (
            <div className="space-y-2 mb-4">
              {ideas.map(idea => <IdeaCard key={idea.id} note={idea} />)}
            </div>
          )}
          <PostForm onPost={onPost} categories={['idea']} placeholder={ja.postForm.ideaPlaceholder} />
        </>
      )}

      {/* ── 今日やったこと Tab ── */}
      {activeTab === 'today' && (
        <div className="py-4">
          {stats.focusSessions === 0 && stats.notesCount === 0 ? (
            <p className="text-sm text-[var(--text-muted)] py-6 text-center">{ja.focusPanel.noSessionsYet}</p>
          ) : (
            <div className="flex justify-center">
              <StatsPanel stats={stats} />
            </div>
          )}
        </div>
      )}

      {/* ── ツール Tab ── */}
      {activeTab === 'tools' && (
        <div className="py-4">
          {/* Focus Timer */}
          <div className="focus-timer">
            <div className="focus-timer__display">{formatTime(elapsed)}</div>
            <div className="flex gap-2 mt-3">
              {isRunning ? (
                <button onClick={onPause} className="focus-timer__btn">{ja.timer.pause}</button>
              ) : (
                <button onClick={onStart} className="focus-timer__btn">
                  {elapsed > 0 ? ja.timer.resume : ja.timer.start}
                </button>
              )}
              {elapsed > 0 && (
                <button onClick={onReset} className="focus-timer__btn focus-timer__btn--secondary">
                  {ja.timer.reset}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

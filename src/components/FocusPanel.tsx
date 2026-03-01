import { useState } from 'react'
import { PostForm } from './PostForm'
import { IdeaCard } from './IdeaCard'
import { StatsPanel } from './StatsPanel'
import { WelcomeSection } from './WelcomeSection'
import { useFriendHeuristic } from '../hooks/useFriendHeuristic'
import { ja } from '../lib/i18n'
import type { Room, PresenceMember, Stats, NoteType, Note, FocusStatus } from '../types'

type Tab = 'focus' | 'ideas' | 'today' | 'tools'

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
}

export function FocusPanel({
  room, members, ideas, stats, onPost,
  elapsed, isRunning, onStart, onPause, onReset,
  selfUserId,
}: Props) {
  const roomName = room?.name ?? 'Room'
  const [activeTab, setActiveTab] = useState<Tab>('focus')
  const { pickWelcomeName } = useFriendHeuristic(members, selfUserId)

  const tabs: { key: Tab; label: string }[] = [
    { key: 'focus', label: ja.tabs.focus },
    { key: 'ideas', label: ja.tabs.ideas },
    { key: 'today', label: ja.tabs.today },
    { key: 'tools', label: ja.tabs.tools },
  ]

  return (
    <div className="panel">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl font-semibold text-[var(--text-primary)]">
          {ja.focusPanel.inRoom(roomName)}
        </h2>
        <div className="flex items-center gap-2">
          <button className="text-xs text-[var(--text-secondary)] border border-[var(--border-primary)] rounded-lg px-3 py-1.5 hover:bg-[var(--bg-surface)] transition-colors cursor-pointer">
            {ja.focusPanel.filter}
          </button>
          <button className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer text-lg">
            •••
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="filter-tabs mb-4">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`filter-tab ${activeTab === t.key ? 'filter-tab--active' : ''}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── 集中 Tab ── */}
      {activeTab === 'focus' && (
        <>
          <WelcomeSection pickWelcomeName={pickWelcomeName} />

          {/* User Grid — Visual Centerpiece */}
          <div className="py-6">
            {members.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)] py-4 text-center">
                {ja.focusPanel.waitingForOthers}
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-4 justify-items-center max-h-[280px] overflow-y-auto">
                {members.map(m => (
                  <div key={m.userId} className="flex flex-col items-center gap-1.5">
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
            )}
          </div>

          {/* Join Quietly Button */}
          <div className="flex justify-center mb-4">
            <button
              className="px-6 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              onClick={isRunning ? onPause : onStart}
            >
              {ja.actions.joinQuietly}
            </button>
          </div>

          {/* Post form for focus updates */}
          <div className="mt-3 w-full">
            <PostForm onPost={onPost} categories={['start', 'progress', 'done']} placeholder={ja.postForm.focusPlaceholder} />
          </div>

          {/* Stats */}
          <div className="mt-4 flex justify-center">
            <StatsPanel stats={stats} />
          </div>
        </>
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

import { useState } from 'react'
import { PostForm } from './PostForm'
import { MemberRow } from './MemberRow'
import { IdeaCard } from './IdeaCard'
import { StatsPanel } from './StatsPanel'
import { WelcomeSection } from './WelcomeSection'
import { useFriendHeuristic } from '../hooks/useFriendHeuristic'
import { ja } from '../lib/i18n'
import type { Room, PresenceMember, Stats, NoteType, Note } from '../types'

type Tab = 'focus' | 'ideas' | 'today'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
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
  ]

  return (
    <div className="panel">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl font-semibold text-[#4a3a2a]">
          {ja.focusPanel.inRoom(roomName)}
        </h2>
        <div className="flex items-center gap-2">
          <button className="text-xs text-[#8a7a6a] border border-[#e8e0d8] rounded-lg px-3 py-1.5 hover:bg-[#f5f0ea] transition-colors cursor-pointer">
            {ja.focusPanel.filter}
          </button>
          <button className="text-[#8a7a6a] hover:text-[#4a3a2a] transition-colors cursor-pointer text-lg">
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

          {/* Timer */}
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

          {/* Members */}
          <div className="mt-4">
            <h3 className="text-xs text-[#8a7a6a] uppercase tracking-wider mb-2">
              {ja.focusPanel.members(members.length)}
            </h3>
            {members.length === 0 ? (
              <p className="text-sm text-[#b0a090] py-2">{ja.focusPanel.waitingForOthers}</p>
            ) : (
              <div>
                {members.map(m => <MemberRow key={m.userId} member={m} />)}
              </div>
            )}
          </div>

          {/* Post form for focus updates */}
          <div className="mt-5 w-full">
            <PostForm onPost={onPost} categories={['start', 'progress', 'done']} placeholder={ja.postForm.focusPlaceholder} />
          </div>

          {/* Action buttons */}
          <div className="action-buttons">
            <button className="action-btn action-btn--outline">{ja.actions.enterRoom}</button>
            <button
              className="action-btn action-btn--gold"
              onClick={isRunning ? onPause : onStart}
            >
              🌱 {isRunning ? ja.actions.pauseFocus : ja.actions.startFocus}
            </button>
            <button className="action-btn action-btn--salmon">{ja.actions.shareInsight}</button>
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
            <p className="text-sm text-[#b0a090] py-6 text-center">{ja.focusPanel.noIdeasYet}</p>
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
            <p className="text-sm text-[#b0a090] py-6 text-center">{ja.focusPanel.noSessionsYet}</p>
          ) : (
            <div className="flex justify-center">
              <StatsPanel stats={stats} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

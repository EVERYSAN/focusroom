import { lazy, Suspense } from 'react'
import { PresencePanel } from './components/PresencePanel'
import { FocusPanel } from './components/FocusPanel'
import { ActivityFeed } from './components/ActivityFeed'
import { PresenceToast } from './components/PresenceToast'
import { useNotes } from './hooks/useNotes'
import { useMembers } from './hooks/useMembers'
import { usePresence } from './hooks/usePresence'

const CafeCanvas = lazy(() =>
  import('./components/CafeCanvas').then(m => ({ default: m.CafeCanvas }))
)

function App() {
  const { visibleNotes, hiddenCount, recentIdeas, addNote, stats, pauseFade, resumeFade } = useNotes()
  const { members, counts } = useMembers()
  const {
    onlineCount,
    typingUsers,
    setTyping,
    joinEvents,
    leaveEvents,
    clearJoinEvent,
    clearLeaveEvent,
  } = usePresence()

  return (
    <>
      {/* 3D cafe background */}
      <Suspense fallback={null}>
        <CafeCanvas />
      </Suspense>

      {/* UI overlay */}
      <div className="layout-grid relative z-10">
        <PresencePanel counts={counts} onlineCount={onlineCount} />
        <FocusPanel
          members={members}
          ideas={recentIdeas}
          stats={stats}
          onPost={addNote}
          typingUsers={typingUsers}
          onTypingChange={setTyping}
        />
        <ActivityFeed
          notes={visibleNotes}
          hiddenCount={hiddenCount}
          onPauseFade={pauseFade}
          onResumeFade={resumeFade}
        />
        <PresenceToast
          joinEvents={joinEvents}
          leaveEvents={leaveEvents}
          onClearJoin={clearJoinEvent}
          onClearLeave={clearLeaveEvent}
        />
      </div>
    </>
  )
}

export default App

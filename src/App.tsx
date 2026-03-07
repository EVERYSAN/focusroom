import { useRef } from 'react'
import { CafeScene } from './components/CafeScene'
import { EntryLog } from './components/EntryLog'
import { useNotes } from './hooks/useNotes'
import { usePresence } from './hooks/usePresence'
import { useEntryLog } from './hooks/useEntryLog'
import { getUserId } from './lib/userId'

function App() {
  const currentRoomId = 'cafe'
  const userId = useRef(getUserId())

  const { members, updateStatus } = usePresence(currentRoomId, userId.current)
  const {
    visibleNotes, recentIdeas: _recentIdeas,
    addNote: _addNote, pauseFade: _pauseFade, resumeFade: _resumeFade,
  } = useNotes(currentRoomId)

  const { entries } = useEntryLog(members, userId.current)

  // Auto-set status to focusing when seated
  const handleSitDown = () => {
    updateStatus('focusing')
  }

  return (
    <>
      {/* Full-screen desk scene — always visible */}
      <CafeScene
        isHome={true}
        recentPosts={visibleNotes}
        members={members}
        selfUserId={userId.current}
        isSeated={true}
        onSitDown={handleSitDown}
        onOpenMenu={() => {}}
      />

      {/* Entry log — bottom-left overlay */}
      <EntryLog entries={entries} />
    </>
  )
}

export default App

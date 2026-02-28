import { useState, useRef, useEffect } from 'react'
import { AppHeader } from './components/AppHeader'
import { PresencePanel } from './components/PresencePanel'
import { FocusPanel } from './components/FocusPanel'
import { ActivityFeed } from './components/ActivityFeed'
import { PresenceToast } from './components/PresenceToast'
import { useNotes } from './hooks/useNotes'
import { useRooms } from './hooks/useRooms'
import { usePresence } from './hooks/usePresence'
import { useFocusTimer } from './hooks/useFocusTimer'
import { getUserId } from './lib/userId'

function App() {
  const [currentRoomId, setCurrentRoomId] = useState('cafe')
  const userId = useRef(getUserId())

  const { rooms } = useRooms()
  const { members, updateStatus } = usePresence(currentRoomId, userId.current)
  const {
    visibleNotes, hiddenCount, recentIdeas,
    addNote, stats, pauseFade, resumeFade,
  } = useNotes(currentRoomId)
  const { elapsed, isRunning, start, pause, reset } = useFocusTimer(userId.current)

  const currentRoom = rooms.find(r => r.id === currentRoomId)

  // Sync focus status with Presence when timer starts/stops
  useEffect(() => {
    updateStatus(isRunning ? 'focusing' : 'idle')
  }, [isRunning, updateStatus])

  return (
    <>
      <AppHeader />
      <div className="layout-grid">
        <PresencePanel
          rooms={rooms}
          currentRoomId={currentRoomId}
          onRoomSelect={setCurrentRoomId}
          members={members}
        />
        <FocusPanel
          room={currentRoom}
          members={members}
          ideas={recentIdeas}
          stats={stats}
          onPost={addNote}
          elapsed={elapsed}
          isRunning={isRunning}
          onStart={start}
          onPause={pause}
          onReset={reset}
        />
        <ActivityFeed
          notes={visibleNotes}
          hiddenCount={hiddenCount}
          ideas={recentIdeas}
          onPauseFade={pauseFade}
          onResumeFade={resumeFade}
        />
      </div>
    </>
  )
}

export default App

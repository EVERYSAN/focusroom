import { useState, useRef, useEffect } from 'react'
import { AppHeader } from './components/AppHeader'
import { PresencePanel } from './components/PresencePanel'
import { FocusPanel, type Tab } from './components/FocusPanel'
import { ActivityFeed } from './components/ActivityFeed'
import { DeskScene } from './components/DeskScene'
import { DeskOverlay } from './components/DeskOverlay'
import { useNotes } from './hooks/useNotes'
import { useRooms } from './hooks/useRooms'
import { usePresence } from './hooks/usePresence'
import { useFocusTimer } from './hooks/useFocusTimer'
import { getUserId } from './lib/userId'

function App() {
  const [currentRoomId, setCurrentRoomId] = useState('cafe')
  const [activeTab, setActiveTab] = useState<Tab>('focus')
  const userId = useRef(getUserId())
  const isFocusMode = activeTab === 'focus'

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
      {/* Desk scene — full-screen 3D background */}
      <DeskScene
        memberCount={members.length > 0 ? members.length : 10}
        isHome={isFocusMode}
      />
      <DeskOverlay
        isHome={isFocusMode}
        recentPosts={visibleNotes}
      />

      {!isFocusMode && <AppHeader />}
      <div className={`layout-grid ${isFocusMode ? 'layout-grid--focus' : ''}`}>
        {!isFocusMode && (
          <PresencePanel
            rooms={rooms}
            currentRoomId={currentRoomId}
            onRoomSelect={setCurrentRoomId}
            members={members}
          />
        )}
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
          selfUserId={userId.current}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        {!isFocusMode && (
          <ActivityFeed
            notes={visibleNotes}
            hiddenCount={hiddenCount}
            ideas={recentIdeas}
            onPauseFade={pauseFade}
            onResumeFade={resumeFade}
          />
        )}
      </div>
    </>
  )
}

export default App

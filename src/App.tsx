import { PresencePanel } from './components/PresencePanel'
import { FocusPanel } from './components/FocusPanel'
import { ActivityFeed } from './components/ActivityFeed'
import { useNotes } from './hooks/useNotes'
import { useSeatState } from './hooks/useSeatState'
import { useFocusTimer } from './hooks/useFocusTimer'

function App() {
  const { visibleNotes, hiddenCount, addNote, stats, pauseFade, resumeFade } = useNotes()
  const { seats, counts } = useSeatState()
  const { elapsed, isRunning, start, pause, reset } = useFocusTimer()

  return (
    <div className="layout-grid">
      <PresencePanel seats={seats} counts={counts} />
      <FocusPanel
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
        onPauseFade={pauseFade}
        onResumeFade={resumeFade}
      />
    </div>
  )
}

export default App

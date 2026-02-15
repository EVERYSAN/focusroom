import { useState } from 'react'
import { StatsPanel } from './StatsPanel'
import { PostForm } from './PostForm'
import type { Stats, NoteType } from '../types'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

interface Props {
  stats: Stats
  onPost: (type: NoteType, text: string) => Promise<string | null>
  elapsed: number
  isRunning: boolean
  onStart: () => void
  onPause: () => void
  onReset: () => void
}

export function FocusPanel({ stats, onPost, elapsed, isRunning, onStart, onPause, onReset }: Props) {
  const [formOpen, setFormOpen] = useState(false)

  return (
    <div className="panel">
      <h1 className="font-serif text-3xl text-[#5a4a3a] mb-1 tracking-wide text-center">
        Focus Room
      </h1>
      <p className="text-sm text-[#9a8b78] mb-8 text-center">
        A calm space for quiet co-working
      </p>

      {/* Focus timer */}
      <div className="focus-timer">
        <div className="focus-timer__display">{formatTime(elapsed)}</div>
        <div className="flex gap-2 mt-3">
          {isRunning ? (
            <button onClick={onPause} className="focus-timer__btn">Pause</button>
          ) : (
            <button onClick={onStart} className="focus-timer__btn">Start</button>
          )}
          <button onClick={onReset} className="focus-timer__btn focus-timer__btn--secondary">Reset</button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 flex justify-center">
        <StatsPanel stats={stats} />
      </div>

      {/* Collapsible post form */}
      <div className="mt-6 w-full flex flex-col items-center">
        {formOpen ? (
          <>
            <PostForm onPost={onPost} />
            <button
              onClick={() => setFormOpen(false)}
              className="mt-2 text-xs text-[#9a8b78] hover:text-[#7a6b58] transition-colors cursor-pointer"
            >
              Collapse
            </button>
          </>
        ) : (
          <button
            onClick={() => setFormOpen(true)}
            className="px-4 py-2 rounded-lg bg-[#e0d5c4]/70 text-sm text-[#5a4a3a]
                       hover:bg-[#d5c9b8]/80 transition-colors cursor-pointer"
          >
            Share update
          </button>
        )}
      </div>
    </div>
  )
}

import type { Note, NoteType } from '../types'
import { relativeTime } from '../lib/time'
import { ja } from '../lib/i18n'

const TYPE_COLORS: Record<NoteType, string> = {
  start: 'bg-blue-400',
  progress: 'bg-amber-400',
  done: 'bg-green-500',
  idea: 'bg-purple-400',
}

const TYPE_LABELS: Record<NoteType, string> = {
  start: ja.activityTypes.start,
  progress: ja.activityTypes.progress,
  done: ja.activityTypes.done,
  idea: ja.activityTypes.idea,
}

function getInitials(userId: string): string {
  return userId.slice(0, 2).toUpperCase()
}

export function ActivityEntryRow({ note }: { note: Note }) {
  const label = TYPE_LABELS[note.type]

  return (
    <div className="activity-entry">
      <div className="activity-entry__avatar">
        {getInitials(note.user_id)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-[#4a3a2a] leading-snug">
          <span className="font-medium">Guest #{note.user_id.slice(0, 4).toUpperCase()}</span>
          {' '}{label}
          {note.type !== 'idea' && (
            <span className="text-[#8a7a6a]"> &ldquo;{note.text}&rdquo;</span>
          )}
          {note.type === 'idea' && (
            <span className="text-[#8a7a6a]">: {note.text}</span>
          )}
        </p>
        <span className="text-[11px] text-[#b0a090]">{relativeTime(note.created_at)}</span>
      </div>
      <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${TYPE_COLORS[note.type]}`} />
    </div>
  )
}

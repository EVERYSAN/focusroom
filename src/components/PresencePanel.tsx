import type { StatusCounts } from '../hooks/useMembers'

const MOCK_ROOMS = [
  { name: 'Cafe', active: 12, tags: ['#deep-work', '#design'] },
  { name: 'Lab', active: 8, tags: ['#engineering', '#backend'] },
  { name: 'Garden', active: 5, tags: ['#writing', '#reading'] },
  { name: 'Studio', active: 3, tags: ['#art', '#creative'] },
]

interface Props {
  counts: StatusCounts
  onlineCount?: number
}

export function PresencePanel({ counts, onlineCount }: Props) {
  return (
    <div className="panel">
      {/* Room info */}
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-serif text-xl text-[#e8ddd0]">Cafe</h2>
        {onlineCount !== undefined && onlineCount > 0 && (
          <span className="online-badge">
            <span className="online-badge__dot" />
            {onlineCount} online
          </span>
        )}
      </div>
      <div className="flex gap-1.5 mb-4">
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2a2218] text-[#9a8b78]">#deep-work</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2a2218] text-[#9a8b78]">#design</span>
      </div>

      {/* Status summary (compact) */}
      <div className="presence-summary">
        {counts.focusing > 0 && <span className="presence-chip presence-chip--focus">{counts.focusing} focusing</span>}
        {counts.break > 0 && <span className="presence-chip presence-chip--break">{counts.break} on break</span>}
        {counts.idea > 0 && <span className="presence-chip presence-chip--idea">{counts.idea} ideas</span>}
        {counts.idle > 0 && <span className="presence-chip presence-chip--idle">{counts.idle} idle</span>}
      </div>

      {/* Room discovery */}
      <div className="mt-6">
        <h3 className="text-xs text-[#9a8b78] uppercase tracking-wider mb-3">Rooms</h3>
        <ul className="room-list">
          {MOCK_ROOMS.map(room => (
            <li key={room.name} className="room-list-item">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-[#e8ddd0] font-medium">{room.name}</span>
                <span className="text-[11px] text-[#9a8b78]">{room.active} active</span>
              </div>
              <div className="flex gap-1">
                {room.tags.map(tag => (
                  <span key={tag} className="text-[9px] text-[#7a6b58]">{tag}</span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

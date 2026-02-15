import type { Seat, StatusCounts } from '../hooks/useSeatState'

const MOCK_ROOMS = [
  { name: 'Cafe', active: 12, tags: ['#deep-work', '#design'] },
  { name: 'Lab', active: 8, tags: ['#engineering', '#backend'] },
  { name: 'Garden', active: 5, tags: ['#writing', '#reading'] },
  { name: 'Studio', active: 3, tags: ['#art', '#creative'] },
]

interface Props {
  seats: Seat[]
  counts: StatusCounts
}

export function PresencePanel({ seats, counts }: Props) {
  return (
    <div className="panel">
      {/* Room info */}
      <h2 className="font-serif text-xl text-[#5a4a3a] mb-1">Cafe</h2>
      <div className="flex gap-1.5 mb-4">
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#e8dbc8] text-[#7a6b58]">#deep-work</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#e8dbc8] text-[#7a6b58]">#design</span>
      </div>

      {/* Seat lamp grid */}
      <div className="seat-grid--inline" aria-hidden="true">
        {seats.map((seat) => (
          <div
            key={seat.id}
            className={`seat-lamp seat-lamp--${seat.status}`}
          />
        ))}
      </div>

      {/* Status summary */}
      <div className="presence-summary">
        {counts.focus > 0 && <span className="presence-chip presence-chip--focus">{counts.focus} focusing</span>}
        {counts.break > 0 && <span className="presence-chip presence-chip--break">{counts.break} on break</span>}
        {counts.done_recently > 0 && <span className="presence-chip presence-chip--done">{counts.done_recently} done</span>}
        {counts.idle > 0 && <span className="presence-chip presence-chip--idle">{counts.idle} idle</span>}
      </div>

      {/* Room discovery */}
      <div className="mt-6">
        <h3 className="text-xs text-[#9a8b78] uppercase tracking-wider mb-3">Rooms</h3>
        <ul className="room-list">
          {MOCK_ROOMS.map(room => (
            <li key={room.name} className="room-list-item">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-[#5a4a3a] font-medium">{room.name}</span>
                <span className="text-[11px] text-[#9a8b78]">{room.active} active</span>
              </div>
              <div className="flex gap-1">
                {room.tags.map(tag => (
                  <span key={tag} className="text-[9px] text-[#a89880]">{tag}</span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

import type { Room, PresenceMember } from '../types'
import { ja } from '../lib/i18n'

interface Props {
  rooms: Room[]
  currentRoomId: string
  onRoomSelect: (roomId: string) => void
  members: PresenceMember[]
}

function getInitials(name: string): string {
  return name.replace('Guest #', '').slice(0, 2)
}

export function PresencePanel({ rooms, currentRoomId, onRoomSelect, members }: Props) {
  return (
    <div className="panel">
      {/* Room list */}
      <h2 className="font-serif text-lg font-semibold text-[#4a3a2a] mb-3">{ja.presence.rooms}</h2>
      <ul className="room-list">
        {rooms.map(room => (
          <li
            key={room.id}
            className={`room-list-item ${room.id === currentRoomId ? 'room-list-item--active' : ''}`}
            onClick={() => onRoomSelect(room.id)}
          >
            <div className="flex items-center justify-between mb-0.5">
              <span className="flex items-center gap-1.5">
                <span className="text-sm text-[#4a3a2a] font-medium">{room.name}</span>
                {room.id === currentRoomId && (
                  <span className="text-green-500 text-xs">✓</span>
                )}
              </span>
              {room.id === currentRoomId && (
                <span className="text-[11px] text-[#8a7a6a]">
                  {ja.presence.active(members.length)}
                </span>
              )}
            </div>
            <div className="flex gap-1.5">
              {room.tags.map(tag => (
                <span key={tag} className="text-[10px] text-[#b0a090]">{tag}</span>
              ))}
            </div>
          </li>
        ))}
      </ul>

      {/* Friends Online */}
      <div className="friends-online">
        <h3 className="text-xs text-[#8a7a6a] uppercase tracking-wider mb-2">
          {ja.presence.onlineInRoom}
        </h3>
        {members.length === 0 ? (
          <p className="text-xs text-[#b0a090]">{ja.presence.noOneHere}</p>
        ) : (
          <div className="flex">
            {members.slice(0, 6).map(m => (
              <div
                key={m.userId}
                className="friends-online__avatar"
                title={m.displayName}
              >
                {getInitials(m.displayName)}
              </div>
            ))}
            {members.length > 6 && (
              <div className="friends-online__avatar text-[10px]">
                +{members.length - 6}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Search */}
      <div className="search-bar">
        <span className="text-[#b0a090] text-sm">🔍</span>
        <input type="text" placeholder={ja.presence.searchRooms} readOnly />
      </div>
    </div>
  )
}

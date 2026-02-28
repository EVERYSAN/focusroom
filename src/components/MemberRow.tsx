import type { PresenceMember, FocusStatus } from '../types'
import { relativeTime } from '../lib/time'

const STATUS_LABEL: Record<FocusStatus, string> = {
  focusing: 'Focusing',
  break: 'On break',
  idle: 'Idle',
}

const STATUS_DOT: Record<FocusStatus, string> = {
  focusing: 'status-dot--focusing',
  break: 'status-dot--break',
  idle: 'status-dot--idle',
}

function getInitials(name: string): string {
  return name.replace('Guest #', '').slice(0, 2)
}

export function MemberRow({ member }: { member: PresenceMember }) {
  return (
    <div className="member-row">
      <div className="w-10 h-10 rounded-full bg-[#f5f0ea] flex items-center justify-center text-sm font-semibold text-[#8a7a6a] shrink-0">
        {getInitials(member.displayName)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-[#4a3a2a] font-semibold truncate">
            {member.displayName}
          </span>
          <span className={`status-dot ${STATUS_DOT[member.focusStatus]}`} />
        </div>
        <span className="block text-[12px] text-[#8a7a6a]">
          {STATUS_LABEL[member.focusStatus]}
        </span>
      </div>
      <span className="text-[11px] text-[#b0a090] shrink-0">
        {relativeTime(member.joinedAt)}
      </span>
    </div>
  )
}

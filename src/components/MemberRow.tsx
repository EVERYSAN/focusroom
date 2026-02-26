import type { Member, MemberStatus } from '../types'

const STATUS_DOT: Record<MemberStatus, string> = {
  focusing: 'bg-green-400',
  break: 'bg-blue-400',
  idea: 'bg-purple-400',
  idle: 'bg-[#9a8b78]/40',
}

const STATUS_LABEL: Record<MemberStatus, string> = {
  focusing: 'focusing',
  break: 'on break',
  idea: 'had an idea',
  idle: 'idle',
}

export function MemberRow({ member }: { member: Member }) {
  return (
    <div className="member-row">
      <span className="text-lg leading-none">{member.avatar}</span>
      <span className="flex-1 min-w-0">
        <span className="text-sm text-[#e8ddd0] font-medium">{member.nickname}</span>
        {member.statusText && (
          <span className="block text-[11px] text-[#9a8b78] truncate">{member.statusText}</span>
        )}
      </span>
      <span className="flex items-center gap-1.5 shrink-0">
        <span className={`w-2 h-2 rounded-full ${STATUS_DOT[member.status]}`} />
        <span className="text-[11px] text-[#7a6b58]">{STATUS_LABEL[member.status]}</span>
      </span>
    </div>
  )
}

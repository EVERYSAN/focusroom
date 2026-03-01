import type { PresenceMember, FocusStatus } from '../types'
import { relativeTime } from '../lib/time'
import { ja } from '../lib/i18n'

const STATUS_LABEL: Record<FocusStatus, string> = {
  focusing: ja.memberStatus.focusing,
  break: ja.memberStatus.break,
  idle: ja.memberStatus.idle,
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
      <div className="w-10 h-10 rounded-full bg-[var(--bg-surface)] flex items-center justify-center text-sm font-semibold text-[var(--text-secondary)] shrink-0">
        {getInitials(member.displayName)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-[var(--text-primary)] font-semibold truncate">
            {member.displayName}
          </span>
          <span className={`status-dot ${STATUS_DOT[member.focusStatus]}`} />
        </div>
        <span className="block text-[12px] text-[var(--text-secondary)]">
          {STATUS_LABEL[member.focusStatus]}
        </span>
      </div>
      <span className="text-[11px] text-[var(--text-muted)] shrink-0">
        {relativeTime(member.joinedAt)}
      </span>
    </div>
  )
}

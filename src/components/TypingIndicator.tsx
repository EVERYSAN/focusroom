import type { PresenceUser } from '../hooks/usePresence'

interface Props {
  typingUsers: PresenceUser[]
}

export function TypingIndicator({ typingUsers }: Props) {
  if (typingUsers.length === 0) return null

  const label =
    typingUsers.length === 1
      ? 'Someone is writing...'
      : `${typingUsers.length} people writing...`

  return (
    <div className="typing-indicator">
      <div className="typing-dots">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
      <span className="typing-label">{label}</span>
    </div>
  )
}

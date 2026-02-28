import { useEffect, useCallback, useRef } from 'react'
import type { PresenceMember } from '../types'

// TODO: Replace localStorage friend heuristic with a real follows table
// when user accounts are implemented. The current approach treats
// "recently seen users" as pseudo-friends.

const STORAGE_KEY = 'focus-room-seen-users'
const SESSION_KEY = 'focus-room-session-seen'
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

interface SeenUser {
  displayName: string
  lastSeen: string
  visitCount: number
}

type SeenUsersMap = Record<string, SeenUser>

function loadSeenUsers(): SeenUsersMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const map: SeenUsersMap = JSON.parse(raw)

    // Prune entries older than 30 days
    const cutoff = Date.now() - MAX_AGE_MS
    const pruned: SeenUsersMap = {}
    for (const [id, entry] of Object.entries(map)) {
      if (new Date(entry.lastSeen).getTime() > cutoff) {
        pruned[id] = entry
      }
    }
    return pruned
  } catch {
    return {}
  }
}

function saveSeenUsers(map: SeenUsersMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch { /* quota exceeded — silently ignore */ }
}

function getSessionSeen(): Set<string> {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

function addSessionSeen(userId: string): void {
  try {
    const set = getSessionSeen()
    set.add(userId)
    sessionStorage.setItem(SESSION_KEY, JSON.stringify([...set]))
  } catch { /* silently ignore */ }
}

export function useFriendHeuristic(members: PresenceMember[], selfUserId: string) {
  const lastShownRef = useRef<string | null>(null)

  // Update seen-users map whenever members change
  useEffect(() => {
    if (members.length === 0) return

    const map = loadSeenUsers()
    const sessionSeen = getSessionSeen()
    let changed = false

    for (const m of members) {
      if (m.userId === selfUserId) continue

      if (!sessionSeen.has(m.userId)) {
        addSessionSeen(m.userId)

        const existing = map[m.userId]
        if (existing) {
          existing.visitCount += 1
          existing.lastSeen = new Date().toISOString()
          existing.displayName = m.displayName
        } else {
          map[m.userId] = {
            displayName: m.displayName,
            lastSeen: new Date().toISOString(),
            visitCount: 1,
          }
        }
        changed = true
      }
    }

    if (changed) saveSeenUsers(map)
  }, [members, selfUserId])

  // TODO: When real follows table exists, replace this with a DB query.
  // Currently "friend" = user we've seen more than once across sessions.
  const pickWelcomeName = useCallback((): string | null => {
    const map = loadSeenUsers()
    const otherMembers = members.filter(m => m.userId !== selfUserId)

    if (otherMembers.length === 0) return null

    // Friends = visitCount > 1
    const friendIds = new Set(
      Object.entries(map)
        .filter(([, u]) => u.visitCount > 1)
        .map(([id]) => id)
    )

    // Priority 1: Friend currently focusing
    const friendsFocusing = otherMembers.filter(
      m => friendIds.has(m.userId) && m.focusStatus === 'focusing'
    )
    if (friendsFocusing.length > 0) return pickOne(friendsFocusing, lastShownRef)

    // Priority 2: Friend in room (any status)
    const friendsInRoom = otherMembers.filter(m => friendIds.has(m.userId))
    if (friendsInRoom.length > 0) return pickOne(friendsInRoom, lastShownRef)

    // Priority 3: Any non-self member focusing
    const anyFocusing = otherMembers.filter(m => m.focusStatus === 'focusing')
    if (anyFocusing.length > 0) return pickOne(anyFocusing, lastShownRef)

    // Priority 4: Any non-self member
    if (otherMembers.length > 0) return pickOne(otherMembers, lastShownRef)

    return null
  }, [members, selfUserId])

  return { pickWelcomeName }
}

/** Pick one member, avoiding the last-shown when possible */
function pickOne(
  candidates: PresenceMember[],
  lastShownRef: React.RefObject<string | null>,
): string {
  const filtered = candidates.length > 1
    ? candidates.filter(m => m.displayName !== lastShownRef.current)
    : candidates

  const chosen = filtered[Math.floor(Math.random() * filtered.length)]
  lastShownRef.current = chosen.displayName
  return chosen.displayName
}

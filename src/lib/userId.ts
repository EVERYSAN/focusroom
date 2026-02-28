const STORAGE_KEY = 'focus-room-user-id'

let cached: string | null = null

export function getUserId(): string {
  if (cached) return cached
  let id = localStorage.getItem(STORAGE_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(STORAGE_KEY, id)
  }
  cached = id
  return id
}

/** Derive a short display name from a UUID, e.g. "Guest #A1B2" */
export function getDisplayName(userId: string): string {
  const short = userId.slice(0, 4).toUpperCase()
  return `Guest #${short}`
}

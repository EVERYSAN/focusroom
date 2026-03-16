export type Tool = 'laptop' | 'book' | 'notebook' | 'none'

export interface Seat {
  id: number
  occupied: boolean
  name?: string
  activity?: string
  joinedAt?: Date
  tool?: Tool
}

/** Payload tracked via Supabase Presence channel */
export interface CafePresencePayload {
  userId: string
  displayName: string
  activity: string
  joinedAt: string   // ISO 8601
  tool: Tool
}

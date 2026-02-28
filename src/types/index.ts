export type NoteType = 'start' | 'progress' | 'done' | 'idea'

export interface Note {
  id: string
  user_id: string
  room_id: string
  type: NoteType
  text: string
  created_at: string
}

export interface Stats {
  focusSessions: number
  focusMinutes: number
  notesCount: number
}

export interface Room {
  id: string
  name: string
  description: string | null
  tags: string[]
}

export type FocusStatus = 'idle' | 'focusing' | 'break'

export interface PresenceMember {
  userId: string
  displayName: string
  focusStatus: FocusStatus
  joinedAt: string
}

export interface ActivityEntry {
  id: string
  userId: string
  displayName: string
  type: NoteType
  text: string
  roomId: string
  createdAt: string
}

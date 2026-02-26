export type NoteType = 'start' | 'progress' | 'done' | 'idea'

export interface Note {
  id: string
  user_id: string
  type: NoteType
  text: string
  created_at: string
}

export interface Stats {
  focusSessions: number
  focusMinutes: number
  notesCount: number
}

export type MemberStatus = 'focusing' | 'break' | 'idea' | 'idle'

export interface Member {
  id: string
  nickname: string
  avatar: string
  status: MemberStatus
  statusText?: string
}

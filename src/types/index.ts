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

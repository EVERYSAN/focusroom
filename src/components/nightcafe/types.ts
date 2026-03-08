export interface Seat {
  id: number
  occupied: boolean
  name?: string
  activity?: string
  joinedAt?: Date
  tool?: 'laptop' | 'book' | 'notebook' | 'none'
}

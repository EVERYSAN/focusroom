import type { Seat } from './types'

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000)

export const dummySeats: Seat[] = [
  {
    id: 1,
    occupied: true,
    name: 'Ryota',
    activity: 'React開発',
    joinedAt: minutesAgo(42),
    tool: 'laptop',
  },
  {
    id: 2,
    occupied: true,
    name: 'Ken',
    activity: '読書',
    joinedAt: minutesAgo(18),
    tool: 'book',
  },
  {
    id: 3,
    occupied: false,
  },
  {
    id: 4,
    occupied: true,
    name: 'Yuki',
    activity: '資格勉強',
    joinedAt: minutesAgo(72),
    tool: 'notebook',
  },
  {
    id: 5,
    occupied: true,
    name: 'Mana',
    activity: '設計',
    joinedAt: minutesAgo(25),
    tool: 'laptop',
  },
  {
    id: 6,
    occupied: false,
  },
  {
    id: 7,
    occupied: true,
    name: 'Sora',
    activity: 'レポート作成',
    joinedAt: minutesAgo(55),
    tool: 'notebook',
  },
  {
    id: 8,
    occupied: true,
    name: 'Hina',
    activity: '作業中',
    joinedAt: minutesAgo(10),
    tool: 'laptop',
  },
]

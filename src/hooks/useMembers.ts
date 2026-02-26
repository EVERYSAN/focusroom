import { useState, useEffect, useMemo } from 'react'
import type { Member, MemberStatus } from '../types'

const STATUSES: MemberStatus[] = ['focusing', 'break', 'idea', 'idle']

const MEMBER_POOL: Omit<Member, 'status' | 'statusText'>[] = [
  { id: 'u1', nickname: 'Hana', avatar: '🌿' },
  { id: 'u2', nickname: 'Kai', avatar: '🐱' },
  { id: 'u3', nickname: 'Luna', avatar: '🌙' },
  { id: 'u4', nickname: 'Rio', avatar: '🌊' },
  { id: 'u5', nickname: 'Sora', avatar: '☁️' },
  { id: 'u6', nickname: 'Mio', avatar: '🎵' },
  { id: 'u7', nickname: 'Ren', avatar: '🔥' },
  { id: 'u8', nickname: 'Yuki', avatar: '❄️' },
  { id: 'u9', nickname: 'Aoi', avatar: '🦋' },
  { id: 'u10', nickname: 'Taro', avatar: '🍵' },
]

const STATUS_TEXTS: Record<MemberStatus, string[]> = {
  focusing: ['Writing report', 'Deep coding', 'Reading docs', 'Design review', 'Bug fixing'],
  break: ['Coffee break', 'Stretching', 'Quick walk', 'Snack time'],
  idea: ['Had an insight!', 'New approach?', 'Worth trying...'],
  idle: [],
}

function randomStatus(): MemberStatus {
  return STATUSES[Math.floor(Math.random() * STATUSES.length)]
}

function randomStatusText(status: MemberStatus): string | undefined {
  const texts = STATUS_TEXTS[status]
  if (texts.length === 0) return undefined
  return texts[Math.floor(Math.random() * texts.length)]
}

function createInitialMembers(): Member[] {
  return MEMBER_POOL.map((m) => {
    const status = randomStatus()
    return { ...m, status, statusText: randomStatusText(status) }
  })
}

export interface StatusCounts {
  focusing: number
  break: number
  idea: number
  idle: number
}

function countStatuses(members: Member[]): StatusCounts {
  const counts: StatusCounts = { focusing: 0, break: 0, idea: 0, idle: 0 }
  for (const m of members) {
    counts[m.status]++
  }
  return counts
}

export function useMembers(): { members: Member[]; counts: StatusCounts } {
  const [members, setMembers] = useState(createInitialMembers)

  useEffect(() => {
    const interval = setInterval(() => {
      setMembers((prev) => {
        const next = [...prev]
        const count = Math.random() < 0.5 ? 1 : 2
        for (let i = 0; i < count; i++) {
          const idx = Math.floor(Math.random() * next.length)
          const status = randomStatus()
          next[idx] = { ...next[idx], status, statusText: randomStatusText(status) }
        }
        return next
      })
    }, 30_000 + Math.random() * 30_000)

    return () => clearInterval(interval)
  }, [])

  const counts = useMemo(() => countStatuses(members), [members])

  return { members, counts }
}

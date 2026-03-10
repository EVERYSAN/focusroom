import { useState, useEffect } from 'react'

export function formatElapsed(joinedAt: Date): string {
  const diff = Math.floor((Date.now() - joinedAt.getTime()) / 60_000)
  if (diff < 1) return '1分未満'
  if (diff < 60) return `${diff}分`
  const h = Math.floor(diff / 60)
  const m = diff % 60
  return m > 0 ? `${h}時間${m}分` : `${h}時間`
}

export function useElapsedTick() {
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000)
    return () => clearInterval(id)
  }, [])
}

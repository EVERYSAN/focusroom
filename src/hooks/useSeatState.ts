import { useState, useEffect, useMemo } from 'react'

export type SeatStatus = 'idle' | 'focus' | 'break' | 'done_recently'

export interface Seat {
  id: number
  status: SeatStatus
}

export interface StatusCounts {
  idle: number
  focus: number
  break: number
  done_recently: number
}

const SEAT_COUNT = 12
const USER_SEAT = 0
const STATUSES: SeatStatus[] = ['idle', 'focus', 'break', 'done_recently']

function randomStatus(): SeatStatus {
  return STATUSES[Math.floor(Math.random() * STATUSES.length)]
}

function createInitialSeats(): Seat[] {
  return Array.from({ length: SEAT_COUNT }, (_, i) => ({
    id: i,
    status: i === USER_SEAT ? 'focus' : randomStatus(),
  }))
}

function countStatuses(seats: Seat[]): StatusCounts {
  const counts: StatusCounts = { idle: 0, focus: 0, break: 0, done_recently: 0 }
  for (const seat of seats) {
    counts[seat.status]++
  }
  return counts
}

export function useSeatState(): { seats: Seat[]; counts: StatusCounts } {
  const [seats, setSeats] = useState(createInitialSeats)

  useEffect(() => {
    const interval = setInterval(() => {
      setSeats((prev) => {
        const next = [...prev]
        // Rotate 1–2 random non-user seats
        const count = Math.random() < 0.5 ? 1 : 2
        for (let i = 0; i < count; i++) {
          const idx = 1 + Math.floor(Math.random() * (SEAT_COUNT - 1))
          next[idx] = { ...next[idx], status: randomStatus() }
        }
        return next
      })
    }, 45_000)

    return () => clearInterval(interval)
  }, [])

  const counts = useMemo(() => countStatuses(seats), [seats])

  return { seats, counts }
}

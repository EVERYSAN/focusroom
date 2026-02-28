import { useState, useCallback, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

export function useFocusTimer(userId: string) {
  const [elapsed, setElapsed] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startedAt = useRef<Date | null>(null)

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsed(prev => prev + 1)
      }, 1000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning])

  const saveSession = useCallback(async (seconds: number) => {
    if (seconds < 60 || !startedAt.current) return // Don't save sessions under 1 min
    const focusMinutes = Math.floor(seconds / 60)
    await supabase.from('focus_sessions').insert({
      user_id: userId,
      started_at: startedAt.current.toISOString(),
      ended_at: new Date().toISOString(),
      focus_minutes: focusMinutes,
    })
    startedAt.current = null
  }, [userId])

  const start = useCallback(() => {
    if (!startedAt.current) {
      startedAt.current = new Date()
    }
    setIsRunning(true)
  }, [])

  const pause = useCallback(() => {
    setIsRunning(false)
    saveSession(elapsed)
  }, [elapsed, saveSession])

  const reset = useCallback(() => {
    if (isRunning || elapsed > 0) {
      saveSession(elapsed)
    }
    setIsRunning(false)
    setElapsed(0)
  }, [isRunning, elapsed, saveSession])

  return { elapsed, isRunning, start, pause, reset }
}

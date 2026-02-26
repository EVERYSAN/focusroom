import { useState, useCallback, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import type { Note, NoteType, Stats } from '../types'

const MAX_VISIBLE = 5
const FADE_DELAY = 12000
const COOLDOWN_MS = 10 * 60 * 1000

function getUserId(): string {
  let id = localStorage.getItem('focus-room-user-id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('focus-room-user-id', id)
  }
  return id
}

export function useNotes() {
  const [allNotes, setAllNotes] = useState<Note[]>([])
  const [stats, setStats] = useState<Stats>({
    focusSessions: 0,
    focusMinutes: 0,
    notesCount: 0,
  })
  const lastPostTime = useRef<number>(0)
  const userId = useRef(getUserId())
  const fadeTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const pausedNotes = useRef<Set<string>>(new Set())

  const removeNote = useCallback((id: string) => {
    setAllNotes(prev => prev.filter(n => n.id !== id))
    fadeTimers.current.delete(id)
    pausedNotes.current.delete(id)
  }, [])

  const startFadeTimer = useCallback((id: string) => {
    if (fadeTimers.current.has(id)) return
    const timer = setTimeout(() => removeNote(id), FADE_DELAY)
    fadeTimers.current.set(id, timer)
  }, [removeNote])

  const pauseFade = useCallback((id: string) => {
    const timer = fadeTimers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      fadeTimers.current.delete(id)
    }
    pausedNotes.current.add(id)
  }, [])

  const resumeFade = useCallback((id: string) => {
    pausedNotes.current.delete(id)
    startFadeTimer(id)
  }, [startFadeTimer])

  // Start fade timers for visible notes
  useEffect(() => {
    const visible = allNotes.slice(-MAX_VISIBLE)
    visible.forEach(note => {
      if (!fadeTimers.current.has(note.id) && !pausedNotes.current.has(note.id)) {
        startFadeTimer(note.id)
      }
    })
  }, [allNotes, startFadeTimer])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      fadeTimers.current.forEach(timer => clearTimeout(timer))
    }
  }, [])

  // Fetch recent notes + subscribe to realtime
  useEffect(() => {
    // Load recent notes (last 30 min)
    const loadRecent = async () => {
      const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()
      const { data } = await supabase
        .from('room_updates')
        .select('id, room_id, user_id, type, text, created_at')
        .eq('room_id', 'default')
        .gte('created_at', thirtyMinAgo)
        .order('created_at', { ascending: true })
        .limit(20)

      if (data) {
        setAllNotes(data as Note[])
      }
    }

    loadRecent()

    // Realtime subscription
    const channel = supabase
      .channel('room_updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'room_updates',
          filter: 'room_id=eq.default',
        },
        payload => {
          const note = payload.new as Note
          setAllNotes(prev => {
            if (prev.some(n => n.id === note.id)) return prev
            return [...prev, note]
          })
          setStats(prev => ({ ...prev, notesCount: prev.notesCount + 1 }))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Load today's stats
  useEffect(() => {
    const loadStats = async () => {
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      const todayISO = todayStart.toISOString()

      const [sessionsRes, notesRes] = await Promise.all([
        supabase
          .from('focus_sessions')
          .select('id, focus_minutes')
          .eq('user_id', userId.current)
          .gte('created_at', todayISO),
        supabase
          .from('room_updates')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId.current)
          .gte('created_at', todayISO),
      ])

      const sessions = sessionsRes.data ?? []
      setStats({
        focusSessions: sessions.length,
        focusMinutes: sessions.reduce((sum, s) => sum + (s.focus_minutes ?? 0), 0),
        notesCount: notesRes.count ?? 0,
      })
    }

    loadStats()
  }, [])

  const addNote = useCallback(async (type: NoteType, text: string): Promise<string | null> => {
    // Cooldown check
    const now = Date.now()
    if (now - lastPostTime.current < COOLDOWN_MS) {
      const remaining = Math.ceil((COOLDOWN_MS - (now - lastPostTime.current)) / 60000)
      return `Please wait ${remaining} min before posting again`
    }

    // Validation
    const trimmed = text.replace(/\s+/g, ' ').trim()
    if (trimmed.length === 0) return 'Text cannot be empty'
    if (trimmed.length > 40) return 'Max 40 characters'
    if (/https?:\/\/|www\./i.test(trimmed)) return 'URLs are not allowed'

    const { error } = await supabase.from('room_updates').insert({
      room_id: 'default',
      user_id: userId.current,
      type,
      text: trimmed,
    })

    if (error) {
      console.error('Failed to post:', error)
      return 'Failed to post. Check your connection.'
    }

    lastPostTime.current = now
    return null
  }, [])

  const statusNotes = allNotes.filter(n => n.type !== 'idea')
  const ideaNotes = allNotes.filter(n => n.type === 'idea')
  const visibleNotes = statusNotes.slice(-MAX_VISIBLE)
  const hiddenCount = Math.max(0, statusNotes.length - MAX_VISIBLE)
  const recentIdeas = ideaNotes.slice(-5)

  return {
    visibleNotes,
    hiddenCount,
    recentIdeas,
    addNote,
    stats,
    pauseFade,
    resumeFade,
  }
}

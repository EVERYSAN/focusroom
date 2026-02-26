import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface PresenceUser {
  userId: string
  isTyping: boolean
  joinedAt: string
}

function getUserId(): string {
  let id = localStorage.getItem('focus-room-user-id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('focus-room-user-id', id)
  }
  return id
}

export function usePresence() {
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([])
  const [joinEvents, setJoinEvents] = useState<string[]>([])
  const [leaveEvents, setLeaveEvents] = useState<string[]>([])
  const channelRef = useRef<RealtimeChannel | null>(null)
  const userId = useRef(getUserId())
  // Skip first effect run in StrictMode (mount→unmount→mount)
  const isFirstMount = useRef(true)

  const clearJoinEvent = useCallback((id: string) => {
    setJoinEvents(prev => prev.filter(e => e !== id))
  }, [])

  const clearLeaveEvent = useCallback((id: string) => {
    setLeaveEvents(prev => prev.filter(e => e !== id))
  }, [])

  useEffect(() => {
    // In StrictMode dev, skip the first mount (it will be immediately unmounted)
    if (isFirstMount.current) {
      isFirstMount.current = false
      return () => {
        // This cleanup runs when StrictMode unmounts the first render
        // Don't do anything — let the second mount handle setup
      }
    }

    const uid = userId.current

    const channel = supabase.channel('room-presence', {
      config: { presence: { key: uid } },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<PresenceUser>()
        const users: PresenceUser[] = []
        for (const key of Object.keys(state)) {
          const presences = state[key]
          if (presences && presences.length > 0) {
            users.push(presences[0] as unknown as PresenceUser)
          }
        }
        setOnlineUsers(users)
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        if (key !== uid) {
          setJoinEvents(prev => [...prev, key])
        }
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        if (key !== uid) {
          setLeaveEvents(prev => [...prev, key])
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            userId: uid,
            isTyping: false,
            joinedAt: new Date().toISOString(),
          })
        }
      })

    channelRef.current = channel

    return () => {
      channel.untrack()
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [])

  const setTyping = useCallback(async (isTyping: boolean) => {
    const channel = channelRef.current
    if (!channel) return
    await channel.track({
      userId: userId.current,
      isTyping,
      joinedAt: new Date().toISOString(),
    })
  }, [])

  const typingUsers = onlineUsers.filter(
    u => u.isTyping && u.userId !== userId.current
  )

  const onlineCount = onlineUsers.length

  return {
    onlineCount,
    typingUsers,
    setTyping,
    joinEvents,
    leaveEvents,
    clearJoinEvent,
    clearLeaveEvent,
    userId: userId.current,
  }
}

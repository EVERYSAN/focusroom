import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { getDisplayName } from '../lib/userId'
import type { PresenceMember, FocusStatus } from '../types'
import type { RealtimeChannel } from '@supabase/supabase-js'

export function usePresence(roomId: string, userId: string) {
  const [members, setMembers] = useState<PresenceMember[]>([])
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    const displayName = getDisplayName(userId)

    const channel = supabase.channel(`room:${roomId}`, {
      config: { presence: { key: userId } },
    })

    channelRef.current = channel

    const myState: PresenceMember = {
      userId,
      displayName,
      focusStatus: 'idle',
      joinedAt: new Date().toISOString(),
    }

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<PresenceMember>()
        const all = Object.values(state).flat()
        setMembers(all)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track(myState)
        }
      })

    return () => {
      channel.untrack()
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [roomId, userId])

  /** Update own focus status (e.g., when starting/stopping timer) */
  const updateStatus = useCallback(async (focusStatus: FocusStatus) => {
    const channel = channelRef.current
    if (!channel) return

    await channel.track({
      userId,
      displayName: getDisplayName(userId),
      focusStatus,
      joinedAt: new Date().toISOString(),
    })
  }, [userId])

  return { members, updateStatus }
}

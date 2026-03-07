/**
 * useEntryLog — Detect join/leave events by comparing members list.
 *
 * Tracks previous members and emits log entries when users join or leave.
 * Entries auto-expire after 5 seconds.
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import type { PresenceMember } from '../types'

export interface EntryLogItem {
  id: string
  displayName: string
  type: 'join' | 'leave'
  timestamp: number
}

const ENTRY_TTL = 5_000 // 5 seconds
const MAX_ENTRIES = 3

export function useEntryLog(members: PresenceMember[], selfUserId: string) {
  const [entries, setEntries] = useState<EntryLogItem[]>([])
  const prevMemberIds = useRef<Set<string>>(new Set())
  const isFirstSync = useRef(true)

  // Cleanup expired entries
  const cleanup = useCallback(() => {
    const now = Date.now()
    setEntries(prev => prev.filter(e => now - e.timestamp < ENTRY_TTL))
  }, [])

  useEffect(() => {
    const id = setInterval(cleanup, 1_000)
    return () => clearInterval(id)
  }, [cleanup])

  // Detect join/leave
  useEffect(() => {
    const currentIds = new Set(members.map(m => m.userId))

    // Skip the very first sync to avoid "everyone joined" on page load
    if (isFirstSync.current) {
      isFirstSync.current = false
      prevMemberIds.current = currentIds
      return
    }

    const prevIds = prevMemberIds.current
    const now = Date.now()
    const newEntries: EntryLogItem[] = []

    // Detect joins (in current but not in prev)
    for (const m of members) {
      if (!prevIds.has(m.userId) && m.userId !== selfUserId) {
        newEntries.push({
          id: `join-${m.userId}-${now}`,
          displayName: m.displayName,
          type: 'join',
          timestamp: now,
        })
      }
    }

    // Detect leaves (in prev but not in current)
    for (const prevId of prevIds) {
      if (!currentIds.has(prevId) && prevId !== selfUserId) {
        // We don't have the display name anymore, derive it
        const short = prevId.slice(0, 4).toUpperCase()
        newEntries.push({
          id: `leave-${prevId}-${now}`,
          displayName: `Guest #${short}`,
          type: 'leave',
          timestamp: now,
        })
      }
    }

    if (newEntries.length > 0) {
      setEntries(prev => [...prev, ...newEntries].slice(-MAX_ENTRIES))
    }

    prevMemberIds.current = currentIds
  }, [members, selfUserId])

  return { entries }
}

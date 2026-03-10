import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { getUserId, getDisplayName } from '../../lib/userId'
import type { Seat, Tool, CafePresencePayload } from './types'
import type { RealtimeChannel } from '@supabase/supabase-js'

const MAX_SEATS = 6
const SESSION_KEY = 'focusroom-cafe-joinedAt'
const SESSION_MAX_AGE = 2 * 60_000 // 2 minutes — reuse joinedAt on quick refresh

/* ── Seed personas — shown when the café is quiet ── */
const SEED_PERSONAS: {
  name: string; activity: string; tool: Tool
  minutesAgo: number; seatIndex: number; delayMs: number
}[] = [
  // Already seated when you arrive
  { name: 'ゆき',   activity: 'デザイン', tool: 'laptop',   minutesAgo: 45, seatIndex: 0, delayMs: 0 },
  { name: 'けんた', activity: '読書',     tool: 'book',     minutesAgo: 22, seatIndex: 2, delayMs: 0 },
  { name: 'あおい', activity: 'レポート', tool: 'notebook', minutesAgo: 68, seatIndex: 4, delayMs: 0 },
  // Walks in after you sit down
  { name: 'そうた', activity: 'Web開発',  tool: 'laptop',   minutesAgo: 0,  seatIndex: 5, delayMs: 90_000 },
]

/** Fill empty seats with available seed personas.
 *  `arrivedDelayed` tracks which delayed seeds have appeared and when. */
function addSeedPersonas(
  seats: Seat[],
  arrivedDelayed: Map<number, Date>,
): Seat[] {
  const result = [...seats]
  let totalOccupied = result.filter((s) => s.occupied).length

  for (let i = 0; i < SEED_PERSONAS.length; i++) {
    if (totalOccupied >= MAX_SEATS - 1) break // keep ≥1 empty seat
    const seed = SEED_PERSONAS[i]
    if (result[seed.seatIndex].occupied) continue
    if (seed.delayMs > 0 && !arrivedDelayed.has(i)) continue

    const joinedAt = seed.delayMs > 0
      ? (arrivedDelayed.get(i) ?? new Date())
      : new Date(Date.now() - seed.minutesAgo * 60_000)

    result[seed.seatIndex] = {
      id: seed.seatIndex + 1,
      occupied: true,
      name: seed.name,
      activity: seed.activity,
      joinedAt,
      tool: seed.tool,
    }
    totalOccupied++
  }
  return result
}

/* ── helpers ── */

const TOOL_RULES: [Tool, RegExp][] = [
  ['laptop',   /開発|実装|コード|coding|code|プログラ|デザイン|design|web|アプリ|サイト/i],
  ['book',     /読書|本|リーディング|reading|read|論文|小説|漫画|マンガ/i],
  ['notebook', /勉強|学習|資格|試験|study|レポート|宿題|英語|数学|ノート|note|writing|執筆/i],
]

/** Pick a tool based on what the user is doing */
function pickToolFromActivity(activity: string): Tool {
  for (const [tool, re] of TOOL_RULES) {
    if (re.test(activity)) return tool
  }
  return 'laptop' // default for generic activities
}

/** Deduplicate presence entries that share a userId (e.g. multiple tabs) */
function dedup(raw: CafePresencePayload[]): CafePresencePayload[] {
  const map = new Map<string, CafePresencePayload>()
  for (const m of raw) {
    const existing = map.get(m.userId)
    if (!existing || m.joinedAt > existing.joinedAt) {
      map.set(m.userId, m)
    }
  }
  return Array.from(map.values())
}

/** Update the stable seat-map: departed users are removed, newcomers get the
 *  lowest available seat index.  On the very first sync the members are sorted
 *  by joinedAt so every client produces the same initial layout. */
function updateSeatMap(
  seatMap: Map<string, number>,
  members: CafePresencePayload[],
) {
  const currentIds = new Set(members.map((m) => m.userId))

  // remove departed
  for (const uid of seatMap.keys()) {
    if (!currentIds.has(uid)) seatMap.delete(uid)
  }

  // sort newcomers deterministically (joinedAt asc, then userId asc)
  const sorted = [...members].sort(
    (a, b) => a.joinedAt.localeCompare(b.joinedAt) || a.userId.localeCompare(b.userId),
  )

  const usedSeats = new Set(seatMap.values())
  for (const m of sorted) {
    if (!seatMap.has(m.userId)) {
      for (let i = 0; i < MAX_SEATS; i++) {
        if (!usedSeats.has(i)) {
          seatMap.set(m.userId, i)
          usedSeats.add(i)
          break
        }
      }
    }
  }
}

/** Build the 6-element Seat[] from the seat-map and members */
function buildSeats(
  seatMap: Map<string, number>,
  members: CafePresencePayload[],
  newArrivals: Set<string>,
  selfUserId: string,
): { seats: Seat[]; joiningIndices: Set<number> } {
  const memberMap = new Map(members.map((m) => [m.userId, m]))
  const joiningIndices = new Set<number>()

  const seats: Seat[] = Array.from({ length: MAX_SEATS }, (_, i) => ({
    id: i + 1,
    occupied: false,
  }))

  for (const [uid, idx] of seatMap) {
    if (idx >= MAX_SEATS) continue
    const m = memberMap.get(uid)
    if (!m) continue
    seats[idx] = {
      id: idx + 1,
      occupied: true,
      name: uid === selfUserId ? 'あなた' : m.displayName,
      activity: m.activity,
      joinedAt: new Date(m.joinedAt),
      tool: m.tool,
    }
    if (newArrivals.has(uid)) joiningIndices.add(idx)
  }
  return { seats, joiningIndices }
}

/* ── Module-level singleton channel to survive React StrictMode ── */
/*
 * v2.99.0 note: supabase.channel(topic) now deduplicates — it returns the
 * existing channel object if one with the same topic already lives in the
 * client's internal array.  We must NOT call removeChannel() and immediately
 * re-create with the same topic, because removeChannel is async and the
 * channel stays in the array in a non-`closed` state, which causes
 * subscribe() to silently skip (it requires state === closed).
 *
 * Instead we set up bindings + subscribe exactly once per channel object and
 * use object identity to detect reuse.
 */
let _channel: RealtimeChannel | null = null
let _channelSetup = false
let _subscribed = false
const _syncListeners = new Set<() => void>()
const _statusListeners = new Set<(status: string) => void>()

function getOrCreateChannel(roomId: string, userId: string): RealtimeChannel {
  const topic = `cafe:${roomId}`

  // supabase.channel() returns the existing channel for the same topic (v2.99.0+).
  // Only creates a new RealtimeChannel when none exists yet.
  const channel = supabase.channel(topic, {
    config: { presence: { key: userId } },
  })

  // Same channel object, already wired up — nothing to do
  if (channel === _channel && _channelSetup) {
    return channel
  }

  // First call or a genuinely new channel object (topic changed)
  _channel = channel
  _subscribed = false

  if (!_channelSetup) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rt = (channel as any).socket
    console.log('[presence] setting up channel', topic, {
      channelState: (channel as any).state,
      socketConnState: rt?.connectionState?.(),
      socketConn: !!rt?.conn,
      endpointURL: rt?.endpointURL?.(),
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        _syncListeners.forEach((fn) => fn())
      })
      .subscribe((status, err) => {
        console.log('[presence] subscribe status:', status, err ?? '')
        if (status === 'SUBSCRIBED') {
          _subscribed = true
        }
        if (status === 'CHANNEL_ERROR') {
          console.error('[presence] CHANNEL_ERROR:', err)
          setTimeout(() => {
            if (_channel === channel && !_subscribed) {
              console.log('[presence] retrying subscription…')
              channel.subscribe()
            }
          }, 3000)
        }
        _statusListeners.forEach((fn) => fn(status))
      })

    // Log post-subscribe state
    console.log('[presence] post-subscribe', {
      channelState: (channel as any).state,
      socketConnState: rt?.connectionState?.(),
      socketConn: !!rt?.conn,
    })

    _channelSetup = true
  }

  return channel
}

/* ── hook ── */

export interface CafeEvent {
  id: string
  type: 'join' | 'leave'
  displayName: string
  timestamp: number
}

function makeEmptySeats(): Seat[] {
  return Array.from({ length: MAX_SEATS }, (_, i) => ({ id: i + 1, occupied: false }))
}

export function useCafePresence(roomId = 'default') {
  const userId = getUserId()
  const displayName = getDisplayName(userId)

  const [seats, setSeats] = useState<Seat[]>(() => addSeedPersonas(makeEmptySeats(), new Map()))
  const [joiningIndices, setJoiningIndices] = useState<Set<number>>(new Set())
  const [mySeatIndex, setMySeatIndex] = useState<number | null>(null)
  const [events, setEvents] = useState<CafeEvent[]>([])

  const seatMapRef = useRef<Map<string, number>>(new Map())
  const prevIdsRef = useRef<Set<string>>(new Set())
  const prevMembersRef = useRef<Map<string, CafePresencePayload>>(new Map())
  const joinedAtRef = useRef<string | null>(null)
  const pendingTrackRef = useRef<CafePresencePayload | null>(null)

  /* Seed-related refs */
  const realSeatsRef = useRef<Seat[]>(makeEmptySeats())
  const arrivedDelayedRef = useRef<Map<number, Date>>(new Map())
  const seedTimersStartedRef = useRef(false)

  /* Instant seat release on tab close / navigation away */
  useEffect(() => {
    const handleUnload = () => {
      // navigator.sendBeacon can't untrack, but closing the WebSocket
      // via untrack() in a sync beforeunload handler works in most browsers.
      _channel?.untrack()
    }
    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [])

  /* Subscribe to the singleton channel */
  useEffect(() => {
    const channel = getOrCreateChannel(roomId, userId)

    const onSync = () => {
      const state = channel.presenceState<CafePresencePayload>()
      const raw = Object.values(state).flat() as CafePresencePayload[]
      const members = dedup(raw)
      const memberMap = new Map(members.map((m) => [m.userId, m]))

      // detect new arrivals & departures
      const currentIds = new Set(members.map((m) => m.userId))
      const newArrivals = new Set<string>()
      const departures = new Set<string>()

      if (prevIdsRef.current.size > 0) {
        for (const id of currentIds) {
          if (!prevIdsRef.current.has(id)) newArrivals.add(id)
        }
        for (const id of prevIdsRef.current) {
          if (!currentIds.has(id)) departures.add(id)
        }
      }

      // emit events (skip self)
      const now = Date.now()
      const newEvents: CafeEvent[] = []
      for (const id of newArrivals) {
        if (id === userId) continue
        const m = memberMap.get(id)
        if (m) newEvents.push({ id: `j-${now}-${id}`, type: 'join', displayName: m.displayName, timestamp: now })
      }
      for (const id of departures) {
        if (id === userId) continue
        const prev = prevMembersRef.current.get(id)
        if (prev) newEvents.push({ id: `l-${now}-${id}`, type: 'leave', displayName: prev.displayName, timestamp: now })
      }
      if (newEvents.length > 0) {
        setEvents((prev) => [...prev, ...newEvents])
      }

      prevIdsRef.current = currentIds
      prevMembersRef.current = memberMap

      // update stable mapping
      updateSeatMap(seatMapRef.current, members)

      // build seats (pad with seeds when quiet)
      const result = buildSeats(seatMapRef.current, members, newArrivals, userId)
      realSeatsRef.current = result.seats
      setSeats(addSeedPersonas(result.seats, arrivedDelayedRef.current))
      setMySeatIndex(seatMapRef.current.get(userId) ?? null)

      // joining animation
      if (result.joiningIndices.size > 0) {
        setJoiningIndices(result.joiningIndices)
        setTimeout(() => setJoiningIndices(new Set()), 2200)
      }
    }

    const onStatus = async (status: string) => {
      if (status === 'SUBSCRIBED' && pendingTrackRef.current) {
        await channel.track(pendingTrackRef.current)
        pendingTrackRef.current = null
      }
    }

    _syncListeners.add(onSync)
    _statusListeners.add(onStatus)

    // If already subscribed, fire initial sync read
    if (_subscribed) {
      onSync()
    }

    return () => {
      _syncListeners.delete(onSync)
      _statusListeners.delete(onStatus)
      // Don't remove the channel here — it survives StrictMode re-mounts.
      // Real cleanup happens on page unload or when roomId changes.
    }
  }, [roomId, userId])

  /* Schedule delayed seed arrivals after user sits down */
  useEffect(() => {
    if (mySeatIndex === null || seedTimersStartedRef.current) return
    seedTimersStartedRef.current = true

    SEED_PERSONAS.forEach((seed, i) => {
      if (seed.delayMs <= 0) return

      window.setTimeout(() => {
        arrivedDelayedRef.current.set(i, new Date())

        // Rebuild seats including the new arrival
        const newSeats = addSeedPersonas(
          realSeatsRef.current,
          arrivedDelayedRef.current,
        )
        setSeats(newSeats)

        // Show toast + animation only if the seed actually got a seat
        if (newSeats[seed.seatIndex]?.occupied && newSeats[seed.seatIndex].name === seed.name) {
          setEvents((prev) => [...prev, {
            id: `sj-${Date.now()}-${seed.name}`,
            type: 'join' as const,
            displayName: seed.name,
            timestamp: Date.now(),
          }])
          setJoiningIndices(new Set([seed.seatIndex]))
          setTimeout(() => setJoiningIndices(new Set()), 2200)
        }
      }, seed.delayMs)
    })
  }, [mySeatIndex])

  /* Sit down at the café */
  const sitDown = useCallback(
    async (activity: string, tool?: Tool) => {
      // reuse joinedAt from sessionStorage on quick refresh
      let joinedAt = sessionStorage.getItem(SESSION_KEY)
      if (!joinedAt || Date.now() - new Date(joinedAt).getTime() > SESSION_MAX_AGE) {
        joinedAt = new Date().toISOString()
      }
      sessionStorage.setItem(SESSION_KEY, joinedAt)
      joinedAtRef.current = joinedAt

      const payload: CafePresencePayload = {
        userId,
        displayName,
        activity,
        joinedAt,
        tool: tool ?? pickToolFromActivity(activity),
      }

      if (_subscribed && _channel) {
        try {
          await _channel.track(payload)
        } catch (err) {
          console.error('[presence] track failed:', err)
        }
      } else {
        // channel not ready yet — queue for when SUBSCRIBED fires
        pendingTrackRef.current = payload
      }
    },
    [userId, displayName],
  )

  /* Update activity while seated */
  const updateActivity = useCallback(
    async (newActivity: string) => {
      if (!_subscribed || !_channel || !joinedAtRef.current) return

      const payload: CafePresencePayload = {
        userId,
        displayName,
        activity: newActivity,
        joinedAt: joinedAtRef.current,
        tool: pickToolFromActivity(newActivity),
      }
      await _channel.track(payload)
    },
    [userId, displayName],
  )

  /* Leave the café */
  const leave = useCallback(async () => {
    joinedAtRef.current = null
    sessionStorage.removeItem(SESSION_KEY)
    await _channel?.untrack()
  }, [])

  /* Clear a single event from the log */
  const clearEvent = useCallback((eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId))
  }, [])

  const occupiedCount = seats.filter((s) => s.occupied).length
  const isFull = occupiedCount >= MAX_SEATS

  return {
    seats,
    joiningIndices,
    mySeatIndex,
    occupiedCount,
    isFull,
    sitDown,
    updateActivity,
    leave,
    events,
    clearEvent,
    userId,
  }
}

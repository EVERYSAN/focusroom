import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Room } from '../types'

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('id, name, description, tags')
        .order('name')

      if (error) {
        console.error('Failed to load rooms:', error)
      }

      if (data) {
        setRooms(data as Room[])
      }
      setLoading(false)
    }

    load()
  }, [])

  return { rooms, loading }
}

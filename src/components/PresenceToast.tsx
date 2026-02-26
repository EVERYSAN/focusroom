import { useEffect, useState } from 'react'

interface ToastItem {
  id: string
  message: string
  visible: boolean
}

interface Props {
  joinEvents: string[]
  leaveEvents: string[]
  onClearJoin: (id: string) => void
  onClearLeave: (id: string) => void
}

export function PresenceToast({ joinEvents, leaveEvents, onClearJoin, onClearLeave }: Props) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  // Handle join events
  useEffect(() => {
    if (joinEvents.length === 0) return
    const latest = joinEvents[joinEvents.length - 1]
    const shortId = latest.slice(0, 6)
    const id = `join-${latest}-${Date.now()}`

    setToasts(prev => [...prev, { id, message: `${shortId}... joined the room`, visible: false }])

    // Animate in
    requestAnimationFrame(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, visible: true } : t))
    })

    // Auto-remove after 4s
    const timer = setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, visible: false } : t))
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, 400)
    }, 4000)

    onClearJoin(latest)
    return () => clearTimeout(timer)
  }, [joinEvents, onClearJoin])

  // Handle leave events
  useEffect(() => {
    if (leaveEvents.length === 0) return
    const latest = leaveEvents[leaveEvents.length - 1]
    const shortId = latest.slice(0, 6)
    const id = `leave-${latest}-${Date.now()}`

    setToasts(prev => [...prev, { id, message: `${shortId}... left the room`, visible: false }])

    requestAnimationFrame(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, visible: true } : t))
    })

    const timer = setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, visible: false } : t))
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, 400)
    }, 4000)

    onClearLeave(latest)
    return () => clearTimeout(timer)
  }, [leaveEvents, onClearLeave])

  if (toasts.length === 0) return null

  return (
    <div className="presence-toast-container">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`presence-toast ${toast.visible ? 'presence-toast--visible' : ''} ${
            toast.message.includes('joined') ? 'presence-toast--join' : 'presence-toast--leave'
          }`}
        >
          <span className="presence-toast__dot" />
          {toast.message}
        </div>
      ))}
    </div>
  )
}

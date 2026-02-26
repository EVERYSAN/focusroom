import { useState, useRef, useCallback } from 'react'
import type { NoteType } from '../types'

const CATEGORIES: { value: NoteType; label: string; color: string }[] = [
  { value: 'start', label: 'Start', color: 'bg-blue-900/30 text-blue-300/80 border-blue-700/30' },
  { value: 'progress', label: 'Progress', color: 'bg-amber-900/30 text-amber-300/80 border-amber-700/30' },
  { value: 'done', label: 'Done', color: 'bg-green-900/30 text-green-300/80 border-green-700/30' },
  { value: 'idea', label: 'Idea', color: 'bg-purple-900/30 text-purple-300/80 border-purple-700/30' },
]

interface Props {
  onPost: (type: NoteType, text: string) => Promise<string | null>
  onTypingChange?: (isTyping: boolean) => void
  categories?: NoteType[]
  placeholder?: string
}

export function PostForm({ onPost, onTypingChange, categories, placeholder }: Props) {
  const activeCats = categories
    ? CATEGORIES.filter(c => categories.includes(c.value))
    : CATEGORIES
  const [type, setType] = useState<NoteType>(activeCats[0]?.value ?? 'start')
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [posting, setPosting] = useState(false)
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTypingRef = useRef(false)

  const signalTyping = useCallback(() => {
    if (!onTypingChange) return
    if (!isTypingRef.current) {
      isTypingRef.current = true
      onTypingChange(true)
    }
    // Reset idle timer — stop typing after 2s of no input
    if (typingTimer.current) clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      isTypingRef.current = false
      onTypingChange(false)
    }, 2000)
  }, [onTypingChange])

  const stopTyping = useCallback(() => {
    if (!onTypingChange) return
    if (typingTimer.current) clearTimeout(typingTimer.current)
    if (isTypingRef.current) {
      isTypingRef.current = false
      onTypingChange(false)
    }
  }, [onTypingChange])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (posting) return
    stopTyping()
    setPosting(true)
    const err = await onPost(type, text)
    setPosting(false)
    if (err) {
      setError(err)
      return
    }
    setText('')
    setError(null)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm">
      {/* Category selector — hidden when only one category */}
      {activeCats.length > 1 && (
        <div className="flex gap-1.5 mb-3">
          {activeCats.map(cat => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setType(cat.value)}
              className={`
                text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer
                ${type === cat.value ? cat.color + ' font-medium' : 'bg-white/5 text-[#9a8b78] border-white/10'}
              `}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Text input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={e => {
            setText(e.target.value)
            if (error) setError(null)
            signalTyping()
          }}
          onBlur={stopTyping}
          placeholder={placeholder ?? "What are you working on?"}
          maxLength={40}
          className="flex-1 px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm
                     text-[#e8ddd0] placeholder-[#7a6b58] outline-none
                     focus:border-white/20 transition-colors"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-white/10 text-sm text-[#d4c4a8]
                     hover:bg-white/15 transition-colors cursor-pointer"
          disabled={posting}
        >
          {posting ? '...' : 'Post'}
        </button>
      </div>

      {/* Char count + error */}
      <div className="flex justify-between mt-1.5 px-1">
        <span className={`text-[11px] ${error ? 'text-red-400' : 'text-transparent'}`}>
          {error || '.'}
        </span>
        <span className={`text-[11px] ${text.length > 35 ? 'text-amber-600/70' : 'text-[#c4b5a2]'}`}>
          {text.length}/40
        </span>
      </div>
    </form>
  )
}

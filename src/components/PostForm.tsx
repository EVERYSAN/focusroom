import { useState, useRef, useCallback } from 'react'
import type { NoteType } from '../types'

const ALL_CATEGORIES: { value: NoteType; label: string; activeColor: string }[] = [
  { value: 'start', label: 'Start', activeColor: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'progress', label: 'Progress', activeColor: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'done', label: 'Done', activeColor: 'bg-green-50 text-green-700 border-green-200' },
  { value: 'idea', label: 'Idea', activeColor: 'bg-purple-50 text-purple-700 border-purple-200' },
]

interface Props {
  onPost: (type: NoteType, text: string) => Promise<string | null>
  onTypingChange?: (isTyping: boolean) => void
  categories?: NoteType[]
  placeholder?: string
}

export function PostForm({ onPost, onTypingChange, categories, placeholder }: Props) {
  const visibleCats = categories
    ? ALL_CATEGORIES.filter(c => categories.includes(c.value))
    : ALL_CATEGORIES

  const [type, setType] = useState<NoteType>(visibleCats[0].value)
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
    onTypingChange?.(false)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Category selector — hide if only 1 category */}
      {visibleCats.length > 1 && (
        <div className="flex gap-1.5 mb-2">
          {visibleCats.map(cat => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setType(cat.value)}
              className={`
                text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer
                ${type === cat.value
                  ? cat.activeColor + ' font-medium'
                  : 'bg-[#faf8f5] text-[#8a7a6a] border-[#e8e0d8] hover:bg-[#f5f0ea]'
                }
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
            onTypingChange?.(e.target.value.length > 0)
          }}
          onBlur={() => onTypingChange?.(false)}
          placeholder={placeholder ?? 'What are you working on?'}
          maxLength={40}
          className="flex-1 px-3 py-2 rounded-lg border border-[#e8e0d8] bg-[#faf8f5] text-sm
                     text-[#4a3a2a] placeholder-[#b0a090] outline-none
                     focus:border-[#c8a060] transition-colors"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-[#f0ece6] text-sm text-[#6a5a4a] font-medium
                     hover:bg-[#e8e0d8] transition-colors cursor-pointer"
          disabled={posting}
        >
          {posting ? '...' : 'Post'}
        </button>
      </div>

      {/* Char count + error */}
      <div className="flex justify-between mt-1 px-1">
        <span className={`text-[11px] ${error ? 'text-red-500' : 'text-transparent'}`}>
          {error || '.'}
        </span>
        <span className={`text-[11px] ${text.length > 35 ? 'text-amber-600' : 'text-[#c8b8a8]'}`}>
          {text.length}/40
        </span>
      </div>
    </form>
  )
}

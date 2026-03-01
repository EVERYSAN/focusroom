import { useState, useRef, useCallback } from 'react'
import type { NoteType } from '../types'
import { ja } from '../lib/i18n'

const ALL_CATEGORIES: { value: NoteType; label: string; activeColor: string }[] = [
  { value: 'start', label: ja.categories.start, activeColor: 'bg-blue-950 text-blue-300 border-blue-800' },
  { value: 'progress', label: ja.categories.progress, activeColor: 'bg-amber-950 text-amber-300 border-amber-800' },
  { value: 'done', label: ja.categories.done, activeColor: 'bg-green-950 text-green-300 border-green-800' },
  { value: 'idea', label: ja.categories.idea, activeColor: 'bg-purple-950 text-purple-300 border-purple-800' },
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
                  : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-primary)] hover:bg-[var(--bg-hover)]'
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
          placeholder={placeholder ?? ja.postForm.defaultPlaceholder}
          maxLength={40}
          className="flex-1 px-3 py-2 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-input)] text-sm
                     text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none
                     focus:border-[var(--border-focus)] transition-colors"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-[var(--bg-surface)] text-sm text-[var(--text-secondary)] font-medium
                     hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
          disabled={posting}
        >
          {posting ? ja.postForm.posting : ja.postForm.post}
        </button>
      </div>

      {/* Char count + error */}
      <div className="flex justify-between mt-1 px-1">
        <span className={`text-[11px] ${error ? 'text-red-500' : 'text-transparent'}`}>
          {error || '.'}
        </span>
        <span className={`text-[11px] ${text.length > 35 ? 'text-amber-500' : 'text-[var(--text-muted)]'}`}>
          {text.length}/40
        </span>
      </div>
    </form>
  )
}

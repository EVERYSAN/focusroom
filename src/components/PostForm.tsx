import { useState } from 'react'
import type { NoteType } from '../types'

const CATEGORIES: { value: NoteType; label: string; color: string }[] = [
  { value: 'start', label: 'Start', color: 'bg-blue-50/70 text-blue-800/70 border-blue-200/50' },
  { value: 'progress', label: 'Progress', color: 'bg-amber-50/70 text-amber-800/70 border-amber-200/50' },
  { value: 'done', label: 'Done', color: 'bg-green-50/70 text-green-800/70 border-green-200/50' },
  { value: 'idea', label: 'Idea', color: 'bg-purple-50/70 text-purple-800/70 border-purple-200/50' },
]

interface Props {
  onPost: (type: NoteType, text: string) => Promise<string | null>
}

export function PostForm({ onPost }: Props) {
  const [type, setType] = useState<NoteType>('start')
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [posting, setPosting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (posting) return
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
      {/* Category selector */}
      <div className="flex gap-1.5 mb-3">
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            type="button"
            onClick={() => setType(cat.value)}
            className={`
              text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer
              ${type === cat.value ? cat.color + ' font-medium' : 'bg-white/40 text-[#9a8b78] border-[#d5c9b8]'}
            `}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Text input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={e => {
            setText(e.target.value)
            if (error) setError(null)
          }}
          placeholder="What are you working on?"
          maxLength={40}
          className="flex-1 px-3 py-2 rounded-lg border border-[#d5c9b8] bg-white/50 text-sm
                     text-[#4a3f35] placeholder-[#b8a994] outline-none
                     focus:border-[#b8a994] transition-colors"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-[#e0d5c4]/70 text-sm text-[#5a4a3a]
                     hover:bg-[#d5c9b8]/80 transition-colors cursor-pointer"
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

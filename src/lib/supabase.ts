import { createClient } from '@supabase/supabase-js'

// .trim() guards against trailing whitespace / newlines in env vars
// (Vercel can silently append \n when pasting multi-line values).
const url = (import.meta.env.VITE_SUPABASE_URL as string)?.trim()
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY as string)?.trim()

if (!url || !key) {
  console.warn(
    'Supabase credentials missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env'
  )
}

// Use a placeholder URL when env vars are missing so the app renders without a backend.
// All Supabase calls will fail silently — the UI still works with local/mock data.
export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  key || 'placeholder-key',
)

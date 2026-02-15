# Focus Room

A calm co-working web app where users feel others' presence through quiet sticky-note updates.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase-schema.sql`
3. Copy your project URL and anon key from **Settings > API**
4. Edit `.env` and fill in your values:

```
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

### 3. Run

```bash
npm run dev
```

Open the URL shown in terminal (default: http://localhost:5173).

## Features

- Post micro-updates in 4 categories: start, progress, done, idea
- Sticky notes appear on the right and auto-fade after 12 seconds
- Max 5 visible notes; overflow shows "+N updates" badge
- Hover on a note pauses its fade timer
- 40 character limit, no URLs, 10-min cooldown between posts
- Live updates via Supabase Realtime
- Today's stats: sessions, focus minutes, notes posted

# Project: Focus Room (Sticky Wall MVP)

## Goal
Build a calm co-working web app where users feel others' presence without noisy chat.
Main UI is a sticky-note wall on the right side: short updates appear softly and fade out.

## Tech Stack
- Frontend: React + Vite + TypeScript
- Styling: Tailwind CSS
- Backend: Supabase (Auth optional for MVP; can start with anonymous user ID)
- Realtime: Supabase Realtime channels
- Routing: react-router-dom (if needed)
- State: lightweight (React state or Zustand)

## Core Product Concept
No full chat room.
Only micro-updates with 4 categories:
- start
- progress
- done
- idea

Each update appears as a sticky note, then fades out.
Keep the app quiet and non-distracting.

## MVP Features (must-have)
1) Sticky wall UI (right-bottom fixed stack)
2) Post update with type + text
3) Show max 5 notes at once
4) Note auto-fade after 12s
5) If burst (more than 5 pending), show compact badge like "+12 updates"
6) No sound effects
7) Input constraints:
   - max 40 chars
   - cooldown: 10 min per user (global)
   - no URLs
8) Minimal dashboard:
   - today focus sessions (count)
   - total focus minutes
   - notes count

## Sticky Wall UI Behavior
- position: right-bottom fixed
- max visible notes: 5
- enter animation: 250ms subtle translate + fade
- exit animation: 300ms fade + slight translate
- opacity around 0.92
- hover pauses disappear timer
- no click-to-open detail (MVP)

## Data Model (Supabase)
Table: room_updates
- id (uuid, pk)
- room_id (text, default 'default')
- user_id (text)
- type (text check in: start|progress|done|idea)
- text (varchar(40))
- created_at (timestamptz default now())
- expires_at (timestamptz default now() + interval '30 minutes')

Table: focus_sessions
- id (uuid, pk)
- user_id (text)
- started_at (timestamptz)
- ended_at (timestamptz)
- focus_minutes (int)
- created_at (timestamptz default now())

(Optionally) local anonymous user id in localStorage for MVP.

## Validation Rules
- text length <= 40
- reject if contains URL pattern (http://, https://, www.)
- cooldown 10 min between posts by same user
- sanitize whitespace and trim

## UX Guidelines
- calm colors, low saturation
- category colors:
  - start: soft blue
  - progress: soft yellow
  - done: soft green
  - idea: soft purple
- no flashy transitions
- avoid notifications that interrupt focus

## Deliverables
Please implement in this order:
1. Create project scaffold with Vite + React + TS + Tailwind
2. Build sticky wall component with mocked local data first
3. Build post form with category + text input + validation
4. Add fade/stack behavior and burst compaction badge
5. Integrate Supabase realtime for live updates
6. Add simple stats panel for today
7. Add README with setup and run instructions

## Required Output During Work
- Explain each major file created/edited
- Keep commits logically grouped
- If blocked, propose 2 fallback options and continue with best one

## Definition of Done
- App runs locally with `npm run dev`
- Sticky wall works with realtime updates
- Burst compaction works (`+N updates`)
- Input validations work
- Calm UI and no sound
- README includes env setup for Supabase

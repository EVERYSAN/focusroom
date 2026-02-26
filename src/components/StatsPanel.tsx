import type { Stats } from '../types'

interface Props {
  stats: Stats
}

export function StatsPanel({ stats }: Props) {
  return (
    <div className="flex gap-6 mb-8">
      <StatItem label="Sessions" value={stats.focusSessions} />
      <StatItem label="Focus min" value={stats.focusMinutes} />
      <StatItem label="Notes" value={stats.notesCount} />
    </div>
  )
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <div className="font-serif text-2xl font-light text-[#d4c4a8]">{value}</div>
      <div className="text-[11px] text-[#7a6b58] uppercase tracking-wider">{label}</div>
    </div>
  )
}

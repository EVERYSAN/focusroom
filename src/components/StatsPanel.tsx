import type { Stats } from '../types'

interface Props {
  stats: Stats
}

export function StatsPanel({ stats }: Props) {
  return (
    <div className="flex gap-6">
      <StatItem label="Sessions" value={stats.focusSessions} />
      <StatItem label="Focus min" value={stats.focusMinutes} />
      <StatItem label="Notes" value={stats.notesCount} />
    </div>
  )
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <div className="font-serif text-2xl font-light text-[#4a3a2a]">{value}</div>
      <div className="text-[11px] text-[#8a7a6a] uppercase tracking-wider">{label}</div>
    </div>
  )
}

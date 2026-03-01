import type { Stats } from '../types'
import { ja } from '../lib/i18n'

interface Props {
  stats: Stats
}

export function StatsPanel({ stats }: Props) {
  return (
    <div className="flex gap-6">
      <StatItem label={ja.stats.sessions} value={stats.focusSessions} />
      <StatItem label={ja.stats.focusMinutes} value={stats.focusMinutes} />
      <StatItem label={ja.stats.notes} value={stats.notesCount} />
    </div>
  )
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <div className="font-serif text-2xl font-light text-[var(--text-primary)]">{value}</div>
      <div className="text-[11px] text-[var(--text-secondary)] uppercase tracking-wider">{label}</div>
    </div>
  )
}

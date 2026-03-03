/* ── Fragment utilities — anonymous ambient text for desk overlay ── */

/** Default fragments for when no real posts exist */
export const DEFAULT_HOME_FRAGMENTS = [
  '資料整理…',
  'あと一段',
  '構成どうする',
  '詰まり中',
  '今日はここまで',
  '5分だけ',
  'まず1行',
  '送るだけ',
  '静か',
  '見直し',
  '手を動かす',
  '机に向かう',
]

/** Truncate a post into an anonymous fragment (max 18 chars, strip subject) */
export function fragmentize(text: string): string {
  let t = text.trim()
  // Strip leading subject + particle (は/が/を/も/の + optional comma/space)
  t = t.replace(/^[^\u3000-\u9FFF]*?[はがをもの][、,\s]?/u, '')
  if (t.length === 0) t = text.trim()
  // Cut at first punctuation within 18 chars
  const cut = t.slice(0, 18)
  const puncIdx = cut.search(/[。、！？!?,]/)
  if (puncIdx > 0) return cut.slice(0, puncIdx)
  return cut
}

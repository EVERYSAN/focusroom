export function AppHeader() {
  return (
    <header className="app-header">
      <div className="flex items-center gap-2">
        <span className="text-xl">🏠</span>
        <span className="app-header__brand">Workwiz</span>
      </div>
      <div className="flex items-center gap-1">
        <button className="app-header__icon" aria-label="検索">🔍</button>
        <button className="app-header__icon" aria-label="通知">🔔</button>
        <button className="app-header__icon" aria-label="設定">⚙️</button>
      </div>
    </header>
  )
}

export function AppHeader() {
  return (
    <header className="app-header">
      <div className="flex items-center gap-2">
        <span className="text-xl">🏠</span>
        <span className="app-header__brand">FocusRoom</span>
      </div>
      <div className="flex items-center gap-1">
        <button className="app-header__icon" aria-label="Search">🔍</button>
        <button className="app-header__icon" aria-label="Notifications">🔔</button>
        <button className="app-header__icon" aria-label="Settings">⚙️</button>
      </div>
    </header>
  )
}

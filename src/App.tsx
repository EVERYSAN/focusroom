import { useState } from 'react'

type Tab = 'home' | 'stories' | 'search' | 'notifications' | 'profile'
type Status = {
  id: string
  name: string
  content: string
  elapsed: number
  isActive: boolean
}
type Story = {
  id: string
  name: string
  content: string
  timeAgo: string
  expiresIn: string
}

const mockStatuses: Status[] = [
  { id: '1', name: 'Evie', content: '英語勉強', elapsed: 42, isActive: true },
  { id: '2', name: 'Kai', content: 'React開発', elapsed: 128, isActive: true },
  { id: '3', name: 'Miku', content: '論文読み', elapsed: 15, isActive: true },
  { id: '4', name: 'Ryo', content: 'デザイン作業', elapsed: 0, isActive: false },
]

const mockStories: Story[] = [
  { id: '1', name: 'Evie', content: '今日のリスニング、初めて8割取れた！嬉しい', timeAgo: '15分前', expiresIn: 'あと23時間' },
  { id: '2', name: 'Kai', content: 'TypeScriptの型パズル楽しすぎる', timeAgo: '1時間前', expiresIn: 'あと22時間' },
  { id: '3', name: 'Miku', content: 'この論文の図3がすごくわかりやすい', timeAgo: '3時間前', expiresIn: 'あと20時間' },
]

function formatElapsed(min: number) {
  if (min < 60) return `${min}分`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}時間${m}分` : `${h}時間`
}

function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'var(--bg-tertiary)', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 600, color: 'var(--text-secondary)',
      flexShrink: 0,
    }}>
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

function StatusCard({ status }: { status: Status }) {
  return (
    <div style={{
      background: 'var(--bg-secondary)', borderRadius: 16,
      padding: 16, marginBottom: 8, border: '1px solid var(--border)',
      opacity: status.isActive ? 1 : 0.5,
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Avatar name={status.name} />
        <div style={{ flex: 1, marginLeft: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>{status.name}</span>
            {status.isActive && (
              <span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--success)', display: 'inline-block' }} />
            )}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 2 }}>{status.content}</div>
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          {status.isActive ? formatElapsed(status.elapsed) : '終了'}
        </span>
      </div>
      {status.isActive && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <button style={{
            background: 'var(--bg-tertiary)', border: 'none', borderRadius: 6,
            padding: '4px 16px', color: 'var(--primary)', fontSize: 13,
            fontWeight: 500, cursor: 'pointer',
          }}>一緒にやろう</button>
        </div>
      )}
    </div>
  )
}

function StoryCard({ story }: { story: Story }) {
  return (
    <div style={{
      background: 'var(--bg-secondary)', borderRadius: 16,
      padding: 16, marginBottom: 8, border: '1px solid var(--border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <Avatar name={story.name} size={36} />
        <div style={{ flex: 1, marginLeft: 10 }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{story.name}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{story.timeAgo}</div>
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{story.expiresIn}</span>
      </div>
      <div style={{ fontSize: 15, lineHeight: 1.5 }}>{story.content}</div>
    </div>
  )
}

function HomeTab() {
  const [statusText, setStatusText] = useState('')
  const [isWorking, setIsWorking] = useState(false)

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '8px 16px 16px', borderBottom: '1px solid var(--border)' }}>
        {isWorking ? (
          <div style={{
            display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)',
            borderRadius: 10, padding: 16, border: '1px solid rgba(74,222,128,0.25)',
          }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: 5, background: 'var(--success)' }} />
              <span style={{ fontSize: 15 }}>React開発</span>
            </div>
            <button onClick={() => setIsWorking(false)} style={{
              background: 'var(--bg-tertiary)', border: 'none', borderRadius: 6,
              padding: '4px 16px', color: 'var(--error)', fontSize: 13,
              fontWeight: 500, cursor: 'pointer',
            }}>終了</button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              placeholder="今日やること..."
              value={statusText}
              onChange={e => setStatusText(e.target.value)}
              maxLength={100}
              style={{
                flex: 1, background: 'var(--bg-secondary)',
                border: '1px solid var(--border)', borderRadius: 10,
                padding: '12px 16px', fontSize: 15, color: 'var(--text)', outline: 'none',
              }}
            />
            <button onClick={() => { if (statusText.trim()) setIsWorking(true) }} style={{
              background: 'var(--primary)', border: 'none', borderRadius: 10,
              padding: '0 24px', color: 'var(--bg)', fontSize: 15,
              fontWeight: 600, cursor: 'pointer',
            }}>開始</button>
          </div>
        )}
      </div>
      <div style={{ flex: 1, padding: 16, overflowY: 'auto' }}>
        <div style={{
          color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600,
          marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1,
        }}>作業中</div>
        {mockStatuses.map(s => <StatusCard key={s.id} status={s} />)}
      </div>
    </div>
  )
}

function StoriesTab() {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
        <textarea placeholder="気づき・閃きを共有..." maxLength={200} rows={2} style={{
          width: '100%', background: 'var(--bg-secondary)',
          border: '1px solid var(--border)', borderRadius: 10,
          padding: '12px 16px', fontSize: 15, color: 'var(--text)',
          outline: 'none', resize: 'none', fontFamily: 'inherit',
        }} />
        <button style={{
          width: '100%', background: 'var(--primary)', border: 'none', borderRadius: 10,
          padding: '12px 0', color: 'var(--bg)', fontSize: 15,
          fontWeight: 600, cursor: 'pointer', marginTop: 8,
        }}>投稿</button>
      </div>
      <div style={{ flex: 1, padding: 16, overflowY: 'auto' }}>
        {mockStories.map(s => <StoryCard key={s.id} story={s} />)}
      </div>
    </div>
  )
}

function SearchTab() {
  const users = [
    { id: '1', name: 'Yuki', username: 'yuki_dev', following: false },
    { id: '2', name: 'Hana', username: 'hana_study', following: true },
    { id: '3', name: 'Sora', username: 'sora_create', following: false },
  ]
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 16, borderBottom: '1px solid var(--border)', display: 'flex', gap: 8 }}>
        <input placeholder="ユーザーを検索..." style={{
          flex: 1, background: 'var(--bg-secondary)',
          border: '1px solid var(--border)', borderRadius: 10,
          padding: '12px 16px', fontSize: 15, color: 'var(--text)', outline: 'none',
        }} />
        <button style={{
          background: 'var(--bg-tertiary)', border: 'none', borderRadius: 10,
          padding: '0 24px', color: 'var(--text)', fontSize: 15, cursor: 'pointer',
        }}>検索</button>
      </div>
      <div style={{ flex: 1, padding: 16 }}>
        {users.map(u => (
          <div key={u.id} style={{
            display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)',
            borderRadius: 16, padding: 16, marginBottom: 8, border: '1px solid var(--border)',
          }}>
            <Avatar name={u.name} size={44} />
            <div style={{ flex: 1, marginLeft: 12 }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{u.name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>@{u.username}</div>
            </div>
            <button style={{
              background: u.following ? 'transparent' : 'var(--primary)',
              border: u.following ? '1px solid var(--border-light)' : 'none',
              borderRadius: 6, padding: '6px 16px',
              color: u.following ? 'var(--text-secondary)' : 'var(--bg)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>{u.following ? 'フォロー中' : 'フォロー'}</button>
          </div>
        ))}
      </div>
    </div>
  )
}

function NotificationsTab() {
  const notifs = [
    { id: '1', sender: 'Evie', status: '英語勉強', time: '5分前', read: false },
    { id: '2', sender: 'Kai', status: 'React開発', time: '1時間前', read: true },
  ]
  return (
    <div style={{ flex: 1, padding: 16 }}>
      {notifs.map(n => (
        <div key={n.id} style={{
          display: 'flex', background: n.read ? 'var(--bg-secondary)' : 'rgba(108,140,255,0.03)',
          borderRadius: 16, padding: 16, marginBottom: 8,
          border: `1px solid ${n.read ? 'var(--border)' : 'rgba(108,140,255,0.37)'}`,
        }}>
          <Avatar name={n.sender} />
          <div style={{ flex: 1, marginLeft: 12 }}>
            <div style={{ fontSize: 15, lineHeight: 1.4 }}>
              <strong>{n.sender}</strong> が「一緒にやろう」と言っています
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>{n.status}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 4 }}>{n.time}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ProfileTab() {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ textAlign: 'center', padding: '32px 0', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}><Avatar name="Me" size={80} /></div>
        <div style={{ fontSize: 20, fontWeight: 700, marginTop: 16 }}>ユーザー名</div>
        <div style={{ color: 'var(--text-muted)', fontSize: 15, marginTop: 4 }}>@username</div>
      </div>
      <div style={{
        display: 'flex', justifyContent: 'center', padding: '24px 0',
        borderBottom: '1px solid var(--border)',
      }}>
        {[['12', 'フォロー'], ['48', 'フォロワー'], ['156', 'ステータス']].map(([num, label], i) => (
          <div key={label} style={{
            textAlign: 'center', padding: '0 32px',
            borderLeft: i > 0 ? '1px solid var(--border)' : 'none',
          }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{num}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: 24 }}>
        <button style={{
          width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          borderRadius: 10, padding: 16, color: 'var(--error)', fontSize: 15,
          fontWeight: 500, cursor: 'pointer', textAlign: 'center',
        }}>ログアウト</button>
      </div>
    </div>
  )
}

const tabs: { key: Tab; label: string; icon: string }[] = [
  { key: 'home', label: 'ホーム', icon: 'H' },
  { key: 'stories', label: 'ストーリー', icon: 'S' },
  { key: 'search', label: '検索', icon: '?' },
  { key: 'notifications', label: '通知', icon: '!' },
  { key: 'profile', label: 'プロフィール', icon: '@' },
]

export default function App() {
  const [currentTab, setCurrentTab] = useState<Tab>('home')

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', minHeight: '100vh',
      maxWidth: 480, margin: '0 auto', background: 'var(--bg)',
    }}>
      <header style={{
        padding: '16px 16px 12px', borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ fontSize: 17, fontWeight: 600 }}>
          {tabs.find(t => t.key === currentTab)?.label}
        </div>
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        {currentTab === 'home' && <HomeTab />}
        {currentTab === 'stories' && <StoriesTab />}
        {currentTab === 'search' && <SearchTab />}
        {currentTab === 'notifications' && <NotificationsTab />}
        {currentTab === 'profile' && <ProfileTab />}
      </main>

      <nav style={{
        display: 'flex', background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border)', padding: '8px 0 20px',
      }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setCurrentTab(tab.key)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0',
            }}
          >
            <span style={{
              fontSize: 18, fontWeight: 700,
              color: currentTab === tab.key ? 'var(--primary)' : 'var(--text-muted)',
            }}>{tab.icon}</span>
            <span style={{
              fontSize: 11, fontWeight: 500,
              color: currentTab === tab.key ? 'var(--text)' : 'var(--text-muted)',
            }}>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

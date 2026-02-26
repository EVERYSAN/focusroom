# RESUME - Focus Room

## Current branch / commit
- branch: main
- latest commit: (run `git rev-parse --short HEAD`)

## What is done
- Quiet coworking UI implemented
- Sticky wall works
- Build passes (`npm run build`)
- Pushed to GitHub

### Session 2: "一緒にいる感" 機能追加 (2026-02-24)

テーマ: Discordの作業部屋 + ペルソナ5の喫茶店の雰囲気を目指す。
静かだけど「誰かがいる」気配を感じるUIへ。

#### 追加した機能 3つ

**1. タイピング中インジケーター**
- 他の人がPostFormに入力中のとき「Someone is writing...」と表示
- 3つのドットがバウンスするアニメーション付き
- Supabase Realtime の Presence 機能を使用
- 2秒間入力がないと自動で消える
- ファイル: `src/hooks/usePresence.ts`, `src/components/TypingIndicator.tsx`
- PostForm に `onTypingChange` prop 追加

**2. 入退室の静かな通知**
- 誰かがルームに入った/出たときに画面下部にトースト表示
- 「abc123... joined the room」「abc123... left the room」
- 入室=緑ドット、退室=グレードット
- 4秒後に自動フェードアウト（0.35s ease transition）
- ファイル: `src/components/PresenceToast.tsx`

**3. 席ランプのアクティブ状態アニメーション**
- focus 状態: ゆっくり明滅するパルス (3s周期, 金色の光)
- break 状態: ゆっくり明滅するパルス (4s周期, 青色の光)
- idle/done_recently は変更なし
- `prefers-reduced-motion` 対応済み
- ファイル: `src/index.css` にキーフレーム追加

#### 変更・追加したファイル一覧
| ファイル | 変更内容 |
|---|---|
| `src/hooks/usePresence.ts` | 新規: Supabase Presence hook (typing, join/leave, online count) |
| `src/components/TypingIndicator.tsx` | 新規: タイピング中ドットアニメーション |
| `src/components/PresenceToast.tsx` | 新規: 入退室トースト通知 |
| `src/components/PostForm.tsx` | 変更: onTypingChange prop追加, signalTyping/stopTyping ロジック |
| `src/components/FocusPanel.tsx` | 変更: TypingIndicator 統合, typingUsers/onTypingChange props |
| `src/components/PresencePanel.tsx` | 変更: onlineCount バッジ追加 |
| `src/App.tsx` | 変更: usePresence 統合, PresenceToast 追加 |
| `src/index.css` | 変更: typing-indicator, presence-toast, lamp-pulse, online-badge CSS追加 |

#### アーキテクチャメモ
- `usePresence` hook が Supabase Realtime channel `room-presence` を管理
- Presence state で isTyping フラグを track/untrack
- join/leave イベントは usePresence 内でキューに溜めて、PresenceToast が消費
- PostForm の入力イベントで signalTyping → 2s idle で自動 stopTyping
- 席ランプのパルスは CSS animation のみ (JS変更なし)

#### ハマりポイント・注意事項
- React StrictMode (dev) が effect を mount→unmount→mount と2回実行する
  → Supabase channel.subscribe() が1回目で接続→unmountで removeChannel→2回目で壊れる
  → 解決: `isFirstMount` ref で1回目のeffect実行をスキップするパターンを採用
  → 本番 (production build) では StrictMode の二重実行は起きないので問題なし
- Supabase free tier は長時間未使用で INACTIVE になる (503エラー)
  → `restore_project` で復元後、Realtime の起動に1〜2分かかる場合がある

### Session 3: 3Dカフェ背景統合 (2026-02-24)

テーマ: BOOTHで購入した3D喫茶店モデルをReact Three Fiberで
アプリ背景に表示。ペルソナ5の喫茶店のような暖かく薄暗い雰囲気。

#### やったこと

**1. React Three Fiber + Three.js 導入**
- `three`, `@react-three/fiber`, `@react-three/drei`, `@types/three` をインストール
- React.lazy + Suspense でコード分割（CafeCanvas チャンクを遅延読み込み）

**2. 3Dモデル配置**
- BOOTH購入の喫茶店GLBモデル (16MB) → `public/models/Cafe.glb`
- `.gitignore` に `public/models/` 追加（ライセンス上コミットしない）
- `useGLTF.preload()` で事前読み込み

**3. CafeScene コンポーネント**
- `useGLTF` でGLBモデル読み込み
- `scene.clone()` で StrictMode 対応
- モデル内蔵ライトを無効化 (`child.isLight → visible=false`)
- マウス位置による微妙なパララックス回転 (0.02rad)
- `window` mousemove リスナーで座標取得（canvas が pointer-events:none のため）

**4. CafeCanvas コンポーネント**
- React Three Fiber `<Canvas>` ラッパー
- カメラ: `position=[4, 2, 3]`, `fov=50`, `lookAt=[1, 1.5, -2]` — ブースに座った目線でカフェ内部を見渡すアングル（ペルソナ5風）
- ライティング: 暖色 ambient + 3つの pointLight + directionalLight
- ACESFilmicToneMapping, exposure=1.0 で暖かいカフェ調
- fog: `#1a1510` 8〜20 — 奥を暗くぼかして雰囲気を出す
- ローディング画面: 「Preparing your space...」+ プログレスバー
- `dpr={[1, 1.5]}` でパフォーマンス最適化
- 初回マウント時に `window.dispatchEvent(new Event('resize'))` で Canvas サイズ修正

**5. レイヤー構成**
```
z-0  : 全画面 3D Canvas (カフェの3Dシーン)
z-10 : layout-grid (PresencePanel, FocusPanel, ActivityFeed)
z-50 : PresenceToast
```
→ ガラスパネルUIが3Dカフェの上に浮かぶ

#### 変更・追加ファイル一覧
| ファイル | 操作 |
|---|---|
| `package.json` | 変更: three, @react-three/fiber, @react-three/drei, @types/three 追加 |
| `.gitignore` | 変更: `public/models/` 追加 |
| `public/models/Cafe.glb` | 新規: 3Dカフェモデル (gitignored) |
| `src/components/CafeScene.tsx` | 新規: GLBモデル読み込み + パララックス |
| `src/components/CafeCanvas.tsx` | 新規: R3F Canvas + ライティング + ローディング |
| `src/App.tsx` | 変更: React.lazy CafeCanvas 追加, z-index 調整 |
| `src/index.css` | 変更: body背景 #1a1510, パネルガラス強化 (opacity 0.6, blur 20px) |

#### ハマりポイント・注意事項
- R3F v9 の Canvas が初回マウント時に 300x150px のデフォルトサイズで固まる問題
  → `useEffect` で 100ms 後に `window.dispatchEvent(new Event('resize'))` をトリガーして解決
- カメラ角度の調整は OrbitControls (DEBUG_ORBIT=true) で探索後、座標をハードコード
  → UIパネルが pointer-events を食うため、一時的に `pointerEvents:'none'` にして操作
- CafeCanvas チャンクは 957KB (gzip 260KB) — Three.js を含むため大きいが
  React.lazy で分割済みなので初期ロードには影響しない

## Product direction (locked)
- Focus on silent presence + immersive cafe atmosphere:
  - 3D cafe background (React Three Fiber) ← NEW
  - room presence
  - status (idle/focus/break/done)
  - timer
  - quiet activity feed
  - typing indicator
  - join/leave toast
  - lamp pulse animation

## Next session first task
1. Supabaseが INACTIVE でスリープしがち — 開発時は restore が必要
2. Presence の online count をランプグリッドに反映する (モックではなくリアルデータ)
3. 環境音BGM機能の検討 (Lofi/喫茶店系)
4. ポモドーロ同期の検討
5. 3Dカフェのカメラ微調整（ユーザーフィードバック後）
6. prefers-reduced-motion 時の3Dフォールバック検討

## Run commands
- npm install
- npm run dev
- npm run build

## Env needed
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

## Known notes
- Do not commit `.env.local`
- Keep logic unchanged unless explicitly requested
- Supabase free tier はしばらく使わないと INACTIVE になる (503エラー)
  → Supabase dashboard or `restore_project` で復元

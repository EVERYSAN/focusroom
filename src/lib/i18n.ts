export const ja = {
  welcome: {
    primary: '今も、静かに集中している人がいます',
    personFocusing: (name: string) => `${name}さんが集中しています`,
    someoneFocusing: '誰かが集中しています',
  },

  tabs: {
    focus: '集中',
    ideas: 'ひらめき',
    today: '今日やったこと',
    tools: 'ツール',
  },

  focusPanel: {
    inRoom: (name: string) => `${name}にて`,
    filter: 'フィルター ◇',
    members: (count: number) => `メンバー (${count})`,
    waitingForOthers: '他の人が来るのを待っています...',
    recentIdeas: '最近のひらめき',
    noIdeasYet: 'まだひらめきはありません',
    noSessionsYet: '今日はまだセッションがありません',
  },

  timer: {
    start: '開始',
    pause: '一時停止',
    resume: '再開',
    reset: 'リセット',
  },

  actions: {
    enterRoom: '部屋に入る',
    startFocus: '集中を始める',
    pauseFocus: '一時停止',
    shareInsight: '💡 ひらめきを共有',
    joinQuietly: 'そっと参加する',
  },

  postForm: {
    focusPlaceholder: '集中の状況を共有...',
    ideaPlaceholder: 'ひらめきを共有...',
    post: '投稿',
    posting: '...',
    defaultPlaceholder: '何をしていますか？',
  },

  categories: {
    start: '開始',
    progress: '進行中',
    done: '完了',
    idea: 'ひらめき',
  },

  stats: {
    sessions: 'セッション',
    focusMinutes: '集中時間(分)',
    notes: 'ノート',
  },

  activity: {
    title: 'アクティビティ',
    noUpdates: 'このルームにはまだ更新がありません',
    updates: (n: number) => `+${n} 件の更新`,
    all: 'すべて',
    following: 'フォロー中',
    friends: '友達',
    ideas: '💡 ひらめき',
  },

  activityTypes: {
    start: '開始しました',
    progress: '取り組んでいます',
    done: '完了しました',
    idea: 'ひらめきを共有しました',
  },

  presence: {
    rooms: 'ルーム',
    active: (n: number) => `${n}人アクティブ`,
    onlineInRoom: 'ルーム内のメンバー',
    noOneHere: 'まだ誰もいません',
    searchRooms: 'ルームを検索...',
  },

  memberStatus: {
    focusing: '集中中',
    break: '休憩中',
    idle: '待機中',
  },
} as const

export interface QueueItem {
  id: string
  videoId: string
  title: string
  artist: string
  thumbnail: string
  duration: string
  addedBy: string
}

export interface KaraokeSession {
  code: string
  clients: Record<string, { name: string; isHost: boolean }>
  queue: QueueItem[]
  currentSong: QueueItem | null
  status: 'waiting' | 'playing'
  votes: { likes: number; dislikes: number; total: number }
}

// Module-level singletons so state survives page navigation
let ws: WebSocket | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let lastPayload: object | null = null

export const useKaraoke = () => {
  const session = useState<KaraokeSession | null>('karaoke:session', () => null)
  const connected = useState('karaoke:connected', () => false)
  const error = useState<string | null>('karaoke:error', () => null)
  const previousVotes = useState<{ likes: number; dislikes: number } | null>('karaoke:previousVotes', () => null)

  const currentSong = computed(() => session.value?.currentSong ?? null)
  const queue = computed(() => session.value?.queue ?? [])
  const votes = computed(() => session.value?.votes ?? { likes: 0, dislikes: 0, total: 0 })
  const clientCount = computed(() => Object.keys(session.value?.clients ?? {}).length)

  function handleMessage(data: any) {
    error.value = null

    switch (data.type) {
      case 'SESSION_CREATED':
      case 'SESSION_JOINED':
      case 'SESSION_UPDATE':
        session.value = data.session
        if (data.previousVotes) {
          previousVotes.value = data.previousVotes
          setTimeout(() => { previousVotes.value = null }, 5000)
        }
        break

      case 'ERROR':
        error.value = data.message
        break
    }
  }

  function send(payload: object) {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload))
    }
  }

  function connect() {
    if (!process.client) return
    if (ws && ws.readyState !== WebSocket.CLOSED) return

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    ws = new WebSocket(`${protocol}//${window.location.host}/_ws`)

    ws.onopen = () => {
      connected.value = true
      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
        reconnectTimer = null
      }
      if (lastPayload) send(lastPayload)
    }

    ws.onmessage = (event) => {
      try {
        handleMessage(JSON.parse(event.data))
      } catch {
        // ignore malformed messages
      }
    }

    ws.onclose = () => {
      connected.value = false
      ws = null
      reconnectTimer = setTimeout(connect, 2500)
    }

    ws.onerror = () => {
      ws?.close()
    }
  }

  function createSession(hostName: string) {
    lastPayload = { type: 'CREATE_SESSION', hostName }
    send(lastPayload)
  }

  function joinSession(code: string, name: string) {
    lastPayload = { type: 'JOIN_SESSION', code: code.toUpperCase(), name }
    send(lastPayload)
  }

  function addSong(item: Omit<QueueItem, 'id' | 'addedBy'>) {
    send({ type: 'ADD_SONG', ...item })
  }

  function nextSong() {
    send({ type: 'NEXT_SONG' })
  }

  function vote(v: 'like' | 'dislike') {
    send({ type: 'VOTE', vote: v })
  }

  function sync() {
    send({ type: 'SYNC' })
  }

  return {
    session,
    connected,
    error,
    previousVotes,
    currentSong,
    queue,
    votes,
    clientCount,
    connect,
    createSession,
    joinSession,
    addSong,
    nextSong,
    vote,
    sync,
  }
}

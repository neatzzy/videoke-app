import PusherClient from 'pusher-js'

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
  clients: { name: string; isHost: boolean }[]
  queue: QueueItem[]
  currentSong: QueueItem | null
  status: 'waiting' | 'playing'
  votes: { likes: number; dislikes: number; total: number }
}

// Module-level singletons — survive page navigation
let pusherClient: PusherClient | null = null
let subscribedCode: string | null = null

function getOrCreateClientId(): string {
  let id = localStorage.getItem('karaoke:clientId')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('karaoke:clientId', id)
  }
  return id
}

export const useKaraoke = () => {
  const config = useRuntimeConfig()
  const session = useState<KaraokeSession | null>('karaoke:session', () => null)
  const error = useState<string | null>('karaoke:error', () => null)
  const previousVotes = useState<{ likes: number; dislikes: number } | null>('karaoke:previousVotes', () => null)

  const currentSong = computed(() => session.value?.currentSong ?? null)
  const queue = computed(() => session.value?.queue ?? [])
  const votes = computed(() => session.value?.votes ?? { likes: 0, dislikes: 0, total: 0 })
  const clientCount = computed(() => session.value?.clients.length ?? 0)

  function subscribe(code: string) {
    if (typeof window === 'undefined') return
    if (subscribedCode === code) return

    if (!pusherClient) {
      pusherClient = new PusherClient(config.public.pusherKey as string, {
        cluster: config.public.pusherCluster as string,
      })
      // Events emitted while the socket was down (phone locked) are not replayed: refetch state.
      const refresh = () => { if (subscribedCode) resumeSession(subscribedCode) }
      pusherClient.connection.bind('connected', refresh)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') refresh()
      })
    }

    if (subscribedCode && subscribedCode !== code) {
      pusherClient.unsubscribe(`session-${subscribedCode}`)
    }

    subscribedCode = code
    const channel = pusherClient.subscribe(`session-${code}`)

    channel.bind('session-update', (data: { session: KaraokeSession; previousVotes?: { likes: number; dislikes: number } }) => {
      session.value = data.session
      if (data.previousVotes) {
        previousVotes.value = data.previousVotes
        setTimeout(() => { previousVotes.value = null }, 5000)
      }
    })
  }

  async function createSession(hostName: string) {
    const clientId = getOrCreateClientId()
    const data = await $fetch<{ code: string; session: KaraokeSession }>('/api/session/create', {
      method: 'POST',
      body: { clientId, hostName },
    })
    session.value = data.session
    subscribe(data.code)
  }

  async function joinSession(code: string, name: string) {
    error.value = null
    const clientId = getOrCreateClientId()
    try {
      const data = await $fetch<{ session: KaraokeSession }>('/api/session/join', {
        method: 'POST',
        body: { clientId, code: code.toUpperCase(), name },
      })
      session.value = data.session
      subscribe(data.session.code)
    } catch (err) {
      error.value = (err as { data?: { message?: string } }).data?.message ?? 'Sala não encontrada'
    }
  }

  async function addSong(item: Omit<QueueItem, 'id' | 'addedBy'>) {
    if (!session.value) return
    const clientId = getOrCreateClientId()
    await $fetch('/api/session/add-song', {
      method: 'POST',
      body: { clientId, code: session.value.code, ...item },
    })
  }

  // Returns false on failure; the server ignores the call if songId is no longer the current song.
  async function nextSong(): Promise<boolean> {
    if (!session.value) return false
    const clientId = getOrCreateClientId()
    try {
      await $fetch('/api/session/next-song', {
        method: 'POST',
        body: { clientId, code: session.value.code, songId: currentSong.value?.id },
      })
      return true
    } catch {
      return false
    }
  }

  // Returns false on failure so the caller can roll back its local copy.
  async function reorderQueue(orderedIds: string[]): Promise<boolean> {
    if (!session.value) return false
    const clientId = getOrCreateClientId()
    try {
      await $fetch('/api/session/reorder-queue', {
        method: 'POST',
        body: { clientId, code: session.value.code, orderedIds },
      })
      return true
    } catch {
      return false
    }
  }

  async function vote(v: 'like' | 'dislike') {
    if (!session.value) return
    const clientId = getOrCreateClientId()
    await $fetch('/api/session/vote', {
      method: 'POST',
      body: { clientId, code: session.value.code, vote: v },
    })
  }

  async function resumeSession(code: string) {
    try {
      const data = await $fetch<{ session: KaraokeSession }>(`/api/session/${code}`)
      session.value = data.session
      subscribe(code)
      return true
    } catch {
      return false
    }
  }

  return {
    session,
    error,
    previousVotes,
    currentSong,
    queue,
    votes,
    clientCount,
    subscribe,
    createSession,
    joinSession,
    addSong,
    nextSong,
    reorderQueue,
    vote,
    resumeSession,
  }
}

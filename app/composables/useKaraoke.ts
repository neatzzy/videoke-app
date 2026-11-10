import PusherClient from 'pusher-js'

const presenceChannel = (code: string) => `presence-session-${code}`

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
  clients: { name: string; isHost: boolean; likesReceived: number }[]
  queue: QueueItem[]
  currentSong: QueueItem | null
  status: 'waiting' | 'playing'
  votes: { likes: number; dislikes: number; total: number }
}

// Module-level singletons — survive page navigation
let pusherClient: PusherClient | null = null
let subscribedCode: string | null = null
// Sala cujos ids "minhas músicas" estão carregados em memória
let mySongsCode: string | null = null
// Timer do "Última performance": cancelado ao chegar outro resultado (B-01)
let previousVotesTimer: ReturnType<typeof setTimeout> | undefined

const mySongsKey = (code: string) => `karaoke:mySongs:${code}`

function readMySongs(code: string): string[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(mySongsKey(code)) ?? '[]')
    return Array.isArray(raw) ? raw.filter((id): id is string => typeof id === 'string') : []
  } catch {
    // storage indisponível ou JSON corrompido: começa sem ids
    return []
  }
}

function writeMySongs(code: string, ids: string[]) {
  try {
    localStorage.setItem(mySongsKey(code), JSON.stringify(ids))
  } catch {
    // storage indisponível: os ids ficam só na memória desta aba
  }
}

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
  // Membros conectados ao canal de presença; null até a autorização/assinatura dar certo.
  const presenceCount = useState<number | null>('karaoke:presenceCount', () => null)
  const clientCount = computed(() => presenceCount.value ?? session.value?.clients.length ?? 0)

  // Ids das músicas que este cliente adicionou (o servidor não diz quem adicionou: clientId é credencial).
  const mySongIds = useState<string[]>('karaoke:mySongs', () => [])
  const isMine = (id: string) => mySongIds.value.includes(id)

  function loadMySongsFor(code: string) {
    if (mySongsCode === code) return
    mySongsCode = code
    mySongIds.value = readMySongs(code)
  }

  // Aplica `change` aos ids da sala (memória se for a sala atual, senão storage). Não grava se nada mudou.
  function updateMySongs(code: string, change: (ids: string[]) => string[]) {
    const current = mySongsCode === code ? mySongIds.value : readMySongs(code)
    const next = change(current)
    if (next === current) return
    writeMySongs(code, next)
    if (mySongsCode === code) mySongIds.value = next
  }

  // Única porta para atualizar a sessão: também troca/limpa os ids "minhas músicas".
  function setSession(next: KaraokeSession) {
    session.value = next
    loadMySongsFor(next.code)
    const live = new Set([next.currentSong?.id, ...next.queue.map(item => item.id)])
    updateMySongs(next.code, ids => (ids.every(id => live.has(id)) ? ids : ids.filter(id => live.has(id))))
  }

  function subscribe(code: string) {
    if (typeof window === 'undefined') return
    if (subscribedCode === code) return

    if (!pusherClient) {
      pusherClient = new PusherClient(config.public.pusherKey as string, {
        cluster: config.public.pusherCluster as string,
        channelAuthorization: {
          transport: 'ajax',
          endpoint: '/api/pusher/auth',
          // lido a cada autorização: o código muda quando o convidado troca de sala
          paramsProvider: () => ({ clientId: getOrCreateClientId(), code: subscribedCode }),
        },
      })
      // Events emitted while the socket was down (phone locked) are not replayed: refetch state.
      const refresh = () => { if (subscribedCode) resumeSession(subscribedCode) }
      pusherClient.connection.bind('connected', refresh)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') refresh()
      })
    }

    if (subscribedCode && subscribedCode !== code) {
      pusherClient.unsubscribe(presenceChannel(subscribedCode))
    }

    subscribedCode = code
    presenceCount.value = null
    const channel = pusherClient.subscribe(presenceChannel(code))

    // Falha de autorização não derruba a UI: sem contagem, clientCount cai para session.clients.
    const countMembers = () => {
      presenceCount.value = (channel as unknown as { members?: { count: number } }).members?.count ?? null
    }
    channel.bind('pusher:subscription_succeeded', countMembers)
    channel.bind('pusher:member_added', countMembers)
    channel.bind('pusher:member_removed', countMembers)
    channel.bind('pusher:subscription_error', () => { presenceCount.value = null })

    channel.bind('session-update', (data: { session: KaraokeSession; previousVotes?: { likes: number; dislikes: number } }) => {
      setSession(data.session)
      if (data.previousVotes) {
        previousVotes.value = data.previousVotes
        clearTimeout(previousVotesTimer)
        previousVotesTimer = setTimeout(() => { previousVotes.value = null }, 8000)
      }
    })
  }

  async function createSession(hostName: string) {
    const clientId = getOrCreateClientId()
    const data = await $fetch<{ code: string; session: KaraokeSession }>('/api/session/create', {
      method: 'POST',
      body: { clientId, hostName },
    })
    setSession(data.session)
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
      setSession(data.session)
      subscribe(data.session.code)
    } catch (err) {
      error.value = (err as { data?: { message?: string } }).data?.message ?? 'Sala não encontrada'
    }
  }

  async function addSong(item: Omit<QueueItem, 'id' | 'addedBy'>) {
    if (!session.value) return
    const clientId = getOrCreateClientId()
    const code = session.value.code
    const { songId } = await $fetch<{ songId?: string }>('/api/session/add-song', {
      method: 'POST',
      body: { clientId, code, ...item },
    })
    if (songId) updateMySongs(code, ids => (ids.includes(songId) ? ids : [...ids, songId]))
  }

  // Returns false on failure and never rejects; removes the id from "minhas músicas" on success.
  async function removeSong(songId: string): Promise<boolean> {
    if (!session.value) return false
    const clientId = getOrCreateClientId()
    const code = session.value.code
    try {
      await $fetch('/api/session/remove-song', {
        method: 'POST',
        body: { clientId, code, songId },
      })
    } catch {
      return false
    }
    updateMySongs(code, ids => (ids.includes(songId) ? ids.filter(id => id !== songId) : ids))
    return true
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
      setSession(data.session)
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
    removeSong,
    mySongIds,
    isMine,
    nextSong,
    reorderQueue,
    vote,
    resumeSession,
  }
}

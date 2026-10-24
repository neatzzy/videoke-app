import type { Redis } from '@upstash/redis'

export interface QueueItem {
  id: string
  videoId: string
  title: string
  artist: string
  thumbnail: string
  duration: string
  addedBy: string
  addedById: string
}

export interface SessionClient {
  name: string
  isHost: boolean
  songsSung?: number
}

export interface Session {
  code: string
  hostClientId: string
  clients: Record<string, SessionClient>
  queue: QueueItem[]
  currentSong: QueueItem | null
  status: 'waiting' | 'playing'
  votes: { likes: number; dislikes: number; voters: string[] }
}

const SESSION_TTL = 60 * 60 * 6 // 6 hours

function sessionKey(code: string) {
  return `session:${code}`
}

function markSung(session: Session, item: QueueItem) {
  const client = session.clients[item.addedById]
  if (client) client.songsSung = (client.songsSung ?? 0) + 1
}

// Each item's turn = songs its singer already sang + their items ahead of it in the queue.
// A new item goes before the first item with a later turn, so whoever sang less goes first.
export function fairInsertIndex(session: Session, clientId: string): number {
  const turns: Record<string, number> = {}
  const turnOf = (id: string) => (turns[id] ??= session.clients[id]?.songsSung ?? 0)
  const newTurn = turnOf(clientId) + session.queue.filter((q) => q.addedById === clientId).length
  for (let i = 0; i < session.queue.length; i++) {
    const owner = session.queue[i]!.addedById
    if (turnOf(owner) > newTurn) return i
    turns[owner]!++
  }
  return session.queue.length
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export async function getSession(redis: Redis, code: string): Promise<Session | null> {
  return redis.get<Session>(sessionKey(code))
}

export async function saveSession(redis: Redis, session: Session): Promise<void> {
  await redis.set(sessionKey(session.code), session, { ex: SESSION_TTL })
}

export async function createSession(redis: Redis, clientId: string, hostName: string): Promise<Session> {
  let code = generateCode()
  let attempts = 0
  while (attempts < 10 && (await redis.exists(sessionKey(code)))) {
    code = generateCode()
    attempts++
  }

  const session: Session = {
    code,
    hostClientId: clientId,
    clients: { [clientId]: { name: hostName, isHost: true } },
    queue: [],
    currentSong: null,
    status: 'waiting',
    votes: { likes: 0, dislikes: 0, voters: [] },
  }

  await saveSession(redis, session)
  return session
}

export async function joinSession(redis: Redis, clientId: string, code: string, name: string): Promise<Session | null> {
  const session = await getSession(redis, code)
  if (!session) return null

  session.clients[clientId] = { name, isHost: false }
  await saveSession(redis, session)
  return session
}

export async function addToQueue(redis: Redis, clientId: string, code: string, item: Omit<QueueItem, 'id' | 'addedBy' | 'addedById'>): Promise<Session | null> {
  const session = await getSession(redis, code)
  if (!session || !session.clients[clientId]) return null

  const queueItem: QueueItem = {
    ...item,
    id: crypto.randomUUID(),
    addedBy: session.clients[clientId].name,
    addedById: clientId,
  }

  if (!session.currentSong) {
    session.currentSong = queueItem
    session.status = 'playing'
    session.votes = { likes: 0, dislikes: 0, voters: [] }
    markSung(session, queueItem)
  } else {
    session.queue.splice(fairInsertIndex(session, clientId), 0, queueItem)
  }

  await saveSession(redis, session)
  return session
}

export async function advanceQueue(redis: Redis, clientId: string, code: string): Promise<{ session: Session | null; previousVotes: Session['votes'] | null }> {
  const session = await getSession(redis, code)
  if (!session || session.hostClientId !== clientId) return { session: null, previousVotes: null }

  const previousVotes = session.currentSong ? { ...session.votes } : null

  if (session.queue.length > 0) {
    session.currentSong = session.queue.shift()!
    session.status = 'playing'
    markSung(session, session.currentSong)
    session.votes = { likes: 0, dislikes: 0, voters: [] }
  } else {
    session.currentSong = null
    session.status = 'waiting'
    session.votes = { likes: 0, dislikes: 0, voters: [] }
  }

  await saveSession(redis, session)
  return { session, previousVotes }
}

export async function reorderQueue(redis: Redis, clientId: string, code: string, orderedIds: string[]): Promise<Session | null> {
  const session = await getSession(redis, code)
  if (!session || session.hostClientId !== clientId) return null

  const byId = new Map(session.queue.map((item) => [item.id, item]))
  const reordered = orderedIds.map((id) => byId.get(id)).filter((item): item is QueueItem => !!item)
  if (reordered.length !== session.queue.length) return null

  session.queue = reordered
  await saveSession(redis, session)
  return session
}

export async function castVote(redis: Redis, clientId: string, code: string, vote: 'like' | 'dislike'): Promise<Session | null> {
  const session = await getSession(redis, code)
  if (!session || !session.currentSong || !session.clients[clientId]) return null
  if (session.votes.voters.includes(clientId)) return session

  session.votes.voters.push(clientId)
  if (vote === 'like') session.votes.likes++
  else session.votes.dislikes++

  await saveSession(redis, session)
  return session
}

export function serializeSession(session: Session) {
  return {
    code: session.code,
    clients: session.clients,
    queue: session.queue,
    currentSong: session.currentSong,
    status: session.status,
    votes: {
      likes: session.votes.likes,
      dislikes: session.votes.dislikes,
      total: session.votes.voters.length,
    },
  }
}

export interface QueueItem {
  id: string
  videoId: string
  title: string
  artist: string
  thumbnail: string
  duration: string
  addedBy: string
}

export interface SessionClient {
  name: string
  isHost: boolean
}

export interface Session {
  code: string
  hostPeerId: string | null
  clients: Record<string, SessionClient>
  queue: QueueItem[]
  currentSong: QueueItem | null
  status: 'waiting' | 'playing'
  votes: { likes: number; dislikes: number; voters: string[] }
}

export const sessions = new Map<string, Session>()
export const peerToSession = new Map<string, string>()
export const peerToName = new Map<string, string>()

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export function createSession(hostPeerId: string, hostName: string): Session {
  let code: string
  do {
    code = generateCode()
  } while (sessions.has(code))

  const session: Session = {
    code,
    hostPeerId,
    clients: { [hostPeerId]: { name: hostName, isHost: true } },
    queue: [],
    currentSong: null,
    status: 'waiting',
    votes: { likes: 0, dislikes: 0, voters: [] },
  }

  sessions.set(code, session)
  peerToSession.set(hostPeerId, code)
  peerToName.set(hostPeerId, hostName)

  return session
}

export function joinSession(peerId: string, code: string, name: string): Session | null {
  const session = sessions.get(code)
  if (!session) return null

  session.clients[peerId] = { name, isHost: false }
  peerToSession.set(peerId, code)
  peerToName.set(peerId, name)

  return session
}

export function addToQueue(peerId: string, item: Omit<QueueItem, 'id' | 'addedBy'>): Session | null {
  const code = peerToSession.get(peerId)
  if (!code) return null

  const session = sessions.get(code)
  if (!session) return null

  const queueItem: QueueItem = {
    ...item,
    id: crypto.randomUUID(),
    addedBy: peerToName.get(peerId) ?? 'Anônimo',
  }

  if (!session.currentSong) {
    session.currentSong = queueItem
    session.status = 'playing'
    session.votes = { likes: 0, dislikes: 0, voters: [] }
  } else {
    session.queue.push(queueItem)
  }

  return session
}

export function advanceQueue(peerId: string): { session: Session | null; previousVotes: Session['votes'] | null } {
  const code = peerToSession.get(peerId)
  if (!code) return { session: null, previousVotes: null }

  const session = sessions.get(code)
  if (!session || session.hostPeerId !== peerId) return { session: null, previousVotes: null }

  const previousVotes = session.currentSong ? { ...session.votes } : null

  if (session.queue.length > 0) {
    session.currentSong = session.queue.shift()!
    session.status = 'playing'
    session.votes = { likes: 0, dislikes: 0, voters: [] }
  } else {
    session.currentSong = null
    session.status = 'waiting'
    session.votes = { likes: 0, dislikes: 0, voters: [] }
  }

  return { session, previousVotes }
}

export function castVote(peerId: string, vote: 'like' | 'dislike'): Session | null {
  const code = peerToSession.get(peerId)
  if (!code) return null

  const session = sessions.get(code)
  if (!session || !session.currentSong) return null

  if (session.votes.voters.includes(peerId)) return session

  session.votes.voters.push(peerId)
  if (vote === 'like') session.votes.likes++
  else session.votes.dislikes++

  return session
}

export function removeClient(peerId: string): { session: Session | null; wasHost: boolean } {
  const code = peerToSession.get(peerId)
  peerToSession.delete(peerId)
  peerToName.delete(peerId)

  if (!code) return { session: null, wasHost: false }

  const session = sessions.get(code)
  if (!session) return { session: null, wasHost: false }

  const wasHost = session.hostPeerId === peerId
  delete session.clients[peerId]

  if (wasHost) {
    sessions.delete(code)
    return { session: null, wasHost: true }
  }

  return { session, wasHost: false }
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

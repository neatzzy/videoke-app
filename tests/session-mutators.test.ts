import { describe, it, expect } from 'vitest'
import type { Redis } from '@upstash/redis'
import {
  addToQueue,
  castVote,
  getSession,
  removeFromQueue,
  saveSession,
} from '../server/utils/sessions'
import type { QueueItem, Session } from '../server/utils/sessions'

// In-memory stand-in for the Upstash REST client: only the calls sessions.ts makes.
// Values go through JSON like the real client, so tests see copies, not shared references.
function fakeRedis(): Redis {
  const data = new Map<string, string>()
  const locks = new Map<string, string>()
  const redis = {
    async get(key: string) {
      const raw = data.get(key)
      return raw === undefined ? null : JSON.parse(raw)
    },
    async set(key: string, value: unknown, opts?: { nx?: boolean }) {
      if (key.startsWith('lock:')) {
        if (opts?.nx && locks.has(key)) return null
        locks.set(key, value as string)
        return 'OK'
      }
      data.set(key, JSON.stringify(value))
      return 'OK'
    },
    async eval(_script: string, keys: string[], args: string[]) {
      if (locks.get(keys[0]!) === args[0]) locks.delete(keys[0]!)
      return 1
    },
    async exists(key: string) {
      return data.has(key) ? 1 : 0
    },
  }
  return redis as unknown as Redis
}

const CODE = 'ABCD'

function item(id: string, addedById: string): QueueItem {
  return {
    id,
    videoId: 'vvvvvvvvvvv',
    title: `song ${id}`,
    artist: 'artist',
    thumbnail: '',
    duration: '',
    addedBy: addedById,
    addedById,
  }
}

function session(overrides: Partial<Session> = {}): Session {
  return {
    code: CODE,
    hostClientId: 'host',
    clients: {
      host: { name: 'Host', isHost: true },
      A: { name: 'Ana', isHost: false },
      B: { name: 'Bia', isHost: false },
    },
    queue: [],
    currentSong: null,
    status: 'waiting',
    votes: { likes: 0, dislikes: 0, voters: [] },
    ...overrides,
  }
}

async function seed(redis: Redis, s: Session): Promise<void> {
  await saveSession(redis, s)
}

const songItemIn = (s: Session | null) => s?.queue.map((q) => q.id)

describe('removeFromQueue', () => {
  it('removes the own queued song and keeps the rest of the queue in order', async () => {
    const redis = fakeRedis()
    await seed(redis, session({ queue: [item('a1', 'A'), item('b1', 'B'), item('a2', 'A')] }))

    const result = await removeFromQueue(redis, 'A', CODE, 'a1')

    expect(songItemIn(result)).toEqual(['b1', 'a2'])
    expect(songItemIn(await getSession(redis, CODE))).toEqual(['b1', 'a2'])
  })

  it('returns null and changes nothing when the song belongs to another singer', async () => {
    const redis = fakeRedis()
    const before = session({ queue: [item('b1', 'B')] })
    await seed(redis, before)

    expect(await removeFromQueue(redis, 'A', CODE, 'b1')).toBeNull()
    expect(songItemIn(await getSession(redis, CODE))).toEqual(['b1'])
  })

  it('does not remove the song that is playing now, even when it is the caller own', async () => {
    const redis = fakeRedis()
    const playing = item('a0', 'A')
    await seed(redis, session({ currentSong: playing, status: 'playing', queue: [item('b1', 'B')] }))

    const result = await removeFromQueue(redis, 'A', CODE, 'a0')

    expect(result?.currentSong?.id).toBe('a0')
    expect(songItemIn(result)).toEqual(['b1'])
  })

  it('is idempotent: removing the same song twice leaves the second call with the session unchanged', async () => {
    const redis = fakeRedis()
    await seed(redis, session({ queue: [item('a1', 'A'), item('b1', 'B')] }))

    await removeFromQueue(redis, 'A', CODE, 'a1')
    const second = await removeFromQueue(redis, 'A', CODE, 'a1')

    expect(second).not.toBeNull()
    expect(songItemIn(second)).toEqual(['b1'])
  })

  it('returns the session unchanged for a song id that does not exist', async () => {
    const redis = fakeRedis()
    await seed(redis, session({ queue: [item('a1', 'A')] }))

    const result = await removeFromQueue(redis, 'A', CODE, 'nope')

    expect(result).not.toBeNull()
    expect(songItemIn(result)).toEqual(['a1'])
  })

  it('returns null for a client that is not in the room', async () => {
    const redis = fakeRedis()
    await seed(redis, session({ queue: [item('x1', 'stranger')] }))

    expect(await removeFromQueue(redis, 'stranger', CODE, 'x1')).toBeNull()
    expect(songItemIn(await getSession(redis, CODE))).toEqual(['x1'])
  })

  it('returns null for a room that does not exist', async () => {
    const redis = fakeRedis()
    expect(await removeFromQueue(redis, 'A', 'ZZZZ', 'a1')).toBeNull()
  })

  it('does not treat the prototype key "constructor" as a room member', async () => {
    const redis = fakeRedis()
    await seed(redis, session({ queue: [item('a1', 'A')] }))

    expect(await removeFromQueue(redis, 'constructor', CODE, 'a1')).toBeNull()
    expect(songItemIn(await getSession(redis, CODE))).toEqual(['a1'])
  })
})

describe('addToQueue', () => {
  it('returns the id of the queued item along with the session', async () => {
    const redis = fakeRedis()
    await seed(redis, session({ currentSong: item('cur', 'B'), status: 'playing' }))

    const result = await addToQueue(redis, 'A', CODE, {
      videoId: 'vvvvvvvvvvv', title: 't', artist: 'a', thumbnail: '', duration: '',
    })

    expect(result).not.toBeNull()
    expect(result!.session.queue.map((q) => q.id)).toEqual([result!.songId])
    expect(result!.session.queue[0]!.addedById).toBe('A')
  })

  it('returns the id of the item that became the current song when the queue was empty', async () => {
    const redis = fakeRedis()
    await seed(redis, session())

    const result = await addToQueue(redis, 'A', CODE, {
      videoId: 'vvvvvvvvvvv', title: 't', artist: 'a', thumbnail: '', duration: '',
    })

    expect(result!.session.currentSong?.id).toBe(result!.songId)
    expect(result!.session.queue).toEqual([])
  })

  it('returns null for a client that is not in the room', async () => {
    const redis = fakeRedis()
    await seed(redis, session())

    const result = await addToQueue(redis, 'stranger', CODE, {
      videoId: 'vvvvvvvvvvv', title: 't', artist: 'a', thumbnail: '', duration: '',
    })

    expect(result).toBeNull()
  })

  it('returns null for "constructor", which is not a room member', async () => {
    const redis = fakeRedis()
    await seed(redis, session({ currentSong: item('cur', 'B'), status: 'playing' }))

    const result = await addToQueue(redis, 'constructor', CODE, {
      videoId: 'vvvvvvvvvvv', title: 't', artist: 'a', thumbnail: '', duration: '',
    })

    expect(result).toBeNull()
    expect((await getSession(redis, CODE))!.queue).toEqual([])
  })
})

describe('castVote', () => {
  it('returns null for "constructor", which is not a room member', async () => {
    const redis = fakeRedis()
    await seed(redis, session({ currentSong: item('cur', 'B'), status: 'playing' }))

    expect(await castVote(redis, 'constructor', CODE, 'like')).toBeNull()
    expect((await getSession(redis, CODE))!.votes.likes).toBe(0)
  })
})

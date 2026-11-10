import { describe, it, expect } from 'vitest'
import { fairInsertIndex } from '../server/utils/sessions'
import type { QueueItem, Session } from '../server/utils/sessions'

const item = (addedById: string): QueueItem => ({
  id: `${addedById}-${Math.random()}`,
  videoId: 'v',
  title: 't',
  artist: 'a',
  thumbnail: '',
  duration: '',
  addedBy: addedById,
  addedById,
})

// queue: singer ids in queue order; sung: songs each singer already sang
function session(queue: string[] = [], sung: Record<string, number> = {}): Session {
  return {
    code: 'ABCD',
    hostClientId: 'host',
    clients: Object.fromEntries(
      Object.entries(sung).map(([id, n]) => [id, { name: id, isHost: false, songsSung: n }]),
    ),
    queue: queue.map(item),
    currentSong: null,
    status: 'waiting',
    votes: { likes: 0, dislikes: 0, voters: [] },
  }
}

describe('fairInsertIndex', () => {
  it('returns 0 for an empty queue', () => {
    expect(fairInsertIndex(session(), 'A')).toBe(0)
  })

  it('appends a singer with no turns ahead when everyone else is at the same turn', () => {
    expect(fairInsertIndex(session(['A']), 'B')).toBe(1)
  })

  it('puts a second item by the same singer after the first items of others', () => {
    expect(fairInsertIndex(session(['A', 'B']), 'A')).toBe(2)
  })

  it('interleaves a new singer between rounds of a singer who queued several songs', () => {
    expect(fairInsertIndex(session(['A', 'A', 'A']), 'B')).toBe(1)
  })

  it('keeps a singer own later songs at the end of their own run', () => {
    expect(fairInsertIndex(session(['A', 'A', 'A']), 'A')).toBe(3)
  })

  it('uses songs already sung as the turn offset', () => {
    // A has sung 0 songs, so A goes right after the first B (turn 0), before B's turn-1 item
    expect(fairInsertIndex(session(['B', 'B', 'B'], { B: 0 }), 'A')).toBe(1)
    // A has sung 2 songs, so A's next turn (2) comes after every B turn in the queue
    expect(fairInsertIndex(session(['B', 'B', 'B'], { A: 2 }), 'A')).toBe(3)
  })

  it('places a singer ahead of a queued singer who has already sung more', () => {
    expect(fairInsertIndex(session(['B'], { B: 5 }), 'A')).toBe(0)
  })

  it('treats a client missing from the session as having sung zero songs', () => {
    expect(fairInsertIndex(session(['ghost']), 'A')).toBe(1)
    expect(fairInsertIndex(session(['ghost']), 'ghost')).toBe(1)
  })

  it('interleaves across several rounds of two singers', () => {
    // turns: A0 B0 A1 B1 -> new C has turn 0, goes after the first round only
    expect(fairInsertIndex(session(['A', 'B', 'A', 'B']), 'C')).toBe(2)
  })

  it('does not mutate the session', () => {
    const s = session(['A', 'B', 'A'], { A: 1 })
    const before = JSON.stringify(s)
    fairInsertIndex(s, 'B')
    expect(JSON.stringify(s)).toBe(before)
  })
})

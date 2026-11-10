import { describe, it, expect, vi } from 'vitest'

import { parseClientId, parseRequiredSongId, parseSongId } from '../server/utils/validate'

// h3 is only reachable from Nuxt's server build (pnpm does not hoist it to the root).
vi.mock('h3', () => ({
  createError: (o: { statusCode: number; message: string }) => Object.assign(new Error(o.message), o),
}))

describe('parseRequiredSongId', () => {
  it('accepts a non-empty song id and trims it', () => {
    expect(parseRequiredSongId(' 0f1e2d3c-uuid ')).toBe('0f1e2d3c-uuid')
  })

  it('rejects a missing, empty, non-string or too long id', () => {
    for (const bad of [undefined, null, '', '   ', 42, 'x'.repeat(65)]) {
      expect(() => parseRequiredSongId(bad)).toThrow(/Música/)
    }
  })
})

describe('parseSongId (optional)', () => {
  it('returns undefined when the id is absent', () => {
    expect(parseSongId(undefined)).toBeUndefined()
    expect(parseSongId(null)).toBeUndefined()
  })
})

describe('parseClientId', () => {
  it('aceita um UUID', () => {
    const id = '3f2b8c1e-5a4d-4e6f-9b0a-1c2d3e4f5a6b'
    expect(parseClientId(id)).toBe(id)
  })

  it.each(['__proto__', 'constructor', 'prototype', 'hasOwnProperty', 'toString'])(
    'rejeita o nome reservado %s (chave de objeto)',
    (name) => {
      expect(() => parseClientId(name)).toThrow()
    },
  )
})

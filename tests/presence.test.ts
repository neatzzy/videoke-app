import { describe, it, expect, vi } from 'vitest'

import { parseSocketId } from '../server/utils/validate'
import { presenceUserId } from '../server/utils/pusherServer'

// h3 is only reachable from Nuxt's server build (pnpm does not hoist it to the root).
vi.mock('h3', () => ({
  createError: (o: { statusCode: number; message: string }) => Object.assign(new Error(o.message), o),
}))

describe('parseSocketId', () => {
  it('accepts a Pusher socket id', () => {
    expect(parseSocketId('1234.5678')).toBe('1234.5678')
  })

  it('rejects anything that is not two numbers separated by a dot', () => {
    for (const bad of ['', 'abc', '1234', '1.2.3', '1 .2', 42, undefined, null]) {
      expect(() => parseSocketId(bad)).toThrow()
    }
  })
})

describe('presenceUserId', () => {
  const clientId = '6f1c2b1e-9d7a-4c3e-8b21-0a1b2c3d4e5f'

  it('never returns the raw clientId, which is a credential', () => {
    expect(presenceUserId(clientId)).not.toContain(clientId)
    expect(presenceUserId(clientId)).not.toBe(clientId)
  })

  it('is stable for the same client and distinct between clients', () => {
    expect(presenceUserId(clientId)).toBe(presenceUserId(clientId))
    expect(presenceUserId(clientId)).not.toBe(presenceUserId(`${clientId}-x`))
  })

  it('stays within the Pusher user_id limit of 200 characters', () => {
    expect(presenceUserId(clientId).length).toBeLessThanOrEqual(200)
  })
})

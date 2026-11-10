import Pusher from 'pusher'
import { createHash } from 'node:crypto'

let _pusher: Pusher | null = null

export function getPusher(): Pusher {
  if (!_pusher) {
    const { pusherAppId, pusherKey, pusherSecret, pusherCluster } = useRuntimeConfig()
    _pusher = new Pusher({
      appId: pusherAppId,
      key: pusherKey,
      secret: pusherSecret,
      cluster: pusherCluster,
      useTLS: true,
    })
  }
  return _pusher
}

export const presenceChannel = (code: string) => `presence-session-${code}`

// user_id é público (aparece para os demais membros): hash do clientId, que é credencial.
export function presenceUserId(clientId: string): string {
  return createHash('sha256').update(clientId).digest('hex')
}

// Falha do Pusher não pode virar 500: o estado já foi gravado no Redis.
export async function broadcastSession(code: string, payload: Record<string, unknown>): Promise<void> {
  try {
    await getPusher().trigger(presenceChannel(code), 'session-update', payload)
  } catch (err) {
    console.error(`[pusher] falha ao notificar a sala ${code}:`, err)
  }
}

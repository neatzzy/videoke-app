import Pusher from 'pusher'

let _pusher: Pusher | null = null

export function getPusher(): Pusher {
  if (!_pusher) {
    _pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.PUSHER_CLUSTER ?? 'mt1',
      useTLS: true,
    })
  }
  return _pusher
}

// Falha do Pusher não pode virar 500: o estado já foi gravado no Redis.
export async function broadcastSession(code: string, payload: Record<string, unknown>): Promise<void> {
  try {
    await getPusher().trigger(`session-${code}`, 'session-update', payload)
  } catch (err) {
    console.error(`[pusher] falha ao notificar a sala ${code}:`, err)
  }
}

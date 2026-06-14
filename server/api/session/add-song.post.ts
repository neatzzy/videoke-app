import { getRedis } from '../../utils/redis'
import { getPusher } from '../../utils/pusherServer'
import { addToQueue, serializeSession } from '../../utils/sessions'

export default defineEventHandler(async (event) => {
  const { clientId, code, videoId, title, artist, thumbnail, duration } = await readBody(event)

  if (!clientId || !code || !videoId) {
    throw createError({ statusCode: 400, message: 'Dados incompletos' })
  }

  const redis = getRedis()
  const session = await addToQueue(redis, clientId, code, { videoId, title, artist, thumbnail, duration: duration ?? '' })

  if (!session) {
    throw createError({ statusCode: 403, message: 'Sala não encontrada ou sem permissão' })
  }

  const serialized = serializeSession(session)
  await getPusher().trigger(`session-${code}`, 'session-update', { session: serialized })

  return { session: serialized }
})

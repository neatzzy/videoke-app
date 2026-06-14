import { getRedis } from '../../utils/redis'
import { getPusher } from '../../utils/pusherServer'
import { advanceQueue, serializeSession } from '../../utils/sessions'

export default defineEventHandler(async (event) => {
  const { clientId, code } = await readBody(event)

  if (!clientId || !code) {
    throw createError({ statusCode: 400, message: 'Dados incompletos' })
  }

  const redis = getRedis()
  const { session, previousVotes } = await advanceQueue(redis, clientId, code)

  if (!session) {
    throw createError({ statusCode: 403, message: 'Apenas o host pode avançar' })
  }

  const serialized = serializeSession(session)
  await getPusher().trigger(`session-${code}`, 'session-update', {
    session: serialized,
    ...(previousVotes ? { previousVotes: { likes: previousVotes.likes, dislikes: previousVotes.dislikes } } : {}),
  })

  return { session: serialized }
})

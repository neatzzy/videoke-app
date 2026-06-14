import { getRedis } from '../../utils/redis'
import { getPusher } from '../../utils/pusherServer'
import { castVote, serializeSession } from '../../utils/sessions'

export default defineEventHandler(async (event) => {
  const { clientId, code, vote } = await readBody(event)

  if (!clientId || !code || !vote) {
    throw createError({ statusCode: 400, message: 'Dados incompletos' })
  }

  const redis = getRedis()
  const session = await castVote(redis, clientId, code, vote)

  if (!session) {
    throw createError({ statusCode: 403, message: 'Voto não permitido' })
  }

  const serialized = serializeSession(session)
  await getPusher().trigger(`session-${code}`, 'session-update', { session: serialized })

  return { session: serialized }
})

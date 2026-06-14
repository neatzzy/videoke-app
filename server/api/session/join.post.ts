import { getRedis } from '../../utils/redis'
import { getPusher } from '../../utils/pusherServer'
import { joinSession, serializeSession } from '../../utils/sessions'

export default defineEventHandler(async (event) => {
  const { clientId, code, name } = await readBody(event)

  if (!clientId || !code || !name) {
    throw createError({ statusCode: 400, message: 'Dados incompletos' })
  }

  const redis = getRedis()
  const session = await joinSession(redis, clientId, code.toUpperCase(), name)

  if (!session) {
    throw createError({ statusCode: 404, message: 'Sala não encontrada' })
  }

  const serialized = serializeSession(session)
  await getPusher().trigger(`session-${session.code}`, 'session-update', { session: serialized })

  return { session: serialized }
})

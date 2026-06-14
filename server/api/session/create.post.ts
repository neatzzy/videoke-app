import { getRedis } from '../../utils/redis'
import { getPusher } from '../../utils/pusherServer'
import { createSession, serializeSession } from '../../utils/sessions'

export default defineEventHandler(async (event) => {
  const { clientId, hostName } = await readBody(event)

  if (!clientId) throw createError({ statusCode: 400, message: 'clientId obrigatório' })

  const redis = getRedis()
  const session = await createSession(redis, clientId, hostName ?? 'Host')
  const serialized = serializeSession(session)

  await getPusher().trigger(`session-${session.code}`, 'session-update', { session: serialized })

  return { code: session.code, session: serialized }
})

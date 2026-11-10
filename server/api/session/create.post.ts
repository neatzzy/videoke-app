import { getRedis } from '../../utils/redis'
import { broadcastSession } from '../../utils/pusherServer'
import { createSession, serializeSession } from '../../utils/sessions'
import { parseClientId, parseName } from '../../utils/validate'

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) ?? {}
  const clientId = parseClientId(body.clientId)
  const hostName = body.hostName ? parseName(body.hostName) : 'Host'

  const redis = getRedis()
  const session = await createSession(redis, clientId, hostName)
  const serialized = serializeSession(session)

  await broadcastSession(session.code, { session: serialized })

  return { code: session.code, session: serialized }
})

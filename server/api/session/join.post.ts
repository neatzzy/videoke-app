import { getRedis } from '../../utils/redis'
import { broadcastSession } from '../../utils/pusherServer'
import { joinSession, serializeSession } from '../../utils/sessions'
import { parseClientId, parseCode, parseName } from '../../utils/validate'

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) ?? {}
  const clientId = parseClientId(body.clientId)
  const code = parseCode(body.code)
  const name = parseName(body.name)

  const redis = getRedis()
  const session = await joinSession(redis, clientId, code, name)

  if (!session) {
    throw createError({ statusCode: 404, message: 'Sala não encontrada' })
  }

  const serialized = serializeSession(session)
  await broadcastSession(code, { session: serialized })

  return { session: serialized }
})

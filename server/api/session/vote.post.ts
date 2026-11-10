import { getRedis } from '../../utils/redis'
import { broadcastSession } from '../../utils/pusherServer'
import { castVote, serializeSession } from '../../utils/sessions'
import { parseClientId, parseCode, parseVote } from '../../utils/validate'

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) ?? {}
  const clientId = parseClientId(body.clientId)
  const code = parseCode(body.code)
  const vote = parseVote(body.vote)

  const redis = getRedis()
  const session = await castVote(redis, clientId, code, vote)

  if (!session) {
    throw createError({ statusCode: 403, message: 'Voto não permitido' })
  }

  const serialized = serializeSession(session)
  await broadcastSession(code, { session: serialized })

  return { session: serialized }
})

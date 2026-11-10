import { getRedis } from '../../utils/redis'
import { broadcastSession } from '../../utils/pusherServer'
import { addToQueue, serializeSession } from '../../utils/sessions'
import { parseClientId, parseCode, parseSong } from '../../utils/validate'

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) ?? {}
  const clientId = parseClientId(body.clientId)
  const code = parseCode(body.code)
  const song = parseSong(body)

  const redis = getRedis()
  const result = await addToQueue(redis, clientId, code, song)

  if (!result) {
    throw createError({ statusCode: 403, message: 'Sala não encontrada ou sem permissão' })
  }

  const serialized = serializeSession(result.session)
  await broadcastSession(code, { session: serialized })

  return { session: serialized, songId: result.songId }
})

import { getRedis } from '../../utils/redis'
import { broadcastSession } from '../../utils/pusherServer'
import { removeFromQueue, serializeSession } from '../../utils/sessions'
import { parseClientId, parseCode, parseRequiredSongId } from '../../utils/validate'

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) ?? {}
  const clientId = parseClientId(body.clientId)
  const code = parseCode(body.code)
  const songId = parseRequiredSongId(body.songId)

  const redis = getRedis()
  const session = await removeFromQueue(redis, clientId, code, songId)

  if (!session) {
    throw createError({ statusCode: 403, message: 'Sala não encontrada ou música de outro cantor' })
  }

  const serialized = serializeSession(session)
  await broadcastSession(code, { session: serialized })

  return { session: serialized }
})

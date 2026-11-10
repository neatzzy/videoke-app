import { getRedis } from '../../utils/redis'
import { broadcastSession } from '../../utils/pusherServer'
import { advanceQueue, serializeSession } from '../../utils/sessions'
import { parseClientId, parseCode, parseSongId } from '../../utils/validate'

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) ?? {}
  const clientId = parseClientId(body.clientId)
  const code = parseCode(body.code)
  const songId = parseSongId(body.songId)

  const redis = getRedis()
  const { session, previousVotes } = await advanceQueue(redis, clientId, code, songId)

  if (!session) {
    throw createError({ statusCode: 403, message: 'Apenas o host pode avançar' })
  }

  const serialized = serializeSession(session)
  await broadcastSession(code, {
    session: serialized,
    ...(previousVotes ? { previousVotes: { likes: previousVotes.likes, dislikes: previousVotes.dislikes } } : {}),
  })

  return { session: serialized }
})

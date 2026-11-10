import { getRedis } from '../../utils/redis'
import { broadcastSession } from '../../utils/pusherServer'
import { reorderQueue, serializeSession } from '../../utils/sessions'
import { parseClientId, parseCode, parseIds } from '../../utils/validate'

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) ?? {}
  const clientId = parseClientId(body.clientId)
  const code = parseCode(body.code)
  const orderedIds = parseIds(body.orderedIds)

  const redis = getRedis()
  const session = await reorderQueue(redis, clientId, code, orderedIds)

  if (!session) {
    throw createError({ statusCode: 403, message: 'Apenas o host pode reordenar a fila' })
  }

  const serialized = serializeSession(session)
  await broadcastSession(code, { session: serialized })

  return { session: serialized }
})

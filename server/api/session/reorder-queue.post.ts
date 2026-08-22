import { getRedis } from '../../utils/redis'
import { getPusher } from '../../utils/pusherServer'
import { reorderQueue, serializeSession } from '../../utils/sessions'

export default defineEventHandler(async (event) => {
  const { clientId, code, orderedIds } = await readBody(event)

  if (!clientId || !code || !Array.isArray(orderedIds)) {
    throw createError({ statusCode: 400, message: 'Dados incompletos' })
  }

  const redis = getRedis()
  const session = await reorderQueue(redis, clientId, code, orderedIds)

  if (!session) {
    throw createError({ statusCode: 403, message: 'Apenas o host pode reordenar a fila' })
  }

  const serialized = serializeSession(session)
  await getPusher().trigger(`session-${code}`, 'session-update', { session: serialized })

  return { session: serialized }
})

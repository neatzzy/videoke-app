import { getRedis } from '../../utils/redis'
import { getSession, serializeSession } from '../../utils/sessions'
import { parseCode } from '../../utils/validate'

export default defineEventHandler(async (event) => {
  const code = parseCode(getRouterParam(event, 'code'))

  const redis = getRedis()
  const session = await getSession(redis, code)

  if (!session) throw createError({ statusCode: 404, message: 'Sala não encontrada' })

  return { session: serializeSession(session) }
})

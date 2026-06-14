import { getRedis } from '../../utils/redis'
import { getSession, serializeSession } from '../../utils/sessions'

export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, 'code')?.toUpperCase()
  if (!code) throw createError({ statusCode: 400, message: 'Código inválido' })

  const redis = getRedis()
  const session = await getSession(redis, code)

  if (!session) throw createError({ statusCode: 404, message: 'Sala não encontrada' })

  return { session: serializeSession(session) }
})

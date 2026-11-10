import { getPusher, presenceChannel, presenceUserId } from '../../utils/pusherServer'
import { getRedis } from '../../utils/redis'
import { getSession } from '../../utils/sessions'
import { parseClientId, parseCode, parseSocketId } from '../../utils/validate'

// pusher-js envia form-urlencoded: socket_id e channel_name, mais clientId e code (params do cliente).
export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) ?? {}
  const socketId = parseSocketId(body.socket_id)
  const code = parseCode(body.code)
  const clientId = parseClientId(body.clientId)
  const channel = typeof body.channel_name === 'string' ? body.channel_name : ''
  if (channel !== presenceChannel(code)) throw createError({ statusCode: 403, message: 'Canal não permitido' })

  const session = await getSession(getRedis(), code)
  // hasOwn: sem isso, um clientId como "constructor" passaria pelo objeto literal
  if (!session || !Object.hasOwn(session.clients, clientId)) {
    throw createError({ statusCode: 403, message: 'Sem acesso à sala' })
  }

  return getPusher().authorizeChannel(socketId, channel, {
    user_id: presenceUserId(clientId),
    user_info: { name: session.clients[clientId]!.name },
  })
})

import {
  sessions,
  peerToSession,
  createSession,
  joinSession,
  addToQueue,
  advanceQueue,
  castVote,
  removeClient,
  serializeSession,
} from '../utils/sessions'

export default defineWebSocketHandler({
  open(peer) {
    console.log('[WS] connected:', peer.id)
  },

  message(peer, message) {
    let data: any
    try {
      data = JSON.parse(message.text())
    } catch {
      peer.send(JSON.stringify({ type: 'ERROR', code: 'INVALID_JSON', message: 'Formato inválido' }))
      return
    }

    const send = (payload: object) => peer.send(JSON.stringify(payload))
    const broadcast = (topic: string, payload: object) => {
      const msg = JSON.stringify(payload)
      peer.send(msg)
      peer.publish(topic, msg)
    }

    switch (data.type) {
      case 'CREATE_SESSION': {
        const session = createSession(peer.id, data.hostName ?? 'Host')
        peer.subscribe(session.code)
        send({ type: 'SESSION_CREATED', code: session.code, session: serializeSession(session) })
        break
      }

      case 'JOIN_SESSION': {
        const code = (data.code as string)?.toUpperCase()
        const session = joinSession(peer.id, code, data.name ?? 'Visitante')

        if (!session) {
          send({ type: 'ERROR', code: 'NOT_FOUND', message: 'Sala não encontrada' })
          return
        }

        peer.subscribe(session.code)
        send({ type: 'SESSION_JOINED', session: serializeSession(session) })
        peer.publish(session.code, JSON.stringify({ type: 'SESSION_UPDATE', session: serializeSession(session) }))
        break
      }

      case 'ADD_SONG': {
        const session = addToQueue(peer.id, {
          videoId: data.videoId,
          title: data.title,
          artist: data.artist,
          thumbnail: data.thumbnail,
          duration: data.duration ?? '',
        })

        if (!session) {
          send({ type: 'ERROR', code: 'NOT_IN_SESSION', message: 'Você não está em uma sala' })
          return
        }

        broadcast(session.code, { type: 'SESSION_UPDATE', session: serializeSession(session) })
        break
      }

      case 'NEXT_SONG': {
        const { session, previousVotes } = advanceQueue(peer.id)

        if (!session) {
          send({ type: 'ERROR', code: 'NOT_HOST', message: 'Apenas o host pode avançar' })
          return
        }

        const payload: Record<string, unknown> = { type: 'SESSION_UPDATE', session: serializeSession(session) }
        if (previousVotes) payload.previousVotes = previousVotes
        broadcast(session.code, payload)
        break
      }

      case 'VOTE': {
        const session = castVote(peer.id, data.vote)
        if (!session) return

        broadcast(session.code, { type: 'SESSION_UPDATE', session: serializeSession(session) })
        break
      }

      case 'SYNC': {
        const code = peerToSession.get(peer.id)
        if (!code) return
        const session = sessions.get(code)
        if (!session) return
        send({ type: 'SESSION_UPDATE', session: serializeSession(session) })
        break
      }
    }
  },

  close(peer) {
    console.log('[WS] disconnected:', peer.id)
    const { session } = removeClient(peer.id)

    if (session) {
      peer.publish(session.code, JSON.stringify({ type: 'SESSION_UPDATE', session: serializeSession(session) }))
    }
  },

  error(peer, error) {
    console.error('[WS] error:', peer.id, error)
  },
})

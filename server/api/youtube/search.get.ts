interface YouTubeSearchResponse {
  items?: {
    id?: { videoId?: string }
    snippet?: {
      title: string
      channelTitle: string
      thumbnails?: { medium?: { url: string }; default?: { url: string } }
    }
  }[]
}

const normalize = (q: unknown) => (typeof q === 'string' ? q.trim().toLowerCase().slice(0, 80) : '')

// Cache por 24h: cada busca custa 100 unidades da cota diária da YouTube Data API.
export default defineCachedEventHandler(async (event) => {
  const q = normalize(getQuery(event).q)
  if (!q) throw createError({ statusCode: 400, message: 'Parâmetro q obrigatório' })

  const { youtubeApiKey } = useRuntimeConfig(event)
  if (!youtubeApiKey) throw createError({ statusCode: 500, message: 'Busca indisponível' })

  const data = await $fetch<YouTubeSearchResponse>('https://www.googleapis.com/youtube/v3/search', {
    query: {
      part: 'snippet',
      type: 'video',
      q: `${q} karaoke`,
      key: youtubeApiKey,
      maxResults: 10,
      videoCategoryId: 10, // categoria Música
      videoEmbeddable: 'true', // só vídeos que tocam no player do host
    },
    timeout: 8000,
  }).catch(() => {
    // Não repassa a mensagem do Google ao cliente.
    throw createError({ statusCode: 502, message: 'Não foi possível buscar no YouTube' })
  })

  const items = (data.items ?? []).flatMap((item) => {
    const videoId = item.id?.videoId
    const snippet = item.snippet
    if (!videoId || !snippet) return []
    return [{
      videoId,
      title: snippet.title,
      artist: snippet.channelTitle,
      thumbnail: snippet.thumbnails?.medium?.url ?? snippet.thumbnails?.default?.url ?? '',
    }]
  })

  return { items }
}, {
  maxAge: 60 * 60 * 24,
  getKey: (event) => normalize(getQuery(event).q),
})

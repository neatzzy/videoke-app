export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const q = query.q as string

  if (!q?.trim()) {
    throw createError({ statusCode: 400, message: 'Parâmetro q obrigatório' })
  }

  const apiKey = process.env.API_KEY
  if (!apiKey) {
    throw createError({ statusCode: 500, message: 'YouTube API key não configurada' })
  }

  const url = new URL('https://www.googleapis.com/youtube/v3/search')
  url.searchParams.set('part', 'snippet')
  url.searchParams.set('type', 'video')
  url.searchParams.set('q', `${q} karaoke`)
  url.searchParams.set('key', apiKey)
  url.searchParams.set('maxResults', '10')
  url.searchParams.set('videoCategoryId', '10') // Music category

  const response = await fetch(url.toString())
  const data = await response.json() as any

  if (!response.ok) {
    throw createError({ statusCode: response.status, message: data.error?.message ?? 'Erro na API do YouTube' })
  }

  const items = (data.items ?? []).map((item: any) => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    artist: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails.medium?.url ?? item.snippet.thumbnails.default?.url,
  }))

  return { items }
})

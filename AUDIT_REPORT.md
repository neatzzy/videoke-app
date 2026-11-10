# Relatório de Auditoria Completa — Videoké

> Auditoria estática de 10/11/2026 sobre o commit `11da1c1`. Nada foi executado: nenhum build, nenhum teste em navegador, nenhuma chamada a Pusher, Upstash ou YouTube. Cada achado vem de leitura de código e traz `arquivo:linha`. Onde a conclusão depende de comportamento em runtime, isso está dito no achado.

## 1. Resumo Executivo

**Nota geral: 5,5 / 10.**

O projeto é pequeno (cerca de 1.500 linhas) e bem organizado: estrutura `app/` + `server/` correta para Nuxt 4, rotas Nitro finas, um único composable como fonte de estado, 100% `<script setup lang="ts">`. A nota cai por quatro motivos: o modelo de confiança por `clientId` está furado pelo próprio serializador, as mutações de sessão não são atômicas, o host perde a sala ao recarregar e o build do Electron provavelmente não funciona em produção.

**Maturidade Nuxt 4: média-baixa.** O app usa o Nuxt como servidor de API e roteador. Não há `routeRules`, `error.vue`, middleware, `runtimeConfig` privado, módulos além do Tailwind, lint ou testes. Parte disso é adequado ao tamanho do projeto (não usar `useFetch`/Pinia aqui é a decisão certa); parte é lacuna real.

| Dimensão | Web / Host (PC, TV, Electron) | Mobile (convidado, navegador) |
| --- | --- | --- |
| Fluxo principal | Funciona em dev; sala se perde em reload | Funciona; voto "desmarca" sozinho (A-06) |
| Resiliência | Sem auto-avanço, sem tratamento de vídeo bloqueado | Sem ressincronização após a tela bloquear (A-05) |
| Acessibilidade | Boa base de foco; texto de 11px numa TV | Boa: labels, alvos ≥ 44px, `role="alert"`, reduced motion |
| Distribuição | Build Electron aponta para `file://` sem API (A-03) | Sem manifest, ícones ou `theme-color` |
| Maturidade | **4 / 10** | **6 / 10** |

O lado mobile está mais maduro que o host, o que é o inverso da prioridade do produto: o `PRODUCT.md` trata a tela do host como "o show".

**Os 3 maiores riscos operacionais**

1. **Qualquer convidado pode virar host.** `serializeSession()` envia os `clientId` de todos (inclusive o do host) para todo mundo, e o `clientId` é a única credencial (C-01).
2. **A busca para de funcionar depois de ~100 pesquisas por dia.** `search.list` custa 100 unidades da cota padrão de 10.000/dia da YouTube Data API, e a rota não tem cache nem limite (A-04).
3. **A festa perde o estado em situações comuns.** Recarregar o host cria outra sala e deixa os convidados na antiga (A-02); dois convidados adicionando música ao mesmo tempo podem perder uma delas (A-01); celulares que bloquearam a tela ficam com a fila desatualizada (A-05).

## 2. Matriz de Achados

| ID | Plataforma | Área | Gravidade | Descrição Curta | Esforço de Correção |
| --- | --- | --- | --- | --- | --- |
| C-01 | Ambos | Segurança | Crítico | `serializeSession` vaza todos os `clientId`, inclusive o do host | Baixo (1–2 h) |
| A-01 | Ambos | Dados / concorrência | Alto | Mutações de sessão são read-modify-write sem lock: escritas concorrentes se perdem | Médio (3–4 h) |
| A-02 | Web | Funcional | Alto | Recarregar `/host` sempre cria uma sala nova | Baixo (1 h) |
| A-03 | Web (Electron) | Build | Alto | App empacotado carrega `file://` de um build estático sem API | Baixo (1 h) |
| A-04 | Ambos | Operação | Alto | Busca do YouTube sem cache nem limite; cota esgota em ~100 buscas/dia | Baixo (1 h) |
| A-05 | Mobile | Realtime | Alto | Sem ressincronização quando o Pusher reconecta ou a aba volta ao foco | Baixo (1 h) |
| A-06 | Mobile | Bug de UI | Alto | `watch(currentSong)` zera `myVote` a cada `session-update` | Trivial (1 linha) |
| A-07 | Ambos | Design | Alto | Código implementa paleta verde/cinza estilo Spotify; `DESIGN.md` define neon pink/cyan | Médio (4–6 h) |
| M-01 | Ambos | Validação | Médio | Rotas só checam truthiness; `vote` inválido conta como dislike; strings sem limite | Médio (2–3 h) |
| M-02 | Ambos | Dados | Médio | `joinSession` sobrescreve o cliente existente: zera `songsSung` e `isHost` | Baixo |
| M-03 | Ambos | Erros | Médio | Falha no `pusher.trigger` devolve 500 com o estado já gravado | Baixo |
| M-04 | Web | Erros | Médio | `nextSong()` e `reorderQueue()` sem `catch`; fila local não volta atrás em erro | Baixo |
| M-05 | Web | Funcional | Médio | Sem `onError` do player nem `videoEmbeddable=true`: vídeo bloqueado trava a tela | Baixo |
| M-06 | Ambos | Erros | Médio | Não existe `app/error.vue`; erro fatal cai na página padrão do Nuxt, em inglês | Baixo |
| M-07 | Ambos | Acessibilidade | Médio | `<html lang>` não definido para conteúdo em pt-BR | Trivial |
| M-08 | Ambos | Tipografia | Médio | Texto de 10,5px no celular; 11–12px na tela do host vista do sofá | Baixo |
| M-09 | Web | Acessibilidade | Médio | Reordenar a fila só funciona por arrasto com ponteiro | Médio |
| M-10 | Ambos | Produto | Médio | "N online" conta todos que já entraram; nunca diminui | Médio |
| M-11 | Ambos | Segurança | Médio | Código de sala com `Math.random`, 331.776 combinações, sem rate limit; colisão após 10 tentativas sobrescreve a sala | Baixo |
| M-12 | Ambos | Nuxt | Médio | Segredos via `process.env!` em vez de `runtimeConfig`; sem `.env.example` | Baixo |
| M-13 | Ambos | Nuxt | Médio | SSR ligado em páginas 100% client-side; sem `routeRules` | Trivial |
| M-14 | Ambos | Qualidade | Médio | Sem ESLint, typecheck em CI ou testes; `any` no player do YouTube | Médio |
| M-15 | Mobile | PWA | Médio | Sem manifest, `theme-color`, `apple-touch-icon` | Baixo |
| B-01 | Ambos | Async | Baixo | `setTimeout` não cancelados (`previousVotes`, `flashError`) apagam mensagens novas cedo demais | Trivial |
| B-02 | Mobile | Conteúdo | Baixo | "Dica: use o código NEON" em produção; `NEON` nem pode ser gerado (alfabeto sem `O`) | Trivial |
| B-03 | Ambos | Performance | Baixo | Google Fonts via `<link>` bloqueante, sem preconnect a `fonts.gstatic.com` | Baixo |
| B-04 | Web | Performance | Baixo | Barra de progresso anima `width` com `transition-all` | Trivial |
| B-05 | Ambos | Higiene | Baixo | `vercel` em `dependencies`; `connect()`/`sync()` são no-ops mortos | Trivial |
| B-06 | Web (Electron) | Segurança | Baixo | Sem `setWindowOpenHandler`/`will-navigate`; `sandbox` implícito | Baixo |
| B-07 | Ambos | Acessibilidade | Baixo | SVGs decorativos sem `aria-hidden`; `<nav>` sem rótulo; votos sem `aria-live` | Baixo |
| B-08 | Ambos | Performance | Baixo | `<img>` sem `width`/`height`/`loading="lazy"` | Trivial |
| B-09 | Mobile | Erros | Baixo | Erro de rede no join aparece como "Sala não encontrada" | Trivial |
| B-10 | Mobile | Conteúdo | Baixo | "Entrar como Client" mistura inglês numa interface em português | Trivial |

**Áreas verificadas sem achados**

- **Hydration:** nenhum acesso a `window`, `document` ou `localStorage` roda no setup. Todos estão em `onMounted` ou em handlers (`useKaraoke.ts:28` só é chamado por ações; `host.vue:97-101` em `onMounted`).
- **Vazamento de contexto com `useAsyncData`/`useFetch`:** não se aplica, nenhum dos dois é usado. Todo fetch é disparado por ação do usuário com `$fetch`, que é o uso correto.
- **Contraste:** `#b3b3b3` sobre `#121212` = 8,93:1; `#f3727f` sobre `#121212` = 6,71:1; preto sobre `#1ed760` = 10,94:1. Todos acima de 4,5:1.
- **Segredos no cliente:** `PUSHER_SECRET`, `API_KEY` e o token do Upstash não aparecem em `app/` nem em `runtimeConfig.public`.

## 3. Novas Features Propostas & Matriz Esforço vs. Impacto

### F1. Auto-avanço e pulo de vídeo indisponível

- **Proposta de valor:** hoje alguém precisa ir até o PC clicar em "Próxima" ao fim de cada música. O ramo `ENDED` já existe e está vazio (`host.vue:78-80`). Com auto-avanço a festa roda sozinha.
- **Plataforma:** Web (host).
- **Mapeamento técnico:** chamar `nextSong()` em `onStateChange` quando `e.data === 0` e em `onError`; `useTimeoutFn` de `@vueuse/nuxt` para uma contagem de 5 s mostrando o placar antes de trocar. Nenhuma rota nova.

### F2. Tela sempre acesa e app instalável

- **Proposta de valor:** a TV não entra em descanso no meio da música; o convidado adiciona o atalho à tela inicial e volta à sala sem digitar o código.
- **Plataforma:** Ambos.
- **Mapeamento técnico:** `useWakeLock()` de `@vueuse/nuxt` em `host.vue` (no Electron, `powerSaveBlocker`); `@vite-pwa/nuxt` só para manifest e ícones. Não vale cachear dados offline: o app não tem função sem rede.

### F3. Placar da noite

- **Proposta de valor:** os votos hoje somem 5 s depois da música (`previousVotes`). Guardar curtidas por cantor e mostrar um ranking no host entre as músicas dá motivo para votar e para cantar de novo. É a feature com maior efeito em engajamento.
- **Plataforma:** Ambos.
- **Mapeamento técnico:** campo `likesReceived` em `SessionClient`, somado em `advanceQueue`; nova aba ou cartão no host. Segue o padrão existente (mutador em `sessions.ts` → `serializeSession` → Pusher). Animação com `<TransitionGroup>`.

### F4. Convidado gerencia as próprias músicas

- **Proposta de valor:** quem adicionou a música errada não tem como tirar; hoje só resta o host pular. Remover a própria música reduz atrito e pedidos ao host.
- **Plataforma:** Mobile.
- **Mapeamento técnico:** rota `remove-song.post.ts` + mutador `removeFromQueue` que confere `addedById === clientId`. Depois de C-01 o cliente não recebe mais `addedById`; o servidor passa a enviar um booleano `mine` calculado por requisição, ou o cliente guarda os `id` que ele mesmo adicionou. Feedback tátil com `useVibrate()` (`@vueuse/nuxt`; sem efeito no Safari do iOS).

### F5. Presença real

- **Proposta de valor:** "N online" passa a refletir quem está de fato conectado (corrige M-10) e permite pular a vez de quem foi embora.
- **Plataforma:** Ambos.
- **Mapeamento técnico:** canal `presence-session-${code}` do Pusher e uma rota `server/api/pusher/auth.post.ts` que autoriza apenas `clientId` presentes em `session.clients`. De quebra, fecha o canal a quem só conhece o código.

### Matriz 2×2

| | **Baixo Esforço** | **Alto Esforço** |
| --- | --- | --- |
| **Alto Impacto** | **Quick Wins**<br>F1 Auto-avanço e pulo de vídeo<br>F2 Wake lock (só a parte de tela acesa) | **Projetos Estratégicos**<br>F3 Placar da noite<br>F5 Presença real |
| **Baixo Impacto** | **Preenchimentos de Lacuna**<br>F4 Remover a própria música<br>F2 Manifest e ícones PWA<br>Feedback tátil no voto | **Descartar / Reavaliar**<br>Tema claro com `@nuxtjs/color-mode`<br>Migrar estado para `@pinia/nuxt`<br>Suporte offline com Service Worker<br>App nativo via Capacitor |

Sobre os descartados: o tema escuro permanente é defensável para um app de mídia. `dark-mode.md`: "In rare cases, consider using only a dark appearance in the interface. For example, it can make sense for an app that supports immersive media viewing". Pinia não traz ganho com três chaves de `useState`. `@nuxt/image` também não compensa: as únicas imagens são thumbnails de 320×180 já servidas pelo CDN do YouTube.

## 4. Detalhamento dos Achados & Soluções em Código

### C-01 — `serializeSession` entrega as credenciais de todos (Crítico)

**Problema e localização:** `server/utils/sessions.ts:170-183`. O `CLAUDE.md` define o `clientId` como "trust boundary". O serializador devolve `clients: session.clients`, cujas chaves são os `clientId`, e os itens da fila carregam `addedById`. Esse payload sai em `GET /api/session/[code]` (sem autenticação) e em todo evento `session-update` de um canal Pusher público. Quem sabe o código de 4 letras lê o `clientId` do host e pode chamar `next-song` e `reorder-queue`, ou votar e adicionar músicas como outro convidado. O cliente não usa nenhum desses ids: `clients` só serve para contar (`useKaraoke.ts:45`) e `addedById` não aparece em nenhum template.

**Código atual**

```ts
// server/utils/sessions.ts
export function serializeSession(session: Session) {
  return {
    code: session.code,
    clients: session.clients,
    queue: session.queue,
    currentSong: session.currentSong,
    // ...
  }
}
```

**Código refatorado**

```ts
// server/utils/sessions.ts
const publicItem = ({ addedById: _addedById, ...item }: QueueItem) => item

export function serializeSession(session: Session) {
  return {
    code: session.code,
    // clientId é credencial: nunca sai do servidor
    clients: Object.values(session.clients).map(({ name, isHost }) => ({ name, isHost })),
    queue: session.queue.map(publicItem),
    currentSong: session.currentSong && publicItem(session.currentSong),
    status: session.status,
    votes: {
      likes: session.votes.likes,
      dislikes: session.votes.dislikes,
      total: session.votes.voters.length,
    },
  }
}
```

```ts
// app/composables/useKaraoke.ts — manter em sincronia com o serializador
export interface QueueItem {
  id: string
  videoId: string
  title: string
  artist: string
  thumbnail: string
  duration: string
  addedBy: string
}

export interface KaraokeSession {
  code: string
  clients: { name: string; isHost: boolean }[]
  // ...
}

const clientCount = computed(() => session.value?.clients.length ?? 0)

async function addSong(item: Omit<QueueItem, 'id' | 'addedBy'>) { /* corpo inalterado */ }
```

Salas criadas antes do deploy continuam com os ids já vazados; elas expiram em 6 h (`SESSION_TTL`).

### A-01 — Mutações de sessão não são atômicas

**Problema e localização:** todos os mutadores de `server/utils/sessions.ts` fazem `getSession` → alteram o objeto em memória → `saveSession` com `SET` do JSON inteiro (`:100-119`, `:124-140`, `:145-153`, `:158-166`, `:91-95`). Duas requisições simultâneas na mesma sala leem o mesmo estado e a segunda escrita apaga a primeira. Casos concretos: dois convidados adicionam música ao mesmo tempo e uma some; dois votos simultâneos contam como um; clique duplo em "Próxima" pula duas músicas. A API REST do Upstash não tem `WATCH`, então a correção menor é um lock por sala.

**Código atual**

```ts
export async function castVote(redis: Redis, clientId: string, code: string, vote: 'like' | 'dislike') {
  const session = await getSession(redis, code)
  if (!session || !session.currentSong || !session.clients[clientId]) return null
  if (session.votes.voters.includes(clientId)) return session

  session.votes.voters.push(clientId)
  // ...
  await saveSession(redis, session)
  return session
}
```

**Código refatorado**

```ts
// server/utils/sessions.ts
const UNLOCK = `if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) end return 0`

// Serializa as mutações de uma sala. O Upstash REST não tem WATCH/MULTI interativo.
async function withSessionLock<T>(redis: Redis, code: string, fn: () => Promise<T>): Promise<T> {
  const key = `lock:${sessionKey(code)}`
  const token = crypto.randomUUID()
  for (let attempt = 0; attempt < 50; attempt++) {
    if (await redis.set(key, token, { nx: true, px: 3000 })) {
      try {
        return await fn()
      } finally {
        // só libera se o lock ainda for nosso (pode ter expirado)
        await redis.eval(UNLOCK, [key], [token])
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 40))
  }
  throw createError({ statusCode: 503, message: 'Sala ocupada, tente de novo' })
}

export function castVote(redis: Redis, clientId: string, code: string, vote: 'like' | 'dislike') {
  return withSessionLock(redis, code, async () => {
    const session = await getSession(redis, code)
    if (!session || !session.currentSong || !session.clients[clientId]) return null
    if (session.votes.voters.includes(clientId)) return session

    session.votes.voters.push(clientId)
    if (vote === 'like') session.votes.likes++
    else session.votes.dislikes++

    await saveSession(redis, session)
    return session
  })
}
```

Aplicar o mesmo envoltório a `joinSession`, `addToQueue`, `advanceQueue` e `reorderQueue`. Para o clique duplo em "Próxima", o lock não basta: a rota deve receber o `id` da música que o host quer encerrar e não fazer nada se `currentSong.id` já for outro.

### A-02 — Recarregar o host cria outra sala

**Problema e localização:** `app/pages/host.vue:88-94`. O `onMounted` chama `createSession('Host')` incondicionalmente. Um F5, uma queda do Electron ou voltar de `/` para `/host` gera um código novo, e os convidados continuam na sala antiga com a fila que o host não vê mais. O `clientId` do host persiste em `localStorage`, então basta lembrar o código.

**Código atual**

```ts
onMounted(async () => {
  try {
    await createSession('Host')
  } catch {
    sessionFailed.value = true
    return
  }
```

**Código refatorado**

```ts
const { createSession, resumeSession, /* ... */ } = useKaraoke()

onMounted(async () => {
  try {
    const saved = localStorage.getItem('karaoke:hostCode')
    if (!(saved && await resumeSession(saved))) await createSession('Host')
    localStorage.setItem('karaoke:hostCode', session.value!.code)
  } catch {
    sessionFailed.value = true
    return
  }
```

Limite conhecido: se a sala salva expirou e o mesmo código foi sorteado para outro host, este host retoma uma sala alheia e recebe 403 nas ações. Com 331.776 códigos e TTL de 6 h é improvável; a correção definitiva é `GET /api/session/[code]` informar se o `clientId` enviado é o host. Falta também um botão "Nova sala" que limpe a chave.

### A-03 — App Electron empacotado não tem backend

**Problema e localização:** `electron/main.js:23-28` e `package.json:13`. `electron:build` roda `nuxt generate` e carrega `.output/public/index.html` por `file://`. Um build estático não inclui as rotas Nitro, então `$fetch('/api/session/create')` resolve para `file:///api/...` e falha; os assets `/_nuxt/*` têm o mesmo problema de caminho absoluto. A linha 27 ainda depende do interno `window.__nuxtApp`. **Não verificado por execução**: não rodei o build. Se o app empacotado funciona hoje na sua máquina, descarte este item e me diga como.

**Código atual**

```js
} else {
  // Production: Nuxt static output
  win.loadFile(path.join(__dirname, '../.output/public/index.html'))
  win.webContents.on('did-finish-load', () => {
    win.webContents.executeJavaScript("window.__nuxtApp.$router.push('/host')")
  })
}
```

**Código refatorado**

```js
// electron/main.js
// O host é uma casca: a API, o Redis e o Pusher vivem no deploy web.
const HOST_URL = isDev ? 'http://localhost:3000' : 'https://SEU-DEPLOY.vercel.app'

function createWindow() {
  const win = new BrowserWindow({ /* opções inalteradas */ })
  win.loadURL(`${HOST_URL}/host`)
  if (isDev) win.webContents.openDevTools({ mode: 'detach' })
}
```

```jsonc
// package.json
"electron:build": "electron-builder",
"build": { "files": ["electron/**/*"] }
```

O instalador deixa de embutir `.output` e o QR code passa a apontar para o mesmo domínio que os convidados usam, sem depender de `NUXT_PUBLIC_SITE_URL`.

### A-04 — Busca do YouTube esgota a cota

**Problema e localização:** `server/api/youtube/search.get.ts`. Cada chamada custa 100 unidades da cota padrão de 10.000 por dia, ou seja, cerca de 100 buscas diárias somando todas as salas. A rota é pública, não exige sala e não tem cache. Problemas secundários no mesmo arquivo: `q` em array (`?q=a&q=b`) lança `TypeError` (`:5`); `response.json()` roda antes de checar `response.ok` (`:23`); a mensagem de erro do Google é repassada ao cliente (`:26`); o `fetch` não tem timeout; vídeos que proíbem incorporação aparecem nos resultados (ver M-05).

**Código atual**

```ts
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const q = query.q as string
  // ...
  const apiKey = process.env.API_KEY
  // ...
  const response = await fetch(url.toString())
  const data = await response.json() as any
```

**Código refatorado**

```ts
// server/api/youtube/search.get.ts
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
      videoCategoryId: 10,
      videoEmbeddable: 'true', // só vídeos que tocam no player do host
    },
    timeout: 8000,
  }).catch(() => {
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
  maxAge: 60 * 60 * 24, // a mesma música é buscada várias vezes por noite
  getKey: (event) => normalize(getQuery(event).q),
})
```

```ts
// nuxt.config.ts
runtimeConfig: {
  youtubeApiKey: '', // NUXT_YOUTUBE_API_KEY
  public: { /* inalterado */ },
},
```

Em serverless o cache padrão do Nitro fica na memória de cada instância. Para o cache valer entre instâncias, monte o Upstash como storage (`nitro.storage.cache` com o driver `upstash`). Isso reduz o consumo, mas não impede abuso: exigir `code` + `clientId` válidos na busca é o passo seguinte.

### A-05 — Estado desatualizado depois que o celular dorme

**Problema e localização:** `app/composables/useKaraoke.ts:47-71`. O cliente só recebe estado pelo evento `session-update`. Navegadores móveis suspendem o WebSocket quando a tela bloqueia ou a aba vai para segundo plano; o `pusher-js` reconecta, mas os eventos emitidos no intervalo não são reenviados. O convidado volta e vê a música e a fila antigas até alguém provocar outro evento. Num karaokê o celular passa a maior parte do tempo no bolso.

**Código atual**

```ts
if (!pusherClient) {
  pusherClient = new PusherClient(config.public.pusherKey as string, {
    cluster: config.public.pusherCluster as string,
  })
}
```

**Código refatorado**

```ts
if (!pusherClient) {
  pusherClient = new PusherClient(config.public.pusherKey, {
    cluster: config.public.pusherCluster,
  })

  // Eventos perdidos enquanto o socket esteve fora não são reenviados: rebusca o estado.
  const refresh = () => {
    if (!subscribedCode) return
    $fetch<{ session: KaraokeSession }>(`/api/session/${subscribedCode}`)
      .then((data) => { session.value = data.session })
      .catch(() => {})
  }
  pusherClient.connection.bind('connected', refresh)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') refresh()
  })
}
```

Os listeners são registrados uma vez junto do singleton de módulo, então não acumulam entre navegações.

### A-06 — O voto "desmarca" sozinho

**Problema e localização:** `app/pages/room/[code].vue:30`. O watcher observa `currentSong`, um `computed` que devolve `session.value?.currentSong`. Cada `session-update` substitui `session.value` por um objeto novo, então `currentSong` muda de identidade mesmo quando a música é a mesma, e o watcher zera `myVote`. O próprio voto do usuário gera um `session-update`: o botão reabilita e o "Voto registrado!" some logo depois do toque. O servidor ignora o segundo voto (`sessions.ts:160`), então a contagem fica certa, mas a interface mente. `host.vue:119-123` já documenta e evita essa armadilha.

**Código atual**

```ts
// Reset vote when song changes
watch(currentSong, () => { myVote.value = null })
```

**Código refatorado**

```ts
// Observa só o id: session-update troca o objeto mesmo quando a música é a mesma
watch(() => currentSong.value?.id, () => { myVote.value = null })
```

Depois de um reload `myVote` ainda volta a `null`. Para corrigir, guarde o voto em `sessionStorage` com a chave `currentSong.id`.

### A-07 — O código não implementa o `DESIGN.md`

**Problema e localização:** `tailwind.config.ts:7-18`, `app/assets/css/main.css:21-29`, `app/components/AppLogo.vue:8`. O `DESIGN.md` define "The Living Room Rave": void `#060211`, panel `#130924`, neon-pink `#FF007F`, neon-cyan `#00F0FF`, dim `#8B7DA5`, regra "sem cinza puro", "glow, não sombra", títulos em peso 900, botões `rounded-xl`. O código usa `#121212`, `#181818`, `#1ed760`, `#b3b3b3`: são os valores da paleta do Spotify, e o comentário em `main.css:21` diz "Spotify-style text field". Nenhum hex do `DESIGN.md` aparece em `app/`. Também divergem: sombras pretas (`host.vue:172`, `room/[code].vue:123,125,296`), botões `rounded-full`, peso máximo 800, navegação sólida em vez de `bg-panel/60`.

Pela lente de craft, isto é um template: paleta e formas chegaram prontas de outro produto, sem relação com karaokê. O `PRODUCT.md` lista "apps genéricos" como anti-referência. Existe também risco de confusão de marca com o verde e o logotipo circular de play. Se o visual atual foi uma escolha deliberada do commit `9042a58`, o documento errado é o `DESIGN.md` e ele deve ser reescrito; hoje os dois se contradizem e qualquer trabalho de UI parte de uma fonte falsa.

**Código atual**

```ts
// tailwind.config.ts
colors: {
  surface: '#121212',
  elevated: '#181818',
  highlight: '#1f1f1f',
  hover: '#252525',
  muted: '#4d4d4d',
  subdued: '#b3b3b3',
  outline: '#7c7c7c',
  accent: '#1ed760',
  'accent-hover': '#3be477',
  negative: '#f3727f',
},
```

**Código refatorado** (mantém os nomes de token para não tocar nos templates; valores do `DESIGN.md`)

```ts
// tailwind.config.ts
colors: {
  void: '#060211',
  surface: '#0A0618',     // sidebar-void
  elevated: '#130924',    // panel
  highlight: '#1C0F33',
  hover: '#24143F',
  muted: '#3A2A57',
  subdued: '#8B7DA5',     // dim: 5,3:1 sobre surface
  outline: '#5E4F7A',
  accent: '#FF007F',      // neon-pink: ativo, ao vivo, ação primária
  'accent-hover': '#FF3399',
  signal: '#00F0FF',      // neon-cyan: status
  negative: '#f3727f',
},
letterSpacing: { label: '0.15em' },
```

Os tons `highlight`, `hover`, `muted`, `outline` e `accent-hover` são proposta minha, interpolados entre panel e dim; o `DESIGN.md` não os define. Contraste a conferir antes de aplicar: texto preto sobre `#FF007F` dá 5,56:1 e passa; texto branco sobre o mesmo rosa dá 3,78:1 e só serve para texto grande ou negrito. O restante do trabalho é trocar `bg-black` por `bg-void`, as sombras por glow, `rounded-full` por `rounded-xl` nos botões, carregar o peso 900 e refazer o logotipo.

### Notas de UX/UI pelos princípios do HIG (achados Médios e Baixos)

Escopo: é um app web, então valem os princípios e fundamentos do HIG (acessibilidade, tipografia, layout, movimento), e não as convenções de componentes nativos.

- **M-08 Tipografia.** `typography.md` dá 17 pt de padrão e 11 pt de mínimo no iOS. Os rótulos da barra inferior e os selos usam `text-[10.5px]` (`room/[code].vue:268,310`, `host.vue:288`). No host, tempo e contadores estão em 11–12px (`host.vue:335,344`) numa tela lida a metros de distância. Suba os rótulos mobile para 12px e dobre os tamanhos secundários do host. Os tamanhos em `px` fixos também não acompanham o ajuste de fonte do navegador; use `rem`.
- **M-07 Idioma.** O projeto não define `lang` (não conferi qual valor o Nuxt aplica por padrão); sem `pt-BR`, leitores de tela podem ler o português com fonética de outro idioma. Uma linha em `nuxt.config.ts`: `app: { head: { htmlAttrs: { lang: 'pt-BR' } } }`.
- **M-09 Agência.** A reordenação (`host.vue:259-265`) depende de drag and drop HTML5, sem alternativa por teclado e sem funcionar em toque. Botões "subir/descer" por item resolvem os dois casos.
- **Carregamento.** `loading.md`: "Show something as soon as possible." A busca mostra só o texto "Buscando..." e `/room/[code]` fica em branco durante o `resumeSession`. Três linhas-esqueleto na lista de resultados e um estado "Entrando na sala…" bastam.
- **Movimento.** O que existe é discreto e o `main.css:47-54` respeita `prefers-reduced-motion`. Faltam as transições que dariam vida ao produto: troca de aba, entrada de item na fila (`<TransitionGroup>`), troca de música no host. A barra de progresso deve animar `transform: scaleX()` em vez de `width` (B-04).
- **Materiais.** Não há translucidez. O único lugar onde ela se justifica é a barra inferior do convidado, que o `DESIGN.md` já pede como `bg-panel/60`; com `backdrop-blur` ali o conteúdo rola por baixo. Não aplicar blur em cartões de conteúdo.
- **Safe areas.** A barra inferior usa `env(safe-area-inset-bottom)` (`room/[code].vue:303`), mas sem `viewport-fit=cover` esse valor é zero no navegador. Só passa a importar se o app for instalado como PWA (M-15); nesse caso adicione o meta e aplique o inset também ao toast (`:296`) e ao topo.
- **Navegação.** A barra inferior de três abas com estado na URL (`room/[code].vue:7-10`) é o padrão certo. Os botões têm `aria-current`, mas o `<nav>` não tem rótulo e o ícone "Ao Vivo" é um ponto de 8px, bem menor que os outros dois ícones.

**O que já funciona e deve ser preservado:** anel `focus-visible` em todos os botões e links; `<label>` em todos os campos; alvos de toque de 44–48px no celular (`h-11`, `h-12`); `role="alert"` nos erros; `h-dvh` em vez de `100vh` nas telas mobile; `v-show` mantendo o iframe do YouTube montado entre músicas; aba ativa na URL para o botão voltar do celular; atributos de teclado corretos nos campos (`autocapitalize`, `enterkeyhint`, `maxlength`).

## 5. Plano de Ação Sequencial

**Fase 1 — Segurança e bugs visíveis (meio dia)**

- [ ] C-01: remover `clientId` e `addedById` de `serializeSession`; atualizar os tipos em `useKaraoke.ts`.
- [ ] A-06: trocar `watch(currentSong)` por `watch(() => currentSong.value?.id)`.
- [ ] A-02: persistir `karaoke:hostCode` e retomar a sala no `onMounted` do host.
- [ ] A-04: cache, `videoEmbeddable` e validação de `q` na busca; mover a chave para `runtimeConfig`.
- [ ] M-07 e B-02: `lang: 'pt-BR'`; remover a dica "NEON".

**Fase 2 — Robustez do estado (um dia)**

- [ ] A-01: `withSessionLock` em todos os mutadores; `next-song` idempotente por `id` da música.
- [ ] A-05: rebuscar a sessão em `connected` e `visibilitychange`.
- [ ] M-01: validar corpo das rotas (`vote` ∈ {like, dislike}; `name` ≤ 24; `title`/`artist` ≤ 200; `videoId` com `/^[\w-]{11}$/`; `thumbnail` em `https://i.ytimg.com/`).
- [ ] M-02: em `joinSession`, preservar `songsSung` e `isHost` de quem já está na sala.
- [ ] M-03: envolver `pusher.trigger` em `try/catch` e responder 200 com o estado salvo.
- [ ] M-04 e M-05: `catch` em `nextSong`/`reorderQueue` com rollback de `localQueue`; `onError` do player avançando a fila.

**Fase 3 — Distribuição e fundação Nuxt (um dia)**

- [ ] A-03: confirmar o comportamento do build Electron; se quebrado, carregar a URL do deploy.
- [ ] M-13: `routeRules: { '/host': { ssr: false }, '/room/**': { ssr: false } }`. Não pré-renderizar `/join`: ele lê `?code=` no setup e geraria hydration mismatch.
- [ ] M-12: todos os segredos em `runtimeConfig`; criar `.env.example`; documentar `NUXT_PUBLIC_SITE_URL` no README.
- [ ] M-06: `app/error.vue` em português com `clearError({ redirect: '/' })`.
- [ ] M-14: `@nuxt/eslint`, `nuxt typecheck` e um teste unitário para `fairInsertIndex` (única lógica não trivial do servidor).
- [ ] B-05: remover `vercel` de `dependencies` e os no-ops `connect`/`sync`.

**Fase 4 — Produto e design**

- [ ] A-07: decidir entre o visual atual e o `DESIGN.md`; alinhar o que perder.
- [ ] F1 e wake lock (quick wins).
- [ ] M-08, M-09, B-07: tipografia, reordenação por botões, `aria-hidden`/`aria-live`.
- [ ] F3 Placar da noite; F5 Presença real (resolve M-10).
- [ ] M-15, B-03: manifest e ícones; fontes via `@nuxt/fonts`.

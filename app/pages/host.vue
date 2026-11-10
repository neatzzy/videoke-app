<script setup lang="ts">
import type { KaraokeSession, QueueItem } from '~/composables/useKaraoke'

const { createSession, resumeSession, nextSong, session, currentSong, queue, clientCount, reorderQueue, votes } = useKaraoke()

// Local mirror of the queue so a drag or a move button can reorder it live; re-synced from the
// server whenever nothing is being dragged (dragIndex null).
const localQueue = ref<QueueItem[]>([])
const dragIndex = ref<number | null>(null)

watch(queue, (val) => {
  if (dragIndex.value === null) localQueue.value = [...val]
}, { immediate: true })

function onDragStart(idx: number) {
  dragIndex.value = idx
}

function onDragOver(idx: number) {
  if (dragIndex.value === null || dragIndex.value === idx) return
  const items = [...localQueue.value]
  const [moved] = items.splice(dragIndex.value, 1)
  if (!moved) return
  items.splice(idx, 0, moved)
  localQueue.value = items
  dragIndex.value = idx
}

function onDragEnd() {
  if (dragIndex.value === null) return
  dragIndex.value = null
  reorderQueue(localQueue.value.map((item) => item.id)).then((ok) => {
    if (!ok) localQueue.value = [...queue.value]
  })
}

// Botões "Subir"/"Descer": mesmo caminho do arrasto (reorderQueue + rollback).
function moveItem(idx: number, delta: -1 | 1) {
  const target = idx + delta
  if (target < 0 || target >= localQueue.value.length) return
  const items = [...localQueue.value]
  const [moved] = items.splice(idx, 1)
  if (!moved) return
  items.splice(target, 0, moved)
  localQueue.value = items
  reorderQueue(items.map((item) => item.id)).then((ok) => {
    if (!ok) localQueue.value = [...queue.value]
  })
}

// Placar da noite: curtidas recebidas por cantor. `likesReceived` é contrato do servidor
// (ainda ausente no tipo do composable), por isso o campo é opcional aqui.
type SingerClient = KaraokeSession['clients'][number] & { likesReceived?: number }
const ranking = computed(() => {
  const clients = (session.value?.clients ?? []) as SingerClient[]
  return clients
    .filter((c) => !c.isHost && (c.likesReceived ?? 0) > 0)
    .sort((a, b) => (b.likesReceived ?? 0) - (a.likesReceived ?? 0))
    .slice(0, 5)
})

const sessionFailed = ref(false)

const siteUrl = useRuntimeConfig().public.siteUrl || useRequestURL().origin
const joinUrl = computed(() => `${siteUrl}/join?code=${session.value?.code ?? ''}`)

// Big title + QR card for the first seconds of each song, then the compact now-playing bar
const showInfo = ref(false)
let infoTimer: ReturnType<typeof setTimeout>

// Placar do fim da música (5 s) e avanço automático. Some quando a música muda ou o host pula.
const AUTO_ADVANCE_MS = 5000
const endedScore = ref<{ likes: number, dislikes: number } | null>(null)
let advanceTimer: ReturnType<typeof setTimeout> | null = null

function cancelAutoAdvance() {
  if (advanceTimer !== null) clearTimeout(advanceTimer)
  advanceTimer = null
  endedScore.value = null
}

function onSongEnded() {
  // Idempotente: o YouTube pode notificar ENDED mais de uma vez; só uma contagem por música.
  if (advanceTimer !== null || !currentSong.value) return
  endedScore.value = { likes: votes.value.likes, dislikes: votes.value.dislikes }
  advanceTimer = setTimeout(() => {
    advanceTimer = null
    endedScore.value = null
    nextSong()
  }, AUTO_ADVANCE_MS)
}

// Botão "Próxima": cancela a contagem antes de pular, para não avançar duas vezes.
function skipToNext() {
  cancelAutoAdvance()
  nextSong()
}

// Tela sempre acesa (web). No Electron, powerSaveBlocker cuida disso no processo principal.
let wakeLock: WakeLockSentinel | null = null

async function requestWakeLock() {
  if (wakeLock || !('wakeLock' in navigator) || document.visibilityState !== 'visible') return
  try {
    wakeLock = await navigator.wakeLock.request('screen')
    wakeLock.addEventListener('release', () => { wakeLock = null })
  } catch {
    // Negado ou indisponível: a tela pode apagar, o resto do host segue normal.
  }
}

function onVisibilityChange() {
  if (document.visibilityState === 'visible') requestWakeLock()
}

// YouTube IFrame Player (minimal typing of the parts of the API used here)
interface YTPlayer {
  playVideo(): void
  pauseVideo(): void
  loadVideoById(videoId: string): void
  getCurrentTime?(): number
  getDuration?(): number
}
interface YTGlobal { Player: new (el: string, opts: object) => YTPlayer }
type YTWindow = Window & { YT?: YTGlobal, onYouTubeIframeAPIReady?: () => void }
const ytWindow = () => window as YTWindow

let player: YTPlayer | null = null
const playerReady = ref(false)
const isPlaying = ref(false)
const currentTime = ref(0)
const totalDuration = ref(0)

const progress = computed(() =>
  totalDuration.value > 0 ? (currentTime.value / totalDuration.value) * 100 : 0
)

function formatTime(s: number) {
  if (!s || Number.isNaN(s)) return '0:00'
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

function togglePlay() {
  if (!player || !playerReady.value) return
  if (isPlaying.value) player.pauseVideo()
  else player.playVideo()
}

function initPlayer() {
  const YT = import.meta.client ? ytWindow().YT : undefined
  if (!YT) return

  player = new YT.Player('yt-player', {
    height: '100%',
    width: '100%',
    videoId: '',
    playerVars: { autoplay: 1, controls: 0, rel: 0, modestbranding: 1, iv_load_policy: 3, origin: window.location.origin },
    events: {
      onReady: () => { playerReady.value = true },
      // Blocked or unavailable video: skip it so the screen never stalls. With an empty queue this clears currentSong and the error does not repeat.
      onError: () => { if (currentSong.value) nextSong() },
      onStateChange: (e: { data: number }) => {
        // YT.PlayerState.PLAYING = 1
        isPlaying.value = e.data === 1
        // YT.PlayerState.ENDED = 0
        if (e.data === 0) onSongEnded()
      },
    },
  })
}

let progressInterval: ReturnType<typeof setInterval>

onMounted(async () => {
  requestWakeLock()
  document.addEventListener('visibilitychange', onVisibilityChange)

  try {
    // resumeSession resolves false for a missing/expired room, so fall through to a new one
    const saved = localStorage.getItem('karaoke:hostCode')
    if (!(saved && await resumeSession(saved))) await createSession('Host')
    localStorage.setItem('karaoke:hostCode', session.value!.code)
  } catch {
    sessionFailed.value = true
    return
  }

  // Load YouTube IFrame API
  if (!ytWindow().YT) {
    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(script)
    ytWindow().onYouTubeIframeAPIReady = initPlayer
  } else {
    initPlayer()
  }

  progressInterval = setInterval(() => {
    if (player && playerReady.value) {
      currentTime.value = player.getCurrentTime?.() ?? 0
      totalDuration.value = player.getDuration?.() ?? 0
    }
  }, 1000)
})

onUnmounted(() => {
  clearInterval(progressInterval)
  clearTimeout(infoTimer)
  cancelAutoAdvance()
  document.removeEventListener('visibilitychange', onVisibilityChange)
  wakeLock?.release().catch(() => {})
  wakeLock = null
})

// Watch only the song ID — fires solely when the track actually changes,
// not when other session fields (queue, votes) are updated.
// `immediate` so the info phase also runs for a song already in progress on load.
watch(
  () => currentSong.value?.id,
  (newId) => {
    cancelAutoAdvance()
    if (!newId) return
    clearTimeout(infoTimer)
    showInfo.value = true
    infoTimer = setTimeout(() => { showInfo.value = false }, 5000)
    if (!player || !playerReady.value) return
    player.loadVideoById(currentSong.value!.videoId)
    currentTime.value = 0
    totalDuration.value = 0
  },
  { immediate: true }
)

// Load song as soon as the player is ready (handles first song after page load).
watch(playerReady, (ready) => {
  if (ready && player && currentSong.value) {
    player.loadVideoById(currentSong.value.videoId)
  }
})
</script>

<template>
  <div class="h-screen w-screen flex flex-col gap-2 p-2 overflow-hidden bg-black select-none">
    <div class="flex-1 flex gap-2 min-h-0">
      <!-- ═══ MAIN PANEL: player + now singing ═══ -->
      <section aria-label="Palco" class="relative flex-1 flex flex-col min-w-0 rounded-lg bg-surface">
        <header class="flex items-center justify-between px-6 py-4 flex-shrink-0">
          <AppLogo :size="32" text-class="text-lg" />
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2 px-4 py-2 rounded-full bg-highlight text-base font-bold">
              <span class="w-2 h-2 rounded-full bg-accent" aria-hidden="true" />
              {{ clientCount }} online
            </div>
            <div
              v-if="session?.code"
              class="px-5 py-2 rounded-full bg-[#eeeeee] text-[#181818] text-base font-bold tracking-label"
            >
              SALA&nbsp;{{ session.code }}
            </div>
          </div>
        </header>

        <!-- v-show, not v-if: the YouTube iframe must stay mounted between songs -->
        <div v-show="currentSong" class="flex-1 flex flex-col gap-5 px-6 pb-5 min-h-0">
          <!-- Size container: the player is the largest 16:9 box that fits, centered -->
          <div class="relative flex-1 min-h-0 [container-type:size]">
            <div
              class="absolute top-0 left-1/2 -translate-x-1/2 h-[100cqh] w-[min(100cqw,calc(100cqh*16/9))] rounded-lg overflow-hidden
                     bg-gradient-to-br from-[#3a3a3a] to-elevated shadow-[rgba(0,0,0,.5)_0_8px_24px]
                     [&>*]:absolute [&>*]:inset-0 [&>*]:w-full [&>*]:h-full"
            >
              <div id="yt-player" />
            </div>
          </div>

          <div v-if="currentSong && showInfo" class="flex items-end justify-between gap-8 flex-shrink-0">
            <div class="min-w-0">
              <p class="flex items-center gap-2.5 text-sm font-bold tracking-label text-subdued">
                <span class="flex gap-0.5 items-end h-3.5" aria-hidden="true">
                  <i v-for="h in [60, 100, 40, 80]" :key="h" class="w-[3px] bg-accent" :class="isPlaying && 'animate-pulse'" :style="{ height: `${h}%` }" />
                </span>
                AGORA CANTANDO
              </p>
              <h1 class="mt-2 text-[64px] font-extrabold leading-[1.1] truncate">{{ currentSong.title }}</h1>
              <p class="mt-1 text-2xl text-subdued truncate">{{ currentSong.artist }}</p>
              <div class="mt-3 inline-flex items-center gap-2 py-1 pl-1 pr-4 rounded-full bg-highlight">
                <span class="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-base font-bold">
                  {{ currentSong.addedBy.charAt(0).toUpperCase() }}
                </span>
                <span class="text-base font-bold">{{ currentSong.addedBy }}</span>
              </div>
            </div>

            <div v-if="session?.code" class="flex items-center gap-4 py-3 pl-3 pr-4 rounded-lg bg-elevated flex-shrink-0">
              <div class="p-1.5 rounded-md bg-white">
                <QrCode :value="joinUrl" :size="160" />
              </div>
              <div>
                <p class="text-base font-bold">Entre pelo celular</p>
                <p class="mt-1 text-sm text-subdued">Escaneie o QR code ou use o código</p>
                <p class="mt-2 text-base font-bold font-mono tracking-label">{{ session.code }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!currentSong" class="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
          <template v-if="sessionFailed">
            <h1 class="text-2xl font-bold">Não foi possível criar a sala</h1>
            <p class="text-base text-subdued">Verifique sua conexão e recarregue a página.</p>
          </template>
          <template v-else>
            <h1 class="text-2xl font-bold">Nenhuma música tocando</h1>
            <p class="text-base text-subdued">Escaneie o QR code com o celular</p>
            <div v-if="session?.code" class="mt-4 flex items-center gap-10">
              <div class="p-3 rounded-lg bg-white">
                <QrCode :value="joinUrl" :size="220" />
              </div>
              <div class="text-left">
                <p class="text-sm font-bold tracking-label text-subdued">OU DIGITE O CÓDIGO</p>
                <div class="mt-3 px-12 py-4 rounded-full bg-[#eeeeee] text-[#181818] text-5xl font-extrabold tracking-[12px]">
                  {{ session.code }}
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Placar do fim da música: o texto vai também para leitores de tela via região sr-only -->
        <p class="sr-only" aria-live="polite">
          <template v-if="endedScore">Placar final: {{ endedScore.likes }} curtidas, {{ endedScore.dislikes }} não curtiram. Próxima música em instantes.</template>
        </p>
        <div
          v-if="endedScore"
          aria-hidden="true"
          class="absolute inset-0 z-10 flex items-center justify-center bg-surface/90 rounded-lg"
        >
          <div class="text-center px-10 py-8 rounded-lg bg-elevated">
            <p class="text-sm font-bold tracking-label text-subdued">PLACAR FINAL</p>
            <p class="mt-2 text-4xl font-extrabold truncate max-w-[60vw]">{{ currentSong?.title }}</p>
            <div class="mt-6 flex items-center justify-center gap-12">
              <div>
                <p class="text-6xl font-extrabold text-accent">{{ endedScore.likes }}</p>
                <p class="mt-1 text-base text-subdued">curtidas</p>
              </div>
              <div>
                <p class="text-6xl font-extrabold text-negative">{{ endedScore.dislikes }}</p>
                <p class="mt-1 text-base text-subdued">não curtiram</p>
              </div>
            </div>
            <p class="mt-6 text-base text-subdued">Próxima música em instantes</p>
          </div>
        </div>
      </section>

      <!-- ═══ QUEUE PANEL ═══ -->
      <aside aria-label="Fila de músicas" class="w-[340px] flex-shrink-0 flex flex-col rounded-lg bg-surface">
        <div class="flex items-center gap-3 px-5 py-4 text-subdued flex-shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" /></svg>
          <span class="text-base font-bold">Fila</span>
          <span
            v-if="queue.length > 0"
            class="ml-auto px-2 py-0.5 rounded-full bg-highlight text-white text-sm font-bold"
          >
            {{ queue.length }}
          </span>
        </div>

        <div
          v-if="localQueue.length === 0"
          class="flex-1 flex flex-col items-center justify-center gap-2 text-center text-subdued"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 18V5l12-2v13" stroke="currentColor" stroke-width="1.6" />
            <circle cx="6" cy="18" r="3" stroke="currentColor" stroke-width="1.6" />
            <circle cx="18" cy="16" r="3" stroke="currentColor" stroke-width="1.6" />
          </svg>
          <p class="text-base">Nenhuma música adicionada ainda</p>
        </div>

        <div v-else class="flex-1 overflow-y-auto scrollbar-thin px-2 pb-2 flex flex-col gap-0.5 min-h-0">
          <div
            v-for="(item, idx) in localQueue"
            :key="item.id"
            draggable="true"
            :class="[
              'flex items-center gap-3 px-3 py-2 rounded-md cursor-grab active:cursor-grabbing transition-colors',
              idx === 0 ? 'bg-highlight' : 'hover:bg-highlight'
            ]"
            @dragstart="onDragStart(idx)"
            @dragover.prevent="onDragOver(idx)"
            @dragend="onDragEnd"
          >
            <span :class="['w-5 text-center text-base flex-shrink-0', idx === 0 ? 'text-accent font-bold' : 'text-subdued']">
              {{ idx + 1 }}
            </span>
            <img
              v-if="item.thumbnail"
              :src="item.thumbnail"
              alt=""
              draggable="false"
              class="w-10 h-10 rounded object-cover bg-muted flex-shrink-0"
            >
            <div v-else class="w-10 h-10 rounded bg-muted flex-shrink-0" />
            <div class="min-w-0 flex-1">
              <p class="text-base font-bold truncate">{{ item.title }}</p>
              <p class="mt-0.5 text-sm text-subdued truncate">{{ item.addedBy }} · {{ item.artist }}</p>
            </div>
            <span
              v-if="idx === 0"
              class="px-2 py-0.5 rounded-full bg-muted text-sm font-semibold flex-shrink-0"
            >
              Próxima
            </span>
            <div class="flex flex-col gap-0.5 flex-shrink-0">
              <button
                type="button"
                :disabled="idx === 0"
                :aria-label="`Mover ${item.title} para cima`"
                class="w-8 h-8 rounded-md bg-elevated hover:bg-hover flex items-center justify-center transition-colors
                       disabled:opacity-40 disabled:pointer-events-none
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                @click="moveItem(idx, -1)"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 15l6-6 6 6" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
              </button>
              <button
                type="button"
                :disabled="idx === localQueue.length - 1"
                :aria-label="`Mover ${item.title} para baixo`"
                class="w-8 h-8 rounded-md bg-elevated hover:bg-hover flex items-center justify-center transition-colors
                       disabled:opacity-40 disabled:pointer-events-none
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                @click="moveItem(idx, 1)"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- ═══ PLACAR DA NOITE: some enquanto ninguém tem curtidas ═══ -->
        <section
          v-if="ranking.length > 0"
          aria-labelledby="ranking-title"
          class="flex-shrink-0 m-2 mt-0 p-3 rounded-lg bg-elevated"
        >
          <h2 id="ranking-title" class="text-base font-bold">Placar da noite</h2>
          <TransitionGroup
            tag="ol"
            name="rank"
            aria-live="polite"
            class="mt-2 flex flex-col gap-1"
          >
            <li
              v-for="(singer, idx) in ranking"
              :key="singer.name"
              class="flex items-center gap-3 px-2 py-1.5 rounded-md bg-highlight"
            >
              <span :class="['w-5 text-center text-base flex-shrink-0', idx === 0 ? 'text-accent font-bold' : 'text-subdued']">
                {{ idx + 1 }}
              </span>
              <span class="flex-1 min-w-0 text-base font-bold truncate">{{ singer.name }}</span>
              <span class="text-sm font-bold text-accent flex-shrink-0">
                {{ singer.likesReceived }} {{ singer.likesReceived === 1 ? 'curtida' : 'curtidas' }}
              </span>
            </li>
          </TransitionGroup>
        </section>
      </aside>
    </div>

    <!-- ═══ NOW PLAYING BAR ═══ -->
    <!-- Hidden during the info phase so the player gets the room -->
    <footer v-if="!currentSong || !showInfo" aria-label="Reprodução" class="h-[72px] flex-shrink-0 flex items-center gap-6 px-4">
      <template v-if="currentSong">
        <div class="w-[30%] flex items-center gap-3 min-w-0">
          <img
            v-if="currentSong.thumbnail"
            :src="currentSong.thumbnail"
            alt=""
            class="w-12 h-12 rounded-md object-cover bg-muted flex-shrink-0"
          >
          <div v-else class="w-12 h-12 rounded-md bg-muted flex-shrink-0" />
          <div class="min-w-0">
            <p class="text-base font-bold truncate">{{ currentSong.title }}</p>
            <p class="text-sm text-subdued truncate">{{ currentSong.artist }}</p>
          </div>
        </div>

        <div class="flex-1 flex flex-col items-center gap-1.5">
          <div class="flex items-center gap-4">
            <button
              :aria-label="isPlaying ? 'Pausar' : 'Tocar'"
              class="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              @click="togglePlay"
            >
              <svg v-if="isPlaying" width="12" height="12" viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="4" width="4" height="16" fill="#000" /><rect x="14" y="4" width="4" height="16" fill="#000" /></svg>
              <svg v-else width="12" height="12" viewBox="0 0 24 24" aria-hidden="true"><polygon points="7,4 20,12 7,20" fill="#000" /></svg>
            </button>
            <button
              class="h-8 flex items-center gap-2 px-4 rounded-full bg-highlight hover:bg-hover text-base font-bold transition-colors
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              @click="skipToNext"
            >
              Próxima
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
            </button>
          </div>
          <div class="w-full max-w-[560px] flex items-center gap-2 text-base text-subdued">
            <span class="tabular-nums">{{ formatTime(currentTime) }}</span>
            <div class="flex-1 h-1 rounded-sm bg-muted overflow-hidden">
              <div
                class="h-full w-full origin-left rounded-sm bg-accent transition-transform duration-1000 ease-linear"
                :style="{ transform: `scaleX(${progress / 100})` }"
              />
            </div>
            <span class="tabular-nums">{{ formatTime(totalDuration) }}</span>
          </div>
        </div>

        <div class="w-[30%] text-right text-base text-subdued" aria-live="polite">
          {{ queue.length > 0 ? `${queue.length} na fila` : 'Fila vazia' }}
        </div>
      </template>
      <span v-else class="text-base text-subdued">Fila vazia</span>
    </footer>
  </div>
</template>

<style scoped>
/* Reordenação do placar: a linha desliza até a nova posição; reduced-motion é tratado em main.css */
.rank-move {
  transition: transform 400ms ease;
}
.rank-enter-active,
.rank-leave-active {
  transition: opacity 300ms ease;
}
.rank-enter-from,
.rank-leave-to {
  opacity: 0;
}
</style>

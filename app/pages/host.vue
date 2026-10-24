<script setup lang="ts">
import type { QueueItem } from '~/composables/useKaraoke'

const { createSession, nextSong, session, currentSong, queue, clientCount, reorderQueue } = useKaraoke()

// Local mirror of the queue so a drag can reorder it live; re-synced from the
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
  items.splice(idx, 0, moved)
  localQueue.value = items
  dragIndex.value = idx
}

function onDragEnd() {
  if (dragIndex.value === null) return
  dragIndex.value = null
  reorderQueue(localQueue.value.map((item) => item.id))
}

const sessionFailed = ref(false)

const siteUrl = useRuntimeConfig().public.siteUrl || useRequestURL().origin
const joinUrl = computed(() => `${siteUrl}/join?code=${session.value?.code ?? ''}`)

// Big title + QR card for the first seconds of each song, then the compact now-playing bar
const showInfo = ref(false)
let infoTimer: ReturnType<typeof setTimeout>

// YouTube IFrame Player
let player: any = null
const playerReady = ref(false)
const isPlaying = ref(false)
const currentTime = ref(0)
const totalDuration = ref(0)

const progress = computed(() =>
  totalDuration.value > 0 ? (currentTime.value / totalDuration.value) * 100 : 0
)

function formatTime(s: number) {
  if (!s || isNaN(s)) return '0:00'
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

function togglePlay() {
  if (!player || !playerReady.value) return
  isPlaying.value ? player.pauseVideo() : player.playVideo()
}

function initPlayer() {
  if (!import.meta.client || !(window as any).YT) return

  player = new (window as any).YT.Player('yt-player', {
    height: '100%',
    width: '100%',
    videoId: '',
    playerVars: { autoplay: 1, controls: 0, rel: 0, modestbranding: 1, iv_load_policy: 3, origin: window.location.origin },
    events: {
      onReady: () => { playerReady.value = true },
      onStateChange: (e: any) => {
        // YT.PlayerState.PLAYING = 1
        isPlaying.value = e.data === 1
        // YT.PlayerState.ENDED = 0
        if (e.data === 0) {
          // Song ended — can auto-advance here if desired
        }
      },
    },
  })
}

let progressInterval: ReturnType<typeof setInterval>

onMounted(async () => {
  try {
    await createSession('Host')
  } catch {
    sessionFailed.value = true
    return
  }

  // Load YouTube IFrame API
  if (!(window as any).YT) {
    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(script)
    ;(window as any).onYouTubeIframeAPIReady = initPlayer
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
})

// Watch only the song ID — fires solely when the track actually changes,
// not when other session fields (queue, votes) are updated.
// `immediate` so the info phase also runs for a song already in progress on load.
watch(
  () => currentSong.value?.id,
  (newId) => {
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
  if (ready && currentSong.value) {
    player.loadVideoById(currentSong.value.videoId)
  }
})
</script>

<template>
  <div class="h-screen w-screen flex flex-col gap-2 p-2 overflow-hidden bg-black select-none">
    <div class="flex-1 flex gap-2 min-h-0">
      <!-- ═══ MAIN PANEL: player + now singing ═══ -->
      <section class="flex-1 flex flex-col min-w-0 rounded-lg bg-surface">
        <header class="flex items-center justify-between px-6 py-4 flex-shrink-0">
          <AppLogo :size="32" text-class="text-lg" />
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2 px-4 py-2 rounded-full bg-highlight text-sm font-bold">
              <span class="w-2 h-2 rounded-full bg-accent" />
              {{ clientCount }} online
            </div>
            <div
              v-if="session?.code"
              class="px-5 py-2 rounded-full bg-[#eeeeee] text-[#181818] text-sm font-bold tracking-label"
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
              <p class="flex items-center gap-2.5 text-xs font-bold tracking-label text-subdued">
                <span class="flex gap-0.5 items-end h-3.5" aria-hidden="true">
                  <i v-for="h in [60, 100, 40, 80]" :key="h" class="w-[3px] bg-accent" :class="isPlaying && 'animate-pulse'" :style="{ height: `${h}%` }" />
                </span>
                AGORA CANTANDO
              </p>
              <h1 class="mt-2 text-[64px] font-extrabold leading-[1.1] truncate">{{ currentSong.title }}</h1>
              <p class="mt-1 text-2xl text-subdued truncate">{{ currentSong.artist }}</p>
              <div class="mt-3 inline-flex items-center gap-2 py-1 pl-1 pr-4 rounded-full bg-highlight">
                <span class="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
                  {{ currentSong.addedBy.charAt(0).toUpperCase() }}
                </span>
                <span class="text-sm font-bold">{{ currentSong.addedBy }}</span>
              </div>
            </div>

            <div v-if="session?.code" class="flex items-center gap-4 py-3 pl-3 pr-4 rounded-lg bg-elevated flex-shrink-0">
              <div class="p-1.5 rounded-md bg-white">
                <QrCode :value="joinUrl" :size="160" />
              </div>
              <div>
                <p class="text-base font-bold">Entre pelo celular</p>
                <p class="mt-1 text-sm text-subdued">Escaneie o QR code ou use o código</p>
                <p class="mt-2 text-sm font-bold font-mono tracking-label">{{ session.code }}</p>
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
                <p class="text-xs font-bold tracking-label text-subdued">OU DIGITE O CÓDIGO</p>
                <div class="mt-3 px-12 py-4 rounded-full bg-[#eeeeee] text-[#181818] text-5xl font-extrabold tracking-[12px]">
                  {{ session.code }}
                </div>
              </div>
            </div>
          </template>
        </div>
      </section>

      <!-- ═══ QUEUE PANEL ═══ -->
      <aside class="w-[280px] flex-shrink-0 flex flex-col rounded-lg bg-surface">
        <div class="flex items-center gap-3 px-5 py-4 text-subdued flex-shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" /></svg>
          <span class="text-base font-bold">Fila</span>
          <span
            v-if="queue.length > 0"
            class="ml-auto px-2 py-0.5 rounded-full bg-highlight text-white text-xs font-bold"
          >
            {{ queue.length }}
          </span>
        </div>

        <div
          v-if="localQueue.length === 0"
          class="flex-1 flex flex-col items-center justify-center gap-2 text-center text-subdued"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M9 18V5l12-2v13" stroke="currentColor" stroke-width="1.6" />
            <circle cx="6" cy="18" r="3" stroke="currentColor" stroke-width="1.6" />
            <circle cx="18" cy="16" r="3" stroke="currentColor" stroke-width="1.6" />
          </svg>
          <p class="text-sm">Nenhuma música adicionada ainda</p>
        </div>

        <div v-else class="flex-1 overflow-y-auto scrollbar-thin px-2 pb-2 flex flex-col gap-0.5">
          <div
            v-for="(item, idx) in localQueue"
            :key="item.id"
            draggable="true"
            @dragstart="onDragStart(idx)"
            @dragover.prevent="onDragOver(idx)"
            @dragend="onDragEnd"
            :class="[
              'flex items-center gap-3 px-3 py-2 rounded-md cursor-grab active:cursor-grabbing transition-colors',
              idx === 0 ? 'bg-highlight' : 'hover:bg-highlight'
            ]"
          >
            <span :class="['w-5 text-center text-sm flex-shrink-0', idx === 0 ? 'text-accent font-bold' : 'text-subdued']">
              {{ idx + 1 }}
            </span>
            <img
              v-if="item.thumbnail"
              :src="item.thumbnail"
              alt=""
              draggable="false"
              class="w-10 h-10 rounded object-cover bg-muted flex-shrink-0"
            />
            <div v-else class="w-10 h-10 rounded bg-muted flex-shrink-0" />
            <div class="min-w-0">
              <p class="text-sm font-bold truncate">{{ item.title }}</p>
              <p class="mt-0.5 text-xs text-subdued truncate">{{ item.addedBy }} · {{ item.artist }}</p>
            </div>
            <span
              v-if="idx === 0"
              class="ml-auto px-2 py-0.5 rounded-full bg-muted text-[10.5px] font-semibold flex-shrink-0"
            >
              Próxima
            </span>
          </div>
        </div>
      </aside>
    </div>

    <!-- ═══ NOW PLAYING BAR ═══ -->
    <!-- Hidden during the info phase so the player gets the room -->
    <footer v-if="!currentSong || !showInfo" class="h-[72px] flex-shrink-0 flex items-center gap-6 px-4">
      <template v-if="currentSong">
        <div class="w-[30%] flex items-center gap-3 min-w-0">
          <img
            v-if="currentSong.thumbnail"
            :src="currentSong.thumbnail"
            alt=""
            class="w-12 h-12 rounded-md object-cover bg-muted flex-shrink-0"
          />
          <div v-else class="w-12 h-12 rounded-md bg-muted flex-shrink-0" />
          <div class="min-w-0">
            <p class="text-sm font-bold truncate">{{ currentSong.title }}</p>
            <p class="text-xs text-subdued truncate">{{ currentSong.artist }}</p>
          </div>
        </div>

        <div class="flex-1 flex flex-col items-center gap-1.5">
          <div class="flex items-center gap-4">
            <button
              @click="togglePlay"
              :aria-label="isPlaying ? 'Pausar' : 'Tocar'"
              class="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <svg v-if="isPlaying" width="12" height="12" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" fill="#000" /><rect x="14" y="4" width="4" height="16" fill="#000" /></svg>
              <svg v-else width="12" height="12" viewBox="0 0 24 24"><polygon points="7,4 20,12 7,20" fill="#000" /></svg>
            </button>
            <button
              @click="nextSong()"
              class="h-8 flex items-center gap-2 px-4 rounded-full bg-highlight hover:bg-hover text-sm font-bold transition-colors
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Próxima
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
            </button>
          </div>
          <div class="w-full max-w-[560px] flex items-center gap-2 text-[11px] text-subdued">
            <span>{{ formatTime(currentTime) }}</span>
            <div class="flex-1 h-1 rounded-sm bg-muted overflow-hidden">
              <div class="h-full rounded-sm bg-accent transition-all duration-1000" :style="{ width: `${progress}%` }" />
            </div>
            <span>{{ formatTime(totalDuration) }}</span>
          </div>
        </div>

        <div class="w-[30%] text-right text-xs text-subdued">
          {{ queue.length > 0 ? `${queue.length} na fila` : 'Fila vazia' }}
        </div>
      </template>
      <span v-else class="text-xs text-subdued">Fila vazia</span>
    </footer>
  </div>
</template>

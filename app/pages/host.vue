<script setup lang="ts">
const { createSession, nextSong, session, currentSong, queue, votes, clientCount } = useKaraoke()

const sessionFailed = ref(false)

// YouTube IFrame Player
let player: any = null
const playerReady = ref(false)
const currentTime = ref(0)
const totalDuration = ref(0)

const progress = computed(() =>
  totalDuration.value > 0 ? (currentTime.value / totalDuration.value) * 100 : 0
)

function formatTime(s: number) {
  if (!s || isNaN(s)) return '0:00'
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

const eqBars: number[] = [60, 100, 40, 80, 55]

function initPlayer() {
  if (!import.meta.client || !(window as any).YT) return

  player = new (window as any).YT.Player('yt-player', {
    height: '100%',
    width: '100%',
    videoId: '',
    playerVars: { autoplay: 1, controls: 0, rel: 0, modestbranding: 1, iv_load_policy: 3 },
    events: {
      onReady: () => { playerReady.value = true },
      onStateChange: (e: any) => {
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

onUnmounted(() => clearInterval(progressInterval))

// Watch only the song ID — fires solely when the track actually changes,
// not when other session fields (queue, votes) are updated.
watch(
  () => currentSong.value?.id,
  (newId) => {
    if (!newId) return
    if (player && playerReady.value) {
      player.loadVideoById(currentSong.value!.videoId)
      currentTime.value = 0
      totalDuration.value = 0
    }
  }
)

// Load song as soon as the player is ready (handles first song after page load).
watch(playerReady, (ready) => {
  if (ready && currentSong.value) {
    player.loadVideoById(currentSong.value.videoId)
  }
})
</script>

<template>
  <div class="h-screen w-screen flex overflow-hidden bg-void select-none">
    <!-- ═══ LEFT COLUMN: Player (82%) ═══ -->
    <div class="flex flex-col" style="width: 82%">
      <!-- Navbar -->
      <nav class="flex items-center justify-between px-6 py-3 bg-panel/60 border-b border-dim/10 flex-shrink-0">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-button-gradient-start to-button-gradient-end
                      border border-neon-pink/40 flex items-center justify-center shrink-0">
            <svg width="10" height="10" viewBox="0 0 13 13"><polygon points="3,1 12,6.5 3,12" fill="#FF007F" /></svg>
          </div>
          <span class="font-black tracking-widest text-sm">VIDEOKÉ</span>
        </div>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 text-neon-cyan text-xs">
            <span class="w-2 h-2 rounded-full bg-neon-cyan" style="box-shadow: 0 0 0 3px rgba(0,240,255,0.18)" />
            <span>{{ clientCount }} online</span>
          </div>
          <div
            v-if="session?.code"
            class="px-4 py-1.5 rounded-full bg-black text-lg font-mono font-bold tracking-widest neon-border-pink"
          >
            SALA&nbsp;{{ session.code }}
          </div>
        </div>
      </nav>

      <!-- Song Header -->
      <div class="px-8 py-4 flex-shrink-0">
        <template v-if="currentSong">
          <!-- Equalizer + label -->
          <div class="flex items-center gap-2 mb-2">
            <div class="flex gap-0.5 items-end h-4">
              <div v-for="(h, i) in eqBars" :key="i"
                class="w-1 bg-neon-pink rounded-sm animate-pulse"
                :style="{ height: `${h}%`, animationDelay: `${i * 0.1}s` }"
              />
            </div>
            <span class="text-[10px] text-dim uppercase tracking-[0.15em] font-semibold">Agora Cantando</span>
          </div>

          <h1 class="text-5xl font-black text-white text-glow-pink leading-tight truncate">
            {{ currentSong.title }}
          </h1>
          <p class="text-xl text-neon-cyan mt-1 text-glow-cyan truncate">{{ currentSong.artist }}</p>

          <!-- Singer badge -->
          <div class="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-panel/80 border border-dim/20">
            <div class="w-7 h-7 rounded-full bg-neon-pink/20 border border-neon-pink/40 flex items-center justify-center text-xs font-bold text-neon-pink">
              {{ currentSong?.addedBy.charAt(0).toUpperCase() }}
            </div>
            <span class="text-sm text-white/90">{{ currentSong.addedBy }}</span>
          </div>

          <!-- Live votes -->
          <div class="mt-2 flex items-center gap-4 ml-1">
            <span class="flex items-center gap-1.5 text-green-400 font-bold text-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 9l-6-6-6 6M12 4v16" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
              {{ votes.likes }}
            </span>
            <span class="flex items-center gap-1.5 text-red-400 font-bold text-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 15l-6 6-6-6M12 20V4" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
              {{ votes.dislikes }}
            </span>
          </div>
        </template>

        <template v-else-if="sessionFailed">
          <h2 class="text-3xl font-black text-neon-pink">Não foi possível criar a sala</h2>
          <p class="text-sm text-dim/80 mt-1">Verifique sua conexão e recarregue a página.</p>
        </template>

        <template v-else>
          <h2 class="text-3xl font-black text-dim">Aguardando músicas...</h2>
          <p class="text-sm text-dim/80 mt-1">
            Compartilhe o código
            <span class="text-neon-cyan font-mono font-bold text-lg text-glow-cyan">{{ session?.code }}</span>
            com seus amigos
          </p>
        </template>
      </div>

      <!-- YouTube Player Area -->
      <div class="flex-1 bg-black relative min-h-0">
        <div id="yt-player" class="absolute inset-0 w-full h-full" />

        <!-- Placeholder when no song -->
        <div
          v-if="!currentSong"
          class="absolute inset-0 flex flex-col items-center justify-center gap-4 text-dim"
        >
          <svg width="72" height="72" viewBox="0 0 24 24" fill="none" class="opacity-30">
            <rect x="3" y="6" width="14" height="12" rx="2" stroke="#8B7DA5" stroke-width="1.5" />
            <path d="M21 8.5v7l-4-2.3v-2.4l4-2.3z" fill="#8B7DA5" />
          </svg>
          <p class="text-sm tracking-[0.15em] opacity-50">NENHUMA MÚSICA TOCANDO</p>
        </div>
      </div>

      <!-- Progress Bar -->
      <div v-if="currentSong" class="px-5 py-2 bg-panel/40 flex-shrink-0">
        <div class="relative h-1 bg-dim/20 rounded-full overflow-hidden">
          <div
            class="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-neon-pink to-violet-glow transition-all duration-1000"
            :style="{ width: `${progress}%` }"
          />
        </div>
        <div class="flex justify-between text-[10px] text-dim mt-1">
          <span>{{ formatTime(currentTime) }}</span>
          <span>{{ formatTime(totalDuration) }}</span>
        </div>
      </div>

      <!-- Footer Controls -->
      <div class="px-6 py-3 flex items-center justify-between bg-panel/30 border-t border-dim/10 flex-shrink-0">
        <span class="text-xs text-dim">
          {{ queue.length > 0 ? `${queue.length} na fila` : 'Fila vazia' }}
        </span>
        <button
          v-if="queue.length > 0 || currentSong"
          @click="nextSong()"
          class="flex items-center gap-2 px-5 py-2 rounded-xl bg-panel border border-dim/30 text-xs font-semibold
                 hover:border-neon-pink/50 hover:text-neon-pink transition-colors
                 focus:outline-none focus-visible:border-neon-pink/50 focus-visible:text-neon-pink
                 focus-visible:ring-2 focus-visible:ring-neon-pink/40 focus-visible:ring-offset-2 focus-visible:ring-offset-panel"
        >
          Próxima
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </button>
      </div>
    </div>

    <!-- ═══ RIGHT COLUMN: Queue Sidebar (18%) ═══ -->
    <div class="flex flex-col bg-sidebar-void border-l border-dim/10" style="width: 18%">
      <!-- Header -->
      <div class="flex items-center gap-2 px-4 py-4 border-b border-dim/10 flex-shrink-0">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h10" stroke="#8B7DA5" stroke-width="2.2" stroke-linecap="round" /></svg>
        <span class="text-xs font-bold uppercase tracking-[0.15em] text-dim">Fila</span>
        <span
          v-if="queue.length > 0"
          class="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-neon-pink/20 text-neon-pink font-bold"
        >
          {{ queue.length }}
        </span>
      </div>

      <!-- Queue Items -->
      <div class="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2">
        <div
          v-if="queue.length === 0"
          class="flex flex-col items-center justify-center h-full text-center text-dim/90 gap-2"
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" class="opacity-60">
            <path d="M9 18V5l12-2v13" stroke="#8B7DA5" stroke-width="1.6" />
            <circle cx="6" cy="18" r="3" stroke="#8B7DA5" stroke-width="1.6" />
            <circle cx="18" cy="16" r="3" stroke="#8B7DA5" stroke-width="1.6" />
          </svg>
          <p class="text-[10px] leading-relaxed">Nenhuma música<br>adicionada ainda</p>
        </div>

        <!-- Next up: highlighted -->
        <div
          v-if="queue[0]"
          class="p-3.5 rounded-2xl bg-gradient-to-br from-neon-pink/15 to-neon-pink/5 border border-neon-pink/30"
        >
          <span class="text-[10px] font-bold uppercase tracking-[0.15em] text-neon-pink">Próxima</span>
          <p class="text-sm font-bold text-white mt-1.5 mb-0.5 leading-tight truncate">{{ queue[0]?.title ?? '' }}</p>
          <p class="text-[11px] text-dim truncate">{{ queue[0]?.addedBy ?? '' }} · {{ queue[0]?.artist ?? '' }}</p>
        </div>

        <div
          v-for="(item, idx) in queue.slice(1)"
          :key="item.id"
          class="flex items-start gap-2 p-2.5 rounded-lg bg-void/60 hover:bg-void/80 transition-colors"
        >
          <div class="w-5 h-5 rounded-full bg-neon-pink/15 border border-neon-pink/30 flex items-center justify-center text-[10px] font-bold text-neon-pink flex-shrink-0 mt-0.5">
            {{ idx + 2 }}
          </div>
          <div class="min-w-0">
            <p class="text-[11px] font-bold text-white truncate leading-tight">{{ item.title }}</p>
            <p class="text-[10px] text-dim truncate mt-0.5">{{ item.addedBy }} · {{ item.artist }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

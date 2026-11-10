<script setup lang="ts">
const route = useRoute()
const { session, currentSong, queue, votes, previousVotes, error, addSong, removeSong, isMine, vote, resumeSession } = useKaraoke()
const { enabled: hapticOn, supported: hapticSupported, toggle: toggleHaptic, play: playHaptic } = useHaptic()

type Tab = 'live' | 'search' | 'queue'
// Tab lives in the URL so the phone's back button returns to the previous tab instead of leaving the room
const activeTab = computed<Tab>({
  get: () => (['search', 'queue'].includes(route.query.tab as string) ? route.query.tab as Tab : 'live'),
  set: (tab) => { navigateTo({ query: tab === 'live' ? {} : { tab } }) },
})

// Ícone da aba: "Ao Vivo" troca o contorno pelo disco cheio quando ativa
function tabIcon(tab: Tab) {
  if (tab === 'live') return activeTab.value === 'live' ? 'live-fill' as const : 'live' as const
  return tab === 'search' ? 'search' as const : 'list' as const
}

const isPlaying = computed(() => session.value?.status === 'playing')

// My vote state
const myVote = ref<'like' | 'dislike' | null>(null)

// Search
const searchQuery = ref('')
const searchResults = ref<{ videoId: string; title: string; artist: string; thumbnail: string }[]>([])
const searching = ref(false)
const addedIds = ref<Set<string>>(new Set())

const resuming = ref(false)
onMounted(async () => {
  // Session survives client-side navigation (module-level useState) but not a
  // hard reload — resume it from the URL's room code before giving up on it.
  if (session.value) return
  resuming.value = true
  const ok = await resumeSession(route.params.code as string).finally(() => { resuming.value = false })
  if (!ok) navigateTo('/join')
})

// Reset vote only when the song id changes; session-update re-creates the object and would clear it otherwise
watch(() => currentSong.value?.id, () => { myVote.value = null })

async function search() {
  if (!searchQuery.value.trim()) return
  searching.value = true
  try {
    const { items } = await $fetch<{ items: typeof searchResults.value }>('/api/youtube/search', {
      params: { q: searchQuery.value },
    })
    searchResults.value = items
  } catch {
    flashError('Não foi possível buscar. Verifique sua conexão.')
  } finally {
    searching.value = false
  }
}

// Toast de erro: fica até 8 s ou até o toque em fechar; pausa enquanto o ponteiro ou o foco está nele.
const ERROR_MS = 8000
let errorTimer: ReturnType<typeof setTimeout> | undefined
let errorLeft = ERROR_MS
let errorStart = 0
let errorHolds = 0

function armError() {
  errorStart = Date.now()
  errorTimer = setTimeout(clearError, errorLeft)
}

function clearError() {
  clearTimeout(errorTimer)
  errorTimer = undefined
  errorLeft = ERROR_MS
  errorHolds = 0
  error.value = null
}

function holdError() {
  if (errorHolds++ > 0) return
  if (!errorTimer) return
  clearTimeout(errorTimer)
  errorTimer = undefined
  errorLeft -= Date.now() - errorStart
}

function releaseError() {
  if (errorHolds === 0 || --errorHolds > 0) return
  armError()
}

function flashError(message: string) {
  error.value = message
  clearTimeout(errorTimer)
  errorTimer = undefined
  errorLeft = ERROR_MS
  if (errorHolds === 0) armError()
}

// Erro deixado por outra página (ex.: join) não tem timer: arma aqui
onMounted(() => { if (error.value) armError() })
onUnmounted(() => clearTimeout(errorTimer))

async function addToQueue(item: (typeof searchResults.value)[number]) {
  try {
    await addSong({ videoId: item.videoId, title: item.title, artist: item.artist, thumbnail: item.thumbnail, duration: '' })
    addedIds.value.add(item.videoId)
    playHaptic('add')
    activeTab.value = 'queue'
  } catch {
    flashError('Não foi possível adicionar a música. Tente de novo.')
  }
}

// Evita toque duplo enquanto a remoção está em andamento
const removingId = ref<string | null>(null)
async function removeFromQueue(item: { id: string; title: string }) {
  if (removingId.value) return
  removingId.value = item.id
  const ok = await removeSong(item.id)
  removingId.value = null
  if (ok) playHaptic('remove')
  else flashError('Não foi possível remover a música. Tente de novo.')
}

async function castVote(v: 'like' | 'dislike') {
  if (myVote.value) return
  myVote.value = v
  playHaptic(v)
  try {
    await vote(v)
  } catch {
    myVote.value = null
    flashError('Não foi possível registrar seu voto.')
  }
}
</script>

<template>
  <div class="h-dvh flex flex-col bg-surface overflow-hidden">
    <div class="mx-auto flex min-h-0 w-full max-w-xl flex-1 flex-col">
      <!-- Top bar -->
      <header class="page-x page-top pb-3 flex items-center gap-3 flex-shrink-0 [@media(max-height:500px)]:pt-2 [@media(max-height:500px)]:pb-1">
        <span v-if="session?.code" class="px-3 py-1 rounded-full bg-highlight text-xs font-bold font-mono tracking-[2px]">
          {{ session.code }}
        </span>
        <button
          v-if="hapticSupported"
          type="button"
          aria-label="Vibração"
          :aria-pressed="hapticOn"
          :class="[
            'ml-auto -mr-2 w-11 h-11 rounded-full flex items-center justify-center transition-colors duration-fast ease-standard',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-white',
            hapticOn ? 'text-accent' : 'text-subdued hover:text-white'
          ]"
          @click="toggleHaptic"
        >
          <AppIcon :name="hapticOn ? 'vibrate' : 'vibrate-off'" :size="20" />
        </button>
      </header>

      <!-- Content area (scrollable) -->
      <main class="page-x min-h-0 flex-1 overflow-y-auto scrollbar-thin pt-2 pb-4 [@media(max-height:500px)]:pt-1">
        <div class="relative">
          <Transition name="tab">
            <div :key="resuming ? 'resuming' : activeTab">

              <!-- ══ RESUMING ══ -->
              <p v-if="resuming" role="status" class="py-16 text-center text-sm text-subdued animate-pulse">Entrando na sala…</p>

              <!-- ══ TAB: AO VIVO ══ -->
              <template v-else-if="activeTab === 'live'">

                <!-- Previous votes result -->
                <Transition name="fade">
                  <div
                    v-if="previousVotes"
                    class="mb-4 p-4 rounded-lg bg-elevated flex items-center justify-between"
                  >
                    <span class="text-xs font-bold tracking-label text-subdued uppercase">Última performance</span>
                    <div class="flex gap-4 text-sm font-bold">
                      <span class="flex items-center gap-1.5 text-accent">
                        <AppIcon name="arrow-up" :size="16" />
                        {{ previousVotes.likes }}
                      </span>
                      <span class="flex items-center gap-1.5 text-negative">
                        <AppIcon name="arrow-down" :size="16" />
                        {{ previousVotes.dislikes }}
                      </span>
                    </div>
                  </div>
                </Transition>

                <!-- Current Song -->
                <div v-if="currentSong">
                  <p class="flex items-center gap-2 text-xs font-bold tracking-label text-subdued">
                    <Equalizer :playing="isPlaying" :bars="4" size="sm" />
                    AGORA CANTANDO
                  </p>

                  <img
                    v-if="currentSong.thumbnail"
                    :src="currentSong.thumbnail"
                    alt=""
                    class="mt-3 w-full aspect-video object-cover rounded-lg bg-muted shadow-[rgba(0,0,0,.5)_0_8px_24px]"
                  >
                  <div v-else class="mt-3 w-full aspect-video rounded-lg bg-gradient-to-b from-muted to-elevated shadow-[rgba(0,0,0,.5)_0_8px_24px]" />

                  <h2 class="mt-4 text-2xl font-bold leading-tight line-clamp-2">{{ currentSong.title }}</h2>
                  <p class="mt-1 text-sm text-subdued">{{ currentSong.artist }}</p>
                  <div class="mt-3 inline-flex items-center gap-2 py-1 pl-1 pr-3 rounded-full bg-highlight">
                    <span class="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                      {{ currentSong.addedBy.charAt(0).toUpperCase() }}
                    </span>
                    <span class="text-sm font-bold">{{ currentSong.addedBy }}</span>
                  </div>

                  <!-- Vote buttons -->
                  <div class="mt-5 grid grid-cols-2 gap-3">
                    <button
                      :disabled="!!myVote"
                      :class="[
                        'h-12 rounded-full bg-accent text-black text-sm font-bold flex items-center justify-center gap-2 transition-[transform,background-color,border-color,opacity] duration-fast ease-standard',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
                        myVote === 'dislike' ? 'opacity-40' : 'enabled:hover:bg-accent-hover enabled:active:scale-95',
                        myVote && 'cursor-not-allowed'
                      ]"
                      @click="castVote('like')"
                    >
                      <AppIcon name="thumbs-up" :size="16" />
                      Curtir
                    </button>
                    <button
                      :disabled="!!myVote"
                      :class="[
                        'h-12 rounded-full bg-transparent border text-negative text-sm font-bold flex items-center justify-center gap-2 transition-[transform,background-color,border-color,opacity] duration-fast ease-standard',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
                        myVote === 'dislike' ? 'border-white' : 'border-outline',
                        myVote === 'like' ? 'opacity-40' : 'enabled:hover:border-white enabled:active:scale-95',
                        myVote && 'cursor-not-allowed'
                      ]"
                      @click="castVote('dislike')"
                    >
                      <AppIcon name="thumbs-down" :size="16" />
                      Não curtir
                    </button>
                  </div>

                  <p class="mt-3 text-center text-sm text-subdued" aria-live="polite">
                    <template v-if="myVote">Voto registrado! · </template>
                    {{ votes.total }} votos · {{ votes.likes }} curtidas · {{ votes.dislikes }} não curtidas
                  </p>
                </div>

                <!-- No song playing -->
                <div v-else class="flex flex-col items-center justify-center py-16 text-center gap-2">
                  <h2 class="text-2xl font-bold">Nenhuma música tocando</h2>
                  <p class="text-sm text-subdued">Adicione uma música na fila!</p>
                  <button
                    class="mt-6 px-8 py-3.5 rounded-full bg-accent hover:bg-accent-hover text-black text-sm font-bold tracking-label uppercase transition-colors duration-fast ease-standard
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                    @click="activeTab = 'search'"
                  >
                    Buscar música
                  </button>
                </div>
              </template>

              <!-- ══ TAB: BUSCAR ══ -->
              <template v-else-if="activeTab === 'search'">
                <form class="sticky top-0 bg-surface pb-2" @submit.prevent="search">
                  <label
                    class="flex items-center gap-3 px-4 py-3 rounded-full bg-highlight transition-shadow duration-fast ease-standard
                           shadow-[rgb(18,18,18)_0_1px_0,rgb(124,124,124)_0_0_0_1px_inset] focus-within:shadow-[#fff_0_0_0_2px_inset]"
                  >
                    <AppIcon name="search" :size="18" :class="['flex-shrink-0 text-subdued', searching && 'animate-pulse']" />
                    <input
                      v-model="searchQuery"
                      type="search"
                      enterkeyhint="search"
                      aria-label="Buscar música no YouTube"
                      placeholder="Buscar música no YouTube..."
                      class="flex-1 min-w-0 bg-transparent text-base text-white placeholder-subdued focus:outline-none"
                    >
                  </label>
                </form>

                <p v-if="searching || searchResults.length" class="mt-3 mb-2 text-base font-bold">
                  {{ searching ? 'Buscando...' : 'Resultados' }}
                </p>

                <div v-if="searching" class="flex flex-col gap-0.5" aria-hidden="true">
                  <div v-for="n in 3" :key="n" class="flex items-center gap-3 p-2 animate-pulse">
                    <div class="w-14 h-10 rounded bg-highlight flex-shrink-0" />
                    <div class="flex-1 min-w-0 flex flex-col gap-2">
                      <div class="h-3 w-3/4 rounded bg-highlight" />
                      <div class="h-2.5 w-1/2 rounded bg-highlight" />
                    </div>
                  </div>
                </div>

                <div v-else class="flex flex-col gap-0.5">
                  <div
                    v-for="item in searchResults"
                    :key="item.videoId"
                    class="flex items-center gap-3 p-2 rounded-md hover:bg-hover transition-colors duration-fast ease-standard"
                  >
                    <img
                      :src="item.thumbnail"
                      alt=""
                      class="w-14 h-10 object-cover rounded flex-shrink-0 bg-muted"
                    >
                    <div class="flex-1 min-w-0">
                      <p class="text-base font-bold truncate">{{ item.title }}</p>
                      <p class="mt-0.5 text-sm text-subdued truncate">{{ item.artist }}</p>
                    </div>
                    <span
                      v-if="addedIds.has(item.videoId)"
                      role="img"
                      :aria-label="`${item.title} já está na fila`"
                      class="w-11 h-11 rounded-full bg-accent text-black flex items-center justify-center flex-shrink-0"
                    >
                      <AppIcon name="check" :size="16" />
                    </span>
                    <button
                      v-else
                      :aria-label="`Adicionar ${item.title} à fila`"
                      class="h-11 px-4 rounded-full border border-outline hover:border-white text-xs font-bold flex-shrink-0 transition-colors duration-fast ease-standard
                             focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                      @click="addToQueue(item)"
                    >
                      + Fila
                    </button>
                  </div>

                  <p
                    v-if="searchResults.length === 0 && !searching && searchQuery"
                    class="text-center text-subdued text-sm py-8"
                  >
                    Nenhum resultado
                  </p>
                </div>
              </template>

              <!-- ══ TAB: FILA ══ -->
              <template v-else-if="activeTab === 'queue'">
                <h2 class="text-2xl font-bold mb-4">Fila</h2>

                <!-- Currently playing -->
                <div v-if="currentSong" class="flex items-center gap-3 p-3 mb-2 rounded-lg bg-hover">
                  <Equalizer :playing="isPlaying" :bars="3" class="w-5 justify-center flex-shrink-0" />
                  <div class="min-w-0">
                    <p class="text-base font-bold text-accent truncate">{{ currentSong.title }}</p>
                    <p class="mt-0.5 text-sm text-subdued truncate">{{ currentSong.addedBy }} · {{ currentSong.artist }}</p>
                  </div>
                  <span class="ml-auto px-2 py-0.5 rounded-full bg-highlight text-xs font-semibold flex-shrink-0">Tocando agora</span>
                </div>

                <TransitionGroup name="queue" tag="div" class="flex flex-col gap-0.5">
                  <div
                    v-for="(item, idx) in queue"
                    :key="item.id"
                    class="flex items-center gap-3 px-3 py-2 rounded-md"
                  >
                    <span class="w-5 text-center text-sm text-subdued flex-shrink-0">{{ idx + 1 }}</span>
                    <div class="min-w-0">
                      <p class="text-base font-bold truncate">{{ item.title }}</p>
                      <p class="mt-0.5 text-sm text-subdued truncate">{{ item.addedBy }} · {{ item.artist }}</p>
                    </div>
                    <button
                      v-if="isMine(item.id)"
                      type="button"
                      :aria-label="`Remover ${item.title} da fila`"
                      :disabled="removingId === item.id"
                      class="ml-auto w-11 h-11 -mr-2 rounded-full text-subdued hover:text-white flex items-center justify-center flex-shrink-0 transition-colors duration-fast ease-standard disabled:opacity-40
                             focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                      @click="removeFromQueue(item)"
                    >
                      <AppIcon name="x" :size="16" />
                    </button>
                  </div>
                </TransitionGroup>

                <p v-if="queue.length === 0 && !currentSong" class="text-center text-subdued text-sm py-12">
                  Fila vazia
                </p>
              </template>
            </div>
          </Transition>
        </div>
      </main>
    </div>

    <!-- Error toast: fica até fechar ou 8 s; o gutter é transparente para não bloquear toques -->
    <Transition name="fade">
      <div
        v-if="error"
        role="alert"
        class="fixed inset-x-0 bottom-[calc(5rem_+_env(safe-area-inset-bottom))] z-50 page-x pointer-events-none"
      >
        <div
          class="mx-auto max-w-xl pointer-events-auto flex items-center gap-2 pl-4 pr-1 py-1 rounded-lg bg-highlight text-white text-sm shadow-[rgba(0,0,0,.5)_0_8px_24px]"
          @mouseenter="holdError"
          @mouseleave="releaseError"
          @focusin="holdError"
          @focusout="releaseError"
        >
          <span class="flex-1 py-2">{{ error }}</span>
          <button
            type="button"
            aria-label="Fechar aviso"
            class="w-11 h-11 rounded-full text-subdued hover:text-white flex items-center justify-center flex-shrink-0 transition-colors duration-fast ease-standard
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            @click="clearError"
          >
            <AppIcon name="x" :size="16" />
          </button>
        </div>
      </div>
    </Transition>

    <!-- Bottom Navigation: fundo full-bleed, abas contidas na largura da sala -->
    <nav aria-label="Navegação da sala" class="safe-bottom flex-shrink-0 bg-black border-t border-highlight">
      <div class="mx-auto flex w-full max-w-xl">
        <button
          v-for="tab in (['live', 'search', 'queue'] as const)"
          :key="tab"
          :aria-current="activeTab === tab ? 'true' : undefined"
          :class="[
            'flex-1 flex flex-col items-center py-3 gap-1.5 text-xs transition-colors duration-fast ease-standard',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white',
            activeTab === tab ? 'text-accent font-bold' : 'text-subdued hover:text-white'
          ]"
          @click="activeTab = tab"
        >
          <AppIcon :name="tabIcon(tab)" :size="18" :filled="activeTab === tab" />
          <span>{{ tab === 'live' ? 'Ao Vivo' : tab === 'search' ? 'Buscar' : 'Fila' }}</span>
        </button>
      </div>
    </nav>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity var(--motion-base) var(--ease-standard); }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Fade simultâneo: a aba que sai fica absoluta para não empurrar a que entra */
.tab-enter-active, .tab-leave-active { transition: opacity var(--motion-fast) var(--ease-standard); }
.tab-leave-active { position: absolute; inset: 0 0 auto; pointer-events: none; }
.tab-enter-from, .tab-leave-to { opacity: 0; }

.queue-enter-active, .queue-leave-active { transition: opacity var(--motion-fast) var(--ease-standard), transform var(--motion-fast) var(--ease-standard); }
.queue-enter-from, .queue-leave-to { opacity: 0; transform: translateY(6px); }
.queue-move { transition: transform var(--motion-base) var(--ease-standard); }
</style>

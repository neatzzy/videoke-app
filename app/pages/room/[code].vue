<script setup lang="ts">
const route = useRoute()
const { session, currentSong, queue, votes, previousVotes, error, addSong, nextSong, vote, resumeSession } = useKaraoke()

type Tab = 'live' | 'search' | 'queue'
// Tab lives in the URL so the phone's back button returns to the previous tab instead of leaving the room
const activeTab = computed<Tab>({
  get: () => (['search', 'queue'].includes(route.query.tab as string) ? route.query.tab as Tab : 'live'),
  set: (tab) => { navigateTo({ query: tab === 'live' ? {} : { tab } }) },
})

// My vote state
const myVote = ref<'like' | 'dislike' | null>(null)

// Search
const searchQuery = ref('')
const searchResults = ref<{ videoId: string; title: string; artist: string; thumbnail: string }[]>([])
const searching = ref(false)
const addedIds = ref<Set<string>>(new Set())

onMounted(async () => {
  // Session survives client-side navigation (module-level useState) but not a
  // hard reload — resume it from the URL's room code before giving up on it.
  if (session.value) return
  const ok = await resumeSession(route.params.code as string)
  if (!ok) navigateTo('/join')
})

// Reset vote when song changes
watch(currentSong, () => { myVote.value = null })

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

function flashError(message: string) {
  error.value = message
  setTimeout(() => { error.value = null }, 4000)
}

async function addToQueue(item: (typeof searchResults.value)[number]) {
  try {
    await addSong({ videoId: item.videoId, title: item.title, artist: item.artist, thumbnail: item.thumbnail, duration: '' })
    addedIds.value.add(item.videoId)
    activeTab.value = 'queue'
  } catch {
    flashError('Não foi possível adicionar a música. Tente de novo.')
  }
}

async function castVote(v: 'like' | 'dislike') {
  if (myVote.value) return
  myVote.value = v
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
    <!-- Top bar -->
    <header class="flex items-center justify-between px-4 pt-6 pb-3 flex-shrink-0">
      <AppLogo />
      <span v-if="session?.code" class="px-3 py-1 rounded-full bg-highlight text-xs font-bold font-mono tracking-[2px]">
        {{ session.code }}
      </span>
    </header>

    <!-- Content area (scrollable) -->
    <main class="flex-1 overflow-y-auto scrollbar-thin px-4 pt-2 pb-4">

      <!-- ══ TAB: AO VIVO ══ -->
      <template v-if="activeTab === 'live'">

        <!-- Previous votes result -->
        <Transition name="fade">
          <div
            v-if="previousVotes"
            class="mb-4 p-4 rounded-lg bg-elevated flex items-center justify-between"
          >
            <span class="text-xs font-bold tracking-label text-subdued uppercase">Última performance</span>
            <div class="flex gap-4 text-sm font-bold">
              <span class="flex items-center gap-1.5 text-accent">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M18 9l-6-6-6 6M12 4v16" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
                {{ previousVotes.likes }}
              </span>
              <span class="flex items-center gap-1.5 text-negative">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M18 15l-6 6-6-6M12 20V4" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
                {{ previousVotes.dislikes }}
              </span>
            </div>
          </div>
        </Transition>

        <!-- Current Song -->
        <div v-if="currentSong">
          <p class="flex items-center gap-2 text-xs font-bold tracking-label text-subdued">
            <span class="flex gap-0.5 items-end h-3" aria-hidden="true">
              <i v-for="h in [60, 100, 40, 80]" :key="h" class="w-0.5 bg-accent" :style="{ height: `${h}%` }" />
            </span>
            AGORA CANTANDO
          </p>

          <img
            v-if="currentSong.thumbnail"
            :src="currentSong.thumbnail"
            alt=""
            class="mt-3 w-full aspect-video object-cover rounded-lg bg-muted shadow-[rgba(0,0,0,.5)_0_8px_24px]"
          />
          <div v-else class="mt-3 w-full aspect-video rounded-lg bg-gradient-to-b from-muted to-elevated shadow-[rgba(0,0,0,.5)_0_8px_24px]" />

          <h2 class="mt-4 text-2xl font-bold leading-tight line-clamp-2">{{ currentSong.title }}</h2>
          <p class="mt-1 text-sm text-subdued">{{ currentSong.artist }}</p>
          <div class="mt-3 inline-flex items-center gap-2 py-1 pl-1 pr-3 rounded-full bg-highlight">
            <span class="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[11px] font-bold">
              {{ currentSong.addedBy.charAt(0).toUpperCase() }}
            </span>
            <span class="text-xs font-bold">{{ currentSong.addedBy }}</span>
          </div>

          <!-- Vote buttons -->
          <div class="mt-5 grid grid-cols-2 gap-3">
            <button
              @click="castVote('like')"
              :disabled="!!myVote"
              :class="[
                'h-12 rounded-full bg-accent text-black text-sm font-bold flex items-center justify-center gap-2 transition-all',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
                myVote === 'dislike' ? 'opacity-40' : 'enabled:hover:bg-accent-hover enabled:active:scale-95',
                myVote && 'cursor-not-allowed'
              ]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 9l-6-6-6 6M12 4v16" stroke="#000" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
              Curtir
            </button>
            <button
              @click="castVote('dislike')"
              :disabled="!!myVote"
              :class="[
                'h-12 rounded-full bg-transparent border text-sm font-bold flex items-center justify-center gap-2 transition-all',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
                myVote === 'dislike' ? 'border-white' : 'border-outline',
                myVote === 'like' ? 'opacity-40' : 'enabled:hover:border-white enabled:active:scale-95',
                myVote && 'cursor-not-allowed'
              ]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 15l-6 6-6-6M12 20V4" stroke="#f3727f" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
              Não curtir
            </button>
          </div>

          <p class="mt-3 text-center text-xs text-subdued">
            <template v-if="myVote">Voto registrado! · </template>
            {{ votes.total }} votos · {{ votes.likes }} curtidas · {{ votes.dislikes }} não curtidas
          </p>
        </div>

        <!-- No song playing -->
        <div v-else class="flex flex-col items-center justify-center py-16 text-center gap-2">
          <h2 class="text-2xl font-bold">Nenhuma música tocando</h2>
          <p class="text-sm text-subdued">Adicione uma música na fila!</p>
          <button
            @click="activeTab = 'search'"
            class="mt-6 px-8 py-3.5 rounded-full bg-accent hover:bg-accent-hover text-black text-sm font-bold tracking-label uppercase transition-colors
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            Buscar música
          </button>
        </div>
      </template>

      <!-- ══ TAB: BUSCAR ══ -->
      <template v-else-if="activeTab === 'search'">
        <form @submit.prevent="search" class="sticky top-0 bg-surface pb-2">
          <label
            class="flex items-center gap-3 px-4 py-3 rounded-full bg-highlight transition-shadow
                   shadow-[rgb(18,18,18)_0_1px_0,rgb(124,124,124)_0_0_0_1px_inset] focus-within:shadow-[#fff_0_0_0_2px_inset]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" :class="['flex-shrink-0', searching && 'animate-pulse']" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="#b3b3b3" stroke-width="2" /><path d="M21 21l-4-4" stroke="#b3b3b3" stroke-width="2" stroke-linecap="round" />
            </svg>
            <input
              v-model="searchQuery"
              type="search"
              enterkeyhint="search"
              aria-label="Buscar música no YouTube"
              placeholder="Buscar música no YouTube..."
              class="flex-1 min-w-0 bg-transparent text-base text-white placeholder-subdued focus:outline-none"
            />
          </label>
        </form>

        <p v-if="searching || searchResults.length" class="mt-3 mb-2 text-base font-bold">
          {{ searching ? 'Buscando...' : 'Resultados' }}
        </p>

        <div class="flex flex-col gap-0.5">
          <div
            v-for="item in searchResults"
            :key="item.videoId"
            class="flex items-center gap-3 p-2 rounded-md hover:bg-[#272727] transition-colors"
          >
            <img
              :src="item.thumbnail"
              alt=""
              class="w-14 h-10 object-cover rounded flex-shrink-0 bg-muted"
            />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold truncate">{{ item.title }}</p>
              <p class="mt-0.5 text-xs text-subdued truncate">{{ item.artist }}</p>
            </div>
            <span
              v-if="addedIds.has(item.videoId)"
              role="img"
              :aria-label="`${item.title} já está na fila`"
              class="w-11 h-11 rounded-full bg-accent flex items-center justify-center flex-shrink-0"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5 9-10" stroke="#000" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" /></svg>
            </span>
            <button
              v-else
              @click="addToQueue(item)"
              :aria-label="`Adicionar ${item.title} à fila`"
              class="h-11 px-4 rounded-full border border-outline hover:border-white text-xs font-bold flex-shrink-0 transition-colors
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
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
          <span class="w-5 flex gap-0.5 items-end justify-center h-3.5 flex-shrink-0" aria-hidden="true">
            <i v-for="h in [60, 100, 40]" :key="h" class="w-[3px] bg-accent" :style="{ height: `${h}%` }" />
          </span>
          <div class="min-w-0">
            <p class="text-sm font-bold text-accent truncate">{{ currentSong.title }}</p>
            <p class="mt-0.5 text-xs text-subdued truncate">{{ currentSong.addedBy }} · {{ currentSong.artist }}</p>
          </div>
          <span class="ml-auto px-2 py-0.5 rounded-full bg-highlight text-[10.5px] font-semibold flex-shrink-0">Tocando agora</span>
        </div>

        <div class="flex flex-col gap-0.5">
          <div
            v-for="(item, idx) in queue"
            :key="item.id"
            class="flex items-center gap-3 px-3 py-2 rounded-md"
          >
            <span class="w-5 text-center text-sm text-subdued flex-shrink-0">{{ idx + 1 }}</span>
            <div class="min-w-0">
              <p class="text-sm font-bold truncate">{{ item.title }}</p>
              <p class="mt-0.5 text-xs text-subdued truncate">{{ item.addedBy }} · {{ item.artist }}</p>
            </div>
          </div>
        </div>

        <p v-if="queue.length === 0 && !currentSong" class="text-center text-subdued text-sm py-12">
          Fila vazia
        </p>
      </template>
    </main>

    <!-- Error toast -->
    <Transition name="fade">
      <div
        v-if="error"
        role="alert"
        class="fixed left-4 right-4 bottom-20 z-50 px-4 py-3 rounded-lg bg-highlight text-white text-sm text-center shadow-[rgba(0,0,0,.5)_0_8px_24px]"
      >
        {{ error }}
      </div>
    </Transition>

    <!-- Bottom Navigation -->
    <nav class="flex-shrink-0 flex bg-black border-t border-highlight pb-[env(safe-area-inset-bottom)]">
      <button
        v-for="tab in (['live', 'search', 'queue'] as const)"
        :key="tab"
        @click="activeTab = tab"
        :aria-current="activeTab === tab ? 'true' : undefined"
        :class="[
          'flex-1 flex flex-col items-center py-3 gap-1.5 text-[10.5px] transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white',
          activeTab === tab ? 'text-accent font-bold' : 'text-subdued hover:text-white'
        ]"
      >
        <span v-if="tab === 'live'" class="w-2 h-2 my-[5px] rounded-full bg-current" />
        <svg v-else-if="tab === 'search'" width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2.2" /><path d="M21 21l-4-4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" /></svg>
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" /></svg>
        <span>{{ tab === 'live' ? 'Ao Vivo' : tab === 'search' ? 'Buscar' : 'Fila' }}</span>
      </button>
    </nav>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.4s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

<script setup lang="ts">
const route = useRoute()
const { connect, session, currentSong, queue, votes, previousVotes, error, addSong, nextSong, vote, sync } = useKaraoke()

type Tab = 'live' | 'search' | 'queue'
const activeTab = ref<Tab>('live')

// My vote state
const myVote = ref<'like' | 'dislike' | null>(null)

// Search
const searchQuery = ref('')
const searchResults = ref<{ videoId: string; title: string; artist: string; thumbnail: string }[]>([])
const searching = ref(false)
const addedIds = ref<Set<string>>(new Set())

onMounted(() => {
  connect()
  // If no session in state yet, this page was opened directly — sync or redirect
  setTimeout(() => {
    if (!session.value) {
      navigateTo('/join')
    } else {
      sync()
    }
  }, 1500)
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
    // ignore search errors
  } finally {
    searching.value = false
  }
}

function addToQueue(item: (typeof searchResults.value)[number]) {
  addSong({ videoId: item.videoId, title: item.title, artist: item.artist, thumbnail: item.thumbnail, duration: '' })
  addedIds.value.add(item.videoId)
  activeTab.value = 'queue'
}

function castVote(v: 'like' | 'dislike') {
  if (myVote.value) return
  myVote.value = v
  vote(v)
}
</script>

<template>
  <div class="h-screen flex flex-col bg-void overflow-hidden">
    <!-- Top bar -->
    <header class="flex items-center justify-between px-4 pt-6 pb-3 flex-shrink-0">
      <div class="flex items-center gap-2">
        <div class="w-6 h-6 rounded-md bg-gradient-to-br from-button-gradient-start to-button-gradient-end
                    border border-neon-pink/40 flex items-center justify-center shrink-0">
          <svg width="9" height="9" viewBox="0 0 13 13"><polygon points="3,1 12,6.5 3,12" fill="#FF007F" /></svg>
        </div>
        <span class="font-black tracking-widest text-sm">VIDEOKÉ</span>
      </div>
      <div v-if="session?.code" class="px-3 py-1 rounded-full bg-panel text-xs font-mono font-bold tracking-widest neon-border-pink">
        {{ session.code }}
      </div>
    </header>

    <!-- Content area (scrollable) -->
    <main class="flex-1 overflow-y-auto scrollbar-thin px-4 pb-4">

      <!-- ══ TAB: AO VIVO ══ -->
      <template v-if="activeTab === 'live'">

        <!-- Previous votes result -->
        <Transition name="fade">
          <div
            v-if="previousVotes"
            class="mb-4 p-4 rounded-xl bg-panel border border-dim/20 flex items-center justify-between"
          >
            <div class="text-xs text-dim uppercase tracking-[0.15em]">Última performance</div>
            <div class="flex gap-4">
              <span class="flex items-center gap-1.5 text-green-400 font-bold text-sm">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M18 9l-6-6-6 6M12 4v16" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
                {{ previousVotes.likes }}
              </span>
              <span class="flex items-center gap-1.5 text-red-400 font-bold text-sm">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M18 15l-6 6-6-6M12 20V4" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
                {{ previousVotes.dislikes }}
              </span>
            </div>
          </div>
        </Transition>

        <!-- Current Song -->
        <div v-if="currentSong" class="mb-6">
          <div class="flex items-center gap-2 mb-3">
            <div class="flex gap-0.5 items-end h-3">
              <div v-for="(h, i) in [60, 100, 40, 80]" :key="i"
                class="w-0.5 bg-neon-pink rounded-sm animate-pulse"
                :style="{ height: `${h}%`, animationDelay: `${i * 0.1}s` }"
              />
            </div>
            <span class="text-[10px] text-dim uppercase tracking-[0.15em]">Agora Cantando</span>
          </div>

          <!-- Thumbnail + info -->
          <div class="rounded-xl overflow-hidden relative">
            <img
              v-if="currentSong.thumbnail"
              :src="currentSong.thumbnail"
              :alt="currentSong.title"
              class="w-full object-cover opacity-60"
              style="aspect-ratio: 16/9"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-void via-void/60 to-transparent" />
            <div class="absolute bottom-0 left-0 right-0 p-4">
              <p class="font-black text-xl leading-tight text-glow-pink">{{ currentSong.title }}</p>
              <p class="text-neon-cyan text-sm mt-0.5">{{ currentSong.artist }}</p>
              <div class="mt-2 flex items-center gap-2">
                <div class="w-6 h-6 rounded-full bg-neon-pink/20 border border-neon-pink/40 flex items-center justify-center text-[10px] font-bold">
                  {{ currentSong.addedBy[0].toUpperCase() }}
                </div>
                <span class="text-xs text-white/80">{{ currentSong.addedBy }}</span>
              </div>
            </div>
          </div>

          <!-- Live vote tally -->
          <div class="mt-3 flex items-center justify-center gap-6 text-sm">
            <span class="flex items-center gap-1.5 text-green-400 font-bold">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 9l-6-6-6 6M12 4v16" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
              {{ votes.likes }}
            </span>
            <span class="text-dim text-xs">{{ votes.total }} votos</span>
            <span class="flex items-center gap-1.5 text-red-400 font-bold">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 15l-6 6-6-6M12 20V4" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
              {{ votes.dislikes }}
            </span>
          </div>

          <!-- Vote buttons -->
          <div class="mt-4 grid grid-cols-2 gap-3">
            <button
              @click="castVote('like')"
              :disabled="!!myVote"
              aria-label="Curtir"
              :class="[
                'py-5 rounded-2xl text-sm font-bold transition-all border-2 flex flex-col items-center gap-1.5',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-void',
                myVote === 'like'
                  ? 'bg-green-500/30 border-green-400 scale-95'
                  : myVote
                    ? 'bg-panel border-dim/20 opacity-40 cursor-not-allowed'
                    : 'bg-panel border-green-500/40 hover:bg-green-500/20 active:scale-95'
              ]"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M18 9l-6-6-6 6M12 4v16" stroke="#34D399" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
              Curtir
            </button>
            <button
              @click="castVote('dislike')"
              :disabled="!!myVote"
              aria-label="Não curtir"
              :class="[
                'py-5 rounded-2xl text-sm font-bold transition-all border-2 flex flex-col items-center gap-1.5',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-void',
                myVote === 'dislike'
                  ? 'bg-red-500/30 border-red-400 scale-95'
                  : myVote
                    ? 'bg-panel border-dim/20 opacity-40 cursor-not-allowed'
                    : 'bg-panel border-red-500/40 hover:bg-red-500/20 active:scale-95'
              ]"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M18 15l-6 6-6-6M12 20V4" stroke="#F87171" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
              Não curtir
            </button>
          </div>

          <p v-if="myVote" class="text-center text-xs text-dim mt-2">Voto registrado!</p>
        </div>

        <!-- No song playing -->
        <div v-else class="flex flex-col items-center justify-center py-16 text-center gap-3">
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" class="opacity-40">
            <rect x="3" y="6" width="14" height="12" rx="2" stroke="#8B7DA5" stroke-width="1.5" />
            <path d="M21 8.5v7l-4-2.3v-2.4l4-2.3z" fill="#8B7DA5" />
          </svg>
          <p class="text-dim text-sm">Nenhuma música tocando</p>
          <p class="text-dim/70 text-xs">Adicione uma música na fila!</p>
          <button
            @click="activeTab = 'search'"
            class="mt-4 px-6 py-3 rounded-xl text-sm font-bold neon-border-cyan text-neon-cyan hover:bg-neon-cyan/10 transition-colors
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/50 focus-visible:ring-offset-2 focus-visible:ring-offset-void"
          >
            Buscar música
          </button>
        </div>
      </template>

      <!-- ══ TAB: BUSCAR ══ -->
      <template v-else-if="activeTab === 'search'">
        <form @submit.prevent="search" class="flex gap-2 mb-4 sticky top-0 bg-void pt-1 pb-2">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar música no YouTube..."
            class="flex-1 px-4 py-3 rounded-xl bg-panel text-white placeholder-dim text-sm
                   border border-dim/20 focus:border-neon-cyan/50 focus:outline-none
                   focus-visible:ring-2 focus-visible:ring-neon-cyan/50 focus-visible:ring-offset-2 focus-visible:ring-offset-void
                   transition-colors"
          />
          <button
            type="submit"
            :disabled="searching"
            aria-label="Buscar música"
            :class="[
              'px-4 py-3 rounded-xl bg-panel border border-neon-cyan/40 text-neon-cyan',
              'hover:bg-neon-cyan/10 disabled:opacity-50 transition-colors',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/50 focus-visible:ring-offset-2 focus-visible:ring-offset-void',
              searching && 'animate-pulse'
            ]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" /><path d="M21 21l-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
          </button>
        </form>

        <div class="space-y-3">
          <div
            v-for="item in searchResults"
            :key="item.videoId"
            class="flex items-center gap-3 p-3 rounded-xl bg-panel border border-dim/10
                   hover:border-dim/30 transition-colors"
          >
            <img
              :src="item.thumbnail"
              :alt="item.title"
              class="w-16 h-10 object-cover rounded-lg flex-shrink-0 bg-void"
            />
            <div class="flex-1 min-w-0">
              <p class="text-xs font-bold text-white truncate">{{ item.title }}</p>
              <p class="text-[10px] text-dim truncate mt-0.5">{{ item.artist }}</p>
            </div>
            <button
              @click="addToQueue(item)"
              :disabled="addedIds.has(item.videoId)"
              :aria-label="addedIds.has(item.videoId) ? `${item.title} já está na fila` : `Adicionar ${item.title} à fila`"
              class="flex-shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/50 focus-visible:ring-offset-2 focus-visible:ring-offset-panel"
              :class="addedIds.has(item.videoId)
                ? 'bg-neon-pink/20 text-neon-pink border border-neon-pink/30 opacity-60'
                : 'bg-panel border border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/10'"
            >
              {{ addedIds.has(item.videoId) ? '✓' : '+ Fila' }}
            </button>
          </div>

          <div
            v-if="searchResults.length === 0 && !searching && searchQuery"
            class="text-center text-dim/70 text-sm py-8"
          >
            Nenhum resultado
          </div>
        </div>
      </template>

      <!-- ══ TAB: FILA ══ -->
      <template v-else-if="activeTab === 'queue'">
        <div class="space-y-3">
          <!-- Currently playing -->
          <div v-if="currentSong" class="p-3 rounded-xl bg-neon-pink/10 border border-neon-pink/30">
            <p class="text-[10px] text-neon-pink uppercase tracking-[0.15em] font-bold mb-1">Tocando agora</p>
            <p class="text-sm font-bold text-white truncate">{{ currentSong.title }}</p>
            <p class="text-[10px] text-dim truncate">{{ currentSong.addedBy }} · {{ currentSong.artist }}</p>
          </div>

          <!-- Queue -->
          <div
            v-for="(item, idx) in queue"
            :key="item.id"
            class="flex items-center gap-3 p-3 rounded-xl bg-panel border border-dim/10"
          >
            <div class="w-6 h-6 rounded-full bg-neon-pink/15 border border-neon-pink/25 flex items-center justify-center text-[10px] font-bold text-neon-pink flex-shrink-0">
              {{ idx + 1 }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-bold text-white truncate">{{ item.title }}</p>
              <p class="text-[10px] text-dim truncate mt-0.5">{{ item.addedBy }} · {{ item.artist }}</p>
            </div>
          </div>

          <div
            v-if="queue.length === 0 && !currentSong"
            class="text-center text-dim/70 text-sm py-12"
          >
            Fila vazia
          </div>
        </div>
      </template>
    </main>

    <!-- Bottom Navigation -->
    <nav class="flex-shrink-0 flex border-t border-dim/15 bg-panel/50">
      <button
        v-for="tab in (['live', 'search', 'queue'] as const)"
        :key="tab"
        @click="activeTab = tab"
        :aria-current="activeTab === tab ? 'true' : undefined"
        :class="[
          'flex-1 flex flex-col items-center py-3 gap-1.5 text-[10px] font-semibold tracking-wide transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-pink/40 focus-visible:ring-offset-2 focus-visible:ring-offset-panel',
          activeTab === tab ? 'text-neon-pink' : 'text-dim hover:text-white'
        ]"
      >
        <span v-if="tab === 'live'" class="w-2 h-2 rounded-full bg-current" />
        <svg v-else-if="tab === 'search'" width="17" height="17" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2.2" /><path d="M21 21l-4-4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" /></svg>
        <svg v-else width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" /></svg>
        <span>{{ tab === 'live' ? 'Ao Vivo' : tab === 'search' ? 'Buscar' : 'Fila' }}</span>
      </button>
    </nav>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.4s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

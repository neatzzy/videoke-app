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
        <span class="text-neon-pink">🎤</span>
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
            <div class="text-xs text-dim uppercase tracking-wider">Última performance</div>
            <div class="flex gap-4">
              <span class="text-green-400 font-bold text-sm">👍 {{ previousVotes.likes }}</span>
              <span class="text-red-400 font-bold text-sm">👎 {{ previousVotes.dislikes }}</span>
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
            <span class="text-[10px] text-dim uppercase tracking-widest">Agora Cantando</span>
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
                <span class="text-xs text-white/80">{{ currentSong.addedBy }} 🎤</span>
              </div>
            </div>
          </div>

          <!-- Live vote tally -->
          <div class="mt-3 flex items-center justify-center gap-6 text-sm">
            <span class="text-green-400 font-bold">👍 {{ votes.likes }}</span>
            <span class="text-dim text-xs">{{ votes.total }} votos</span>
            <span class="text-red-400 font-bold">{{ votes.dislikes }} 👎</span>
          </div>

          <!-- Vote buttons -->
          <div class="mt-4 grid grid-cols-2 gap-3">
            <button
              @click="castVote('like')"
              :disabled="!!myVote"
              aria-label="Curtir"
              :class="[
                'py-5 rounded-2xl text-3xl font-bold transition-all border-2',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-void',
                myVote === 'like'
                  ? 'bg-green-500/30 border-green-400 scale-95'
                  : myVote
                    ? 'bg-panel border-dim/20 opacity-40 cursor-not-allowed'
                    : 'bg-panel border-green-500/40 hover:bg-green-500/20 active:scale-95'
              ]"
            >
              👍
            </button>
            <button
              @click="castVote('dislike')"
              :disabled="!!myVote"
              aria-label="Não curtir"
              :class="[
                'py-5 rounded-2xl text-3xl font-bold transition-all border-2',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-void',
                myVote === 'dislike'
                  ? 'bg-red-500/30 border-red-400 scale-95'
                  : myVote
                    ? 'bg-panel border-dim/20 opacity-40 cursor-not-allowed'
                    : 'bg-panel border-red-500/40 hover:bg-red-500/20 active:scale-95'
              ]"
            >
              👎
            </button>
          </div>

          <p v-if="myVote" class="text-center text-xs text-dim mt-2">Voto registrado!</p>
        </div>

        <!-- No song playing -->
        <div v-else class="flex flex-col items-center justify-center py-16 text-center gap-3">
          <span class="text-6xl opacity-30">🎵</span>
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
            class="px-4 py-3 rounded-xl bg-panel border border-neon-cyan/40 text-neon-cyan text-sm
                   hover:bg-neon-cyan/10 disabled:opacity-50 transition-colors
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/50 focus-visible:ring-offset-2 focus-visible:ring-offset-void"
          >
            {{ searching ? '⏳' : '🔍' }}
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
            <p class="text-[10px] text-neon-pink uppercase tracking-widest font-bold mb-1">Tocando agora</p>
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
        v-for="tab in ([
          { id: 'live', icon: '🔴', label: 'Ao Vivo' },
          { id: 'search', icon: '🔍', label: 'Buscar' },
          { id: 'queue', icon: '📋', label: 'Fila' },
        ] as const)"
        :key="tab.id"
        @click="activeTab = tab.id"
        :aria-current="activeTab === tab.id ? 'true' : undefined"
        :class="[
          'flex-1 flex flex-col items-center py-3 gap-1 text-[10px] font-semibold tracking-wide transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-pink/40 focus-visible:ring-offset-2 focus-visible:ring-offset-panel',
          activeTab === tab.id ? 'text-neon-pink' : 'text-dim hover:text-white'
        ]"
      >
        <span class="text-lg leading-none">{{ tab.icon }}</span>
        <span>{{ tab.label }}</span>
      </button>
    </nav>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.4s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

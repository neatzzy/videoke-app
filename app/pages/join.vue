<script setup lang="ts">
const { connect, joinSession, session, error } = useKaraoke()

const name = ref('')
const code = ref('')
const loading = ref(false)

onMounted(() => connect())

watch(session, (s) => {
  if (s) {
    loading.value = false
    navigateTo(`/room/${s.code}`)
  }
})

watch(error, () => { loading.value = false })

function submit() {
  if (!name.value.trim() || !code.value.trim()) return
  loading.value = true
  joinSession(code.value.trim(), name.value.trim())
}
</script>

<template>
  <div class="h-screen flex flex-col bg-void overflow-y-auto">
    <!-- Header -->
    <header class="flex items-center gap-2 px-6 pt-8 pb-4">
      <span class="text-neon-pink text-2xl">🎤</span>
      <span class="font-black text-lg tracking-widest">VIDEOKÉ</span>
    </header>

    <!-- Content -->
    <main class="flex-1 flex flex-col justify-center px-6 pb-12 max-w-sm mx-auto w-full">
      <h1 class="text-4xl font-black text-white mb-2">Entre na sala</h1>
      <p class="text-dim text-sm mb-10">Peça o código para o anfitrião</p>

      <form class="flex flex-col gap-6" @submit.prevent="submit">
        <!-- Name -->
        <div>
          <label class="block text-xs font-bold tracking-widest text-dim uppercase mb-2">
            Seu Nome
          </label>
          <input
            v-model="name"
            type="text"
            placeholder="Ex: Marina"
            maxlength="24"
            class="w-full px-4 py-3.5 rounded-xl bg-panel text-white placeholder-dim
                   border border-neon-pink/20 focus:border-neon-pink/60 focus:outline-none
                   focus-visible:ring-2 focus-visible:ring-neon-pink/50 focus-visible:ring-offset-2 focus-visible:ring-offset-void
                   transition-colors text-sm"
          />
        </div>

        <!-- Room code -->
        <div>
          <label class="block text-xs font-bold tracking-widest text-dim uppercase mb-2">
            Código da Sala
          </label>
          <input
            v-model="code"
            type="text"
            placeholder="Ex: NEON"
            maxlength="4"
            autocomplete="off"
            class="w-full px-4 py-3.5 rounded-xl bg-panel text-white placeholder-dim
                   border border-neon-pink/20 focus:border-neon-pink/60 focus:outline-none
                   focus-visible:ring-2 focus-visible:ring-neon-pink/50 focus-visible:ring-offset-2 focus-visible:ring-offset-void
                   transition-colors text-sm tracking-widest uppercase font-mono"
            @input="code = code.toUpperCase()"
          />
        </div>

        <!-- Error -->
        <p v-if="error" class="text-neon-pink text-sm text-center -mt-2">{{ error }}</p>

        <!-- Submit -->
        <button
          type="submit"
          :disabled="loading || !name.trim() || !code.trim()"
          class="w-full py-4 rounded-xl font-bold text-sm tracking-wider transition-all mt-2
                 bg-gradient-to-r from-button-gradient-start to-button-gradient-end
                 border border-neon-pink/30 text-white/90
                 hover:border-neon-pink/70 hover:text-white
                 focus:outline-none focus-visible:border-neon-pink/70 focus-visible:text-white
                 focus-visible:ring-2 focus-visible:ring-neon-pink/50 focus-visible:ring-offset-2 focus-visible:ring-offset-void
                 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading" class="inline-block animate-pulse">Entrando...</span>
          <span v-else>Entrar</span>
        </button>
      </form>

      <!-- Hint -->
      <p class="text-center text-xs text-dim/70 mt-8">
        Dica: use o código
        <span class="text-neon-cyan font-mono font-bold text-glow-cyan">NEON</span>
        para testar
      </p>
    </main>
  </div>
</template>

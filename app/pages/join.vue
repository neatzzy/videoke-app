<script setup lang="ts">
const { connect, joinSession, session, error } = useKaraoke()

const name = ref('')
// Prefilled when arriving from the host screen's QR code (/join?code=XXXX)
const code = ref(String(useRoute().query.code ?? '').toUpperCase())
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
  <div class="h-dvh flex flex-col bg-surface overflow-y-auto">
    <header class="px-6 pt-8">
      <AppLogo :size="28" text-class="text-base" />
    </header>

    <main class="flex-1 flex flex-col justify-center px-6 pb-12 max-w-sm mx-auto w-full">
      <h1 class="text-4xl font-extrabold leading-tight">Entre na sala</h1>
      <p class="text-subdued text-sm mt-2">Peça o código para o anfitrião</p>

      <form class="flex flex-col gap-6 mt-10" @submit.prevent="submit">
        <div>
          <label for="join-name" class="block text-sm font-bold mb-2">Seu nome</label>
          <input
            id="join-name"
            v-model="name"
            type="text"
            placeholder="Ex: Marina"
            maxlength="24"
            class="field"
          />
        </div>

        <div>
          <label for="join-code" class="block text-sm font-bold mb-2">Código da sala</label>
          <input
            id="join-code"
            v-model="code"
            type="text"
            placeholder="Ex: NEON"
            maxlength="4"
            autocomplete="off"
            class="field font-mono tracking-[4px] uppercase"
            @input="code = code.toUpperCase()"
          />
        </div>

        <p v-if="error" role="alert" class="text-negative text-sm text-center -mt-2">{{ error }}</p>

        <button
          type="submit"
          :disabled="loading || !name.trim() || !code.trim()"
          class="mt-2 w-full py-3.5 px-8 rounded-full bg-accent hover:bg-accent-hover text-black
                 text-sm font-bold tracking-label uppercase transition-colors
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-surface
                 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-accent"
        >
          <span v-if="loading" class="inline-block animate-pulse">Entrando...</span>
          <span v-else>Entrar</span>
        </button>
      </form>

      <p class="text-center text-xs text-subdued mt-8">
        Dica: use o código <b class="text-white font-mono">NEON</b> para testar
      </p>
    </main>
  </div>
</template>

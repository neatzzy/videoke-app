<script setup lang="ts">
const props = defineProps<{ error: { statusCode?: number; message?: string } }>()

const isNotFound = computed(() => props.error?.statusCode === 404)
const title = computed(() => (isNotFound.value ? 'Página não encontrada' : 'Algo deu errado'))

useHead({ title })

function goHome() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div class="h-dvh overflow-y-auto bg-surface">
    <main class="min-h-full flex flex-col items-center justify-center gap-6 page-x page-top page-bottom text-center">
      <h1 class="m-0 text-2xl font-bold text-white">{{ title }}</h1>

      <p class="m-0 text-sm text-subdued">
        {{ isNotFound ? 'O endereço que você abriu não existe ou foi movido.' : 'Tente voltar ao início e entrar de novo.' }}
      </p>

      <button
        type="button"
        class="min-h-[44px] min-w-[44px] px-6 rounded-lg bg-elevated hover:bg-hover text-white font-bold text-base transition-colors duration-fast ease-standard
               focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        @click="goHome"
      >
        Voltar ao início
      </button>
    </main>
  </div>
</template>

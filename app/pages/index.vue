<script setup lang="ts">
// Landing: redirect mobile to /join, can also host via /host
</script>

<template>
  <div class="h-dvh overflow-y-auto bg-surface">
    <div class="min-h-full flex flex-col items-center justify-center gap-8 page-x page-top page-bottom">
      <AppLogo :size="48" text-class="text-[28px]" />

      <p class="text-subdued text-sm">Escolha seu modo de acesso</p>

      <div class="flex flex-col gap-3 w-full max-w-sm">
        <NuxtLink
          to="/host"
          class="flex items-center gap-4 p-4 rounded-lg bg-elevated hover:bg-hover transition-colors duration-fast ease-standard
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <div class="w-12 h-12 rounded-md bg-highlight flex items-center justify-center shrink-0">
            <AppIcon name="host" :size="24" />
          </div>
          <div class="text-left">
            <p class="m-0 font-bold text-base text-white">Modo Host</p>
            <p class="m-0 mt-0.5 text-sm text-subdued">Tela principal no PC/TV</p>
          </div>
        </NuxtLink>

        <NuxtLink
          to="/join"
          class="flex items-center gap-4 p-4 rounded-lg bg-elevated hover:bg-hover transition-colors duration-fast ease-standard
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <div class="w-12 h-12 rounded-md bg-highlight flex items-center justify-center shrink-0">
            <AppIcon name="user" :size="24" />
          </div>
          <div class="text-left">
            <p class="m-0 font-bold text-base text-white">Entrar como convidado</p>
            <p class="m-0 mt-0.5 text-sm text-subdued">Vote e adicione músicas pelo celular</p>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

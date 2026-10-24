<script setup lang="ts">
// Landing: redirect mobile to /join, can also host via /host
</script>

<template>
  <div class="min-h-dvh flex flex-col items-center justify-center gap-8 bg-surface px-6">
    <AppLogo :size="48" text-class="text-[28px]" />

    <p class="text-subdued text-sm">Escolha seu modo de acesso</p>

    <div class="flex flex-col gap-3 w-full max-w-sm">
      <NuxtLink
        to="/host"
        class="flex items-center gap-4 p-4 rounded-lg bg-elevated hover:bg-hover transition-colors
               focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <div class="w-12 h-12 rounded-md bg-highlight flex items-center justify-center shrink-0">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="12" rx="2" stroke="#fff" stroke-width="1.8" />
            <path d="M9 20h6M12 16v4" stroke="#fff" stroke-width="1.8" stroke-linecap="round" />
          </svg>
        </div>
        <div class="text-left">
          <p class="m-0 font-bold text-base text-white">Modo Host</p>
          <p class="m-0 mt-0.5 text-sm text-subdued">Tela principal no PC/TV</p>
        </div>
      </NuxtLink>

      <NuxtLink
        to="/join"
        class="flex items-center gap-4 p-4 rounded-lg bg-elevated hover:bg-hover transition-colors
               focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <div class="w-12 h-12 rounded-md bg-highlight flex items-center justify-center shrink-0">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="7" y="2" width="10" height="20" rx="2" stroke="#fff" stroke-width="1.8" />
            <path d="M11 19h2" stroke="#fff" stroke-width="1.8" stroke-linecap="round" />
          </svg>
        </div>
        <div class="text-left">
          <p class="m-0 font-bold text-base text-white">Entrar como Client</p>
          <p class="m-0 mt-0.5 text-sm text-subdued">Vote e adicione músicas pelo celular</p>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

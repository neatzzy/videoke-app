<script setup lang="ts">
// Landing: redirect mobile to /join, can also host via /host
</script>

<template>
  <div class="h-screen flex flex-col items-center justify-center gap-9 bg-void px-6">
    <div class="flex items-center gap-3">
      <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-button-gradient-start to-button-gradient-end
                  border border-neon-pink/40 flex items-center justify-center text-glow-pink">
        <svg width="16" height="16" viewBox="0 0 13 13"><polygon points="3,1 12,6.5 3,12" fill="#FF007F" /></svg>
      </div>
      <span class="text-3xl font-black tracking-widest text-white">VIDEOKÉ</span>
    </div>

    <p class="text-dim text-sm tracking-wider">Escolha seu modo de acesso</p>

    <div class="flex flex-col gap-3.5 w-full max-w-xs">
      <NuxtLink
        to="/host"
        class="flex items-center gap-3.5 py-5 px-5 rounded-xl transition-colors
               bg-panel border border-neon-pink/30 hover:border-neon-pink/60 hover:bg-neon-pink/5
               focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-pink/50 focus-visible:ring-offset-2 focus-visible:ring-offset-void"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" class="shrink-0">
          <rect x="3" y="4" width="18" height="12" rx="2" stroke="#FF007F" stroke-width="1.8" />
          <path d="M9 20h6M12 16v4" stroke="#FF007F" stroke-width="1.8" stroke-linecap="round" />
        </svg>
        <div class="text-left">
          <p class="m-0 font-bold text-sm text-white">Modo Host</p>
          <p class="m-0 mt-0.5 text-xs text-dim">Tela principal no PC/TV</p>
        </div>
      </NuxtLink>

      <NuxtLink
        to="/join"
        class="flex items-center gap-3.5 py-5 px-5 rounded-xl transition-colors
               bg-panel border border-neon-cyan/30 hover:border-neon-cyan/60 hover:bg-neon-cyan/5
               focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/50 focus-visible:ring-offset-2 focus-visible:ring-offset-void"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" class="shrink-0">
          <rect x="7" y="2" width="10" height="20" rx="2" stroke="#00F0FF" stroke-width="1.8" />
          <path d="M11 19h2" stroke="#00F0FF" stroke-width="1.8" stroke-linecap="round" />
        </svg>
        <div class="text-left">
          <p class="m-0 font-bold text-sm text-white">Entrar como Client</p>
          <p class="m-0 mt-0.5 text-xs text-dim">Vote e adicione músicas pelo celular</p>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

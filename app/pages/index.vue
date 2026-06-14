<script setup lang="ts">
// Landing: redirect mobile to /join, can also host via /host
</script>

<template>
  <div class="h-screen flex flex-col items-center justify-center gap-8 bg-void">
    <div class="flex items-center gap-3 mb-4">
      <span class="text-4xl">🎤</span>
      <span class="text-3xl font-black tracking-widest text-white">VIDEOKÉ</span>
    </div>

    <p class="text-dim text-sm tracking-wider">Escolha seu modo de acesso</p>

    <div class="flex flex-col gap-4 w-64">
      <NuxtLink
        to="/host"
        class="block text-center py-4 px-6 rounded-xl font-bold text-sm tracking-wider transition-all
               bg-panel neon-border-pink hover:bg-neon-pink/10"
      >
        🖥️ &nbsp; MODO HOST (PC)
      </NuxtLink>

      <NuxtLink
        to="/join"
        class="block text-center py-4 px-6 rounded-xl font-bold text-sm tracking-wider transition-all
               bg-panel neon-border-cyan hover:bg-neon-cyan/10"
      >
        📱 &nbsp; ENTRAR COMO CLIENT
      </NuxtLink>
    </div>
  </div>
</template>

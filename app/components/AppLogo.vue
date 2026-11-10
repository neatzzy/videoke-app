<script setup lang="ts">
withDefaults(defineProps<{ size?: number; textClass?: string }>(), { size: 24, textClass: 'text-sm' })
</script>

<template>
  <div class="flex items-center gap-2.5">
    <svg :width="size" :height="size" viewBox="0 0 64 64" class="shrink-0" aria-hidden="true">
      <circle cx="32" cy="32" r="32" class="fill-accent" />
      <polygon points="20,19 20,45 38,32" class="fill-black" />
      <path d="M43 26q4 6 0 12M49 21q8 11 0 22" fill="none" class="stroke-black" stroke-width="3" stroke-linecap="round" />
    </svg>
    <span :class="['font-extrabold tracking-label', textClass]">VIDEOKÉ</span>
  </div>
</template>

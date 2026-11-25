<script setup lang="ts">
withDefaults(defineProps<{ size?: number; textClass?: string }>(), { size: 24, textClass: 'text-sm' })
</script>

<template>
  <div class="flex items-center gap-2.5">
    <!-- Marca: luminária de palco (cúpula + feixe) e a mancha de luz no chão. -->
    <svg :width="size" :height="size" viewBox="0 0 64 64" class="shrink-0 fill-accent" aria-hidden="true">
      <rect x="30.5" y="0" width="3" height="6" rx="1.5"/>
      <path d="M18 18a14 13 0 0 1 28 0z"/>
      <polygon points="23,21 41,21 58,48 6,48"/>
      <ellipse cx="32" cy="56" rx="28" ry="5"/>
    </svg>
    <span :class="['font-extrabold', textClass]">palquinho</span>
  </div>
</template>

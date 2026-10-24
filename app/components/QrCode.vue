<script setup lang="ts">
import { renderSVG } from 'uqr'

const props = defineProps<{ value: string; size: number }>()
const svg = computed(() => renderSVG(props.value, { border: 0 }))
</script>

<template>
  <!-- svg comes from uqr, built from our own URL — not user HTML -->
  <div
    role="img"
    :aria-label="`QR code: ${value}`"
    class="shrink-0 [&>svg]:w-full [&>svg]:h-full"
    :style="{ width: `${size}px`, height: `${size}px` }"
    v-html="svg"
  />
</template>

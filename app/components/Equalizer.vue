<!-- eslint-disable vue/multi-word-component-names -- nome fixo por contrato (usado pelos outros componentes) -->
<script setup lang="ts">
const props = withDefaults(defineProps<{
  playing?: boolean
  bars?: number
  /** Sem valor: 14px de altura e barras de 3px. */
  size?: 'sm' | 'md'
}>(), { playing: true, bars: 4, size: undefined })

// Ritmos e alturas base por barra; ciclam se `bars` for maior que 4.
const HEIGHTS = [0.6, 1, 0.4, 0.8]
const DURATIONS = [0.9, 1.1, 0.7, 1.0]
const DELAYS = [-0.3, -0.7, -0.1, -0.5]

const containerHeight = computed(() => (props.size === 'sm' ? '12px' : props.size === 'md' ? '16px' : '14px'))
const barWidth = computed(() => (props.size === 'sm' ? '2px' : '3px'))

const barList = computed(() => Array.from({ length: props.bars }, (_, i) => {
  const k = i % HEIGHTS.length
  return { base: HEIGHTS[k], duration: DURATIONS[k], delay: DELAYS[k] }
}))
</script>

<template>
  <span
    class="inline-flex items-end gap-0.5"
    :style="{ height: containerHeight }"
    aria-hidden="true"
  >
    <span
      v-for="(bar, i) in barList"
      :key="i"
      :class="['block rounded-sm bg-accent', playing && 'eq-bar']"
      :style="playing
        ? { width: barWidth, height: '100%', animationDuration: `${bar.duration}s`, animationDelay: `${bar.delay}s`, '--eq-base': bar.base }
        : { width: barWidth, height: '100%', transform: `scaleY(${bar.base})` }"
    />
  </span>
</template>

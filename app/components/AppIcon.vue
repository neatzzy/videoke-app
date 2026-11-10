<script setup lang="ts">
export type IconName =
  | 'search' | 'list' | 'live' | 'live-fill'
  | 'chevron-up' | 'chevron-down' | 'chevron-right'
  | 'arrow-up' | 'arrow-down'
  | 'play' | 'pause' | 'x' | 'check' | 'music'
  | 'thumbs-up' | 'thumbs-down' | 'host' | 'user' | 'more'
  | 'vibrate' | 'vibrate-off'

type Shape = { tag: 'path' | 'circle' | 'rect' | 'polygon'; attrs: Record<string, string | number> }

const props = withDefaults(defineProps<{
  name: IconName
  size?: 16 | 18 | 20 | 24 | 32
  /** Estado ativo: preenche a forma principal (live, search) ou engrossa o traço (list). */
  filled?: boolean
}>(), { size: 18, filled: false })

const ICONS: Record<IconName, Shape[]> = {
  search: [
    { tag: 'circle', attrs: { cx: 11, cy: 11, r: 7 } },
    { tag: 'path', attrs: { d: 'M21 21l-4-4' } },
  ],
  list: [{ tag: 'path', attrs: { d: 'M4 6h16M4 12h16M4 18h10' } }],
  live: [
    { tag: 'circle', attrs: { cx: 12, cy: 12, r: 9 } },
    { tag: 'circle', attrs: { cx: 12, cy: 12, r: 3, fill: 'currentColor' } },
  ],
  'live-fill': [{ tag: 'circle', attrs: { cx: 12, cy: 12, r: 9, fill: 'currentColor' } }],
  'chevron-up': [{ tag: 'path', attrs: { d: 'M6 15l6-6 6 6' } }],
  'chevron-down': [{ tag: 'path', attrs: { d: 'M6 9l6 6 6-6' } }],
  'chevron-right': [{ tag: 'path', attrs: { d: 'M9 6l6 6-6 6' } }],
  'arrow-up': [{ tag: 'path', attrs: { d: 'M18 9l-6-6-6 6M12 4v16' } }],
  'arrow-down': [{ tag: 'path', attrs: { d: 'M18 15l-6 6-6-6M12 20V4' } }],
  play: [{ tag: 'polygon', attrs: { points: '7,4 20,12 7,20', fill: 'currentColor', stroke: 'none' } }],
  pause: [
    { tag: 'rect', attrs: { x: 6, y: 4, width: 4, height: 16, fill: 'currentColor', stroke: 'none' } },
    { tag: 'rect', attrs: { x: 14, y: 4, width: 4, height: 16, fill: 'currentColor', stroke: 'none' } },
  ],
  x: [{ tag: 'path', attrs: { d: 'M6 6l12 12M18 6L6 18' } }],
  check: [{ tag: 'path', attrs: { d: 'M5 12l5 5 9-10' } }],
  music: [
    { tag: 'path', attrs: { d: 'M9 18V5l12-2v13' } },
    { tag: 'circle', attrs: { cx: 6, cy: 18, r: 3 } },
    { tag: 'circle', attrs: { cx: 18, cy: 16, r: 3 } },
  ],
  'thumbs-up': [{
    tag: 'path',
    attrs: { d: 'M7 10v12M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z' },
  }],
  'thumbs-down': [{
    tag: 'path',
    attrs: { d: 'M17 14V2M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z' },
  }],
  host: [
    { tag: 'rect', attrs: { x: 2, y: 3, width: 20, height: 14, rx: 2 } },
    { tag: 'path', attrs: { d: 'M8 21h8M12 17v4' } },
  ],
  user: [
    { tag: 'circle', attrs: { cx: 12, cy: 8, r: 4 } },
    { tag: 'path', attrs: { d: 'M4 21a8 8 0 0 1 16 0' } },
  ],
  more: [
    { tag: 'circle', attrs: { cx: 5, cy: 12, r: 1, fill: 'currentColor' } },
    { tag: 'circle', attrs: { cx: 12, cy: 12, r: 1, fill: 'currentColor' } },
    { tag: 'circle', attrs: { cx: 19, cy: 12, r: 1, fill: 'currentColor' } },
  ],
  vibrate: [
    { tag: 'rect', attrs: { x: 7, y: 2, width: 10, height: 20, rx: 2 } },
    { tag: 'path', attrs: { d: 'M11 19h2M3.5 9.5a4 4 0 0 0 0 5M20.5 9.5a4 4 0 0 1 0 5' } },
  ],
  'vibrate-off': [
    { tag: 'rect', attrs: { x: 7, y: 2, width: 10, height: 20, rx: 2 } },
    { tag: 'path', attrs: { d: 'M3 3l18 18' } },
  ],
}

// Variantes "filled": live vira a forma cheia; search ganha lente translúcida.
const shapes = computed<Shape[]>(() => {
  if (!props.filled) return ICONS[props.name]
  if (props.name === 'live') return ICONS['live-fill']
  if (props.name === 'search') {
    return ICONS.search.map((s, i) => (i === 0
      ? { ...s, attrs: { ...s.attrs, fill: 'currentColor', 'fill-opacity': 0.2 } }
      : s))
  }
  return ICONS[props.name]
})

const strokeWidth = computed(() => (props.filled && props.name === 'list' ? 2.5 : 2))
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <component :is="s.tag" v-for="(s, i) in shapes" :key="i" v-bind="s.attrs" />
  </svg>
</template>

export type HapticKind = 'like' | 'dislike' | 'add' | 'remove'

// Padrões em ms. like/add são pulsos únicos curtos; dislike é longo e duplo;
// remove é curto e duplo, mas bem mais leve que dislike, para não confundir com voto.
const PATTERNS: Record<HapticKind, number[]> = {
  like: [30],
  dislike: [15, 40, 15],
  add: [20],
  remove: [10, 30, 10],
}

const STORAGE_KEY = 'karaoke:haptics'

/**
 * Vibração tátil (Vibration API). Chame dentro de setup: a leitura do localStorage
 * acontece no onMounted para não tocar em window/localStorage durante o SSR.
 */
export function useHaptic() {
  const enabled = useState<boolean>('haptics-enabled', () => true)
  const supported = useState<boolean>('haptics-supported', () => false)

  onMounted(() => {
    supported.value = typeof navigator !== 'undefined' && 'vibrate' in navigator
    try {
      enabled.value = localStorage.getItem(STORAGE_KEY) !== 'false'
    } catch {
      // storage bloqueado: mantém o default (ligado)
    }
  })

  function toggle() {
    enabled.value = !enabled.value
    try {
      localStorage.setItem(STORAGE_KEY, String(enabled.value))
    } catch {
      // sem persistência: a preferência vale só nesta sessão
    }
  }

  function play(kind: HapticKind) {
    if (!enabled.value || !supported.value) return
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    try {
      navigator.vibrate(PATTERNS[kind])
    } catch {
      // vibração recusada pelo navegador (ex.: sem gesto do usuário): ignora
    }
  }

  return { enabled, supported, toggle, play }
}

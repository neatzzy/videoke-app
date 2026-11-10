// Standalone Nuxt flat config (sem @nuxt/eslint): não exige módulo em nuxt.config.ts.
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default createConfigForNuxt({
  features: { tooling: true, stylistic: false },
}).override('nuxt/typescript/rules', {
  ignores: ['.nuxt/**', '.output/**', 'node_modules/**', 'electron/**'],
})

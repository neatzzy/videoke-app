---
name: Videoké
description: Karaokê caseiro — o host mostra a música e a fila na TV; os convidados pedem músicas pelo celular, sem instalar nada.
colors:
  black: "#000000"
  surface: "#121212"
  elevated: "#181818"
  highlight: "#1F1F1F"
  hover: "#252525"
  muted: "#4D4D4D"
  subdued: "#B3B3B3"
  outline: "#7C7C7C"
  accent: "#1ED760"
  accent-hover: "#3BE477"
  negative: "#F3727F"
typography:
  display:
    fontFamily: "Inter, 'Helvetica Neue', helvetica, arial, sans-serif"
    fontSize: "64px"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "normal"
  headline:
    fontFamily: "Inter, 'Helvetica Neue', helvetica, arial, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "normal"
  title:
    fontFamily: "Inter, 'Helvetica Neue', helvetica, arial, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.33
    letterSpacing: "normal"
  body:
    fontFamily: "Inter, 'Helvetica Neue', helvetica, arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, 'Helvetica Neue', helvetica, arial, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.33
    letterSpacing: "1.4px"
  micro:
    fontFamily: "Inter, 'Helvetica Neue', helvetica, arial, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "normal"
rounded:
  default: "4px"
  md: "6px"
  lg: "8px"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.black}"
    rounded: "{rounded.full}"
    padding: "14px 32px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
    textColor: "{colors.black}"
  button-secondary:
    backgroundColor: "{colors.highlight}"
    textColor: "#FFFFFF"
    rounded: "{rounded.full}"
    padding: "0 16px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "#FFFFFF"
    rounded: "{rounded.full}"
    padding: "0 16px"
  input-field:
    backgroundColor: "{colors.highlight}"
    textColor: "#FFFFFF"
    rounded: "{rounded.default}"
    padding: "12px 16px"
  badge-pill:
    backgroundColor: "{colors.highlight}"
    textColor: "{colors.subdued}"
    rounded: "{rounded.full}"
    padding: "4px 12px"
  card:
    backgroundColor: "{colors.elevated}"
    textColor: "#FFFFFF"
    rounded: "{rounded.lg}"
    padding: "16px"
  queue-row:
    backgroundColor: "transparent"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "8px 12px"
---

# Design System: Videoké

> Este documento descreve o visual **implementado** (decisão de manter o design atual, nov/2026). A versão anterior descrevia uma direção neon rosa/ciano ("The Living Room Rave") que nunca chegou ao código; ela foi descartada. Os tokens abaixo são os de `tailwind.config.ts` e `app/assets/css/main.css`.

## 1. Overview

**Creative North Star: "The Dark Jukebox"**

Videoké é uma jukebox escura e plana: fundo preto, painéis em degraus de cinza-carvão e um único verde vivo para tudo que é ação ou está tocando. A tela do host é o palco (player grande, fila ao lado); o celular do convidado é o controle remoto (buscar, votar, ver a fila). A referência é a família dos players de música em tema escuro — familiar de imediato, sem curva de aprendizado numa festa.

O tom é direto e doméstico: português simples, rótulos curtos ("Ao Vivo", "Buscar", "Fila"), sem emoji, sem decoração que não ajude a achar a próxima ação.

**Características principais:**

- Base preta com superfícies em degraus (`black` → `surface` → `elevated` → `highlight` → `hover`); profundidade vem do degrau de cor, não de sombra.
- Um único acento: `accent` (#1ED760). Verde = ação primária, "tocando agora", ativo, online.
- Formas: pílula (`rounded-full`) para tudo que se toca; `rounded-lg` para cartões; `rounded-md` para linhas de lista; `rounded` (4px) só no campo de texto.
- Inter em pesos 400–800. Títulos em 700–800, nunca mais leves.
- Plano: sem glow, sem gradientes decorativos, sem translucidez.

**Risco de marca reconhecido:** a paleta verde sobre cinza-carvão e o logotipo circular de play lembram muito o Spotify. A decisão foi manter. Se o produto ganhar identidade própria, o primeiro lugar a mexer é `accent` e o `AppLogo.vue`; como os componentes usam tokens (`bg-accent`, `text-accent`), a troca é feita em `tailwind.config.ts`.

## 2. Colors

Um preto de palco, quatro degraus de carvão, dois cinzas de texto e um verde.

### Primária

- **Accent** (#1ED760): único acento. Botão primário (Entrar, Buscar música, Curtir), barras do equalizador, barra de progresso, número da posição 1 na fila, título da música tocando, aba ativa, ponto "online", check de música já adicionada. **Accent Hover** (#3BE477) é o estado hover desses botões.

### Superfícies

- **Black** (#000000): raiz da tela do host (moldura entre os painéis), barra inferior de abas do convidado e `body`.
- **Surface** (#121212): fundo de página dos fluxos mobile (`index`, `join`, `room`, `error`) e dos painéis do host (palco e lateral da fila).
- **Elevated** (#181818): cartões (opções do `index`, cartão do QR no host, "Última performance"), placeholder de capa e botão da página de erro.
- **Highlight** (#1F1F1F): campos de texto, chips, badges, item 1 da fila, botão "Próxima", toast.
- **Hover** (#252525): hover dos cartões; fundo da linha "tocando agora" na aba Fila do convidado.

### Texto e linhas

- **Subdued** (#B3B3B3): texto secundário e placeholders (8,93:1 sobre `surface`). Único cinza de texto; texto principal é branco.
- **Muted** (#4D4D4D): trilha da barra de progresso, avatares, placeholders de capa e badge "Próxima". Não usar para texto.
- **Outline** (#7C7C7C): borda dos botões de contorno ("Não curtir", "+ Fila") e anel do campo de texto.

### Semântica

- **Negative** (#F3727F): erros de formulário e o "Não curtir" (6,71:1 sobre `surface`). É o único vermelho do sistema.

### Regras

**Regra do Acento Único.** Verde significa "isto é uma ação ou está acontecendo agora". Não introduza um segundo acento. `negative` é exceção semântica (erro/dislike), não cor de marca.

**Regra dos Tokens.** Cor vem do token. Os hex soltos que existem hoje (ver "Lacunas conhecidas") são dívida, não padrão a copiar.

## 3. Typography

**Fonte:** Inter (auto-hospedada pelo `@nuxt/fonts`, pesos 400/600/700/800, `display: swap`), com `Helvetica Neue`, `helvetica`, `arial`, `sans-serif` como fallback. Uma família só. Código de sala usa `font-mono` do Tailwind.

### Hierarquia

- **Display** (800, 64px, 1.1): título da música tocando no host. O maior texto do sistema.
- **Headline** (800, 2.25rem/36px `text-4xl`): título da tela de entrada ("Entre na sala"). O código da sala no host usa `text-5xl` com `font-mono`, 800 e `tracking-[12px]`.
- **Title** (700, 1.5rem/24px `text-2xl`): nome da música na aba Ao Vivo, estados vazios do host, artista no palco (em `subdued`).
- **Body** (400–700, 0.875rem/14px `text-sm`): nomes de música na fila, textos de apoio, mensagens. Nomes de música em 700; metadados em 400 `subdued`.
- **Label** (700, 0.75rem/12px, `tracking-label` 1.4px): "AGORA CANTANDO", logotipo "VIDEOKÉ", botão Entrar, "Última performance", pílula "SALA". Caixa alta, só em rótulos de verdade.
- **Micro** (700, 0.75rem/12px): rótulos da barra de abas, badges "Próxima" e "Tocando agora" no celular. No host nada fica abaixo de 14px, porque a tela é lida a metros de distância.

Códigos de sala têm tracking próprio: `4px` no campo do `join`, `2px` no `room`, `12px` no host.

### Regras

**Regra do Peso.** Títulos são 700 ou 800. Não há peso 500 nem 300 no sistema.

## 4. Elevation

Plano por padrão. A separação vem do degrau de cor (`surface` → `elevated` → `highlight`) e de bordas de 1px `outline` em botões de contorno. No host, os painéis `surface` ficam sobre a moldura `black` com `gap-2`, o que lê como blocos encaixados.

### Vocabulário de sombra

- **Sombra de capa** (`rgba(0,0,0,.5) 0 8px 24px`): player do host, capa da aba Ao Vivo, placeholder de capa, toast. Único uso de sombra projetada.
- **Anel do campo** (`inset`): `.field` tem anel de 1px `outline` em repouso e de 2px branco em foco. A busca do `room` repete o mesmo valor inline com `focus-within`.
- **Anel de foco**: `focus-visible:ring-2 ring-white` em praticamente todo botão; `ring-accent` só no play do host.

Não há glow, `text-shadow`, `backdrop-blur` nem translucidez.

## 5. Components

### Botão primário

Pílula `accent` com texto preto, 700, caixa alta e `tracking-label` no Entrar; `py-3.5 px-8` e largura total no `join`. Hover `accent-hover`. Desabilitado: `opacity-50`, sem hover. Botões de voto: `h-12`, pílula; Curtir em `accent`, "Não curtir" em contorno `outline` com texto `negative`; ambos com `active:scale-95`.

### Botão secundário e de contorno

Secundário: pílula `highlight` (ex.: "Próxima" no host, `h-8 px-4`). Contorno: pílula transparente, borda `outline`, borda branca no hover (ex.: "+ Fila", `h-11 px-4 text-xs`). A página de erro usa `rounded-lg` `elevated` com `min-h/min-w 44px`.

### Campo de texto (`.field`)

Fundo `highlight`, texto branco, placeholder `subdued`, `px-4 py-3 text-base`, `rounded` (4px), anel inset descrito em Elevation. A busca do convidado é outra variação: `label` `rounded-full` com ícone de lupa, mesmo anel.

### Barra inferior de abas (convidado)

`bg-black`, borda superior `highlight`, `pb-[env(safe-area-inset-bottom)]`. Três abas `flex-1` (Ao Vivo, Buscar, Fila), ícone de 18px acima do rótulo em 12px. Ativa: `accent` e 700; inativa: `subdued`, hover branco. "Ao Vivo" usa um ponto em SVG com o mesmo box de 18px dos outros ícones.

### Fila

Linha `rounded-md px-3 py-2`: número (`w-5`; o 1º em `accent`), capa de 40px, título 700 truncado, subtítulo `subdued` "quem pediu · artista". No host, a linha é arrastável (`cursor-grab`) e tem botões "Mover para cima/baixo" (`w-8 h-8`, com `aria-label`) para reordenar sem arrastar; o item 1 tem fundo `highlight` e badge "Próxima". Na aba Fila do convidado, a música tocando tem fundo `hover`, equalizador e badge "Tocando agora".

### Player do host

Palco com player 16:9 dimensionado por container query, título em Display e chip do cantor (pílula `highlight` com avatar de inicial) por 5 s no início de cada música; depois, rodapé de 72px com capa, play circular branco (`w-8 h-8`), "Próxima", barra de progresso `h-1` (`muted` com preenchimento `accent` animado por `transform: scaleX()`, `duration-1000`) e contagem da fila. Ao fim da música, um overlay "Placar final" aparece por 5 s antes do avanço automático. A lateral da fila traz o cartão "Placar da noite" (top 5 cantores com curtidas, em `highlight`), oculto quando ninguém tem curtidas. O QR para entrada fica num cartão `bg-white` (160px no canto, 220px no estado vazio).

### Logotipo e equalizador

`AppLogo.vue`: círculo `accent` com triângulo de play e duas ondas pretas, seguido de "VIDEOKÉ" em 800 com `tracking-label`. O equalizador é um grupo de 3–4 barras `accent`; no host pulsa com `animate-pulse` só enquanto toca.

### Toast e erro

Toast: `fixed` acima da barra de abas, `highlight`, `rounded-lg`, `role="alert"`, some em 4 s com fade de 0.4s. Erro de formulário: texto `negative` `text-sm` centralizado, `role="alert"`.

### Movimento

Transições curtas de cor/sombra (150ms padrão do Tailwind), `hover:scale-105` no play, `active:scale-95` nos votos. `prefers-reduced-motion` zera animações e transições globalmente (`main.css`).

### Layout

- **Host:** `h-screen w-screen p-2 gap-2 bg-black`; palco `flex-1` e lateral da fila de 340px; sem breakpoints (é uma tela de TV).
- **Mobile:** `h-dvh`/`min-h-dvh`, `px-4`–`px-6`, `max-w-sm` no `join`. Alvos de toque de 44–48px nas ações principais.

## 6. Do's and Don'ts

### Do

- **Do** usar os tokens do Tailwind (`bg-surface`, `bg-elevated`, `text-subdued`, `bg-accent`) em vez de hex.
- **Do** reservar o verde para ação primária e estado "tocando/ativo/online".
- **Do** separar camadas com o degrau de cor; sombra só nas capas, no player e no toast.
- **Do** manter pílulas para o que se toca e `rounded-lg` para cartões.
- **Do** manter alvo de toque ≥ 44px no celular, anel `focus-visible` e `role="alert"` nos erros.
- **Do** escrever em português e curto; sem emoji.

### Don't

- **Don't** adicionar um segundo acento nem usar o verde como decoração.
- **Don't** usar glow, gradiente decorativo ou blur em cartões.
- **Don't** usar texto em `muted` ou `outline`; só `subdued` e branco carregam informação.
- **Don't** introduzir pesos 300/500 ou uma segunda família de fonte.
- **Don't** criar novos cinzas soltos; se faltar um degrau, adicione um token.

## 7. Lacunas conhecidas

Divergências entre o sistema e o código, para corrigir em passes futuros:

- **Hex soltos fora dos tokens:** `#eeeeee` e `#181818` nas pílulas do host, `#3a3a3a` no gradiente do player, `#272727` no hover dos resultados de busca, `#f3727f` e `#fff` inline em SVG e sombras, `bg-white` nos botões e cartões do host. Candidatos a tokens.
- **Dois estilos de campo:** `.field` (4px) e a busca (pílula).
- **Mistura de idiomas:** "Entrar como Client" e placeholder "Ex: NEON" (código que o gerador nunca produz).
- **Viewport e safe areas:** o meta viewport usa `viewport-fit=cover` e o header, o toast e a lateral da sala aplicam `env(safe-area-inset-*)`, mas a barra de abas ainda é full-bleed, sem inset lateral em paisagem.
- **Layouts não verificados em tela real:** o placar da noite e os botões de reordenar na lateral de 340px do host precisam de conferência em TV 1080p.

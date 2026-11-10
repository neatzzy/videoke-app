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
  item:
    fontFamily: "Inter, 'Helvetica Neue', helvetica, arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: "normal"
  body:
    fontFamily: "Inter, 'Helvetica Neue', helvetica, arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, 'Helvetica Neue', helvetica, arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.43
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
  page: "1.25rem"
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
    textColor: "#FFFFFF"
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

> Este documento descreve o visual **implementado** (decisão de manter o design atual, nov/2026). A versão anterior descrevia uma direção neon rosa/ciano ("The Living Room Rave") que nunca chegou ao código; ela foi descartada. Os tokens abaixo são os de `tailwind.config.ts` e `app/assets/css/main.css`. Esta versão registra o estado após a pausa do avanço automático, a sala em duas colunas (a partir de 768px) e a passada de textos e tokens; o que ficou pendente está em "Lacunas conhecidas".

## 1. Overview

**Creative North Star: "The Dark Jukebox"**

Videoké é uma jukebox escura e plana: fundo preto, painéis em degraus de cinza-carvão e um único verde vivo para tudo que é ação ou está tocando. A tela do host é o palco (player grande, fila ao lado); o celular do convidado é o controle remoto (buscar, votar, ver a fila). A referência é a família dos players de música em tema escuro — familiar de imediato, sem curva de aprendizado numa festa.

O tom é direto e doméstico: português simples, rótulos curtos ("Ao Vivo", "Buscar", "Fila"), sem emoji, sem decoração que não ajude a achar a próxima ação.

**Características principais:**

- Base preta com superfícies em degraus (`black` → `surface` → `elevated` → `highlight` → `hover`); profundidade vem do degrau de cor, não de sombra.
- Um único acento: `accent` (#1ED760). Verde = ação primária, "tocando agora", ativo, online.
- Formas: pílula (`rounded-full`) para tudo que se toca; `rounded-lg` para cartões; `rounded-md` para linhas de lista; `rounded` (4px) só no campo de texto e nas miniaturas.
- Inter em pesos 400–800. Títulos em 700–800, nunca mais leves.
- Ícones de um sistema só (`AppIcon`): traço de 2px, `currentColor`, viewBox 24, tamanhos 16/18/20/24/32.
- Movimento curto: 150ms e 250ms numa curva só; nada de animação decorativa.
- Plano: sem glow, sem gradientes decorativos, sem translucidez.

**Risco de marca reconhecido:** a paleta verde sobre cinza-carvão e o logotipo circular de play lembram muito o Spotify. A decisão foi manter. Se o produto ganhar identidade própria, o primeiro lugar a mexer é `accent` e o `AppLogo.vue`; como os componentes usam tokens (`bg-accent`, `text-accent`), a troca é feita em `tailwind.config.ts`.

## 2. Colors

Um preto de palco, quatro degraus de carvão, dois cinzas de texto e um verde.

### Primária

- **Accent** (#1ED760): único acento. Botões de ação (Entrar, Buscar música, Curtir, Avançar agora), equalizador, barra de progresso e de contagem do avanço, anel de foco do play do host, número da posição 1 na fila do host e no placar da noite, título da música tocando na aba Fila, aba ativa, ponto "online", check de música já adicionada, ícone de vibração ativo. **Accent Hover** (#3BE477) é o hover desses botões.
- Exceção registrada: a seta e o número de curtidas em "Última performance" (aba Ao Vivo) usam accent. Os números de pontuação do placar final e do placar da noite são brancos. Ver "Lacunas conhecidas".

### Superfícies

- **Black** (#000000): raiz da tela do host (moldura entre os painéis), barra inferior de abas da sala e `body`.
- **Surface** (#121212): fundo de página das telas de convidado (`index`, `join`, `room`, `error`), painéis do host (palco e lateral da fila) e a sobreposição do placar final.
- **Elevated** (#181818): cartões (opções do `index`, cartão do QR no host, "Última performance", "Placar da noite"), fundo do player do host, placeholder de capa, botões de mover da fila do host e botão da página de erro.
- **Highlight** (#1F1F1F): campos de texto, pílulas e badges (chip do cantor, contador da fila, "Tocando agora"), item 1 da fila do host, botão "Próxima", botões "Cancelar avanço" e "Pausar" do placar final, toast, linhas do "Placar da noite" e o bloco dos botões de mover.
- **Hover** (#252525): hover dos cartões, botões e linhas; fundo da música tocando na aba Fila do convidado.

### Texto e linhas

- **Subdued** (#B3B3B3): texto secundário e placeholders (8,93:1 sobre `surface`). Único cinza de texto; texto principal é branco.
- **Muted** (#4D4D4D): trilhas da barra de progresso e da contagem, avatares, placeholders de capa (incluindo o ícone de placeholder), badge "Próxima" do host. Não usar para texto.
- **Outline** (#7C7C7C): borda dos botões de contorno ("+ Fila", "Não curtir") e anel do campo de texto.
- **Branco** (#FFFFFF, sem token): texto principal, anel de foco e fundo de QR, play do host e pílulas de código. Ver "Lacunas conhecidas".

### Semântica

- **Negative** (#F3727F): erros de formulário, o "Não curtir" (texto e ícone), o número de não curtidas no placar final e em "Última performance" (6,71:1 sobre `surface`). É o único vermelho do sistema.

### Regras

**Regra do Acento Único.** Verde significa "isto é uma ação ou está acontecendo agora". Não introduza um segundo acento. `negative` é exceção semântica (erro/dislike), não cor de marca.

**Regra dos Tokens.** Cor vem do token ou de `currentColor`. Os valores soltos que sobram estão em "Lacunas conhecidas" e são dívida, não padrão a copiar.

## 3. Typography

**Fonte:** Inter (auto-hospedada pelo `@nuxt/fonts`, pesos 400/600/700/800, `display: swap`), com `Helvetica Neue`, `helvetica`, `arial`, `sans-serif` como fallback. Uma família só.

### Hierarquia

- **Display** (800, `clamp(32px, 5vw, 64px)` no host, 1.1, até 2 linhas com `line-clamp-2`): título da música tocando no palco do host. O maior texto do sistema; 64px é o teto.
- **Headline** (800, 2.25rem/36px `text-4xl`, 1.25): título da tela de entrada ("Entre na sala") e nome da música no placar final do host.
- **Title** (700, 1.5rem/24px `text-2xl`, 1.33): nome da música na aba Ao Vivo da sala, títulos de estado vazio e cabeçalho "Fila" da sala. No palco do host, o artista usa a mesma medida em `subdued` e peso 400.
- **Item** (700, 1rem/16px `text-base`, 1.5): nome da música em linha de lista (fila do convidado, resultados de busca, fila e placar da noite do host), título da música tocando na aba Fila e botões de ação do host ("Próxima").
- **Body** (400, 0.875rem/14px `text-sm`, 1.43): metadados ("quem pediu · artista" em `subdued`), posição na fila da sala, textos de apoio, mensagens e toast. No host, nenhum texto fica abaixo de 14px, porque a tela é lida a metros de distância.
- **Label** (700, 0.875rem/14px, 1.43, letter-spacing 1.4px, caixa alta): botões de ação em caixa alta ("Entrar" e "Buscar música"). O logotipo "VIDEOKÉ" usa o mesmo tracking com peso 800 e tamanho próprio (28px na entrada, 18px no host).
- **Micro** (700 ativa / 400 inativa, 0.75rem/12px `text-xs`): rótulos da barra de abas da sala, legenda "Última performance" e badge "Tocando agora" (600). Não há texto menor que 12px.
- **Números de destaque** (só no host): código da sala em 48px (`text-5xl`, 800, `tracking-[12px]`, fonte do sistema); pontuação do placar final em 60px (`text-6xl`, 800).

Códigos de sala usam `font-mono`: na pílula da sala (12px, tracking 2px), no campo do `join` (tracking 4px) e no código pequeno do cartão de QR do host (16px). O código grande do host não usa `font-mono`.

### Regras

**Regra do Peso.** Títulos são 700 ou 800. Não há peso 500 nem 300 no sistema. O peso 600 só aparece em duas badges ("Próxima" e "Tocando agora").

## 4. Elevation & Depth

Plano por padrão. A separação vem do degrau de cor (`surface` → `elevated` → `highlight`) e de bordas de 1px `outline` em botões de contorno. No host, os painéis `surface` ficam sobre a moldura `black` com `gap-2`, o que lê como blocos encaixados. O placar final sobrepõe o palco com `surface`, sem sombra.

### Vocabulário de sombra

- **Sombra de capa** (`shadow-cover`, `rgba(0,0,0,.5) 0 8px 24px`): player do host, capa da aba Ao Vivo, placeholder de capa e toast. Único uso de sombra projetada.
- **Anel do campo** (`inset`): `.field` tem anel de 1px `outline` em repouso e de 2px branco em foco, com valores literais em `main.css`. A busca do convidado repete o padrão com `theme()` nos tokens `surface`, `outline` e branco.
- **Anel de foco**: `focus-visible:ring-2 ring-white` em praticamente todo botão, cartão e linha; com `ring-offset-2 ring-offset-surface` nos botões de voto e no Entrar; nas abas o anel é `inset`; `ring-accent` (com `ring-offset-black`) só no play do host.

Não há glow, `text-shadow`, `backdrop-blur` nem translucidez de superfície.

## 5. Components

### Botão primário

Pílula `accent` com texto preto, 700, 14px, caixa alta e `tracking-label`, em "Entrar" (`min-h-[44px]`, `py-3.5 px-8`, largura total na tela de entrada) e "Buscar música" (mesmo padding, sem largura total). Hover `accent-hover`. Desabilitado: `opacity-50`, sem hover.

### Botões de voto

Par de pílulas de 48px (`h-12`) em grade de duas colunas, com 12px de espaço, texto de 14px 700. **Curtir** em `accent` com texto preto e polegar para cima; **Não curtir** em contorno `outline` com texto e polegar em `negative`. Depois de votar, o escolhido recebe borda branca (no "Não curtir"), e o outro cai para 40% de opacidade. Ambos com `active:scale-95` quando habilitados.

### Botão secundário e de contorno

Secundário: pílula `highlight` de 32px com `px-4`, texto 16px 700 e chevron à direita ("Próxima" no host); hover `hover`. Contorno: pílula transparente, borda `outline`, borda branca no hover ("+ Fila" na busca, `h-11 px-4 text-xs`). Depois de adicionada, a música vira círculo `accent` de 44px com check preto. Botões só de ícone (remover da fila, fechar aviso, vibração) são círculos de 44px com ícone `subdued`, branco no hover.

### Campo de texto (`.field`)

Fundo `highlight`, texto branco, placeholder `subdued`, `px-4 py-3 text-base`, `rounded` (4px), anel inset descrito em Elevation. A busca do convidado é outra variação: pílula `rounded-full` com lupa de 18px e o mesmo anel. Essa dupla de estilos está em "Lacunas conhecidas".

### Barra inferior de abas (convidado)

Fundo `bg-black` de borda a borda, borda superior `highlight`, `pb-[env(safe-area-inset-bottom)]`. O conteúdo fica centralizado na mesma largura da sala: `max-w-xl`, ou `max-w-4xl` quando a sala está em duas colunas. Abaixo de 768px são três abas `flex-1` (Ao Vivo, Buscar, Fila). A partir de 768px são duas (Ao Vivo, Buscar), porque a Fila já aparece ao lado. Ícone de 18px acima do rótulo em 12px, com 6px de espaço e 12px de padding vertical. Ativa: `accent` e 700, com ícone preenchido (`filled`: "Ao Vivo" vira disco cheio; "Fila" engrossa o traço; "Buscar" ganha lente com preenchimento translúcido). Inativa: `subdued`, branco no hover. A troca de aba é simultânea, sem out-in.

### Fila

- **Convidado (aba Fila):** linha `rounded-md px-3 py-2`: posição (`w-5`, 14px `subdued`), nome em Item (16px 700, truncado) e "quem pediu · artista" em Body (14px, truncado). A música tocando fica num bloco `hover` acima da lista, com equalizador de 3 barras, título em `accent` e badge "Tocando agora". Remover (só nas suas músicas) é um círculo de 44px com X.
- **Host (lateral):** linha `rounded-md px-3 py-2`, arrastável (`cursor-grab`). Posição em 16px; capa de 40px (`rounded`, 4px); nome em Item, em até 2 linhas (`line-clamp-2`); "quem pediu · artista" em 14px, truncado. O item 1 tem fundo `highlight`, posição em `accent` e a badge "Próxima" (`muted`, 14px, 600) logo abaixo dos metadados. Os botões "Mover para cima/baixo" (36px, `rounded-md`, `elevated`, chevrons de 16px) reordenam sem arrastar: ficam num bloco `highlight` sobre o canto direito da linha, aparecem com hover ou foco por teclado e ficam sempre visíveis em dispositivos sem hover. O de cima fica desabilitado no item 1 e o de baixo no último.

### Player do host (palco)

Player 16:9 dimensionado por container query (o maior retângulo 16:9 que cabe, centralizado), sobre fundo `elevated`, `rounded-lg` e sombra de capa. Enquanto o player não carrega, o ícone `music` em `muted` aparece no fundo.

Nos primeiros 5 s de cada música, um bloco de informação: "Agora cantando" (14px 700 em `subdued`, com equalizador), título em Display (até 2 linhas), artista em Title em `subdued`, chip do cantor (pílula `highlight` com avatar de inicial em `muted`, 32px) e cartão de QR (`elevated`, `rounded-lg`, QR sobre `bg-white` com `rounded-md`, 160px; 112px quando a altura da janela é de 700px ou menos). Quando o título não cabe ao lado do QR, o cartão desce para baixo do título (`flex-wrap`).

Depois dos 5 s, rodapé `min-h-[72px]` com capa de 48px, play circular `bg-white` de 32px (`hover:scale-105`, anel `accent` no foco), "Próxima" (Botão secundário), barra de progresso `h-1` e contagem da fila ("N na fila" ou "Fila vazia") em 16px `subdued`.

Sem música tocando: título "Nenhuma música tocando" (Title), "Escaneie o QR code com o celular" em 16px `subdued`, QR de 220px e, ao lado, o rótulo "Ou digite o código" (14px 700 em `subdued`) com o código em 48px dentro de pílula `bg-white`. Esse rótulo é frase, não caixa alta.

Ao fim da música, o overlay "Placar final" (`surface` sobre o palco, cartão `elevated`) mostra o rótulo "Placar final" (14px 700), o título da música em Headline e as curtidas e não curtidas em 60px (curtidas em branco, não curtiram em `negative`). Abaixo, uma barra `accent` que encolhe por 5 s e a linha "Próxima música em N s" (ou "Contagem pausada em N s" quando pausada). Botões de 44px: "Cancelar avanço" e "Pausar" / "Retomar" em `highlight`, "Avançar agora" em `accent`. Esc também cancela. Sem cancelamento, a próxima música entra ao fim da contagem. Pausar guarda o tempo restante e retoma dele; o botão troca o próprio texto ("Pausar" / "Retomar"), sem `aria-pressed`.

Na lateral, o "Placar da noite" (cartão `elevated`, top 5 cantores com curtidas em linhas `highlight`; contagem em 14px 700 branca; primeiro lugar com a posição em `accent`) fica oculto enquanto ninguém tem curtidas. Lateral de largura `clamp(260px, 26vw, 340px)`.

### Logotipo, equalizador e ícones

- **Logotipo** (`AppLogo.vue`): círculo `accent` (`fill-accent`) com triângulo de play e duas ondas em `black` (`fill-black`, `stroke-black`), seguido de "VIDEOKÉ" em 800 com `tracking-label`. 48px com texto de 28px na entrada e 32px com texto de 18px no host. Não aparece na sala do convidado.
- **Equalizador** (`Equalizer.vue`): grupo de 4 barras `accent` por padrão (3 na aba Fila), barras de 3px (2px no tamanho `sm`) e altura de 14px (12px `sm`, 16px `md`). Toca só enquanto a música toca; cada barra tem ritmo e fase próprios. Parado, as barras ficam em alturas distintas (0,6 / 1 / 0,4 / 0,8), e o mesmo acontece com reduced-motion.
- **Ícones** (`AppIcon.vue`): traço de 2px, `stroke-linecap` e `linejoin` arredondados, `currentColor`, `aria-hidden`. Tamanhos 16, 18, 20, 24 e 32px. A lista de nomes é fechada: search, list, live (e live-fill), chevron-up/down/right, arrow-up/down, play, pause, x, check, music, thumbs-up/down, host, user, more, vibrate, vibrate-off. Polegares são o voto; setas aparecem só no resultado de votos ("Última performance"); chevrons servem para reordenar e para "Próxima" e "Voltar". Ícones não usam hex.

### Toast e erro

Toast de erro (sala): `fixed` acima da barra de abas, `highlight`, `rounded-lg`, sombra de capa, texto 14px, `role="alert"` e botão de fechar de 44px. Fica até o toque em fechar ou 8 s; pausa enquanto o ponteiro ou o foco está nele. Erro de formulário (entrada): texto `negative` `text-sm` centralizado, `role="alert"`.

### Movimento

Dois tempos e uma curva, expostos como variáveis em `main.css` (`--motion-fast` 150ms, `--motion-base` 250ms, `--ease-standard` cubic-bezier(0.2, 0, 0, 1)) e como classes do Tailwind (`duration-fast`, `duration-base`, `ease-standard`).

- **Estados** (hover, foco, cor, fundo, borda): `duration-fast`, 150ms.
- **Fades e listas:** 150 a 250ms, só `opacity` e `transform`. A troca de aba é simultânea (a aba que sai fica absoluta, sem out-in). A fila do convidado entra e sai com opacidade e `translateY(6px)` em 150ms e reordena em 250ms. O placar da noite reordena por `transform` em 250ms e entra/sai por opacidade em 150ms. Cartão "Última performance", toast e painéis do palco do host (placar final, cartão ↔ barra) usam fade de 250ms.
- **Exceções de tempo real:** a barra de progresso do host (`duration-1000`, `ease-linear`, `scaleX`) e a contagem do avanço automático (5 s, `scaleX` de 1 a 0, com pausa por `animation-play-state`). O equalizador roda em loop, ease-in-out, alternado, com durações de 0,9 / 1,1 / 0,7 / 1,0 s; o pulso de carregamento (`animate-pulse`) tem 2 s.
- **Retorno tátil:** votos `scale(0.95)` no `:active`; play do host `scale(1.05)` no hover, em 150ms.
- **Háptico** (`useHaptic.ts`, Vibration API): padrões distintos por ação. Curtir: pulso de 30 ms. Não curtir: 15-40-15 ms. Adicionar à fila: pulso de 20 ms. Remover: 10-30-10 ms, mais leve que o voto para não confundir. Desligável pelo botão de vibração no cabeçalho da sala (preferência salva no navegador); o botão só aparece onde há suporte. O háptico não dispara com `prefers-reduced-motion`.
- **Avanço automático do host:** ao fim da música, o placar final fica 5 s e a próxima entra. Controles: "Cancelar avanço" (botão e Esc) fecha o placar e deixa a música terminada na tela, sem avançar; "Pausar" / "Retomar" guarda o tempo restante; "Avançar agora" e "Próxima" cancelam a contagem antes de pular. A contagem aparece também em texto, porque a barra zera de imediato com reduced-motion.
- **Reduced motion:** `main.css` zera duração de animação e transição em tudo, e o equalizador fica parado em alturas distintas (0,6 / 1 / 0,4 / 0,8), não como bloco liso.

**Regra do Movimento Curto.** Transições de estado não passam de 250ms. Exceções: a barra de progresso (1000ms) e a contagem do avanço (5000ms), que medem tempo real, e os loops do equalizador e do pulso de carregamento.

### Layout

- **Entrada (`index`, `join`, `error`):** `h-dvh overflow-y-auto` com `page-x page-top page-bottom` (gutter de 1.25rem, respeitando safe-area). Conteúdo em `max-w-sm` centralizado. Os três rolam quando o conteúdo não cabe.
- **Sala (`room`):** `h-dvh overflow-hidden`, cabeçalho, conteúdo e barra de abas contidos em `max-w-xl` centralizado; só o conteúdo rola.
  - **Abaixo de 768px de largura:** uma aba por vez, com Fila na barra.
  - **A partir de 768px:** "Ao Vivo" e "Fila" lado a lado, em duas colunas com rolagem própria (`grid-cols-2`, `gap-6`), contidas em `max-w-4xl`. A barra mostra só Ao Vivo e Buscar. "Buscar" continua tela cheia em `max-w-xl`. A URL não muda ao redimensionar: a aba da URL decide o modo, e uma aba "queue" em tela larga mostra as duas colunas.
  - **Altura de 500px ou menos:** cabeçalho e conteúdo encolhem o topo. Quando a largura também é menor que 768px, a aba Ao Vivo vira capa à esquerda (38% da largura) com título, cantor e votos à direita. Em tela com 768px ou mais de largura, a altura baixa não muda o layout de duas colunas.
  - Alvos de toque de 44 a 48px nas ações principais.
- **Host:** `h-dvh w-full`, dois painéis com `gap-2` (8px): palco e lateral da fila. Moldura de 8px à esquerda, à direita e na base (`max(0.5rem, safe-area)`); o topo tem `pt-2` fixo, sem safe-area. Lateral com `clamp(260px, 26vw, 340px)`; título com `clamp(32px, 5vw, 64px)`; rodapé com `min-h-[72px]`. Não há segunda coluna em tablet, porque o host já é palco mais fila. Não há breakpoint de largura; o único ajuste por altura é o QR compacto, abaixo de 700px de altura.
- **Ritmo de espaçamento:** múltiplos de 4px (`gap-2` 8px, `gap-3` 12px, `gap-4` 16px, `gap-5` 20px, `gap-6`/`gap-8` 24px/32px). Exceções: ajustes de linha de 2px (`mt-0.5`, `gap-0.5`) e `py-3.5` (14px) no botão Entrar. Gutter lateral de 1.25rem (`px-page`, `.page-x`).
- **Alvos no host:** botões de 32 a 36px (play, Próxima, reordenar) são aceitos porque a tela do host é operada com ponteiro ou controle, não com toque. Os botões do placar final têm 44px.

## 6. Do's and Don'ts

### Do

- **Do** usar os tokens do Tailwind (`bg-surface`, `bg-elevated`, `text-subdued`, `bg-accent`) e `currentColor` em ícones, em vez de hex.
- **Do** reservar o verde para ação primária e estado "tocando/ativo/online".
- **Do** separar camadas com o degrau de cor; sombra só nas capas, no player e no toast.
- **Do** manter pílulas para o que se toca e `rounded-lg` para cartões.
- **Do** usar `duration-fast`, `duration-base` e `ease-standard` em qualquer transição nova, e animar só `opacity` e `transform` em entradas e saídas.
- **Do** oferecer cancelamento (botão e Esc) e pausa em qualquer ação automática do host, com o tempo restante em texto.
- **Do** manter alvo de toque ≥ 44px no celular, anel `focus-visible` e `role="alert"` nos erros.
- **Do** escrever em português e curto; sem emoji.

### Don't

- **Don't** adicionar um segundo acento nem usar o verde como decoração. A seta de "Última performance" é exceção registrada, não modelo.
- **Don't** usar glow, `text-shadow`, blur ou gradiente decorativo em cartões e painéis. Não há gradiente no sistema.
- **Don't** criar eyebrows ou kickers em caixa alta com tracking (ex.: um rótulo "AGORA CANTANDO" acima do título). O piso de qualidade proíbe; os existentes são defeito carregado, não regra.
- **Don't** usar texto em `muted` ou `outline`; só `subdued` e branco carregam informação.
- **Don't** usar setas para reordenar nem polegares para resultado: chevrons reordenam, setas mostram o total de votos.
- **Don't** introduzir pesos 300/500 ou uma segunda família de fonte.
- **Don't** criar novos cinzas soltos; se faltar um degrau, adicione um token.
- **Don't** colocar hex em ícones ou em CSS de componente.

## 7. Lacunas conhecidas

Divergências entre o sistema e o código, para corrigir em passes futuros. Nada disto virou regra: o build carrega, mas o sistema não o aprova.

**Verificação**

- **VERIFICADO** (Chromium headless, com API simulada por rotas mockadas): sem overflow horizontal e sem alvo interativo menor que 32px nas larguras de 320, 375 e 768 px, na paisagem de celular e no host em 900 e 1280 px de largura.
- **NÃO VERIFICADO:** aparelhos reais e Safari iOS; teclado virtual com `dvh`; Electron; TV real; o iframe do YouTube (player real); reduced-motion (inclusive a barra da contagem, que zera de imediato); leitor de tela.

**Divergências em aberto**

- **`bg-white` sem token:** cartão de QR, play do host, pílula da sala e código grande do host. O `tailwind.config.ts` não define `white`; o fundo claro vem do padrão do Tailwind. Decidir se vira token ou se fica como exceção de QR e código.
- **Literais restantes em `main.css`:** sombra do `.field` (`rgb(18,18,18)` e `rgb(124,124,124)`), foco do `.field` (`#fff`), `#000` no `body` e `rgba(179,179,179,0.3)` na barra de rolagem. A busca do convidado já usa `theme()`, então há duas formas de escrever o mesmo anel.
- **Pontuação em accent:** a seta e o número de curtidas de "Última performance" usam `accent`. Decidir se fica como dado positivo ou vira branco, como o placar final e o placar da noite.
- **Texto truncado:** o nome da música no placar final (36px, `truncate`) e o nome e o artista na barra inferior do host (`truncate`) cortam com reticências.
- **Título longo no palco:** mais de 2 linhas é cortado com reticências (`line-clamp-2`).
- **Player pequeno nos 5 s:** a 900×600, a fase de informação deixa o player com cerca de 150px de altura.
- **Rótulos de estado em frase:** "Agora cantando" (14px 700 no host, 12px 700 na sala), "Placar final" e "Ou digite o código" (14px 700 no host) não têm token próprio. Saiu a caixa alta, mas a posição de rótulo continua. Ficam documentados onde aparecem (Componentes) e não viraram regra.
- **Link "Voltar" da entrada (`join`):** texto `subdued` com chevron girado e alvo de 44px, sem componente próprio no sistema.
- **Dois estilos de campo:** `.field` (4px, anel inset) e a busca (pílula com o mesmo anel).
- **Só em desenvolvimento:** a pílula do Nuxt DevTools aparece no rodapé em modo dev. Não existe em produção.

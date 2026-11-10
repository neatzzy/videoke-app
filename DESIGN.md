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

> Este documento descreve o visual **implementado** (decisão de manter o design atual, nov/2026). A versão anterior descrevia uma direção neon rosa/ciano ("The Living Room Rave") que nunca chegou ao código; ela foi descartada. Os tokens abaixo são os de `tailwind.config.ts` e `app/assets/css/main.css`. Esta versão registra o estado após a passada de ícones, movimento, espaçamento e layout; o que ficou pendente está em "Lacunas conhecidas".

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

- **Accent** (#1ED760): único acento. Botões de ação (Entrar, Buscar música, Curtir, Avançar agora), equalizador, barra de progresso e de contagem do avanço, número da posição 1 na fila do host, título da música tocando na aba Fila, aba ativa, ponto "online", check de música já adicionada, ícone de vibração ativo. **Accent Hover** (#3BE477) é o estado hover desses botões.
- Exceção registrada: números de pontuação (curtidas no placar final, em "Última performance" e no "Placar da noite") também usam accent. Ver "Lacunas conhecidas".

### Superfícies

- **Black** (#000000): raiz da tela do host (moldura entre os painéis), barra inferior de abas do convidado e `body`.
- **Surface** (#121212): fundo de página dos fluxos mobile (`index`, `join`, `room`, `error`), painéis do host (palco e lateral da fila) e a sobreposição do placar final.
- **Elevated** (#181818): cartões (opções do `index`, cartão do QR no host, "Última performance", "Placar da noite"), placeholder de capa e botão da página de erro.
- **Highlight** (#1F1F1F): campos de texto, pílulas e badges, item 1 da fila do host, botão "Próxima", toast, linhas do "Placar da noite" e os botões de reordenar que aparecem sobre a linha.
- **Hover** (#252525): hover dos cartões e botões; fundo da música tocando na aba Fila do convidado.

### Texto e linhas

- **Subdued** (#B3B3B3): texto secundário e placeholders (8,93:1 sobre `surface`). Único cinza de texto; texto principal é branco.
- **Muted** (#4D4D4D): trilha da barra de progresso e da contagem, avatares, placeholders de capa, badge "Próxima" do host. Não usar para texto.
- **Outline** (#7C7C7C): borda dos botões de contorno ("+ Fila", "Não curtir") e anel do campo de texto.

### Semântica

- **Negative** (#F3727F): erros de formulário, o "Não curtir" (texto e ícone), os números de não curtidas no placar final e em "Última performance" (6,71:1 sobre `surface`). É o único vermelho do sistema.

### Regras

**Regra do Acento Único.** Verde significa "isto é uma ação ou está acontecendo agora". Não introduza um segundo acento. `negative` é exceção semântica (erro/dislike), não cor de marca.

**Regra dos Tokens.** Cor vem do token ou de `currentColor`. Os hex soltos que existem hoje (ver "Lacunas conhecidas") são dívida, não padrão a copiar.

## 3. Typography

**Fonte:** Inter (auto-hospedada pelo `@nuxt/fonts`, pesos 400/600/700/800, `display: swap`), com `Helvetica Neue`, `helvetica`, `arial`, `sans-serif` como fallback. Uma família só. Código de sala usa `font-mono` do Tailwind.

### Hierarquia

- **Display** (800, `clamp(32px, 5vw, 64px)` no host, 1.1): título da música tocando no palco do host. O maior texto do sistema; 64px é o teto.
- **Headline** (800, 2.25rem/36px `text-4xl`, 1.25): título da tela de entrada ("Entre na sala") e o título do placar final no host.
- **Title** (700, 1.5rem/24px `text-2xl`, 1.33): nome da música na aba Ao Vivo, títulos de estado vazio, cabeçalho "Fila" da sala e artista no palco do host (em `subdued`, 24px em 400).
- **Item** (700, 1rem/16px `text-base`, 1.5): nome da música em qualquer linha de lista (fila do convidado, resultados de busca, fila e placar da noite do host), títulos de cartão de opção e botões de ação do host ("Próxima").
- **Body** (400, 0.875rem/14px `text-sm`, 1.43): metadados ("quem pediu · artista" em `subdued`), textos de apoio, mensagens, toast, posição na fila. No host, nenhum texto fica abaixo de 14px, porque a tela é lida a metros de distância.
- **Label** (700, letter-spacing 1.4px, caixa alta): caixa alta com tracking para o botão Entrar (14px) e o logotipo "VIDEOKÉ", que tem tamanho próprio (28px no `index`, 18px no host). Os eyebrows em caixa alta que existem no código (12px na sala, 14px no host) não são regra deste nível; ver "Lacunas conhecidas".
- **Micro** (700 ativa / 400 inativa, 0.75rem/12px `text-xs`): rótulos da barra de abas do celular, badge "Tocando agora" (600) e a legenda "Última performance" do celular. Não há texto menor que 12px.
- **Números de destaque** (só no host): código da sala em 48px (`text-5xl`, 800, `tracking-[12px]`, `font-mono`); pontuação do placar final em 60px (`text-6xl`, 800).

Códigos de sala têm tracking próprio: `4px` no campo do `join`, `2px` no `room`, `12px` no host.

### Regras

**Regra do Peso.** Títulos são 700 ou 800. Não há peso 500 nem 300 no sistema. O peso 600 só aparece em duas badges ("Próxima" e "Tocando agora").

## 4. Elevation & Depth

Plano por padrão. A separação vem do degrau de cor (`surface` → `elevated` → `highlight`) e de bordas de 1px `outline` em botões de contorno. No host, os painéis `surface` ficam sobre a moldura `black` com `gap-2`, o que lê como blocos encaixados. O placar final sobrepõe o palco com `surface`, sem sombra.

### Vocabulário de sombra

- **Sombra de capa** (`rgba(0,0,0,.5) 0 8px 24px`): player do host, capa da aba Ao Vivo, placeholder de capa e toast. Único uso de sombra projetada.
- **Anel do campo** (`inset`): `.field` tem anel de 1px `outline` em repouso e de 2px branco em foco. A busca do `room` repete o mesmo valor inline com `focus-within`.
- **Anel de foco**: `focus-visible:ring-2 ring-white` em praticamente todo botão, cartão e linha; com `ring-offset-2 ring-offset-surface` nos botões de voto e no Entrar; nas abas o anel é `inset`; `ring-accent` só no play do host.

Não há glow, `text-shadow`, `backdrop-blur` nem translucidez.

## 5. Components

### Botão primário

Pílula `accent` com texto preto, 700, 14px, caixa alta e `tracking-label` no Entrar (`min-h-[44px]`, `py-3.5 px-8`, largura total no `join`). "Buscar música" usa a mesma pílula sem largura total. Hover `accent-hover`. Desabilitado: `opacity-50`, sem hover.

### Botões de voto

Par de pílulas de 48px (`h-12`) em grade de duas colunas: **Curtir** em `accent` com texto preto e ícone de polegar para cima; **Não curtir** em contorno `outline` com texto e polegar em `negative`. Depois de votar, o escolhido recebe borda branca (no "Não curtir") e o outro cai para 40% de opacidade. Ambos com `active:scale-95` quando habilitados.

### Botão secundário e de contorno

Secundário: pílula `highlight` de 32px com `px-4`, texto 16px 700 e chevron à direita (ex.: "Próxima" no host); hover `hover`. Contorno: pílula transparente, borda `outline`, borda branca no hover (ex.: "+ Fila", `h-11 px-4 text-xs`). Depois de adicionada, a música vira círculo `accent` de 44px com check preto. Botões só de ícone (remover da fila, fechar toast, vibração) são círculos de 44px com ícone `subdued`, branco no hover.

### Campo de texto (`.field`)

Fundo `highlight`, texto branco, placeholder `subdued`, `px-4 py-3 text-base`, `rounded` (4px), anel inset descrito em Elevation. A busca do convidado é outra variação: `label` `rounded-full` com ícone de lupa de 18px, mesmo anel. Essa dupla de estilos está em "Lacunas conhecidas".

### Barra inferior de abas (convidado)

Fundo `bg-black` de borda a borda, borda superior `highlight`, `pb-[env(safe-area-inset-bottom)]`; o conteúdo das abas fica contido em `max-w-xl` centralizado. Três abas `flex-1` (Ao Vivo, Buscar, Fila), ícone de 18px acima do rótulo em 12px com 6px de espaço. Ativa: `accent` e 700, com o ícone preenchido (`filled`: "Ao Vivo" vira disco cheio; "Fila" engrossa o traço; "Buscar" tem lente translúcida). Inativa: `subdued`, branco no hover.

### Fila

- **Convidado (aba Fila):** linha `rounded-md px-3 py-2`: posição (`w-5`, 14px `subdued`), nome em Item (16px 700, truncado), "quem pediu · artista" em Body. A música tocando fica num bloco `hover` acima da lista, com equalizador e badge "Tocando agora". Remover (só nas suas músicas) é um círculo de 44px com X.
- **Host (lateral):** linha `rounded-md px-3 py-2`, arrastável (`cursor-grab`). Posição em 16px, capa de 40px (`rounded`), nome em Item, "quem pediu · artista" em 14px. O item 1 tem fundo `highlight`, posição em `accent` e badge "Próxima" em `muted`. Os botões "Mover para cima/baixo" (36px, `rounded-md`, `elevated`, chevrons de 16px) reordenam sem arrastar: ficam fora do fluxo, num bloco `highlight` sobre o canto direito da linha, e aparecem com hover ou foco por teclado; em dispositivos sem hover ficam sempre visíveis. O de cima fica desabilitado no item 1 e o de baixo no último.

### Player do host (palco)

Player 16:9 dimensionado por container query (o maior retângulo 16:9 que cabe, centralizado), `rounded-lg`, sombra de capa, fundo com gradiente (ver Lacunas). Nos primeiros 5 s de cada música, título em Display, artista em Title, chip do cantor (pílula `highlight` com avatar de inicial) e cartão de QR `elevated` com `bg-white` de 160px. Depois, rodapé `min-h-[72px]` com capa de 48px, play circular branco de 32px (`hover:scale-105`), "Próxima" (ver Botão secundário), barra de progresso `h-1` (`muted` com preenchimento `accent` por `scaleX`) e contagem da fila.

Ao fim da música, o overlay "Placar final" (`surface`, cartão `elevated`) mostra curtidas e não curtidas em 60px, uma barra de contagem `accent` que encolhe por 5 s e o título da música. Botões: "Cancelar avanço" (`highlight`) e "Avançar agora" (`accent`), ambos com 44px de altura. Esc também cancela. Sem cancelamento, a próxima música entra ao fim da contagem.

Na lateral, o "Placar da noite" (cartão `elevated`, top 5 cantores com curtidas em linhas `highlight`; primeiro lugar em `accent`) fica oculto enquanto ninguém tem curtidas. Lateral de largura `clamp(260px, 26vw, 340px)`.

### Logotipo, equalizador e ícones

- **Logotipo** (`AppLogo.vue`): círculo `accent` com triângulo de play e duas ondas pretas, seguido de "VIDEOKÉ" em 800 com `tracking-label`. Tamanho 48px no `index` (texto 28px) e 32px no host (texto 18px). Não aparece na sala do convidado.
- **Equalizador** (`Equalizer.vue`): grupo de 4 barras `accent` por padrão (3 na aba Fila), largura 3px (2px no tamanho `sm`) e altura de 14px (12px `sm`, 16px `md`). Toca só enquanto a música toca; cada barra tem ritmo e fase próprios. Parado, as barras ficam em alturas distintas.
- **Ícones** (`AppIcon.vue`): traço de 2px, `stroke-linecap` e `linejoin` arredondados, `currentColor`, `aria-hidden`. Tamanhos 16, 18, 20, 24 e 32px. A lista de nomes é fechada: search, list, live (e live-fill), chevron-up/down/right, arrow-up/down, play, pause, x, check, music, thumbs-up/down, host, user, more, vibrate, vibrate-off. Polegares são o voto; setas aparecem só no resultado de votos ("Última performance"); chevrons servem para reordenar e para "Próxima" e "Voltar". Ícones não usam hex.

### Toast e erro

Toast de erro: `fixed` acima da barra de abas, `highlight`, `rounded-lg`, sombra de capa, texto 14px, `role="alert"` e botão de fechar de 44px. Fica até o toque em fechar ou 8 s; pausa enquanto o ponteiro ou o foco está nele. Erro de formulário: texto `negative` `text-sm` centralizado, `role="alert"`.

### Movimento

Dois tempos e uma curva, expostos como variáveis em `main.css` (`--motion-fast` 150ms, `--motion-base` 250ms, `--ease-standard` cubic-bezier(0.2, 0, 0, 1)) e como classes do Tailwind (`duration-fast`, `duration-base`, `ease-standard`).

- **Estados** (hover, foco, cor, fundo, borda): `duration-fast`, 150ms.
- **Fades e listas:** 150 a 250ms, só `opacity` e `transform`. A troca de aba é simultânea (a aba que sai fica absoluta, sem out-in). A fila do convidado entra e sai com opacidade e `translateY(6px)` em 150ms e reordena em 250ms. O placar da noite reordena por `transform` em 250ms e entra/sai por opacidade em 150ms. Cartão "Última performance", toast e painéis do palco do host (placar final, cartão ↔ barra) usam fade de 250ms.
- **Exceções de tempo real:** a barra de progresso do host (`duration-1000`, `ease-linear`, `scaleX`) e a contagem do avanço automático (5 s, `scaleX` de 1 a 0). O equalizador roda em loop, ease-in-out, alternado, com durações de 0,9 / 1,1 / 0,7 / 1,0 s.
- **Retorno tátil:** votos `scale(0.95)` no `:active`; play do host `scale(1.05)` no hover, em 150ms.
- **Háptico** (`useHaptic.ts`, Vibration API): padrões distintos por ação. Curtir: pulso de 30 ms. Não curtir: 15-40-15 ms. Adicionar à fila: pulso de 20 ms. Remover: 10-30-10 ms, mais leve que o voto para não confundir. Desligável pelo botão de vibração no cabeçalho da sala (preferência salva no navegador); o botão só aparece onde há suporte. O háptico não dispara com `prefers-reduced-motion`.
- **Avanço automático do host:** ao fim da música, o placar final fica 5 s e a próxima entra. Cancelar, avançar agora e Esc são as formas de controle; não há pausa.
- **Reduced motion:** `main.css` zera duração de animação e transição em tudo, e o equalizador fica parado em alturas distintas (0,6 / 1 / 0,4 / 0,8), não como bloco liso.

**Regra do Movimento Curto.** Nada de interface passa de 250ms. Só a barra de progresso (1000ms) e a contagem do avanço (5000ms) fogem da regra, porque medem tempo real.

### Layout

- **Entrada (`index`, `join`, `error`):** `h-dvh overflow-y-auto` com `page-x page-top page-bottom` (gutter de 1.25rem, respeitando safe-area). Conteúdo em `max-w-sm` centralizado. Os três rolam quando o conteúdo não cabe.
- **Sala (`room`):** `h-dvh overflow-hidden`, cabeçalho, conteúdo e barra de abas contidos em `max-w-xl` centralizado; só o conteúdo rola. Em paisagem com altura até 500px, o cabeçalho e o conteúdo encolhem o topo. Mobile: alvos de toque de 44 a 48px nas ações principais.
- **Host:** `h-dvh w-full`, `gap-2` entre o palco e a lateral, `pt-2 page-x` e safe-area embaixo. Sem breakpoints de tela: a lateral escala com `clamp`, o título com `clamp(32px, 5vw, 64px)` e o rodapé tem `min-h-[72px]`. Não há segunda coluna em tablet; ver "Lacunas conhecidas".
- **Ritmo de espaçamento:** múltiplos de 4px (`gap-2` 8px, `gap-3` 12px, `gap-4` 16px, `gap-6`/`gap-8` 24px/32px), com a exceção de `py-3.5` (14px) no botão Entrar. Gutter lateral de 1.25rem (`px-page`, `.page-x`).
- **Alvos no host:** botões de 32 a 36px (play, Próxima, reordenar) são aceitos porque a tela do host é operada com ponteiro ou controle, não com toque. A regra de 44px vale para o celular.

## 6. Do's and Don'ts

### Do

- **Do** usar os tokens do Tailwind (`bg-surface`, `bg-elevated`, `text-subdued`, `bg-accent`) e `currentColor` em ícones, em vez de hex.
- **Do** reservar o verde para ação primária e estado "tocando/ativo/online".
- **Do** separar camadas com o degrau de cor; sombra só nas capas, no player e no toast.
- **Do** manter pílulas para o que se toca e `rounded-lg` para cartões.
- **Do** usar `duration-fast`, `duration-base` e `ease-standard` em qualquer transição nova, e animar só `opacity` e `transform` em entradas e saídas.
- **Do** oferecer cancelamento em qualquer ação automática do host (botão e Esc).
- **Do** manter alvo de toque ≥ 44px no celular, anel `focus-visible` e `role="alert"` nos erros.
- **Do** escrever em português e curto; sem emoji.

### Don't

- **Don't** adicionar um segundo acento nem usar o verde como decoração. Pontuação em verde é exceção registrada, não modelo.
- **Don't** usar glow, `text-shadow`, blur ou gradiente decorativo em cartões e painéis. Os gradientes que existem hoje são dívida (ver Lacunas), não exemplo.
- **Don't** criar eyebrows ou kickers em caixa alta com tracking (ex.: um rótulo "AGORA CANTANDO" acima do título). O piso de qualidade proíbe; os existentes são defeito carregado, não regra.
- **Don't** usar texto em `muted` ou `outline`; só `subdued` e branco carregam informação.
- **Don't** usar setas para reordenar nem polegares para resultado: chevrons reordenam, setas mostram o total de votos.
- **Don't** introduzir pesos 300/500 ou uma segunda família de fonte.
- **Don't** criar novos cinzas soltos; se faltar um degrau, adicione um token.
- **Don't** colocar hex em ícones ou em CSS de componente.

## 7. Lacunas conhecidas

Divergências entre o sistema e o código, para corrigir em passes futuros. Nada disto virou regra: o build carrega, mas o sistema não o aprova.

- **Hex e valores soltos fora dos tokens:** `#eeeeee` na pílula de código do host ("SALA" e o código grande), `#3a3a3a` no gradiente do player, `#000` e `#1ed760` fixos no SVG do `AppLogo.vue`, `rgb(...)`/`#fff` literais nas sombras de campo e foco da busca, `rgba(0,0,0,.5)` repetido inline nas capas e no toast em vez de classe, e `bg-white` no play do host e nos cartões de QR (o QR precisa de fundo claro). Candidatos a tokens: `#eeeeee` e a sombra de capa.
- **Gradientes decorativos:** placeholder de capa da aba Ao Vivo (`from-muted to-elevated`) e player do host (`from-[#3a3a3a] to-elevated`). Contrariam a Overview. A decisão é trocar por capa sólida ou manter como exceção de placeholder.
- **Eyebrows em caixa alta (defeito carregado):** "AGORA CANTANDO" (aba Ao Vivo e palco do host), "Última performance", "PLACAR FINAL" e "OU DIGITE O CÓDIGO". Não viram regra. A próxima passada deve trocá-los por texto de sentença ou por título.
- **Contagem do avanço some com reduced motion:** `main.css` zera a duração, então a barra vai a zero de imediato, embora o avanço continue em 5 s. Falta uma versão estática com texto.
- **"Pausar" do avanço automático não existe:** há cancelar e avançar agora. Pausar segue em aberto.
- **Dois estilos de campo:** `.field` (4px, anel inset) e a busca (pílula com o mesmo anel).
- **Mistura de idiomas:** "Entrar como Client" na tela inicial e o placeholder "Ex: NEON" no `join`.
- **Segunda coluna em tablet NÃO implementada:** o host só escala a lateral e o título; a sala e a entrada só têm `max-w`.
- **Layouts não verificados em navegador ou aparelho:** placar da noite, botões de reordenar na lateral do host em 1080p, paisagem compacta do celular e o placar final. Nenhuma verificação visual foi registrada neste passe.
- **Divergências entre o sistema e o código:**
  - O token `label` do frontmatter tem 12px, mas o botão Entrar usa 14px (`text-sm`) e os eyebrows aparecem em 12px na sala e 14px no host. A diferença é de superfície, não de token; o token deveria ser revisto junto com a passada de eyebrows.
  - A pontuação em `accent` (curtidas do placar final, de "Última performance" e do "Placar da noite") estende o acento a dado. Decidir se fica como dado positivo ou vira neutro.
  - O `badge-pill` do frontmatter dizia texto `subdued`; o código usa branco. Corrigido no frontmatter.
  - O peso 600 aparece em duas badges, fora de "títulos 700/800".
  - A barra de progresso usa `duration-1000`, fora dos tokens de movimento. Está registrada como exceção.
  - O `Display` do frontmatter (64px) é o teto; o host usa `clamp`.

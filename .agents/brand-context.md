# Contexto de marca: Palquinho

Fonte para as skills de brand em `.agents/skills/`. Decisões de nov/2026. Atualize este arquivo antes de mudar copy ou identidade.

## Nome e tagline

- Nome: **Palquinho**. Wordmark em minúsculas ("palquinho"); em texto corrido, "Palquinho".
- Tagline: "O karaokê da sala de casa: pede do celular, canta na TV."

## Posicionamento

O karaokê da sala de casa: qualquer música do YouTube, pedida do celular, e a galera vota e disputa o placar da noite.

## Público

- Amigos fazendo karaokê em casa, em festa particular, não em bar.
- Um anfitrião com laptop ou TV, que abre o palco (Electron no PC ou o navegador na TV).
- Convidados no celular, sem instalar nada: entram com o código da sala.

## Concorrentes

- **KaraFun**: já tem QR code e fila pelo celular.
- **Yokee**: karaokê com músicas do YouTube.
- **Fila de Karaokê**: fila pelo celular.
- **Aba do YouTube espelhada no Chromecast**: o jeito improvisado que o palco substitui.

## Diferenciais

1. Grátis.
2. Qualquer música do YouTube.
3. Pedido e votação pelo celular, sem app.
4. Placar da noite: ranking de cantores pelas curtidas e placar final de cada música. É o território de marca que ninguém dos concorrentes ocupa.

## Personalidade

Festa em casa, não balada. Caloroso, brincalhão, direto. A "luz de palco" é iluminação de festa, não clima sombrio: a copy e as interações não precisam acompanhar o escuro.

## Voz

- Português simples, frases curtas.
- Sem emoji.
- Sem caixa alta com tracking: nada de eyebrows, rótulos ou botões em CAPS espaçados.
- "anfitrião", não "host", na copy. (O código usa `host` como nome técnico; isso não vai para a tela.)
- Imperativo de "você" nos convites: "Peça músicas", "Vote pelo celular", "Abra o palco".

## Identidade visual (resumo)

Detalhes completos em `DESIGN.md`. Tokens em `tailwind.config.ts`.

- **North star: "Luz de Palco"**: palco escuro de sala de casa, carvão quente, e uma única luz âmbar para tudo que é ação ou está acontecendo agora.
- **Cores**: surface `#16120F`, elevated `#1E1915`, highlight `#27211C`, hover `#312A24`, muted `#574D44`, subdued `#C2B8AD`, outline `#8A7F74`, accent `#FFB020`, accent-hover `#FFC24D`, negative `#F3727F`, black `#000000`.
- **Acento único**: âmbar. Não introduzir segundo acento; `negative` é só semântico (erro, não curtir).
- **Tipografia**: Inter, pesos 400 a 800. Sem tracking nos títulos e botões.
- **Logo** (`app/components/AppLogo.vue`): luminária de palco pendurada, feixe trapezoidal e mancha de luz no chão, tudo em `accent`, sem disco de fundo. Wordmark "palquinho" em 800, sem letter-spacing.
- **Plano**: sem glow, sem gradiente, sem translucidez. Profundidade vem do degrau de cor.
- **Ícones**: sistema `AppIcon`, traço de 2px, `currentColor`.

## Histórico da rebrand

A identidade anterior ("Videoké", verde sobre cinza-carvão, logotipo circular de play) usava os valores exatos da paleta do Spotify e um logotipo que se parecia com o dele: risco de trade dress. "Videokê" também é termo genérico no Brasil, então não serve como marca isolada (LPI, art. 124, VI). O nome do Electron (`productName`) era "KaraokeLive", um terceiro nome; agora é "Palquinho".

## Não renomeado de propósito

- Nome do pacote npm: `videoke-app`.
- Variável de ambiente: `VIDEOKE_URL`.
- Domínio de deploy: `videoke-app-wine.vercel.app`.
- `appId` do Electron: `com.karaokelive.app`. Trocar quebra a atualização de apps já instalados.
- Nome do repositório (`videoke-app`).

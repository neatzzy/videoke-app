# Especificação de Design e Identidade Visual: Videoke

Este documento descreve as características visuais, paleta de cores, tipografia, layout e os modos de visualização (Host e Client) do aplicativo KARAOKELIVE. Use estas diretrizes para manter a consistência estética ao gerar novos componentes, páginas ou refatorações de código.

---

## 1. Conceito Estético e Paleta de Cores

O projeto adota uma estética **Cyberpunk / Neon / Dark Mode**, focada em ambientes noturnos e de entretenimento. Os elementos possuem alto contraste com brilho sutil (glow) em tons de rosa, roxo e ciano sobre fundos extremamente escuros.

### Cores Hexadecimais

* **Background Principal (Deep Black/Purple):** `#060211` (Um roxo extremamente escuro, quase preto).
* **Background de Cards/Painéis (Dark Purple):** `#130924` (Roxo escuro para destacar contêineres sobre o fundo).
* **Cor de Destaque Principal (Neon Pink):** `#FF007F` / `#E60067` (Utilizado para botões principais, barras de progresso e elementos ativos).
* **Cor de Destaque Secundária (Neon Cyan):** `#00F0FF` / `#00E5FF` (Utilizado para status online, destaques de texto e informações secundárias acesas).
* **Tipografia Principal:** `#FFFFFF` (Branco puro para títulos de alta relevância).
* **Tipografia Secundária / Placeholders:** `#7E6E9B` (Roxo acinzentado opaco para textos de menor importância e labels).

---

## 2. Tipografia e Efeitos Visuais

* **Font-Family:** Sans-serif moderna, geométrica e limpa (ex: *Inter*, *Poppins* ou *System-UI*).
* **Efeito Neon (Text Glow):** Os títulos principais da música atual possuem um efeito de `text-shadow` suave com a cor do tema (Pink/Cyan) para simular iluminação neon.
* **Bordas:** Arredondadas em toda a interface (`border-radius: 8px` a `16px`). Input fields e botões usam cantos ligeiramente mais suaves (`12px` a `16px`).

---

## 3. Visão do Host / Telão (PC - Electron)

Um layout em tela cheia (*widescreen 16:9*) focado no consumo de mídia (vídeo e fila). É dividido em duas colunas principais de proporção assimétrica (Aproximadamente 82% esquerda / 18% direita).

### Coluna da Esquerda (Player & Mídia Principal)

* **Header do Player:** * Indicador visual de áudio com ícone de barras/equalizador (`#FF007F`).
  * Texto em caixa alta pequeno: `AGORA CANTANDO`.
  * Título da música em tamanho gigante (H1), cor branca, com efeito *glow* neon.
  * Nome do artista logo abaixo em tom Neon Cyan (`#00F0FF`).
* **Identificador do Cantor:** Um badge oval contendo um avatar circular com a inicial do usuário e o nome do cantor ao lado (ex: `A Ana Paula 🎤`), com fundo roxo escuro translúcido.
* **Área de Vídeo:** Ocupa a maior parte central inferior, completamente escura (onde o player do YouTube/Letra será renderizado).
* **Barra de Progresso Inferior:** Uma linha fina horizontal que cruza a base da tela. A parte preenchida usa um gradiente de Neon Pink para Roxo, acompanhada do tempo atual (`3:15`) na esquerda e tempo total (`5:55`) na direita em fonte cinza pequena.
* **Controles de Rodapé:** Botão discreto `Próxima` com cantos arredondados e a contagem de músicas restantes (`3 na fila`).

### Coluna da Direita (Painel Lateral de Fila)

* **Largura:** Estreita, estendendo-se verticalmente por toda a altura da tela.
* **Background:** Mais escuro que o resto da tela para criar separação física.
* **Título:** `FILA` em caixa alta com um ícone de lista na cor roxa clara.
* **Items da Fila:** Cards individuais e compactos contendo:
  * Badge circular roxo com o número da posição (ex: `1`, `2`, `3`).
  * Título da música em branco (peso negrito).
  * Nome do usuário que adicionou + Artista em uma linha secundária cinza/roxa opaca (ex: `Carlos · Neil Diamond`).

---

## 4. Visão do Client (Celular - Mobile Web)

Uma interface vertical (*viewport mobile*) limpa e centralizada, simulando um aplicativo nativo dentro de uma moldura segura.

### Tela de Entrada / Login ("Entre na sala")

* **Header:** Logo `KARAOKELIVE` no topo esquerdo acompanhado de um ícone de microfone inclinado em Neon Pink.
* **Título Central:** `Entre na sala` em fonte grande e branca, com o subtítulo `Peça o código para o anfitrião` logo abaixo em tom roxo claro.
* **Inputs (Campos de Formulário):**
  * Labels em caixa alta e espaçadas: `SEU NOME` e `CÓDIGO DA SALA`.
  * Campos de texto com background roxo escuro (`#130924`), bordas arredondadas finas em tom roxo/rosa escuro e texto interno (*placeholder*) em opacidade reduzida (ex: `Ex: Marina`, `E x :   N E O N`).
* **Botão de Ação Principal (Entrar):** Botão largo de ponta a ponta, com background em gradiente roxo/rosa escuro, texto `Entrar` centralizado em cinza claro/branco (peso negrito).
* **Rodapé:** Dica de texto pequena e centralizada: `Dica: use o código NEON para testar`, destacando o código em Neon Cyan.

---

## 5. Elementos Globais de Navegação (Navbar Superior do Host)

* Exibe a logo `KARAOKELIVE` na extrema esquerda.
* Na extrema direita, exibe o status de conexões ativas com um ícone de Wi-Fi/Sinal e o texto `2 online` em ciano.
* Ao lado do status, um badge estilizado em formato de pílula preta com borda neon indicando a identificação da sala: `SALA NEON`.

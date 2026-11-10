# Videoké

Karaoke de casa: um telão (host, PC/TV via Electron) mostra a música tocando e a fila em tempo real, enquanto os convidados buscam músicas e entram na fila pelo próprio celular — sem instalar nada, só um código de sala.

## Stack

- [Nuxt 4](https://nuxt.com/) + Vue 3 + Tailwind CSS
- [Electron](https://www.electronjs.org/) empacotando a tela do host como app desktop
- [Pusher](https://pusher.com/) para realtime (sincroniza host e convidados)
- [Upstash Redis](https://upstash.com/) para persistência de sessão
- YouTube Data API para busca de músicas

## Rodando localmente

```bash
pnpm install
```

Copie `.env.example` para `.env` na raiz e preencha os valores. Todas as variáveis:

| Variável | Uso | Onde é lida |
| --- | --- | --- |
| `API_KEY` | Chave da YouTube Data API (busca de músicas) | servidor (`runtimeConfig.youtubeApiKey`) |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Persistência da sessão no Redis | servidor (`upstashRedisRestUrl/Token`) |
| `PUSHER_APP_ID` / `PUSHER_KEY` / `PUSHER_SECRET` / `PUSHER_CLUSTER` | Pusher, lado servidor (disparo de eventos) | servidor (`pusherAppId`, `pusherKey`, `pusherSecret`, `pusherCluster`) |
| `NUXT_PUBLIC_PUSHER_KEY` / `NUXT_PUBLIC_PUSHER_CLUSTER` | Pusher, lado cliente (assinatura de eventos) | browser (`runtimeConfig.public`) |
| `NUXT_PUBLIC_SITE_URL` | URL pública da sala, usada no QR code do host | browser (`runtimeConfig.public.siteUrl`) |

Segredos (`API_KEY`, tokens do Upstash, `PUSHER_SECRET`) ficam só em `runtimeConfig` privado e nunca chegam ao browser.

**`NUXT_PUBLIC_SITE_URL`** é o endereço que os convidados abrem no celular. O host monta `…/join?code=XXXX` a partir dele para gerar o QR code. Sem a variável, usa a origem da página do host (`window.location`), que em dev costuma ser `localhost` e não funciona no celular: aponte para o IP da rede local (ex.: `http://192.168.0.10:3000`) ou para o domínio de deploy.

**Valores em produção**

- Os valores do `.env` entram como default no build. Para não depender do `.env` no build, defina `NUXT_<CHAVE>` no ambiente de execução (ex.: `NUXT_UPSTASH_REDIS_REST_TOKEN`, `NUXT_PUSHER_SECRET`, `NUXT_YOUTUBE_API_KEY`); no servidor Node (`node .output/server/index.mjs`) eles sobrescrevem os defaults em runtime.
- O build estático (`pnpm run generate` / `electron:build`) grava as variáveis `NUXT_PUBLIC_*` no HTML gerado, então defina-as antes de gerar.
- Os defaults de `runtimeConfig` privados vêm do `.env` no build e podem acabar embutidos em `.output/`. Não distribua `.output/` (ou o instalador do Electron) com segredos de produção.

```bash
pnpm run dev          # servidor web em http://localhost:3000
pnpm run electron:dev # web + janela Electron do host
```

## Build

```bash
pnpm run build           # build web (Nuxt)
pnpm run generate        # build estático
pnpm run electron:build  # empacota o app desktop (dist-electron/)
```

## Fluxo

- `/` — escolha entre modo Host ou Cliente
- `/host` — telão: música tocando, letra/player do YouTube, fila lateral
- `/join` — convidado entra com nome + código da sala
- `/room/[code]` — convidado busca músicas, vota e acompanha a fila pelo celular

## Design

`PRODUCT.md` e `DESIGN.md` documentam o contexto estratégico e o sistema visual (paleta neon, tipografia, componentes) do projeto — mantidos via a skill "Impeccable" do Claude Code.

## Sobre o desenvolvimento

Este projeto foi desenvolvido com o auxílio do [Claude Code](https://claude.com/claude-code), usado tanto na implementação de funcionalidades quanto nas passadas de design/polish da interface.

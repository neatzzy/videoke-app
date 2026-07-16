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
npm install
```

Crie um `.env` na raiz com:

```bash
# YouTube Data API (busca de músicas)
API_KEY=

# Upstash Redis (persistência da sessão)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Pusher (realtime — server-side)
PUSHER_APP_ID=
PUSHER_KEY=
PUSHER_SECRET=
PUSHER_CLUSTER=mt1

# Pusher (client-side, expostas ao browser)
NUXT_PUBLIC_PUSHER_KEY=
NUXT_PUBLIC_PUSHER_CLUSTER=mt1
```

```bash
npm run dev          # servidor web em http://localhost:3000
npm run electron:dev # web + janela Electron do host
```

## Build

```bash
npm run build           # build web (Nuxt)
npm run generate        # build estático
npm run electron:build  # empacota o app desktop (dist-electron/)
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

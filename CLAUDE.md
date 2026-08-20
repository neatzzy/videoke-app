# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Videoké — home karaoke. Host screen (PC/TV via Electron) shows the playing song and live queue; guests search songs and join the queue from their phone, no install, just a room code. Nuxt 4 + Vue 3 + Tailwind, Electron for the host desktop shell, Pusher for realtime sync, Upstash Redis for session persistence, YouTube Data API for song search.

## Commands

```bash
npm run dev            # web dev server, http://localhost:3000
npm run electron:dev   # web dev server + Electron host window together
npm run build           # Nuxt build
npm run generate        # static build (.output/public)
npm run electron:build  # generate + electron-builder package (dist-electron/)
```

No test suite or linter is configured. Requires a `.env` at the repo root — see README.md for the full variable list (YouTube `API_KEY`, `UPSTASH_REDIS_REST_URL`/`TOKEN`, `PUSHER_*` server vars, `NUXT_PUBLIC_PUSHER_*` client vars).

## Architecture

**Session state lives in Redis, not in any server process memory.** `server/utils/sessions.ts` is the single source of truth for session shape (`Session` type) and every mutation (`createSession`, `joinSession`, `addToQueue`, `advanceQueue`, `castVote`). All API routes under `server/api/session/*` are thin: read body → call a `sessions.ts` mutator → `serializeSession()` → trigger a Pusher event → return. Any new session mutation should follow this same pattern rather than touching Redis directly from a route.

**Realtime sync is one-way broadcast, not bidirectional.** Every mutating API route triggers `session-update` on Pusher channel `session-${code}` after writing to Redis (see `server/utils/pusherServer.ts` and `add-song.post.ts` as the reference example). Clients never write over the socket — the `useKaraoke()` composable (`app/composables/useKaraoke.ts`) only *subscribes* and pushes writes via `$fetch` to the API routes. `session.value` (a Nuxt `useState`) is updated either by the initial `$fetch` response or by the `session-update` event handler — keep both paths in sync when changing the session shape.

**Client identity is a `localStorage` UUID, not auth.** `getOrCreateClientId()` in `useKaraoke.ts` mints/reuses `karaoke:clientId`. The server treats `clientId` as the trust boundary: `hostClientId` on the session gates host-only actions (`advanceQueue` checks `session.hostClientId !== clientId`), and `session.clients[clientId]` gates guest actions. There is no password/token — the room code plus this client id is the entire access model.

**Two duplicated type/shape definitions must stay in sync manually**: `QueueItem`/`Session` in `server/utils/sessions.ts` (server-side, full session incl. `hostClientId`, raw `votes.voters`) vs `QueueItem`/`KaraokeSession` in `app/composables/useKaraoke.ts` (client-side, the *serialized* shape from `serializeSession()`). Changing session fields means updating both, plus `serializeSession()` in between.

**Routes**: `/` mode picker, `/host` (Electron host screen — full queue/player view, gated to `hostClientId`), `/join` (guest entry: name + room code), `/room/[code]` (guest view: search, vote, queue). Electron (`electron/main.js`) just loads `/host` in a `BrowserWindow`; in dev it points at the Nuxt dev server, in production it loads the static `.output/public` build and routes client-side to `/host`.

**Voting resets** happen implicitly: `addToQueue` and `advanceQueue` both reset `votes` to `{likes: 0, dislikes: 0, voters: []}` whenever `currentSong` changes. `advanceQueue` returns `previousVotes` (the tally for the song that just ended) alongside the new session so the host UI can show a brief "final score" before it clears — see the `previousVotes` handling in `useKaraoke.ts`'s `session-update` handler.

## Design Context

This project has `PRODUCT.md` (strategic: register, users, purpose, brand personality) and `DESIGN.md` (visual: colors, typography, components — north star "The Living Room Rave", a neon karaoke-venue look kept warm and playful rather than nightclub-serious). Read both before making UI changes. `/impeccable` commands read these automatically.

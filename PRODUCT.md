# Product

## Register

product

## Platform

web

## Users

Friends hosting karaoke at home — one person runs the host screen (laptop/TV, wrapped in Electron for the desktop app), everyone else joins from their own phone browser. Casual private-party context, not a bar or venue: nobody is staffing the room, so the flow has to work with zero setup help.

## Product Purpose

A karaoke session split across two screens: a big host display that becomes the show (now-playing, lyrics, queue) and a phone-based join/queue flow for guests. Success means both halves land — guests get a song queued from their own phone in seconds with no app install, and the host screen feels like a produced show rather than a shared video window.

## Positioning

Turns a laptop plugged into a TV into a real karaoke show — a live now-playing screen and queue, not just a YouTube tab someone's casting.

## Brand Personality

Playful house party, not nightclub. The codebase's existing neon/cyberpunk visual system (pink/cyan glow, deep purple-black) stays as the foundation, but the voice and feel should read warmer and friendlier — fun with friends, not moody venue-serious. Glow and neon are the show's lighting rig, not a mood the copy or interactions need to match.

## Anti-references

Generic karaoke apps: cheap bordered list UIs, default Bootstrap-y form styling, stock "microphone clip-art" karaoke visuals. Also avoid drifting toward corporate SaaS — no dashboard card-grids or admin-tool feel; this is a party screen, not a settings page.

## Design Principles

- Show, don't stream: the host screen should read as a live show (now-playing, lyrics, queue as a real interface) — never a bare video embed with UI bolted on.
- Zero-friction join: the guest phone flow (room code → name → queue) can never stall the party waiting on installs, accounts, or host bottlenecks.
- Warm neon, not cold venue: keep the pink/cyan glow system, but let copy, micro-interactions, and pacing feel like friends messing around, not a nightclub console.
- Don't reach for enterprise defaults: no card grids, no dashboard chrome — every surface should feel like it belongs to a living-room party, not a tool.

## Accessibility & Inclusion

Baseline only — no formal WCAG target. Still hold to standard contrast and readability care given the neon-on-dark palette (glow effects must not compromise legibility of song titles, queue text, or form labels).

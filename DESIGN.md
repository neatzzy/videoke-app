---
name: Videoké
description: A neon karaoke party — big-screen host show plus phone-based queueing for guests.
colors:
  void: "#060211"
  sidebar-void: "#0A0618"
  panel: "#130924"
  neon-pink: "#FF007F"
  neon-cyan: "#00F0FF"
  violet-glow: "#8B00FF"
  dim: "#8B7DA5"
  button-gradient-start: "#2A0A3E"
  button-gradient-end: "#3D0A2A"
typography:
  display:
    fontFamily: "Inter, Poppins, system-ui, sans-serif"
    fontSize: "3rem"
    fontWeight: 900
    lineHeight: 1.1
    letterSpacing: "normal"
  headline:
    fontFamily: "Inter, Poppins, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 900
    lineHeight: 1.15
    letterSpacing: "normal"
  title:
    fontFamily: "Inter, Poppins, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 900
    lineHeight: 1.2
    letterSpacing: "normal"
  body:
    fontFamily: "Inter, Poppins, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, Poppins, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0.15em"
  micro:
    fontFamily: "Inter, Poppins, system-ui, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "normal"
rounded:
  sm: "2px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "linear-gradient({colors.button-gradient-start}, {colors.button-gradient-end})"
    textColor: "#FFFFFF"
    rounded: "{rounded.lg}"
    padding: "16px 24px"
  button-primary-hover:
    backgroundColor: "linear-gradient({colors.button-gradient-start}, {colors.button-gradient-end})"
    textColor: "#FFFFFF"
  button-ghost:
    backgroundColor: "{colors.panel}"
    textColor: "#FFFFFF"
    rounded: "{rounded.lg}"
    padding: "8px 20px"
  input-field:
    backgroundColor: "{colors.panel}"
    textColor: "#FFFFFF"
    rounded: "{rounded.lg}"
    padding: "14px 16px"
  badge-pill:
    backgroundColor: "#000000"
    textColor: "{colors.neon-pink}"
    rounded: "{rounded.full}"
    padding: "4px 12px"
---

# Design System: Videoké

## 1. Overview

**Creative North Star: "The Living Room Rave"**

Videoké takes the neon lighting rig of a real karaoke venue and installs it in someone's living room. The palette is the same deep-purple-black and pink/cyan glow you'd find in a proper show, but the tone stays domestic and playful — this is friends passing a phone around, not a nightclub console. Glow is the string-lights-and-spotlights of the party, never a mood the copy or interactions need to match.

The system explicitly rejects the generic-karaoke-app look: no cheap bordered lists, no default form-library styling, no stock microphone clip-art. It also stays out of corporate-SaaS territory — no dashboard card-grids, no admin-tool chrome. Every surface is either the show (host screen) or the invite (guest phone flow), never a settings page.

**Key Characteristics:**

- Deep near-black purple as the base, never a neutral gray or white canvas.
- Two-color neon signal system: pink for primary/active/singing-now, cyan for status/secondary info.
- Text glow (`text-shadow`) substitutes for elevation — depth comes from light, not shadow.
- Heavy, geometric sans throughout; no serif, no script.
- Generous corner rounding (8–12px) and pill shapes for anything touchable.

## 2. Colors

A near-black purple stage lit by two neon signal colors, with a warm violet-to-maroon gradient reserved for the one primary call-to-action.

### Primary

- **Neon Pink** (#FF007F): The show's main light. Used for the active/primary accent — the "now singing" equalizer and glow, active-state borders, the queue position badges, and anywhere something is *live* or *primary*.

### Secondary

- **Neon Cyan** (#00F0FF): The status color. Reserved for live/connected information — the artist name under a glowing title, the "N online" indicator, the room-code hint text. Never used for primary actions.

### Tertiary

- **Violet Glow** (#8B00FF): Appears only as the far end of the pink→violet progress-bar gradient. Not a standalone UI color; it exists to make the progress fill feel like it's moving through light, not just filling a bar.

### Neutral

- **Void** (#060211): The base background for every full-screen surface (host stage, join screen). Near-black with a purple cast, never true `#000`.
- **Sidebar Void** (#0A0618): A slightly deeper variant of Void, used only to separate the host screen's queue sidebar from the main stage.
- **Panel** (#130924): Card/container background — form fields, the navbar strip, badges. One step lighter than Void so containers read as physically raised without a shadow.
- **Dim** (#8B7DA5): Muted purple-gray for secondary text, placeholders, dividers, and inactive borders. This is the *only* gray in the system; it always carries the brand's purple hue, never a true neutral gray. Lightened from an earlier #7E6E9B during polish — the original only hit 4.48:1 on Void and 4.20:1 on Panel, both under the 4.5:1 AA floor for body text; this value clears both with margin.
- **Button Gradient** (#2A0A3E → #3D0A2A): A muted plum-to-maroon gradient used exclusively for the primary CTA button background — deliberately calmer than the neon accents so the one action that matters doesn't have to compete with the show's own lighting.

### Named Rules

**The Two-Signal Rule.** Only pink and cyan carry meaning. Pink = primary/active/live-now. Cyan = status/secondary/connected. Never swap their roles, never introduce a third signal color.

**The No-True-Neutral Rule.** There is no plain gray or plain white-on-dark in this system. Every "neutral" (Dim, Panel, Void, Sidebar Void) carries the same purple hue at a different depth. A gray that doesn't lean purple is a bug, not a shortcut.

## 3. Typography

**Display/Body Font:** Inter, with Poppins and system-ui as fallbacks (single family, no pairing)

**Character:** One geometric sans carries the whole system at font-weight 900 (black) for anything that needs presence, and 400–700 for everything supporting. The heaviness is what makes headlines feel like a marquee; there's no second typeface competing for attention.

### Hierarchy

- **Display** (900, 3rem/48px `text-5xl`, line-height 1.1): The now-playing song title on the host screen — the single largest, most important text in the system, paired with a pink text-glow.
- **Headline** (900, 2.25rem/36px `text-4xl`, line-height 1.15): Page-level headings on the guest flow, e.g. "Entre na sala."
- **Title** (900, 1.875rem/30px `text-3xl`, line-height 1.2): Secondary state headings, e.g. the host screen's "Aguardando músicas..." empty state.
- **Body** (400, 0.875rem/14px, line-height 1.5): Paragraph and supporting text — singer names, hint copy, queue metadata. Kept short; nothing here runs past a phrase or two.
- **Label** (700, 0.75rem/12px, letter-spacing 0.15em, uppercase): Form labels ("SEU NOME"), section kickers ("AGORA CANTANDO", "FILA"), and status text. Always uppercase, always wide-tracked — this is the system's one recurring "eyebrow" text style, used sparingly and only for genuine labels, never decoratively above every section.
- **Micro** (700, 0.625rem/10px, line-height 1.3): Queue-row metadata (position badges, "added by · artist" secondary lines), counters, and timestamps — the smallest text in the system, for compact, high-density rows where Body would be too loose. Not tracked or uppercase like Label; this is dense data, not a section marker.

A monospace stack appears narrowly for the room code itself (input, badges, hint text) — it's a functional cue that the code is literal characters to type, not a second brand typeface.

### Named Rules

**The One Weight Rule.** Headings are always 900 (black) or nothing close to it — no medium-weight headlines. If it's a heading, it's the heaviest weight in the stack.

## 4. Elevation

Videoké is flat by design — there is no `box-shadow`-based elevation system. Depth is communicated through **light**, not shadow: a lighter panel color (`#130924`) sitting on a darker void (`#060211`) implies a raised surface, and glow (`text-shadow` on headlines, a soft outer `box-shadow` used only as a border-glow on active elements) stands in for the lift a shadow would normally give.

### Shadow Vocabulary

- **Text glow — pink** (`text-shadow: 0 0 20px rgba(255,0,127,.9), 0 0 40px rgba(255,0,127,.5), 0 0 80px rgba(255,0,127,.2)`): Applied to the primary song title. Signals "this is live/primary."
- **Text glow — cyan** (`text-shadow: 0 0 20px rgba(0,240,255,.9), 0 0 40px rgba(0,240,255,.5)`): Applied to artist names and the room-code hint. Signals "this is status/secondary."
- **Border glow — pink** (`box-shadow: 0 0 10px rgba(255,0,127,.2), inset 0 0 10px rgba(255,0,127,.05)` with a 1px pink border): The only place a shadow-like value appears on a container, and it's a glow, not a drop shadow.
- **Border glow — cyan**: Same treatment, cyan variant.

### Named Rules

**The Glow-Not-Shadow Rule.** Never add a conventional dark drop-shadow to imply elevation. If something needs to feel "lifted," lighten its background one step (Void → Panel) or give it a border-glow, never a black shadow.

## 5. Components

Everything touchable is rounded and a little glowing — tactile and playful, built for someone fumbling with their phone mid-party, not a precise console.

### Buttons

- **Shape:** Generously rounded (`rounded-xl`, 12px) on primary/ghost buttons; fully pill-shaped (`rounded-full`) on badges and status chips.
- **Primary:** The join-flow submit button uses the muted plum-to-maroon gradient (#2A0A3E → #3D0A2A) with a translucent pink border (30% opacity), white/90 text, bold, wide letter-spacing. Deliberately calmer than the neon accents elsewhere — the one action that matters shouldn't have to shout over the show's own lighting.
- **Hover / Focus:** Border opacity steps up (30% → 70%) and text goes to full white; transitions are color-only, ~200ms, no movement.
- **Ghost (mode-select / "Próxima" controls):** Panel-colored background, a colored border matching its context (pink or cyan at low opacity), text and border both brighten on hover. No fill change.

### Badges / Pills

- **Style:** Small, pill-shaped (`rounded-full`), black or panel background with a low-opacity colored border and matching text color. Used for the room-code chip, the "online" count, and queue position numbers.
- **State:** Static — these are informational, not interactive.

### Cards / Containers

- **Corner Style:** `rounded-xl` (12px) for panels and queue items; `rounded-lg` (8px) for compact list rows; `rounded-2xl` (16px) for standout emphasis cards — the host sidebar's "next up" card and the guest vote buttons.
- **Background:** Panel (#130924) on Void, or Void/60% on Sidebar Void for queue-item rows — always a lighter step than whatever it sits on.
- **Shadow Strategy:** None; see Elevation. Separation comes from the background-color step, not a shadow.
- **Border:** 1px, Dim at 10–20% opacity, or a neon color at 20–40% opacity when the container is meant to feel "active."
- **Internal Padding:** Compact — `p-2.5`–`p-4` (10–16px) for queue rows and badges; `px-6 py-4`+ for full-width panels.

### Inputs / Fields

- **Style:** Panel-colored background, `rounded-xl`, 1px pink border at 20% opacity, no visible focus ring — focus is communicated by the border brightening to 60% opacity.
- **Focus:** Border-color transition only (no glow, no outline) — kept subtle so the input doesn't compete with the show-style glow used elsewhere.
- **Error:** Inline pink text below the field, centered, same pink as the primary accent — errors don't get a separate color.

### Navigation

- **Style:** A thin translucent panel strip (`bg-panel/60`) with a bottom hairline border (Dim at 10%). Logo + mic emoji on the left, live status (online count in cyan, room-code pill in pink) on the right. No hover states — this bar is informational, not a menu.

### Queue List (signature component)

The right-hand sidebar on the host screen: a vertically stacked list of compact rows, each with a pink circular position badge, a bold white song title (truncated to one line), and a muted secondary line combining who queued it and the artist. Rows are flat (Void/60% background) and only lighten slightly on hover — this list is meant to be glanced at, not interacted with directly from the host screen.

## 6. Do's and Don'ts

### Do

- **Do** keep every background a step on the purple-black ramp (Void → Sidebar Void → Panel) — never introduce a true gray or white surface.
- **Do** use text-glow and border-glow as the only "elevation" — a lighter background step is the fallback when glow isn't appropriate.
- **Do** keep primary actions on the muted plum-to-maroon gradient, reserving full-saturation neon pink for live/active state, not button fills.
- **Do** keep labels/kickers uppercase and wide-tracked, but only on genuine labels (form fields, section headers like "FILA") — not decoratively above every section.
- **Do** keep the tone playful and domestic in copy and motion even though the palette is venue-grade neon — this is a house party, not a nightclub console.

### Don't

- **Don't** build generic-karaoke-app UI: bordered list rows, default form-library styling, stock microphone clip-art. That's the explicit anti-reference.
- **Don't** drift toward corporate SaaS: no dashboard card-grids, no admin-tool chrome, no settings-page density.
- **Don't** add conventional dark drop-shadows anywhere; this system has no shadow-based elevation.
- **Don't** introduce a third accent color. Pink and cyan are the only signal colors — anything else (green/red for votes) stays a narrow, literal exception, never a new brand color.
- **Don't** use a plain gray. If something needs to be muted, it's Dim (#8B7DA5) or a low-opacity version of an existing token, always purple-tinted.
- **Don't** drop Dim below ~90% opacity for text that carries real information (labels, nav state, placeholders) — anything more transparent falls under the 4.5:1 AA floor on both Void and Panel. Reserve low-opacity Dim for genuinely decorative/supporting copy only.
- **Don't** let the mood tip nightclub-serious — no cold, austere, console-like styling; warmth comes through in copy, pacing, and rounded, tactile shapes, not just color.

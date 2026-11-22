# SILENT MALL: THE LAST NIGHT

A browser-playable, top-down pixel-art horror game built with Phaser 3.

Seven years ago the mall sealed itself with forty-one people inside. You were nineteen, your little sister was with you, and her hand slipped out of yours in the crowd. Tonight the building lets you back in.

## Run locally

Open `index.html` through a static web server (for example, GitHub Pages or Vercel). The Phaser runtime is loaded from the existing CDN reference in `index.html`; the remaining game scripts, styles, and fonts are local.

## Controls

- Move: WASD or arrow keys
- Sneak: hold Shift
- Interact / throw: E or Space
- Cinematics: any key advances a shot, Esc skips the sequence
- Touch devices: on-screen joystick and action button

## Chapters

1. The Closing Shift — The Main Atrium — The Listener
2. Below the Food Court — The Service Level — The Usher
3. The Children's Wing — The Toy Department — The Static Child
4. The Lost & Found — The Stockroom — The Collector
5. The Screening Room — The Sealed Cinema — The Projectionist
6. The Heart of the Mall — The Management Floor — The Night Manager
7. The Roof — The Service Stairs — The Mall

Each chapter has its own floor plan, floor material, props, lighting, facade dressing and entity silhouette. The night ends on the roof with a choice: carry her name into the morning, or walk out alone. Two endings.

## Cinematics

`story.js` + `story.css` render every sequence in-browser: a prologue, a three-shot cinematic per chapter, a two-shot memory fragment when each keycard is taken, and the two endings. 49 authored shots across 18 sequences with letterbox, silhouettes, light sweeps, typed captions and a skip control.

## Files

- `index.html` — shell, HUD, panels, script order
- `game.js` — chapters, floor plans, hunter AI, noise, lighting, flow
- `story.js` / `story.css` — narrative data and the cinematic player
- `entities.js` — a distinct silhouette for each of the seven entities
- `chapter-expansion.js` — per-chapter dressing and entity behaviours
- `art.js` / `audio.js` — procedural pixel art and WebAudio
- `style.css` — interface and in-game presentation
- `STORY_BIBLE.md` — the full story, entity files and cutscene inventory

## Notes

No build step: deploy the contents of this folder with `index.html` at the site root. The animated sequences are rendered with CSS and Phaser presentation; there is no pre-rendered video or voice acting.

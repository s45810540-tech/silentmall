# SILENT MALL: THE LAST NIGHT

A browser-playable, top-down pixel-art horror game built with Phaser 3.

## Run locally

Open `index.html` through a static web server (for example, GitHub Pages or Vercel). The Phaser runtime is loaded from the existing CDN reference in `index.html`; the remaining game scripts, styles, and fonts are local.

## Controls

- Move: WASD or arrow keys
- Sneak: hold Shift
- Interact / throw: E or Space
- Touch devices: on-screen joystick and action button

## Chapters

1. The Closing Shift — The Listener
2. Below the Food Court — The Usher
3. The Children's Wing — The Static Child
4. The Heart of the Mall — The Night Manager

The chapters use different floor plans, chapter-specific lighting and props, unique entity behaviours, animated opening/transition sequences, and a final boss phase. The Mall is the overarching antagonist.

## Notes

The animated sequences are rendered in-browser with CSS and Phaser presentation; there is no pre-rendered video or voice acting. The project has no build step: deploy the contents of this folder with `index.html` at the site root.

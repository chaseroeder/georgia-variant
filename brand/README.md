# Brand files

Exported logo files for The Georgia Variant. The letters are vector shapes
(not live text), so these SVGs look the same on any computer. Scale them to
any size, or drop them into Canva, Figma, Google Slides, or a sticker order.

Regenerate after any change: `npm run logos` (script: `scripts/build-logos.mjs`).
Open `preview.html` in a browser to compare them side by side.

| File | Status | Use |
| --- | --- | --- |
| `logo-primary.svg` | **Live**: the logo on the site, emails, and share images | Main logo |
| `logo-stacked.svg` | Backup | Square spaces (profile pictures) |
| `interlock-centered.svg` | Backup concept | V hangs below the G, arms rising into it |
| `interlock-woven.svg` | Backup concept (strongest) | Same, with the V passing over then under the G |
| `interlock-mono.svg` | Backup concept | One color, for print, embroidery, or stamps |
| `interlock-light.svg` | Backup concept | For white backgrounds |

## Colors

| Name | Hex |
| --- | --- |
| Navy | `#012169` |
| Light blue | `#B9D9EB` |
| Mid blue (V on white) | `#3D6FB6` |
| White | `#FFFFFF` |

Typeface: Fraunces SemiBold (open-source, SIL Open Font License). The font file is in `assets/fonts/`.

## Switching the site to the interlock later

The site draws its logo in code, so it stays sharp and updates with the name:
`components/Logo.tsx` (header and footer), `lib/og.tsx` (favicon, phone icon,
share images), and `emails/EmailLogo.tsx` (emails). To switch, copy the
interlock's shapes from `scripts/build-logos.mjs` into those three places.
Or ask for help: it's about a 15-minute change.

## Rules of thumb

- These are original marks. Don't combine them with university logos or seals.
- Keep clear space around the logo of at least a quarter of its width.
- Don't stretch, recolor outside the palette above, or add effects like shadows or glows.

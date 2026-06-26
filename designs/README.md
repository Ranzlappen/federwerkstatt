# Federwerkstatt — Entwurfsgalerie (design showcase)

Five self-contained landing-page concepts to choose from — three atmospheric
**psychological-thriller** directions, one bright **spring / blossom** counterpoint, and
one warm **rustic workshop** with turning gears + scroll animations. They are **showcase
mockups**, not wired into the live site — open them directly in a browser. Branding is
**Federwerkstatt**; the author's real name appears nowhere (placeholder book titles +
invented review blurbs are used).

Open **`index.html`** for the gallery (links all five + the element legend).

## Concepts

| File | Konzept | Direction | Signature element(s) |
|---|---|---|---|
| `concept-a-wald.html` | **Wald** | Cinematic night-forest hero | Drifting fog + parallax pine silhouettes + moonlight |
| `concept-b-naeher.html` | **Näher** | Interactive, kinetic, crimson | Cursor **spotlight** reveal + heartbeat **Puls** line |
| `concept-c-studierzimmer.html` | **Studierzimmer** | Premium dark-editorial noir | Asymmetric **editorial grid** + brass + **film-grain** |
| `concept-d-bluete.html` | **Blüte** | Bright spring / blossom | Falling **petals** (Blütenregen) + blooming palette |
| `concept-e-werkbank.html` | **Werkbank** | Warm rustic wood/leather workshop | Turning brass **cogs** + **parallax backdrop** + scroll-reveal |

## Mix-and-match

Each page is built from the **same named blocks**, marked in the HTML with
`<!-- ELEMENT: <Name> -->`:

`Navigation` · `Hero` · (signature: `Atmosphäre`/`Spotlight`+`Puls`/`Grain`+`Auftakt`) ·
`Neuerscheinung` · `Bücher-Raster` · `Stimmen` · `Newsletter` · `Footer`

Pick the elements you like from different concepts (e.g. *Hero + fog from Wald, the
Bücher-Raster from Studierzimmer, the Spotlight from Näher*) and they get merged into a
single final design, which then replaces the live homepage.

## Tech

- 100% self-contained: one HTML file each, inline CSS/JS/SVG, **no third-party
  requests** (privacy-first). Fonts are the site's self-hosted Garamonds via relative
  `@font-face` (`../assets/fonts/…`).
- Responsive (1440 → 390 px) and `prefers-reduced-motion`-aware (heavy motion disabled).
- `noindex` — these are internal drafts.

## Regenerate the screenshots

Headless Chromium (Playwright) renders desktop + mobile previews into `designs/previews/`
(git-ignored). From the repo root:

```bash
NODE_PATH=/opt/node22/lib/node_modules node scripts/shoot.mjs   # see the script used in review
```

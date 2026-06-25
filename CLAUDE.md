# federwerkstatt — Jekyll blog

A minimal, **German-language** personal blog for an authoress (Schriftstellerin),
built with **Jekyll** and hosted on GitHub Pages. This is a clean, blog-only fork of a
larger multi-app site: no PolyVote, no Blog Admin, no Inventory Manager, no Firebase,
no Giscus comments, no search crawler, no reference pages. Identity is driven by
`_config.yml` variables.

**Name privacy:** the author's real name is intentionally kept **private for now**.
The only public identity is the site name **Federwerkstatt**; `author.name` holds
placeholder initials. Do **not** put the real name into templates, content, commits,
or any built artifact until told otherwise — refer to her as "die Autorin" / the site
name. Content and UI are in German (`lang: de`, `locale: de_DE`).

## Architecture

A single Jekyll static site. There is no build step beyond Jekyll itself and no
JavaScript framework — `assets/js/*.js` are small vanilla-JS enhancements.

- **Content**: posts in `_posts/`, static pages in `pages/`.
- **Templates**: layouts in `_layouts/` (`default`, `home`, `page`, `post`),
  partials in `_includes/`.
- **Config & data**: `_config.yml`; navigation in `_data/pages.yml`; series in
  `_data/series.yml`.
- **Styling**: one main stylesheet `assets/css/style.css` (+ `cookie-consent.css`),
  CSS-custom-property driven, with a dark (default) / light theme toggle.

## Build & Development

```bash
bundle install
bundle exec jekyll serve        # local dev server at http://localhost:4000/
bundle exec jekyll build        # production build into _site/
```

## Key conventions

- **Identity is variable-driven**: `title`, `tagline`, `tagline_short`, `description`,
  and `author.*` live in `_config.yml`. Templates, SEO/OG tags, the feed, and the
  manifest all read these — there is no hardcoded site name in templates. `tagline` is
  the full hero subtitle (also the WebSite JSON-LD `alternateName` and meta-description
  fallback); `tagline_short` is a trimmed variant used **only** in the homepage
  `<title>` to keep it within Google's ~60-char SERP limit (falls back to `tagline` if
  unset). The `/icons/` set is a placeholder; the header/hero show a ❦ (fleuron) glyph,
  not a logo image.
  
- **Hosting**: GitHub Pages **project subpath** — served from
  `https://ranzlappen.github.io/federwerkstatt/`, so `baseurl: "/federwerkstatt"`
  (no custom domain / no `CNAME` yet). It must match the repo name's exact case —
  GitHub Pages paths are case-sensitive, so a wrong-case baseurl 404s every asset
  (= white page). The deploy workflow passes the correct `--baseurl` automatically via
  `actions/configure-pages`. `sw.js` and `site.webmanifest` are Liquid-processed so
  their precache/start_url/icon paths pick up `baseurl`. If you later add a custom apex
  domain, drop a `CNAME`, set `url` to the domain and `baseurl` back to `""`.
- **Post status**: `status` front-matter field — `published` (default), `draft`,
  `placeholder`, `unpublished`. Only `published` and `placeholder` appear in the
  feed (`feed.xml`) and sitemap (`sitemap.xml`); `draft` and `unpublished` also
  render with a `noindex` robots meta (`_includes/head.html`).
- **Post categories**: singular `category:` field. The exact string `"Projects"`
  routes a post to `/projects/`; everything else lands on `/articles/`. Liquid `==` is
  case-sensitive — keep the casing.
- **Post hero images**: `image:` (card cover, 600×340) and `backdrop:` (parallax
  hero) live at `/assets/images/<slug>/<slug>-hero.webp` — genuine WebP, ~1280px,
  ≤50 KB (`cwebp -q 80 -m 6 -metadata none in.png -o out.webp`). SVG heroes are fine
  as-is. The homepage warms the browser cache with these (see `_layouts/home.html`).
- **Navigation**: centralized in `_data/pages.yml` — single source of truth for the
  header, mobile nav, and footer. `menu: [main]`, `[footer]`, or `[main, footer]`.
- **Series**: define in `_data/series.yml`; a post opts in with `series:` +
  `series_order:` and gets a “Part X of Y” navigator (`_includes/series-nav.html`).
- **Papers / "Werke" (PDFs)**: the collection is named `papers` **internally** (config,
  `_papers/`, `_data/papers.yml`, layouts, URLs at `/papers/`) but is presented to
  readers as **"Werke"** (the author's published works) — keep the internal `papers`
  naming, translate only the visible label. Each PDF in `assets/papers/` is a doc in the
  **`papers` collection** (`_papers/`, configured in `_config.yml`) and gets two pages: a
  **landing page** `/papers/<slug>/` (`_layouts/paper.html` — metadata, cover,
  abstract, "Read online" + "Download PDF" CTAs, a BibTeX/citation block, and
  per-paper `ScholarlyArticle` JSON-LD) and a **themed reader** `/papers/<slug>/read/`
  (`_layouts/paper-reader.html` — see "PDF reader" below). The stub docs in
  `_papers/` carry only `pdf:` (the exact filename) + `slug`/`permalink`; **all human
  metadata is single-sourced in `_data/papers.yml`**, keyed by the PDF filename, and
  resolved by filename at render time (also in `_includes/head.html`/`default.html`
  for the per-paper `<title>`, meta description, and `og:image`). Fields: `title`,
  `authors`, `date`, `lang`, `description`, and `cover` (a first-page WebP thumbnail —
  without it a document icon is shown). `/papers/` (`pages/papers.html`) lists the
  collection, newest-first by the abstract's `date`. To add a paper: drop the PDF in
  `assets/papers/` and run **`ruby script/sync_papers.rb`** — it scaffolds the two
  `_papers/` stubs *and* a ready-to-fill `papers.yml` entry. The deploy workflow's
  **`prepare`** job runs the same script and commits the result before the build.
  Optional covers: **`bash script/gen_paper_covers.sh`** (needs `pdftoppm` + `cwebp`
  locally — not in CI) renders `/assets/papers/covers/<slug>.webp` and prints the
  `cover:` lines to paste into `papers.yml`.
- **PDF reader**: the reader page mounts a custom, themed viewer built on
  **self-hosted PDF.js** (`assets/vendor/pdfjs/`, Apache-2.0, version-pinned in
  `VERSION`) driven by `assets/js/pdf-reader.js` (an ES module). Because it's
  first-party there is **no cookie-consent gate**; the ~1.4 MB library is **lazy-loaded
  only on `/read/` pages** (loaded via the `layout == 'paper-reader'` branch in
  `_layouts/default.html`). Features: continuous-scroll rendering, selectable text
  layer, page nav, zoom/fit, find-in-document (highlights matches), a night/invert
  toggle (`localStorage.pdfNight`), and read-aloud TTS — the module extracts the text
  layer into a hidden `[data-read-aloud-source]` element that the shared
  `assets/js/read-aloud.js` engine reads (generalized to honor the source's `lang`).
  Graceful degradation: the server-rendered page shows a Download / Open-raw fallback
  that's only removed once PDF.js renders, so no-JS or a failed load still works. The
  thin reader shell is `noindex` (the landing page is the canonical, indexable entity).
  To bump PDF.js: re-vendor `pdf.min.mjs` + `pdf.worker.min.mjs` + `pdf_viewer.css`
  (trimmed to the `.textLayer` rules) + `LICENSE`, update `VERSION`, bump
  `CACHE_VERSION` in `sw.js`. PDFs are not service-worker cached (the `.pdf` guard in
  `sw.js` keeps the runtime cache bounded).
- **Search**: `Ctrl/Cmd+K` modal (`_includes/search-modal.html` + `assets/js/search.js`)
  runs **client-side Lunr** over the Liquid-generated `search.json`, which indexes
  both **`_posts`** (`type: post`) and the **`papers` collection** (`type: paper`,
  searchable by title/authors/filename, enriched from `_data/papers.yml`). Paper hits
  show a "Paper" badge and link to the paper's landing page (in-tab). It loads Lunr
  from a CDN behind the functional-cookie consent gate — keep it that way; do not add
  a query-time third-party search service.
- **Privacy-first**: no analytics, no first-party cookies, no Firebase/Giscus. The
  only consent-gated third parties are the Lunr CDN (search) and the Chart.js CDN
  (charts on posts); the PDF reader is **self-hosted** and needs no consent. GDPR
  cookie consent with a functional category.
- **Theme**: "Marble & Ink" — charcoal/marble greys with a bronze accent (and an
  oxblood secondary, `--c-accent-2`). **Light "gallery" is the default** (set pre-paint
  in `_includes/head.html` — `data-theme="light"` unless `localStorage.theme === 'dark'`);
  a dark "study" mode toggles via `<html data-theme>` (absence of the attribute = dark).
  The `theme-color` meta + manifest default to the light bg. Palette + fonts are driven
  by the `:root` (dark base) / `[data-theme="light"]` custom properties, so recoloring is
  centralized. A header pin/unpin toggle controls header stickiness.
- **Fonts (self-hosted)**: serif throughout — **EB Garamond** (body, `--f-body`) and
  **Cormorant Garamond** (display headings, `--f-heading`), self-hosted as woff2 in
  `assets/fonts/` (SIL OFL) with `@font-face` + `font-display: swap` at the top of
  `style.css`. No third-party font CDN (privacy-first). The two critical weights are
  `<link rel="preload">`-ed in `_includes/head.html` and precached by `sw.js`. To add
  a weight: drop the woff2 in `assets/fonts/`, add an `@font-face`, bump `CACHE_VERSION`.
- **PWA**: installable (`site.webmanifest`, `display: standalone`) with a
  hand-written `sw.js` (precache shell + `offline.html`; cache-first static,
  network-first navigations). Bump `CACHE_VERSION` in `sw.js` when the shell changes.

## SEO

Fully **hand-rolled** in `_includes/head.html` — there is no jekyll-seo-tag; do not
re-add it, it would duplicate every tag. Invariant: exactly **one** of each per
page — `<title>` (set in `_layouts/default.html`: "Page — Site"; the homepage gets
"Site — `tagline_short`"), meta description, canonical, robots meta, Open Graph + Twitter
cards, and one JSON-LD block per entity (`WebSite` + `Person` with `sameAs` built
from `site.author.*` handles in head; `BlogPosting` + `BreadcrumbList` in
`_layouts/post.html`, where breadcrumbs follow the category routing — `"Projects"`
→ `/projects/`, else `/articles/`; `ScholarlyArticle` + `BreadcrumbList` in
`_layouts/paper.html`).

- **Share images**: `og:image`/`twitter:image` fall back to `site.social_image` when
  a page has no raster `image` — SVG covers are skipped (no platform renders SVG
  previews) and the Twitter card drops from `summary_large_image` to `summary`.
- **Indexability**: `draft`/`unpublished` posts render with `noindex` (and stay out
  of the sitemap/feed); `404.html`/`offline.html` are `noindex` too; everything else
  gets `index, follow, max-image-preview:large`.
- **Papers**: `sitemap.xml` lists every PDF in `assets/papers/` (URI-escaped `loc`)
  **and** each paper's landing page `/papers/<slug>/` (the canonical, indexable
  entity; `lastmod` from the `date` in `_data/papers.yml`). The reader shell
  `/papers/<slug>/read/` is `noindex` and excluded. `/papers/` emits `CollectionPage`
  → `ItemList` JSON-LD pointing at the landing pages; each landing page emits its own
  `ScholarlyArticle` + `BreadcrumbList` (`_layouts/paper.html`), all from the same
  metadata.
- **Verification**: uncomment `google_site_verification` / `bing_site_verification`
  in `_config.yml` when claiming the site in Google Search Console / Bing Webmaster
  Tools, then submit `sitemap.xml` there.
- **GEO (`llms.txt`)**: a curated, plain-Markdown map for LLMs / AI search engines at
  the site root (`/llms.txt`, per llmstxt.org). Liquid-rendered (`layout: null`, like
  `sitemap.xml`/`robots.txt`) so its section links and auto-listed articles stay in
  sync with the build; it reuses the same published/placeholder post filter as the
  sitemap and feed.
- Plus the custom status-filtered `sitemap.xml`, the Atom `feed.xml`, and `robots.txt`.

## Deployment & CI/CD

One workflow, `.github/workflows/jekyll-gh-pages.yml`, builds with Jekyll and deploys
to GitHub Pages on push to `main` (and `workflow_dispatch`). One-time setup: *Settings
→ Pages → Source: GitHub Actions*. It runs three jobs:
- **`prepare`** (`contents: write`) — runs `script/sync_papers.rb` to scaffold the
  `_papers/` collection stubs (landing + reader) and `_data/papers.yml` stubs for any
  new PDFs and commits them back *before* the build, so the deploy reflects them. The commit uses the default `GITHUB_TOKEN`, which does
  **not** re-trigger the workflow — keeping it to a single deployment per push (folding
  this in-line avoids the earlier race where a separate sync commit kicked a second,
  colliding Pages deployment). `build` checks out the post-stub commit via the job's
  `sha` output.
- **`build`** — `bundle exec jekyll build`, uploads the Pages artifact.
- **`deploy`** — `actions/deploy-pages` to the `github-pages` environment.

`.github/dependabot.yml` keeps the `bundler` and `github-actions` ecosystems updated
weekly.

## Project structure

```
├── _config.yml              # Config + identity variables
├── _data/
│   ├── pages.yml            # Navigation registry (nav + footer)
│   ├── series.yml           # Post series definitions
│   └── papers.yml           # Optional metadata for PDFs in assets/papers/
├── _includes/               # head, header, footer, hero, search-modal,
│                            #   post-card, post-list-item, series-nav, toc
├── _layouts/                # default, home, page, post, paper, paper-reader
├── _posts/                  # Blog content (Markdown)
├── _papers/                 # papers collection stubs (landing + reader per PDF)
├── pages/                   # articles, papers, projects, categories, tags, about, privacy, disclaimer
├── script/                  # sync_papers.rb (scaffolds _papers/ + papers.yml stubs),
│                            #   gen_paper_covers.sh (local first-page WebP covers)
├── assets/
│   ├── css/                 # style.css, cookie-consent.css
│   ├── js/                  # main, cookie-consent, search, carousel, charts, read-aloud,
│   │                        #   share, pdf-reader, citation
│   ├── fonts/               # Self-hosted serif woff2 (EB Garamond + Cormorant Garamond)
│   ├── vendor/pdfjs/        # Self-hosted PDF.js (Apache-2.0) for the paper reader
│   ├── papers/              # Published PDFs + covers/ (first-page WebP thumbnails)
├── icons/                   # Favicons + PWA icons (placeholders)
├── feed.xml sitemap.xml search.json robots.txt llms.txt
├── site.webmanifest sw.js offline.html 404.html index.html
└── .github/
    ├── dependabot.yml
    └── workflows/
        └── jekyll-gh-pages.yml   # prepare (papers stubs) + build + deploy to Pages
```

## Post-task self-check

After a change, scan whether it should be reflected in `README.md`, `CLAUDE.md`, the
workflow, or `dependabot.yml` (new conventions, scripts, paths). Auto-apply small
unambiguous doc updates; prompt for anything structural. Skip for pure Q&A.

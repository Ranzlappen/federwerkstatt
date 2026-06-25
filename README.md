# Federwerkstatt

A minimal, SEO-friendly **Jekyll blog** for a German authoress (Schriftstellerin),
hosted on GitHub Pages. Dark/light theme, installable PWA + offline support, RSS,
full hand-rolled SEO metadata (canonical + meta description, JSON-LD structured data,
Open Graph/Twitter cards — exactly one of each per page), a custom status-filtered
sitemap & feed (the sitemap also lists every published work PDF), categories, tags,
series, and client-side search over the site's own posts and works.

The site is in **German** (`lang: de`). It's a clean, blog-only fork of a larger
multi-app site — stripped down to just the blog framework: no PolyVote, no Blog Admin,
no Inventory Manager, no Firebase, no Giscus comments, no reference pages.

> **Privacy note:** the author's real name is intentionally kept private for now. The
> public identity is the site name **Federwerkstatt**; the author is shown only as the
> placeholder initials in `author.name`. Reveal the full identity by editing
> `_config.yml` when ready.

## Quick start

```bash
bundle install
bundle exec jekyll serve        # http://localhost:4000/federwerkstatt/
```

## Make it yours

1. **Identity** — edit `_config.yml`: `title`, `tagline`, `description`, and
   `author.*` (leave a social handle blank to hide its footer icon; leave `email`
   blank to hide the footer contact link). All templates, SEO tags, the feed, and the
   manifest read from these variables.
2. **Hosting** — served from the GitHub Pages **project subpath**
   `https://ranzlappen.github.io/federwerkstatt/`, so `baseurl: "/federwerkstatt"`
   (it must match the repo name's exact case — GitHub Pages paths are case-sensitive,
   and a wrong-case baseurl 404s every CSS/JS asset = white page). The deploy workflow
   passes the right `--baseurl` automatically via `actions/configure-pages`. If you
   later add a custom apex domain, drop a `CNAME` file, set `url` to the domain and
   `baseurl` back to `""`.
3. **Icons** — the files in `/icons/` are **placeholders**. The header/hero show a ❦
   (fleuron) glyph rather than a logo image. Replace the icon set with your own brand
   art (same filenames) when branding lands.
4. **First post** — `_posts/2026-06-06-willkommen-in-der-federwerkstatt.md` is a
   blueprint that documents every front-matter field. Copy it, then delete it.

## Writing a post

Create `_posts/YYYY-MM-DD-slug.md` with front matter:

```yaml
---
title: "Mein Beitrag"
description: "Einzeilige Zusammenfassung für SEO und Karten."
date: 2026-06-06
category: "Anleitung"     # exactly "Projects" → /projects/, anything else → /articles/
tags: [beispiel, jekyll]
image: /assets/images/mein-beitrag/mein-beitrag-hero.webp     # card cover (optional)
backdrop: /assets/images/mein-beitrag/mein-beitrag-hero.webp  # parallax hero (optional)
status: published          # published | draft | placeholder | unpublished
---
```

- **Status**: only `published` and `placeholder` appear in the feed and sitemap.
- **Hero images** live at `/assets/images/<slug>/<slug>-hero.webp` — genuine WebP,
  ~1280px wide, ≤50 KB (`cwebp -q 80 -m 6 -metadata none in.png -o out.webp`).
- **Series**: define one in `_data/series.yml`, then set `series:`/`series_order:`.

## Publishing a work (PDF)

The **Werke** section (`/papers/`) auto-lists every PDF in `assets/papers/`:

1. Drop your PDF into **`assets/papers/`** — name it `YYYY-MM-DD-kurztitel.pdf`
   so works sort newest-first. That's it; it appears on `/papers/` automatically.
2. *(Optional but worth it for search engines)* add a nicer title, author line, date,
   abstract, and language by keying an entry to the **exact filename** in
   **`_data/papers.yml`**:

   ```yaml
   "2026-06-06-mein-werk.pdf":
     title: "Ein schönerer Titel als der Dateiname"
     authors: "A. B."
     date: 2026-06-06          # also: sitemap <lastmod> + JSON-LD datePublished
     lang: de                  # JSON-LD inLanguage (e.g. "de", "en")
     description: "Kurzer Abriss unter dem Titel (in der Sprache des Werks geschrieben)."
   ```

   Without an entry, the work still lists using its filename. The metadata also
   feeds the `ScholarlyArticle` structured data on `/papers/`, the sitemap, and
   the search index — so filling it in is what makes a work findable.

   > Once your PDF is pushed to `main`, the deploy workflow's **`prepare`** job appends
   > a pre-filled stub for it to `_data/papers.yml` automatically (with the date parsed
   > from the filename) — so step 2 becomes "edit the generated stub" rather than
   > "write one from scratch." You can also run it locally: `ruby script/sync_papers.rb`.

## Project structure

```
_config.yml          # Site config + identity variables
_data/pages.yml      # Nav + footer registry (single source of truth)
_data/series.yml     # Post series definitions
_data/papers.yml     # Optional metadata for the PDFs in assets/papers/
_layouts/            # default, home, page, post, paper, paper-reader
_includes/           # head, header, footer, hero, search-modal, cards, toc, series-nav
_posts/              # Your Markdown posts
_papers/             # papers ("Werke") collection stubs (landing + reader per PDF)
pages/               # Static pages (articles, papers, projects, categories, tags, about, privacy, disclaimer)
assets/papers/       # Published work PDFs (auto-listed at /papers/)
assets/css|js|images # style.css + cookie-consent.css; main/search/carousel/charts/read-aloud/share/pdf-reader JS
assets/vendor/pdfjs/ # Self-hosted PDF.js (Apache-2.0) for the work reader
icons/               # Favicons + PWA icons (placeholders — replace)
feed.xml sitemap.xml search.json robots.txt llms.txt site.webmanifest sw.js offline.html 404.html
```

## Deployment

Push to `main` → `.github/workflows/jekyll-gh-pages.yml` builds with Jekyll and
deploys to GitHub Pages. **One-time setup:** in the repo, go to *Settings → Pages →
Build and deployment → Source: GitHub Actions*.

The workflow's first job (`prepare`) auto-commits stub `_data/papers.yml` entries for
newly added PDFs before the build (see *Publishing a work* above), so each push
produces a single deployment.

## License

MIT — see [`LICENSE`](./LICENSE).

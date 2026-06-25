---
title: "Willkommen in der Federwerkstatt"
description: "Ein Musterbeitrag, der jedes Front-Matter-Feld und jede Schreibkonvention dieses Jekyll-Blogs zeigt — kopiere ihn als Vorlage für eigene Beiträge."
keywords: ["jekyll", "blog-vorlage", "erste schritte", "markdown", "front matter"]
date: 2026-06-06
category: "Anleitung"
tags: [erste-schritte, jekyll, vorlage]
image: /assets/images/welcome/welcome-hero.svg
status: published
series: "erste-schritte"
series_order: 1
---

Willkommen! Dieser Beitrag ist die **Vorlage** für alles, was hier entsteht. Er ist
ein echter, veröffentlichter Beitrag — und zugleich lebendige Dokumentation. Dupliziere
diese Datei (`_posts/2026-06-06-willkommen-in-der-federwerkstatt.md`), passe das Front
Matter an, ersetze den Text — und schon hast du einen neuen Beitrag.

## Front Matter, Feld für Feld

Jeder Beitrag beginnt mit einem YAML-Front-Matter-Block zwischen `---`-Zeilen. Das
bedeuten die einzelnen Felder:

| Feld | Pflicht | Wofür es steht |
|---|:---:|---|
| `title` | ✅ | Erscheint in der Karte, im Beitragskopf, im `<title>` und in allen SEO-/OG-Tags. |
| `description` | ✅ | Meta-Beschreibung, Kartentext und Feed-Zusammenfassung. Bitte unter ~155 Zeichen halten. |
| `keywords` | — | Liste von SEO-Schlüsselwörtern. |
| `date` | ✅ | `JJJJ-MM-TT`. Bestimmt die URL und die Sortierung. |
| `category` | ✅ | Eine einzelne Zeichenkette. **`"Projects"`** (exakte Schreibweise) leitet den Beitrag nach `/projects/`; alles andere landet unter `/articles/`. |
| `tags` | — | Liste von Schlagwörtern. Jedes wird zu einem Filter auf `/tags/`. |
| `image` | — | Kartenbild, 600×340 gerendert. Konvention: `/assets/images/<slug>/<slug>-hero.*`. |
| `backdrop` | — | Vollflächiger Parallax-Hero am Kopf der Beitragsseite. Meist dieselbe Datei wie `image`. |
| `status` | — | `published` (Standard), `draft`, `placeholder` oder `unpublished`. Nur `published` und `placeholder` erscheinen im Feed und in der Sitemap. |
| `series` / `series_order` | — | Gruppiert zusammengehörige Beiträge. Definiere die Reihe in `_data/series.yml`; die Beitragsseite zeigt dann einen „Teil X von Y“-Navigator. |

## Kategorien vs. Schlagwörter

- **Die Kategorie** ist einzeln und leitet den Beitrag weiter. Mit `category: "Projects"`
  schickst du einen Beitrag auf die Seite `/projects/`; alles andere (wie hier
  `"Anleitung"`) führt nach `/articles/`.
- **Schlagwörter** sind mehrfach und querschnittlich. Sie speisen `/tags/` und den
  Block „Das könnte dir auch gefallen“ mit verwandten Beiträgen.

## Hero-Bilder

Lege ein Hero-Bild unter `/assets/images/<slug>/<slug>-hero.webp` ab und verweise mit
`image` und `backdrop` darauf. Echte Fotos sollten **echtes WebP** sein, ~1280px breit,
ohne Metadaten, Ziel ≤50 KB:

```bash
cwebp -q 80 -m 6 -metadata none in.png -o out.webp
```

SVG-Heroes (wie der Platzhalter dieses Beitrags) sind bereits winzig und brauchen keine
Optimierung.

## Den Text schreiben

Schreibe einfach Markdown. Tabellen (wie die obige), Codeblöcke, Zitate und Bilder
werden von `assets/css/style.css` automatisch gestaltet.

> Zitate sehen so aus — praktisch für Randbemerkungen und Hinweise.

```js
// Codeblöcke erhalten Syntax-Hervorhebung über Rouge.
function gruss(name) {
  return `Hallo, ${name}!`;
}
```

Das war's. Lösche diesen Beitrag (oder setze `status: draft`), sobald du deinen eigenen
geschrieben hast. Viel Freude beim Schreiben!

#!/usr/bin/env bash
#
# gen_paper_covers.sh — render a first-page WebP cover for every PDF in
# assets/papers/ into assets/papers/covers/<slug>.webp, then print the
# _data/papers.yml `cover:` lines to paste in.
#
# This is an optional, run-locally author tool (not part of CI — it needs native
# tools the GitHub Pages build doesn't have). The /papers/ cards and landing
# pages fall back to a document icon when a paper has no `cover:` entry, so the
# site works fine without it.
#
# Requirements: poppler-utils (pdftoppm) and webp (cwebp). On Debian/Ubuntu:
#   sudo apt-get install poppler-utils webp
# On macOS:  brew install poppler webp
#
# Usage (from the repo root):
#   bash script/gen_paper_covers.sh
#
# The <slug> matches the paper's permalink slug = slugify(PDF basename), the same
# slug used by the _papers/ stubs and script/sync_papers.rb.

set -euo pipefail

SRC="assets/papers"
OUT="assets/papers/covers"
TARGET_W=600          # render width in px; CSS downscales for cards/landing
QUALITY=82

command -v pdftoppm >/dev/null || { echo "Missing pdftoppm (poppler-utils)"; exit 1; }
command -v cwebp >/dev/null    || { echo "Missing cwebp (webp)"; exit 1; }

mkdir -p "$OUT"

slugify() {
  # lower-case, strip accents, non-alphanumerics -> single dash, trim dashes
  echo "$1" | iconv -f UTF-8 -t ASCII//TRANSLIT 2>/dev/null \
    | tr '[:upper:]' '[:lower:]' \
    | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//'
}

echo "# Paste these into _data/papers.yml under each matching entry:"
shopt -s nullglob
for pdf in "$SRC"/*.pdf; do
  base="$(basename "$pdf" .pdf)"
  slug="$(slugify "$base")"
  tmp="$(mktemp -u).png"
  # -f 1 -l 1 = first page only; -scale-to-x sets width, -y keeps aspect.
  pdftoppm -png -f 1 -l 1 -scale-to-x "$TARGET_W" -scale-to-y -1 "$pdf" "${tmp%.png}" >/dev/null
  # pdftoppm appends a page-number suffix; find it.
  rendered="$(ls "${tmp%.png}"-*.png 2>/dev/null | head -1 || true)"
  [ -z "$rendered" ] && rendered="${tmp%.png}-1.png"
  cwebp -quiet -q "$QUALITY" "$rendered" -o "$OUT/$slug.webp"
  rm -f "$rendered"
  echo "#   \"$(basename "$pdf")\":  ->  cover: /assets/papers/covers/$slug.webp"
done

echo
echo "Covers written to $OUT/. Add a 'cover:' line to each paper in _data/papers.yml."

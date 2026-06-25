---
layout: null
# Processed by Jekyll so the precache paths pick up site.baseurl (this site is
# served from a GitHub Pages project subpath). Registered from _includes/head.html.
---
/* sw.js — hand-written service worker for the Jekyll blog.
   No build step, no Workbox. Bump CACHE_VERSION to invalidate. */
"use strict";

const CACHE_VERSION = "federwerkstatt-v1";
const PRECACHE = CACHE_VERSION + "-precache";
const RUNTIME = CACHE_VERSION + "-runtime";

// Minimal app shell so the blog opens offline. Individual posts/pages are
// captured by the runtime cache on first visit.
const PRECACHE_URLS = [
  "{{ '/' | relative_url }}",
  "{{ '/assets/css/style.css' | relative_url }}",
  "{{ '/assets/js/main.js' | relative_url }}",
  "{{ '/assets/fonts/eb-garamond-latin-400-normal.woff2' | relative_url }}",
  "{{ '/assets/fonts/cormorant-garamond-latin-700-normal.woff2' | relative_url }}",
  "{{ '/icons/favicon.ico' | relative_url }}",
  "{{ '/icons/favicon-16x16.png' | relative_url }}",
  "{{ '/icons/favicon-32x32.png' | relative_url }}",
  "{{ '/icons/apple-touch-icon.png' | relative_url }}",
  "{{ '/icons/icon-192.png' | relative_url }}",
  "{{ '/icons/icon-512.png' | relative_url }}",
  "{{ '/icons/icon-maskable-192.png' | relative_url }}",
  "{{ '/icons/icon-maskable-512.png' | relative_url }}",
  "{{ '/site.webmanifest' | relative_url }}",
  "{{ '/offline.html' | relative_url }}",
];

const OFFLINE_URL = "{{ '/offline.html' | relative_url }}";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      // Tolerate any single missing asset so install never fails the worker.
      .then((cache) =>
        Promise.all(
          PRECACHE_URLS.map((u) =>
            cache.add(u).catch(() => {})
          )
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== PRECACHE && k !== RUNTIME)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle same-origin GET.
  if (req.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  // Navigations: network-first, fall back to cache, then the offline page.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(RUNTIME).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() =>
          caches.match(req).then((hit) => hit || caches.match(OFFLINE_URL))
        )
    );
    return;
  }

  // CSS/JS and the search index: network-first (we iterate on these often, and
  // search.json must reflect the latest posts/papers), so a change shows on the
  // next load instead of lagging a CACHE_VERSION behind; fall back to cache offline.
  if (
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith("/search.json")
  ) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === "basic") {
            const copy = res.clone();
            caches.open(RUNTIME).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // PDFs can be large (papers run to ~1 MB each); leave them to the browser so
  // the runtime cache doesn't balloon. The self-hosted PDF.js library (.mjs) is
  // small and immutable, so it still gets cache-first below.
  if (url.pathname.endsWith(".pdf")) {
    return;
  }

  // Other static assets (images, fonts, the vendored .mjs library, etc.):
  // cache-first, then network.
  event.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        if (res && res.status === 200 && res.type === "basic") {
          const copy = res.clone();
          caches.open(RUNTIME).then((c) => c.put(req, copy));
        }
        return res;
      });
    })
  );
});

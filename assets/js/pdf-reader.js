// pdf-reader.js — themed PDF reader built on self-hosted PDF.js (Apache-2.0,
// vendored in assets/vendor/pdfjs/). First-party, so no cookie-consent gate.
// Loaded as an ES module only on /papers/<slug>/read/ pages, so the ~1.4 MB
// library never ships anywhere else. Renders all pages (continuous scroll) with a
// selectable text layer, and wires page nav, zoom, find-in-document, a night
// (invert) toggle, and a hidden text destination for the read-aloud TTS engine.

import * as pdfjsLib from '../vendor/pdfjs/pdf.min.mjs';

pdfjsLib.GlobalWorkerOptions.workerSrc =
  new URL('../vendor/pdfjs/pdf.worker.min.mjs', import.meta.url).href;

(function () {
  'use strict';

  var viewport = document.getElementById('pdf-viewer');
  if (!viewport) return;

  var url = viewport.getAttribute('data-pdf-url');
  if (!url) return;

  var fallback = document.getElementById('pdf-fallback');
  var readSource = document.getElementById('pdf-read-source');

  // Toolbar controls
  var prevBtn = document.getElementById('pdf-prev');
  var nextBtn = document.getElementById('pdf-next');
  var pageInput = document.getElementById('pdf-page-num');
  var pageCountEl = document.getElementById('pdf-page-count');
  var zoomInBtn = document.getElementById('pdf-zoom-in');
  var zoomOutBtn = document.getElementById('pdf-zoom-out');
  var zoomResetBtn = document.getElementById('pdf-zoom-reset');
  var zoomPctEl = document.getElementById('pdf-zoom-pct');
  var searchInput = document.getElementById('pdf-search-input');
  var searchPrevBtn = document.getElementById('pdf-search-prev');
  var searchNextBtn = document.getElementById('pdf-search-next');
  var searchCountEl = document.getElementById('pdf-search-count');
  var nightToggle = document.getElementById('pdf-night-toggle');

  var ZOOM_MIN = 0.5, ZOOM_MAX = 3, ZOOM_STEP = 0.2;
  var FIT = 'fit'; // sentinel: scale to fit container width

  var pdfDoc = null;
  var pages = [];          // { num, container, canvas, textDiv, viewportAt1, textDivs, itemsStr, pageText }
  var currentScale = FIT;  // FIT or a numeric factor
  var currentPage = 1;
  var renderToken = 0;     // guards against overlapping re-renders (zoom spam)
  var dpr = Math.max(1, window.devicePixelRatio || 1);

  // ---- helpers ----------------------------------------------------------------

  function effectiveScale(page1Viewport) {
    if (currentScale !== FIT) return currentScale;
    // Fit to the viewport's content width (minus padding/gutters).
    var avail = viewport.clientWidth - 48;
    if (avail < 200) avail = viewport.clientWidth;
    return avail / page1Viewport.width;
  }

  function updateZoomLabel(scale) {
    if (zoomPctEl) zoomPctEl.textContent = Math.round(scale * 100) + '%';
  }

  function setActivePage(n) {
    if (n === currentPage) return;
    currentPage = n;
    if (pageInput && document.activeElement !== pageInput) pageInput.value = n;
    if (prevBtn) prevBtn.disabled = n <= 1;
    if (nextBtn) nextBtn.disabled = n >= pages.length;
  }

  function scrollToPage(n) {
    var p = pages[n - 1];
    if (p) p.container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ---- rendering --------------------------------------------------------------

  function renderPage(p, scale, token) {
    var vp = p.viewportAt1.clone({ scale: scale });
    var canvas = p.canvas;
    var ctx = canvas.getContext('2d', { alpha: false });

    canvas.width = Math.floor(vp.width * dpr);
    canvas.height = Math.floor(vp.height * dpr);
    canvas.style.width = Math.floor(vp.width) + 'px';
    canvas.style.height = Math.floor(vp.height) + 'px';
    p.container.style.width = Math.floor(vp.width) + 'px';

    var renderTask = p.page.render({
      canvasContext: ctx,
      viewport: vp,
      transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null
    });

    return renderTask.promise.then(function () {
      if (token !== renderToken) return;
      // (Re)build the selectable text layer at this scale.
      p.textDiv.innerHTML = '';
      p.textDiv.style.setProperty('--scale-factor', String(scale));
      p.textDiv.style.width = Math.floor(vp.width) + 'px';
      p.textDiv.style.height = Math.floor(vp.height) + 'px';
      return p.page.getTextContent().then(function (textContent) {
        if (token !== renderToken) return;
        var tl = new pdfjsLib.TextLayer({
          textContentSource: textContent,
          container: p.textDiv,
          viewport: vp
        });
        return tl.render().then(function () {
          p.textDivs = tl.textDivs;
          p.itemsStr = tl.textContentItemsStr;
          p.pageText = p.itemsStr.join('');
        });
      });
    }).catch(function (err) {
      if (err && err.name === 'RenderingCancelledException') return;
      throw err;
    });
  }

  function renderAll() {
    var token = ++renderToken;
    var base = pages[0] ? pages[0].viewportAt1 : null;
    if (!base) return Promise.resolve();
    var scale = effectiveScale(base);
    updateZoomLabel(scale);
    // Render sequentially to keep memory/CPU sane; pages are short.
    var chain = Promise.resolve();
    pages.forEach(function (p) {
      chain = chain.then(function () {
        if (token !== renderToken) return;
        return renderPage(p, scale, token);
      });
    });
    return chain.then(function () {
      if (token === renderToken && searchInput && searchInput.value) runSearch(searchInput.value);
    });
  }

  var resizeTimer = null;
  function onResize() {
    if (currentScale !== FIT) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(renderAll, 150);
  }

  // ---- zoom -------------------------------------------------------------------

  function currentNumericScale() {
    var base = pages[0] ? pages[0].viewportAt1 : null;
    return base ? effectiveScale(base) : 1;
  }

  function applyZoom(next) {
    currentScale = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, next));
    renderAll();
  }

  if (zoomInBtn) zoomInBtn.addEventListener('click', function () { applyZoom(currentNumericScale() + ZOOM_STEP); });
  if (zoomOutBtn) zoomOutBtn.addEventListener('click', function () { applyZoom(currentNumericScale() - ZOOM_STEP); });
  if (zoomResetBtn) zoomResetBtn.addEventListener('click', function () { currentScale = FIT; renderAll(); });

  // ---- page navigation --------------------------------------------------------

  if (prevBtn) prevBtn.addEventListener('click', function () { if (currentPage > 1) scrollToPage(currentPage - 1); });
  if (nextBtn) nextBtn.addEventListener('click', function () { if (currentPage < pages.length) scrollToPage(currentPage + 1); });
  if (pageInput) {
    pageInput.addEventListener('change', function () {
      var n = parseInt(pageInput.value, 10);
      if (!isNaN(n) && n >= 1 && n <= pages.length) scrollToPage(n);
      else pageInput.value = currentPage;
    });
  }

  // ---- find in document -------------------------------------------------------

  var matches = [];     // { page, divStart, divEnd }
  var activeMatch = -1;
  var highlightedDivs = [];

  function clearHighlights() {
    highlightedDivs.forEach(function (d) { d.classList.remove('highlight', 'selected'); });
    highlightedDivs = [];
  }

  function divRangeForOccurrence(p, start, end) {
    // Map a [start,end) char range in pageText to the covering textDiv indices.
    var from = -1, to = -1, pos = 0;
    for (var i = 0; i < p.itemsStr.length; i++) {
      var len = p.itemsStr[i].length;
      var segStart = pos, segEnd = pos + len;
      if (segEnd > start && segStart < end) {
        if (from === -1) from = i;
        to = i;
      }
      pos = segEnd;
      if (segStart >= end) break;
    }
    return { divStart: from, divEnd: to };
  }

  function runSearch(query) {
    clearHighlights();
    matches = [];
    activeMatch = -1;
    var q = (query || '').trim().toLowerCase();
    if (q.length < 2) {
      updateSearchUi();
      return;
    }
    pages.forEach(function (p, idx) {
      if (!p.pageText) return;
      var hay = p.pageText.toLowerCase();
      var from = 0, at;
      while ((at = hay.indexOf(q, from)) !== -1) {
        var range = divRangeForOccurrence(p, at, at + q.length);
        if (range.divStart !== -1) matches.push({ page: idx, divStart: range.divStart, divEnd: range.divEnd });
        from = at + q.length;
      }
    });
    if (matches.length) gotoMatch(0);
    updateSearchUi();
  }

  function gotoMatch(i) {
    if (!matches.length) return;
    clearHighlights();
    activeMatch = (i + matches.length) % matches.length;
    var m = matches[activeMatch];
    var p = pages[m.page];
    if (p && p.textDivs) {
      for (var d = m.divStart; d <= m.divEnd; d++) {
        var span = p.textDivs[d];
        if (span) { span.classList.add('highlight', 'selected'); highlightedDivs.push(span); }
      }
      if (highlightedDivs[0]) highlightedDivs[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    updateSearchUi();
  }

  function updateSearchUi() {
    if (searchCountEl) searchCountEl.textContent = matches.length ? (activeMatch + 1) + '/' + matches.length : (searchInput && searchInput.value.trim().length >= 2 ? '0' : '');
    if (searchPrevBtn) searchPrevBtn.disabled = matches.length === 0;
    if (searchNextBtn) searchNextBtn.disabled = matches.length === 0;
  }

  var searchTimer = null;
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      clearTimeout(searchTimer);
      var v = searchInput.value;
      searchTimer = setTimeout(function () { runSearch(v); }, 250);
    });
    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); gotoMatch(activeMatch + (e.shiftKey ? -1 : 1)); }
    });
  }
  if (searchNextBtn) searchNextBtn.addEventListener('click', function () { gotoMatch(activeMatch + 1); });
  if (searchPrevBtn) searchPrevBtn.addEventListener('click', function () { gotoMatch(activeMatch - 1); });

  // ---- night (invert) toggle --------------------------------------------------

  var NIGHT_KEY = 'pdfNight';
  function applyNight(on) {
    viewport.classList.toggle('is-night', on);
    if (nightToggle) nightToggle.setAttribute('aria-pressed', on ? 'true' : 'false');
  }
  if (nightToggle) {
    nightToggle.addEventListener('click', function () {
      var on = !viewport.classList.contains('is-night');
      try { localStorage.setItem(NIGHT_KEY, on ? '1' : '0'); } catch (e) {}
      applyNight(on);
    });
    try { if (localStorage.getItem(NIGHT_KEY) === '1') applyNight(true); } catch (e) {}
  }

  // ---- keyboard ---------------------------------------------------------------

  document.addEventListener('keydown', function (e) {
    var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement && document.activeElement.tagName);
    if (e.key === '/' && !typing) { e.preventDefault(); if (searchInput) searchInput.focus(); return; }
    if (typing) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { if (currentPage < pages.length) { e.preventDefault(); scrollToPage(currentPage + 1); } }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { if (currentPage > 1) { e.preventDefault(); scrollToPage(currentPage - 1); } }
    else if (e.key === '+' || e.key === '=') { e.preventDefault(); applyZoom(currentNumericScale() + ZOOM_STEP); }
    else if (e.key === '-') { e.preventDefault(); applyZoom(currentNumericScale() - ZOOM_STEP); }
  });

  // ---- read-aloud source ------------------------------------------------------

  function buildReadSource() {
    if (!readSource) return;
    readSource.innerHTML = '';
    pages.forEach(function (p) {
      if (!p.pageText) return;
      var para = document.createElement('p');
      para.textContent = p.pageText.replace(/\s+/g, ' ').trim();
      if (para.textContent) readSource.appendChild(para);
    });
  }

  // ---- bootstrap --------------------------------------------------------------

  function failed(message) {
    if (!fallback) return;
    fallback.innerHTML =
      '<p>Der Reader im Browser konnte nicht geladen werden.</p>' +
      '<p class="paper-reader__fallback-note"><a href="' + url + '" target="_blank" rel="noopener">PDF öffnen</a> oder <a href="' + url + '" download>herunterladen</a>.</p>';
  }

  pdfjsLib.getDocument({ url: url }).promise.then(function (doc) {
    pdfDoc = doc;
    if (pageCountEl) pageCountEl.textContent = doc.numPages;
    if (fallback) fallback.remove();

    var queue = Promise.resolve();
    for (var n = 1; n <= doc.numPages; n++) {
      (function (num) {
        queue = queue.then(function () {
          return doc.getPage(num).then(function (page) {
            var container = document.createElement('div');
            container.className = 'pdf-page';
            container.setAttribute('data-page', num);
            var canvas = document.createElement('canvas');
            canvas.className = 'pdf-page__canvas';
            canvas.setAttribute('role', 'img');
            canvas.setAttribute('aria-label', 'Seite ' + num);
            var textDiv = document.createElement('div');
            textDiv.className = 'textLayer';
            container.appendChild(canvas);
            container.appendChild(textDiv);
            viewport.appendChild(container);
            pages.push({
              num: num, page: page, container: container, canvas: canvas,
              textDiv: textDiv, viewportAt1: page.getViewport({ scale: 1 }),
              textDivs: null, itemsStr: null, pageText: ''
            });
          });
        });
      })(n);
    }

    return queue.then(function () {
      return renderAll();
    }).then(function () {
      buildReadSource();
      setActivePage(1);

      // Track the most-visible page for the page counter.
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
          var best = null, bestRatio = 0;
          entries.forEach(function (en) {
            if (en.isIntersecting && en.intersectionRatio > bestRatio) {
              bestRatio = en.intersectionRatio; best = en.target;
            }
          });
          if (best) setActivePage(parseInt(best.getAttribute('data-page'), 10));
        }, { root: viewport, threshold: [0.1, 0.5, 0.9] });
        pages.forEach(function (p) { io.observe(p.container); });
      }
      window.addEventListener('resize', onResize, { passive: true });
    });
  }).catch(function (err) {
    failed(err && err.message);
  });
})();

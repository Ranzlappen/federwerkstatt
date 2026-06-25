(function () {
  'use strict';

  var searchInput = document.getElementById('search-input');
  var searchResults = document.getElementById('search-results');
  if (!searchInput || !searchResults) return;

  var lunrIndex = null;
  var documents = [];
  var loaded = false;
  var consentPending = false;

  var TOTAL_CAP = 12;

  // Load search index on first focus (consent-gated)
  searchInput.addEventListener('focus', loadIndex, { once: true });

  function loadIndex() {
    if (loaded) return;

    // Gate behind functional consent (Lunr.js is loaded from unpkg CDN)
    if (!window.__cookieConsent || !window.__cookieConsent.functional) {
      if (!consentPending) {
        consentPending = true;
        searchResults.innerHTML =
          '<div style="padding:1rem;text-align:center;color:var(--c-text-faint);font-size:0.85rem;">' +
            'Die Suche benötigt funktionale Cookies.<br>' +
            '<button onclick="CookieConsent.show()" style="margin-top:0.5rem;padding:0.3rem 0.7rem;' +
            'border:1px solid var(--c-border);border-radius:0.375rem;background:var(--c-surface-alt);' +
            'color:var(--c-text);font-size:0.8rem;cursor:pointer;font-family:inherit;">Cookie-Einstellungen</button>' +
          '</div>';
        window.addEventListener('consent-updated', function handler(e) {
          if (e.detail && e.detail.functional) {
            consentPending = false;
            searchResults.innerHTML = '';
            actuallyLoadIndex();
            window.removeEventListener('consent-updated', handler);
          }
        });
      }
      return;
    }

    actuallyLoadIndex();
  }

  function actuallyLoadIndex() {
    if (loaded) return;
    loaded = true;

    // Determine the baseurl from a meta tag or fallback
    var siteBase = document.querySelector('meta[name="baseurl"]');
    var prefix = siteBase ? siteBase.content : '';

    var script = document.createElement('script');
    script.src = 'https://unpkg.com/lunr@2.3.9/lunr.min.js';
    script.onload = function () {
      // Local (Jekyll) index of this site's blog posts only.
      fetch(prefix + '/search.json')
        .then(function (r) { return r.json(); })
        .then(function (docs) {
          documents = docs || [];
          lunrIndex = lunr(function () {
            this.ref('url');
            this.field('title', { boost: 10 });
            this.field('content');
            this.field('authors', { boost: 8 });
            this.field('tags', { boost: 5 });
            this.field('category', { boost: 3 });
            documents.forEach(function (doc) { this.add(doc); }, this);
          });
          // Re-run any query typed before the index finished loading.
          if (searchInput.value.trim()) doSearch();
        })
        .catch(function (err) {
          console.warn('Search index failed to load:', err);
        });
    };
    document.head.appendChild(script);
  }

  // Debounced search
  var debounce;
  searchInput.addEventListener('input', function () {
    clearTimeout(debounce);
    debounce = setTimeout(doSearch, 200);
  });

  function doSearch() {
    var query = searchInput.value.trim();
    searchResults.innerHTML = '';

    if (!query || !lunrIndex) return;

    var results;
    try {
      results = lunrIndex.search(query + '~1'); // fuzzy
    } catch (e) {
      try {
        results = lunrIndex.search(query);
      } catch (e2) {
        return;
      }
    }

    if (results.length === 0) {
      searchResults.innerHTML = '<div style="padding:1rem;text-align:center;color:var(--c-text-faint);font-size:0.9rem;">Keine Treffer</div>';
      return;
    }

    // Flat list of results (posts + papers), in Lunr's relevance order.
    results.slice(0, TOTAL_CAP).forEach(function (r) {
      var doc = documents.find(function (d) { return d.url === r.ref; });
      if (!doc) return;

      var isPaper = doc.type === 'paper';

      var item = document.createElement('a');
      item.className = 'search-result-item';
      item.href = doc.url;
      // Papers now resolve to their landing page (an internal HTML page), so they
      // open in the same tab like any other result.

      var title = document.createElement('h4');
      title.textContent = doc.title;
      if (isPaper) {
        var badge = document.createElement('span');
        badge.className = 'search-result-badge';
        badge.textContent = 'Werk';
        title.appendChild(badge);
      }

      var snippet = document.createElement('p');
      // For papers, lead with the authors when we have them.
      var text = (isPaper && doc.authors ? doc.authors + ' — ' : '') + (doc.content || '');
      text = text.trim();
      snippet.textContent = text.substring(0, 120) + (text.length > 120 ? '…' : '');

      item.appendChild(title);
      item.appendChild(snippet);
      searchResults.appendChild(item);
    });
  }
})();

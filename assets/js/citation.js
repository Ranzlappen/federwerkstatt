(function () {
  'use strict';

  // Wires the "Copy BibTeX" / "Download .bib" buttons on a paper landing page.
  // The BibTeX itself is server-rendered in #paper-bibtex (so it's visible and
  // selectable with no JS); this only adds clipboard + download convenience.
  var root = document.getElementById('paper-cite');
  if (!root) return;

  var bibEl = document.getElementById('paper-bibtex');
  if (!bibEl) return;

  var bibtex = bibEl.textContent;
  var filename = root.getAttribute('data-bibtex-filename') || 'citation.bib';

  function flash(btn, text) {
    var label = btn.querySelector('.paper-btn__label') || btn;
    var original = label.textContent;
    if (btn._resetTimer) clearTimeout(btn._resetTimer);
    label.textContent = text;
    btn.classList.add('is-copied');
    btn._resetTimer = setTimeout(function () {
      label.textContent = original;
      btn.classList.remove('is-copied');
    }, 2000);
  }

  var copyBtn = root.querySelector('[data-cite-copy="bibtex"]');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(bibtex).then(
          function () { flash(copyBtn, 'Kopiert!'); },
          function () { window.prompt('Dieses BibTeX kopieren:', bibtex); }
        );
      } else {
        window.prompt('Dieses BibTeX kopieren:', bibtex);
      }
    });
  }

  var downloadLink = root.querySelector('[data-cite-download]');
  if (downloadLink) {
    // Build the .bib as a blob URL once (and refresh it after each download so
    // the object URL isn't revoked out from under a second click).
    var setHref = function () {
      var blob = new Blob([bibtex], { type: 'application/x-bibtex' });
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.setAttribute('download', filename);
    };
    setHref();
    downloadLink.addEventListener('click', function () {
      // Let the current download proceed, then mint a fresh URL for next time.
      setTimeout(setHref, 0);
    });
  }
})();

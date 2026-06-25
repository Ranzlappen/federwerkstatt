(function () {
  'use strict';

  var btn = document.getElementById('post-share-btn');
  if (!btn) return;

  var labelEl = btn.querySelector('.post-share__label');
  var defaultLabel = labelEl ? labelEl.textContent : '';
  var resetTimer = null;

  function flash(text) {
    if (!labelEl) return;
    if (resetTimer) clearTimeout(resetTimer);
    labelEl.textContent = text;
    btn.classList.add('is-copied');
    resetTimer = setTimeout(function () {
      labelEl.textContent = defaultLabel;
      btn.classList.remove('is-copied');
    }, 2000);
  }

  function copyLink(url) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(
        function () { flash('Link kopiert!'); },
        function () { promptCopy(url); }
      );
    } else {
      promptCopy(url);
    }
  }

  function promptCopy(url) {
    // Last-resort fallback for very old browsers.
    window.prompt('Diesen Link kopieren:', url);
  }

  btn.addEventListener('click', function () {
    var url = window.location.href;
    var title = document.title;
    // Prefer the native share sheet (mobile + some desktop); fall back to copy.
    if (navigator.share) {
      navigator.share({ title: title, url: url }).catch(function () {});
    } else {
      copyLink(url);
    }
  });
})();

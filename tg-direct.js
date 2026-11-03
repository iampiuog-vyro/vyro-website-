// Open Telegram links directly in the Telegram app via the tg:// deep
// link, falling back to the normal https://t.me page if the app does not
// take over (e.g. Telegram is not installed). Works for ANY simple
// https://t.me/<channel> link (e.g. VYRO101). The hrefs stay as
// the https links, so no-JS visitors, long-press and copy-link keep
// working as before.
(function () {
  var FALLBACK_MS = 1400;

  function attach(link, web, app) {
    link.addEventListener('click', function (ev) {
      // Only plain left clicks — let ctrl/cmd/shift/alt and middle clicks
      // keep their normal browser behaviour (new tab, etc.).
      if (ev.defaultPrevented || ev.button !== 0 ||
          ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.altKey) {
        return;
      }
      ev.preventDefault();

      var settled = false;
      var timer = window.setTimeout(function () {
        if (settled || document.hidden) return;
        settled = true;
        cleanup();
        // The Telegram app did not take over — open the web link instead,
        // honouring target="_blank" the way a normal click would.
        if (link.target === '_blank') {
          window.open(web, '_blank', 'noopener');
        } else {
          window.location.href = web;
        }
      }, FALLBACK_MS);

      function onHidden() {
        if (document.hidden) { settled = true; cleanup(); }
      }
      function onGone() { settled = true; cleanup(); }
      function cleanup() {
        window.clearTimeout(timer);
        document.removeEventListener('visibilitychange', onHidden);
        window.removeEventListener('blur', onGone);
        window.removeEventListener('pagehide', onGone);
      }

      document.addEventListener('visibilitychange', onHidden);
      window.addEventListener('blur', onGone);
      window.addEventListener('pagehide', onGone);

      window.location.href = app;
    });
  }

  function init() {
    var links = document.querySelectorAll('a[href^="https://t.me/"]');
    for (var i = 0; i < links.length; i++) {
      var m = links[i].getAttribute('href').match(/^https:\/\/t\.me\/([A-Za-z0-9_]+)\/?$/);
      if (m) attach(links[i], 'https://t.me/' + m[1], 'tg://resolve?domain=' + m[1]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

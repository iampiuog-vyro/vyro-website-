// Open VYRO Telegram links directly in the Telegram app via the tg:// deep
// link, falling back to the normal https://t.me page if the app does not
// take over (e.g. Telegram is not installed). The hrefs stay as the https
// links, so no-JS visitors, long-press and copy-link keep working as before.
(function () {
  var WEB = 'https://t.me/VYRO101';
  var APP = 'tg://resolve?domain=VYRO101';
  var FALLBACK_MS = 1400;

  function attach(link) {
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
          window.open(WEB, '_blank', 'noopener');
        } else {
          window.location.href = WEB;
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

      window.location.href = APP;
    });
  }

  function init() {
    var links = document.querySelectorAll('a[href="' + WEB + '"]');
    for (var i = 0; i < links.length; i++) attach(links[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

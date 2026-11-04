// Data-driven rendering for the VYRO site.
//
// All editable content lives in site-data.json (apps, hero line,
// announcement, featured app, nav tabs, FAQs, links) so the VYRO admin
// app can change the site by editing that one file. The static markup in
// each page is the fallback: nothing here replaces anything unless
// site-data.json loads and parses successfully.
(function () {
  var DATA_URL = 'site-data.json';
  var TELEGRAM = 'https://t.me/VYRO101';
  // The announcement exactly as seeded from the original static marquee.
  // While the JSON announcement equals this, the static marquee markup is
  // left untouched, so the strip renders byte-for-byte as before.
  var DEFAULT_ANNOUNCEMENT = '🆕 V AI Avatar Maker ✦ 🆕 V AI Image Generator ✦ 📢 Join Telegram @VYRO101 for all apps ✦';

  function el(tag, cls) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    return node;
  }

  function tabHref(tab) {
    if (!tab) return '#';
    if (tab.type === 'page') return 'list.html?tab=' + encodeURIComponent(tab.id || '');
    return tab.url || '#';
  }

  function renderNav(tabs) {
    var nav = document.querySelector('header.site nav.links');
    if (!nav || !tabs || !tabs.length) return;
    nav.textContent = '';
    tabs.forEach(function (tab) {
      var a = document.createElement('a');
      a.href = tabHref(tab);
      a.textContent = tab.label || '';
      nav.appendChild(a);
    });
  }

  function renderHero(data) {
    var line = document.querySelector('.hero .apps-count-line');
    if (!line || !data.heroLine || !data.apps) return;
    var parts = String(data.heroLine).split('{count}');
    line.textContent = '';
    parts.forEach(function (part, i) {
      if (i > 0) {
        var span = document.createElement('span');
        span.id = 'appCount';
        span.textContent = String(data.apps.length);
        line.appendChild(span);
      }
      if (part) line.appendChild(document.createTextNode(part));
    });
  }

  function renderAnnouncement(data) {
    if (!data.announcement || data.announcement === DEFAULT_ANNOUNCEMENT) return;
    var seqs = document.querySelectorAll('.marquee-seq');
    Array.prototype.forEach.call(seqs, function (seq) {
      seq.textContent = '';
      for (var i = 0; i < 3; i++) {
        var a = document.createElement('a');
        a.href = TELEGRAM;
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = data.announcement;
        seq.appendChild(a);
        seq.appendChild(document.createTextNode(' '));
      }
    });
  }

  function findApp(data, slug) {
    if (!data.apps) return null;
    for (var i = 0; i < data.apps.length; i++) {
      if (data.apps[i].slug === slug) return data.apps[i];
    }
    return null;
  }

  function renderFeatured(data) {
    var card = document.querySelector('.featured-card');
    if (!card || !data.featuredApp) return;
    var app = findApp(data, data.featuredApp);
    if (!app) return;
    var img = card.querySelector('.featured-icon img');
    if (img) {
      img.src = app.icon || '';
      img.alt = (app.name || '') + ' app icon';
    }
    var h3 = card.querySelector('.featured-info h3');
    if (h3) h3.textContent = app.name || '';
    var desc = card.querySelector('.featured-info > p:not(.featured-tag):not(.app-meta)');
    if (desc) desc.textContent = app.tagline || '';
    var meta = card.querySelector('.featured-info .app-meta');
    if (meta) meta.textContent = 'v' + (app.version || '') + ' • ' + (app.size || '');
    var get = card.querySelector('a.btn.get');
    if (get) {
      get.href = app.link || TELEGRAM;
      get.setAttribute('aria-label', 'Get ' + (app.name || '') + ' on Telegram');
    }
  }

  function renderApps(data) {
    var list = document.getElementById('appList');
    if (!list || !data.apps) return;
    list.textContent = '';
    data.apps.forEach(function (app) {
      var art = el('article', 'app-row');
      if (app.isNew) art.setAttribute('data-new', '1');
      art.setAttribute('data-cat', app.category || '');
      art.setAttribute('data-name', (app.name || '').toLowerCase());

      var iconDiv = el('div', 'app-icon');
      var img = document.createElement('img');
      img.src = app.icon || '';
      img.alt = '';
      img.width = 96;
      img.height = 96;
      img.loading = 'lazy';
      iconDiv.appendChild(img);

      var info = el('div', 'app-info');
      var h3 = document.createElement('h3');
      h3.appendChild(document.createTextNode(app.name || ''));
      if (app.isNew) {
        h3.appendChild(document.createTextNode(' '));
        var pill = el('span', 'new-pill');
        pill.textContent = 'NEW';
        h3.appendChild(pill);
      }
      var p = document.createElement('p');
      p.textContent = app.tagline || '';
      var meta = el('p', 'app-meta');
      meta.textContent = 'v' + (app.version || '') + ' • ' + (app.size || '');
      info.appendChild(h3);
      info.appendChild(p);
      info.appendChild(meta);

      var a = el('a', 'btn get');
      a.href = app.link || TELEGRAM;
      a.target = '_blank';
      a.rel = 'noopener';
      a.setAttribute('aria-label', 'Get ' + (app.name || '') + ' on Telegram');
      a.textContent = 'Get';

      art.appendChild(iconDiv);
      art.appendChild(info);
      art.appendChild(a);
      list.appendChild(art);
    });
    window.__vyroRendered = true;
    if (window.VYRO_APPS && window.VYRO_APPS.refresh) window.VYRO_APPS.refresh();
  }

  function renderFaqs(data) {
    var listEl = document.querySelector('.faq-list');
    if (!listEl || !data.faqs) return;
    listEl.textContent = '';
    data.faqs.forEach(function (f) {
      var d = el('details', 'faq-item');
      var s = document.createElement('summary');
      s.textContent = f.q || '';
      var p = document.createElement('p');
      p.textContent = f.a || '';
      d.appendChild(s);
      d.appendChild(p);
      listEl.appendChild(d);
    });
  }

  // Shared handle for other pages (list.html): nav rendering + tab URLs.
  window.VYRO_SITE = { tabHref: tabHref, renderNav: renderNav };

  fetch(DATA_URL, { cache: 'no-store' })
    .then(function (resp) {
      if (!resp.ok) throw new Error('site-data.json: HTTP ' + resp.status);
      return resp.json();
    })
    .then(function (data) {
      if (!data || typeof data !== 'object') return;
      try { renderNav(data.tabs); } catch (e) { /* keep static nav */ }
      // Homepage-only sections; each is a no-op on pages without them.
      try { renderAnnouncement(data); } catch (e) { /* keep static strip */ }
      try { renderHero(data); } catch (e) { /* keep static hero */ }
      try { renderFeatured(data); } catch (e) { /* keep static card */ }
      try { renderApps(data); } catch (e) { /* keep static list */ }
      try { renderFaqs(data); } catch (e) { /* keep static FAQ */ }
    })
    .catch(function () {
      // Fetch/parse failed: the static fallback content stays as-is.
    });
})();

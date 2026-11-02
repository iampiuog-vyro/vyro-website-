// Live search + category chips + pagination for the Our Apps list (homepage only).
// Search matches the app name; chips filter by data-cat; both combine.
// Matching apps are shown 10 per page; changing search or category resets to page 1.
(function () {
  var input = document.getElementById('appSearch');
  var list = document.getElementById('appList');
  var chips = document.getElementById('chipRow');
  var noApps = document.getElementById('noApps');
  var pager = document.getElementById('appPager');
  var prevBtn = document.getElementById('pagerPrev');
  var nextBtn = document.getElementById('pagerNext');
  var pagerInfo = document.getElementById('pagerInfo');
  if (!list) return;

  var rows = Array.prototype.slice.call(list.querySelectorAll('.app-row'));
  var countEl = document.getElementById('appCount');
  if (countEl) countEl.textContent = rows.length;
  var PER_PAGE = 10;
  var activeCat = 'all';
  var page = 1;

  function matchedRows() {
    var q = input ? input.value.trim().toLowerCase() : '';
    return rows.filter(function (row) {
      var name = row.getAttribute('data-name') || '';
      var isNew = row.getAttribute('data-new') === '1';
      var catOk = activeCat === 'all' || (activeCat === 'new' ? isNew : row.getAttribute('data-cat') === activeCat);
      var qOk = !q || name.indexOf(q) !== -1;
      return catOk && qOk;
    });
  }

  function apply() {
    var hits = matchedRows();
    var pages = Math.max(1, Math.ceil(hits.length / PER_PAGE));
    if (page > pages) page = pages;
    if (page < 1) page = 1;
    var start = (page - 1) * PER_PAGE;
    var onPage = hits.slice(start, start + PER_PAGE);
    rows.forEach(function (row) {
      row.style.display = onPage.indexOf(row) !== -1 ? '' : 'none';
    });
    if (noApps) noApps.hidden = hits.length !== 0;
    if (pager) {
      pager.hidden = hits.length <= PER_PAGE;
      if (pagerInfo) pagerInfo.textContent = 'Page ' + page + ' of ' + pages;
      if (prevBtn) prevBtn.disabled = page <= 1;
      if (nextBtn) nextBtn.disabled = page >= pages;
    }
  }

  function scrollToList() {
    var y = list.getBoundingClientRect().top + window.pageYOffset - 90;
    window.scrollTo({ top: y < 0 ? 0 : y, behavior: 'smooth' });
  }

  if (input) input.addEventListener('input', function () { page = 1; apply(); });

  if (chips) {
    chips.addEventListener('click', function (ev) {
      var btn = ev.target.closest ? ev.target.closest('.chip') : null;
      if (!btn) return;
      var all = chips.querySelectorAll('.chip');
      for (var i = 0; i < all.length; i++) all[i].classList.remove('active');
      btn.classList.add('active');
      activeCat = btn.getAttribute('data-cat') || 'all';
      page = 1;
      apply();
    });
  }

  if (prevBtn) prevBtn.addEventListener('click', function () {
    if (page > 1) { page--; apply(); scrollToList(); }
  });
  if (nextBtn) nextBtn.addEventListener('click', function () {
    page++; apply(); scrollToList();
  });

  apply();
})();

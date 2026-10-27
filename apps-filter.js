// Live search + category chips for the Our Apps list (homepage only).
// Search matches the app name; chips filter by data-cat; both combine.
(function () {
  var input = document.getElementById('appSearch');
  var list = document.getElementById('appList');
  var chips = document.getElementById('chipRow');
  var noApps = document.getElementById('noApps');
  if (!list) return;

  var rows = list.querySelectorAll('.app-row');
  var activeCat = 'all';

  function apply() {
    var q = input ? input.value.trim().toLowerCase() : '';
    var shown = 0;
    rows.forEach(function (row) {
      var name = row.getAttribute('data-name') || '';
      var catOk = activeCat === 'all' || row.getAttribute('data-cat') === activeCat;
      var qOk = !q || name.indexOf(q) !== -1;
      var show = catOk && qOk;
      row.style.display = show ? '' : 'none';
      if (show) shown++;
    });
    if (noApps) noApps.hidden = shown !== 0;
  }

  if (input) input.addEventListener('input', apply);

  if (chips) {
    chips.addEventListener('click', function (ev) {
      var btn = ev.target.closest ? ev.target.closest('.chip') : null;
      if (!btn) return;
      var all = chips.querySelectorAll('.chip');
      for (var i = 0; i < all.length; i++) all[i].classList.remove('active');
      btn.classList.add('active');
      activeCat = btn.getAttribute('data-cat') || 'all';
      apply();
    });
  }
})();

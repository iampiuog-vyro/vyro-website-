// Visitor counter pill in the About section.
// Uses the free Abacus API (CountAPI-style): GET /hit increments and returns
// {"value": N}; GET /get only reads. A visit is counted at most once per
// browser session (sessionStorage flag), so refreshes do not inflate it.
// On any failure the pill simply stays hidden — no 0, no error, no fake number.
(function () {
  var pill = document.getElementById('visitPill');
  var num = document.getElementById('visitCount');
  if (!pill || !num) return;

  var counted = false;
  try {
    counted = window.sessionStorage.getItem('vyro-counted') === '1';
  } catch (e) {
    counted = true; // storage unavailable: read-only, never inflate
  }

  var url = 'https://abacus.jasoncameron.dev/' +
    (counted ? 'get' : 'hit') + '/vyro101/visits';

  fetch(url)
    .then(function (r) {
      if (!r.ok) throw new Error('counter HTTP ' + r.status);
      return r.json();
    })
    .then(function (data) {
      var v = data && data.value;
      if (typeof v !== 'number' || v < 1) return; // never show 0 / bogus
      if (!counted) {
        try { window.sessionStorage.setItem('vyro-counted', '1'); } catch (e) {}
      }
      num.textContent = v.toLocaleString('en-IN');
      pill.hidden = false;
    })
    .catch(function () { /* keep the pill hidden */ });
})();

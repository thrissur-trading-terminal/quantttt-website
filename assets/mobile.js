/* ============================================================
   mobile.js — shared mobile behaviour for quantttt.com
   All mobile features live here; no per-file inline JS.
   ============================================================ */

/* ── Bottom tab navigation ────────────────────────────────────
   Injected synchronously so it is in the DOM before first paint.
   Three tabs link to index.html anchors (same destinations as the
   existing desktop top nav). Active state is best-effort from the
   URL: Home on index.html, Topics on any other named page.
────────────────────────────────────────────────────────────── */
(function () {
  var page = window.location.pathname.split('/').pop() || 'index.html';
  var isHome    = page === 'index.html' || page === '';
  var isContent = !isHome && page.endsWith('.html');

  var tabs = [
    { label: 'Home',     icon: '🏠', href: '/index.html',          active: isHome    },
    { label: 'Topics',   icon: '📖', href: '/index.html#topics',   active: isContent },
    { label: 'Practice', icon: '📝', href: '/index.html#practice', active: false     },
  ];

  var nav = document.createElement('nav');
  nav.className = 'mob-nav';
  nav.setAttribute('aria-label', 'Bottom navigation');

  tabs.forEach(function (t) {
    var a = document.createElement('a');
    a.className = 'mob-nav-tab' + (t.active ? ' mob-nav-active' : '');
    a.href = t.href;
    a.innerHTML =
      '<span class="mob-nav-icon" aria-hidden="true">' + t.icon + '</span>' +
      '<span class="mob-nav-label">' + t.label + '</span>';
    nav.appendChild(a);
  });

  document.body.appendChild(nav);
})();

/* ── KaTeX overflow: wrap .katex-display elements after render ──
   KaTeX is loaded via `defer` so it renders after DOM parsing.
   We wait for window `load` to ensure deferred scripts have run
   and renderMathInElement has completed before wrapping.
────────────────────────────────────────────────────────────── */
window.addEventListener('load', function () {
  document.querySelectorAll('.katex-display').forEach(function (el) {
    if (el.parentElement && el.parentElement.classList.contains('katex-scroll')) return;
    var wrap = document.createElement('div');
    wrap.className = 'katex-scroll';
    el.parentNode.insertBefore(wrap, el);
    wrap.appendChild(el);
  });
});

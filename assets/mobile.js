/* ============================================================
   mobile.js — shared mobile behaviour for quantttt.com
   All mobile features live here; no per-file inline JS.
   ============================================================ */

/* ── Dark mode: apply saved preference before first paint ─────
   Runs synchronously so the attribute is set before any layout.
   When the user has no saved preference we leave the attribute
   unset and let mobile.css's prefers-color-scheme rule handle
   it (pure CSS → guaranteed flash-free for system dark users).
   Saved-preference users may see a brief flash on the very first
   uncached load; subsequent loads are instant from localStorage.
────────────────────────────────────────────────────────────── */
(function () {
  var saved = localStorage.getItem('q4-theme');
  if (saved === 'dark')       document.documentElement.setAttribute('data-theme', 'dark');
  else if (saved === 'light') document.documentElement.setAttribute('data-theme', 'light');
  // null → CSS prefers-color-scheme handles it; no attribute needed
})();

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

  // Dark mode toggle — 4th tab, appended after the three nav links
  var effectiveDark = document.documentElement.getAttribute('data-theme') === 'dark' ||
    (!document.documentElement.hasAttribute('data-theme') &&
     window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

  var btn = document.createElement('button');
  btn.className = 'mob-nav-tab';
  btn.setAttribute('aria-label', 'Toggle dark mode');
  btn.innerHTML =
    '<span class="mob-nav-icon" id="q4ThemeIcon" aria-hidden="true">' +
      (effectiveDark ? '☀️' : '🌙') +
    '</span>' +
    '<span class="mob-nav-label">Theme</span>';

  btn.addEventListener('click', function () {
    var nowDark = document.documentElement.getAttribute('data-theme') === 'dark' ||
      (!document.documentElement.hasAttribute('data-theme') &&
       window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    var next = !nowDark;
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    localStorage.setItem('q4-theme', next ? 'dark' : 'light');
    var icon = document.getElementById('q4ThemeIcon');
    if (icon) icon.textContent = next ? '☀️' : '🌙';
  });

  nav.appendChild(btn);
  document.body.appendChild(nav);
})();

/* ── Practice bottom sheet (mobile only, index.html) ──────────
   Converts #expl from an in-flow solution box into a fixed
   slide-up bottom sheet, and makes #checkBtn sticky above the
   mob-nav. All existing pick() / check() / done logic is untouched.

   DOM changes (guarded by matchMedia so desktop is unaffected):
   • .sheet-handle div injected as first child of #expl
   • #feedback-msg reparented into #expl (after handle)
   Sheet DOM order: [handle] [feedback-msg] [step-by-step solution]

   Re-open after dismiss: tap any option (onclick = null after
   check()) to re-add .show and review the solution. Does not
   touch picked / done — the button stays disabled ("Done ✓").
────────────────────────────────────────────────────────────── */
(function () {
  if (!window.matchMedia('(max-width: 768px)').matches) return;

  var expl        = document.getElementById('expl');
  var checkBtn    = document.getElementById('checkBtn');
  if (!expl || !checkBtn) return; // not on a page with the practice widget

  var feedbackMsg = document.getElementById('feedback-msg');
  var opts        = document.getElementById('opts');
  var practice    = document.getElementById('practice');

  // 1. Drag handle — injected as first child of the sheet
  var handle = document.createElement('div');
  handle.className = 'sheet-handle';
  handle.setAttribute('role', 'button');
  handle.setAttribute('aria-label', 'Dismiss solution');
  handle.innerHTML = '<div class="sheet-handle-bar"></div>';
  handle.addEventListener('click', function () { expl.classList.remove('show'); });
  expl.insertBefore(handle, expl.firstChild);

  // 2. Reparent #feedback-msg into sheet, just after the handle.
  //    check() finds it via getElementById regardless of DOM position.
  if (feedbackMsg) {
    expl.insertBefore(feedbackMsg, handle.nextSibling);
  }

  // 3. Sticky #checkBtn: reveal when practice section enters viewport
  if (practice && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      checkBtn.classList.toggle('mob-btn-visible', entries[0].isIntersecting);
    }, { threshold: 0.05 }).observe(practice);
  } else if (practice) {
    // Fallback for browsers without IntersectionObserver
    checkBtn.classList.add('mob-btn-visible');
  }

  // 4. Re-open sheet: tap any option after done to review the solution.
  //    "Done" state is detected by the button being disabled with "Done ✓" text —
  //    this mirrors what check() sets and avoids touching done / picked.
  if (opts) {
    opts.addEventListener('click', function () {
      if (checkBtn.disabled && checkBtn.textContent.trim().indexOf('Done') === 0) {
        expl.classList.add('show');
      }
    });
  }
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

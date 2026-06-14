/* ============================================================
   mobile.js — shared mobile behaviour for quantttt.com
   All mobile features live here; no per-file inline JS.
   ============================================================ */

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

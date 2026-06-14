# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

A static HTML educational website for quantitative trading, hosted on GitHub Pages at `quantttt.com`. There is no build system, no framework, no package manager, and no server — every file is a standalone HTML page deployed as-is.

## Development

**To preview locally:** open any `.html` file directly in a browser, or serve with any static file server:
```bash
npx serve .
# or
python -m http.server 8080
```

There are no build, lint, or test commands.

**To deploy:** push to `main` — GitHub Pages publishes automatically.

## File naming convention

| Pattern | Page type | Example |
|---|---|---|
| `index.html` | Landing page / course catalog | `index.html` |
| `[Domain].html` | Domain category page | `Finance.html` |
| `[Domain]_[Course].html` | Course index (chapter list) | `ML_M.html`, `M_Pr.html` |
| `[Domain]_[Course]_Ch[N].html` | Chapter content page | `ML_M_Ch1.html` |

Domain/course abbreviations in use:
- `ML_M` — Mathematical Foundations of ML
- `M_Pr` — Math: Probability
- `M_St` — Math: Statistics
- `F_MMI` — Finance: Market Microstructure & Instruments
- `F_Op` — Finance: Options
- `PROG_DAA` — Programming: Data Analysis & Algorithms
- `PROG_DSA` — Programming: Data Structures & Algorithms

## Architecture

### Three distinct page layouts

**1. Landing page (`index.html`)** — Full-page marketing/catalog layout with a fixed nav (70px), hero section, and course cards linking to course index pages. Includes `google_analytics.js`.

**2. Course index pages (e.g. `ML_M.html`)** — Module overview with a fixed nav (64px), hero, prerequisites strip, and a chapter list. Does not include `google_analytics.js`.

**3. Chapter pages (e.g. `ML_M_Ch1.html`)** — Two-panel reading layout:
- Fixed topbar (60px, `--topbar-h`) with breadcrumb and progress bar
- Fixed left sidebar (280px, `--sidebar-w`) with full chapter list; active chapter highlighted
- Scrollable main content area offset by sidebar width
- Includes `google_analytics.js`

### CSS design system

All CSS is **inline per file** — there is no shared stylesheet. Every file repeats the same CSS custom properties:

```css
:root {
  --white: #FFFFFF;   --off: #F7F5F2;
  --orange: #E8722A;  --orange2: #F28C42;
  --navy: #2D2560;    --navy2: #3D3480;
  --green: #1E9E5E;   --text: #1a1a2e;
  --muted: #6b7280;   --border: #e5e7eb;
  --light: #fdf6f0;
}
```

Fonts (all from Google Fonts CDN):
- `Playfair Display` — headings/titles
- `Barlow` — body text
- `Barlow Condensed` — nav labels, stat values
- `DM Mono` — metadata, code, breadcrumbs
- `Shadows Into Light Two` — decorative

### Math rendering

KaTeX is loaded from CDN (`@0.16.9`). Delimiters:
- `$$...$$` — display (block) math
- `$...$` — inline math

Auto-render is triggered via the `onload` attribute of the auto-render script tag.

### Analytics

`google_analytics.js` dynamically injects the GA4 tag (`G-3KH3766LGT`) and is loaded as the first `<script>` in `<head>` on all chapter pages and `index.html`. Course index pages do not include it.

### Mobile layer (`assets/mobile.css` / `assets/mobile.js`)

All mobile features live in `assets/mobile.css` and `assets/mobile.js` only — injected into every page via `inject_mobile.py`. Never add mobile styles inline per file.

Recurring pattern to watch: flex/grid items default to `min-width: auto`, preventing shrink below intrinsic content width even with `flex-shrink: 1` / `1fr` columns. Fix is always `min-width: 0` on the item. Already fixed: `.layout .content`, `.problem-body > .prob-left/right`.

**Known watch-items for a future mobile pass (browser-confirm before fixing):**
- **`.pillar-grid` on `index.html`** — collapses to `repeat(2,1fr)` at 900px but stays 2-column at 375px (~150px per card). Visually cramped; may need a `1fr` collapse at ≤600px.
- **Course index pages (`F_Op.html` etc.) hero/nav on mobile** — these page templates have zero `@media` queries in their inline CSS. The hero section has no mobile font-size or layout adaptations. The nav hiding (`nav:not([class])`) in mobile.css only targets `index.html`'s bare `<nav>`; course-index navs may have different structure. Not yet browser-confirmed as broken.

## Key conventions when adding content

- When adding a new chapter, copy the structure of an existing chapter from the same course to inherit the correct sidebar chapter list and CSS.
- The sidebar chapter list in every chapter file must be kept in sync manually — it is duplicated across all chapter files in a course.
- The progress bar fill width in the topbar (`tb-progress-fill`) is set inline per chapter (e.g. `style="width:15%"`).
- Chapter pages use `<script src="/google_analytics.js"></script>` with an absolute path (relies on the site root being `quantttt.com`).

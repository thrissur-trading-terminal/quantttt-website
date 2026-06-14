#!/usr/bin/env python3
"""
inject_mobile.py — Insert shared mobile.css / mobile.js includes into every
HTML file in the quantttt-website repo.

Usage:
    # Dry-run on specific files (prints diff, writes nothing):
    python inject_mobile.py --dry-run index.html ML_M.html ML_M_Ch1.html

    # Process specific files for real:
    python inject_mobile.py index.html ML_M.html ML_M_Ch1.html

    # Process ALL html files in the current directory:
    python inject_mobile.py --all

    # Dry-run on all files:
    python inject_mobile.py --all --dry-run

Idempotent: skips files that already contain the tags.
Paths match google_analytics.js convention (absolute paths from site root).
"""

import sys
import os
import glob
import difflib

# Force UTF-8 output so Unicode chars in HTML content (e.g. ⁴) don't crash
# the diff printer on Windows consoles that default to cp1252.
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

CSS_TAG = '<link rel="stylesheet" href="/assets/mobile.css"/>'
JS_TAG  = '<script src="/assets/mobile.js"></script>'

CSS_SENTINEL = '/assets/mobile.css'
JS_SENTINEL  = '/assets/mobile.js'


def inject(original: str) -> tuple[str, bool]:
    """Return (modified_text, was_changed)."""
    text = original
    changed = False

    # Insert CSS before </head>
    if CSS_SENTINEL not in text:
        text = text.replace('</head>', f'{CSS_TAG}\n</head>', 1)
        changed = True

    # Insert JS before </body>
    if JS_SENTINEL not in text:
        text = text.replace('</body>', f'{JS_TAG}\n</body>', 1)
        changed = True

    return text, changed


def process_file(path: str, dry_run: bool) -> bool:
    """Process one file. Returns True if the file was (or would be) changed."""
    with open(path, 'r', encoding='utf-8') as f:
        original = f.read()

    modified, changed = inject(original)

    if not changed:
        print(f'  [skip]    {path}  (already has tags)')
        return False

    if dry_run:
        diff = difflib.unified_diff(
            original.splitlines(keepends=True),
            modified.splitlines(keepends=True),
            fromfile=f'a/{path}',
            tofile=f'b/{path}',
        )
        sys.stdout.writelines(diff)
    else:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(modified)
        print(f'  [updated] {path}')

    return True


def main():
    args = sys.argv[1:]
    dry_run = '--dry-run' in args
    all_files = '--all' in args
    flags = {'--dry-run', '--all'}
    targets = [a for a in args if a not in flags]

    if all_files:
        targets = sorted(glob.glob('*.html'))
        if not targets:
            print('No .html files found in current directory.')
            sys.exit(1)

    if not targets:
        print(__doc__)
        sys.exit(0)

    mode = 'DRY-RUN' if dry_run else 'LIVE'
    print(f'=== inject_mobile.py [{mode}] — {len(targets)} file(s) ===\n')

    changed_count = 0
    for path in targets:
        if not os.path.isfile(path):
            print(f'  [ERROR]   {path} not found')
            continue
        if process_file(path, dry_run):
            changed_count += 1

    print(f'\nDone. {changed_count}/{len(targets)} file(s) {"would be" if dry_run else "were"} modified.')


if __name__ == '__main__':
    main()

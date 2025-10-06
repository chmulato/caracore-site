"""
Snapshot production artifacts and compare with repository files.

Usage:
  python scripts/snapshot_and_diff.py --base-url https://www.caracore.com.br

It will download a conservative list of known important files under /secure and root index.html,
store them under .tmp_prod_snapshot, and compare with files in the repository showing:
 - IDENTICAL
 - DIFFERENT
 - MISSING_IN_REPO
 - MISSING_IN_PROD

This is a non-destructive check.
"""
from __future__ import annotations
import argparse
import os
import sys
import json
import urllib.request
import urllib.error
from pathlib import Path

DEFAULT_FILES = [
    '/',
    '/index.html',
    '/secure/index.html',
    '/secure/logger.js',
    '/secure/log-config.js',
    '/secure/dynamic-config.js',
    '/secure/auth-standalone.js',
    '/secure/diagnose-redirect-uri.js',
    '/secure/fix-redirect-uri-detection.js',
    '/secure/show-current-uris.js',
    '/secure/copy-google-config.js',
    '/secure/README.md',
]

OUT_DIR = '.tmp_prod_snapshot'


def fetch_url_to(path: str, url: str, out_path: Path, timeout=15):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'cara-core-snapshot/1.0'})
        with urllib.request.urlopen(req, timeout=timeout) as fh:
            data = fh.read()
            out_path.parent.mkdir(parents=True, exist_ok=True)
            with open(out_path, 'wb') as w:
                w.write(data)
            return True, None
    except urllib.error.HTTPError as e:
        return False, f'HTTP {e.code} {e.reason}'
    except Exception as e:
        return False, str(e)


def compare_files(repo_path: Path, prod_path: Path):
    if not prod_path.exists():
        return 'MISSING_IN_PROD'
    if not repo_path.exists():
        return 'MISSING_IN_REPO'
    try:
        with open(repo_path, 'rb') as a, open(prod_path, 'rb') as b:
            ra = a.read()
            rb = b.read()
            if ra == rb:
                return 'IDENTICAL'
            else:
                return 'DIFFERENT'
    except Exception as e:
        return f'ERROR: {e}'


def path_to_outfile(path: str) -> Path:
    # Convert path like /secure/index.html to .tmp_prod_snapshot/secure/index.html
    if path == '/' or path == '':
        filename = 'root.html'
        return Path(OUT_DIR) / filename
    p = path.lstrip('/')
    return Path(OUT_DIR) / p


def main(argv=None):
    p = argparse.ArgumentParser()
    p.add_argument('--base-url', default='https://www.caracore.com.br', help='Production base URL')
    p.add_argument('--files', nargs='*', help='Optional list of files to check (paths starting with /)')
    args = p.parse_args(argv)

    files = args.files if args.files else DEFAULT_FILES
    base = args.base_url.rstrip('/')

    print('Snapshot & compare for base URL:', base)
    results = []

    for path in files:
        url = base + path
        out_path = path_to_outfile(path)
        ok, err = fetch_url_to(path, url, out_path)
        if ok:
            status = compare_files(Path('.').resolve() / path.lstrip('/'), out_path)
        else:
            status = f'FETCH_ERROR: {err}'
        results.append({'path': path, 'url': url, 'out': str(out_path), 'status': status})
        print(f"{path}: {status}")

    # Summary
    print('\nSummary:')
    for r in results:
        print(f" - {r['path']}: {r['status']}")

    # Write JSON report
    with open('.tmp_prod_snapshot/report.json', 'w', encoding='utf-8') as fh:
        json.dump(results, fh, indent=2, ensure_ascii=False)

    # Exit with code 0 if all IDENTICAL or MISSING_IN_PROD (server didn't expose), else non-zero
    non_ok = [r for r in results if not (r['status'] in ('IDENTICAL','MISSING_IN_PROD'))]
    if non_ok:
        print('\nDifferences detected or fetch errors. See .tmp_prod_snapshot/report.json')
        sys.exit(1)
    print('\nNo differences detected in compared files (or missing in production).')
    sys.exit(0)


if __name__ == '__main__':
    main()

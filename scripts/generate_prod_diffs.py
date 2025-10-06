"""
Generate unified diffs for production snapshot files that differ from repo copies.
Reads .tmp_prod_snapshot/report.json produced by snapshot_and_diff.py
Writes diffs to .tmp_prod_snapshot/diffs/<path>.diff
"""
from __future__ import annotations
import json
from pathlib import Path
import difflib

REPORT = Path('.tmp_prod_snapshot/report.json')
OUT_DIR = Path('.tmp_prod_snapshot/diffs')

if not REPORT.exists():
    print('Report not found:', REPORT)
    raise SystemExit(1)

results = json.loads(REPORT.read_text(encoding='utf-8'))
OUT_DIR.mkdir(parents=True, exist_ok=True)

for r in results:
    path = r['path']
    status = r['status']
    if status != 'DIFFERENT':
        continue
    repo_file = Path(path.lstrip('/'))
    prod_file = Path(r['out'])
    if not repo_file.exists() or not prod_file.exists():
        print('Skipping (missing):', path)
        continue
    repo_lines = repo_file.read_text(encoding='utf-8', errors='replace').splitlines(keepends=True)
    prod_lines = prod_file.read_text(encoding='utf-8', errors='replace').splitlines(keepends=True)
    diff = difflib.unified_diff(repo_lines, prod_lines, fromfile=str(repo_file), tofile=str(prod_file))
    outpath = OUT_DIR / (path.lstrip('/').replace('/','_') + '.diff')
    outpath.parent.mkdir(parents=True, exist_ok=True)
    outpath.write_text(''.join(diff), encoding='utf-8')
    print('Wrote diff for', path, '->', outpath)

print('Done. Diffs stored in .tmp_prod_snapshot/diffs')

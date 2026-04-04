"""
Validate encoding of caracore-*-releases/docs/**/*.html

- NOT_UTF8: file is not valid UTF-8 (strict).
- MOJIBAKE_SUSPECT: valid UTF-8 but typical Portuguese mojibake (wrong glyphs).

Run: python validate-lojas-encoding.py
Patterns use only \\u escapes (ASCII source).
"""
from __future__ import annotations

import re
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]  # D:\dev from caracore-site\scripts
if not (ROOT / "caracore-pdv-releases").exists():
    ROOT = Path(r"D:\dev")

PATTERNS: list[tuple[str, str]] = [
    ("Informatica_classic", "Inform\u00c3\u00a1tica"),
    ("Navegacao", "Navega\u00c3\u00a7\u00c3\u00a3o"),
    ("emdash_threechar", "\u00e2\u20ac\u201d"),
    ("Middle_dot_mojibake", "\u00c2\u00b7"),
    ("cao_suffix", "\u00c3\u00a7\u00c3\u00a3o"),
    ("voce", "voc\u00c3\u00aa"),
    ("nao", "n\u00c3\u00a3o"),
]


def find_stores(base: Path) -> list[Path]:
    out = [p for p in sorted(base.iterdir()) if p.is_dir() and p.name.startswith("caracore-") and p.name.endswith("-releases")]
    extra = base / "reino-oidc-releases"
    if extra.is_dir():
        out.append(extra)
    return sorted(set(out), key=lambda p: p.name)


def main() -> int:
    stores = find_stores(ROOT)
    if not stores:
        print(f"No *-releases under {ROOT}", file=sys.stderr)
        return 1

    compiled = [(name, re.compile(pat)) for name, pat in PATTERNS]
    results: list[tuple[str, str, str]] = []
    by_store: dict[str, dict[str, int]] = defaultdict(lambda: {"not_utf8": 0, "mojibake": 0})

    for store in stores:
        docs = store / "docs"
        if not docs.is_dir():
            continue
        for f in sorted(docs.rglob("*.html")):
            rel = str(f.relative_to(ROOT))
            try:
                raw = f.read_bytes()
                text = raw.decode("utf-8")
            except UnicodeDecodeError as e:
                results.append((rel, "NOT_UTF8", str(e)))
                by_store[store.name]["not_utf8"] += 1
                continue
            labels = [name for name, rx in compiled if rx.search(text)]
            if labels:
                results.append((rel, "MOJIBAKE_SUSPECT", "; ".join(sorted(labels))))
                by_store[store.name]["mojibake"] += 1

    print("=== RESUMO POR LOJA (docs/**/*.html) ===")
    for name in sorted(by_store.keys()):
        s = by_store[name]
        print(f"{name}: NOT_UTF8={s['not_utf8']}  MOJIBAKE_SUSPECT={s['mojibake']}")
    print(f"\nTotal ficheiros com relatorio: {len(results)}")
    print("\n=== LISTAGEM ===")
    for rel, kind, detail in sorted(results, key=lambda x: x[0]):
        print(f"{rel} | {kind} | {detail}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

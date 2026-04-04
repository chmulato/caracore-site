"""Validate UTF-8 and common mojibake patterns in caracore-*-releases/docs/**/*.html."""
from __future__ import annotations

import re
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1].parent  # D:\dev from caracore-site\scripts
if not (ROOT / "caracore-pdv-releases").exists():
    ROOT = Path(r"D:\dev")

MOJIBAKE_PATTERNS: list[tuple[str, str]] = [
    (r"InformÃ.tica", "Informática (classic mojibake)"),
    (r"â€[™\"]", "quotes/dash mojibake"),
    (r"NavegaÃ§Ã£o", "Navegação"),
    (r"Â·", "middle dot mojibake"),
    (r"Ã§", "cedilla byte pair (suspect)"),
    (r"Ã¡", "á mojibake"),
    (r"Ã£", "ã mojibake"),
    (r"Ã©", "é mojibake"),
    (r"Ã­", "í mojibake"),
    (r"Ã³", "ó mojibake"),
    (r"Ãº", "ú mojibake"),
]


def find_stores(base: Path) -> list[Path]:
    out: list[Path] = []
    if not base.is_dir():
        return out
    for p in sorted(base.iterdir()):
        if not p.is_dir():
            continue
        if p.name.endswith("-releases") and p.name.startswith("caracore-"):
            out.append(p)
    extra = base / "reino-oidc-releases"
    if extra.is_dir() and extra not in out:
        out.append(extra)
    return sorted(out)


def main() -> int:
    stores = find_stores(ROOT)
    if not stores:
        print(f"No *-releases under {ROOT}", file=sys.stderr)
        return 1

    results: list[tuple[str, str, str]] = []
    for store in stores:
        docs = store / "docs"
        if not docs.is_dir():
            continue
        for f in sorted(docs.rglob("*.html")):
            rel = str(f.relative_to(ROOT))
            try:
                raw = f.read_bytes()
            except OSError as e:
                results.append((rel, "READ_ERROR", str(e)))
                continue
            try:
                raw.decode("utf-8")
            except UnicodeDecodeError as e:
                results.append((rel, "NOT_UTF8", str(e)))
                continue
            text = raw.decode("utf-8")
            labels: set[str] = set()
            for pat, label in MOJIBAKE_PATTERNS:
                if re.search(pat, text):
                    labels.add(label)
            if labels:
                results.append((rel, "MOJIBAKE_SUSPECT", "; ".join(sorted(labels))))

    by_store: dict[str, dict[str, int]] = defaultdict(lambda: {"not_utf8": 0, "mojibake": 0})
    for rel, kind, _ in results:
        store_name = rel.split("\\")[0].split("/")[0]
        if kind == "NOT_UTF8":
            by_store[store_name]["not_utf8"] += 1
        elif kind == "MOJIBAKE_SUSPECT":
            by_store[store_name]["mojibake"] += 1

    print("=== RESUMO POR LOJA (docs/**/*.html) ===")
    for name in sorted(by_store.keys()):
        s = by_store[name]
        print(f"{name}: NOT_UTF8={s['not_utf8']}  MOJIBAKE_SUSPECT={s['mojibake']}")

    total_bad = sum(s["not_utf8"] + s["mojibake"] for s in by_store.values())
    print()
    print(f"Total ficheiros com problema: {total_bad}")
    print()
    print("=== LISTAGEM (todos) ===")
    for rel, kind, detail in results:
        print(f"{rel} | {kind} | {detail[:200]}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

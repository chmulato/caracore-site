#!/usr/bin/env python3
"""
Validação de encoding para o ecossistema Cara Core (substitui os fluxos em PowerShell).

Modos:
  site   — caracore-site: <meta charset> cedo no HTML + marcadores de mojibake
  lojas  — caracore-*-releases/docs/**/*.html: UTF-8 estrito + padrões PT típicos de mojibake
  readme — README.md (recursivo): marcadores de mojibake

Uso:
  python tools/validate_encoding.py site
  python tools/validate_encoding.py lojas
  python tools/validate_encoding.py readme
  python tools/validate_encoding.py lojas --root D:\\dev

Exit code: 0 = OK, 1 = falhas
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

# Mesmo padrão usado em validate-encoding-site.ps1 / fix-html-mojibake.ps1
MOJIBAKE_RE = re.compile(
    r"\u00c3[\u0080-\u00bf]"
    r"|\u00c2[\u0080-\u00bf]"
    r"|\u00e2[\u0080-\u00bf]{1,2}"
    r"|\ufffd",
    re.IGNORECASE,
)

CHARSET_META_RE = re.compile(r"(?i)<meta\s+charset\s*=[^>]+>")

# Lojas: padrões comuns quando UTF-8 foi lido como CP1252 (ASCII-only no fonte)
LOJA_PATTERNS: list[tuple[str, str]] = [
    ("Informatica_classic", r"Inform\u00c3\u00a1tica"),
    ("Navegacao", r"Navega\u00c3\u00a7\u00c3\u00a3o"),
    ("emdash_threechar", r"\u00e2\u20ac\u201d"),
    ("Middle_dot_mojibake", r"\u00c2\u00b7"),
    ("cao_suffix", r"\u00c3\u00a7\u00c3\u00a3o"),
    ("voce", r"voc\u00c3\u00aa"),
    ("nao", r"n\u00c3\u00a3o"),
]


def _default_dev_root(script_path: Path) -> Path:
    """tools/validate_encoding.py -> pai do caracore-site (dev)."""
    return script_path.resolve().parent.parent.parent


def _should_skip_site(path: Path, root: Path) -> bool:
    p = str(path).replace("\\", "/").lower()
    for part in (
        "/tools/",
        "/backend/",
        "/node_modules/",
        "/.python_packages/",
        "/htmlcov/",
        "/playwright/",
        "/delivery/",
        "/.git/",
    ):
        if part in p:
            return True
    return False


def cmd_site(root: Path) -> int:
    """Valida HTML do site matriz (caracore-site)."""
    html_files = [
        f
        for f in root.rglob("*")
        if f.is_file() and f.suffix.lower() in (".html", ".htm") and not _should_skip_site(f, root)
    ]

    late_charset: list[tuple[str, str]] = []
    mojibake_hits: list[tuple[str, int]] = []
    not_utf8: list[tuple[str, str]] = []

    for f in sorted(html_files):
        try:
            text = f.read_text(encoding="utf-8")
        except UnicodeDecodeError as e:
            not_utf8.append((str(f.relative_to(root)), str(e)))
            continue

        rel = f.relative_to(root)
        if not re.search(r"(?i)<head[\s>]", text):
            n = len(MOJIBAKE_RE.findall(text))
            if n:
                mojibake_hits.append((str(rel), n))
            continue

        m = CHARSET_META_RE.search(text)
        if not m:
            late_charset.append((str(rel), "no_charset_meta"))
            continue

        prefix_bytes = len(text[: m.start()].encode("utf-8"))
        if prefix_bytes >= 1024:
            late_charset.append((str(rel), f"charset_after_{prefix_bytes}_bytes"))

        n = len(MOJIBAKE_RE.findall(text))
        if n:
            mojibake_hits.append((str(rel), n))

    print("=== Remodelagem / estado (ficheiros de plano) ===")
    for label, sub in (
        ("docs/CHECKLIST_EXECUCAO_REMODELAGEM_DELIVERY.md", "docs/CHECKLIST_EXECUCAO_REMODELAGEM_DELIVERY.md"),
        ("sitemap.xml", "sitemap.xml"),
        ("docs/RUNBOOK_OPERACAO_DELIVERY_SUBDOMINIOS.md", "docs/RUNBOOK_OPERACAO_DELIVERY_SUBDOMINIOS.md"),
        ("docs/CHECKLIST_MANUTENCAO_PUBLICACAO_MATRIZ.md", "docs/CHECKLIST_MANUTENCAO_PUBLICACAO_MATRIZ.md"),
    ):
        p = root / sub
        print(f"{'[OK]' if p.is_file() else '[FALTA]'} {label}")

    print(f"\n=== UTF-8 (estrito) ===")
    if not not_utf8:
        print("Todos os HTML lidos como UTF-8 válido.")
    else:
        for path, err in not_utf8:
            print(f"  NOT_UTF8 {path} | {err}")

    print(f"\n=== Charset: meta dentro dos primeiros 1024 bytes (UTF-8) ===")
    print(f"Total HTML analisados: {len(html_files)}")
    if not late_charset:
        print("Nenhum ficheiro com charset tardio ou ausente.")
    else:
        for path, issue in late_charset:
            print(f"  {path} | {issue}")

    print("\n=== Mojibake (padrão clássico UTF-8 lido como CP1252) ===")
    if not mojibake_hits:
        print("Nenhum marcador de mojibake encontrado.")
    else:
        for path, n in sorted(mojibake_hits, key=lambda x: -x[1]):
            print(f"  {path} | {n} marcador(es)")

    failed = bool(not_utf8 or late_charset or mojibake_hits)
    return 1 if failed else 0


def _find_stores(base: Path) -> list[Path]:
    out = [
        p
        for p in sorted(base.iterdir())
        if p.is_dir() and p.name.startswith("caracore-") and p.name.endswith("-releases")
    ]
    extra = base / "reino-oidc-releases"
    if extra.is_dir():
        out.append(extra)
    return sorted(set(out), key=lambda p: p.name)


def cmd_lojas(root: Path) -> int:
    """Valida HTML em caracore-*-releases/docs."""
    stores = _find_stores(root)
    if not stores:
        print(f"Nenhum *-releases em {root}", file=sys.stderr)
        return 1

    compiled = [(name, re.compile(pat)) for name, pat in LOJA_PATTERNS]
    results: list[tuple[str, str, str]] = []
    by_store: dict[str, dict[str, int]] = {}

    for store in stores:
        by_store.setdefault(store.name, {"not_utf8": 0, "mojibake": 0})
        docs = store / "docs"
        if not docs.is_dir():
            continue
        for f in sorted(docs.rglob("*.html")):
            rel = str(f.relative_to(root))
            try:
                text = f.read_text(encoding="utf-8")
            except UnicodeDecodeError as e:
                results.append((rel, "NOT_UTF8", str(e)))
                by_store[store.name]["not_utf8"] += 1
                continue
            labels = [name for name, rx in compiled if rx.search(text)]
            if labels:
                results.append((rel, "MOJIBAKE_SUSPECT", "; ".join(sorted(labels))))
                by_store[store.name]["mojibake"] += 1

    print("=== RESUMO POR LOJA (docs/**/*.html) ===")
    print("NOT_UTF8 = ficheiro não é UTF-8 válido (estrito).")
    print("MOJIBAKE_SUSPECT = UTF-8 válido mas padrões típicos de texto PT corrompido.\n")
    for name in sorted(by_store.keys()):
        s = by_store[name]
        print(f"{name}: NOT_UTF8={s['not_utf8']}  MOJIBAKE_SUSPECT={s['mojibake']}")
    print(f"\nTotal ficheiros com relatório: {len(results)}")
    print("\n=== LISTAGEM ===")
    for rel, kind, detail in sorted(results, key=lambda x: x[0]):
        print(f"{rel} | {kind} | {detail}")
    return 1 if results else 0


def _should_skip_readme(path: Path) -> bool:
    p = str(path).replace("\\", "/").lower()
    return "/node_modules/" in p


def cmd_readme(root: Path) -> int:
    """README.md: mojibake markers."""
    readmes = [f for f in root.rglob("README.md") if f.is_file() and not _should_skip_readme(f)]
    failed: list[tuple[str, int]] = []
    for f in sorted(readmes):
        try:
            text = f.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            print(f"NOT_UTF8 {f.relative_to(root)}", file=sys.stderr)
            return 1
        n = len(MOJIBAKE_RE.findall(text))
        if n:
            failed.append((str(f.relative_to(root)), n))
    if failed:
        print("README encoding check failed. Potential mojibake markers found:", file=sys.stderr)
        for path, n in failed:
            print(f"  {path} | {n}", file=sys.stderr)
        return 1
    print("README encoding check passed.")
    return 0


def main() -> int:
    script = Path(__file__).resolve()
    default_root = _default_dev_root(script)

    ap = argparse.ArgumentParser(description="Validação de encoding (substitui scripts PowerShell).")
    sub = ap.add_subparsers(dest="cmd", required=True)

    p_site = sub.add_parser("site", help="caracore-site: charset cedo + mojibake")
    p_site.add_argument(
        "--root",
        type=Path,
        default=script.parent.parent,
        help="Raiz do caracore-site (default: pai de tools/)",
    )

    p_lojas = sub.add_parser("lojas", help="lojas *-releases em docs/")
    p_lojas.add_argument("--root", type=Path, default=default_root, help=f"Raiz dev (default: {default_root})")

    p_readme = sub.add_parser("readme", help="README.md sob root")
    p_readme.add_argument("--root", type=Path, default=script.parent.parent, help="Raiz do repositório a varrer")

    args = ap.parse_args()
    if args.cmd == "site":
        root = args.root.resolve()
        if not root.is_dir():
            print(f"Root inválido: {root}", file=sys.stderr)
            return 1
        return cmd_site(root)
    if args.cmd == "lojas":
        root = args.root.resolve()
        if not root.is_dir():
            print(f"Root inválido: {root}", file=sys.stderr)
            return 1
        return cmd_lojas(root)
    if args.cmd == "readme":
        root = args.root.resolve()
        return cmd_readme(root)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

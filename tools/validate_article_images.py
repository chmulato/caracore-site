# -*- coding: utf-8 -*-
"""Validate image references in retro and personal blog HTML."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RETRO = ROOT / "sala" / "redes" / "retro" / "articles"
BLOG = ROOT / "personal" / "articles"
OUT = ROOT / "sala" / "regis" / "VALIDACAO_IMAGENS_RETRO_BLOG.txt"

ARTICLE_FILE = re.compile(r"^(\d{4}_\d{2}_\d{2})_article_(\d+)\.html$")
IMG_EXT = re.compile(r"\.(png|jpg|jpeg|gif|webp|svg)", re.I)
REF_RE = re.compile(
    r'(?:src|content)=["\']([^"\']+\.(?:png|jpg|jpeg|gif|webp|svg))["\']',
    re.I,
)
ARTICLE_NUM = re.compile(r"article_(\d+)_", re.I)
DATE_PREFIX = re.compile(r"(\d{4}_\d{2}_\d{2})_")


def retro_article_id(name: str) -> int | None:
    m = ARTICLE_FILE.match(name)
    return int(m.group(2)) if m else None


def check_retro(html_path: Path, issues: list[str]) -> None:
    name = html_path.name
    aid = retro_article_id(name)
    if aid is None:
        return
    text = html_path.read_text(encoding="utf-8", errors="replace")
    base = html_path.parent
    for m in REF_RE.finditer(text):
        u = m.group(1).strip()
        if u.startswith("data:") or u.startswith("{{"):
            continue
        if u.startswith("http"):
            am = ARTICLE_NUM.search(u)
            if am and int(am.group(1)) != aid and "logo" not in u.lower():
                issues.append(
                    f"RETRO ID: {name} — URL cites article_{am.group(1)} but file is article_{aid}: {u}"
                )
            continue
        local = (base / u.replace("/", "\\").lstrip("\\")).resolve()
        try:
            local.relative_to(base)
        except ValueError:
            issues.append(f"RETRO PATH: {name} — escapes article dir: {u}")
            continue
        am = ARTICLE_NUM.search(u)
        if am and int(am.group(1)) != aid and "logo" not in u.lower():
            issues.append(
                f"RETRO ID: {name} — img article_{am.group(1)} vs article_{aid}: {u}"
            )
        if not local.is_file():
            issues.append(f"RETRO MISSING: {name} — {u}")


def blog_date_prefix(name: str) -> str | None:
    m = DATE_PREFIX.match(name)
    return m.group(1) if m else None


def is_blog_index(name: str) -> bool:
    """Series index pages (Brasil SDK, Protocolo Lucerna): one HTML, many image dates."""
    return "_index.html" in name


def check_blog(html_path: Path, issues: list[str]) -> None:
    name = html_path.name
    prefix = blog_date_prefix(name)
    if not prefix:
        return
    skip_date = is_blog_index(name)
    text = html_path.read_text(encoding="utf-8", errors="replace")
    base = html_path.parent
    seen: set[str] = set()
    for m in REF_RE.finditer(text):
        u = m.group(1).strip()
        if u in seen:
            continue
        seen.add(u)
        if u.startswith("data:") or u.startswith("http"):
            continue
        local = (base / u).resolve()
        try:
            local.relative_to(base)
        except ValueError:
            issues.append(f"BLOG PATH: {name} — odd ref: {u}")
            continue
        if not local.is_file():
            issues.append(f"BLOG MISSING: {name} — {u}")
        if skip_date:
            continue
        dm = re.search(r"assets/img/(\d{4}_\d{2}_\d{2})_", u)
        if dm and dm.group(1) != prefix:
            if "favicon" in u.lower():
                continue
            issues.append(
                f"BLOG DATE: {name} — article prefix {prefix} but asset {dm.group(1)} in {u}"
            )


def main() -> int:
    issues: list[str] = []
    if RETRO.is_dir():
        for p in sorted(RETRO.glob("*.html")):
            check_retro(p, issues)
    if BLOG.is_dir():
        for p in sorted(BLOG.glob("*.html")):
            check_blog(p, issues)

    lines = [
        f"Validation run: {OUT.parent}",
        f"Retro: {RETRO}",
        f"Blog:  {BLOG}",
        "",
        "Rules:",
        "- Retro: article_NN in img path must match NN in filename (except logo.png).",
        "- Blog: referenced files must exist; assets/img/YYYY_MM_DD_* should match article date prefix.",
        "",
    ]
    if not issues:
        lines.append("Result: OK — no mismatches; missing files listed only if assets absent on disk.")
    else:
        lines.extend(issues)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote {OUT} ({len(issues)} issue lines)")
    for i in issues[:50]:
        print(i)
    if len(issues) > 50:
        print(f"... and {len(issues) - 50} more")
    return 0 if not issues else 1


if __name__ == "__main__":
    sys.exit(main())

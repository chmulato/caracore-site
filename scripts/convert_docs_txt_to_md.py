#!/usr/bin/env python3
"""Convert operational .txt files under docs/ to .md."""
from __future__ import annotations

import re
from pathlib import Path

DOCS = Path(__file__).resolve().parents[1] / "docs"

TITLES = {
    "ECOSYSTEM_CARA_CORE": "Ecossistema Cara Core — mapa de repositórios",
    "ECOSYSTEM_LOJAS": "Ecossistema — lojas online (URLs canónicas)",
    "COMPONENTES_LOJA": "Componentes padrão das lojas (vitrines GitHub Pages)",
    "VALIDACAO_LOJAS_MATRIZ": "Validação — lojas alinhadas com a matriz",
    "VALIDACAO_NEGOCIO": "Validação de negócio — ecossistema Cara Core",
    "STATUS_ATUAL_ESTRATEGIA_DE_NEGOCIO_CC": "Status atual e estratégia de negócio",
    "FEEDBACK": "Feedback das alterações — branding e copywriting",
}


def fix_mojibake(text: str) -> str:
    for enc in ("latin-1", "cp1252"):
        try:
            return text.encode(enc).decode("utf-8")
        except (UnicodeEncodeError, UnicodeDecodeError):
            continue
    return text


def txt_to_md_body(text: str) -> str:
    text = fix_mojibake(text)
    if text.startswith("\ufeff"):
        text = text[1:]
    lines = text.splitlines()
    out: list[str] = []
    skip_title_block = True
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        if skip_title_block and (not stripped or re.fullmatch(r"=+", stripped)):
            i += 1
            continue
        if skip_title_block and stripped and not re.fullmatch(r"=+", stripped):
            # skip first title line(s) before first === if we'll add H1
            if i < 4 and not stripped.startswith(("NOTA", "Objetivo", "Documento", "**")):
                i += 1
                continue
            skip_title_block = False
        if re.fullmatch(r"=+", stripped) and len(stripped) >= 3:
            j = len(out) - 1
            while j >= 0 and not out[j].strip():
                j -= 1
            if j >= 0 and not out[j].startswith("#"):
                prev = out[j].strip().rstrip("-").strip()
                if prev:
                    out[j] = f"## {prev}\n"
            i += 1
            continue
        if re.fullmatch(r"-{3,}", stripped):
            out.append("\n---\n")
            i += 1
            continue
        if re.match(r"^\d+\.\s+[A-ZÁÉÍÓÚÃÕÇ]", stripped) and len(stripped) < 90:
            out.append(f"\n## {stripped}\n")
            i += 1
            continue
        if re.match(r"^\d+\.\d+\s+", stripped) and len(stripped) < 110:
            out.append(f"\n### {stripped}\n")
            i += 1
            continue
        out.append(line)
        i += 1
    return "\n".join(out).strip() + "\n"


def replace_txt_refs(text: str) -> str:
    """Point internal doc references to .md in docs/."""
    mapping = {
        "ECOSYSTEM_CARA_CORE.txt": "ECOSYSTEM_CARA_CORE.md",
        "ECOSYSTEM_LOJAS.txt": "ECOSYSTEM_LOJAS.md",
        "COMPONENTES_LOJA.txt": "COMPONENTES_LOJA.md",
        "VALIDACAO_LOJAS_MATRIZ.txt": "VALIDACAO_LOJAS_MATRIZ.md",
        "VALIDACAO_NEGOCIO.txt": "VALIDACAO_NEGOCIO.md",
        "STATUS_ATUAL_ESTRATEGIA_DE_NEGOCIO_CC.txt": "STATUS_ATUAL_ESTRATEGIA_DE_NEGOCIO_CC.md",
        "FEEDBACK.TXT": "FEEDBACK.md",
        "FEEDBACK.txt": "FEEDBACK.md",
    }
    for old, new in mapping.items():
        text = text.replace(old, new)
    text = text.replace("ECOSYSTEM_*.txt", "ECOSYSTEM_*.md")
    return text


def convert_file(src: Path) -> Path:
    stem = src.stem.upper() if src.suffix.upper() == ".TXT" else src.stem
    key = src.stem if src.stem != "FEEDBACK" else "FEEDBACK"
    if src.name.upper() == "FEEDBACK.TXT":
        key = "FEEDBACK"
    title = TITLES.get(src.stem, TITLES.get(key, src.stem.replace("_", " ").title()))
    raw = src.read_text(encoding="utf-8", errors="replace")
    body = replace_txt_refs(txt_to_md_body(raw))
    dst = src.with_suffix(".md")
    content = f"# {title}\n\n{body}"
    dst.write_text(content, encoding="utf-8")
    return dst


def main() -> None:
    converted = []
    for src in sorted(set(DOCS.glob("*.txt")) | set(DOCS.glob("*.TXT"))):
        if src.suffix.lower() != ".txt":
            continue
        convert_file(src)
        converted.append(src.name)
        print(f"OK {src.stem}.md")
    print(f"Converted {len(converted)} files")


if __name__ == "__main__":
    main()

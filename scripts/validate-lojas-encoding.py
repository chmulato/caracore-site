#!/usr/bin/env python3
"""Compat: redireciona para tools/validate_encoding.py lojas."""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

def main() -> int:
    site = Path(__file__).resolve().parent.parent
    dev = site.parent
    if not (dev / "caracore-pdv-releases").exists():
        dev = Path(r"D:\dev")
    py = site / "tools" / "validate_encoding.py"
    return subprocess.run(
        [sys.executable, str(py), "lojas", "--root", str(dev)],
        check=False,
    ).returncode


if __name__ == "__main__":
    raise SystemExit(main())

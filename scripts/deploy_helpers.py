"""Utility functions used by Azure deployment scripts.

This module bundles shared helpers for packaging the backend application
before uploading it to Azure App Service.  It focuses on two key steps:

* Installing the Python dependencies into ``backend/.python_packages`` so the
  web app can run in "Run From Package" mode without building on the server.
* Creating a clean ZIP archive from the ``backend`` directory, skipping caches
  and temporary artefacts that do not belong in the deployable package.
"""
from __future__ import annotations

import logging
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Iterable, Optional
import zipfile

LOGGER = logging.getLogger("deploy")

# Directories and files we should not ship inside the deploy package.
_EXCLUDE_DIRS: set[str] = {"__pycache__", ".pytest_cache", ".git", "logs"}
_EXCLUDE_FILES: set[str] = {".DS_Store", ".gitignore"}


def _should_skip(path: Path, backend_dir: Path) -> bool:
    """Return ``True`` if *path* should be excluded from the ZIP package."""
    try:
        rel = path.relative_to(backend_dir)
    except ValueError:
        return False

    for part in rel.parts:
        if part in _EXCLUDE_DIRS:
            return True
    if path.is_file():
        if path.name in _EXCLUDE_FILES:
            return True
        if path.suffix in {".pyc", ".pyo"}:
            return True
    return False


def _run_pip(cmd: list[str]) -> None:
    LOGGER.info("Executando pip: %s", " ".join(cmd))
    completed = subprocess.run(cmd, capture_output=True, text=True)
    if completed.stdout:
        LOGGER.info("pip stdout:\n%s", completed.stdout.strip())
    if completed.stderr:
        LOGGER.info("pip stderr:\n%s", completed.stderr.strip())
    if completed.returncode != 0:
        raise RuntimeError(
            "Falha ao instalar dependências com pip (código %s)." % completed.returncode
        )


def bundle_backend_dependencies(
    backend_dir: Path,
    requirements_path: Path,
    *,
    python_executable: Optional[str] = None,
    extra_pip_args: Optional[Iterable[str]] = None,
) -> None:
    """Install backend dependencies into ``backend/.python_packages``.

    Parameters
    ----------
    backend_dir:
        Directory containing the backend sources.
    requirements_path:
        Path to the ``requirements.txt`` file to install from.
    python_executable:
        Optional Python interpreter to invoke ``pip`` with. Defaults to
        ``sys.executable``.
    extra_pip_args:
        Optional iterable of additional arguments to pass to ``pip install``
        (for example ``["--upgrade"]``).
    """

    backend_dir = Path(backend_dir)
    requirements_path = Path(requirements_path)
    if not backend_dir.is_dir():
        raise FileNotFoundError(f"Diretório do backend não encontrado: {backend_dir}")
    if not requirements_path.is_file():
        raise FileNotFoundError(f"requirements.txt não encontrado: {requirements_path}")

    target_dir = backend_dir / ".python_packages" / "lib" / "site-packages"
    LOGGER.info("Instalando dependências em %s", target_dir)
    if target_dir.exists():
        LOGGER.debug("Removendo diretório de dependências anterior: %s", target_dir)
        shutil.rmtree(target_dir)
    target_dir.mkdir(parents=True, exist_ok=True)

    python_bin = python_executable or sys.executable
    cmd: list[str] = [python_bin, "-m", "pip", "install"]
    if extra_pip_args:
        cmd.extend(extra_pip_args)
    cmd.extend(["-r", str(requirements_path), "--target", str(target_dir)])

    _run_pip(cmd)
    LOGGER.info("Dependências instaladas com sucesso em %s", target_dir)

    # Sanity check for critical modules that must be present on the App Service package.
    critical_modules = {
        "requests": target_dir / "requests" / "__init__.py",
        "flask": target_dir / "flask" / "__init__.py",
    }
    missing = [name for name, path in critical_modules.items() if not path.exists()]
    if missing:
        raise RuntimeError(
            "As dependências críticas %s não foram encontradas em %s. Verifique se requirements.txt está completo e se o pip concluiu a instalação." % (
                ", ".join(missing),
                target_dir,
            )
        )


def build_backend_zip(backend_dir: Path, output_zip: Path) -> Path:
    """Create a ZIP archive from *backend_dir* at *output_zip*.

    Existing archives are replaced.  Temporary files, caches and VCS folders are
    excluded automatically so the package stays lean and compatible with Azure
    App Service Run From Package deployments.
    """

    backend_dir = Path(backend_dir)
    output_zip = Path(output_zip)
    if not backend_dir.is_dir():
        raise FileNotFoundError(f"Diretório do backend não encontrado: {backend_dir}")

    if output_zip.exists():
        LOGGER.debug("Removendo ZIP anterior: %s", output_zip)
        output_zip.unlink()
    output_zip.parent.mkdir(parents=True, exist_ok=True)

    LOGGER.info("Criando pacote em %s", output_zip)
    with zipfile.ZipFile(output_zip, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for path in backend_dir.rglob("*"):
            if _should_skip(path, backend_dir):
                continue
            if path.is_dir():
                continue
            arcname = path.relative_to(backend_dir).as_posix()
            zf.write(path, arcname)
            LOGGER.debug("Adicionado ao ZIP: %s", arcname)
    LOGGER.info("Pacote gerado com sucesso: %s", output_zip)
    return output_zip

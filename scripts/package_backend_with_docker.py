#!/usr/bin/env python3
"""Package the Cara-Core backend with Linux-compatible dependencies using Docker.

This helper script runs a temporary ``python:3.11-bullseye``
container (glibc compatível com o Azure App Service) que executa o
same steps as our manual release process:

1. Install all backend dependencies into ``backend/.python_packages``
   (targeting Linux wheels).
2. Build ``backend.zip`` ready for deployment to Azure App Service.

Usage (from the repository root)::

    python scripts/package_backend_with_docker.py

Requirements:
    * Docker Desktop (or any local Docker engine) reachable via ``docker`` CLI.
    * The repository folder mounted read/write (handled automatically).

The resulting ``backend/.python_packages`` and ``backend.zip`` are written back
into the host workspace so they can be deployed immediately with
``az webapp deployment source config-zip``.
"""
from __future__ import annotations

import argparse
import os
import shutil
import logging
import stat
from datetime import datetime
import subprocess
import sys
from pathlib import Path
from textwrap import dedent


LOGGER = logging.getLogger("package")

DEFAULT_DOCKER_IMAGE = "python:3.11-bullseye"
DEFAULT_DOCKER_PLATFORM = "linux/amd64"


def setup_logging(log_file: Path, level: int = logging.INFO) -> None:
    handlers: list[logging.Handler] = [
        logging.StreamHandler(sys.stdout),
    ]
    file_handler = logging.FileHandler(log_file, encoding="utf-8")
    handlers.append(file_handler)

    logging.basicConfig(
        level=level,
        format="[%(asctime)s] %(levelname)s %(message)s",
        datefmt="%H:%M:%S",
        handlers=handlers,
    )


def fail(message: str, exit_code: int = 1) -> None:
    LOGGER.error(message)
    raise SystemExit(exit_code)


def info(message: str) -> None:
    LOGGER.info(message)


class ProgressTracker:
    def __init__(self, total_steps: int) -> None:
        self.total_steps = total_steps
        self.current = 0

    def advance(self, message: str) -> None:
        self.current += 1
        if self.current > self.total_steps:
            self.total_steps = self.current
        bar_length = 24
        filled = int(bar_length * self.current / self.total_steps)
        bar = "█" * filled + "░" * (bar_length - filled)
        info(f"Passo {self.current}/{self.total_steps} {message} |{bar}|")


def ensure_docker_available() -> None:
    if shutil.which("docker") is None:
        fail(
            "Docker CLI não encontrado no PATH. Instale o Docker Desktop ou "
            "garanta que o comando 'docker' está disponível antes de continuar."
        )

    try:
        subprocess.run(["docker", "version"], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except subprocess.CalledProcessError as exc:
        fail(f"Falha ao executar 'docker version': {exc}")


def host_path_for_docker(path: Path) -> str:
    """Return a docker-compatible bind mount string for *path*."""
    resolved = path.resolve()
    if os.name == "nt":
        # Docker Desktop for Windows aceita o caminho no formato ``C:\\path``.
        return f"{resolved}:/workspace"
    return f"{resolved.as_posix()}:/workspace"


def build_container_command(args: argparse.Namespace) -> list[str]:
    workdir = Path(args.repository_root).resolve()
    backend_dir = Path(args.backend_dir)
    requirements = Path(args.requirements_path)
    output_zip = Path(args.output_zip)

    python_snippet = dedent(
        f"""
    import os
    from pathlib import Path

    from deploy_helpers import bundle_backend_dependencies, build_backend_zip

    backend_dir = Path({backend_dir.as_posix()!r})
    requirements_path = Path({requirements.as_posix()!r})
    zip_path = Path({output_zip.as_posix()!r})

    os.environ.setdefault("PIP_BREAK_SYSTEM_PACKAGES", "1")

    pip_args = list({args.pip_extra_args!r} or [])
    if "--break-system-packages" not in pip_args:
        pip_args.append("--break-system-packages")

    print(f"Instalando dependências em {{backend_dir}}/.python_packages (Linux wheels)...", flush=True)
    bundle_backend_dependencies(backend_dir, requirements_path, extra_pip_args=pip_args)

    print(f"Gerando {{zip_path}} a partir de {{backend_dir}}...", flush=True)
    build_backend_zip(backend_dir, zip_path)
    print("Pacote gerado com sucesso.", flush=True)
        """
    ).strip()

    container_script = "\n".join(
        [
            "set -euo pipefail",
            "PY_BIN=python",
            "if ! command -v \"$PY_BIN\" >/dev/null 2>&1; then",
            "    PY_BIN=python3",
            "fi",
            "if ! \"$PY_BIN\" -m pip --version >/dev/null 2>&1; then",
            "    curl -sS https://bootstrap.pypa.io/get-pip.py -o /tmp/get-pip.py",
            "    \"$PY_BIN\" /tmp/get-pip.py",
            "    rm -f /tmp/get-pip.py",
            "fi",
            "\"$PY_BIN\" - <<'PY'",
            python_snippet,
            "PY",
        ]
    )

    mount_arg = host_path_for_docker(workdir)
    cmd = [
        "docker",
        "run",
        "--rm",
        "-t",
    ]
    if args.docker_platform:
        cmd.extend(["--platform", args.docker_platform])
    cmd.extend(
        [
            "-v",
            mount_arg,
            "-w",
            "/workspace",
            args.docker_image,
            "bash",
            "-lc",
            container_script,
        ]
    )
    return cmd


def _handle_remove_readonly(func, path, exc):
    excvalue = exc[1]
    if isinstance(excvalue, PermissionError):
        os.chmod(path, stat.S_IWRITE)
        func(path)
    else:
        raise excvalue


def clean_previous_artifacts(backend_dir: Path, output_zip: Path) -> None:
    packages_dir = backend_dir / ".python_packages"

    removed_any = False
    if output_zip.exists():
        try:
            output_zip.unlink()
            info(f"Arquivo antigo removido: {output_zip}")
            removed_any = True
        except OSError as exc:
            fail(f"Não foi possível remover o arquivo antigo {output_zip}: {exc}")

    if packages_dir.exists():
        try:
            shutil.rmtree(packages_dir, onerror=_handle_remove_readonly)
            info(f"Diretório antigo removido: {packages_dir}")
            removed_any = True
        except OSError as exc:
            fail(f"Não foi possível remover o diretório {packages_dir}: {exc}")

    if not removed_any:
        info("Nenhum artefato antigo encontrado para remoção.")


def run_docker_command(cmd: list[str]) -> None:
    process = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
    )
    assert process.stdout is not None
    with process.stdout:
        for line in process.stdout:
            LOGGER.info("[docker] %s", line.rstrip())
    return_code = process.wait()
    if return_code != 0:
        raise subprocess.CalledProcessError(return_code, cmd)


def parse_args(argv: list[str]) -> argparse.Namespace:
    repo_root_default = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description="Empacota o backend com dependências Linux usando Docker.")
    parser.add_argument(
        "--repository-root",
        default=str(repo_root_default),
        help="Diretório raiz do repositório (padrão: dois níveis acima deste script).",
    )
    parser.add_argument(
        "--backend-dir",
        default="backend",
        help="Diretório do backend relativo ao repositório (padrão: backend).",
    )
    parser.add_argument(
        "--requirements-path",
        default="requirements.txt",
        help="Caminho para o requirements.txt relativo ao repositório.",
    )
    parser.add_argument(
        "--output-zip",
        default="scripts/backend.zip",
        help="Caminho do arquivo ZIP gerado (relativo ao repositório).",
    )
    parser.add_argument(
        "--docker-image",
        default=DEFAULT_DOCKER_IMAGE,
        help=(
            "Imagem Docker a utilizar (padrão: python:3.11-bullseye, "
            "com compatibilidade glibc semelhante ao Linux do Azure App Service)."
        ),
    )
    parser.add_argument(
        "--docker-platform",
        default=DEFAULT_DOCKER_PLATFORM,
        help=(
            "Plataforma alvo (padrão: linux/amd64, mesma arquitetura do Azure App Service). "
            "Defina vazio para deixar o Docker escolher automaticamente."
        ),
    )
    parser.add_argument(
        "--pip-extra-arg",
        dest="pip_extra_args",
        action="append",
        default=[],
        help="Argumentos adicionais para pip install (pode ser informado múltiplas vezes).",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> None:
    args = parse_args(argv or sys.argv[1:])

    repo_root = Path(args.repository_root).resolve()
    log_dir = repo_root / "log"
    log_dir.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_file = log_dir / f"package_backend_{timestamp}.log"

    setup_logging(log_file)
    info(f"Logs detalhados: {log_file}")

    progress = ProgressTracker(total_steps=6)

    progress.advance("Validando caminhos do repositório")

    # repo_root already resolved above
    if not repo_root.is_dir():
        fail(f"Diretório do repositório não encontrado: {repo_root}")

    backend_dir = (repo_root / args.backend_dir).resolve()
    if not backend_dir.is_dir():
        fail(f"Diretório do backend não encontrado: {backend_dir}")

    requirements_path = (repo_root / args.requirements_path).resolve()
    if not requirements_path.is_file():
        fail(f"Arquivo requirements.txt não encontrado: {requirements_path}")

    output_zip = (repo_root / args.output_zip).resolve()

    info(f"Repositório: {repo_root}")
    info(f"Backend: {backend_dir}")
    info(f"requirements.txt: {requirements_path}")
    info(f"Saída ZIP: {output_zip}")
    info(f"Imagem Docker: {args.docker_image}")
    info(f"Plataforma Docker: {args.docker_platform or 'padrão do engine'}")

    progress.advance("Removendo artefatos anteriores do backend")
    clean_previous_artifacts(backend_dir, output_zip)

    progress.advance("Verificando Docker CLI")

    ensure_docker_available()

    progress.advance("Preparando comando Docker")
    cmd = build_container_command(args)
    info("Executando Docker para instalar dependências e gerar o pacote...")
    info("Comando: " + " ".join(cmd))

    progress.advance("Executando contêiner Docker (pode levar alguns minutos)")

    try:
        run_docker_command(cmd)
    except subprocess.CalledProcessError as exc:
        fail(f"Falha durante a criação do pacote (codigo {exc.returncode}). Consulte a saída acima para detalhes.")

    progress.advance("Validando artefato backend.zip")
    if output_zip.is_file():
        info(f"Pacote gerado com sucesso: {output_zip}")
    else:
        fail("Docker finalizou sem erros, mas o arquivo backend.zip não foi encontrado.")


if __name__ == "__main__":
    main()

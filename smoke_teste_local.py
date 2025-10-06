#!/usr/bin/env python3
"""Smoke test orchestration for local development.

This helper script performs the following actions:

1. Launches ``server.py`` (the local static server + backend bootstrapper) in a
   background subprocess using the same Python interpreter that invoked this
   script. Any environment variables already exported (for example
   ``AUTO_START_DOCKER_BACKEND`` or OAuth secrets) are inherited automatically.

2. Waits until the backend health endpoint (default http://localhost:5051/health)
   responds with HTTP 200, retrying for up to the timeout defined by
   ``LOCAL_WAIT_TIMEOUT`` (default 45 seconds).

3. Executes ``teste_end_point_local.py`` to run the detailed endpoint checks.

4. Propagates the exit code from the endpoint tests so that CI pipelines can
   fail early if smoke tests do not pass.

Usage::

    python smoke_teste_local.py

You can tweak behaviour via environment variables:

``LOCAL_WAIT_TIMEOUT``
    Seconds to wait for the backend health check. Default: 45.

``SMOKE_SERVER_PORT``
    Port where the backend health check is expected. Default: 5051.

``SMOKE_TEST_ARGS``
    Extra command-line arguments appended when invoking
    ``teste_end_point_local.py`` (for example ``--expect-google-credentials``).

To stop after execution the script sends SIGINT to the spawned server process
and waits briefly for it to exit.
"""

from __future__ import annotations

import os
import signal
import subprocess
import sys
import threading
import time
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parent
SERVER_SCRIPT = PROJECT_ROOT / "server.py"
TEST_SCRIPT = PROJECT_ROOT / "teste_end_point_local.py"

WAIT_TIMEOUT = int(os.getenv("LOCAL_WAIT_TIMEOUT", "45"))
BACKEND_PORT = int(os.getenv("SMOKE_SERVER_PORT", "5051"))
HEALTH_URL = os.getenv("SMOKE_HEALTH_URL", f"http://localhost:{BACKEND_PORT}/health")


def _python_executable() -> str:
    return sys.executable or "python"


def _log(msg: str) -> None:
    print(f"[smoke] {msg}")


def _start_server() -> tuple[subprocess.Popen, threading.Thread | None]:
    if not SERVER_SCRIPT.exists():
        raise FileNotFoundError(f"server.py não encontrado em {SERVER_SCRIPT}")

    cmd = [_python_executable(), str(SERVER_SCRIPT)]
    _log(f"Iniciando servidor local: {' '.join(cmd)}")
    creationflags = 0
    if os.name == "nt":
        creationflags = getattr(subprocess, "CREATE_NEW_PROCESS_GROUP", 0)
    proc = subprocess.Popen(
        cmd,
        cwd=str(PROJECT_ROOT),
        env=os.environ.copy(),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        creationflags=creationflags,
    )
    reader_thread = None
    if proc.stdout:
        def _reader(stream):
            for line in stream:
                print(f"[server] {line.rstrip()}")

        reader_thread = threading.Thread(target=_reader, args=(proc.stdout,), daemon=True)
        reader_thread.start()

    return proc, reader_thread


def _wait_for_health(timeout: int) -> bool:
    deadline = time.time() + timeout
    import urllib.request

    while time.time() < deadline:
        try:
            with urllib.request.urlopen(HEALTH_URL, timeout=3) as resp:
                if resp.getcode() == 200:
                    _log("Health check OK")
                    return True
        except Exception:
            time.sleep(1)
    return False


def main(argv: list[str] | None = None) -> int:
    argv = argv or sys.argv[1:]

    if not TEST_SCRIPT.exists():
        print("teste_end_point_local.py não encontrado.", file=sys.stderr)
        return 1

    server_proc, reader_thread = _start_server()
    try:
        if not _wait_for_health(WAIT_TIMEOUT):
            _log("Backend não respondeu dentro do timeout. Encerrando.")
            return 1

        test_cmd = [_python_executable(), str(TEST_SCRIPT)] + argv
        extra_args = os.getenv("SMOKE_TEST_ARGS")
        if extra_args:
            test_cmd.extend(extra_args.split())

        _log(f"Executando testes: {' '.join(test_cmd)}")
        result = subprocess.run(test_cmd, cwd=str(PROJECT_ROOT))
        exit_code = result.returncode
        _log(f"Teste finalizado com código {exit_code}")
        return exit_code
    finally:
        _log("Encerrando servidor local...")
        if server_proc.poll() is None:
            if os.name == "nt":
                server_proc.send_signal(signal.CTRL_BREAK_EVENT)
            else:
                server_proc.send_signal(signal.SIGINT)
            try:
                server_proc.wait(timeout=10)
            except subprocess.TimeoutExpired:
                server_proc.kill()
        if reader_thread and reader_thread.is_alive():
            reader_thread.join(timeout=2)


if __name__ == "__main__":
    raise SystemExit(main())

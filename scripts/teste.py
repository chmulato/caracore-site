"""Teste rápido para validar páginas principais do site e Área 51.

O script inicia um servidor HTTP local apontando para a raiz do projeto,
realiza requisições a páginas-chave e verifica conteúdos essenciais:

- `index.html` deve responder com HTTP 200 e conter o link "Área 51".
- `/secure/index.html`, `/secure/callback.html`, `/secure/restrita.html` e `/secure/logout.html`
  devem responder com HTTP 200 e conter textos característicos.

Uso:
    python teste.py

O processo retorna código 0 em caso de sucesso e 1 quando algum teste falha.
"""
from __future__ import annotations

import contextlib
import http.server
import socketserver
import threading
import time
import urllib.error
import urllib.request
from dataclasses import dataclass
from html.parser import HTMLParser
from pathlib import Path
from typing import List

PROJECT_ROOT = Path(__file__).resolve().parent
HOST = "127.0.0.1"


class SilentRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Handler que silencia logs e serve a partir da raiz do projeto."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(PROJECT_ROOT), **kwargs)

    def log_message(self, format: str, *args) -> None:  # noqa: A003 (shadow built-in)
        # Evita poluir a saída de testes
        return


class ThreadedHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


@dataclass
class TestResult:
    name: str
    success: bool
    details: str = ""


class Area51LinkChecker(HTMLParser):
    """Procura por um link com o texto "Área 51" apontando para /secure/."""

    def __init__(self):
        super().__init__()
        self._capture = False
        self._href: str | None = None
        self.found = False

    def handle_starttag(self, tag: str, attrs):
        if tag.lower() != "a":
            return
        attrs_dict = dict(attrs)
        self._href = attrs_dict.get("href")
        self._capture = True

    def handle_data(self, data: str):
        if not self._capture:
            return
        if self._href and "secure" in self._href.lower() and "área 51" in data.lower():
            self.found = True

    def handle_endtag(self, tag: str):
        if tag.lower() == "a":
            self._capture = False
            self._href = None


@contextlib.contextmanager
def start_test_server():
    with ThreadedHTTPServer((HOST, 0), SilentRequestHandler) as httpd:
        port = httpd.server_address[1]
        thread = threading.Thread(target=httpd.serve_forever, daemon=True)
        thread.start()
        # Pequena pausa para garantir que o servidor esteja pronto
        time.sleep(0.1)
        try:
            yield port
        finally:
            httpd.shutdown()
            thread.join(timeout=2)


def fetch(path: str, port: int) -> tuple[int, str]:
    url = f"http://{HOST}:{port}{path}"
    with urllib.request.urlopen(url) as response:  # noqa: S310 (urlopen é local)
        status = response.getcode()
        body = response.read().decode("utf-8", errors="ignore")
        return status, body


def run_tests(port: int) -> List[TestResult]:
    results: List[TestResult] = []

    # 1. index.html responde 200
    try:
        status, body = fetch("/index.html", port)
        results.append(TestResult("index.html responde 200", status == 200, f"status={status}"))
    except urllib.error.URLError as exc:  # pragma: no cover - falha de rede local
        results.append(TestResult("index.html responde 200", False, f"erro: {exc}"))
        return results

    # 2. index.html contém link Área 51
    parser = Area51LinkChecker()
    parser.feed(body)
    results.append(TestResult("Link Área 51 presente na home", parser.found))

    # 3. secure/index.html responde 200 e contém texto característico
    try:
        status, body_secure_index = fetch("/secure/index.html", port)
        contains_text = "Área Restrita" in body_secure_index
        results.append(
            TestResult(
                "secure/index.html ok",
                status == 200 and contains_text,
                f"status={status}; contains_text={contains_text}",
            )
        )
    except urllib.error.URLError as exc:
        results.append(TestResult("secure/index.html ok", False, f"erro: {exc}"))

    # 4. secure/callback.html responde 200 e exibe mensagem de validação
    try:
        status, body_callback = fetch("/secure/callback.html", port)
        contains_text = "Validando credenciais" in body_callback or "Área 51" in body_callback
        results.append(
            TestResult(
                "secure/callback.html ok",
                status == 200 and contains_text,
                f"status={status}; contains_text={contains_text}",
            )
        )
    except urllib.error.URLError as exc:
        results.append(TestResult("secure/callback.html ok", False, f"erro: {exc}"))

    # 5. secure/restrita.html responde 200 e contém mensagem de sessão
    try:
        status, body_restrita = fetch("/secure/restrita.html", port)
        contains_text = "Conteúdo Protegido" in body_restrita or "Sessão ativa" in body_restrita
        results.append(
            TestResult(
                "secure/restrita.html ok",
                status == 200 and contains_text,
                f"status={status}; contains_text={contains_text}",
            )
        )
    except urllib.error.URLError as exc:
        results.append(TestResult("secure/restrita.html ok", False, f"erro: {exc}"))

    # 6. secure/logout.html responde 200 e sinaliza sessão encerrada
    try:
        status, body_logout = fetch("/secure/logout.html", port)
        contains_text = "Sessão encerrada" in body_logout or "Até breve" in body_logout
        results.append(
            TestResult(
                "secure/logout.html ok",
                status == 200 and contains_text,
                f"status={status}; contains_text={contains_text}",
            )
        )
    except urllib.error.URLError as exc:
        results.append(TestResult("secure/logout.html ok", False, f"erro: {exc}"))

    return results


def main() -> int:
    if not PROJECT_ROOT.joinpath("index.html").exists():
        print("[ERRO] index.html não encontrado na raiz do projeto.")
        return 1

    with start_test_server() as port:
        results = run_tests(port)

    all_ok = True
    for result in results:
        status = "OK" if result.success else "FALHA"
        details = f" ({result.details})" if result.details else ""
        print(f"- {status} :: {result.name}{details}")
        all_ok &= result.success

    if all_ok:
        print("\nTodos os testes passaram.")
        return 0

    print("\nAlguns testes falharam.")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())

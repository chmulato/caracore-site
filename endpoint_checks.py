"""Helpers reused across local and Azure endpoint smoke tests."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, Optional, Sequence

import requests


@dataclass
class CheckResult:
    """Represents the outcome of a single HTTP smoke test."""

    name: str
    success: bool
    message: str
    detail: Optional[str] = None

    def log(self) -> None:
        icon = "OK" if self.success else "FAIL"
        print(f"[{icon}] {self.name} - {self.message}")
        if self.detail and not self.success:
            print(f"    Detalhe: {self.detail}")


def log_summary(results: Iterable[CheckResult]) -> bool:
    results = list(results)
    total = len(results)
    passed = sum(1 for item in results if item.success)
    print(f"\nResumo dos testes: {passed}/{total} passaram.")
    return passed == total


def _build_url(base_url: str, path: str) -> str:
    return f"{base_url.rstrip('/')}/{path.lstrip('/')}"


def run_health_check(session: requests.Session, base_url: str, *, timeout: int) -> CheckResult:
    url = _build_url(base_url, "/health")
    try:
        response = session.get(url, timeout=timeout)
    except requests.RequestException as exc:
        return CheckResult("GET /health", False, "Erro de requisição", str(exc))

    if response.status_code != 200:
        return CheckResult(
            "GET /health",
            False,
            f"Status {response.status_code} (esperado 200)",
            response.text[:200],
        )

    try:
        data = response.json()
    except ValueError:
        return CheckResult("GET /health", False, "Resposta não é JSON", response.text[:200])

    if data.get("status") != "ok":
        return CheckResult("GET /health", False, "Payload inesperado", str(data))

    return CheckResult("GET /health", True, "Resposta OK")


def run_token_missing_fields_json(
    session: requests.Session,
    base_url: str,
    *,
    origin: str,
    timeout: int,
    token_path: str = "/oauth/google/token",
) -> CheckResult:
    url = _build_url(base_url, token_path)
    headers = {"Origin": origin, "Content-Type": "application/json"}
    name = f"POST {token_path} (JSON vazio)"
    try:
        response = session.post(url, json={}, headers=headers, timeout=timeout)
    except requests.RequestException as exc:
        return CheckResult(name, False, "Erro de requisição", str(exc))

    if response.status_code != 400:
        return CheckResult(
            name,
            False,
            f"Status {response.status_code} (esperado 400)",
            response.text[:200],
        )

    try:
        data = response.json()
    except ValueError:
        return CheckResult(name, False, "Resposta não é JSON", response.text[:200])

    if data.get("error") != "invalid_request":
        return CheckResult(
            name,
            False,
            "Erro esperado 'invalid_request' não encontrado",
            str(data),
        )

    return CheckResult(
        name,
        True,
        "Retornou 400/invalid_request como esperado",
    )


def run_token_missing_fields_form(
    session: requests.Session,
    base_url: str,
    *,
    origin: str,
    timeout: int,
    token_path: str = "/oauth/google/token",
) -> CheckResult:
    url = _build_url(base_url, token_path)
    headers = {"Origin": origin}
    name = f"POST {token_path} (form vazio)"
    try:
        response = session.post(url, data={}, headers=headers, timeout=timeout)
    except requests.RequestException as exc:
        return CheckResult(name, False, "Erro de requisição", str(exc))

    if response.status_code != 400:
        return CheckResult(
            name,
            False,
            f"Status {response.status_code} (esperado 400)",
            response.text[:200],
        )

    try:
        data = response.json()
    except ValueError:
        return CheckResult(name, False, "Resposta não é JSON", response.text[:200])

    if data.get("error") != "invalid_request":
        return CheckResult(
            name,
            False,
            "Erro esperado 'invalid_request' não encontrado",
            str(data),
        )

    return CheckResult(
        name,
        True,
        "Retornou 400/invalid_request como esperado",
    )


def run_cors_preflight(
    session: requests.Session,
    base_url: str,
    *,
    token_path: str,
    origin: str,
    expect_header: bool,
    timeout: int,
) -> CheckResult:
    url = _build_url(base_url, token_path)
    name = f"OPTIONS {token_path} (origin {origin})"
    headers = {
        "Origin": origin,
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type",
    }
    try:
        response = session.options(url, headers=headers, timeout=timeout)
    except requests.RequestException as exc:
        return CheckResult(name, False, "Erro de requisição", str(exc))

    status = response.status_code
    allowed_statuses = {204, 200}
    blocked_statuses = {204, 200, 400}
    valid_statuses = allowed_statuses if expect_header else blocked_statuses

    if status not in valid_statuses:
        return CheckResult(
            name,
            False,
            f"Status inesperado {status} (esperado um de {sorted(valid_statuses)})",
            response.text[:200],
        )

    header = response.headers.get("Access-Control-Allow-Origin")
    if expect_header:
        if header != origin:
            return CheckResult(
                name,
                False,
                "Cabeçalho Access-Control-Allow-Origin ausente/incorreto",
                f"Valor recebido: {header!r}",
            )
        return CheckResult(name, True, f"CORS liberou origem permitida (status {status})")

    if header is not None:
        return CheckResult(
            name,
            False,
            "Origem bloqueada recebeu cabeçalho indevido",
            f"Valor recebido: {header!r}",
        )
    return CheckResult(name, True, f"Origem não autorizada bloqueada (status {status})")


def run_token_forward_to_provider(
    session: requests.Session,
    base_url: str,
    *,
    origin: str,
    timeout: int,
    token_path: str,
    redirect_uri: str,
    provider_name: str,
    expected_error_codes: Optional[Sequence[str]] = None,
    extra_payload: Optional[dict] = None,
    expect_origin_header: Optional[str] = None,
) -> CheckResult:
    url = _build_url(base_url, token_path)
    name = f"POST {token_path} (proxy {provider_name})"
    payload = {
        "code": "dummy-authorization-code",
        "code_verifier": "dummy-code-verifier",
        "redirect_uri": redirect_uri,
        "grant_type": "authorization_code",
    }
    if extra_payload:
        payload.update(extra_payload)
    headers = {"Origin": origin, "Content-Type": "application/json"}

    try:
        response = session.post(url, json=payload, headers=headers, timeout=timeout)
    except requests.RequestException as exc:
        return CheckResult(name, False, "Erro de requisição", str(exc))

    try:
        data = response.json()
    except ValueError:
        return CheckResult(name, False, "Resposta não é JSON", response.text[:200])

    status = response.status_code
    error = data.get("error") if isinstance(data, dict) else None

    if status >= 500 or error == "server_error":
        return CheckResult(
            name,
            False,
            "Servidor retornou erro interno ao invés de encaminhar a requisição",
            f"Status {status}, payload: {str(data)[:200]}",
        )

    if expected_error_codes and error not in expected_error_codes:
        return CheckResult(
            name,
            False,
            "Erro inesperado recebido do provedor",
            f"Status {status}, payload: {str(data)[:200]}",
        )

    if expect_origin_header is not None:
        header_value = response.headers.get("Access-Control-Allow-Origin")
        if header_value != expect_origin_header:
            return CheckResult(
                name,
                False,
                "Cabeçalho Access-Control-Allow-Origin incorreto no response",
                f"Esperado: {expect_origin_header!r}, recebido: {header_value!r}",
            )

    message = f"Encaminhado - status {status}, erro {error or 'n/d'}"
    detail = None
    if status >= 400:
        detail = str(data)[:200]
    return CheckResult(name, True, message, detail)

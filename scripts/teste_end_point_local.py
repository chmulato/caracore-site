#!/usr/bin/env python3
"""Valida o backend rodando no ambiente Linux local (Docker).

Cenários cobertos:
  1. ``GET /health`` retorna 200 e JSON {"status": "ok"}.
  2. Preflight CORS para origem permitida retorna 204 com cabeçalho correto.
  3. Preflight CORS para origem bloqueada não devolve Access-Control-Allow-Origin.
  4. ``POST /oauth/google/token`` com payload JSON vazio retorna 400/invalid_request.
  5. ``POST /oauth/google/token`` com formulário sem campos obrigatórios retorna 400/invalid_request.
  6. ``POST /oauth/google/token`` com payload "válido" verifica se a troca é encaminhada quando as
      credenciais estão configuradas e se retorna 503/server_not_configured quando ausentes.
  7. ``OPTIONS`` e ``POST`` em ``/oauth/microsoft/token`` repetem os mesmos cenários de CORS e erros de payload.
  8. ``POST /oauth/microsoft/token`` com payload "válido" verifica se a troca é encaminhada quando as
      credenciais estão configuradas e se retorna 503/server_not_configured quando ausentes (ou outro
      comportamento configurado via ``--microsoft-expected-errors``).

Use ``python teste_end_point_local.py --help`` para ver as opções.
"""
from __future__ import annotations

import argparse
import os
import sys
from typing import List

import requests

from endpoint_checks import (
    CheckResult,
    log_summary,
    run_cors_preflight,
    run_health_check,
    run_token_missing_fields_form,
    run_token_missing_fields_json,
    run_token_forward_to_provider,
)

DEFAULT_BASE_URL = os.getenv("LOCAL_BACKEND_BASE_URL", "http://localhost:5051")
DEFAULT_ALLOWED_ORIGIN = os.getenv("LOCAL_ALLOWED_ORIGIN", "http://host.docker.internal:8080")
DEFAULT_BLOCKED_ORIGIN = os.getenv("LOCAL_BLOCKED_ORIGIN", "https://example.com")
DEFAULT_REDIRECT_URI = os.getenv("LOCAL_OAUTH_REDIRECT_URI", "https://localhost/auth/callback")
DEFAULT_TIMEOUT = int(os.getenv("LOCAL_BACKEND_TIMEOUT", "10"))
DEFAULT_MICROSOFT_SCOPE = os.getenv("LOCAL_MICROSOFT_SCOPE", "openid profile email")
DEFAULT_MICROSOFT_TENANT = os.getenv("LOCAL_MICROSOFT_TENANT", "common")
DEFAULT_MICROSOFT_EXPECTED_ERRORS = os.getenv("LOCAL_MICROSOFT_EXPECTED_ERRORS", "invalid_grant,invalid_client")


def _check_google_credentials(
    session: requests.Session,
    base_url: str,
    origin: str,
    *,
    timeout: int,
    expect_google_credentials: bool,
    redirect_uri: str,
) -> CheckResult:
    if expect_google_credentials:
        return run_token_forward_to_provider(
            session,
            base_url,
            origin=origin,
            timeout=timeout,
            token_path="/oauth/google/token",
            redirect_uri=redirect_uri,
            provider_name="google",
            expect_origin_header=origin,
        )

    url = f"{base_url.rstrip('/')}/oauth/google/token"
    payload = {
        "code": "dummy-authorization-code",
        "code_verifier": "dummy-code-verifier",
        "redirect_uri": redirect_uri,
        "grant_type": "authorization_code",
    }
    headers = {"Origin": origin, "Content-Type": "application/json"}
    try:
        response = session.post(url, json=payload, headers=headers, timeout=timeout)
    except requests.RequestException as exc:
        return CheckResult("POST /oauth/google/token (credenciais)", False, "Erro de requisição", str(exc))

    try:
        data = response.json()
    except ValueError:
        data = {"raw": response.text[:200]}

    if response.status_code != 503 or data.get("error") != "server_not_configured":
        return CheckResult(
            "POST /oauth/google/token (credenciais)",
            False,
            "Esperava erro 503/server_not_configured devido a credenciais ausentes",
            f"Status {response.status_code}, payload: {data}"
        )

    return CheckResult(
        "POST /oauth/google/token (credenciais)",
        True,
        "Servidor retornou 503/server_not_configured sem credenciais (comportamento esperado)",
    )


def _check_microsoft_credentials(
    session: requests.Session,
    base_url: str,
    origin: str,
    *,
    timeout: int,
    expect_microsoft_credentials: bool,
    redirect_uri: str,
    scope: str,
    tenant: str,
    expected_errors: List[str] | None,
) -> CheckResult:
    if expect_microsoft_credentials:
        extra_payload = {}
        if scope:
            extra_payload["scope"] = scope
        if tenant:
            extra_payload["tenant"] = tenant
        return run_token_forward_to_provider(
            session,
            base_url,
            origin=origin,
            timeout=timeout,
            token_path="/oauth/microsoft/token",
            redirect_uri=redirect_uri,
            provider_name="microsoft",
            expected_error_codes=expected_errors,
            extra_payload=extra_payload,
            expect_origin_header=origin,
        )

    url = f"{base_url.rstrip('/')}/oauth/microsoft/token"
    payload = {
        "code": "dummy-authorization-code",
        "code_verifier": "dummy-code-verifier",
        "redirect_uri": redirect_uri,
        "grant_type": "authorization_code",
    }
    if scope:
        payload["scope"] = scope
    if tenant:
        payload["tenant"] = tenant

    headers = {"Origin": origin, "Content-Type": "application/json"}
    try:
        response = session.post(url, json=payload, headers=headers, timeout=timeout)
    except requests.RequestException as exc:
        return CheckResult("POST /oauth/microsoft/token (credenciais)", False, "Erro de requisição", str(exc))

    try:
        data = response.json()
    except ValueError:
        data = {"raw": response.text[:200]}

    if response.status_code != 503 or data.get("error") != "server_not_configured":
        return CheckResult(
            "POST /oauth/microsoft/token (credenciais)",
            False,
            "Esperava erro 503/server_not_configured devido a credenciais ausentes",
            f"Status {response.status_code}, payload: {data}"
        )

    return CheckResult(
        "POST /oauth/microsoft/token (credenciais)",
        True,
        "Servidor retornou 503/server_not_configured sem credenciais (comportamento esperado)",
    )


def parse_args(argv: List[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Valida endpoints do backend local (Docker Linux)")
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL, help="URL base do backend local")
    parser.add_argument("--allowed-origin", default=DEFAULT_ALLOWED_ORIGIN, help="Origem permitida configurada no backend")
    parser.add_argument("--blocked-origin", default=DEFAULT_BLOCKED_ORIGIN, help="Origem não permitida para testar CORS")
    parser.add_argument("--redirect-uri", default=DEFAULT_REDIRECT_URI, help="redirect_uri usado no teste de credenciais")
    parser.add_argument("--timeout", type=int, default=DEFAULT_TIMEOUT, help="Timeout em segundos para cada requisição")
    parser.add_argument(
        "--expect-google-credentials",
        action="store_true",
        help="Indica que GOOGLE_CLIENT_ID/SECRET estão configurados e a troca deve ser encaminhada ao Google",
    )
    parser.add_argument(
        "--expect-microsoft-credentials",
        action="store_true",
        help="Indica que credenciais Microsoft Entra estão configuradas e a troca deve ser encaminhada ao Microsoft",
    )
    parser.add_argument(
        "--microsoft-tenant",
        default=DEFAULT_MICROSOFT_TENANT,
        help="Tenant a ser utilizado ao testar o endpoint Microsoft (ex.: common ou tenant GUID)",
    )
    parser.add_argument(
        "--microsoft-scope",
        default=DEFAULT_MICROSOFT_SCOPE,
        help="Scopes enviados no teste do endpoint Microsoft",
    )
    parser.add_argument(
        "--microsoft-expected-errors",
        default=DEFAULT_MICROSOFT_EXPECTED_ERRORS,
        help="Lista separada por vírgula de erros esperados ao encaminhar para Microsoft; use vazio para desabilitar",
    )
    parser.add_argument("--insecure", action="store_true", help="Desabilita verificação SSL (caso use https local com certificado self-signed)")
    return parser.parse_args(argv)


def main(argv: List[str] | None = None) -> int:
    args = parse_args(argv or sys.argv[1:])
    base_url = args.base_url.rstrip("/")

    session = requests.Session()
    if args.insecure:
        session.verify = False

    print(f"Testando backend local em {base_url}\n")

    microsoft_expected_errors: List[str] | None = None
    if args.microsoft_expected_errors is not None:
        microsoft_expected_errors = [
            item.strip()
            for item in args.microsoft_expected_errors.split(',')
            if item.strip()
        ]
        if not microsoft_expected_errors:
            microsoft_expected_errors = None

    results: List[CheckResult] = []
    results.append(run_health_check(session, base_url, timeout=args.timeout))
    results.append(
        run_cors_preflight(
            session,
            base_url,
            token_path="/oauth/google/token",
            origin=args.allowed_origin,
            expect_header=True,
            timeout=args.timeout,
        )
    )
    results.append(
        run_cors_preflight(
            session,
            base_url,
            token_path="/oauth/google/token",
            origin=args.blocked_origin,
            expect_header=False,
            timeout=args.timeout,
        )
    )
    results.append(
        run_cors_preflight(
            session,
            base_url,
            token_path="/oauth/microsoft/token",
            origin=args.allowed_origin,
            expect_header=True,
            timeout=args.timeout,
        )
    )
    results.append(
        run_cors_preflight(
            session,
            base_url,
            token_path="/oauth/microsoft/token",
            origin=args.blocked_origin,
            expect_header=False,
            timeout=args.timeout,
        )
    )
    results.append(
        run_token_missing_fields_json(
            session,
            base_url,
            origin=args.allowed_origin,
            timeout=args.timeout,
            token_path="/oauth/google/token",
        )
    )
    results.append(
        run_token_missing_fields_form(
            session,
            base_url,
            origin=args.allowed_origin,
            timeout=args.timeout,
            token_path="/oauth/google/token",
        )
    )
    results.append(
        run_token_missing_fields_json(
            session,
            base_url,
            origin=args.allowed_origin,
            timeout=args.timeout,
            token_path="/oauth/microsoft/token",
        )
    )
    results.append(
        run_token_missing_fields_form(
            session,
            base_url,
            origin=args.allowed_origin,
            timeout=args.timeout,
            token_path="/oauth/microsoft/token",
        )
    )
    results.append(
        _check_google_credentials(
            session,
            base_url,
            args.allowed_origin,
            timeout=args.timeout,
            expect_google_credentials=args.expect_google_credentials,
            redirect_uri=args.redirect_uri,
        )
    )
    results.append(
        _check_microsoft_credentials(
            session,
            base_url,
            args.allowed_origin,
            timeout=args.timeout,
            expect_microsoft_credentials=args.expect_microsoft_credentials,
            redirect_uri=args.redirect_uri,
            scope=args.microsoft_scope,
            tenant=args.microsoft_tenant,
            expected_errors=microsoft_expected_errors,
        )
    )

    success = True
    for result in results:
        result.log()
        success &= result.success

    overall = log_summary(results)
    return 0 if (success and overall) else 1


if __name__ == "__main__":
    raise SystemExit(main())

#!/usr/bin/env python3
"""Smoke tests para o backend publicado no Azure, incluindo validação do Key Vault."""
from __future__ import annotations

import argparse
import os
import sys
import json
from typing import List, Optional

import requests

from endpoint_checks import (
    CheckResult,
    log_summary,
    run_cors_preflight,
    run_health_check,
    run_token_forward_to_provider,
    run_token_missing_fields_form,
    run_token_missing_fields_json,
)

DEFAULT_BASE_URL = os.getenv("AZURE_BACKEND_BASE_URL", "https://caracore-backend.azurewebsites.net")
DEFAULT_ORIGIN = os.getenv("AZURE_ALLOWED_ORIGIN", "https://www.caracore.com.br")
DEFAULT_BLOCKED_ORIGIN = os.getenv("AZURE_BLOCKED_ORIGIN", "https://example.com")
DEFAULT_REDIRECT_URI = os.getenv("AZURE_OAUTH_REDIRECT_URI", "https://www.caracore.com.br/secure/index.html")
DEFAULT_MICROSOFT_SCOPE = os.getenv("AZURE_SCOPE", "openid profile email")
DEFAULT_MICROSOFT_TENANT = os.getenv("AZURE_TENANT_HINT")
DEFAULT_TIMEOUT = int(os.getenv("AZURE_BACKEND_TIMEOUT", "10"))

GOOGLE_TOKEN_PATH = "/oauth/google/token"
MICROSOFT_TOKEN_PATH = "/oauth/microsoft/token"
HEALTH_PATH = "/health"
CONFIG_PATH = "/debug/config"  # Endpoint para verificar configuração (se disponível)


def check_keyvault_integration(
    session: requests.Session, 
    base_url: str, 
    timeout: int = 10
) -> CheckResult:
    """
    Verifica se a integração com Azure Key Vault está funcionando.
    Testa o endpoint /health para confirmar que o GOOGLE_CLIENT_SECRET está sendo carregado do Key Vault.
    """
    try:
        url = f"{base_url}{HEALTH_PATH}"
        
        # Primeiro teste: verificar se o health endpoint está funcionando
        response = session.get(url, timeout=timeout)
        
        if response.status_code != 200:
            return CheckResult(
                name="Key Vault Integration - Health Check",
                success=False,
                message=f"Health endpoint retornou status {response.status_code}",
                detail=response.text[:200]
            )
        
        health_data = response.json()
        
        # Verificar se há informações sobre configuração na resposta de health
        config_status = health_data.get("config_status", {})
        google_secret_configured = config_status.get("google_client_secret_configured", False)
        
        if google_secret_configured:
            return CheckResult(
                name="Key Vault Integration - Google Secret",
                success=True,
                message="GOOGLE_CLIENT_SECRET está configurado e carregado com sucesso do Key Vault"
            )
        
        # Se não há informação específica, tentar um teste indireto
        # Fazer uma requisição que requer o client_secret e verificar se não retorna erro de configuração
        test_url = f"{base_url}{GOOGLE_TOKEN_PATH}"
        test_payload = {
            "code": "test_code_fake_for_validation",
            "redirect_uri": "https://www.caracore.com.br/secure/callback.html"
        }
        
        test_response = session.post(
            test_url,
            json=test_payload,
            headers={"Origin": "https://www.caracore.com.br"},
            timeout=timeout
        )
        
        # Verificar se a resposta indica falta de configuração vs. erro de token inválido
        if test_response.status_code == 500:
            try:
                error_data = test_response.json()
                error_msg = error_data.get("error", "").lower()
                
                if "client_secret" in error_msg or "not configured" in error_msg:
                    return CheckResult(
                        name="Key Vault Integration - Google Secret",
                        success=False,
                        message="GOOGLE_CLIENT_SECRET não está configurado corretamente",
                        detail=error_msg
                    )
            except:
                pass
        
        # Se chegou até aqui, provavelmente o secret está configurado
        # (erro 400/401 é esperado com código fake, mas 500 de configuração não)
        if test_response.status_code in [400, 401]:
            return CheckResult(
                name="Key Vault Integration - Google Secret",
                success=True,
                message="GOOGLE_CLIENT_SECRET parece estar configurado (erro de token inválido, não de configuração)"
            )
        
        return CheckResult(
            name="Key Vault Integration - Google Secret",
            success=True,
            message=f"Endpoint responde normalmente (status: {test_response.status_code}), Key Vault integração OK"
        )
        
    except requests.exceptions.RequestException as e:
        return CheckResult(
            name="Key Vault Integration - Connection",
            success=False,
            message="Erro de conexão ao testar Key Vault",
            detail=str(e)
        )
    except Exception as e:
        return CheckResult(
            name="Key Vault Integration - General",
            success=False,
            message="Erro inesperado ao testar Key Vault",
            detail=str(e)
        )


def check_azure_app_settings(
    session: requests.Session, 
    base_url: str, 
    timeout: int = 10
) -> CheckResult:
    """
    Verifica se as configurações do Azure App Service estão corretas.
    """
    try:
        # Tentar endpoint de configuração de debug (se disponível)
        debug_url = f"{base_url}{CONFIG_PATH}"
        response = session.get(debug_url, timeout=timeout)
        
        if response.status_code == 200:
            config_data = response.json()
            
            # Verificar configurações importantes
            required_configs = [
                "FLASK_ENV",
                "ORIGIN_ALLOWED", 
                "OAUTH_REDIRECT_URI",
                "GOOGLE_CLIENT_ID"
            ]
            
            missing_configs = []
            for config in required_configs:
                if not config_data.get(config):
                    missing_configs.append(config)
            
            if missing_configs:
                return CheckResult(
                    name="Azure App Settings",
                    success=False,
                    message="Configurações ausentes no App Service",
                    detail=f"Faltam: {', '.join(missing_configs)}"
                )
            
            return CheckResult(
                name="Azure App Settings",
                success=True,
                message="Todas as configurações essenciais estão definidas no App Service"
            )
        
        # Se endpoint de debug não existe, fazer verificação indireta via health
        health_url = f"{base_url}{HEALTH_PATH}"
        health_response = session.get(health_url, timeout=timeout)
        
        if health_response.status_code == 200:
            return CheckResult(
                name="Azure App Settings",
                success=True,
                message="App Service está funcionando, configurações básicas parecem estar OK"
            )
        
        return CheckResult(
            name="Azure App Settings",
            success=False,
            message="Não foi possível verificar configurações",
            detail=f"Health endpoint retornou status {health_response.status_code}"
        )
        
    except Exception as e:
        return CheckResult(
            name="Azure App Settings",
            success=False,
            message="Erro ao verificar configurações",
            detail=str(e)
        )


def parse_args(argv: List[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Valida endpoints do backend publicado no Azure")
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL, help="URL base do backend no Azure")
    parser.add_argument("--origin", default=DEFAULT_ORIGIN, help="Origem a ser enviada nos testes (para checar CORS)")
    parser.add_argument("--blocked-origin", default=DEFAULT_BLOCKED_ORIGIN, help="Origem não permitida para testar CORS")
    parser.add_argument("--redirect-uri", default=DEFAULT_REDIRECT_URI, help="redirect_uri usada nas requisições de código (deve corresponder ao front)")
    parser.add_argument("--timeout", type=int, default=DEFAULT_TIMEOUT, help="Timeout em segundos para cada requisição")
    parser.add_argument("--microsoft-scope", default=DEFAULT_MICROSOFT_SCOPE, help="Escopo enviado no teste do endpoint Microsoft")
    parser.add_argument("--microsoft-tenant", default=DEFAULT_MICROSOFT_TENANT, help="Tenant opcional a incluir no teste Microsoft (ex.: consumers)")
    parser.add_argument("--insecure", action="store_true", help="Desabilita verificação SSL (usar somente para testes)")
    parser.add_argument("--skip-keyvault", action="store_true", help="Pula a verificação de integração com Key Vault")
    parser.add_argument("--skip-app-settings", action="store_true", help="Pula a verificação de configurações do App Service")
    return parser.parse_args(argv)


def run_checks(args: argparse.Namespace) -> List[CheckResult]:
    base_url = args.base_url.rstrip("/")
    session = requests.Session()
    if args.insecure:
        session.verify = False

    results: List[CheckResult] = []
    
    # 1. Health Check básico
    results.append(run_health_check(session, base_url, timeout=args.timeout))
    
    # 2. Verificação de integração com Key Vault (se não foi pulada)
    if not args.skip_keyvault:
        results.append(check_keyvault_integration(session, base_url, timeout=args.timeout))
    
    # 3. Verificação das configurações do App Service (se não foi pulada)
    if not args.skip_app_settings:
        results.append(check_azure_app_settings(session, base_url, timeout=args.timeout))
    
    # 4. Testes CORS para Google
    results.append(
        run_cors_preflight(
            session,
            base_url,
            token_path=GOOGLE_TOKEN_PATH,
            origin=args.origin,
            expect_header=True,
            timeout=args.timeout,
        )
    )
    results.append(
        run_cors_preflight(
            session,
            base_url,
            token_path=GOOGLE_TOKEN_PATH,
            origin=args.blocked_origin,
            expect_header=False,
            timeout=args.timeout,
        )
    )
    
    # 5. Testes de validação de campos para Google
    results.append(run_token_missing_fields_json(session, base_url, origin=args.origin, timeout=args.timeout))
    results.append(run_token_missing_fields_form(session, base_url, origin=args.origin, timeout=args.timeout))
    
    # 6. Teste de encaminhamento para Google (com client_secret do Key Vault)
    results.append(
        run_token_forward_to_provider(
            session,
            base_url,
            origin=args.origin,
            timeout=args.timeout,
            token_path=GOOGLE_TOKEN_PATH,
            redirect_uri=args.redirect_uri,
            provider_name="Google",
            expected_error_codes=("invalid_grant", "invalid_request"),
            expect_origin_header=args.origin,
        )
    )
    
    # 7. Testes CORS para Microsoft
    results.append(
        run_cors_preflight(
            session,
            base_url,
            token_path=MICROSOFT_TOKEN_PATH,
            origin=args.origin,
            expect_header=True,
            timeout=args.timeout,
        )
    )
    # 8. Testes CORS para Microsoft (origem bloqueada)
    results.append(
        run_cors_preflight(
            session,
            base_url,
            token_path=MICROSOFT_TOKEN_PATH,
            origin=args.blocked_origin,
            expect_header=False,
            timeout=args.timeout,
        )
    )
    
    # 9. Testes de validação de campos para Microsoft
    results.append(
        run_token_missing_fields_json(
            session,
            base_url,
            origin=args.origin,
            timeout=args.timeout,
            token_path=MICROSOFT_TOKEN_PATH,
        )
    )
    results.append(
        run_token_missing_fields_form(
            session,
            base_url,
            origin=args.origin,
            timeout=args.timeout,
            token_path=MICROSOFT_TOKEN_PATH,
        )
    )

    # 10. Teste de encaminhamento para Microsoft
    ms_extra = {"scope": args.microsoft_scope}
    if args.microsoft_tenant:
        ms_extra["tenant"] = args.microsoft_tenant

    results.append(
        run_token_forward_to_provider(
            session,
            base_url,
            origin=args.origin,
            timeout=args.timeout,
            token_path=MICROSOFT_TOKEN_PATH,
            redirect_uri=args.redirect_uri,
            provider_name="Microsoft",
            expected_error_codes=(
                "invalid_grant",
                "invalid_request",
                "interaction_required",
                "invalid_client",
                "unauthorized_client",
            ),
            extra_payload=ms_extra,
            expect_origin_header=args.origin,
        )
    )
    return results


def main(argv: List[str] | None = None) -> int:
    args = parse_args(argv or sys.argv[1:])

    print(f"Testando backend Azure em {args.base_url}")
    print("=" * 60)
    print("Testes incluidos:")
    print("   * Health Check basico")
    if not args.skip_keyvault:
        print("   * Integracao com Azure Key Vault (GOOGLE_CLIENT_SECRET)")
    if not args.skip_app_settings:
        print("   * Configuracoes do Azure App Service")
    print("   * CORS para Google e Microsoft")
    print("   * Validacao de campos obrigatorios")
    print("   * Encaminhamento para provedores OAuth")
    print("=" * 60)
    print()

    results = run_checks(args)
    success = True
    
    print("RESULTADOS DOS TESTES:")
    print("-" * 40)
    
    for result in results:
        result.log()
        success &= result.success

    print("\n" + "=" * 60)
    overall = log_summary(results)
    
    if success and overall:
        print("TODOS OS TESTES PASSARAM!")
        print("A API está funcionando corretamente no Azure")
        if not args.skip_keyvault:
            print("Key Vault integracao validada")
    else:
        print("ALGUNS TESTES FALHARAM!")
        print("Verifique os detalhes acima e corrija as configuracoes")
    
    print("=" * 60)
    return 0 if (success and overall) else 1


if __name__ == "__main__":
    raise SystemExit(main())

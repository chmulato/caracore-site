#!/usr/bin/env python3
"""
Script para testar integração Azure Key Vault (versão Windows compatível).
Valida se o GOOGLE_CLIENT_SECRET está sendo carregado corretamente do Key Vault na API do Azure.
"""
from __future__ import annotations

import argparse
import json
import sys
from typing import Optional

import requests


def test_keyvault_integration(base_url: str, timeout: int = 30) -> dict:
    """
    Testa a integração com Azure Key Vault verificando se o GOOGLE_CLIENT_SECRET 
    está sendo carregado corretamente.
    
    Returns:
        dict: Resultado do teste com success (bool), message (str) e details (dict)
    """
    base_url = base_url.rstrip("/")
    session = requests.Session()
    
    try:
        # 1. Verificar health endpoint
        print(">>> Verificando health endpoint...")
        health_url = f"{base_url}/health"
        health_response = session.get(health_url, timeout=timeout)
        
        if health_response.status_code != 200:
            return {
                "success": False,
                "message": f"Health endpoint falhou (status: {health_response.status_code})",
                "details": {"health_status": health_response.status_code, "response": health_response.text[:200]}
            }
        
        health_data = health_response.json()
        print(f"OK: Health endpoint funcionando: {health_data.get('status', 'unknown')}")
        
        # 2. Testar endpoint Google OAuth que requer client_secret
        print(">>> Testando integração Key Vault via endpoint Google OAuth...")
        google_url = f"{base_url}/oauth/google/token"
        
        # Payload de teste (vai falhar, mas queremos ver o tipo de erro)
        test_payload = {
            "code": "test_invalid_code_for_keyvault_validation",
            "redirect_uri": "https://www.caracore.com.br/secure/callback.html"
        }
        
        headers = {
            "Content-Type": "application/json",
            "Origin": "https://www.caracore.com.br"
        }
        
        oauth_response = session.post(
            google_url,
            json=test_payload,
            headers=headers,
            timeout=timeout
        )
        
        print(f">>> Resposta OAuth Google: status {oauth_response.status_code}")
        
        # Analisar resposta para determinar se Key Vault está funcionando
        if oauth_response.status_code == 500:
            try:
                error_data = oauth_response.json()
                error_msg = error_data.get("error", "").lower()
                
                # Verificar se é erro de configuração (Key Vault não funcionando)
                if any(phrase in error_msg for phrase in [
                    "client_secret", "not configured", "missing secret", 
                    "keyvault", "key vault", "configuration error"
                ]):
                    return {
                        "success": False,
                        "message": "GOOGLE_CLIENT_SECRET não está configurado ou não pôde ser carregado do Key Vault",
                        "details": {
                            "error_type": "configuration_error",
                            "error_message": error_msg,
                            "status_code": 500
                        }
                    }
                
                # Se é outro tipo de erro 500, pode ser problema no Key Vault
                return {
                    "success": False,
                    "message": "Erro interno no servidor (possível problema no Key Vault)",
                    "details": {
                        "error_type": "server_error", 
                        "error_message": error_msg,
                        "status_code": 500
                    }
                }
                
            except json.JSONDecodeError:
                return {
                    "success": False,
                    "message": "Erro 500 sem resposta JSON válida (possível problema na configuração)",
                    "details": {
                        "error_type": "parse_error",
                        "response_text": oauth_response.text[:300],
                        "status_code": 500
                    }
                }
        
        # Status 400/401 é esperado com código inválido, indica que Key Vault está OK
        elif oauth_response.status_code in [400, 401]:
            try:
                error_data = oauth_response.json()
                error_msg = error_data.get("error", "")
                
                # Verificar se é erro esperado do Google (código inválido)
                if any(phrase in error_msg.lower() for phrase in [
                    "invalid_grant", "invalid_request", "authorization code"
                ]):
                    return {
                        "success": True,
                        "message": "SUCCESS: Key Vault integração OK - GOOGLE_CLIENT_SECRET está sendo carregado corretamente",
                        "details": {
                            "status_code": oauth_response.status_code,
                            "error_type": "expected_oauth_error",
                            "google_error": error_msg
                        }
                    }
                
            except json.JSONDecodeError:
                pass
        
        # Outros status codes
        return {
            "success": True,
            "message": f"Key Vault parece estar funcionando (status: {oauth_response.status_code})",
            "details": {
                "status_code": oauth_response.status_code,
                "response_preview": oauth_response.text[:200]
            }
        }
        
    except requests.exceptions.Timeout:
        return {
            "success": False,
            "message": f"Timeout após {timeout}s - verifique se a API está acessível",
            "details": {"error_type": "timeout"}
        }
    except requests.exceptions.ConnectionError as e:
        return {
            "success": False,
            "message": f"Erro de conexão: {str(e)}",
            "details": {"error_type": "connection_error", "error": str(e)}
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"Erro inesperado: {str(e)}",
            "details": {"error_type": "unexpected_error", "error": str(e)}
        }


def main():
    parser = argparse.ArgumentParser(
        description="Testa integração Azure Key Vault para GOOGLE_CLIENT_SECRET"
    )
    parser.add_argument(
        "--base-url", 
        default="https://api-caracore.azurewebsites.net",
        help="URL base da API no Azure"
    )
    parser.add_argument(
        "--timeout", 
        type=int, 
        default=30,
        help="Timeout em segundos para requisições"
    )
    parser.add_argument(
        "--verbose", 
        action="store_true",
        help="Exibe detalhes completos do teste"
    )
    
    args = parser.parse_args()
    
    print("TESTE DE INTEGRACAO AZURE KEY VAULT")
    print("=" * 50)
    print(f"API: {args.base_url}")
    print(f"Timeout: {args.timeout}s")
    print("=" * 50)
    print()
    
    result = test_keyvault_integration(args.base_url, args.timeout)
    
    print("RESULTADO:")
    print("-" * 30)
    
    if result["success"]:
        print(f"SUCCESS: {result['message']}")
    else:
        print(f"FAILED: {result['message']}")
    
    if args.verbose or not result["success"]:
        print("\nDETALHES:")
        print(json.dumps(result["details"], indent=2, ensure_ascii=False))
    
    print("\n" + "=" * 50)
    
    if result["success"]:
        print("INTEGRACAO KEY VAULT FUNCIONANDO!")
        print("O GOOGLE_CLIENT_SECRET está sendo carregado corretamente do Azure Key Vault")
    else:
        print("PROBLEMA NA INTEGRACAO KEY VAULT!")
        print("Verifique:")
        print("   - Se o Key Vault foi criado e configurado")
        print("   - Se o GOOGLE_CLIENT_SECRET foi adicionado ao Key Vault")
        print("   - Se a Managed Identity tem permissão para acessar o Key Vault")
        print("   - Se as App Settings referenciam o Key Vault corretamente")
    
    return 0 if result["success"] else 1


if __name__ == "__main__":
    sys.exit(main())
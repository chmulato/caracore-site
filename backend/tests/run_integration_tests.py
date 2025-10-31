#!/usr/bin/env python3
"""
Script de Testes Completo - Fase 1
Testa todos os endpoints e funcionalidades da Fase 1
"""

import requests
import time
import json
from datetime import datetime

# Configuração
BASE_URL = "http://127.0.0.1:5051"
RESULTS = {
    "total": 0,
    "passed": 0,
    "failed": 0,
    "tests": []
}

def log_result(test_name, passed, details=""):
    """Registra resultado de um teste"""
    RESULTS["total"] += 1
    if passed:
        RESULTS["passed"] += 1
        status = "✅ PASSOU"
    else:
        RESULTS["failed"] += 1
        status = "❌ FALHOU"
    
    result = {
        "name": test_name,
        "passed": passed,
        "details": details,
        "timestamp": datetime.now().isoformat()
    }
    RESULTS["tests"].append(result)
    print(f"{status} - {test_name}")
    if details:
        print(f"   Detalhes: {details}")

def test_health_endpoint():
    """Teste 1: Endpoint de saúde"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        passed = response.status_code == 200
        log_result("Health Endpoint", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        log_result("Health Endpoint", False, f"Erro: {str(e)}")
        return False

def test_security_headers():
    """Teste 2: Security Headers"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        headers = response.headers
        
        expected_headers = [
            "Strict-Transport-Security",
            "Content-Security-Policy",
            "X-Frame-Options",
            "X-Content-Type-Options",
            "Referrer-Policy"
        ]
        
        missing = [h for h in expected_headers if h not in headers]
        passed = len(missing) == 0
        
        details = f"Headers presentes: {len(expected_headers) - len(missing)}/{len(expected_headers)}"
        if missing:
            details += f" | Faltando: {', '.join(missing)}"
        
        log_result("Security Headers", passed, details)
        return passed
    except Exception as e:
        log_result("Security Headers", False, f"Erro: {str(e)}")
        return False

def test_cors_headers():
    """Teste 3: CORS Headers"""
    try:
        response = requests.options(f"{BASE_URL}/oauth/google/token")
        headers = response.headers
        
        has_cors = (
            "Access-Control-Allow-Origin" in headers and
            "Access-Control-Allow-Methods" in headers
        )
        
        details = f"CORS configurado corretamente"
        if not has_cors:
            details = "CORS headers ausentes"
        
        log_result("CORS Headers", has_cors, details)
        return has_cors
    except Exception as e:
        log_result("CORS Headers", False, f"Erro: {str(e)}")
        return False

def test_rate_limiting():
    """Teste 4: Rate Limiting"""
    try:
        # Testar endpoint com limite baixo
        endpoint = f"{BASE_URL}/auth/validate"
        
        # Fazer 35 requisições (limite é 30/min)
        responses = []
        for i in range(35):
            response = requests.post(
                endpoint,
                json={"access_token": "test", "provider": "google"},
                headers={"Content-Type": "application/json"}
            )
            responses.append(response.status_code)
            time.sleep(0.1)  # Pequeno delay entre requisições
        
        # Verificar se houve bloqueio (429)
        blocked = 429 in responses
        
        details = f"Requisições: {len(responses)} | 429s: {responses.count(429)}"
        log_result("Rate Limiting", blocked, details)
        return blocked
    except Exception as e:
        log_result("Rate Limiting", False, f"Erro: {str(e)}")
        return False

def test_rate_limit_headers():
    """Teste 5: Rate Limit Headers"""
    try:
        response = requests.post(
            f"{BASE_URL}/auth/validate",
            json={"access_token": "test", "provider": "google"}
        )
        
        headers = response.headers
        has_headers = (
            "X-RateLimit-Limit" in headers and
            "X-RateLimit-Remaining" in headers and
            "X-RateLimit-Reset" in headers
        )
        
        details = f"Limit: {headers.get('X-RateLimit-Limit')}, Remaining: {headers.get('X-RateLimit-Remaining')}"
        log_result("Rate Limit Headers", has_headers, details)
        return has_headers
    except Exception as e:
        log_result("Rate Limit Headers", False, f"Erro: {str(e)}")
        return False

def test_oauth_google_token_endpoint():
    """Teste 6: POST /oauth/google/token"""
    try:
        response = requests.post(
            f"{BASE_URL}/oauth/google/token",
            json={
                "code": "test_code",
                "code_verifier": "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk",
                "code_challenge": "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
                "grant_type": "authorization_code",
                "redirect_uri": "http://localhost:5051/callback"
            }
        )
        
        # Esperamos erro 500 porque não temos credenciais configuradas
        # Mas o endpoint deve responder
        passed = response.status_code in [400, 500]
        details = f"Status: {response.status_code} (esperado 400/500 sem credenciais)"
        
        log_result("POST /oauth/google/token", passed, details)
        return passed
    except Exception as e:
        log_result("POST /oauth/google/token", False, f"Erro: {str(e)}")
        return False

def test_oauth_microsoft_token_endpoint():
    """Teste 7: POST /oauth/microsoft/token"""
    try:
        response = requests.post(
            f"{BASE_URL}/oauth/microsoft/token",
            json={
                "code": "test_code",
                "code_verifier": "test_verifier",
                "code_challenge": "test_challenge",
                "grant_type": "authorization_code",
                "redirect_uri": "http://localhost:5051/callback"
            }
        )
        
        # Esperamos erro porque não temos credenciais
        passed = response.status_code in [400, 500]
        details = f"Status: {response.status_code} (esperado 400/500 sem credenciais)"
        
        log_result("POST /oauth/microsoft/token", passed, details)
        return passed
    except Exception as e:
        log_result("POST /oauth/microsoft/token", False, f"Erro: {str(e)}")
        return False

def test_auth_validate_endpoint():
    """Teste 8: POST /auth/validate"""
    try:
        response = requests.post(
            f"{BASE_URL}/auth/validate",
            json={
                "access_token": "test_token",
                "provider": "google"
            }
        )
        
        # Endpoint deve responder (mesmo que token seja inválido)
        passed = response.status_code in [200, 401, 400]
        details = f"Status: {response.status_code}"
        
        log_result("POST /auth/validate", passed, details)
        return passed
    except Exception as e:
        log_result("POST /auth/validate", False, f"Erro: {str(e)}")
        return False

def test_auth_refresh_endpoint():
    """Teste 9: POST /auth/token/refresh"""
    try:
        response = requests.post(
            f"{BASE_URL}/auth/token/refresh",
            json={
                "refresh_token": "test_refresh",
                "provider": "google"
            }
        )
        
        # Endpoint deve responder
        passed = response.status_code in [200, 401, 400, 500]
        details = f"Status: {response.status_code}"
        
        log_result("POST /auth/token/refresh", passed, details)
        return passed
    except Exception as e:
        log_result("POST /auth/token/refresh", False, f"Erro: {str(e)}")
        return False

def test_auth_logout_endpoint():
    """Teste 10: POST /auth/logout"""
    try:
        response = requests.post(
            f"{BASE_URL}/auth/logout",
            json={
                "access_token": "test_token",
                "refresh_token": "test_refresh",
                "provider": "google"
            }
        )
        
        # Endpoint deve responder
        passed = response.status_code in [200, 400, 500]
        details = f"Status: {response.status_code}"
        
        log_result("POST /auth/logout", passed, details)
        return passed
    except Exception as e:
        log_result("POST /auth/logout", False, f"Erro: {str(e)}")
        return False

def test_consent_register_endpoint():
    """Teste 11: POST /api/consent/register"""
    try:
        response = requests.post(
            f"{BASE_URL}/api/consent/register",
            json={
                "provider": "google",
                "scopes": ["profile", "email"],
                "user_id": "test_user"
            }
        )
        
        # Endpoint deve responder
        passed = response.status_code in [200, 201, 400]
        details = f"Status: {response.status_code}"
        
        log_result("POST /api/consent/register", passed, details)
        return passed
    except Exception as e:
        log_result("POST /api/consent/register", False, f"Erro: {str(e)}")
        return False

def test_consent_revoke_endpoint():
    """Teste 12: POST /api/consent/revoke"""
    try:
        response = requests.post(
            f"{BASE_URL}/api/consent/revoke",
            json={
                "provider": "google",
                "user_id": "test_user"
            }
        )
        
        # Endpoint deve responder
        passed = response.status_code in [200, 204, 400]
        details = f"Status: {response.status_code}"
        
        log_result("POST /api/consent/revoke", passed, details)
        return passed
    except Exception as e:
        log_result("POST /api/consent/revoke", False, f"Erro: {str(e)}")
        return False

def test_invalid_endpoint():
    """Teste 13: Endpoint inexistente (404)"""
    try:
        response = requests.get(f"{BASE_URL}/invalid/endpoint")
        passed = response.status_code == 404
        details = f"Status: {response.status_code}"
        
        log_result("404 para endpoint inválido", passed, details)
        return passed
    except Exception as e:
        log_result("404 para endpoint inválido", False, f"Erro: {str(e)}")
        return False

def generate_report():
    """Gera relatório final dos testes"""
    print("\n" + "="*60)
    print("RELATÓRIO FINAL - TESTES FASE 1")
    print("="*60)
    print(f"Total de testes: {RESULTS['total']}")
    print(f"Aprovados: {RESULTS['passed']} ✅")
    print(f"Reprovados: {RESULTS['failed']} ❌")
    
    if RESULTS['total'] > 0:
        percentage = (RESULTS['passed'] / RESULTS['total']) * 100
        print(f"Taxa de sucesso: {percentage:.1f}%")
    
    print("\n" + "="*60)
    
    # Salvar relatório em JSON
    with open("backend/tests/test_results_fase1.json", "w", encoding="utf-8") as f:
        json.dump(RESULTS, f, indent=2, ensure_ascii=False)
    
    print("\nRelatório salvo em: backend/tests/test_results_fase1.json")
    
    return RESULTS['failed'] == 0

def main():
    """Executa todos os testes"""
    print("="*60)
    print("INICIANDO TESTES - FASE 1")
    print("Testando servidor em:", BASE_URL)
    print("="*60)
    print()
    
    # Verificar se servidor está rodando
    try:
        requests.get(f"{BASE_URL}/health", timeout=2)
    except:
        print("❌ ERRO: Servidor não está rodando!")
        print("Inicie o servidor com: flask run --port=5051")
        return False
    
    # Executar testes
    test_health_endpoint()
    test_security_headers()
    test_cors_headers()
    test_rate_limit_headers()
    test_oauth_google_token_endpoint()
    test_oauth_microsoft_token_endpoint()
    test_auth_validate_endpoint()
    test_auth_refresh_endpoint()
    test_auth_logout_endpoint()
    test_consent_register_endpoint()
    test_consent_revoke_endpoint()
    test_invalid_endpoint()
    
    # Rate limiting por último (mais lento)
    print("\n⏱️  Testando rate limiting (pode demorar ~4 segundos)...")
    test_rate_limiting()
    
    # Gerar relatório
    success = generate_report()
    
    return success

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)

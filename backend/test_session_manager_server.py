#!/usr/bin/env python3
"""
Script para testar se o SessionManager está implementado e funcionando no servidor.

Uso:
    python test_session_manager_server.py [--url URL] [--verbose]

Exemplos:
    # Testar servidor de produção
    python test_session_manager_server.py --url https://caracore-backend-docker.azurewebsites.net

    # Testar servidor local
    python test_session_manager_server.py --url http://localhost:5051

    # Modo verbose
    python test_session_manager_server.py --verbose
"""

import argparse
import json
import sys
import requests
from typing import Dict, Optional, Any
from datetime import datetime

# Cores para output (opcional)
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def print_success(message: str):
    print(f"{Colors.GREEN}✅ {message}{Colors.RESET}")

def print_error(message: str):
    print(f"{Colors.RED}❌ {message}{Colors.RESET}")

def print_warning(message: str):
    print(f"{Colors.YELLOW}⚠️  {message}{Colors.RESET}")

def print_info(message: str):
    print(f"{Colors.BLUE}ℹ️  {message}{Colors.RESET}")

def print_header(message: str):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{message}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.RESET}\n")

def test_health_check(base_url: str, verbose: bool = False) -> bool:
    """Testa se o servidor está respondendo"""
    print_header("1. Verificando Health Check do Servidor")
    
    try:
        health_url = f"{base_url}/health"
        if verbose:
            print_info(f"GET {health_url}")
        
        response = requests.get(health_url, timeout=10)
        
        if response.status_code == 200:
            print_success(f"Servidor está respondendo (Status: {response.status_code})")
            if verbose:
                try:
                    data = response.json()
                    print_info(f"Resposta: {json.dumps(data, indent=2)}")
                except:
                    print_info(f"Resposta: {response.text[:200]}")
            return True
        else:
            print_warning(f"Servidor respondeu com status {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print_error(f"Erro ao conectar ao servidor: {e}")
        return False

def test_session_manager_enabled(base_url: str, verbose: bool = False) -> bool:
    """Testa se o SessionManager está habilitado tentando criar uma sessão inválida"""
    print_header("2. Verificando se SessionManager está Habilitado")
    
    try:
        # Tentar criar sessão com dados inválidos
        # Se retornar 503, significa que SessionManager não está habilitado
        # Se retornar 400, significa que está habilitado mas os dados são inválidos
        
        create_url = f"{base_url}/auth/session/create"
        payload = {
            "user_data": {},
            "tokens": {}
        }
        
        if verbose:
            print_info(f"POST {create_url}")
            print_info(f"Payload: {json.dumps(payload, indent=2)}")
        
        response = requests.post(
            create_url,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 503:
            error_data = response.json()
            if "service_unavailable" in error_data.get("error", ""):
                print_error("SessionManager NÃO está habilitado no servidor")
                print_warning("Motivo: Sistema de sessões não disponível")
                if verbose:
                    print_info(f"Resposta: {json.dumps(error_data, indent=2)}")
                return False
        
        elif response.status_code == 400:
            error_data = response.json()
            if "invalid_request" in error_data.get("error", ""):
                print_success("SessionManager está HABILITADO no servidor")
                print_info("Endpoint respondeu com erro de validação (esperado para dados inválidos)")
                if verbose:
                    print_info(f"Resposta: {json.dumps(error_data, indent=2)}")
                return True
        
        else:
            print_warning(f"Resposta inesperada: Status {response.status_code}")
            if verbose:
                print_info(f"Resposta: {response.text[:500]}")
            return False
            
    except requests.exceptions.RequestException as e:
        print_error(f"Erro ao testar SessionManager: {e}")
        return False

def test_endpoints_exist(base_url: str, verbose: bool = False) -> Dict[str, bool]:
    """Testa se os endpoints de sessão existem"""
    print_header("3. Verificando Existência dos Endpoints")
    
    endpoints = {
        "create": "/auth/session/create",
        "refresh": "/auth/session/refresh",
        "revoke": "/auth/session/revoke"
    }
    
    results = {}
    
    for name, endpoint in endpoints.items():
        url = f"{base_url}{endpoint}"
        
        # Testar OPTIONS (CORS preflight)
        try:
            if verbose:
                print_info(f"OPTIONS {url}")
            
            response = requests.options(url, timeout=10)
            
            if response.status_code in [200, 204]:
                print_success(f"Endpoint {name} existe (OPTIONS: {response.status_code})")
                results[name] = True
            else:
                print_warning(f"Endpoint {name} retornou status {response.status_code}")
                results[name] = False
                
        except requests.exceptions.RequestException as e:
            print_error(f"Erro ao testar endpoint {name}: {e}")
            results[name] = False
    
    return results

def test_endpoint_validation(base_url: str, verbose: bool = False) -> Dict[str, bool]:
    """Testa validação dos endpoints com dados inválidos"""
    print_header("4. Testando Validação dos Endpoints")
    
    results = {}
    
    # Teste 1: Create Session - dados vazios
    try:
        create_url = f"{base_url}/auth/session/create"
        response = requests.post(
            create_url,
            json={"user_data": {}, "tokens": {}},
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 400:
            print_success("Endpoint create_session valida dados corretamente")
            results["create_validation"] = True
        else:
            print_warning(f"Validação create_session retornou status {response.status_code}")
            results["create_validation"] = False
            
    except Exception as e:
        print_error(f"Erro ao testar validação create_session: {e}")
        results["create_validation"] = False
    
    # Teste 2: Refresh Session - session_id vazio
    try:
        refresh_url = f"{base_url}/auth/session/refresh"
        response = requests.post(
            refresh_url,
            json={"session_id": ""},
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 400:
            print_success("Endpoint refresh_session valida dados corretamente")
            results["refresh_validation"] = True
        else:
            print_warning(f"Validação refresh_session retornou status {response.status_code}")
            results["refresh_validation"] = False
            
    except Exception as e:
        print_error(f"Erro ao testar validação refresh_session: {e}")
        results["refresh_validation"] = False
    
    # Teste 3: Revoke Session - session_id vazio
    try:
        revoke_url = f"{base_url}/auth/session/revoke"
        response = requests.post(
            revoke_url,
            json={"session_id": ""},
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 400:
            print_success("Endpoint revoke_session valida dados corretamente")
            results["revoke_validation"] = True
        else:
            print_warning(f"Validação revoke_session retornou status {response.status_code}")
            results["revoke_validation"] = False
            
    except Exception as e:
        print_error(f"Erro ao testar validação revoke_session: {e}")
        results["revoke_validation"] = False
    
    return results

def generate_report(results: Dict[str, Any], base_url: str):
    """Gera relatório final dos testes"""
    print_header("📊 Relatório Final")
    
    total_tests = 0
    passed_tests = 0
    
    # Health check
    if "health_check" in results:
        total_tests += 1
        if results["health_check"]:
            passed_tests += 1
            print_success("✓ Health Check")
        else:
            print_error("✗ Health Check")
    
    # SessionManager habilitado
    if "session_manager_enabled" in results:
        total_tests += 1
        if results["session_manager_enabled"]:
            passed_tests += 1
            print_success("✓ SessionManager Habilitado")
        else:
            print_error("✗ SessionManager Habilitado")
    
    # Endpoints existem
    if "endpoints" in results:
        for name, exists in results["endpoints"].items():
            total_tests += 1
            if exists:
                passed_tests += 1
                print_success(f"✓ Endpoint {name} existe")
            else:
                print_error(f"✗ Endpoint {name} existe")
    
    # Validação
    if "validation" in results:
        for name, valid in results["validation"].items():
            total_tests += 1
            if valid:
                passed_tests += 1
                print_success(f"✓ Validação {name}")
            else:
                print_error(f"✗ Validação {name}")
    
    print(f"\n{Colors.BOLD}Resultado: {passed_tests}/{total_tests} testes passaram{Colors.RESET}\n")
    
    if passed_tests == total_tests:
        print_success("🎉 Todos os testes passaram! SessionManager está implementado e funcionando.")
    else:
        print_warning("⚠️  Alguns testes falharam. Verifique a configuração do servidor.")
        print_info(f"URL testada: {base_url}")
        print_info("Verifique:")
        print_info("  1. Variável de ambiente TOKEN_ENCRYPTION_KEY está configurada")
        print_info("  2. Arquivo session_manager.py está no deploy")
        print_info("  3. Dependências (crypto_manager, token_storage) estão disponíveis")
        print_info("  4. Logs do servidor para mais detalhes")

def main():
    parser = argparse.ArgumentParser(
        description="Testa se SessionManager está implementado no servidor"
    )
    parser.add_argument(
        "--url",
        default="https://caracore-backend-docker.azurewebsites.net",
        help="URL base do servidor backend (default: produção)"
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Modo verbose (mostra requisições e respostas)"
    )
    
    args = parser.parse_args()
    
    base_url = args.url.rstrip('/')
    verbose = args.verbose
    
    print_header("🧪 Teste de SessionManager no Servidor")
    print_info(f"URL do servidor: {base_url}")
    print_info(f"Data/Hora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    results = {}
    
    # Teste 1: Health Check
    results["health_check"] = test_health_check(base_url, verbose)
    
    if not results["health_check"]:
        print_error("Servidor não está respondendo. Abortando testes.")
        sys.exit(1)
    
    # Teste 2: SessionManager habilitado
    results["session_manager_enabled"] = test_session_manager_enabled(base_url, verbose)
    
    # Teste 3: Endpoints existem
    results["endpoints"] = test_endpoints_exist(base_url, verbose)
    
    # Teste 4: Validação
    results["validation"] = test_endpoint_validation(base_url, verbose)
    
    # Relatório final
    generate_report(results, base_url)
    
    # Exit code baseado nos resultados
    if results.get("session_manager_enabled", False):
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()


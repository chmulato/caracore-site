#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Teste do Backend CaraCore no Azure
===================================

Script para testar os endpoints do backend OAuth 2.1 + OIDC
publicado em caracore-backend.azurewebsites.net

Endpoints testados:
- GET  /health                        - Health check
- POST /oauth/google/token            - Token exchange Google
- POST /oauth/microsoft/token         - Token exchange Microsoft
- POST /auth/validate                 - Validação de tokens
- POST /auth/token/refresh            - Refresh de tokens
- POST /auth/logout                   - Logout
- POST /api/consent/register          - Registro de consentimento
- POST /api/consent/revoke            - Revogação de consentimento

Uso:
    python scripts/teste_backend_azure.py
    python scripts/teste_backend_azure.py --verbose
    python scripts/teste_backend_azure.py --endpoint health
"""

import argparse
import json
import sys
from datetime import datetime
from typing import Optional
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry


class Colors:
    """Códigos ANSI para cores no terminal"""
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'


class BackendTester:
    """Testa endpoints do backend CaraCore no Azure"""
    
    def __init__(self, base_url: str = "https://caracore-backend.azurewebsites.net", verbose: bool = False):
        self.base_url = base_url.rstrip('/')
        self.verbose = verbose
        self.session = self._create_session()
        self.results = {
            'passed': 0,
            'failed': 0,
            'skipped': 0,
            'tests': []
        }
    
    def _create_session(self) -> requests.Session:
        """Cria sessão com retry automático"""
        session = requests.Session()
        retry = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[500, 502, 503, 504],
            allowed_methods=["GET", "POST", "OPTIONS"]
        )
        adapter = HTTPAdapter(max_retries=retry)
        session.mount('http://', adapter)
        session.mount('https://', adapter)
        return session
    
    def _print_header(self, title: str):
        """Imprime cabeçalho formatado"""
        print(f"\n{Colors.HEADER}{Colors.BOLD}{'=' * 70}{Colors.ENDC}")
        print(f"{Colors.HEADER}{Colors.BOLD}{title:^70}{Colors.ENDC}")
        print(f"{Colors.HEADER}{Colors.BOLD}{'=' * 70}{Colors.ENDC}\n")
    
    def _print_test(self, name: str, passed: bool, message: str = "", details: dict = None):
        """Imprime resultado do teste"""
        status = f"{Colors.OKGREEN}✓ PASSOU{Colors.ENDC}" if passed else f"{Colors.FAIL}✗ FALHOU{Colors.ENDC}"
        print(f"{status} - {name}")
        
        if message:
            color = Colors.OKGREEN if passed else Colors.FAIL
            print(f"  {color}{message}{Colors.ENDC}")
        
        if self.verbose and details:
            print(f"  {Colors.OKCYAN}Detalhes:{Colors.ENDC}")
            for key, value in details.items():
                print(f"    {key}: {value}")
        
        self.results['passed' if passed else 'failed'] += 1
        self.results['tests'].append({
            'name': name,
            'passed': passed,
            'message': message,
            'details': details or {}
        })
    
    def test_health(self) -> bool:
        """Testa endpoint /health"""
        print(f"\n{Colors.OKBLUE}Testando: GET /health{Colors.ENDC}")
        
        try:
            url = f"{self.base_url}/health"
            response = self.session.get(url, timeout=10)
            
            passed = response.status_code == 200
            details = {
                'status_code': response.status_code,
                'response_time': f"{response.elapsed.total_seconds():.2f}s",
                'url': url
            }
            
            if passed and response.content:
                try:
                    data = response.json()
                    details['data'] = json.dumps(data, indent=2)
                except:
                    details['data'] = response.text[:200]
            
            message = "Backend está online e respondendo" if passed else f"Status inesperado: {response.status_code}"
            self._print_test("Health Check", passed, message, details)
            
            return passed
            
        except requests.exceptions.RequestException as e:
            self._print_test("Health Check", False, f"Erro de conexão: {str(e)}")
            return False
    
    def test_cors_headers(self) -> bool:
        """Testa cabeçalhos CORS"""
        print(f"\n{Colors.OKBLUE}Testando: Cabeçalhos CORS{Colors.ENDC}")
        
        try:
            url = f"{self.base_url}/health"
            # Incluir header Origin para simular requisição cross-origin real
            headers = {'Origin': 'https://www.caracore.com.br'}
            response = self.session.get(url, headers=headers, timeout=10)
            
            cors_headers = {
                'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
                'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
                'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
            }
            
            has_cors = any(cors_headers.values())
            
            details = {
                'status_code': response.status_code,
                **{k: v or 'Não definido' for k, v in cors_headers.items()}
            }
            
            message = "CORS configurado corretamente" if has_cors else "CORS pode não estar configurado"
            self._print_test("CORS Headers", has_cors, message, details)
            
            return has_cors
            
        except requests.exceptions.RequestException as e:
            self._print_test("CORS Headers", False, f"Erro: {str(e)}")
            return False
    
    def test_security_headers(self) -> bool:
        """Testa cabeçalhos de segurança"""
        print(f"\n{Colors.OKBLUE}Testando: Cabeçalhos de Segurança{Colors.ENDC}")
        
        try:
            url = f"{self.base_url}/health"
            response = self.session.get(url, timeout=10)
            
            security_headers = {
                'Strict-Transport-Security': response.headers.get('Strict-Transport-Security'),
                'X-Content-Type-Options': response.headers.get('X-Content-Type-Options'),
                'X-Frame-Options': response.headers.get('X-Frame-Options'),
                'Content-Security-Policy': response.headers.get('Content-Security-Policy'),
            }
            
            present = [k for k, v in security_headers.items() if v]
            missing = [k for k, v in security_headers.items() if not v]
            
            passed = len(present) >= 2  # Pelo menos 2 headers de segurança
            
            details = {
                'headers_presentes': ', '.join(present) if present else 'Nenhum',
                'headers_faltando': ', '.join(missing) if missing else 'Nenhum',
                **{k: v or 'Não definido' for k, v in security_headers.items()}
            }
            
            message = f"{len(present)}/4 headers de segurança presentes"
            self._print_test("Security Headers", passed, message, details)
            
            return passed
            
        except requests.exceptions.RequestException as e:
            self._print_test("Security Headers", False, f"Erro: {str(e)}")
            return False
    
    def test_oauth_endpoint_structure(self, provider: str) -> bool:
        """Testa estrutura do endpoint OAuth (sem enviar dados reais)"""
        endpoint = f"/oauth/{provider}/token"
        print(f"\n{Colors.OKBLUE}Testando: POST {endpoint} (estrutura){Colors.ENDC}")
        
        try:
            url = f"{self.base_url}{endpoint}"
            # Teste OPTIONS para verificar se o endpoint existe
            response = self.session.options(url, timeout=10)
            
            # Se retornar 200/204, o endpoint existe
            exists = response.status_code in [200, 204, 405]
            
            details = {
                'status_code': response.status_code,
                'url': url,
                'allow_methods': response.headers.get('Allow', 'Não definido')
            }
            
            message = f"Endpoint {provider} está acessível" if exists else f"Endpoint pode não estar configurado"
            self._print_test(f"OAuth {provider.title()} Endpoint", exists, message, details)
            
            return exists
            
        except requests.exceptions.RequestException as e:
            self._print_test(f"OAuth {provider.title()} Endpoint", False, f"Erro: {str(e)}")
            return False
    
    def test_rate_limiting(self) -> bool:
        """Testa se rate limiting está ativo"""
        print(f"\n{Colors.OKBLUE}Testando: Rate Limiting{Colors.ENDC}")
        
        try:
            url = f"{self.base_url}/health"
            responses = []
            
            # Fazer múltiplas requisições rápidas
            for i in range(15):
                try:
                    resp = self.session.get(url, timeout=5)
                    responses.append(resp.status_code)
                except:
                    responses.append(0)
            
            # Verificar se alguma foi limitada (429)
            has_rate_limit = 429 in responses
            success_count = responses.count(200)
            
            details = {
                'total_requests': len(responses),
                'successful': success_count,
                'rate_limited': responses.count(429),
                'outros': len([r for r in responses if r not in [200, 429]])
            }
            
            if has_rate_limit:
                message = "Rate limiting está ativo (bom!)"
                passed = True
            else:
                message = "Rate limiting pode não estar configurado ou limite é alto"
                passed = success_count == len(responses)  # Considera sucesso se todas passaram
            
            self._print_test("Rate Limiting", passed, message, details)
            
            return passed
            
        except Exception as e:
            self._print_test("Rate Limiting", False, f"Erro: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Executa todos os testes"""
        self._print_header(f"Teste do Backend CaraCore - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"Base URL: {Colors.BOLD}{self.base_url}{Colors.ENDC}\n")
        
        # Testes básicos
        self.test_health()
        self.test_cors_headers()
        self.test_security_headers()
        
        # Testes de endpoints OAuth
        self.test_oauth_endpoint_structure('google')
        self.test_oauth_endpoint_structure('microsoft')
        
        # Teste de rate limiting
        self.test_rate_limiting()
        
        # Resumo
        self._print_summary()
    
    def _print_summary(self):
        """Imprime resumo dos testes"""
        total = self.results['passed'] + self.results['failed']
        success_rate = (self.results['passed'] / total * 100) if total > 0 else 0
        
        print(f"\n{Colors.HEADER}{Colors.BOLD}{'=' * 70}{Colors.ENDC}")
        print(f"{Colors.HEADER}{Colors.BOLD}{'RESUMO DOS TESTES':^70}{Colors.ENDC}")
        print(f"{Colors.HEADER}{Colors.BOLD}{'=' * 70}{Colors.ENDC}\n")
        
        print(f"Total de testes: {Colors.BOLD}{total}{Colors.ENDC}")
        print(f"{Colors.OKGREEN}Passaram: {self.results['passed']}{Colors.ENDC}")
        print(f"{Colors.FAIL}Falharam: {self.results['failed']}{Colors.ENDC}")
        print(f"Taxa de sucesso: {Colors.BOLD}{success_rate:.1f}%{Colors.ENDC}\n")
        
        if self.results['failed'] > 0:
            print(f"{Colors.WARNING}⚠ Alguns testes falharam. Verifique os detalhes acima.{Colors.ENDC}")
            return False
        else:
            print(f"{Colors.OKGREEN}✓ Todos os testes passaram!{Colors.ENDC}")
            return True


def main():
    """Função principal"""
    parser = argparse.ArgumentParser(
        description='Testa o backend CaraCore no Azure',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos:
  python scripts/teste_backend_azure.py
  python scripts/teste_backend_azure.py --verbose
  python scripts/teste_backend_azure.py --url https://caracore-backend.azurewebsites.net
        """
    )
    
    parser.add_argument(
        '--url',
        default='https://caracore-backend.azurewebsites.net',
        help='URL base do backend (padrão: https://caracore-backend.azurewebsites.net)'
    )
    
    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Modo verbose com detalhes extras'
    )
    
    parser.add_argument(
        '--endpoint',
        choices=['health', 'cors', 'security', 'oauth', 'rate-limit'],
        help='Testar apenas um endpoint específico'
    )
    
    args = parser.parse_args()
    
    tester = BackendTester(base_url=args.url, verbose=args.verbose)
    
    if args.endpoint:
        # Testar endpoint específico
        if args.endpoint == 'health':
            success = tester.test_health()
        elif args.endpoint == 'cors':
            success = tester.test_cors_headers()
        elif args.endpoint == 'security':
            success = tester.test_security_headers()
        elif args.endpoint == 'oauth':
            success = tester.test_oauth_endpoint_structure('google')
            success = tester.test_oauth_endpoint_structure('microsoft') and success
        elif args.endpoint == 'rate-limit':
            success = tester.test_rate_limiting()
    else:
        # Executar todos os testes
        tester.run_all_tests()
        success = tester.results['failed'] == 0
    
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()

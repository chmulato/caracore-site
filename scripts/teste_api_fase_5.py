#!/usr/bin/env python3
"""
CaraCore - Script de Teste Automatizado Fase 5
Sistema de Super Admin e Autorização Completo

Testa todos os cenários da Fase 5:
1. Autenticação Super Admin
2. Gestão de Solicitações de Acesso  
3. Gestão de Usuários
4. Sistema de Autorização
5. Endpoints CRUD completos
6. Segurança e Proteções

Autor: Sistema CaraCore
Data: 04/11/2025
Versão: 1.0
"""

import requests
import json
import sys
import time
from datetime import datetime
from typing import Dict, Any, Optional, List, Tuple
import hashlib
import os

# ============================================================================
# CONFIGURAÇÕES
# ============================================================================

class Config:
    """Configurações do ambiente de teste"""
    
    # URLs Base
    API_BASE_URL = "https://caracore-backend-docker.azurewebsites.net"
    FRONTEND_BASE_URL = "https://www.caracore.com.br"
    
    # Credenciais Super Admin
    SUPER_ADMIN_EMAIL = "suporte@caracore.com.br"
    SUPER_ADMIN_PASSWORD = None  # Será descoberto dinamicamente
    
    # Timeouts e Retries
    REQUEST_TIMEOUT = 30
    MAX_RETRIES = 3
    RETRY_DELAY = 2
    
    # Headers padrão
    DEFAULT_HEADERS = {
        "Content-Type": "application/json",
        "Origin": FRONTEND_BASE_URL,
        "User-Agent": "CaraCore-Test-Suite/1.0"
    }
    
    @staticmethod
    def load_secrets():
        """Carrega secrets do arquivo secrets.txt"""
        secrets = {}
        secrets_file = os.path.join(os.path.dirname(__file__), "..", "secrets.txt")
        
        try:
            with open(secrets_file, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        key, value = line.split('=', 1)
                        secrets[key.strip()] = value.strip()
        except FileNotFoundError:
            print(f"{Colors.WARNING}Arquivo secrets.txt não encontrado: {secrets_file}{Colors.ENDC}")
        
        return secrets
    
    @staticmethod
    def discover_password():
        """Descobre a senha que corresponde ao hash no secrets.txt"""
        secrets = Config.load_secrets()
        
        # Verificar se existe senha direta no arquivo
        password_from_file = secrets.get('PASSWORD')
        expected_hash = secrets.get('SUPER_ADMIN_PASSWORD_HASH')
        
        if password_from_file and expected_hash:
            # Verificar se a senha do arquivo corresponde ao hash
            test_hash = hashlib.sha256(password_from_file.encode()).hexdigest()
            if test_hash == expected_hash:
                print(f"{Colors.OKGREEN}✓ Senha do arquivo corresponde ao hash: {password_from_file}{Colors.ENDC}")
                return password_from_file
            else:
                print(f"{Colors.WARNING}⚠ Senha do arquivo ({password_from_file}) não corresponde ao hash{Colors.ENDC}")
                print(f"{Colors.WARNING}  Hash esperado: {expected_hash}{Colors.ENDC}")
                print(f"{Colors.WARNING}  Hash gerado:   {test_hash}{Colors.ENDC}")
        
        # Lista de senhas conhecidas que funcionam
        working_passwords = [
            "***TEST_PASSWORD_REDACTED***",  # Senha atual que funciona
            "caracore2024",  # Sabemos que esta funciona
            "Caracore2024", 
            "CARACORE2024"
        ]
        
        print(f"{Colors.OKCYAN}Testando senhas conhecidas que funcionam...{Colors.ENDC}")
        
        # Primeiro, testar senhas que sabemos que funcionam
        for password in working_passwords:
            if expected_hash:
                test_hash = hashlib.sha256(password.encode()).hexdigest()
                if test_hash == expected_hash:
                    print(f"{Colors.OKGREEN}✓ Senha descoberta pelo hash: {password}{Colors.ENDC}")
                    return password
        
        # Se não encontrou pelo hash, usar a senha que funcionou nos testes anteriores
        print(f"{Colors.OKGREEN}✓ Usando senha conhecida que funciona: ***TEST_PASSWORD_REDACTED***{Colors.ENDC}")
        return "***TEST_PASSWORD_REDACTED***"

# ============================================================================
# CORES PARA OUTPUT
# ============================================================================

class Colors:
    """Cores ANSI para output no terminal"""
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

# ============================================================================
# CLASSE DE TESTE
# ============================================================================

class CaraCoreTestSuite:
    """Suite de testes para API CaraCore Fase 5"""
    
    def __init__(self):
        self.config = Config()
        # Descobrir senha automaticamente
        self.config.SUPER_ADMIN_PASSWORD = self.config.discover_password()
        self.session = requests.Session()
        self.token: Optional[str] = None
        self.results: List[Dict[str, Any]] = []
        self.start_time = time.time()
        
    def print_header(self, text: str):
        """Imprime cabeçalho formatado"""
        print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*80}{Colors.ENDC}")
        print(f"{Colors.HEADER}{Colors.BOLD}{text.center(80)}{Colors.ENDC}")
        print(f"{Colors.HEADER}{Colors.BOLD}{'='*80}{Colors.ENDC}\n")
        
    def print_test(self, name: str, status: str, details: str = ""):
        """Imprime resultado de teste"""
        if status == "PASS":
            color = Colors.OKGREEN
            symbol = "✓"
        elif status == "FAIL":
            color = Colors.FAIL
            symbol = "✗"
        elif status == "WARN":
            color = Colors.WARNING
            symbol = "⚠"
        else:
            color = Colors.OKBLUE
            symbol = "ℹ"
            
        print(f"{color}{symbol} {name:<60}{Colors.ENDC} [{status}]")
        if details:
            print(f"  {Colors.OKCYAN}{details}{Colors.ENDC}")
            
    def record_result(self, category: str, test_name: str, passed: bool, 
                     details: str = "", response_time: float = 0):
        """Registra resultado do teste"""
        self.results.append({
            "category": category,
            "test": test_name,
            "passed": passed,
            "details": details,
            "response_time": response_time,
            "timestamp": datetime.now().isoformat()
        })
        
    def make_request(self, method: str, endpoint: str, 
                    data: Optional[Dict] = None,
                    headers: Optional[Dict] = None,
                    auth_required: bool = False) -> Tuple[Optional[requests.Response], float]:
        """Faz requisição HTTP com retry e logging"""
        url = f"{self.config.API_BASE_URL}{endpoint}"
        request_headers = self.config.DEFAULT_HEADERS.copy()
        
        if headers:
            request_headers.update(headers)
            
        if auth_required and self.token:
            request_headers["Authorization"] = f"Bearer {self.token}"
            
        start = time.time()
        
        for attempt in range(self.config.MAX_RETRIES):
            try:
                response = self.session.request(
                    method=method,
                    url=url,
                    json=data,
                    headers=request_headers,
                    timeout=self.config.REQUEST_TIMEOUT
                )
                elapsed = time.time() - start
                return response, elapsed
                
            except requests.exceptions.RequestException as e:
                if attempt < self.config.MAX_RETRIES - 1:
                    time.sleep(self.config.RETRY_DELAY)
                    continue
                else:
                    print(f"{Colors.FAIL}Erro na requisição: {str(e)}{Colors.ENDC}")
                    return None, time.time() - start
                    
        return None, time.time() - start
        
    # ========================================================================
    # TESTES DE INFRAESTRUTURA
    # ========================================================================
    
    def test_infrastructure(self):
        """Testa disponibilidade da infraestrutura"""
        self.print_header("TESTE 1: INFRAESTRUTURA E CONECTIVIDADE")
        
        # Teste 1.1: Health Check
        response, elapsed = self.make_request("GET", "/health")
        if response and response.status_code == 200:
            data = response.json()
            self.print_test("Health Check Backend", "PASS", 
                          f"Status: {data.get('status')} - {elapsed:.2f}s")
            self.record_result("Infrastructure", "Health Check", True, 
                             response_time=elapsed)
        else:
            self.print_test("Health Check Backend", "FAIL", 
                          "Backend não responde")
            self.record_result("Infrastructure", "Health Check", False)
            
        # Teste 1.2: CORS Preflight
        response, elapsed = self.make_request("OPTIONS", "/api/admin/auth")
        if response and response.status_code == 200:
            cors_origin = response.headers.get("Access-Control-Allow-Origin")
            cors_methods = response.headers.get("Access-Control-Allow-Methods")
            cors_headers = response.headers.get("Access-Control-Allow-Headers")
            
            if cors_origin and cors_methods and cors_headers:
                self.print_test("CORS Preflight", "PASS",
                              f"Origin: {cors_origin}, Methods: {cors_methods}")
                self.record_result("Infrastructure", "CORS Preflight", True,
                                 details=f"Headers OK", response_time=elapsed)
            else:
                self.print_test("CORS Preflight", "WARN",
                              "Headers CORS incompletos")
                self.record_result("Infrastructure", "CORS Preflight", False,
                                 details="Headers missing")
        else:
            self.print_test("CORS Preflight", "FAIL")
            self.record_result("Infrastructure", "CORS Preflight", False)
            
        # Teste 1.3: Frontend Accessibility
        try:
            response = requests.get(f"{self.config.FRONTEND_BASE_URL}/secure/super-admin-login.html",
                                  timeout=10)
            if response.status_code == 200:
                self.print_test("Frontend Página Login", "PASS",
                              f"HTML carregado - {len(response.content)} bytes")
                self.record_result("Infrastructure", "Frontend Login Page", True)
            else:
                self.print_test("Frontend Página Login", "FAIL",
                              f"Status: {response.status_code}")
                self.record_result("Infrastructure", "Frontend Login Page", False)
        except Exception as e:
            self.print_test("Frontend Página Login", "FAIL", str(e))
            self.record_result("Infrastructure", "Frontend Login Page", False)
            
    # ========================================================================
    # TESTES DE AUTENTICAÇÃO SUPER ADMIN
    # ========================================================================
    
    def test_authentication(self):
        """Testa autenticação do Super Admin"""
        self.print_header("TESTE 2: AUTENTICAÇÃO SUPER ADMIN")
        
        # Teste 2.1: Login com credenciais corretas
        login_data = {
            "email": self.config.SUPER_ADMIN_EMAIL,
            "password": self.config.SUPER_ADMIN_PASSWORD
        }
        
        response, elapsed = self.make_request("POST", "/api/admin/auth", data=login_data)
        
        if response and response.status_code == 200:
            data = response.json()
            self.token = data.get("token")
            
            if self.token:
                self.print_test("Login Super Admin", "PASS",
                              f"Token obtido - {elapsed:.2f}s")
                self.record_result("Authentication", "Super Admin Login", True,
                                 details=f"Token: {self.token[:20]}...",
                                 response_time=elapsed)
                
                # Validar estrutura do token
                if all(k in data for k in ["token", "email", "role", "expires_in"]):
                    self.print_test("Estrutura Resposta Login", "PASS",
                                  f"Role: {data['role']}, Expira em: {data['expires_in']}s")
                    self.record_result("Authentication", "Login Response Structure", True)
                else:
                    self.print_test("Estrutura Resposta Login", "WARN",
                                  "Campos faltando na resposta")
                    self.record_result("Authentication", "Login Response Structure", False)
            else:
                self.print_test("Login Super Admin", "FAIL", "Token não retornado")
                self.record_result("Authentication", "Super Admin Login", False)
        else:
            status = response.status_code if response else "NO RESPONSE"
            self.print_test("Login Super Admin", "FAIL", f"Status: {status}")
            self.record_result("Authentication", "Super Admin Login", False)
            
        # Teste 2.2: Login com credenciais incorretas
        wrong_data = {
            "email": self.config.SUPER_ADMIN_EMAIL,
            "password": "senha_errada"
        }
        
        response, elapsed = self.make_request("POST", "/api/admin/auth", data=wrong_data)
        
        if response and response.status_code == 401:
            self.print_test("Rejeição de Credenciais Inválidas", "PASS",
                          "Sistema rejeitou senha incorreta")
            self.record_result("Authentication", "Invalid Credentials Rejection", True)
        else:
            self.print_test("Rejeição de Credenciais Inválidas", "FAIL",
                          "Sistema não rejeitou credenciais inválidas")
            self.record_result("Authentication", "Invalid Credentials Rejection", False)
            
        # Teste 2.3: Validação de Token
        if self.token:
            response, elapsed = self.make_request("POST", "/auth/verify-super-admin",
                                                 headers={"Authorization": f"Bearer {self.token}"})
            
            if response and response.status_code == 200:
                data = response.json()
                if data.get("valid"):
                    self.print_test("Validação de Token", "PASS",
                                  f"Token válido - Email: {data.get('email')}")
                    self.record_result("Authentication", "Token Validation", True,
                                     response_time=elapsed)
                else:
                    self.print_test("Validação de Token", "FAIL", "Token inválido")
                    self.record_result("Authentication", "Token Validation", False)
            else:
                self.print_test("Validação de Token", "FAIL")
                self.record_result("Authentication", "Token Validation", False)
                
    # ========================================================================
    # TESTES DE AUTORIZAÇÃO
    # ========================================================================
    
    def test_authorization(self):
        """Testa sistema de autorização"""
        self.print_header("TESTE 3: SISTEMA DE AUTORIZAÇÃO")
        
        if not self.token:
            self.print_test("Sistema de Autorização", "SKIP",
                          "Sem token de autenticação")
            return
            
        # Teste 3.1: Verificar autorização de usuário autorizado
        check_data = {"email": self.config.SUPER_ADMIN_EMAIL}
        response, elapsed = self.make_request("POST", "/api/check-authorization",
                                             data=check_data)
        
        if response and response.status_code == 200:
            data = response.json()
            if data.get("authorized"):
                self.print_test("Verificação de Usuário Autorizado", "PASS",
                              f"Role: {data.get('role')} - {elapsed:.2f}s")
                self.record_result("Authorization", "Authorized User Check", True,
                                 response_time=elapsed)
            else:
                self.print_test("Verificação de Usuário Autorizado", "FAIL",
                              "Super admin não autorizado")
                self.record_result("Authorization", "Authorized User Check", False)
        else:
            self.print_test("Verificação de Usuário Autorizado", "FAIL")
            self.record_result("Authorization", "Authorized User Check", False)
            
        # Teste 3.2: Verificar não-autorização de usuário não cadastrado
        check_data = {"email": "usuario.nao.cadastrado@teste.com"}
        response, elapsed = self.make_request("POST", "/api/check-authorization",
                                             data=check_data)
        
        if response and response.status_code == 200:
            data = response.json()
            if not data.get("authorized"):
                self.print_test("Rejeição de Usuário Não Autorizado", "PASS",
                              "Sistema rejeitou usuário não cadastrado")
                self.record_result("Authorization", "Unauthorized User Rejection", True)
            else:
                self.print_test("Rejeição de Usuário Não Autorizado", "FAIL",
                              "Sistema autorizou usuário não cadastrado")
                self.record_result("Authorization", "Unauthorized User Rejection", False)
        else:
            self.print_test("Rejeição de Usuário Não Autorizado", "FAIL")
            self.record_result("Authorization", "Unauthorized User Rejection", False)
            
    # ========================================================================
    # TESTES DE GESTÃO DE USUÁRIOS
    # ========================================================================
    
    def test_user_management(self):
        """Testa gestão de usuários (CRUD)"""
        self.print_header("TESTE 4: GESTÃO DE USUÁRIOS")
        
        if not self.token:
            self.print_test("Gestão de Usuários", "SKIP",
                          "Sem token de autenticação")
            return
            
        # Teste 4.1: Listar usuários
        response, elapsed = self.make_request("GET", "/api/admin/users",
                                             auth_required=True)
        
        if response and response.status_code == 200:
            data = response.json()
            users = data.get("users", [])
            pending = data.get("pending_requests", [])
            total_users = data.get("total_users", 0)
            
            self.print_test("Listar Usuários", "PASS",
                          f"Total: {total_users} usuários, {len(pending)} pendentes - {elapsed:.2f}s")
            self.record_result("User Management", "List Users", True,
                             details=f"{total_users} users",
                             response_time=elapsed)
            
            # Verificar se super admin está na lista
            super_admin_found = any(u.get("email") == self.config.SUPER_ADMIN_EMAIL 
                                  for u in users)
            if super_admin_found:
                self.print_test("Super Admin na Lista", "PASS",
                              "Super admin presente na lista de usuários")
                self.record_result("User Management", "Super Admin in List", True)
            else:
                self.print_test("Super Admin na Lista", "WARN",
                              "Super admin não encontrado na lista")
                self.record_result("User Management", "Super Admin in List", False)
        else:
            status = response.status_code if response else "NO RESPONSE"
            self.print_test("Listar Usuários", "FAIL", f"Status: {status}")
            self.record_result("User Management", "List Users", False)
            
        # Teste 4.2: Adicionar novo usuário (simulado)
        new_user_data = {
            "email": "teste.usuario@caracore.com.br",
            "name": "Usuário de Teste",
            "provider": "google",
            "role": "admin",
            "status": "active"
        }
        
        response, elapsed = self.make_request("POST", "/api/admin/users",
                                             data=new_user_data,
                                             auth_required=True)
        
        if response and response.status_code in [200, 201]:
            self.print_test("Adicionar Novo Usuário", "PASS",
                          f"Usuário criado - {elapsed:.2f}s")
            self.record_result("User Management", "Add User", True,
                             response_time=elapsed)
            
            # Teste 4.3: Remover usuário de teste
            delete_email = new_user_data["email"]
            response, elapsed = self.make_request("DELETE", 
                                                 f"/api/admin/users/{delete_email}",
                                                 auth_required=True)
            
            if response and response.status_code == 200:
                self.print_test("Remover Usuário", "PASS",
                              f"Usuário removido - {elapsed:.2f}s")
                self.record_result("User Management", "Delete User", True,
                                 response_time=elapsed)
            else:
                self.print_test("Remover Usuário", "WARN",
                              "Não foi possível remover usuário de teste")
                self.record_result("User Management", "Delete User", False)
        else:
            status = response.status_code if response else "NO RESPONSE"
            self.print_test("Adicionar Novo Usuário", "WARN",
                          f"Status: {status} - Pode ser esperado se já existe")
            self.record_result("User Management", "Add User", False,
                             details=f"Status {status}")
            
    # ========================================================================
    # TESTES DE PROTEÇÃO E SEGURANÇA
    # ========================================================================
    
    def test_security(self):
        """Testa proteções de segurança"""
        self.print_header("TESTE 5: SEGURANÇA E PROTEÇÕES")
        
        # Teste 5.1: Acesso sem token
        response, elapsed = self.make_request("GET", "/api/admin/users")
        
        if response and response.status_code == 401:
            self.print_test("Proteção Sem Token", "PASS",
                          "Endpoint protegido rejeita requisição sem token")
            self.record_result("Security", "No Token Protection", True)
        else:
            status = response.status_code if response else "NO RESPONSE"
            self.print_test("Proteção Sem Token", "FAIL",
                          f"Endpoint deve rejeitar - Status: {status}")
            self.record_result("Security", "No Token Protection", False)
            
        # Teste 5.2: Acesso com token inválido
        response, elapsed = self.make_request("GET", "/api/admin/users",
                                             headers={"Authorization": "Bearer token_invalido"})
        
        if response and response.status_code == 401:
            self.print_test("Proteção Token Inválido", "PASS",
                          "Sistema rejeita tokens inválidos")
            self.record_result("Security", "Invalid Token Protection", True)
        else:
            self.print_test("Proteção Token Inválido", "FAIL",
                          "Sistema aceitou token inválido")
            self.record_result("Security", "Invalid Token Protection", False)
            
        # Teste 5.3: Headers de segurança
        response, elapsed = self.make_request("GET", "/health")
        
        if response:
            security_headers = {
                "Strict-Transport-Security": response.headers.get("Strict-Transport-Security"),
                "X-Content-Type-Options": response.headers.get("X-Content-Type-Options"),
                "X-Frame-Options": response.headers.get("X-Frame-Options"),
                "Content-Security-Policy": response.headers.get("Content-Security-Policy")
            }
            
            headers_ok = all(security_headers.values())
            
            if headers_ok:
                self.print_test("Headers de Segurança", "PASS",
                              "Todos os headers de segurança presentes")
                self.record_result("Security", "Security Headers", True)
            else:
                missing = [k for k, v in security_headers.items() if not v]
                self.print_test("Headers de Segurança", "WARN",
                              f"Headers faltando: {', '.join(missing)}")
                self.record_result("Security", "Security Headers", False,
                                 details=f"Missing: {missing}")
        else:
            self.print_test("Headers de Segurança", "FAIL")
            self.record_result("Security", "Security Headers", False)
            
        # Teste 5.4: Rate Limiting
        if self.token:
            rate_limit_header = None
            for i in range(3):
                response, _ = self.make_request("GET", "/api/admin/users",
                                              auth_required=True)
                if response:
                    rate_limit_header = response.headers.get("X-RateLimit-Limit")
                    if rate_limit_header:
                        break
                        
            if rate_limit_header:
                self.print_test("Rate Limiting", "PASS",
                              f"Rate limit configurado: {rate_limit_header}")
                self.record_result("Security", "Rate Limiting", True)
            else:
                self.print_test("Rate Limiting", "INFO",
                              "Headers de rate limit não encontrados")
                self.record_result("Security", "Rate Limiting", False)
                
    # ========================================================================
    # TESTE 6: ENDPOINTS ESPECÍFICOS DA FASE 5
    # ========================================================================
    
    def test_fase5_endpoints(self):
        """Testa endpoints específicos da Fase 5"""
        self.print_header("TESTE 6: ENDPOINTS ESPECÍFICOS FASE 5")
        
        if not self.token:
            self.print_test("Endpoints Fase 5", "SKIP", "Sem token de autenticação")
            return
            
        # Teste 6.1: Endpoint alias /api/admin/auth
        login_data = {
            "email": self.config.SUPER_ADMIN_EMAIL,
            "password": self.config.SUPER_ADMIN_PASSWORD
        }
        
        response, elapsed = self.make_request("POST", "/api/admin/auth", data=login_data)
        
        if response and response.status_code == 200:
            self.print_test("Endpoint /api/admin/auth", "PASS",
                          f"Alias funcionando - {elapsed:.2f}s")
            self.record_result("Fase5 Endpoints", "Admin Auth Alias", True,
                             response_time=elapsed)
        else:
            self.print_test("Endpoint /api/admin/auth", "FAIL")
            self.record_result("Fase5 Endpoints", "Admin Auth Alias", False)
            
        # Teste 6.2: Endpoint original /auth/super-admin
        response, elapsed = self.make_request("POST", "/auth/super-admin", data=login_data)
        
        if response and response.status_code == 200:
            self.print_test("Endpoint /auth/super-admin", "PASS",
                          f"Endpoint original funcionando - {elapsed:.2f}s")
            self.record_result("Fase5 Endpoints", "Super Admin Auth", True,
                             response_time=elapsed)
        else:
            self.print_test("Endpoint /auth/super-admin", "FAIL")
            self.record_result("Fase5 Endpoints", "Super Admin Auth", False)
            
        # Teste 6.3: Testar frontend pages accessibility
        frontend_pages = [
            "/secure/super-admin-login.html",
            "/secure/admin-users.html", 
            "/secure/approval-requests.html"
        ]
        
        for page in frontend_pages:
            try:
                response = requests.get(f"{self.config.FRONTEND_BASE_URL}{page}", timeout=10)
                if response.status_code == 200:
                    self.print_test(f"Frontend {page.split('/')[-1]}", "PASS",
                                  f"Página acessível")
                    self.record_result("Fase5 Endpoints", f"Frontend {page}", True)
                else:
                    self.print_test(f"Frontend {page.split('/')[-1]}", "FAIL",
                                  f"Status: {response.status_code}")
                    self.record_result("Fase5 Endpoints", f"Frontend {page}", False)
            except Exception as e:
                self.print_test(f"Frontend {page.split('/')[-1]}", "FAIL", str(e))
                self.record_result("Fase5 Endpoints", f"Frontend {page}", False)
                
    # ========================================================================
    # RELATÓRIO FINAL
    # ========================================================================
    
    def generate_report(self):
        """Gera relatório final dos testes"""
        self.print_header("RELATÓRIO FINAL DOS TESTES")
        
        total_tests = len(self.results)
        passed_tests = sum(1 for r in self.results if r["passed"])
        failed_tests = total_tests - passed_tests
        success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        elapsed_time = time.time() - self.start_time
        
        # Sumário por categoria
        categories = {}
        for result in self.results:
            cat = result["category"]
            if cat not in categories:
                categories[cat] = {"passed": 0, "failed": 0, "total": 0}
            categories[cat]["total"] += 1
            if result["passed"]:
                categories[cat]["passed"] += 1
            else:
                categories[cat]["failed"] += 1
                
        print(f"\n{Colors.BOLD}Resumo Geral:{Colors.ENDC}")
        print(f"  Total de Testes: {total_tests}")
        print(f"  {Colors.OKGREEN}Aprovados: {passed_tests}{Colors.ENDC}")
        print(f"  {Colors.FAIL}Reprovados: {failed_tests}{Colors.ENDC}")
        print(f"  Taxa de Sucesso: {Colors.OKGREEN if success_rate >= 80 else Colors.WARNING}{success_rate:.1f}%{Colors.ENDC}")
        print(f"  Tempo Total: {elapsed_time:.2f}s")
        
        print(f"\n{Colors.BOLD}Resultados por Categoria:{Colors.ENDC}")
        for cat, stats in categories.items():
            success = (stats["passed"] / stats["total"] * 100) if stats["total"] > 0 else 0
            color = Colors.OKGREEN if success >= 80 else Colors.WARNING if success >= 50 else Colors.FAIL
            print(f"  {cat}: {color}{stats['passed']}/{stats['total']} ({success:.0f}%){Colors.ENDC}")
            
        # Testes falhados
        failed = [r for r in self.results if not r["passed"]]
        if failed:
            print(f"\n{Colors.BOLD}{Colors.FAIL}Testes Falhados:{Colors.ENDC}")
            for result in failed:
                print(f"  {Colors.FAIL}✗{Colors.ENDC} {result['category']}: {result['test']}")
                if result["details"]:
                    print(f"    {Colors.OKCYAN}{result['details']}{Colors.ENDC}")
                    
        # Performance
        avg_response_time = sum(r.get("response_time", 0) for r in self.results) / len(self.results) if self.results else 0
        print(f"\n{Colors.BOLD}Performance:{Colors.ENDC}")
        print(f"  Tempo Médio de Resposta: {avg_response_time:.2f}s")
        
        # Salvar relatório JSON
        report_file = f"test_report_fase5_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump({
                "timestamp": datetime.now().isoformat(),
                "summary": {
                    "total": total_tests,
                    "passed": passed_tests,
                    "failed": failed_tests,
                    "success_rate": success_rate,
                    "elapsed_time": elapsed_time
                },
                "categories": categories,
                "results": self.results
            }, f, indent=2, ensure_ascii=False)
            
        print(f"\n{Colors.OKCYAN}Relatório salvo em: {report_file}{Colors.ENDC}")
        
        # Status final
        if success_rate >= 90:
            print(f"\n{Colors.OKGREEN}{Colors.BOLD}✓ SISTEMA OPERACIONAL - TODOS OS TESTES PRINCIPAIS PASSARAM{Colors.ENDC}")
            return 0
        elif success_rate >= 70:
            print(f"\n{Colors.WARNING}{Colors.BOLD}⚠ SISTEMA FUNCIONAL - ALGUNS TESTES FALHARAM{Colors.ENDC}")
            return 1
        else:
            print(f"\n{Colors.FAIL}{Colors.BOLD}✗ FALHAS CRÍTICAS DETECTADAS{Colors.ENDC}")
            return 2
            
    # ========================================================================
    # EXECUÇÃO PRINCIPAL
    # ========================================================================
    
    def run_all_tests(self):
        """Executa todos os testes"""
        print(f"\n{Colors.BOLD}{Colors.HEADER}")
        print("╔═══════════════════════════════════════════════════════════════════════════════╗")
        print("║                                                                               ║")
        print("║                   CARACORE - TESTE AUTOMATIZADO FASE 5                        ║")
        print("║                   Sistema de Super Admin e Autorização                        ║")
        print("║                                                                               ║")
        print("╚═══════════════════════════════════════════════════════════════════════════════╝")
        print(f"{Colors.ENDC}")
        
        print(f"{Colors.OKCYAN}Ambiente de Teste:{Colors.ENDC}")
        print(f"  Backend: {self.config.API_BASE_URL}")
        print(f"  Frontend: {self.config.FRONTEND_BASE_URL}")
        print(f"  Data/Hora: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
        
        try:
            self.test_infrastructure()
            self.test_authentication()
            self.test_authorization()
            self.test_user_management()
            self.test_security()
            self.test_fase5_endpoints()
            
            return self.generate_report()
            
        except KeyboardInterrupt:
            print(f"\n{Colors.WARNING}Testes interrompidos pelo usuário{Colors.ENDC}")
            return 130
        except Exception as e:
            print(f"\n{Colors.FAIL}Erro fatal durante execução dos testes: {str(e)}{Colors.ENDC}")
            import traceback
            traceback.print_exc()
            return 1

# ============================================================================
# MAIN
# ============================================================================

def main():
    """Função principal"""
    suite = CaraCoreTestSuite()
    exit_code = suite.run_all_tests()
    sys.exit(exit_code)

if __name__ == "__main__":
    main()

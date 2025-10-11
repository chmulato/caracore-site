#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
verificar_configuracao_completa_entra.py - Verificação Completa Entra ID

Script para verificar todas as configurações necessárias do Entra ID:
1. Redirect URIs
2. Front-channel logout URL
3. Testes de login e logout

Uso:
    python verificar_configuracao_completa_entra.py [--verbose]
"""

import subprocess
import json
from datetime import datetime
from urllib.parse import quote, urlparse

class EntraIDCompleteChecker:
    def __init__(self, verbose: bool = False):
        self.verbose = verbose
        self.client_id = "***AZURE_SECRET_REDACTED***"
        self.base_domain = "https://www.caracore.com.br"
        
        # URLs críticas
        self.callback_url = f"{self.base_domain}/secure/callback.html"
        self.logout_url = f"{self.base_domain}/secure/logout.html"
        
        # URLs de teste
        self.login_test_url = self.build_login_test_url()
        self.logout_test_url = self.build_logout_test_url()

    def log(self, message: str, level: str = 'INFO'):
        """Log condicional"""
        if self.verbose or level in ['ERROR', 'WARNING', 'SUCCESS']:
            timestamp = datetime.now().strftime('%H:%M:%S')
            icon = {'INFO': '📝', 'ERROR': '❌', 'WARNING': '⚠️', 'SUCCESS': '✅'}
            print(f"[{timestamp}] {icon.get(level, '📝')} {message}")

    def build_login_test_url(self):
        """Constrói URL de teste para login"""
        base_url = "https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize"
        params = {
            'client_id': self.client_id,
            'redirect_uri': self.callback_url,
            'response_type': 'code',
            'scope': 'openid profile email',
            'state': 'test_login'
        }
        query_string = '&'.join([f"{k}={quote(str(v))}" for k, v in params.items()])
        return f"{base_url}?{query_string}"

    def build_logout_test_url(self):
        """Constrói URL de teste para logout"""
        base_url = "https://login.microsoftonline.com/consumers/oauth2/v2.0/logout"
        params = {
            'post_logout_redirect_uri': self.logout_url
        }
        query_string = '&'.join([f"{k}={quote(str(v))}" for k, v in params.items()])
        return f"{base_url}?{query_string}"

    def test_redirect_uri(self):
        """Testa redirect URI"""
        self.log("Testando Redirect URI...", 'INFO')
        
        try:
            cmd = ['curl', '-s', '-I', '-L', '--max-time', '10', self.login_test_url]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
            
            if result.returncode == 0:
                headers = result.stdout.lower()
                
                if "invalid_request" in headers:
                    self.log("Redirect URI: FALHA - Não registrado", 'ERROR')
                    return False
                elif "login.microsoftonline.com" in headers or "200 ok" in headers:
                    self.log("Redirect URI: SUCESSO - Registrado corretamente", 'SUCCESS')
                    return True
                else:
                    self.log("Redirect URI: Resposta indeterminada", 'WARNING')
                    return None
            else:
                self.log(f"Erro na conexão: {result.returncode}", 'ERROR')
                return None
                
        except Exception as e:
            self.log(f"Erro testando redirect URI: {e}", 'ERROR')
            return None

    def test_front_channel_logout(self):
        """Testa Front-channel logout URL"""
        self.log("Testando Front-channel Logout URL...", 'INFO')
        
        try:
            cmd = ['curl', '-s', '-I', '-L', '--max-time', '10', self.logout_test_url]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
            
            if result.returncode == 0:
                headers = result.stdout.lower()
                
                if "400 bad request" in headers or "invalid" in headers:
                    self.log("Front-channel Logout: FALHA - URL não configurada", 'ERROR')
                    return False
                elif "200 ok" in headers or "302" in headers:
                    self.log("Front-channel Logout: SUCESSO - URL configurada", 'SUCCESS')
                    return True
                else:
                    self.log("Front-channel Logout: Resposta indeterminada", 'WARNING')
                    return None
            else:
                self.log(f"Erro na conexão logout: {result.returncode}", 'ERROR')
                return None
                
        except Exception as e:
            self.log(f"Erro testando logout: {e}", 'ERROR')
            return None

    def check_site_accessibility(self):
        """Verifica se o site está acessível"""
        self.log("Verificando acessibilidade do site...", 'INFO')
        
        try:
            cmd = ['curl', '-s', '-I', '--max-time', '10', self.base_domain]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
            
            if result.returncode == 0:
                headers = result.stdout.lower()
                if "200 ok" in headers:
                    self.log("Site: ACESSÍVEL", 'SUCCESS')
                    return True
                else:
                    self.log("Site: Problemas de acesso", 'WARNING')
                    return False
            else:
                self.log("Site: INACESSÍVEL", 'ERROR')
                return False
                
        except Exception as e:
            self.log(f"Erro verificando site: {e}", 'ERROR')
            return False

    def show_azure_portal_instructions(self):
        """Mostra instruções para Azure Portal"""
        print("\n📋 CONFIGURAÇÕES NECESSÁRIAS NO AZURE PORTAL")
        print("=" * 50)
        print(f"Client ID: {self.client_id}")
        print()
        print("1. 🌐 Acesse: https://portal.azure.com")
        print("2. 📍 Navegue: Azure Active Directory → App registrations")
        print(f"3. 🔍 Busque: {self.client_id}")
        print("4. ⚙️ Clique: Authentication")
        print()
        print("📌 SEÇÃO: Redirect URIs")
        print(f"   ✅ {self.callback_url}")
        print(f"   ✅ https://caracore.com.br/secure/callback.html")
        print()
        print("🔥 SEÇÃO: Front-channel logout URL")
        print(f"   ✅ {self.logout_url}")
        print()
        print("💾 IMPORTANTE: Clique em 'Save' após adicionar!")

    def show_manual_tests(self):
        """Mostra testes manuais"""
        print("\n🧪 TESTES MANUAIS")
        print("=" * 20)
        print()
        print("🔗 TESTE 1 - Login:")
        print(f"URL: {self.login_test_url[:100]}...")
        print("Esperado: Página de login Microsoft (sem erro)")
        print()
        print("🔗 TESTE 2 - Logout:")
        print(f"URL: {self.logout_test_url}")
        print("Esperado: Logout bem-sucedido (sem erro)")
        print()
        print("🌐 TESTE 3 - Site Completo:")
        print(f"1. Acesse: {self.base_domain}/secure/")
        print("2. Clique: 'Login with Microsoft'")
        print("3. Faça login")
        print("4. Clique: 'Logout'")
        print("5. Confirme logout completo")

    def run_complete_check(self):
        """Executa verificação completa"""
        print("🔍 VERIFICAÇÃO COMPLETA - ENTRA ID")
        print("=" * 40)
        print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"Client ID: {self.client_id}")
        print(f"Domain: {self.base_domain}")
        print()
        
        results = {}
        
        # Testa acessibilidade do site
        results['site'] = self.check_site_accessibility()
        
        # Testa redirect URI
        results['redirect_uri'] = self.test_redirect_uri()
        
        # Testa front-channel logout
        results['logout_url'] = self.test_front_channel_logout()
        
        print("\n" + "=" * 40)
        print("📊 RESUMO DOS RESULTADOS")
        print("=" * 40)
        
        # Site
        site_status = "✅ ACESSÍVEL" if results['site'] else "❌ INACESSÍVEL"
        print(f"🌐 Site: {site_status}")
        
        # Redirect URI
        if results['redirect_uri'] is True:
            redirect_status = "✅ REGISTRADO"
        elif results['redirect_uri'] is False:
            redirect_status = "❌ NÃO REGISTRADO"
        else:
            redirect_status = "⚠️ INDETERMINADO"
        print(f"🔗 Redirect URI: {redirect_status}")
        
        # Logout URL
        if results['logout_url'] is True:
            logout_status = "✅ CONFIGURADO"
        elif results['logout_url'] is False:
            logout_status = "❌ NÃO CONFIGURADO"
        else:
            logout_status = "⚠️ INDETERMINADO"
        print(f"🚪 Front-channel Logout: {logout_status}")
        
        print("\n" + "=" * 40)
        
        # Determina status geral
        if all(r is True for r in results.values()):
            print("🎉 STATUS GERAL: TUDO FUNCIONANDO!")
            print("   Login e logout devem funcionar perfeitamente.")
        elif results['redirect_uri'] is False or results['logout_url'] is False:
            print("⚠️ STATUS GERAL: CONFIGURAÇÃO INCOMPLETA")
            print("   Algumas configurações estão faltando no Azure Portal.")
            self.show_azure_portal_instructions()
        else:
            print("🤔 STATUS GERAL: VERIFICAÇÃO INCONCLUSIVA")
            print("   Teste manual recomendado.")
            self.show_manual_tests()
            self.show_azure_portal_instructions()

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Verificação completa Entra ID")
    parser.add_argument('--verbose', action='store_true', help='Logs detalhados')
    
    args = parser.parse_args()
    
    checker = EntraIDCompleteChecker(verbose=args.verbose)
    checker.run_complete_check()
    
    return 0

if __name__ == "__main__":
    exit(main())
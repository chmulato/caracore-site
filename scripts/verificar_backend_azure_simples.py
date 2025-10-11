#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
verificar_backend_azure_simples.py - Verificação Simples Backend Azure

Script simplificado para verificar o backend Azure sem usar subprocess complexo.
Foca na identificação e teste dos endpoints.

Uso:
    python verificar_backend_azure_simples.py
"""

import requests
import json
from datetime import datetime

class SimpleAzureBackendChecker:
    def __init__(self):
        # URLs conhecidas para teste
        self.possible_backends = [
            "https://www.caracore.com.br",
            "https://caracore.com.br",
            "https://api.caracore.com.br"
        ]
        
        self.google_client_id = "1023942712021-7k4aalpg2oeenhisln9tk9s15m26iruu.apps.googleusercontent.com"

    def log(self, message: str, level: str = 'INFO'):
        """Log com timestamp"""
        timestamp = datetime.now().strftime('%H:%M:%S')
        icons = {'INFO': '📝', 'SUCCESS': '✅', 'ERROR': '❌', 'WARNING': '⚠️'}
        print(f"[{timestamp}] {icons.get(level, '📝')} {message}")

    def test_backend_endpoint(self, base_url: str, endpoint: str, method: str = 'GET'):
        """Testa um endpoint específico"""
        url = f"{base_url.rstrip('/')}{endpoint}"
        
        try:
            if method == 'GET':
                response = requests.get(url, timeout=10)
            elif method == 'OPTIONS':
                response = requests.options(url, timeout=10, headers={
                    'Origin': 'https://www.caracore.com.br',
                    'Access-Control-Request-Method': 'POST',
                    'Access-Control-Request-Headers': 'Content-Type'
                })
            elif method == 'POST':
                response = requests.post(url, timeout=10, json={}, headers={
                    'Origin': 'https://www.caracore.com.br',
                    'Content-Type': 'application/json'
                })
            
            return {
                'success': True,
                'status_code': response.status_code,
                'headers': dict(response.headers),
                'text': response.text[:200] if response.text else '',
                'url': url
            }
            
        except requests.exceptions.RequestException as e:
            return {
                'success': False,
                'error': str(e),
                'url': url
            }

    def check_all_backends(self):
        """Verifica todos os possíveis backends"""
        self.log("Verificando possíveis backends...", 'INFO')
        
        results = {}
        
        for backend_url in self.possible_backends:
            self.log(f"Testando: {backend_url}", 'INFO')
            
            backend_results = {
                'base_accessible': False,
                'health': None,
                'google_options': None,
                'google_post': None
            }
            
            # Testa acessibilidade básica
            base_test = self.test_backend_endpoint(backend_url, '/')
            if base_test['success']:
                backend_results['base_accessible'] = True
                self.log(f"  Base: ✅ Status {base_test['status_code']}", 'SUCCESS')
            else:
                self.log(f"  Base: ❌ {base_test['error']}", 'ERROR')
                continue
            
            # Testa health endpoint
            health_test = self.test_backend_endpoint(backend_url, '/health')
            backend_results['health'] = health_test
            if health_test['success'] and health_test['status_code'] == 200:
                self.log(f"  Health: ✅ OK", 'SUCCESS')
            else:
                status = health_test.get('status_code', 'Error')
                self.log(f"  Health: ❌ Status {status}", 'ERROR')
            
            # Testa Google OAuth OPTIONS
            options_test = self.test_backend_endpoint(backend_url, '/oauth/google/token', 'OPTIONS')
            backend_results['google_options'] = options_test
            if options_test['success'] and options_test['status_code'] in [200, 204]:
                self.log(f"  Google OPTIONS: ✅ OK", 'SUCCESS')
                # Verifica headers CORS
                cors_origin = options_test['headers'].get('Access-Control-Allow-Origin')
                if cors_origin:
                    self.log(f"    CORS Origin: {cors_origin}", 'INFO')
            else:
                status = options_test.get('status_code', 'Error')
                self.log(f"  Google OPTIONS: ❌ Status {status}", 'ERROR')
            
            # Testa Google OAuth POST (deve retornar 400 com dados inválidos)
            post_test = self.test_backend_endpoint(backend_url, '/oauth/google/token', 'POST')
            backend_results['google_post'] = post_test
            if post_test['success']:
                status = post_test['status_code']
                if status == 400:
                    self.log(f"  Google POST: ✅ Retorna 400 (correto para dados inválidos)", 'SUCCESS')
                elif status == 500:
                    self.log(f"  Google POST: ⚠️ Status 500 (possível config faltando)", 'WARNING')
                else:
                    self.log(f"  Google POST: ❓ Status {status}", 'INFO')
            else:
                self.log(f"  Google POST: ❌ Erro de conexão", 'ERROR')
            
            results[backend_url] = backend_results
        
        return results

    def analyze_results(self, results):
        """Analisa resultados e fornece diagnóstico"""
        self.log("Analisando resultados...", 'INFO')
        
        working_backends = []
        partial_backends = []
        
        for backend_url, backend_data in results.items():
            if not backend_data['base_accessible']:
                continue
            
            # Verifica se está funcionando completamente
            health_ok = (backend_data['health'] and 
                        backend_data['health']['success'] and 
                        backend_data['health']['status_code'] == 200)
            
            google_ok = (backend_data['google_options'] and 
                        backend_data['google_options']['success'] and 
                        backend_data['google_options']['status_code'] in [200, 204])
            
            if health_ok and google_ok:
                working_backends.append(backend_url)
            elif backend_data['base_accessible']:
                partial_backends.append(backend_url)
        
        print("\n" + "=" * 50)
        print("📊 ANÁLISE DE RESULTADOS")
        print("=" * 50)
        
        if working_backends:
            print("✅ BACKENDS FUNCIONANDO:")
            for backend in working_backends:
                print(f"   • {backend}")
                print(f"     - Health endpoint: OK")
                print(f"     - Google OAuth endpoint: OK")
                print(f"     - CORS configurado")
            
            # Recomendação
            recommended = working_backends[0]
            print(f"\n🎯 RECOMENDAÇÃO: Use {recommended}")
            self.show_frontend_config(recommended)
            
        elif partial_backends:
            print("⚠️ BACKENDS PARCIALMENTE FUNCIONANDO:")
            for backend in partial_backends:
                backend_data = results[backend]
                print(f"   • {backend}")
                
                if backend_data['health']:
                    health_status = backend_data['health']['status_code']
                    print(f"     - Health: Status {health_status}")
                else:
                    print(f"     - Health: Não testado")
                
                if backend_data['google_options']:
                    google_status = backend_data['google_options']['status_code']
                    print(f"     - Google OAuth: Status {google_status}")
                else:
                    print(f"     - Google OAuth: Não testado")
            
            print("\n💡 AÇÕES NECESSÁRIAS:")
            print("1. Verificar se backend está implantado corretamente")
            print("2. Configurar variáveis de ambiente (GOOGLE_CLIENT_SECRET, etc.)")
            print("3. Verificar configuração CORS")
            
        else:
            print("❌ NENHUM BACKEND FUNCIONANDO")
            print("\n🛠️ SOLUÇÕES POSSÍVEIS:")
            print("1. Implantar backend no Azure App Service")
            print("2. Configurar DNS para apontar para o App Service")
            print("3. Configurar variáveis de ambiente corretas")
            print("4. Executar backend localmente (desenvolvimento)")

    def show_frontend_config(self, backend_url):
        """Mostra configuração frontend para usar o backend"""
        print(f"\n⚙️ CONFIGURAÇÃO FRONTEND PARA {backend_url}")
        print("=" * 60)
        
        config_js = f'''// Configuração para usar backend em produção
window.CARA_CORE_CONFIG_OVERRIDE = {{
    provider: 'google',
    oidc: {{
        clientId: "{self.google_client_id}",
        authority: "https://accounts.google.com",
        redirectUri: window.location.origin + "/secure/callback.html",
        postLogoutRedirectUri: window.location.origin + "/secure/logout.html",
        cacheLocation: "sessionStorage",
        scopes: ["openid", "profile", "email"],
        tokenEndpoint: "{backend_url}/oauth/google/token"
    }},
    googleTokenEndpoint: '{backend_url}/oauth/google/token',
    environment: 'prod'
}};'''
        
        print("📝 Adicione ao final de js/config.js:")
        print("-" * 40)
        print(config_js)
        print("-" * 40)

    def show_manual_azure_steps(self):
        """Mostra passos manuais para configurar no Azure"""
        print("\n🔧 CONFIGURAÇÃO MANUAL NO AZURE PORTAL")
        print("=" * 50)
        
        print("1. 🌐 Acesse: https://portal.azure.com")
        print("2. 📱 Procure por 'App Services'")
        print("3. 🔍 Encontre o App Service do backend")
        print("4. ⚙️ Vá para: Configuration → Application settings")
        print("5. ➕ Adicione/edite estas variáveis:")
        print()
        print("   GOOGLE_CLIENT_ID:")
        print(f"   {self.google_client_id}")
        print()
        print("   GOOGLE_CLIENT_SECRET:")
        print("   [Obter do Google Cloud Console]")
        print()
        print("   ORIGIN_ALLOWED:")
        print("   https://www.caracore.com.br")
        print()
        print("   OAUTH_REDIRECT_URI:")
        print("   https://www.caracore.com.br/secure/callback.html")
        print()
        print("6. 💾 Salve as configurações")
        print("7. 🔄 Reinicie o App Service")
        print("8. ⏳ Aguarde 2-3 minutos")
        print("9. 🧪 Execute este script novamente para testar")

def main():
    print("🔍 VERIFICAÇÃO SIMPLES BACKEND AZURE")
    print("=" * 45)
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    checker = SimpleAzureBackendChecker()
    
    # Executa verificação
    results = checker.check_all_backends()
    
    # Analisa e fornece recomendações
    checker.analyze_results(results)
    
    # Mostra passos manuais
    checker.show_manual_azure_steps()
    
    return 0

if __name__ == "__main__":
    exit(main())
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
testar_backend_google.py - Teste Backend Google OAuth

Script para testar se o backend está rodando e processando
corretamente as requisições do Google OAuth.

Uso:
    python testar_backend_google.py [--backend-url URL]
"""

import requests
import json
from datetime import datetime
from urllib.parse import urlparse

class BackendGoogleTester:
    def __init__(self, backend_url: str = None):
        self.backend_url = backend_url or "https://www.caracore.com.br"
        self.google_token_endpoint = f"{self.backend_url}/oauth/google/token"
        self.health_endpoint = f"{self.backend_url}/health"

    def log(self, message: str, level: str = 'INFO'):
        """Log com timestamp"""
        timestamp = datetime.now().strftime('%H:%M:%S')
        icons = {'INFO': '📝', 'SUCCESS': '✅', 'ERROR': '❌', 'WARNING': '⚠️'}
        print(f"[{timestamp}] {icons.get(level, '📝')} {message}")

    def test_health_endpoint(self):
        """Testa endpoint de health"""
        self.log("Testando endpoint de health...", 'INFO')
        
        try:
            response = requests.get(self.health_endpoint, timeout=10)
            
            if response.status_code == 200:
                self.log("Health endpoint: OK", 'SUCCESS')
                self.log(f"Resposta: {response.text}", 'INFO')
                return True
            else:
                self.log(f"Health endpoint: Status {response.status_code}", 'WARNING')
                return False
                
        except requests.exceptions.RequestException as e:
            self.log(f"Erro acessando health endpoint: {e}", 'ERROR')
            return False

    def test_google_options(self):
        """Testa CORS preflight do endpoint Google"""
        self.log("Testando CORS preflight para Google...", 'INFO')
        
        try:
            headers = {
                'Origin': 'https://www.caracore.com.br',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type'
            }
            
            response = requests.options(self.google_token_endpoint, headers=headers, timeout=10)
            
            if response.status_code in [200, 204]:
                self.log("CORS preflight: OK", 'SUCCESS')
                
                # Verifica headers CORS
                cors_headers = {
                    'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
                    'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
                    'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
                }
                
                self.log(f"Headers CORS: {cors_headers}", 'INFO')
                return True
            else:
                self.log(f"CORS preflight: Status {response.status_code}", 'WARNING')
                return False
                
        except requests.exceptions.RequestException as e:
            self.log(f"Erro testando CORS: {e}", 'ERROR')
            return False

    def test_google_token_post_invalid(self):
        """Testa POST inválido para Google token (deve retornar 400)"""
        self.log("Testando POST inválido para Google token...", 'INFO')
        
        try:
            headers = {
                'Content-Type': 'application/json',
                'Origin': 'https://www.caracore.com.br'
            }
            
            # Payload inválido (faltam campos obrigatórios)
            data = {'invalid': 'data'}
            
            response = requests.post(
                self.google_token_endpoint, 
                json=data, 
                headers=headers, 
                timeout=10
            )
            
            if response.status_code == 400:
                self.log("POST inválido retornou 400: OK", 'SUCCESS')
                self.log(f"Resposta: {response.text[:200]}", 'INFO')
                return True
            elif response.status_code == 500:
                self.log("POST retornou 500 (possível problema de configuração)", 'WARNING')
                self.log(f"Resposta: {response.text[:200]}", 'INFO')
                return False
            else:
                self.log(f"POST inválido: Status inesperado {response.status_code}", 'WARNING')
                return False
                
        except requests.exceptions.RequestException as e:
            self.log(f"Erro testando POST: {e}", 'ERROR')
            return False

    def test_google_token_post_missing_fields(self):
        """Testa POST com campos faltando"""
        self.log("Testando POST com campos obrigatórios faltando...", 'INFO')
        
        try:
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Origin': 'https://www.caracore.com.br'
            }
            
            # Apenas alguns campos (falta code, client_id, etc.)
            data = {
                'grant_type': 'authorization_code',
                'redirect_uri': 'https://www.caracore.com.br/secure/callback.html'
            }
            
            response = requests.post(
                self.google_token_endpoint, 
                data=data, 
                headers=headers, 
                timeout=10
            )
            
            if response.status_code == 400:
                self.log("POST campos faltando retornou 400: OK", 'SUCCESS')
                
                try:
                    error_data = response.json()
                    if 'error' in error_data:
                        self.log(f"Erro retornado: {error_data['error']}", 'INFO')
                except:
                    self.log(f"Resposta: {response.text[:200]}", 'INFO')
                
                return True
            else:
                self.log(f"POST campos faltando: Status {response.status_code}", 'WARNING')
                return False
                
        except requests.exceptions.RequestException as e:
            self.log(f"Erro testando POST campos: {e}", 'ERROR')
            return False

    def analyze_backend_availability(self):
        """Analisa disponibilidade geral do backend"""
        self.log("Analisando disponibilidade do backend...", 'INFO')
        
        # Testa conectividade básica
        try:
            response = requests.get(self.backend_url, timeout=10)
            self.log(f"Conectividade básica: Status {response.status_code}", 'INFO')
            
        except requests.exceptions.RequestException as e:
            self.log(f"Problema de conectividade: {e}", 'ERROR')
            return False
        
        return True

    def provide_troubleshooting_guide(self):
        """Fornece guia de troubleshooting"""
        print("\n🛠️ GUIA DE TROUBLESHOOTING")
        print("=" * 35)
        
        print("\n🔍 Se o backend não estiver respondendo:")
        print("1. Verifique se está rodando:")
        print("   cd backend && python app.py")
        
        print("\n2. Verifique variáveis de ambiente:")
        print("   - GOOGLE_CLIENT_SECRET (obrigatório)")
        print("   - GOOGLE_CLIENT_ID")
        print("   - ORIGIN_ALLOWED")
        
        print("\n3. Verifique logs do servidor:")
        print("   - Erros de CORS")
        print("   - Problemas de certificado SSL")
        print("   - Timeouts de rede")
        
        print("\n🌐 Se o problema for CORS:")
        print("1. Verifique headers Access-Control-Allow-Origin")
        print("2. Confirme ORIGIN_ALLOWED nas variáveis de ambiente")
        print("3. Teste com diferentes origens")
        
        print("\n🔑 Se o problema for autenticação Google:")
        print("1. Verifique GOOGLE_CLIENT_SECRET no servidor")
        print("2. Confirme GOOGLE_CLIENT_ID no frontend")
        print("3. Verifique redirect URIs no Google Cloud Console")

    def run_comprehensive_test(self):
        """Executa teste completo do backend"""
        print("🧪 TESTE COMPLETO BACKEND GOOGLE")
        print("=" * 40)
        print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"Backend URL: {self.backend_url}")
        print()
        
        results = {}
        
        # Testa disponibilidade
        results['availability'] = self.analyze_backend_availability()
        
        # Testa health
        results['health'] = self.test_health_endpoint()
        
        # Testa CORS
        results['cors'] = self.test_google_options()
        
        # Testa endpoint Google
        results['google_invalid'] = self.test_google_token_post_invalid()
        results['google_missing'] = self.test_google_token_post_missing_fields()
        
        print("\n" + "=" * 40)
        print("📊 RESUMO DOS TESTES")
        print("=" * 40)
        
        # Conectividade
        status = "✅ OK" if results['availability'] else "❌ FALHA"
        print(f"🌐 Conectividade: {status}")
        
        # Health
        status = "✅ OK" if results['health'] else "❌ FALHA"
        print(f"❤️ Health endpoint: {status}")
        
        # CORS
        status = "✅ OK" if results['cors'] else "❌ FALHA"
        print(f"🔀 CORS: {status}")
        
        # Google endpoints
        google_ok = results['google_invalid'] or results['google_missing']
        status = "✅ OK" if google_ok else "❌ FALHA"
        print(f"🔑 Google OAuth endpoint: {status}")
        
        print("\n" + "=" * 40)
        
        # Diagnóstico final
        if all(results.values()):
            print("🎉 BACKEND FUNCIONANDO CORRETAMENTE!")
            print("   O problema pode estar no frontend JavaScript.")
            print("   Verifique Console do navegador para erros.")
        elif not results['availability']:
            print("❌ BACKEND INACESSÍVEL")
            print("   Verifique se o servidor está rodando.")
        elif not results['health']:
            print("⚠️ BACKEND PARCIALMENTE DISPONÍVEL")
            print("   Health endpoint não responde corretamente.")
        elif not results['cors']:
            print("🔀 PROBLEMA DE CORS")
            print("   Frontend não consegue fazer requisições.")
        else:
            print("🔑 PROBLEMA NO ENDPOINT GOOGLE")
            print("   Configuração OAuth pode estar incorreta.")
        
        self.provide_troubleshooting_guide()

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Teste Backend Google OAuth")
    parser.add_argument('--backend-url', default='https://www.caracore.com.br',
                       help='URL base do backend')
    
    args = parser.parse_args()
    
    tester = BackendGoogleTester(args.backend_url)
    tester.run_comprehensive_test()
    
    return 0

if __name__ == "__main__":
    exit(main())
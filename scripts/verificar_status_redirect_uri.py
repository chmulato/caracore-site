#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
verificar_status_redirect_uri.py - Verificação Rápida do Status

Script para verificar rapidamente se o redirect URI foi corrigido.
Executa uma verificação via curl para simular o teste de redirect_uri.

Uso:
    python verificar_status_redirect_uri.py
"""

import subprocess
import json
from datetime import datetime
from urllib.parse import quote

class RedirectURIStatusChecker:
    def __init__(self):
        self.client_id = "8ef17663-438f-4777-99ca-c5ad5b2a2993"
        self.redirect_uri = "https://www.caracore.com.br/secure/callback.html"
        self.test_url = self.build_test_url()

    def build_test_url(self):
        """Constrói URL de teste para verificar redirect_uri"""
        base_url = "https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize"
        params = {
            'client_id': self.client_id,
            'redirect_uri': self.redirect_uri,
            'response_type': 'code',
            'scope': 'openid profile email',
            'state': 'test_redirect_uri'
        }
        
        query_string = '&'.join([f"{k}={quote(str(v))}" for k, v in params.items()])
        return f"{base_url}?{query_string}"

    def test_redirect_uri(self):
        """Testa se o redirect_uri está funcionando"""
        print("🧪 TESTANDO REDIRECT URI...")
        print("=" * 40)
        print(f"Client ID: {self.client_id}")
        print(f"Redirect URI: {self.redirect_uri}")
        print()
        
        try:
            # Executa curl para verificar resposta
            cmd = [
                'curl',
                '-s',
                '-I',  # Apenas headers
                '-L',  # Segue redirects
                '--max-time', '10',
                self.test_url
            ]
            
            print(f"Executando: curl -s -I -L {self.test_url[:80]}...")
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
            
            if result.returncode == 0:
                headers = result.stdout
                
                # Verifica se há erro de redirect_uri
                if "invalid_request" in headers.lower():
                    print("❌ FALHA: Ainda há erro de redirect_uri")
                    print("   O URI não está registrado no Azure Portal")
                    return False
                elif "login.microsoftonline.com" in headers:
                    print("✅ SUCESSO: Redirect URI funcionando!")
                    print("   O URI está registrado corretamente")
                    return True
                else:
                    print("⚠️ INDETERMINADO: Resposta inesperada")
                    print("   Headers recebidos:")
                    print(headers[:200] + "..." if len(headers) > 200 else headers)
                    return None
            else:
                print("❌ ERRO: Falha na conexão")
                print(f"   Código: {result.returncode}")
                print(f"   Erro: {result.stderr}")
                return None
                
        except FileNotFoundError:
            print("⚠️ AVISO: curl não encontrado")
            print("   Testando via método alternativo...")
            return self.test_alternative()
        except Exception as e:
            print(f"❌ ERRO: {e}")
            return None

    def test_alternative(self):
        """Método alternativo usando Python requests"""
        try:
            import requests
            
            print("Testando com requests...")
            
            response = requests.get(
                self.test_url,
                allow_redirects=False,
                timeout=10,
                headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
            )
            
            if "invalid_request" in response.text.lower():
                print("❌ FALHA: Ainda há erro de redirect_uri")
                return False
            elif response.status_code in [200, 302, 303]:
                print("✅ SUCESSO: Redirect URI funcionando!")
                return True
            else:
                print(f"⚠️ Status: {response.status_code}")
                return None
                
        except ImportError:
            print("⚠️ requests não disponível. Teste manual necessário.")
            return None
        except Exception as e:
            print(f"❌ ERRO: {e}")
            return None

    def show_manual_test(self):
        """Mostra instruções para teste manual"""
        print("\n🔧 TESTE MANUAL")
        print("=" * 20)
        print("1. Abra seu navegador")
        print("2. Cole esta URL na barra de endereços:")
        print()
        print(self.test_url)
        print()
        print("3. Pressione Enter")
        print()
        print("RESULTADOS ESPERADOS:")
        print("✅ SUCESSO: Redireciona para página de login da Microsoft")
        print("❌ FALHA: Mostra erro 'invalid_request' sobre redirect_uri")

    def show_azure_instructions(self):
        """Mostra instruções para Azure Portal"""
        print("\n📋 SE AINDA HÁ ERRO - AÇÕES NECESSÁRIAS")
        print("=" * 45)
        print("1. Acesse: https://portal.azure.com")
        print("2. Procure por: Azure Active Directory > App registrations")
        print(f"3. Busque app: {self.client_id}")
        print("4. Clique em: Authentication")
        print("5. Adicione na seção 'Redirect URIs':")
        print(f"   ✅ {self.redirect_uri}")
        print("   ✅ https://caracore.com.br/secure/callback.html")
        print("6. Clique em Save")
        print("7. Aguarde 5-10 minutos para propagação")
        print("8. Execute este script novamente")

def main():
    print("🔍 VERIFICADOR DE STATUS - REDIRECT URI ENTRA ID")
    print("=" * 50)
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    checker = RedirectURIStatusChecker()
    
    # Executa teste
    result = checker.test_redirect_uri()
    
    print("\n" + "=" * 50)
    
    if result is True:
        print("🎉 STATUS: PROBLEMA RESOLVIDO!")
        print("   O redirect URI está funcionando corretamente.")
        print("   Você pode fazer login normalmente no site.")
    elif result is False:
        print("⚠️ STATUS: PROBLEMA PERSISTE")
        print("   O redirect URI ainda não está registrado.")
        checker.show_azure_instructions()
    else:
        print("🤔 STATUS: INDETERMINADO")
        print("   Não foi possível verificar automaticamente.")
        checker.show_manual_test()
        checker.show_azure_instructions()

if __name__ == "__main__":
    main()
#!/usr/bin/env python3
"""
Teste do Endpoint de Alteração de Senha
Testa a funcionalidade de alteração segura de senha do super admin
"""

import requests
import json
import hashlib
from datetime import datetime

# Configurações
API_BASE_URL = "https://caracore-backend-docker.azurewebsites.net"
FRONTEND_BASE_URL = "https://www.caracore.com.br"
SUPER_ADMIN_EMAIL = "suporte@caracore.com.br"
SUPER_ADMIN_PASSWORD = "caracore2024"

def login_super_admin():
    """Faz login como super admin e retorna o token"""
    login_data = {
        "email": SUPER_ADMIN_EMAIL,
        "password": SUPER_ADMIN_PASSWORD
    }
    
    headers = {
        "Content-Type": "application/json",
        "Origin": FRONTEND_BASE_URL,
        "User-Agent": "CaraCore-Password-Test/1.0"
    }
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/api/admin/auth",
            json=login_data,
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            token = data.get("token")
            print(f"✅ Login realizado com sucesso")
            print(f"   Token: {token[:20]}...")
            return token
        else:
            print(f"❌ Erro no login: {response.status_code}")
            print(f"   Resposta: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Erro na requisição de login: {e}")
        return None

def test_change_password_endpoint(token):
    """Testa o endpoint de alteração de senha"""
    print("\n🔐 Testando endpoint de alteração de senha...")
    
    # Dados de teste
    test_data = {
        "current_password": SUPER_ADMIN_PASSWORD,
        "new_password": "***TEST_PASSWORD_REDACTED***!",
        "confirm_password": "***TEST_PASSWORD_REDACTED***!"
    }
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}",
        "Origin": FRONTEND_BASE_URL,
        "User-Agent": "CaraCore-Password-Test/1.0"
    }
    
    try:
        # Teste de CORS Preflight
        options_response = requests.options(
            f"{API_BASE_URL}/api/admin/change-password",
            headers=headers,
            timeout=30
        )
        
        print(f"   CORS Preflight: {options_response.status_code}")
        
        # Teste da alteração de senha
        response = requests.post(
            f"{API_BASE_URL}/api/admin/change-password",
            json=test_data,
            headers=headers,
            timeout=30
        )
        
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Endpoint funcionando!")
            print(f"   Novo hash gerado: {data.get('new_password_hash', 'N/A')[:20]}...")
            print(f"   Instruções disponíveis: {len(data.get('instructions', []))}")
            
            # Verificar se o hash está correto
            expected_hash = hashlib.sha256("***TEST_PASSWORD_REDACTED***!".encode()).hexdigest()
            actual_hash = data.get('new_password_hash')
            
            if expected_hash == actual_hash:
                print(f"✅ Hash gerado corretamente")
            else:
                print(f"❌ Hash incorreto")
                print(f"   Esperado: {expected_hash}")
                print(f"   Recebido: {actual_hash}")
                
        else:
            print(f"❌ Erro no endpoint: {response.status_code}")
            try:
                error_data = response.json()
                print(f"   Erro: {error_data.get('error')}")
                print(f"   Descrição: {error_data.get('error_description')}")
            except:
                print(f"   Resposta: {response.text}")
                
    except Exception as e:
        print(f"❌ Erro na requisição: {e}")

def test_password_validation():
    """Testa as validações de senha"""
    print("\n🔍 Testando validações de senha...")
    
    # Primeiro, fazer login
    token = login_super_admin()
    if not token:
        print("❌ Não foi possível fazer login para testar validações")
        return
    
    # Casos de teste
    test_cases = [
        {
            "name": "Senha muito curta",
            "data": {
                "current_password": SUPER_ADMIN_PASSWORD,
                "new_password": "123",
                "confirm_password": "123"
            },
            "expected_error": "invalid_password"
        },
        {
            "name": "Confirmação não confere",
            "data": {
                "current_password": SUPER_ADMIN_PASSWORD,
                "new_password": "***TEST_PASSWORD_REDACTED***!",
                "confirm_password": "DifferentPass@123!"
            },
            "expected_error": "invalid_request"
        },
        {
            "name": "Senha atual incorreta",
            "data": {
                "current_password": "senha_errada",
                "new_password": "***TEST_PASSWORD_REDACTED***!",
                "confirm_password": "***TEST_PASSWORD_REDACTED***!"
            },
            "expected_error": "unauthorized"
        },
        {
            "name": "Senha sem maiúsculas",
            "data": {
                "current_password": SUPER_ADMIN_PASSWORD,
                "new_password": "novaseh@123!",
                "confirm_password": "novaseh@123!"
            },
            "expected_error": "invalid_password"
        }
    ]
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}",
        "Origin": FRONTEND_BASE_URL,
        "User-Agent": "CaraCore-Password-Test/1.0"
    }
    
    for test_case in test_cases:
        print(f"\n   Testando: {test_case['name']}")
        
        try:
            response = requests.post(
                f"{API_BASE_URL}/api/admin/change-password",
                json=test_case["data"],
                headers=headers,
                timeout=30
            )
            
            if response.status_code != 200:
                try:
                    error_data = response.json()
                    error_type = error_data.get('error')
                    
                    if error_type == test_case["expected_error"]:
                        print(f"   ✅ Validação correta: {error_data.get('error_description')}")
                    else:
                        print(f"   ❌ Erro inesperado: {error_type} (esperado: {test_case['expected_error']})")
                except:
                    print(f"   ❌ Resposta não é JSON: {response.text}")
            else:
                print(f"   ❌ Deveria ter falhado mas retornou 200")
                
        except Exception as e:
            print(f"   ❌ Erro na requisição: {e}")

def test_frontend_page():
    """Testa se a página frontend está acessível"""
    print("\n🌐 Testando página frontend...")
    
    try:
        response = requests.get(
            f"{FRONTEND_BASE_URL}/secure/change-password.html",
            timeout=30
        )
        
        if response.status_code == 200:
            print(f"✅ Página acessível")
            print(f"   Tamanho: {len(response.content)} bytes")
            
            # Verificar se contém elementos esperados
            content = response.text
            checks = [
                ("Título da página", "Alterar Senha" in content),
                ("Formulário", "changePasswordForm" in content),
                ("Script JS", "change-password.js" in content),
                ("Validação de senha", "password-requirements" in content)
            ]
            
            for check_name, result in checks:
                status = "✅" if result else "❌"
                print(f"   {status} {check_name}")
                
        else:
            print(f"❌ Página não acessível: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Erro ao acessar página: {e}")

def main():
    print("🔐 TESTE DO SISTEMA DE ALTERAÇÃO DE SENHA")
    print("=" * 50)
    print(f"Backend: {API_BASE_URL}")
    print(f"Frontend: {FRONTEND_BASE_URL}")
    print(f"Data/Hora: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
    print()
    
    # 1. Testar login
    print("1️⃣ Fazendo login como super admin...")
    token = login_super_admin()
    
    if not token:
        print("❌ Não foi possível continuar sem token de autenticação")
        return
    
    # 2. Testar endpoint de alteração
    print("\n2️⃣ Testando endpoint de alteração de senha...")
    test_change_password_endpoint(token)
    
    # 3. Testar validações
    print("\n3️⃣ Testando validações de senha...")
    test_password_validation()
    
    # 4. Testar página frontend
    print("\n4️⃣ Testando página frontend...")
    test_frontend_page()
    
    print("\n" + "=" * 50)
    print("🎯 Teste concluído!")
    print("\n💡 Próximos passos:")
    print("   1. Acesse: https://www.caracore.com.br/secure/change-password.html")
    print("   2. Faça login como super admin")
    print("   3. Teste a alteração de senha na interface")
    print("   4. Use o hash gerado para atualizar no Azure App Service")

if __name__ == "__main__":
    main()
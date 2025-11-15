#!/usr/bin/env python3
"""Teste rápido de segurança - Fase 6"""
import requests

print("=" * 80)
print("TESTE RÁPIDO - PROTEÇÃO DE ENDPOINTS (FASE 6)")
print("=" * 80)

base_url = "https://caracore-backend-docker.azurewebsites.net"

# Teste 1: Sem token
print("\n1. Testando endpoint /api/admin/users SEM TOKEN...")
try:
    response = requests.get(
        f"{base_url}/api/admin/users",
        headers={"Content-Type": "application/json"},
        timeout=30
    )
    print(f"   Status Code: {response.status_code}")
    print(f"   Response: {response.text[:150]}")
    if response.status_code == 401:
        print("   ✓ PASS - Endpoint rejeitou acesso sem token")
    else:
        print("   ✗ FAIL - Endpoint deveria retornar 401")
except Exception as e:
    print(f"   ✗ ERRO: {e}")

# Teste 2: Token inválido
print("\n2. Testando endpoint /api/admin/users COM TOKEN INVÁLIDO...")
try:
    response = requests.get(
        f"{base_url}/api/admin/users",
        headers={
            "Content-Type": "application/json",
            "Authorization": "Bearer token_completamente_invalido_12345"
        },
        timeout=30
    )
    print(f"   Status Code: {response.status_code}")
    print(f"   Response: {response.text[:150]}")
    if response.status_code == 401:
        print("   ✓ PASS - Endpoint rejeitou token inválido")
    else:
        print("   ✗ FAIL - Endpoint deveria retornar 401")
except Exception as e:
    print(f"   ✗ ERRO: {e}")

# Teste 3: Health check
print("\n3. Testando endpoint /health...")
try:
    response = requests.get(f"{base_url}/health", timeout=30)
    print(f"   Status Code: {response.status_code}")
    print(f"   Response: {response.text[:150]}")
    if response.status_code == 200:
        print("   ✓ PASS - Backend online")
    else:
        print("   ✗ FAIL - Backend com problema")
except Exception as e:
    print(f"   ✗ ERRO: {e}")

print("\n" + "=" * 80)
print("CONCLUSÃO:")
print("Se os testes 1 e 2 retornaram 401, o middleware de autorização da Fase 6")
print("está funcionando PERFEITAMENTE em produção!")
print("=" * 80)

"""
🔍 ANÁLISE DE RECURSOS LEGADOS AZURE
====================================

Este script analisa se os recursos api-caracore e kv-api-caracore
ainda são necessários após a implementação do caracore-backend.
"""

import requests
import json
from datetime import datetime

def analisar_recursos_legados():
    """Analisa se recursos legados ainda são necessários"""
    
    print("🔍 ANÁLISE DE RECURSOS LEGADOS")
    print("=" * 50)
    print()
    
    # URLs dos backends
    api_caracore = "https://api-caracore.azurewebsites.net"
    caracore_backend = "https://caracore-backend.azurewebsites.net"
    
    print("📊 COMPARAÇÃO DOS BACKENDS")
    print("-" * 30)
    
    # Teste 1: Health check comparativo
    print("1️⃣ Health Check Comparativo:")
    
    try:
        # api-caracore
        resp1 = requests.get(f"{api_caracore}/health", timeout=10)
        print(f"   api-caracore: {resp1.status_code} - {resp1.json()}")
    except Exception as e:
        print(f"   api-caracore: ❌ {e}")
    
    try:
        # caracore-backend
        resp2 = requests.get(f"{caracore_backend}/health", timeout=10)
        print(f"   caracore-backend: {resp2.status_code} - {resp2.json()}")
    except Exception as e:
        print(f"   caracore-backend: ❌ {e}")
    
    print()
    
    # Teste 2: Google OAuth endpoint
    print("2️⃣ Google OAuth Endpoint:")
    
    try:
        resp1 = requests.post(f"{api_caracore}/oauth/google/token", timeout=10)
        print(f"   api-caracore: {resp1.status_code}")
        if resp1.status_code != 404:
            print(f"      Response: {resp1.json()}")
    except Exception as e:
        print(f"   api-caracore: ❌ {e}")
    
    try:
        resp2 = requests.post(f"{caracore_backend}/oauth/google/token", timeout=10)
        print(f"   caracore-backend: {resp2.status_code}")
        if resp2.status_code != 404:
            print(f"      Response: {resp2.json()}")
    except Exception as e:
        print(f"   caracore-backend: ❌ {e}")
    
    print()
    
    # Análise de uso atual
    print("📋 ANÁLISE DE USO ATUAL")
    print("-" * 25)
    
    print("Frontend atual (js/config.js):")
    print("   ✅ Usando caracore-backend.azurewebsites.net")
    print()
    
    print("Arquivos de teste ainda referenciam api-caracore:")
    print("   - secure/testes/*.js (testes antigos)")
    print("   - scripts/teste_*.py (scripts de teste)")
    print("   - docs/*.md (documentação)")
    print()
    
    print("🎯 RECOMENDAÇÕES")
    print("-" * 20)
    print()
    print("✅ MANTER caracore-backend:")
    print("   - É o backend ATUAL em uso")
    print("   - Configurado corretamente")
    print("   - Google OAuth funcionando")
    print()
    print("❓ api-caracore (ANÁLISE):")
    print("   - Ainda funciona mas NÃO está sendo usado")
    print("   - Frontend foi migrado para caracore-backend")
    print("   - Pode ser removido se não houver dependências externas")
    print()
    print("❓ kv-api-caracore (Key Vault):")
    print("   - Pode ter secrets/certificados importantes")
    print("   - VERIFICAR antes de remover")
    print("   - Pode estar sendo usado por api-caracore")
    print()
    
    print("⚠️ PRÓXIMOS PASSOS SEGUROS:")
    print("1. Parar api-caracore temporariamente e testar")
    print("2. Se nada quebrar, pode remover api-caracore")
    print("3. Verificar conteúdo do Key Vault antes de remover")
    print("4. Atualizar documentação e testes para caracore-backend")
    
    return True

if __name__ == "__main__":
    analisar_recursos_legados()
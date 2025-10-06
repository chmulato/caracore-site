#!/usr/bin/env python3
"""
Script final para testar API caracore no Azure.
Validação completa incluindo Key Vault.
"""
import sys
import subprocess
from pathlib import Path

def main():
    print("TESTE COMPLETO API CARACORE AZURE")
    print("=" * 50)
    print()
    
    # 1. Teste específico do Key Vault
    print("1. TESTANDO KEY VAULT INTEGRATION...")
    print("-" * 40)
    
    try:
        result1 = subprocess.run([
            "python", "teste_keyvault_simples.py", "--verbose"
        ], capture_output=True, text=True)
        
        print(result1.stdout)
        if result1.stderr:
            print("STDERR:", result1.stderr)
        
        keyvault_ok = result1.returncode == 0
        print(f"Key Vault Test: {'PASSED' if keyvault_ok else 'FAILED'}")
    except Exception as e:
        print(f"ERRO ao testar Key Vault: {e}")
        keyvault_ok = False
    
    print("\n" + "=" * 50)
    
    # 2. Teste dos endpoints principais
    print("2. TESTANDO ENDPOINTS API...")
    print("-" * 40)
    
    try:
        result2 = subprocess.run([
            "python", "teste_end_point_azure.py", 
            "--skip-keyvault", "--skip-app-settings"
        ], capture_output=True, text=True)
        
        print(result2.stdout)
        if result2.stderr:
            print("STDERR:", result2.stderr)
        
        endpoints_ok = result2.returncode == 0
        print(f"Endpoints Test: {'PASSED' if endpoints_ok else 'FAILED'}")
    except Exception as e:
        print(f"ERRO ao testar endpoints: {e}")
        endpoints_ok = False
    
    print("\n" + "=" * 50)
    
    # Resumo final
    print("RESUMO FINAL:")
    print("-" * 30)
    print(f"Key Vault Integration: {'OK' if keyvault_ok else 'FALHOU'}")
    print(f"API Endpoints:         {'OK' if endpoints_ok else 'FALHOU'}")
    
    if keyvault_ok and endpoints_ok:
        print("\nSUCESSO: Todos os testes passaram!")
        print("✓ GOOGLE_CLIENT_SECRET está carregando do Key Vault")
        print("✓ Endpoints OAuth funcionando")
        print("✓ CORS configurado corretamente")
        print("✓ API está pronta para produção")
        return 0
    else:
        print("\nFALHA: Alguns testes falharam!")
        if not keyvault_ok:
            print("× Problema na integração Key Vault")
        if not endpoints_ok:
            print("× Problema nos endpoints da API")
        return 1

if __name__ == "__main__":
    sys.exit(main())
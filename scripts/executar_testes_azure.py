#!/usr/bin/env python3
"""
Script de exemplo para executar todos os testes da API Azure.
Este script executa os testes de endpoint e Key Vault de forma organizada.
"""
import sys
import subprocess
from pathlib import Path

def run_command(cmd, description):
    """Executa um comando e exibe o resultado"""
    print(f"🚀 {description}")
    print("=" * 60)
    
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        
        if result.stdout:
            print(result.stdout)
        
        if result.stderr:
            print("STDERR:", result.stderr)
        
        print(f"Exit code: {result.returncode}")
        print("=" * 60)
        print()
        
        return result.returncode == 0
    
    except Exception as e:
        print(f"❌ Erro ao executar comando: {e}")
        print("=" * 60)
        print()
        return False

def main():
    print("🧪 SUITE COMPLETA DE TESTES - API CARACORE AZURE")
    print("=" * 70)
    print()
    
    # Verificar se os scripts existem
    script_dir = Path(__file__).parent
    endpoint_script = script_dir / "teste_end_point_azure.py"
    keyvault_script = script_dir / "teste_keyvault_azure.py"
    
    if not endpoint_script.exists():
        print(f"❌ Script não encontrado: {endpoint_script}")
        return 1
    
    if not keyvault_script.exists():
        print(f"❌ Script não encontrado: {keyvault_script}")
        return 1
    
    all_passed = True
    
    # 1. Teste específico do Key Vault
    print("🔐 TESTE 1: INTEGRAÇÃO AZURE KEY VAULT")
    success = run_command(
        f"python {keyvault_script} --verbose",
        "Validando se GOOGLE_CLIENT_SECRET está carregando do Key Vault"
    )
    all_passed &= success
    
    # 2. Testes completos dos endpoints
    print("🌐 TESTE 2: ENDPOINTS DA API")
    success = run_command(
        f"python {endpoint_script}",
        "Validando todos os endpoints da API (CORS, OAuth, etc.)"
    )
    all_passed &= success
    
    # 3. Testes específicos (exemplos)
    print("🎯 TESTE 3: TESTES ESPECÍFICOS")
    
    # Teste apenas CORS
    success = run_command(
        f"python {endpoint_script} --skip-keyvault --skip-app-settings",
        "Testando apenas funcionalidades CORS"
    )
    all_passed &= success
    
    # Resumo final
    print("📊 RESUMO FINAL")
    print("=" * 70)
    
    if all_passed:
        print("🎉 TODOS OS TESTES PASSARAM!")
        print("✅ A API está funcionando corretamente no Azure")
        print("✅ Key Vault integração validada")
        print("✅ Endpoints OAuth funcionando")
        print("✅ Configurações CORS corretas")
    else:
        print("❌ ALGUNS TESTES FALHARAM!")
        print("💡 Revise os detalhes acima para identificar problemas")
        print("🔧 Comandos para testar individualmente:")
        print(f"   python {keyvault_script} --verbose")
        print(f"   python {endpoint_script}")
    
    print("=" * 70)
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main())
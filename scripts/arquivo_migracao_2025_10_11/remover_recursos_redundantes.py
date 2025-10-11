"""
🗑️ REMOÇÃO AUTOMATIZADA - RECURSOS REDUNDANTES
==============================================

Script para remoção segura e automatizada dos recursos api-caracore e kv-api-caracore.
"""

import subprocess
import requests
import time
import json
import os
from datetime import datetime

def executar_comando(cmd, descricao=""):
    """Executa comando Azure CLI com tratamento de erro"""
    print(f"📝 {descricao}")
    print(f"   Comando: {' '.join(cmd)}")
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        print(f"   ✅ Sucesso!")
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"   ❌ Erro: {e}")
        print(f"   Stderr: {e.stderr}")
        return None

def testar_site(nome_teste=""):
    """Testa se o site principal está funcionando"""
    print(f"🧪 {nome_teste}")
    
    # Teste 1: Site principal
    try:
        resp = requests.get("https://www.caracore.com.br", timeout=10)
        print(f"   Site principal: {resp.status_code} ✅")
    except Exception as e:
        print(f"   Site principal: ❌ {e}")
        return False
    
    # Teste 2: Backend ativo
    try:
        resp = requests.get("https://caracore-backend.azurewebsites.net/health", timeout=10)
        print(f"   Backend ativo: {resp.status_code} ✅")
    except Exception as e:
        print(f"   Backend ativo: ❌ {e}")
        return False
    
    # Teste 3: Google OAuth endpoint
    try:
        resp = requests.post("https://caracore-backend.azurewebsites.net/oauth/google/token", timeout=10)
        if resp.status_code == 400:  # Erro esperado
            print(f"   Google OAuth: {resp.status_code} ✅ (erro esperado)")
        else:
            print(f"   Google OAuth: {resp.status_code} ⚠️")
    except Exception as e:
        print(f"   Google OAuth: ❌ {e}")
        return False
    
    return True

def fazer_backup():
    """Faz backup das configurações antes da remoção"""
    print("\n💾 CRIANDO BACKUPS")
    print("=" * 25)
    
    # Backup configurações api-caracore
    cmd = ["az", "webapp", "config", "appsettings", "list", 
           "--name", "api-caracore", "--resource-group", "rg-caracore"]
    resultado = executar_comando(cmd, "Backup configurações api-caracore")
    
    if resultado:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        arquivo_backup = f"backup_api_caracore_settings_{timestamp}.json"
        with open(arquivo_backup, 'w') as f:
            f.write(resultado)
        print(f"   📁 Salvo em: {arquivo_backup}")
    
    # Backup secret do Key Vault
    cmd = ["az", "keyvault", "secret", "show", 
           "--vault-name", "kv-api-caracore", "--name", "GOOGLE-CLIENT-SECRET"]
    resultado = executar_comando(cmd, "Backup Google Client Secret")
    
    if resultado:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        arquivo_backup = f"backup_google_secret_{timestamp}.json"
        with open(arquivo_backup, 'w') as f:
            f.write(resultado)
        print(f"   📁 Salvo em: {arquivo_backup}")

def remover_recursos():
    """Remove os recursos redundantes"""
    print("\n🗑️ REMOVENDO RECURSOS REDUNDANTES")
    print("=" * 40)
    
    # 1. Remover api-caracore
    cmd = ["az", "webapp", "delete", "--name", "api-caracore", 
           "--resource-group", "rg-caracore", "--yes"]
    executar_comando(cmd, "Removendo api-caracore")
    
    # 2. Remover Key Vault
    cmd = ["az", "keyvault", "delete", "--name", "kv-api-caracore", 
           "--resource-group", "rg-caracore"]
    executar_comando(cmd, "Removendo kv-api-caracore")
    
    # 3. Remover App Service Plan (se não usado)
    cmd = ["az", "appservice", "plan", "show", "--name", "plan-caracore", 
           "--resource-group", "rg-caracore", "--query", "numberOfSites"]
    resultado = executar_comando(cmd, "Verificando uso do plan-caracore")
    
    if resultado and resultado.strip() == "0":
        cmd = ["az", "appservice", "plan", "delete", "--name", "plan-caracore", 
               "--resource-group", "rg-caracore", "--yes"]
        executar_comando(cmd, "Removendo plan-caracore (não usado)")
    else:
        print("   ⚠️ plan-caracore ainda tem apps, mantendo...")

def executar_remocao_completa():
    """Executa o processo completo de remoção"""
    
    print("🗑️ REMOÇÃO AUTOMATIZADA - RECURSOS REDUNDANTES")
    print("=" * 55)
    print()
    
    # Teste inicial
    if not testar_site("Teste inicial - site funcionando"):
        print("❌ Site não está funcionando corretamente. Abortando.")
        return False
    
    print()
    
    # Fase 1: Parar api-caracore temporariamente
    print("📍 FASE 1: TESTE REVERSÍVEL")
    print("-" * 30)
    
    cmd = ["az", "webapp", "stop", "--name", "api-caracore", "--resource-group", "rg-caracore"]
    if not executar_comando(cmd, "Parando api-caracore temporariamente"):
        print("❌ Erro parando api-caracore. Abortando.")
        return False
    
    print("\n⏳ Aguardando 30 segundos...")
    time.sleep(30)
    
    # Testar após parada
    if not testar_site("Teste após parada do api-caracore"):
        print("\n❌ Site com problemas após parar api-caracore!")
        print("🔄 Religando api-caracore...")
        cmd = ["az", "webapp", "start", "--name", "api-caracore", "--resource-group", "rg-caracore"]
        executar_comando(cmd, "Religando api-caracore")
        return False
    
    print("\n✅ Teste OK! Site funcionando sem api-caracore.")
    
    # Fase 2: Backup
    fazer_backup()
    
    # Fase 3: Remoção definitiva
    print(f"\n⚠️ CONFIRMAÇÃO FINAL")
    print("Recursos a serem REMOVIDOS DEFINITIVAMENTE:")
    print("- api-caracore.azurewebsites.net")
    print("- kv-api-caracore (Key Vault)")
    print("- plan-caracore (se não usado)")
    print()
    
    confirmacao = input("Digite 'REMOVER' para confirmar a remoção definitiva: ")
    
    if confirmacao != "REMOVER":
        print("❌ Remoção cancelada pelo usuário.")
        print("🔄 Religando api-caracore...")
        cmd = ["az", "webapp", "start", "--name", "api-caracore", "--resource-group", "rg-caracore"]
        executar_comando(cmd, "Religando api-caracore")
        return False
    
    # Executar remoção
    remover_recursos()
    
    # Teste final
    print()
    if testar_site("Teste final - após remoção"):
        print("\n🎉 REMOÇÃO CONCLUÍDA COM SUCESSO!")
        print("\n📊 RECURSOS REMOVIDOS:")
        print("✅ api-caracore.azurewebsites.net")
        print("✅ kv-api-caracore")
        print("✅ plan-caracore (se não usado)")
        print("\n💰 Economia: ~$0.30/mês")
        print("📁 Backups salvos no diretório atual")
        return True
    else:
        print("\n❌ Problemas detectados após remoção!")
        print("⚠️ Verifique os backups e logs do Azure")
        return False

if __name__ == "__main__":
    print("Este script vai remover permanentemente os recursos redundantes:")
    print("- api-caracore.azurewebsites.net")
    print("- kv-api-caracore")
    print("- plan-caracore (se não usado)")
    print()
    
    if input("Continuar? (s/N): ").lower() == 's':
        executar_remocao_completa()
    else:
        print("Operação cancelada.")
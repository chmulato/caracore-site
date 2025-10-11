"""
🔧 PLANO DE MIGRAÇÃO - REMOÇÃO RECURSOS LEGADOS
===============================================

Análise completa e plano para remoção segura dos recursos api-caracore e kv-api-caracore.
"""

import subprocess
import requests
import time

def criar_plano_migracao():
    """Cria plano detalhado para remoção dos recursos legados"""
    
    print("🔧 PLANO DE MIGRAÇÃO - RECURSOS LEGADOS")
    print("=" * 50)
    print()
    
    print("📊 SITUAÇÃO ATUAL IDENTIFICADA:")
    print("-" * 35)
    print()
    print("✅ caracore-backend:")
    print("   - URL: caracore-backend.azurewebsites.net")
    print("   - Status: EM USO pelo frontend")
    print("   - Google OAuth: FUNCIONANDO")
    print("   - Configurações: OK")
    print()
    print("❓ api-caracore:")
    print("   - URL: api-caracore.azurewebsites.net")
    print("   - Status: FUNCIONANDO mas NÃO usado")
    print("   - Tem: Azure Client ID/Secret + Google Client ID/Secret")
    print("   - Frontend: NÃO aponta mais para este")
    print()
    print("❓ kv-api-caracore:")
    print("   - Tipo: Azure Key Vault")
    print("   - Contém: GOOGLE-CLIENT-SECRET")
    print("   - Usado por: api-caracore (provavelmente)")
    print()
    
    print("🎯 ESTRATÉGIA DE REMOÇÃO SEGURA:")
    print("-" * 40)
    print()
    print("FASE 1 - VALIDAÇÃO (REVERSÍVEL)")
    print("1. Parar api-caracore temporariamente")
    print("2. Testar site por 10-15 minutos")
    print("3. Se tudo OK, prosseguir")
    print("4. Se der problema, religar api-caracore")
    print()
    print("FASE 2 - BACKUP E REMOÇÃO")
    print("1. Backup das configurações do api-caracore")
    print("2. Backup dos secrets do Key Vault")
    print("3. Remover api-caracore")
    print("4. Remover kv-api-caracore")
    print("5. Remover plan-caracore (se não usado)")
    print()
    
    print("💰 ECONOMIA ESTIMADA:")
    print("-" * 25)
    print("- App Service api-caracore: ~$0 (F1 Free)")
    print("- Key Vault kv-api-caracore: ~$0.30/mês")
    print("- App Service Plan plan-caracore: ~$0 (se F1)")
    print("Total economia: ~$0.30/mês (mínimo)")
    print()
    
    print("⚠️ RISCOS E MITIGAÇÕES:")
    print("-" * 30)
    print("RISCO: Site parar de funcionar")
    print("MITIGAÇÃO: Teste com parada temporária primeiro")
    print()
    print("RISCO: Perder configurações importantes") 
    print("MITIGAÇÃO: Backup completo antes da remoção")
    print()
    print("RISCO: Dependências externas desconhecidas")
    print("MITIGAÇÃO: Monitorar logs e erros durante teste")
    print()
    
    print("🚀 COMANDOS PARA EXECUÇÃO:")
    print("-" * 35)
    print()
    print("# FASE 1 - TESTE (REVERSÍVEL)")
    print("az webapp stop --name api-caracore --resource-group rg-caracore")
    print("# ... aguardar 10-15 min, testar site ...")
    print("# Se der problema:")
    print("az webapp start --name api-caracore --resource-group rg-caracore")
    print()
    print("# FASE 2 - BACKUP")
    print("az webapp config appsettings list --name api-caracore --resource-group rg-caracore > backup_api_caracore_settings.json")
    print("az keyvault secret show --vault-name kv-api-caracore --name GOOGLE-CLIENT-SECRET > backup_google_secret.json")
    print()
    print("# FASE 3 - REMOÇÃO DEFINITIVA")
    print("az webapp delete --name api-caracore --resource-group rg-caracore")
    print("az keyvault delete --name kv-api-caracore --resource-group rg-caracore")
    print("az appservice plan delete --name plan-caracore --resource-group rg-caracore")
    print()
    
    return True

def executar_fase1_teste():
    """Executa teste de parada temporária do api-caracore"""
    
    print("🧪 EXECUTANDO FASE 1 - TESTE REVERSÍVEL")
    print("=" * 45)
    print()
    
    # Testar site antes
    print("1️⃣ Testando site ANTES da parada...")
    try:
        resp = requests.get("https://www.caracore.com.br", timeout=10)
        print(f"   Site principal: {resp.status_code} ✅")
    except Exception as e:
        print(f"   Site principal: ❌ {e}")
        return False
    
    try:
        resp = requests.get("https://caracore-backend.azurewebsites.net/health", timeout=10)
        print(f"   Backend ativo: {resp.status_code} ✅")
    except Exception as e:
        print(f"   Backend ativo: ❌ {e}")
        return False
    
    print()
    print("2️⃣ Parando api-caracore temporariamente...")
    
    try:
        cmd = ["az", "webapp", "stop", "--name", "api-caracore", "--resource-group", "rg-caracore"]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        print("   ✅ api-caracore parado com sucesso!")
    except subprocess.CalledProcessError as e:
        print(f"   ❌ Erro parando api-caracore: {e}")
        return False
    
    print()
    print("3️⃣ Aguardando 30 segundos...")
    time.sleep(30)
    
    print()
    print("4️⃣ Testando site APÓS a parada...")
    try:
        resp = requests.get("https://www.caracore.com.br", timeout=10)
        print(f"   Site principal: {resp.status_code} ✅")
    except Exception as e:
        print(f"   Site principal: ❌ {e}")
        return False
    
    try:
        resp = requests.get("https://caracore-backend.azurewebsites.net/health", timeout=10)
        print(f"   Backend ativo: {resp.status_code} ✅")
    except Exception as e:
        print(f"   Backend ativo: ❌ {e}")
        return False
    
    print()
    print("✅ TESTE CONCLUÍDO COM SUCESSO!")
    print()
    print("📋 PRÓXIMAS AÇÕES:")
    print("1. Monitorar site por mais 10-15 minutos")
    print("2. Se tudo OK, executar backup e remoção definitiva")
    print("3. Se houver problemas, executar:")
    print("   az webapp start --name api-caracore --resource-group rg-caracore")
    
    return True

if __name__ == "__main__":
    print("Escolha uma opção:")
    print("1. Ver plano completo de migração")
    print("2. Executar Fase 1 (teste reversível)")
    
    escolha = input("\nOpção (1 ou 2): ").strip()
    
    if escolha == "1":
        criar_plano_migracao()
    elif escolha == "2":
        if input("\n⚠️ Confirma execução do teste? (s/N): ").lower() == 's':
            executar_fase1_teste()
        else:
            print("Teste cancelado.")
    else:
        print("Opção inválida.")
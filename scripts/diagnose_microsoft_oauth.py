#!/usr/bin/env python3
"""
Script de diagnóstico para verificar configuração do Microsoft OAuth no Azure App Service

Uso:
    python scripts/diagnose_microsoft_oauth.py

Requisitos:
    - Azure CLI instalado e autenticado
    - Permissões para ler configurações do App Service
"""

import subprocess
import json
import sys
import os

# Configurações do App Service
APP_SERVICE_NAME = "caracore-backend-docker"
RESOURCE_GROUP = "rg-caracore"

# Variáveis necessárias para Microsoft OAuth
REQUIRED_VARS = [
    "AZURE_CLIENT_ID",
    "AZURE_CLIENT_SECRET",
    "AZURE_TENANT_ID"
]

# Variáveis opcionais mas recomendadas
OPTIONAL_VARS = [
    "AZURE_SCOPE",
    "AZURE_TOKEN_ENDPOINT"
]


def run_azure_cli(command):
    """Executa comando Azure CLI e retorna resultado"""
    try:
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            check=True
        )
        return json.loads(result.stdout) if result.stdout else {}
    except subprocess.CalledProcessError as e:
        print(f"❌ Erro ao executar comando Azure CLI: {e.stderr}")
        return None
    except json.JSONDecodeError as e:
        print(f"⚠️  Erro ao decodificar JSON: {e}")
        return None
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")
        return None


def check_azure_cli():
    """Verifica se Azure CLI está instalado e autenticado"""
    try:
        result = subprocess.run(
            ["az", "account", "show"],
            capture_output=True,
            text=True,
            check=True
        )
        account = json.loads(result.stdout)
        print(f"✅ Azure CLI autenticado como: {account.get('user', {}).get('name', 'N/A')}")
        print(f"   Subscription: {account.get('name', 'N/A')}")
        return True
    except subprocess.CalledProcessError:
        print("❌ Azure CLI não está autenticado. Execute: az login")
        return False
    except FileNotFoundError:
        print("❌ Azure CLI não está instalado. Instale em: https://aka.ms/InstallAzureCLI")
        return False


def get_app_settings():
    """Obtém configurações do App Service"""
    command = f"az webapp config appsettings list --name {APP_SERVICE_NAME} --resource-group {RESOURCE_GROUP} --output json"
    return run_azure_cli(command)


def format_value(value, max_length=50):
    """Formata valor para exibição (oculta secrets)"""
    if not value:
        return "❌ NÃO DEFINIDO"
    
    if len(value) > max_length:
        # Para secrets, mostra apenas primeiros e últimos caracteres
        if len(value) > 20:
            return f"{value[:8]}...{value[-4:]} (oculto)"
        return f"{value[:max_length]}..."
    
    return value


def check_microsoft_oauth_config():
    """Verifica configuração do Microsoft OAuth"""
    print("\n" + "="*70)
    print("DIAGNÓSTICO: Microsoft OAuth Configuration")
    print("="*70)
    
    # Verificar Azure CLI
    if not check_azure_cli():
        return False
    
    print(f"\n📋 Verificando App Service: {APP_SERVICE_NAME}")
    print(f"   Resource Group: {RESOURCE_GROUP}\n")
    
    # Obter configurações
    settings = get_app_settings()
    if settings is None:
        print("❌ Não foi possível obter configurações do App Service")
        return False
    
    # Criar dicionário de configurações
    config_dict = {}
    for setting in settings:
        config_dict[setting['name']] = setting.get('value', '')
    
    # Verificar variáveis obrigatórias
    print("🔍 Variáveis Obrigatórias:")
    print("-" * 70)
    all_required_present = True
    
    for var in REQUIRED_VARS:
        value = config_dict.get(var, '')
        is_present = bool(value)
        
        if is_present:
            if var == "AZURE_CLIENT_SECRET":
                print(f"✅ {var}: {format_value(value)}")
            else:
                print(f"✅ {var}: {value}")
        else:
            print(f"❌ {var}: NÃO DEFINIDO")
            all_required_present = False
    
    # Verificar variáveis opcionais
    print("\n📝 Variáveis Opcionais:")
    print("-" * 70)
    for var in OPTIONAL_VARS:
        value = config_dict.get(var, '')
        if value:
            print(f"✅ {var}: {value}")
        else:
            print(f"⚠️  {var}: Não definido (usando padrão)")
    
    # Verificar outras variáveis relacionadas
    print("\n🔗 Outras Variáveis Relacionadas:")
    print("-" * 70)
    related_vars = [
        "OAUTH_REDIRECT_URI",
        "ORIGIN_ALLOWED"
    ]
    
    for var in related_vars:
        value = config_dict.get(var, '')
        if value:
            print(f"✅ {var}: {value}")
        else:
            print(f"⚠️  {var}: Não definido")
    
    # Resumo
    print("\n" + "="*70)
    print("📊 RESUMO:")
    print("="*70)
    
    if all_required_present:
        print("✅ Todas as variáveis obrigatórias estão configuradas!")
        print("\n💡 Se ainda houver erro 500, verifique:")
        print("   1. Se as credenciais estão corretas")
        print("   2. Se o App Registration no Azure AD está ativo")
        print("   3. Se o redirect URI está configurado corretamente")
        print("   4. Logs do App Service para mais detalhes")
        return True
    else:
        print("❌ Algumas variáveis obrigatórias estão faltando!")
        print("\n🔧 Para corrigir, execute:")
        print(f"   az webapp config appsettings set \\")
        print(f"     --name {APP_SERVICE_NAME} \\")
        print(f"     --resource-group {RESOURCE_GROUP} \\")
        print(f"     --settings AZURE_CLIENT_ID=<seu-client-id> \\")
        print(f"                 AZURE_CLIENT_SECRET=<seu-client-secret> \\")
        print(f"                 AZURE_TENANT_ID=<seu-tenant-id>")
        print("\n📖 Ou configure via Portal Azure:")
        print(f"   https://portal.azure.com/#@/resource/subscriptions/*/resourceGroups/{RESOURCE_GROUP}/providers/Microsoft.Web/sites/{APP_SERVICE_NAME}/configuration")
        return False


def check_app_service_logs():
    """Sugere verificar logs do App Service"""
    print("\n" + "="*70)
    print("📋 VERIFICAR LOGS DO APP SERVICE:")
    print("="*70)
    print("\nPara ver logs em tempo real:")
    print(f"   az webapp log tail --name {APP_SERVICE_NAME} --resource-group {RESOURCE_GROUP}")
    print("\nPara ver logs de erros específicos:")
    print(f"   az webapp log tail --name {APP_SERVICE_NAME} --resource-group {RESOURCE_GROUP} | grep -i 'microsoft\\|azure_client\\|500'")
    print("\nOu via Portal Azure:")
    print(f"   https://portal.azure.com/#@/resource/subscriptions/*/resourceGroups/{RESOURCE_GROUP}/providers/Microsoft.Web/sites/{APP_SERVICE_NAME}/logStream")


def main():
    """Função principal"""
    print("\n" + "="*70)
    print("🔍 DIAGNÓSTICO: Microsoft OAuth - Erro 500")
    print("="*70)
    
    success = check_microsoft_oauth_config()
    check_app_service_logs()
    
    print("\n" + "="*70)
    if success:
        print("✅ Diagnóstico concluído. Configuração parece correta.")
        print("   Se o erro persistir, verifique os logs do App Service.")
    else:
        print("❌ Diagnóstico concluído. Configuração incompleta.")
        print("   Configure as variáveis faltantes e tente novamente.")
    print("="*70 + "\n")
    
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())


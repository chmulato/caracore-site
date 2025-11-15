#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script Python para configurar Azure Files com Managed Identity (System Assigned)
Uso: python scripts/configure_azure_files_managed_identity.py
"""

import subprocess
import sys
import json
import os
from typing import Optional, Dict, Any
from datetime import datetime

# Cores para output (ANSI)
class Colors:
    RED = '\033[0;31m'
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    CYAN = '\033[0;36m'
    NC = '\033[0m'  # No Color

# Variáveis de configuração (podem ser sobrescritas por variáveis de ambiente)
RESOURCE_GROUP = os.environ.get("AZ_RESOURCE_GROUP", "rg-caracore")
STORAGE_ACCOUNT_NAME = os.environ.get("AZ_STORAGE_ACCOUNT", "caracoredata")
FILE_SHARE_NAME = os.environ.get("AZ_SHARE_NAME", "caracore-data")
WEB_APP_NAME = os.environ.get("AZ_APP_NAME", "caracore-backend-docker")
MOUNT_PATH = os.environ.get("AZ_MOUNT_PATH", "/home/site/wwwroot/data")
MOUNT_NAME = os.environ.get("AZ_MOUNT_ID", "cara-files")
ROLE_NAME = "Storage File Data SMB Share Contributor"

def print_header(text: str):
    """Imprime cabeçalho formatado"""
    print(f"{Colors.CYAN}{'=' * 60}{Colors.NC}")
    print(f"{Colors.CYAN}{text}{Colors.NC}")
    print(f"{Colors.CYAN}{'=' * 60}{Colors.NC}")
    print()

def print_info(text: str):
    """Imprime mensagem informativa"""
    print(f"{Colors.YELLOW}[INFO] {text}{Colors.NC}")

def print_success(text: str):
    """Imprime mensagem de sucesso"""
    print(f"{Colors.GREEN}[OK] {text}{Colors.NC}")

def print_error(text: str):
    """Imprime mensagem de erro"""
    print(f"{Colors.RED}[ERRO] {text}{Colors.NC}")

def run_command(cmd: list, check: bool = True) -> tuple[bool, str]:
    """
    Executa comando shell e retorna (sucesso, output)
    
    Args:
        cmd: Lista com comando e argumentos
        check: Se True, lança exceção em caso de erro
        
    Returns:
        Tuple (sucesso, output)
    """
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=check
        )
        return True, result.stdout.strip()
    except subprocess.CalledProcessError as e:
        return False, e.stderr.strip()
    except FileNotFoundError:
        return False, "Comando não encontrado"

def check_azure_cli() -> bool:
    """Verifica se Azure CLI está instalado"""
    success, _ = run_command(["az", "--version"], check=False)
    if not success:
        print_error("Azure CLI não está instalado")
        print_info("Instale em: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli")
        return False
    return True

def check_azure_login() -> bool:
    """Verifica se está logado no Azure"""
    print_info("Verificando login no Azure...")
    success, output = run_command(["az", "account", "show", "--query", "name", "-o", "tsv"], check=False)
    
    if not success:
        print_info("Fazendo login no Azure...")
        login_success, _ = run_command(["az", "login"], check=False)
        if not login_success:
            print_error("Falha ao fazer login no Azure")
            return False
        # Tentar novamente após login
        success, output = run_command(["az", "account", "show", "--query", "name", "-o", "tsv"], check=False)
    
    if success and output:
        print_success(f"Logado como: {output}")
        return True
    else:
        print_error("Não foi possível verificar login")
        return False

def enable_managed_identity() -> Optional[str]:
    """Habilita Managed Identity (System Assigned) no App Service"""
    print_info(f"Habilitando Managed Identity no App Service '{WEB_APP_NAME}'...")
    
    # Verificar se já está habilitado
    success, identity_json = run_command([
        "az", "webapp", "identity", "show",
        "--name", WEB_APP_NAME,
        "--resource-group", RESOURCE_GROUP,
        "-o", "json"
    ], check=False)
    
    if success:
        try:
            identity = json.loads(identity_json)
            if identity.get("type") == "SystemAssigned" and identity.get("principalId"):
                print_success(f"Managed Identity já habilitado (Principal ID: {identity.get('principalId')})")
                return identity.get("principalId")
        except:
            pass
    
    # Habilitar Managed Identity
    success, identity_json = run_command([
        "az", "webapp", "identity", "assign",
        "--name", WEB_APP_NAME,
        "--resource-group", RESOURCE_GROUP,
        "-o", "json"
    ])
    
    if success:
        try:
            identity = json.loads(identity_json)
            principal_id = identity.get("principalId")
            if principal_id:
                print_success(f"Managed Identity habilitado (Principal ID: {principal_id})")
                return principal_id
        except Exception as e:
            print_error(f"Falha ao processar resposta: {e}")
            return None
    else:
        print_error("Falha ao habilitar Managed Identity")
        return None

def get_storage_account_id() -> Optional[str]:
    """Obtém o Resource ID do Storage Account"""
    print_info(f"Obtendo Resource ID do Storage Account '{STORAGE_ACCOUNT_NAME}'...")
    
    success, sa_json = run_command([
        "az", "storage", "account", "show",
        "--name", STORAGE_ACCOUNT_NAME,
        "--resource-group", RESOURCE_GROUP,
        "--query", "id",
        "-o", "tsv"
    ])
    
    if success and sa_json:
        print_success(f"Storage Account ID: {sa_json}")
        return sa_json.strip()
    else:
        print_error("Falha ao obter Storage Account ID")
        return None

def assign_role(principal_id: str, scope: str) -> bool:
    """Atribui role ao Service Principal"""
    print_info(f"Atribuindo role '{ROLE_NAME}' ao Managed Identity...")
    
    # Verificar se role já está atribuída
    success, assignments_json = run_command([
        "az", "role", "assignment", "list",
        "--assignee", principal_id,
        "--scope", scope,
        "--role", ROLE_NAME,
        "-o", "json"
    ], check=False)
    
    if success:
        try:
            assignments = json.loads(assignments_json)
            if assignments and len(assignments) > 0:
                print_success(f"Role '{ROLE_NAME}' já está atribuída")
                return True
        except:
            pass
    
    # Atribuir role
    success, output = run_command([
        "az", "role", "assignment", "create",
        "--assignee-object-id", principal_id,
        "--assignee-principal-type", "ServicePrincipal",
        "--role", ROLE_NAME,
        "--scope", scope
    ])
    
    if success:
        print_success(f"Role '{ROLE_NAME}' atribuída com sucesso")
        return True
    else:
        print_error(f"Falha ao atribuir role: {output}")
        return False

def verify_storage_account() -> bool:
    """Verifica se Storage Account existe"""
    print_info(f"Verificando Storage Account '{STORAGE_ACCOUNT_NAME}'...")
    
    success, _ = run_command([
        "az", "storage", "account", "show",
        "--name", STORAGE_ACCOUNT_NAME,
        "--resource-group", RESOURCE_GROUP
    ], check=False)
    
    if success:
        print_success(f"Storage Account '{STORAGE_ACCOUNT_NAME}' encontrado")
        return True
    else:
        print_error(f"Storage Account '{STORAGE_ACCOUNT_NAME}' não encontrado")
        print_info("Crie o Storage Account primeiro via Portal ou script configure_azure_files.py")
        return False

def verify_file_share() -> bool:
    """Verifica se File Share existe"""
    print_info(f"Verificando File Share '{FILE_SHARE_NAME}'...")
    
    # Obter chave temporária para verificação (não será usada no mount)
    success, storage_key = run_command([
        "az", "storage", "account", "keys", "list",
        "--resource-group", RESOURCE_GROUP,
        "--account-name", STORAGE_ACCOUNT_NAME,
        "--query", "[0].value",
        "-o", "tsv"
    ])
    
    if not success:
        print_error("Falha ao obter chave de acesso do Storage Account")
        return False
    
    # Verificar se File Share existe
    success, _ = run_command([
        "az", "storage", "share", "show",
        "--name", FILE_SHARE_NAME,
        "--account-name", STORAGE_ACCOUNT_NAME,
        "--account-key", storage_key
    ], check=False)
    
    if success:
        print_success(f"File Share '{FILE_SHARE_NAME}' encontrado")
        return True
    else:
        print_error(f"File Share '{FILE_SHARE_NAME}' não encontrado")
        print_info("Crie o File Share primeiro via Portal ou script configure_azure_files.py")
        return False

def configure_mount(principal_id: str) -> bool:
    """Configura montagem no Web App usando Managed Identity"""
    print_info("Configurando montagem no Web App com Managed Identity...")
    
    # Verificar se montagem já existe
    success, mounts_json = run_command([
        "az", "webapp", "config", "storage-account", "list",
        "--resource-group", RESOURCE_GROUP,
        "--name", WEB_APP_NAME,
        "-o", "json"
    ], check=False)
    
    mount_exists = False
    if success:
        try:
            mounts = json.loads(mounts_json)
            mount_exists = any(m.get("name") == MOUNT_NAME for m in mounts)
        except:
            pass
    
    if mount_exists:
        print_info(f"Montagem '{MOUNT_NAME}' já existe. Atualizando para usar Managed Identity...")
        cmd = [
            "az", "webapp", "config", "storage-account", "update",
            "--resource-group", RESOURCE_GROUP,
            "--name", WEB_APP_NAME,
            "--custom-id", MOUNT_NAME,
            "--storage-type", "AzureFiles",
            "--account-name", STORAGE_ACCOUNT_NAME,
            "--share-name", FILE_SHARE_NAME,
            "--access-key", "",  # Vazio para usar Managed Identity
            "--mount-path", MOUNT_PATH
        ]
    else:
        print_info("Criando nova montagem com Managed Identity...")
        cmd = [
            "az", "webapp", "config", "storage-account", "add",
            "--resource-group", RESOURCE_GROUP,
            "--name", WEB_APP_NAME,
            "--custom-id", MOUNT_NAME,
            "--storage-type", "AzureFiles",
            "--account-name", STORAGE_ACCOUNT_NAME,
            "--share-name", FILE_SHARE_NAME,
            "--mount-path", MOUNT_PATH
        ]
    
    # Nota: Azure CLI pode não suportar diretamente Managed Identity via CLI
    # Neste caso, precisamos usar o Portal ou API REST
    print_info("NOTA: Configuração de montagem com Managed Identity pode precisar ser feita via Portal Azure")
    print_info("Siga as instruções em docs/AZURE_FILES_MANAGED_IDENTITY.md")
    
    # Tentar configurar via CLI (pode falhar se não suportado)
    success, output = run_command(cmd, check=False)
    
    if success:
        print_success("Montagem configurada com sucesso")
        return True
    else:
        print_error(f"Falha ao configurar montagem via CLI: {output}")
        print_info("Configure a montagem manualmente via Portal Azure:")
        print_info(f"  - Name: {MOUNT_NAME}")
        print_info(f"  - Storage type: Azure Files")
        print_info(f"  - Storage account: {STORAGE_ACCOUNT_NAME}")
        print_info(f"  - File share: {FILE_SHARE_NAME}")
        print_info(f"  - Access type: Identity (System Assigned)")
        print_info(f"  - Mount path: {MOUNT_PATH}")
        return False

def configure_app_settings() -> bool:
    """Configura Application Settings necessárias"""
    print_info("Configurando Application Settings...")
    
    settings = {
        "SESSION_DATA_FILE": f"{MOUNT_PATH}/user_sessions.json",
        "WEBSITES_ENABLE_APP_SERVICE_STORAGE": "true"
    }
    
    for key, value in settings.items():
        print_info(f"Configurando {key}={value}...")
        success, output = run_command([
            "az", "webapp", "config", "appsettings", "set",
            "--name", WEB_APP_NAME,
            "--resource-group", RESOURCE_GROUP,
            "--settings", f"{key}={value}"
        ])
        
        if not success:
            print_error(f"Falha ao configurar {key}: {output}")
            return False
    
    print_success("Application Settings configuradas com sucesso")
    return True

def restart_app_service() -> bool:
    """Reinicia o App Service"""
    print_info("Reiniciando App Service...")
    
    success, output = run_command([
        "az", "webapp", "restart",
        "--name", WEB_APP_NAME,
        "--resource-group", RESOURCE_GROUP
    ])
    
    if success:
        print_success("App Service reiniciado com sucesso")
        return True
    else:
        print_error(f"Falha ao reiniciar App Service: {output}")
        return False

def main():
    """Função principal"""
    print_header("Configuração de Azure Files com Managed Identity - CaraCore")
    
    # Verificar pré-requisitos
    if not check_azure_cli():
        sys.exit(1)
    
    if not check_azure_login():
        sys.exit(1)
    
    print()
    
    # Passo 1: Verificar Storage Account e File Share
    if not verify_storage_account():
        sys.exit(1)
    print()
    
    if not verify_file_share():
        sys.exit(1)
    print()
    
    # Passo 2: Habilitar Managed Identity
    principal_id = enable_managed_identity()
    if not principal_id:
        sys.exit(1)
    print()
    
    # Passo 3: Obter Storage Account ID
    storage_account_id = get_storage_account_id()
    if not storage_account_id:
        sys.exit(1)
    print()
    
    # Passo 4: Atribuir Role
    if not assign_role(principal_id, storage_account_id):
        sys.exit(1)
    print()
    
    # Passo 5: Configurar montagem (pode precisar ser feito via Portal)
    configure_mount(principal_id)
    print()
    
    # Passo 6: Configurar Application Settings
    if not configure_app_settings():
        sys.exit(1)
    print()
    
    # Passo 7: Reiniciar App Service
    if not restart_app_service():
        sys.exit(1)
    print()
    
    # Mensagem final
    print_success("=" * 60)
    print_success("Configuração concluída com sucesso!")
    print_success("=" * 60)
    print()
    print_info("PRÓXIMOS PASSOS:")
    print("1. Se a montagem não foi configurada via CLI, configure via Portal Azure:")
    print("   - App Service > Configuration > Path mappings > + Add Azure Storage Mount")
    print("   - Access type: Identity (System Assigned)")
    print()
    print("2. Após configurar a montagem, reinicie o App Service novamente")
    print()
    print("3. Verifique os logs para confirmar:")
    print("   'Detectado ambiente Azure - usando /home/site/wwwroot/data para persistência'")
    print()
    print("4. Execute o script de validação:")
    print(f"   python scripts/validate_azure_files.py --app-name {WEB_APP_NAME} \\")
    print(f"     --resource-group {RESOURCE_GROUP} \\")
    print(f"     --storage-account {STORAGE_ACCOUNT_NAME} \\")
    print(f"     --share-name {FILE_SHARE_NAME} \\")
    print(f"     --mount-path {MOUNT_PATH}")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nOperação cancelada pelo usuário")
        sys.exit(1)
    except Exception as e:
        print_error(f"Erro inesperado: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


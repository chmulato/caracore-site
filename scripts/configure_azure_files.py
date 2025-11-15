#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script Python para configurar Azure Files para persistência de dados
Uso: python scripts/configure_azure_files.py
"""

import subprocess
import sys
import json
import os
from typing import Optional, Dict, Any

# Cores para output (ANSI)
class Colors:
    RED = '\033[0;31m'
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    CYAN = '\033[0;36m'
    NC = '\033[0m'  # No Color

# Variáveis de configuração (podem ser sobrescritas por variáveis de ambiente)
RESOURCE_GROUP = os.environ.get("AZ_RESOURCE_GROUP") or os.environ.get("AZURE_RESOURCE_GROUP", "rg-caracore")
STORAGE_ACCOUNT_NAME = os.environ.get("AZ_STORAGE_ACCOUNT") or os.environ.get("AZURE_STORAGE_ACCOUNT", "caracoredata")
FILE_SHARE_NAME = os.environ.get("AZ_SHARE_NAME") or os.environ.get("AZURE_STORAGE_SHARE_NAME", "caracore-data")
WEB_APP_NAME = os.environ.get("AZ_APP_NAME", "caracore-backend-docker")
MOUNT_PATH = os.environ.get("AZ_MOUNT_PATH") or os.environ.get("AZURE_STORAGE_MOUNT_PATH", "/home/data")
MOUNT_NAME = os.environ.get("AZ_MOUNT_ID") or os.environ.get("AZURE_STORAGE_MOUNT_ID", "data-storage")
STORAGE_ACCESS_KEY = os.environ.get("AZURE_STORAGE_ACCESS_KEY", "")

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

def create_storage_account() -> bool:
    """Cria Storage Account se não existir"""
    print_info(f"Verificando Storage Account '{STORAGE_ACCOUNT_NAME}'...")
    
    # Verificar se existe
    success, _ = run_command([
        "az", "storage", "account", "show",
        "--name", STORAGE_ACCOUNT_NAME,
        "--resource-group", RESOURCE_GROUP
    ], check=False)
    
    if success:
        print_success(f"Storage Account '{STORAGE_ACCOUNT_NAME}' já existe")
        return True
    
    # Criar Storage Account
    print_info(f"Criando Storage Account '{STORAGE_ACCOUNT_NAME}'...")
    success, output = run_command([
        "az", "storage", "account", "create",
        "--name", STORAGE_ACCOUNT_NAME,
        "--resource-group", RESOURCE_GROUP,
        "--location", "brazilsouth",
        "--sku", "Standard_LRS",
        "--kind", "StorageV2"
    ])
    
    if success:
        print_success("Storage Account criado com sucesso")
        return True
    else:
        print_error(f"Falha ao criar Storage Account: {output}")
        return False

def create_file_share() -> bool:
    """Cria File Share se não existir"""
    print_info(f"Verificando File Share '{FILE_SHARE_NAME}'...")
    
    # Obter chave de acesso
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
        print_success(f"File Share '{FILE_SHARE_NAME}' já existe")
        return True
    
    # Criar File Share
    print_info(f"Criando File Share '{FILE_SHARE_NAME}'...")
    success, output = run_command([
        "az", "storage", "share", "create",
        "--name", FILE_SHARE_NAME,
        "--account-name", STORAGE_ACCOUNT_NAME,
        "--account-key", storage_key,
        "--quota", "5"
    ])
    
    if success:
        print_success("File Share criado com sucesso")
        return True
    else:
        print_error(f"Falha ao criar File Share: {output}")
        return False

def configure_mount() -> bool:
    """Configura montagem no Web App"""
    print_info("Configurando montagem no Web App...")
    
    # Obter chave de acesso
    success, storage_key = run_command([
        "az", "storage", "account", "keys", "list",
        "--resource-group", RESOURCE_GROUP,
        "--account-name", STORAGE_ACCOUNT_NAME,
        "--query", "[0].value",
        "-o", "tsv"
    ])
    
    if not success:
        print_error("Falha ao obter chave de acesso")
        return False
    
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
        print_info(f"Montagem '{MOUNT_NAME}' já existe. Atualizando...")
        cmd = [
            "az", "webapp", "config", "storage-account", "update",
            "--resource-group", RESOURCE_GROUP,
            "--name", WEB_APP_NAME,
            "--custom-id", MOUNT_NAME,
            "--storage-type", "AzureFiles",
            "--account-name", STORAGE_ACCOUNT_NAME,
            "--share-name", FILE_SHARE_NAME,
            "--access-key", storage_key,
            "--mount-path", MOUNT_PATH
        ]
    else:
        print_info("Criando nova montagem...")
        cmd = [
            "az", "webapp", "config", "storage-account", "add",
            "--resource-group", RESOURCE_GROUP,
            "--name", WEB_APP_NAME,
            "--custom-id", MOUNT_NAME,
            "--storage-type", "AzureFiles",
            "--account-name", STORAGE_ACCOUNT_NAME,
            "--share-name", FILE_SHARE_NAME,
            "--access-key", storage_key,
            "--mount-path", MOUNT_PATH
        ]
    
    success, output = run_command(cmd)
    
    if success:
        print_success("Montagem configurada com sucesso")
        return True
    else:
        print_error(f"Falha ao configurar montagem: {output}")
        return False

def verify_configuration():
    """Verifica configuração final"""
    print_info("Verificando configuração...")
    success, output = run_command([
        "az", "webapp", "config", "storage-account", "list",
        "--resource-group", RESOURCE_GROUP,
        "--name", WEB_APP_NAME,
        "-o", "table"
    ])
    
    if success:
        print(output)
    else:
        print_error(f"Falha ao verificar configuração: {output}")

def main():
    """Função principal"""
    print_header("Configuração de Azure Files - CaraCore")
    
    # Verificar pré-requisitos
    if not check_azure_cli():
        sys.exit(1)
    
    if not check_azure_login():
        sys.exit(1)
    
    print()
    
    # Passo 1: Storage Account
    if not create_storage_account():
        sys.exit(1)
    print()
    
    # Passo 2: File Share
    if not create_file_share():
        sys.exit(1)
    print()
    
    # Passo 3: Configurar montagem
    if not configure_mount():
        sys.exit(1)
    print()
    
    # Passo 4: Verificar
    verify_configuration()
    print()
    
    # Mensagem final
    print_success("=" * 60)
    print_success("Configuração concluída com sucesso!")
    print_success("=" * 60)
    print()
    print_info("IMPORTANTE:")
    print("1. O Web App será reiniciado automaticamente")
    print("2. Após o reinício, verifique os logs para confirmar:")
    print("   'Detectado ambiente Azure - usando /home/data para persistência'")
    print("3. Se houver dados existentes, execute o script de migração:")
    print("   python backend/migrate_to_persistent_storage.py")

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


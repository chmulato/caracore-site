#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script Python para verificar se o armazenamento persistente está funcionando
Uso: python scripts/verify_persistent_storage.py
"""

import subprocess
import sys
import json
from typing import Optional, Tuple

# Cores para output (ANSI)
class Colors:
    RED = '\033[0;31m'
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    CYAN = '\033[0;36m'
    NC = '\033[0m'  # No Color

# Variáveis de configuração
RESOURCE_GROUP = "rg-caracore"
WEB_APP_NAME = "caracore-backend-docker"
MOUNT_PATH = "/home/data"
MOUNT_NAME = "data-storage"

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

def print_warning(text: str):
    """Imprime mensagem de aviso"""
    print(f"{Colors.YELLOW}[AVISO] {text}{Colors.NC}")

def run_command(cmd: list, check: bool = False) -> Tuple[bool, str]:
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

def check_mount_configuration() -> bool:
    """Verifica configuração de montagem"""
    print_info("[1] Verificando configuração de montagem...")
    
    success, mounts_json = run_command([
        "az", "webapp", "config", "storage-account", "list",
        "--resource-group", RESOURCE_GROUP,
        "--name", WEB_APP_NAME,
        "-o", "json"
    ])
    
    if not success:
        print_error("Falha ao verificar configuração de montagem")
        return False
    
    try:
        mounts = json.loads(mounts_json)
        data_mount = next((m for m in mounts if m.get("mountPath") == MOUNT_PATH), None)
        
        if data_mount:
            print_success(f"Montagem {MOUNT_PATH} configurada")
            print(f"  Name: {data_mount.get('name')}")
            print(f"  Storage Type: {data_mount.get('type')}")
            print(f"  Account Name: {data_mount.get('accountName')}")
            print(f"  Share Name: {data_mount.get('shareName')}")
            return True
        else:
            print_error(f"Montagem {MOUNT_PATH} não encontrada")
            print_info("Execute: python scripts/configure_azure_files.py")
            return False
    except json.JSONDecodeError:
        print_error("Falha ao decodificar resposta JSON")
        return False
    except Exception as e:
        print_error(f"Erro ao verificar montagem: {e}")
        return False

def check_logs() -> bool:
    """Verifica logs recentes"""
    print()
    print_info("[2] Verificando logs recentes...")
    print("Buscando mensagem: 'Detectado ambiente Azure - usando /home/data'")
    print()
    
    try:
        # Tentar obter logs (pode falhar se não houver logs disponíveis)
        success, logs = run_command([
            "az", "webapp", "log", "tail",
            "--resource-group", RESOURCE_GROUP,
            "--name", WEB_APP_NAME,
            "-o", "tsv"
        ], check=False)
        
        if success and logs:
            # Procurar por mensagem específica
            if "Detectado ambiente Azure - usando /home/data" in logs or "home/data" in logs:
                print_success("Logs confirmam uso de /home/data")
                # Mostrar linhas relevantes
                relevant_lines = [line for line in logs.split('\n') if 'home/data' in line.lower()][:5]
                for line in relevant_lines:
                    print(f"  {line}")
                return True
            else:
                print_warning("Mensagem não encontrada nos logs recentes")
                print("Isso pode significar:")
                print("  - O Web App ainda não foi reiniciado após a configuração")
                print("  - Os logs ainda não foram atualizados")
                print()
                print_info("Verifique manualmente:")
                print(f"  az webapp log tail --resource-group {RESOURCE_GROUP} --name {WEB_APP_NAME}")
                return False
        else:
            print_warning("Não foi possível obter logs")
            print_info("Verifique manualmente no Azure Portal")
            return False
    except Exception as e:
        print_warning(f"Erro ao verificar logs: {e}")
        return False

def print_ssh_instructions():
    """Imprime instruções para verificação via SSH"""
    print()
    print_info("[3] Verificando via SSH (opcional)...")
    print("Para verificar manualmente via SSH:")
    print(f"  1. Azure Portal > App Services > {WEB_APP_NAME} > SSH")
    print(f"  2. Execute: ls -la {MOUNT_PATH}/")
    print(f"  3. Execute: cat {MOUNT_PATH}/authorized_users.json")

def main():
    """Função principal"""
    print_header("Verificação de Armazenamento Persistente")
    
    # Verificar Azure CLI
    success, _ = run_command(["az", "--version"], check=False)
    if not success:
        print_error("Azure CLI não está instalado")
        sys.exit(1)
    
    # Verificar login
    success, _ = run_command(["az", "account", "show"], check=False)
    if not success:
        print_error("Não está logado no Azure. Execute: az login")
        sys.exit(1)
    
    # Verificar montagem
    mount_ok = check_mount_configuration()
    
    # Verificar logs
    logs_ok = check_logs()
    
    # Instruções SSH
    print_ssh_instructions()
    
    print()
    print_success("=" * 60)
    print_success("Verificação concluída")
    print_success("=" * 60)
    
    # Resumo
    if mount_ok and logs_ok:
        print()
        print_success("✅ Tudo configurado corretamente!")
    elif mount_ok:
        print()
        print_warning("⚠️ Montagem configurada, mas logs ainda não confirmam")
        print_info("Aguarde alguns minutos e verifique novamente")
    else:
        print()
        print_error("❌ Configuração incompleta")
        print_info("Execute: python scripts/configure_azure_files.py")

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


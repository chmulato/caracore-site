#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script Python para configurar e atualizar variáveis de ambiente no Azure App Service

Uso:
    # Modo interativo
    python scripts/configure_app_settings.py

    # Carregar de arquivo
    python scripts/configure_app_settings.py --file secrets.txt

    # Adicionar/atualizar variável específica
    python scripts/configure_app_settings.py --set KEY=value

    # Remover variável
    python scripts/configure_app_settings.py --remove KEY

    # Listar variáveis
    python scripts/configure_app_settings.py --list

    # Aplicar múltiplas variáveis
    python scripts/configure_app_settings.py --set KEY1=value1 KEY2=value2
"""

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path
from typing import Dict, List, Optional, Tuple

# Cores para output (ANSI)
class Colors:
    RED = '\033[0;31m'
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    CYAN = '\033[0;36m'
    BLUE = '\033[0;34m'
    NC = '\033[0m'  # No Color

# Variáveis de configuração (podem ser sobrescritas por variáveis de ambiente)
RESOURCE_GROUP = os.environ.get("AZ_RESOURCE_GROUP") or os.environ.get("AZURE_RESOURCE_GROUP", "rg-caracore")
WEB_APP_NAME = os.environ.get("AZ_APP_NAME", "caracore-backend-docker")

# Lista de variáveis sensíveis (não exibir valores completos)
SENSITIVE_VARS = [
    "PASSWORD", "SECRET", "KEY", "TOKEN", "CREDENTIAL", "AUTH",
    "AZURE_STORAGE_ACCESS_KEY", "GOOGLE_CLIENT_SECRET", "AZURE_CLIENT_SECRET",
    "MICROSOFT_CLIENT_SECRET", "JWT_SECRET_KEY", "APP_SECRET_KEY",
    "TOKEN_ENCRYPTION_KEY", "SESSION_SECRET_KEY", "SUPER_ADMIN_PASSWORD_HASH"
]

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

def print_value(key: str, value: str):
    """Imprime chave e valor (mascarando valores sensíveis)"""
    if any(sensitive in key.upper() for sensitive in SENSITIVE_VARS):
        masked = value[:4] + "*" * (len(value) - 8) + value[-4:] if len(value) > 8 else "****"
        print(f"  {Colors.BLUE}{key}{Colors.NC} = {masked}")
    else:
        print(f"  {Colors.BLUE}{key}{Colors.NC} = {value}")

def check_azure_cli() -> bool:
    """Verifica se Azure CLI está instalado"""
    try:
        subprocess.run(["az", "--version"], capture_output=True, check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print_error("Azure CLI não está instalado")
        print_info("Instale em: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli")
        return False

def check_azure_login() -> bool:
    """Verifica se está logado no Azure"""
    try:
        result = subprocess.run(
            ["az", "account", "show", "--query", "name", "-o", "tsv"],
            capture_output=True,
            text=True,
            check=True
        )
        if result.stdout.strip():
            print_success(f"Logado como: {result.stdout.strip()}")
            return True
    except subprocess.CalledProcessError:
        pass
    
    print_error("Não está logado no Azure")
    print_info("Execute: az login")
    return False

def verify_app_service(app_name: str = None, resource_group: str = None) -> bool:
    """Verifica se o App Service existe"""
    app = app_name or WEB_APP_NAME
    rg = resource_group or RESOURCE_GROUP
    try:
        subprocess.run(
            ["az", "webapp", "show", "--name", app, "--resource-group", rg],
            capture_output=True,
            check=True
        )
        return True
    except subprocess.CalledProcessError:
        print_error(f"App Service '{app}' não encontrado no Resource Group '{rg}'")
        return False

def load_env_file(file_path: str) -> Dict[str, str]:
    """Carrega variáveis de um arquivo .env ou secrets.txt"""
    env_vars = {}
    file = Path(file_path)
    
    if not file.exists():
        print_error(f"Arquivo não encontrado: {file_path}")
        return env_vars
    
    print_info(f"Carregando variáveis de: {file_path}")
    
    with open(file, 'r', encoding='utf-8') as f:
        for line_num, line in enumerate(f, 1):
            line = line.strip()
            
            # Ignorar linhas vazias e comentários
            if not line or line.startswith('#'):
                continue
            
            # Ignorar seções de comentário
            if line.startswith('===') or line.startswith('---'):
                continue
            
            # Parse KEY=VALUE
            if '=' in line:
                key, value = line.split('=', 1)
                key = key.strip()
                value = value.strip()
                
                # Remover aspas se presentes
                if value.startswith('"') and value.endswith('"'):
                    value = value[1:-1]
                elif value.startswith("'") and value.endswith("'"):
                    value = value[1:-1]
                
                # Ignorar valores vazios ou placeholders
                if value and not value.startswith('your_') and value != '':
                    env_vars[key] = value
                elif value == '':
                    env_vars[key] = ''  # Permitir valores vazios explicitamente
    
    print_success(f"Carregadas {len(env_vars)} variáveis do arquivo")
    return env_vars

def get_current_settings(app_name: str = None, resource_group: str = None) -> Dict[str, str]:
    """Obtém configurações atuais do App Service"""
    app = app_name or WEB_APP_NAME
    rg = resource_group or RESOURCE_GROUP
    try:
        result = subprocess.run(
            ["az", "webapp", "config", "appsettings", "list",
             "--name", app,
             "--resource-group", rg,
             "-o", "json"],
            capture_output=True,
            text=True,
            check=True
        )
        settings = json.loads(result.stdout)
        return {s["name"]: s.get("value", "") for s in settings}
    except (subprocess.CalledProcessError, json.JSONDecodeError) as e:
        print_error(f"Falha ao obter configurações: {e}")
        return {}

def set_settings(settings: Dict[str, str], dry_run: bool = False, app_name: str = None, resource_group: str = None) -> Tuple[bool, str]:
    """Configura variáveis no App Service"""
    if not settings:
        return False, "Nenhuma variável para configurar"
    
    app = app_name or WEB_APP_NAME
    rg = resource_group or RESOURCE_GROUP
    
    # Construir string de settings
    settings_list = [f"{k}={v}" for k, v in settings.items()]
    settings_string = " ".join(settings_list)
    
    if dry_run:
        print_info("DRY RUN - Variáveis que seriam configuradas:")
        for key, value in settings.items():
            print_value(key, value)
        return True, "Dry run concluído"
    
    try:
        result = subprocess.run(
            ["az", "webapp", "config", "appsettings", "set",
             "--name", app,
             "--resource-group", rg,
             "--settings", settings_string],
            capture_output=True,
            text=True,
            check=True,
            timeout=30
        )
        return True, "Configurações aplicadas com sucesso"
    except subprocess.TimeoutExpired:
        return False, "Timeout ao executar comando Azure CLI"
    except subprocess.CalledProcessError as e:
        return False, f"Erro: {e.stderr}"

def remove_settings(keys: List[str], dry_run: bool = False, app_name: str = None, resource_group: str = None) -> Tuple[bool, str]:
    """Remove variáveis do App Service"""
    if not keys:
        return False, "Nenhuma variável para remover"
    
    app = app_name or WEB_APP_NAME
    rg = resource_group or RESOURCE_GROUP
    
    if dry_run:
        print_info("DRY RUN - Variáveis que seriam removidas:")
        for key in keys:
            print(f"  {Colors.RED}{key}{Colors.NC}")
        return True, "Dry run concluído"
    
    try:
        # Azure CLI requer que passemos todas as settings exceto as que queremos remover
        current = get_current_settings(app, rg)
        remaining = {k: v for k, v in current.items() if k not in keys}
        
        if remaining:
            settings_list = [f"{k}={v}" for k, v in remaining.items()]
            settings_string = " ".join(settings_list)
            
            subprocess.run(
                ["az", "webapp", "config", "appsettings", "set",
                 "--name", app,
                 "--resource-group", rg,
                 "--settings", settings_string],
                capture_output=True,
                text=True,
                check=True,
                timeout=30
            )
        else:
            # Se não há settings restantes, remova todas
            for key in keys:
                subprocess.run(
                    ["az", "webapp", "config", "appsettings", "delete",
                     "--name", app,
                     "--resource-group", rg,
                     "--setting-names", key],
                    capture_output=True,
                    text=True,
                    check=False
                )
        
        return True, f"Variáveis removidas: {', '.join(keys)}"
    except subprocess.TimeoutExpired:
        return False, "Timeout ao executar comando Azure CLI"
    except subprocess.CalledProcessError as e:
        return False, f"Erro: {e.stderr}"

def list_settings(filter_pattern: Optional[str] = None, app_name: str = None, resource_group: str = None):
    """Lista configurações do App Service"""
    app = app_name or WEB_APP_NAME
    settings = get_current_settings(app, resource_group)
    
    if not settings:
        print_info("Nenhuma variável configurada")
        return
    
    print_header(f"Variáveis de Ambiente - {app}")
    print(f"Total: {len(settings)} variáveis\n")
    
    # Filtrar se necessário
    if filter_pattern:
        settings = {k: v for k, v in settings.items() if filter_pattern.lower() in k.lower()}
        print_info(f"Filtrado por: '{filter_pattern}' ({len(settings)} variáveis)\n")
    
    # Ordenar por nome
    for key in sorted(settings.keys()):
        print_value(key, settings[key])
    
    print()

def parse_key_value(key_value: str) -> Tuple[str, str]:
    """Parse KEY=VALUE"""
    if '=' not in key_value:
        raise ValueError(f"Formato inválido: {key_value}. Use KEY=VALUE")
    
    key, value = key_value.split('=', 1)
    return key.strip(), value.strip()

def interactive_mode(app_name: str = None, resource_group: str = None):
    """Modo interativo para configurar variáveis"""
    app = app_name or WEB_APP_NAME
    print_header(f"Configuração Interativa de Variáveis de Ambiente - {app}")
    
    settings = {}
    
    while True:
        print("\nOpções:")
        print("1. Adicionar/Atualizar variável")
        print("2. Carregar de arquivo")
        print("3. Ver variáveis atuais")
        print("4. Aplicar configurações")
        print("5. Sair")
        
        choice = input("\nEscolha uma opção (1-5): ").strip()
        
        if choice == '1':
            key = input("Nome da variável: ").strip()
            if key:
                value = input(f"Valor para {key}: ").strip()
                settings[key] = value
                print_success(f"Variável '{key}' adicionada à lista")
        
        elif choice == '2':
            file_path = input("Caminho do arquivo (secrets.txt, .env, etc): ").strip()
            if file_path:
                loaded = load_env_file(file_path)
                settings.update(loaded)
                print_success(f"Variáveis carregadas. Total: {len(settings)}")
        
        elif choice == '3':
            print("\nVariáveis na lista de configuração:")
            for key, value in settings.items():
                print_value(key, value)
            
            print("\nVariáveis atuais no App Service:")
            list_settings(None, app_name, resource_group)
        
        elif choice == '4':
            if not settings:
                print_error("Nenhuma variável para aplicar")
                continue
            
            print("\nVariáveis que serão aplicadas:")
            for key, value in settings.items():
                print_value(key, value)
            
            confirm = input("\nAplicar estas configurações? (s/N): ").strip().lower()
            if confirm == 's':
                success, message = set_settings(settings, app_name=app_name, resource_group=resource_group)
                if success:
                    print_success(message)
                    settings = {}  # Limpar após aplicar
                else:
                    print_error(message)
        
        elif choice == '5':
            if settings:
                confirm = input("\nHá variáveis não aplicadas. Deseja sair mesmo assim? (s/N): ").strip().lower()
                if confirm != 's':
                    continue
            break
        
        else:
            print_error("Opção inválida")

def main():
    """Função principal"""
    parser = argparse.ArgumentParser(
        description="Configurar e atualizar variáveis de ambiente no Azure App Service",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos:
  # Modo interativo
  python scripts/configure_app_settings.py

  # Carregar de arquivo
  python scripts/configure_app_settings.py --file secrets.txt

  # Adicionar/atualizar variável
  python scripts/configure_app_settings.py --set KEY=value

  # Remover variável
  python scripts/configure_app_settings.py --remove KEY

  # Listar variáveis
  python scripts/configure_app_settings.py --list

  # Listar variáveis filtradas
  python scripts/configure_app_settings.py --list --filter STORAGE

  # Aplicar múltiplas variáveis
  python scripts/configure_app_settings.py --set KEY1=value1 KEY2=value2

  # Dry run (simular sem aplicar)
  python scripts/configure_app_settings.py --file secrets.txt --dry-run
        """
    )
    
    parser.add_argument('--file', '-f', help='Carregar variáveis de arquivo (.env, secrets.txt, etc)')
    parser.add_argument('--set', '-s', nargs='+', help='Variáveis no formato KEY=VALUE (pode especificar múltiplas)')
    parser.add_argument('--remove', '-r', nargs='+', help='Nomes das variáveis para remover')
    parser.add_argument('--list', '-l', action='store_true', help='Listar variáveis configuradas')
    parser.add_argument('--filter', help='Filtrar variáveis ao listar (busca no nome)')
    parser.add_argument('--app-name', help=f'Nome do App Service (padrão: {WEB_APP_NAME})')
    parser.add_argument('--resource-group', help=f'Resource Group (padrão: {RESOURCE_GROUP})')
    parser.add_argument('--dry-run', action='store_true', help='Simular sem aplicar mudanças')
    
    args = parser.parse_args()
    
    # Atualizar variáveis se fornecidas
    app_name = args.app_name if args.app_name else WEB_APP_NAME
    resource_group = args.resource_group if args.resource_group else RESOURCE_GROUP
    
    # Verificar pré-requisitos
    if not check_azure_cli():
        sys.exit(1)
    
    if not check_azure_login():
        sys.exit(1)
    
    if not verify_app_service(app_name, resource_group):
        sys.exit(1)
    
    # Processar comandos
    if args.list:
        list_settings(args.filter, app_name, resource_group)
    
    elif args.remove:
        success, message = remove_settings(args.remove, dry_run=args.dry_run, app_name=app_name, resource_group=resource_group)
        if success:
            print_success(message)
        else:
            print_error(message)
            sys.exit(1)
    
    elif args.set:
        settings = {}
        for kv in args.set:
            try:
                key, value = parse_key_value(kv)
                settings[key] = value
            except ValueError as e:
                print_error(str(e))
                sys.exit(1)
        
        success, message = set_settings(settings, dry_run=args.dry_run, app_name=app_name, resource_group=resource_group)
        if success:
            print_success(message)
        else:
            print_error(message)
            sys.exit(1)
    
    elif args.file:
        settings = load_env_file(args.file)
        if settings:
            success, message = set_settings(settings, dry_run=args.dry_run, app_name=app_name, resource_group=resource_group)
            if success:
                print_success(message)
            else:
                print_error(message)
                sys.exit(1)
        else:
            print_error("Nenhuma variável válida encontrada no arquivo")
            sys.exit(1)
    
    else:
        # Modo interativo
        interactive_mode(app_name, resource_group)

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


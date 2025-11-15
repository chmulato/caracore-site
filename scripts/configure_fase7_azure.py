#!/usr/bin/env python3
"""
Script para configurar variáveis de ambiente da Fase 7 no Azure App Service
Uso: python scripts/configure_fase7_azure.py
"""

import subprocess
import sys
import getpass
from pathlib import Path

# Configurações
APP_NAME = "caracore-backend-docker"
RESOURCE_GROUP = "rg-caracore"

# Cores para output (ANSI)
class Colors:
    RED = '\033[0;31m'
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    BLUE = '\033[0;34m'
    NC = '\033[0m'  # No Color

def print_color(text, color=Colors.NC):
    """Imprime texto colorido"""
    print(f"{color}{text}{Colors.NC}")

def check_azure_cli():
    """Verifica se Azure CLI está instalado"""
    import platform
    import shutil
    
    # Verificar se comando 'az' está disponível
    az_path = shutil.which("az")
    if az_path:
        try:
            result = subprocess.run(
                ["az", "--version"],
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode == 0:
                return True, az_path
        except (subprocess.TimeoutExpired, Exception):
            pass
    
    # Tentar caminhos comuns no Windows
    if platform.system() == "Windows":
        common_paths = [
            r"C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin\az.cmd",
            r"C:\Program Files (x86)\Microsoft SDKs\Azure\CLI2\wbin\az.cmd",
        ]
        for path in common_paths:
            if Path(path).exists():
                try:
                    result = subprocess.run(
                        [path, "--version"],
                        capture_output=True,
                        text=True,
                        timeout=5
                    )
                    if result.returncode == 0:
                        return True, path
                except (subprocess.TimeoutExpired, Exception):
                    pass
    
    return False, None

def check_azure_login(az_path=None):
    """Verifica se está logado no Azure"""
    az_cmd = az_path if az_path and Path(az_path).exists() else "az"
    try:
        result = subprocess.run(
            [az_cmd, "account", "show"],
            capture_output=True,
            text=True,
            timeout=10
        )
        return result.returncode == 0
    except Exception:
        return False

def check_app_service(az_path=None):
    """Verifica se App Service existe"""
    az_cmd = az_path if az_path and Path(az_path).exists() else "az"
    try:
        result = subprocess.run(
            [az_cmd, "webapp", "show",
             "--name", APP_NAME,
             "--resource-group", RESOURCE_GROUP],
            capture_output=True,
            text=True,
            timeout=10
        )
        return result.returncode == 0
    except Exception:
        return False

def read_value(description, default_value=None, is_secret=False):
    """Lê valor do usuário"""
    print_color(f"\n{description}", Colors.YELLOW)
    
    if default_value:
        prompt = f"  Valor [default: {default_value}]: "
    else:
        prompt = "  Valor: "
    
    if is_secret:
        value = getpass.getpass(prompt)
    else:
        value = input(prompt).strip()
    
    if not value and default_value:
        return default_value
    return value

def generate_encryption_key():
    """Gera chave de criptografia"""
    print_color("\nGerando chave de criptografia...", Colors.BLUE)
    
    try:
        # Importar módulos necessários
        import secrets
        import base64
        
        key_bytes = secrets.token_bytes(32)
        key_base64 = base64.b64encode(key_bytes).decode('utf-8')
        
        print_color(f"[OK] Chave gerada: {key_base64[:40]}...", Colors.GREEN)
        return key_base64
    except Exception as e:
        print_color(f"[ERRO] Erro ao gerar chave: {e}", Colors.RED)
        return None

def show_configuration_values():
    """Mostra valores para configuração manual"""
    import platform
    
    print_color("\n" + "=" * 50, Colors.BLUE)
    print_color("Valores para Configuração Manual", Colors.BLUE)
    print_color("=" * 50, Colors.BLUE)
    print()
    
    # Gerar TOKEN_ENCRYPTION_KEY se não tiver
    print("1. Gerando TOKEN_ENCRYPTION_KEY...")
    token_key = generate_encryption_key()
    if not token_key:
        print_color("[AVISO] Não foi possível gerar chave automaticamente", Colors.YELLOW)
        print("Execute: python scripts/generate_encryption_keys.py")
        token_key = "<cole_a_chave_gerada_aqui>"
    
    print()
    print("2. Configure estas variáveis:")
    print()
    
    if platform.system() == "Windows":
        print("Via PowerShell (se Azure CLI estiver instalado):")
        print("```powershell")
        print(f'az webapp config appsettings set `')
        print(f'  --name {APP_NAME} `')
        print(f'  --resource-group {RESOURCE_GROUP} `')
        print(f'  --settings `')
        print(f'    TOKEN_ENCRYPTION_KEY="{token_key}" `')
        print(f'    SESSION_TIMEOUT_HOURS="24" `')
        print(f'    MAX_SESSIONS_PER_USER="5" `')
        print(f'    CLEANUP_INTERVAL_HOURS="6" `')
        print(f'    AUDIT_LOG_RETENTION_DAYS="90"')
        print("```")
    else:
        print("Via Azure CLI:")
        print("```bash")
        print(f'az webapp config appsettings set \\')
        print(f'  --name {APP_NAME} \\')
        print(f'  --resource-group {RESOURCE_GROUP} \\')
        print(f'  --settings \\')
        print(f'    TOKEN_ENCRYPTION_KEY="{token_key}" \\')
        print(f'    SESSION_TIMEOUT_HOURS="24" \\')
        print(f'    MAX_SESSIONS_PER_USER="5" \\')
        print(f'    CLEANUP_INTERVAL_HOURS="6" \\')
        print(f'    AUDIT_LOG_RETENTION_DAYS="90"')
        print("```")
    
    print()
    print("Ou via Azure Portal:")
    print("  https://portal.azure.com")
    print("  App Services > caracore-backend-docker > Configuration > Application settings")
    print()
    print("Variáveis a configurar:")
    print(f"  TOKEN_ENCRYPTION_KEY = {token_key}")
    print("  SESSION_TIMEOUT_HOURS = 24")
    print("  MAX_SESSIONS_PER_USER = 5")
    print("  CLEANUP_INTERVAL_HOURS = 6")
    print("  AUDIT_LOG_RETENTION_DAYS = 90")

def configure_azure_settings(settings_dict, az_path=None):
    """Configura variáveis no Azure App Service"""
    print_color("\nConfigurando variáveis no Azure...", Colors.YELLOW)
    
    # Construir comando
    settings_list = [f"{k}=\"{v}\"" for k, v in settings_dict.items() if v]
    settings_string = " ".join(settings_list)
    
    # Usar caminho específico se fornecido, senão usar 'az' do PATH
    az_cmd = az_path if az_path and Path(az_path).exists() else "az"
    
    cmd = [
        az_cmd, "webapp", "config", "appsettings", "set",
        "--name", APP_NAME,
        "--resource-group", RESOURCE_GROUP,
        "--settings", settings_string
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True, timeout=30)
        return True, result.stdout
    except subprocess.TimeoutExpired:
        return False, "Timeout ao executar comando Azure CLI"
    except subprocess.CalledProcessError as e:
        return False, e.stderr
    except Exception as e:
        return False, str(e)

def verify_settings(az_path=None):
    """Verifica variáveis configuradas"""
    print_color("\nVerificando configuração...", Colors.YELLOW)
    
    az_cmd = az_path if az_path and Path(az_path).exists() else "az"
    
    cmd = [
        az_cmd, "webapp", "config", "appsettings", "list",
        "--name", APP_NAME,
        "--resource-group", RESOURCE_GROUP,
        "--query", "[?contains(name, 'TOKEN') || contains(name, 'SESSION') || contains(name, 'CLEANUP') || contains(name, 'AUDIT')].{Nome:name, Valor:value}",
        "--output", "table"
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True, timeout=30)
        print(result.stdout)
        return True
    except subprocess.TimeoutExpired:
        print_color("[AVISO] Timeout ao verificar configuração", Colors.YELLOW)
        return False
    except subprocess.CalledProcessError as e:
        print_color(f"[AVISO] Não foi possível verificar: {e.stderr}", Colors.YELLOW)
        return False

def main():
    """Função principal"""
    print_color("=" * 50, Colors.GREEN)
    print_color("Configuração Fase 7 - Azure App Service", Colors.GREEN)
    print_color("=" * 50, Colors.GREEN)
    print()
    
    # Verificar Azure CLI
    print_color("Verificando Azure CLI...", Colors.YELLOW)
    cli_available, az_path = check_azure_cli()
    if not cli_available:
        print_color("[ERRO] Azure CLI não encontrado!", Colors.RED)
        print()
        print("Opções:")
        print("1. Instalar Azure CLI:")
        print("   https://docs.microsoft.com/cli/azure/install-azure-cli")
        print()
        print("2. Ou usar Azure Portal:")
        print("   https://portal.azure.com")
        print("   App Services > caracore-backend-docker > Configuration > Application settings")
        print()
        print("3. Ou configurar manualmente via PowerShell:")
        print("   Ver documentação: docs/fases/fase-7/CONFIGURAR_AZURE.md")
        print()
        
        # Oferecer continuar sem Azure CLI (apenas mostrar valores)
        continue_anyway = input("Deseja ver apenas os valores a configurar? (s/N): ").strip().lower()
        if continue_anyway in ['s', 'sim', 'y', 'yes']:
            show_configuration_values()
        sys.exit(1)
    
    if az_path:
        print_color(f"[OK] Azure CLI encontrado: {az_path}", Colors.GREEN)
    else:
        print_color("[OK] Azure CLI encontrado", Colors.GREEN)
    
    # Verificar login
    print_color("\nVerificando login no Azure...", Colors.YELLOW)
    if not check_azure_login(az_path):
        print_color("[ERRO] Não está logado no Azure!", Colors.RED)
        if az_path:
            print(f"Execute: {az_path} login")
        else:
            print("Execute: az login")
        sys.exit(1)
    print_color("[OK] Logado no Azure", Colors.GREEN)
    
    # Verificar App Service
    print_color("\nVerificando App Service...", Colors.YELLOW)
    if not check_app_service(az_path):
        print_color(f"[ERRO] App Service não encontrado: {APP_NAME}", Colors.RED)
        print(f"Resource Group: {RESOURCE_GROUP}")
        print()
        print("Verifique:")
        print("  1. Nome do App Service está correto?")
        print("  2. Resource Group está correto?")
        print("  3. Você tem permissões para acessar?")
        sys.exit(1)
    print_color("[OK] App Service encontrado", Colors.GREEN)
    
    # Coletar valores
    print_color("\n" + "=" * 50, Colors.BLUE)
    print_color("Coletando Valores", Colors.BLUE)
    print_color("=" * 50, Colors.BLUE)
    
    settings = {}
    
    # TOKEN_ENCRYPTION_KEY (obrigatório)
    print_color("\n1. TOKEN_ENCRYPTION_KEY (OBRIGATÓRIO)", Colors.YELLOW)
    print("   Gere com: python scripts/generate_encryption_keys.py")
    print("   Ou deixe vazio para gerar automaticamente agora")
    
    token_key = read_value(
        "   Valor (ou Enter para gerar automaticamente):",
        is_secret=True
    )
    
    if not token_key:
        token_key = generate_encryption_key()
        if not token_key:
            print_color("[ERRO] Não foi possível gerar chave", Colors.RED)
            sys.exit(1)
    
    settings["TOKEN_ENCRYPTION_KEY"] = token_key
    
    # SESSION_SECRET_KEY (opcional)
    print_color("\n2. SESSION_SECRET_KEY (Opcional - não usado ainda)", Colors.YELLOW)
    session_secret = read_value("   Valor (ou Enter para pular):", is_secret=True)
    if session_secret:
        settings["SESSION_SECRET_KEY"] = session_secret
    
    # Configurações opcionais
    print_color("\n3. Configurações Opcionais", Colors.YELLOW)
    print("   (Pressione Enter para usar valores padrão)")
    
    settings["SESSION_TIMEOUT_HOURS"] = read_value(
        "   SESSION_TIMEOUT_HOURS (horas):",
        default_value="24"
    )
    
    settings["MAX_SESSIONS_PER_USER"] = read_value(
        "   MAX_SESSIONS_PER_USER:",
        default_value="5"
    )
    
    settings["CLEANUP_INTERVAL_HOURS"] = read_value(
        "   CLEANUP_INTERVAL_HOURS:",
        default_value="6"
    )
    
    settings["AUDIT_LOG_RETENTION_DAYS"] = read_value(
        "   AUDIT_LOG_RETENTION_DAYS:",
        default_value="90"
    )
    
    audit_path = read_value(
        "   AUDIT_LOG_PATH (opcional):",
        default_value="backend/logs/token_audit.log"
    )
    if audit_path:
        settings["AUDIT_LOG_PATH"] = audit_path
    
    # Resumo
    print_color("\n" + "=" * 50, Colors.GREEN)
    print_color("Resumo da Configuração", Colors.GREEN)
    print_color("=" * 50, Colors.GREEN)
    print(f"  TOKEN_ENCRYPTION_KEY: ***configurado***")
    if "SESSION_SECRET_KEY" in settings:
        print(f"  SESSION_SECRET_KEY: ***configurado***")
    print(f"  SESSION_TIMEOUT_HOURS: {settings['SESSION_TIMEOUT_HOURS']}")
    print(f"  MAX_SESSIONS_PER_USER: {settings['MAX_SESSIONS_PER_USER']}")
    print(f"  CLEANUP_INTERVAL_HOURS: {settings['CLEANUP_INTERVAL_HOURS']}")
    print(f"  AUDIT_LOG_RETENTION_DAYS: {settings['AUDIT_LOG_RETENTION_DAYS']}")
    if "AUDIT_LOG_PATH" in settings:
        print(f"  AUDIT_LOG_PATH: {settings['AUDIT_LOG_PATH']}")
    print()
    
    # Confirmação
    confirm = input("Deseja continuar? (s/N): ").strip().lower()
    if confirm not in ['s', 'sim', 'y', 'yes']:
        print_color("Cancelado.", Colors.YELLOW)
        sys.exit(0)
    
    # Configurar
    success, output = configure_azure_settings(settings, az_path)
    
    if success:
        print_color("\n[OK] Variáveis configuradas com sucesso!", Colors.GREEN)
        
        # Verificar
        verify_settings(az_path)
        
        print_color("\n[OK] Configuração concluída!", Colors.GREEN)
        print_color("\nPróximos passos:", Colors.YELLOW)
        print(f"  1. Reinicie o App Service:")
        if az_path:
            print(f"     {az_path} webapp restart --name {APP_NAME} --resource-group {RESOURCE_GROUP}")
        else:
            print(f"     az webapp restart --name {APP_NAME} --resource-group {RESOURCE_GROUP}")
        print(f"  2. Verifique os logs:")
        if az_path:
            print(f"     {az_path} webapp log tail --name {APP_NAME} --resource-group {RESOURCE_GROUP}")
        else:
            print(f"     az webapp log tail --name {APP_NAME} --resource-group {RESOURCE_GROUP}")
        print(f"  3. Procure por: 'CryptoManager inicializado' e 'SessionManager inicializado'")
    else:
        print_color(f"\n[ERRO] Erro ao configurar variáveis", Colors.RED)
        print_color(f"Erro: {output}", Colors.RED)
        print()
        print_color("Alternativa: Configure manualmente via Azure Portal", Colors.YELLOW)
        print("   https://portal.azure.com")
        print("   App Services > caracore-backend-docker > Configuration > Application settings")
        print()
        show_configuration_values()
        sys.exit(1)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print_color("\n\nCancelado pelo usuário.", Colors.YELLOW)
        sys.exit(0)
    except Exception as e:
        print_color(f"\n[ERRO] Erro inesperado: {e}", Colors.RED)
        sys.exit(1)


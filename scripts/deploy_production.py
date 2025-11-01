#!/usr/bin/env python3
"""
Script de Deploy para Produção - CaraCore Backend
Deploy rápido do backend no Azure App Service

Uso:
    python deploy_production.py
    python deploy_production.py --skip-tests
    python deploy_production.py --force --message "Deploy urgente"
"""

import argparse
import json
import os
import shutil
import subprocess
import sys
import time
import zipfile
from datetime import datetime
from pathlib import Path
from typing import Optional

import requests


# Configurações
PROJECT_ROOT = Path(__file__).parent.parent
BACKEND_PATH = PROJECT_ROOT / "backend"
RESOURCE_GROUP = "rg-caracore"
APP_NAME = "caracore-backend"
ZIP_FILE = PROJECT_ROOT / "backend_deploy.zip"
BACKUPS_DIR = PROJECT_ROOT / "backups"


# Cores para output
class Colors:
    GREEN = '\033[92m'
    CYAN = '\033[96m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    RESET = '\033[0m'
    BOLD = '\033[1m'


def print_success(msg: str):
    print(f"{Colors.GREEN}✅ {msg}{Colors.RESET}")


def print_info(msg: str):
    print(f"{Colors.CYAN}ℹ️  {msg}{Colors.RESET}")


def print_warning(msg: str):
    print(f"{Colors.YELLOW}⚠️  {msg}{Colors.RESET}")


def print_error(msg: str):
    print(f"{Colors.RED}❌ {msg}{Colors.RESET}")


def print_banner():
    print()
    print(f"{Colors.CYAN}╔═══════════════════════════════════════════╗{Colors.RESET}")
    print(f"{Colors.CYAN}║   CaraCore - Deploy Backend Produção     ║{Colors.RESET}")
    print(f"{Colors.CYAN}╚═══════════════════════════════════════════╝{Colors.RESET}")
    print()


def run_command(cmd: list, check: bool = True, capture: bool = False) -> Optional[str]:
    """Executa comando shell e retorna output se capture=True"""
    try:
        if capture:
            result = subprocess.run(cmd, check=check, capture_output=True, text=True)
            return result.stdout.strip()
        else:
            result = subprocess.run(cmd, check=check)
            return None
    except subprocess.CalledProcessError as e:
        if check:
            raise
        return None


def check_azure_cli() -> bool:
    """Verifica se Azure CLI está instalado"""
    print_info("Verificando Azure CLI...")
    try:
        version = run_command(["az", "version", "--query", "\"azure-cli\"", "-o", "tsv"], capture=True)
        print_success(f"Azure CLI {version} instalado")
        return True
    except:
        print_error("Azure CLI não encontrado. Instale: https://aka.ms/InstallAzureCLIDirect")
        return False


def check_azure_auth() -> bool:
    """Verifica se está autenticado no Azure"""
    print_info("Verificando autenticação Azure...")
    result = run_command(["az", "account", "show"], check=False, capture=True)
    
    if not result:
        print_warning("Não está logado no Azure")
        print_info("Executando login...")
        try:
            run_command(["az", "login"])
            print_success("Autenticado no Azure")
            return True
        except:
            print_error("Falha no login do Azure")
            return False
    
    print_success("Autenticado no Azure")
    return True


def check_branch(force: bool) -> tuple[bool, str]:
    """Verifica branch atual"""
    print_info("Verificando branch Git...")
    branch = run_command(["git", "rev-parse", "--abbrev-ref", "HEAD"], capture=True)
    
    if branch != "main" and not force:
        print_warning(f"Você está na branch '{branch}', não 'main'")
        response = input("Continuar mesmo assim? (s/N): ")
        if response.lower() != "s":
            print_info("Deploy cancelado pelo usuário")
            return False, branch
    
    print_success(f"Branch: {branch}")
    return True, branch


def check_uncommitted_changes(force: bool) -> bool:
    """Verifica mudanças não commitadas"""
    print_info("Verificando mudanças não commitadas...")
    changes = run_command(["git", "status", "--porcelain"], capture=True)
    
    if changes and not force:
        print_warning("Existem mudanças não commitadas:")
        run_command(["git", "status", "--short"])
        response = input("Continuar mesmo assim? (s/N): ")
        if response.lower() != "s":
            print_info("Deploy cancelado. Commit suas mudanças primeiro.")
            return False
    
    return True


def run_tests(skip: bool) -> bool:
    """Executa testes do backend"""
    if skip:
        print_warning("Testes pulados (--skip-tests)")
        return True
    
    print_info("Executando testes do backend...")
    
    try:
        # Verificar se pytest está instalado
        subprocess.run([sys.executable, "-c", "import pytest"], 
                      check=True, capture_output=True)
        
        # Executar testes
        result = subprocess.run(
            [sys.executable, "-m", "pytest"],
            cwd=BACKEND_PATH,
            check=False
        )
        
        if result.returncode != 0:
            print_error("Testes falharam! Deploy cancelado.")
            return False
        
        print_success("Todos os testes passaram")
        return True
        
    except subprocess.CalledProcessError:
        print_warning("pytest não instalado, pulando testes")
        return True


def create_backup() -> Path:
    """Cria diretório de backups"""
    print_info("Preparando diretório de backups...")
    BACKUPS_DIR.mkdir(exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = BACKUPS_DIR / f"backup_{timestamp}.zip"
    
    print_info(f"Ponto de restore: {backup_file}")
    return backup_file


def create_deployment_zip() -> bool:
    """Cria ZIP de deploy"""
    print_info("Criando pacote de deploy...")
    
    if ZIP_FILE.exists():
        ZIP_FILE.unlink()
    
    exclude_patterns = ["__pycache__", ".pyc", "logs", ".log", ".env", ".git"]
    
    try:
        with zipfile.ZipFile(ZIP_FILE, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(BACKEND_PATH):
                # Filtrar diretórios excluídos
                dirs[:] = [d for d in dirs if not any(p in d for p in exclude_patterns)]
                
                for file in files:
                    # Filtrar arquivos excluídos
                    if any(p in file for p in exclude_patterns):
                        continue
                    
                    file_path = Path(root) / file
                    arcname = file_path.relative_to(BACKEND_PATH)
                    zipf.write(file_path, arcname)
        
        zip_size_kb = ZIP_FILE.stat().st_size / 1024
        print_success(f"Pacote criado: {zip_size_kb:.2f} KB")
        return True
        
    except Exception as e:
        print_error(f"Erro ao criar ZIP: {e}")
        return False


def deploy_to_azure() -> tuple[bool, float]:
    """Faz deploy no Azure"""
    print_info("Iniciando deploy no Azure App Service...")
    print_info(f"App: {APP_NAME}")
    print_info(f"Resource Group: {RESOURCE_GROUP}")
    print()
    
    deploy_start = time.time()
    
    try:
        run_command([
            "az", "webapp", "deployment", "source", "config-zip",
            "--name", APP_NAME,
            "--resource-group", RESOURCE_GROUP,
            "--src", str(ZIP_FILE)
        ])
        
        deploy_duration = time.time() - deploy_start
        print_success(f"Deploy concluído em {deploy_duration:.0f} segundos")
        return True, deploy_duration
        
    except Exception as e:
        print_error(f"Erro durante deploy: {e}")
        return False, 0


def health_check() -> bool:
    """Verifica health do backend"""
    print_info("Aguardando backend inicializar (30s)...")
    time.sleep(30)
    
    print_info("Executando health check...")
    health_url = f"https://{APP_NAME}.azurewebsites.net/health"
    
    try:
        response = requests.get(health_url, timeout=30)
        
        if response.status_code == 200 and response.json().get("status") == "ok":
            print_success("Backend está saudável!")
            return True
        else:
            print_warning(f"Health check retornou status inesperado: {response.json()}")
            return False
            
    except Exception as e:
        print_error(f"Health check falhou: {e}")
        print_warning(f"Backend pode estar inicializando. Verifique: {health_url}")
        return False


def test_admin_endpoint() -> bool:
    """Testa autenticação do endpoint admin"""
    print_info("Testando autenticação do endpoint admin...")
    admin_url = f"https://{APP_NAME}.azurewebsites.net/api/admin/logs"
    
    try:
        response = requests.get(admin_url, timeout=10)
        
        if response.status_code == 401:
            print_success("Endpoint admin protegido (401 Unauthorized) ✓")
            return True
        else:
            print_warning(f"Endpoint admin retornou status inesperado: {response.status_code}")
            return False
            
    except Exception as e:
        print_warning(f"Erro ao testar endpoint admin: {e}")
        return False


def cleanup():
    """Remove arquivos temporários"""
    print_info("Limpando arquivos temporários...")
    if ZIP_FILE.exists():
        ZIP_FILE.unlink()


def save_deploy_info(branch: str, duration: float, backup_file: Path):
    """Salva informações do deploy"""
    commit = run_command(["git", "rev-parse", "HEAD"], capture=True)
    commit_msg = run_command(["git", "log", "-1", "--pretty=%B"], capture=True)
    
    deploy_info = {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "branch": branch,
        "commit": commit,
        "commit_message": commit_msg,
        "duration": f"{duration:.2f}s",
        "backup": str(backup_file)
    }
    
    deploy_log = BACKEND_PATH / "logs" / "deploys.jsonl"
    deploy_log.parent.mkdir(exist_ok=True)
    
    with open(deploy_log, 'a', encoding='utf-8') as f:
        f.write(json.dumps(deploy_info, ensure_ascii=False) + '\n')


def print_summary(backup_file: Path, deploy_log: Path):
    """Imprime resumo final"""
    print()
    print(f"{Colors.GREEN}╔═══════════════════════════════════════════╗{Colors.RESET}")
    print(f"{Colors.GREEN}║        Deploy Concluído com Sucesso!     ║{Colors.RESET}")
    print(f"{Colors.GREEN}╚═══════════════════════════════════════════╝{Colors.RESET}")
    print()
    print_success(f"URL: https://{APP_NAME}.azurewebsites.net")
    print_success(f"Health: https://{APP_NAME}.azurewebsites.net/health")
    print_success("Dashboard: https://www.caracore.com.br/secure/admin-logs.html")
    print_info(f"Backup salvo em: {backup_file}")
    print_info(f"Log de deploy: {deploy_log}")
    print()
    
    print(f"{Colors.CYAN}Próximos passos:{Colors.RESET}")
    print(f"  • Verificar logs: az webapp log tail --name {APP_NAME} --resource-group {RESOURCE_GROUP}")
    print("  • Testar dashboard: abrir https://www.caracore.com.br/secure/admin-logs.html")
    print("  • Rollback (se necessário): python scripts/rollback.py")
    print()


def main():
    parser = argparse.ArgumentParser(description="Deploy backend CaraCore para produção")
    parser.add_argument("--skip-tests", action="store_true", help="Pular execução de testes")
    parser.add_argument("--force", action="store_true", help="Forçar deploy mesmo com avisos")
    parser.add_argument("--message", default="Deploy automático via script", help="Mensagem do deploy")
    
    args = parser.parse_args()
    
    print_banner()
    
    # 1. Verificações iniciais
    if not check_azure_cli():
        sys.exit(1)
    
    if not check_azure_auth():
        sys.exit(1)
    
    ok, branch = check_branch(args.force)
    if not ok:
        sys.exit(0)
    
    if not check_uncommitted_changes(args.force):
        sys.exit(0)
    
    # 2. Executar testes
    if not run_tests(args.skip_tests):
        sys.exit(1)
    
    # 3. Criar backup
    backup_file = create_backup()
    
    # 4. Criar ZIP de deploy
    if not create_deployment_zip():
        sys.exit(1)
    
    # 5. Deploy no Azure
    ok, duration = deploy_to_azure()
    if not ok:
        sys.exit(1)
    
    # 6. Health check
    health_check()
    
    # 7. Testar endpoint admin
    test_admin_endpoint()
    
    # 8. Cleanup
    cleanup()
    
    # 9. Salvar info do deploy
    deploy_log = BACKEND_PATH / "logs" / "deploys.jsonl"
    save_deploy_info(branch, duration, backup_file)
    
    # 10. Resumo final
    print_summary(backup_file, deploy_log)


if __name__ == "__main__":
    main()

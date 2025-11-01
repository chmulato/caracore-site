#!/usr/bin/env python3
"""
Script de Rollback - CaraCore Backend
Reverte o backend para uma versão anterior em caso de emergência

Uso:
    python rollback.py                    # Mostra backups disponíveis
    python rollback.py --latest           # Reverte para último backup
    python rollback.py --backup backup_20251101_153045.zip
    python rollback.py --commit abc123    # Reverte para commit específico
"""

import argparse
import json
import os
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Optional

import requests


# Configurações
PROJECT_ROOT = Path(__file__).parent.parent
BACKEND_PATH = PROJECT_ROOT / "backend"
RESOURCE_GROUP = "rg-caracore"
APP_NAME = "caracore-backend"
BACKUPS_DIR = PROJECT_ROOT / "backups"
DEPLOY_LOG = BACKEND_PATH / "logs" / "deploys.jsonl"


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
    print(f"{Colors.RED}{Colors.BOLD}╔═══════════════════════════════════════════╗{Colors.RESET}")
    print(f"{Colors.RED}{Colors.BOLD}║   CaraCore - Rollback Backend Produção   ║{Colors.RESET}")
    print(f"{Colors.RED}{Colors.BOLD}╚═══════════════════════════════════════════╝{Colors.RESET}")
    print()


def run_command(cmd: list, check: bool = True, capture: bool = False) -> Optional[str]:
    """Executa comando shell"""
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


def list_backups() -> list[Path]:
    """Lista backups disponíveis"""
    if not BACKUPS_DIR.exists():
        return []
    
    backups = sorted(BACKUPS_DIR.glob("backup_*.zip"), reverse=True)
    return backups


def list_deploys() -> list[dict]:
    """Lista deploys do log"""
    if not DEPLOY_LOG.exists():
        return []
    
    deploys = []
    with open(DEPLOY_LOG, 'r', encoding='utf-8') as f:
        for line in f:
            try:
                deploys.append(json.loads(line.strip()))
            except:
                continue
    
    return list(reversed(deploys))  # Mais recente primeiro


def show_backups():
    """Mostra backups e deploys disponíveis"""
    print_info("Backups disponíveis:")
    print()
    
    backups = list_backups()
    
    if not backups:
        print_warning("Nenhum backup encontrado")
        print_info("Backups são criados automaticamente durante deploys")
        return
    
    print(f"{'#':<4} {'Data/Hora':<20} {'Arquivo':<35}")
    print("-" * 60)
    
    for i, backup in enumerate(backups, 1):
        # Extrair timestamp do nome do arquivo
        timestamp_str = backup.stem.replace("backup_", "")
        try:
            dt = datetime.strptime(timestamp_str, "%Y%m%d_%H%M%S")
            formatted = dt.strftime("%d/%m/%Y %H:%M:%S")
        except:
            formatted = timestamp_str
        
        print(f"{i:<4} {formatted:<20} {backup.name:<35}")
    
    print()
    
    # Mostrar últimos deploys
    print_info("Últimos deploys:")
    print()
    
    deploys = list_deploys()[:10]  # Mostrar últimos 10
    
    if deploys:
        print(f"{'#':<4} {'Data/Hora':<20} {'Branch':<15} {'Commit':<10} {'Mensagem':<30}")
        print("-" * 90)
        
        for i, deploy in enumerate(deploys, 1):
            timestamp = deploy.get('timestamp', '')[:19]  # YYYY-MM-DD HH:MM:SS
            branch = deploy.get('branch', 'N/A')
            commit = deploy.get('commit', '')[:7]
            message = deploy.get('commit_message', '')[:30]
            
            print(f"{i:<4} {timestamp:<20} {branch:<15} {commit:<10} {message:<30}")
        
        print()


def confirm_rollback() -> bool:
    """Confirma rollback com usuário"""
    print()
    print_warning("⚠️  ATENÇÃO: Rollback irá substituir o código atual em produção!")
    print_warning("⚠️  Esta operação é irreversível!")
    print()
    
    response = input(f"{Colors.RED}Tem certeza que deseja continuar? Digite 'ROLLBACK' para confirmar: {Colors.RESET}")
    
    return response == "ROLLBACK"


def rollback_to_backup(backup_file: Path) -> bool:
    """Faz rollback para um backup específico"""
    if not backup_file.exists():
        print_error(f"Backup não encontrado: {backup_file}")
        return False
    
    print_info(f"Iniciando rollback para: {backup_file.name}")
    print()
    
    # Criar backup do estado atual antes de reverter
    print_info("Criando backup do estado atual (segurança)...")
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    safety_backup = BACKUPS_DIR / f"pre_rollback_{timestamp}.zip"
    
    try:
        import shutil
        import zipfile
        
        with zipfile.ZipFile(safety_backup, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(BACKEND_PATH):
                for file in files:
                    if '__pycache__' not in root and not file.endswith('.pyc'):
                        file_path = Path(root) / file
                        arcname = file_path.relative_to(BACKEND_PATH)
                        zipf.write(file_path, arcname)
        
        print_success(f"Backup de segurança: {safety_backup}")
    except Exception as e:
        print_warning(f"Falha ao criar backup de segurança: {e}")
        response = input("Continuar mesmo assim? (s/N): ")
        if response.lower() != 's':
            return False
    
    # Deploy do backup
    print_info("Fazendo deploy do backup no Azure...")
    
    try:
        run_command([
            "az", "webapp", "deployment", "source", "config-zip",
            "--name", APP_NAME,
            "--resource-group", RESOURCE_GROUP,
            "--src", str(backup_file)
        ])
        
        print_success("Rollback deploy concluído")
        return True
        
    except Exception as e:
        print_error(f"Erro durante rollback: {e}")
        return False


def rollback_to_commit(commit_hash: str) -> bool:
    """Faz rollback para um commit específico"""
    print_info(f"Fazendo rollback para commit: {commit_hash}")
    
    # Verificar se commit existe
    try:
        run_command(["git", "rev-parse", "--verify", commit_hash])
    except:
        print_error(f"Commit não encontrado: {commit_hash}")
        return False
    
    # Criar branch temporária
    temp_branch = f"rollback_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    print_info(f"Criando branch temporária: {temp_branch}")
    
    try:
        current_branch = run_command(["git", "rev-parse", "--abbrev-ref", "HEAD"], capture=True)
        
        # Criar e checkout branch temporária
        run_command(["git", "checkout", "-b", temp_branch, commit_hash])
        
        # Executar deploy normal
        print_info("Executando deploy do commit...")
        
        # Importar e usar função de deploy
        sys.path.insert(0, str(PROJECT_ROOT / "scripts"))
        from deploy_production import create_deployment_zip, deploy_to_azure
        
        if not create_deployment_zip():
            raise Exception("Falha ao criar ZIP de deploy")
        
        ok, duration = deploy_to_azure()
        
        if not ok:
            raise Exception("Falha no deploy")
        
        print_success(f"Rollback concluído em {duration:.0f} segundos")
        
        # Voltar para branch original
        print_info(f"Retornando para branch: {current_branch}")
        run_command(["git", "checkout", current_branch])
        
        # Deletar branch temporária
        run_command(["git", "branch", "-D", temp_branch])
        
        return True
        
    except Exception as e:
        print_error(f"Erro durante rollback: {e}")
        
        # Tentar voltar para branch original
        try:
            run_command(["git", "checkout", current_branch], check=False)
            run_command(["git", "branch", "-D", temp_branch], check=False)
        except:
            pass
        
        return False


def health_check() -> bool:
    """Verifica health do backend após rollback"""
    print_info("Aguardando backend inicializar (30s)...")
    time.sleep(30)
    
    print_info("Executando health check...")
    health_url = f"https://{APP_NAME}.azurewebsites.net/health"
    
    try:
        response = requests.get(health_url, timeout=30)
        
        if response.status_code == 200:
            print_success("Backend está saudável após rollback!")
            return True
        else:
            print_warning(f"Health check retornou status: {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Health check falhou: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(description="Rollback backend CaraCore para versão anterior")
    parser.add_argument("--latest", action="store_true", help="Reverter para último backup")
    parser.add_argument("--backup", help="Nome do arquivo de backup")
    parser.add_argument("--commit", help="Hash do commit para rollback")
    parser.add_argument("--list", action="store_true", help="Listar backups disponíveis")
    
    args = parser.parse_args()
    
    print_banner()
    
    # Se nenhum argumento, mostrar lista
    if not any([args.latest, args.backup, args.commit, args.list]):
        show_backups()
        print()
        print_info("Use --help para ver opções de rollback")
        return
    
    # Listar apenas
    if args.list:
        show_backups()
        return
    
    # Confirmar rollback
    if not confirm_rollback():
        print_info("Rollback cancelado pelo usuário")
        return
    
    # Executar rollback
    success = False
    
    if args.latest:
        backups = list_backups()
        if not backups:
            print_error("Nenhum backup disponível")
            sys.exit(1)
        
        success = rollback_to_backup(backups[0])
    
    elif args.backup:
        backup_file = BACKUPS_DIR / args.backup
        success = rollback_to_backup(backup_file)
    
    elif args.commit:
        success = rollback_to_commit(args.commit)
    
    if success:
        # Health check
        health_check()
        
        print()
        print_success("Rollback concluído com sucesso!")
        print()
        print_info("Próximos passos:")
        print("  • Verificar: https://caracore-backend.azurewebsites.net/health")
        print("  • Testar dashboard: https://www.caracore.com.br/secure/admin-logs.html")
        print("  • Verificar logs: az webapp log tail --name caracore-backend --resource-group rg-caracore")
        print()
    else:
        print()
        print_error("Rollback falhou! Backend pode estar em estado inconsistente.")
        print_warning("Verifique logs do Azure e considere deploy manual.")
        sys.exit(1)


if __name__ == "__main__":
    main()

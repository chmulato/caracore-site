#!/usr/bin/env python3
"""
Deploy CaraCore backend package to Azure App Service.

Este script **não** cria infraestrutura. Use `infra_to_azure.py` para provisionar
Resource Group, App Service Plan, Web App e Key Vault. Aqui cuidamos apenas de:

- Gerar `backend.zip` (com dependências em `.python_packages`) quando desejado
- Enviar o ZIP via `az webapp deployment source config-zip`
- Opcionalmente reiniciar o App Service ao final
- Executar smoke tests do backend publicado (via `teste_end_point_azure.py`), se solicitado
"""
from __future__ import annotations

import argparse
import os
import sys
import subprocess
import time
from pathlib import Path
import logging
from logging.handlers import RotatingFileHandler
from datetime import datetime
from typing import Optional
import json

import shutil

from deploy_helpers import build_backend_zip, bundle_backend_dependencies


LOGGER_NAME = "deploy"
logger = logging.getLogger(LOGGER_NAME)


def ensure_log_dir() -> Path:
    base = Path(__file__).resolve().parent / "log"
    try:
        base.mkdir(parents=True, exist_ok=True)
    except Exception:
        base = Path(Path.cwd())
    return base


def init_logging(level: str = "INFO", log_file: Optional[str] = None) -> Path:
    numeric_level = getattr(logging, level.upper(), logging.INFO)
    logger.setLevel(logging.DEBUG)

    ch = logging.StreamHandler(sys.stdout)
    ch.setLevel(numeric_level)
    ch.setFormatter(logging.Formatter("[%(name)s] %(message)s"))
    logger.addHandler(ch)

    log_dir = ensure_log_dir()
    if not log_file:
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        log_file = str(log_dir / f"deploy_{ts}.log")
    fh = RotatingFileHandler(log_file, maxBytes=2 * 1024 * 1024, backupCount=3, encoding="utf-8")
    fh.setLevel(logging.DEBUG)
    fh.setFormatter(logging.Formatter("%(asctime)s %(levelname)s [%(name)s] %(message)s", "%Y-%m-%d %H:%M:%S"))
    logger.addHandler(fh)

    return Path(log_file)


def log(msg: str) -> None:
    logger.info(msg)


def run_cli(cmd: list[str], check: bool = True, env: Optional[dict[str, str]] = None) -> subprocess.CompletedProcess[str]:
    logger.debug(f"CLI: {' '.join(cmd)}")
    if not cmd:
        raise ValueError("Nenhum comando fornecido para run_cli.")

    executable = cmd[0]
    search_path = (env or os.environ).get("PATH", os.environ.get("PATH", ""))
    if not os.path.isabs(executable):
        resolved = shutil.which(executable, path=search_path)
        if resolved:
            cmd = [resolved, *cmd[1:]]
            executable = resolved
    if not os.path.exists(executable):
        raise FileNotFoundError(f"CLI não encontrado: {cmd[0]}.")
    try:
        result = subprocess.run(cmd, check=check, capture_output=True, text=True, env=env)
    except FileNotFoundError as exc:
        raise FileNotFoundError(f"CLI não encontrado: {cmd[0]}.") from exc
    if result.stdout:
        logger.debug(f"CLI STDOUT: {result.stdout[:4000].strip()}")
    if result.stderr:
        logger.debug(f"CLI STDERR: {result.stderr[:4000].strip()}")
    return result


def ensure_az_cli_available() -> None:
    az_path = shutil.which("az")
    if not az_path:
        raise FileNotFoundError(
            "Azure CLI 'az' não foi encontrado no PATH. Instale o Azure CLI e execute 'az login' antes de prosseguir."
        )


def ensure_az_context(subscription_id: Optional[str]) -> Optional[str]:
    """Garantir que o Azure CLI esteja autenticado e usando a subscription correta."""

    ensure_az_cli_available()

    log("Verificando autenticação do Azure CLI...")
    result = run_cli(["az", "account", "show"], check=False)
    if result.returncode != 0:
        raise RuntimeError(
            "Azure CLI não autenticado. Execute 'az login' e tente novamente."
        )

    current_subscription: Optional[str] = None
    account_email: Optional[str] = None
    if result.stdout:
        try:
            data = json.loads(result.stdout)
            current_subscription = data.get("id")
            user_info = data.get("user") or {}
            account_email = user_info.get("name")
        except json.JSONDecodeError:
            logger.debug("Não foi possível interpretar o retorno do 'az account show'.")

    if account_email:
        log(f"Azure CLI autenticado como: {account_email}")
    if current_subscription:
        log(f"Subscription atual do Azure CLI: {current_subscription}")

    if subscription_id:
        if current_subscription == subscription_id:
            log("Subscription desejada já está selecionada no Azure CLI.")
        else:
            log(f"Selecionando subscription {subscription_id}...")
            try:
                run_cli([
                    "az",
                    "account",
                    "set",
                    "--subscription",
                    subscription_id,
                ])
            except subprocess.CalledProcessError as exc:
                raise RuntimeError(
                    f"Falha ao selecionar a subscription {subscription_id}: {exc.stderr or exc}"
                ) from exc
            current_subscription = subscription_id
            log(f"Subscription {subscription_id} selecionada no Azure CLI.")

    return current_subscription


def zip_deploy(resource_group: str, app_name: str, zip_path: Path) -> None:
    if not zip_path.is_file():
        raise FileNotFoundError(f"ZIP não encontrado: {zip_path}")
    log(f"Fazendo ZIP deploy de '{zip_path}' para o App Service '{app_name}'...")
    cmd = [
        "az",
        "webapp",
        "deployment",
        "source",
        "config-zip",
        "--resource-group",
        resource_group,
        "--name",
        app_name,
        "--src",
        str(zip_path),
    ]
    run_cli(cmd)
    log("ZIP deploy finalizado.")


def restart_webapp(resource_group: str, app_name: str) -> None:
    log(f"Reiniciando Web App '{app_name}'...")
    run_cli(["az", "webapp", "restart", "--resource-group", resource_group, "--name", app_name])
    log("Restart solicitado.")


def validate_app_settings(resource_group: str, app_name: str) -> None:
    """Valida se as configurações críticas estão presentes no App Service."""
    log("Validando configurações do App Service...")
    
    required_settings = [
        "APP_SECRET_KEY",
        "ORIGIN_ALLOWED",
        "GOOGLE_CLIENT_ID",
        "GOOGLE_CLIENT_SECRET",
        "OAUTH_REDIRECT_URI",
        "AZURE_TENANT_ID",      # Alterado de TENANT_ID
        "AZURE_CLIENT_ID",      # Alterado de CLIENT_ID
        "AZURE_CLIENT_SECRET",  # Alterado de CLIENT_SECRET
    ]
    
    result = run_cli([
        "az",
        "webapp",
        "config",
        "appsettings",
        "list",
        "--resource-group",
        resource_group,
        "--name",
        app_name,
    ])
    
    if result.stdout:
        try:
            settings = json.loads(result.stdout)
            setting_names = {s.get("name") for s in settings}
            missing = [name for name in required_settings if name not in setting_names]
            
            if missing:
                log(f"AVISO: Configurações faltando no App Service: {', '.join(missing)}")
                log("Execute o comando de configuração antes do deploy:")
                log("az webapp config appsettings set --name caracore-backend --resource-group rg-caracore --settings ...")
            else:
                log("✓ Todas as configurações críticas estão presentes.")
        except json.JSONDecodeError:
            logger.warning("Não foi possível validar as configurações do App Service.")


def set_startup_command(resource_group: str, app_name: str, startup_file: Path) -> None:
    """Configura o startup command do App Service a partir do arquivo startup.txt."""
    if not startup_file.is_file():
        raise FileNotFoundError(f"Arquivo startup.txt não encontrado: {startup_file}")
    
    with open(startup_file, "r", encoding="utf-8") as f:
        startup_cmd = f.read().strip()
    
    if not startup_cmd:
        raise ValueError("O arquivo startup.txt está vazio.")
    
    log(f"Configurando startup command: {startup_cmd}")
    run_cli([
        "az",
        "webapp",
        "config",
        "set",
        "--resource-group",
        resource_group,
        "--name",
        app_name,
        "--startup-file",
        startup_cmd,
    ])
    log("✓ Startup command configurado com sucesso.")


def run_smoke_tests(
    app_name: str,
    base_url: Optional[str],
    origin: Optional[str],
    timeout: Optional[int],
    insecure: bool,
    wait_seconds: int,
    python_executable: Optional[str],
) -> None:
    script_path = Path(__file__).resolve().parent / "teste_end_point_azure.py"
    if not script_path.is_file():
        raise FileNotFoundError(f"Script de testes não encontrado: {script_path}")

    resolved_base_url = base_url or f"https://{app_name}.azurewebsites.net"
    env = os.environ.copy()
    env["AZURE_BACKEND_BASE_URL"] = resolved_base_url
    if origin:
        env["AZURE_ALLOWED_ORIGIN"] = origin
    if timeout:
        env["AZURE_BACKEND_TIMEOUT"] = str(timeout)
    env.setdefault("PYTHONIOENCODING", "utf-8")
    env.setdefault("PYTHONUTF8", "1")

    if wait_seconds > 0:
        log(f"Aguardando {wait_seconds}s antes de executar os smoke tests...")
        time.sleep(wait_seconds)

    cmd = [python_executable or sys.executable, str(script_path)]
    if insecure:
        cmd.append("--insecure")

    log(f"Executando smoke tests do backend Azure ({resolved_base_url})...")
    result = run_cli(cmd, check=False, env=env)
    if result.returncode != 0:
        raise RuntimeError("Smoke tests do backend falharam. Consulte o log acima para detalhes.")
    log("Smoke tests concluídos com sucesso.")


def maybe_build_zip(
    backend_dir: Path,
    output_zip: Path,
    bundle_deps: bool,
    overwrite: bool,
    python_executable: Optional[str],
    extra_pip_args: list[str],
) -> Path:
    if output_zip.exists() and not overwrite:
        log(f"ZIP '{output_zip}' já existe (use --overwrite para recriar).")
        return output_zip

    if bundle_deps:
        requirements_path = backend_dir.parent / "requirements.txt"
        if requirements_path.is_file():
            log("Instalando dependências em backend/.python_packages...")
            bundle_backend_dependencies(
                backend_dir,
                requirements_path,
                python_executable=python_executable,
                extra_pip_args=extra_pip_args,
            )
            log("Dependências instaladas com sucesso.")
        else:
            log("requirements.txt não encontrado; pulando bundle de dependências.")

    log(f"Gerando ZIP a partir de '{backend_dir}'...")
    build_backend_zip(backend_dir, output_zip)
    log(f"ZIP gerado em: {output_zip}")
    return output_zip


def main() -> None:
    parser = argparse.ArgumentParser(description="Realiza zip deploy da API CaraCore no Azure App Service.")
    parser.add_argument("--subscription-id", default=os.getenv("AZURE_SUBSCRIPTION_ID"), help="ID da subscription Azure (usado pelo Azure CLI)")
    parser.add_argument("--resource-group", default="rg-caracore", help="Resource Group do App Service")
    parser.add_argument("--app-name", default="caracore-backend", help="Nome do App Service")
    parser.add_argument("--zip", dest="zip_path", default=None, help="Caminho para um ZIP existente (opcional)")
    parser.add_argument("--backend-dir", default=str(Path(__file__).resolve().parent.parent / "backend"), help="Diretório do backend para gerar ZIP se necessário")
    parser.add_argument("--output-zip", default=str(Path(__file__).resolve().parent / "backend.zip"), help="Arquivo ZIP de saída caso o ZIP seja gerado automaticamente")
    parser.add_argument(
        "--bundle-backend-deps",
        dest="bundle_backend_deps",
        action="store_true",
        help="Instala dependências em backend/.python_packages ao gerar ZIP automaticamente (padrão: habilitado)",
    )
    parser.add_argument(
        "--no-bundle-backend-deps",
        dest="bundle_backend_deps",
        action="store_false",
        help="Não instala dependências ao gerar o ZIP (usar apenas para pacotes pré-montados)",
    )
    parser.set_defaults(bundle_backend_deps=True)
    parser.add_argument("--overwrite", action="store_true", help="Sobrescreve o ZIP de saída caso exista")
    parser.add_argument("--bundle-python", dest="bundle_python", default=None, help="Executável Python a ser usado durante a instalação de dependências")
    parser.add_argument("--pip-extra-arg", dest="pip_extra_args", action="append", default=[], help="Argumento extra para o pip durante o bundle de dependências")
    parser.add_argument("--restart", action="store_true", help="Reinicia o Web App após o deploy")
    parser.add_argument("--log-level", default=os.getenv("DEPLOY_LOG_LEVEL", "INFO"), choices=["DEBUG", "INFO", "WARNING", "ERROR"], help="Nível de log")
    parser.add_argument("--log-file", default=None, help="Arquivo de log (padrão: log/deploy_YYYYmmdd_HHMMSS.log)")
    parser.add_argument("--run-tests", action="store_true", help="Executa os smoke tests do backend (teste_end_point_azure.py) após o deploy")
    parser.add_argument("--tests-base-url", default=None, help="Base URL para os smoke tests (padrão https://<app>.azurewebsites.net)")
    parser.add_argument("--tests-origin", default=None, help="Origem a ser enviada nos smoke tests (padrão AZURE_ALLOWED_ORIGIN)")
    parser.add_argument("--tests-timeout", type=int, default=None, help="Timeout em segundos para cada requisição dos smoke tests")
    parser.add_argument("--tests-insecure", action="store_true", help="Desabilita verificação SSL nos smoke tests")
    parser.add_argument("--tests-wait", type=int, default=5, help="Segundos para aguardar antes de rodar os smoke tests (padrão: 5)")
    parser.add_argument("--tests-python", dest="tests_python", default=None, help="Executável Python a usar nos smoke tests (padrão: mesmo Python deste script)")
    parser.add_argument("--set-startup-command", action="store_true", help="Configure o startup command no Azure a partir do arquivo startup.txt")

    args = parser.parse_args()

    log_path = init_logging(args.log_level, args.log_file)
    log(f"Logs detalhados: {log_path}")

    current_subscription: Optional[str] = None
    try:
        current_subscription = ensure_az_context(args.subscription_id)
    except FileNotFoundError as exc:
        log(str(exc))
        sys.exit(1)
    except RuntimeError as exc:
        log(str(exc))
        sys.exit(1)

    if args.subscription_id:
        os.environ["AZURE_SUBSCRIPTION_ID"] = args.subscription_id
    elif current_subscription:
        os.environ.setdefault("AZURE_SUBSCRIPTION_ID", current_subscription)

    backend_dir = Path(args.backend_dir)
    output_zip = Path(args.output_zip)
    
    # Validar configurações do App Service
    try:
        validate_app_settings(args.resource_group, args.app_name)
    except Exception as exc:
        log(f"Aviso: Não foi possível validar as configurações: {exc}")
    
    # Verificar se startup.txt existe
    startup_file = backend_dir / "startup.txt"
    if startup_file.is_file():
        with open(startup_file, "r", encoding="utf-8") as f:
            startup_cmd = f.read().strip()
            log(f"✓ Startup command encontrado: {startup_cmd}")
        
        if args.set_startup_command:
            try:
                set_startup_command(args.resource_group, args.app_name, startup_file)
            except Exception as exc:
                log(f"Erro ao configurar startup command: {exc}")
                sys.exit(1)
    else:
        log("AVISO: arquivo startup.txt não encontrado no diretório do backend.")
        log("Crie o arquivo backend/startup.txt com o comando: gunicorn --bind=0.0.0.0 --timeout 600 app:app")

    if args.zip_path:
        zip_path = Path(args.zip_path)
        log(f"Usando ZIP fornecido: {zip_path}")
        if args.bundle_backend_deps:
            log("Aviso: --bundle-backend-deps não será executado pois um ZIP externo foi fornecido. Garanta que o pacote contenha .python_packages.")
    else:
        zip_path = maybe_build_zip(
            backend_dir,
            output_zip,
            bundle_deps=args.bundle_backend_deps,
            overwrite=args.overwrite,
            python_executable=args.bundle_python,
            extra_pip_args=args.pip_extra_args,
        )

    zip_deploy(args.resource_group, args.app_name, zip_path)

    if args.restart:
        restart_webapp(args.resource_group, args.app_name)

    if args.run_tests:
        run_smoke_tests(
            app_name=args.app_name,
            base_url=args.tests_base_url,
            origin=args.tests_origin,
            timeout=args.tests_timeout,
            insecure=args.tests_insecure,
            wait_seconds=args.tests_wait,
            python_executable=args.tests_python,
        )

    log("=" * 80)
    log("Deploy concluído com sucesso!")
    log(f"App publicado em: https://{args.app_name}.azurewebsites.net")
    log("")
    log("Endpoints disponíveis:")
    log(f"  - Health check: https://{args.app_name}.azurewebsites.net/health")
    log(f"  - OAuth Google: https://{args.app_name}.azurewebsites.net/oauth/google/token")
    log(f"  - OAuth Microsoft: https://{args.app_name}.azurewebsites.net/oauth/microsoft/token")
    log("")
    log("Para visualizar logs em tempo real:")
    log(f"  az webapp log tail --name {args.app_name} --resource-group {args.resource_group}")
    log("=" * 80)


if __name__ == "__main__":
    main()

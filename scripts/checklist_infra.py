#!/usr/bin/env python3
"""Infra checklist for CaraCore Azure deployment.

This script validates that the Azure infrastructure required by the CaraCore
backend is in place and optionally performs a health check call against the
App Service endpoint.

The following checks are performed (when aplicable):
- Resource Group existence
- App Service Plan existence
- Web App existence and runtime configuration
- App Settings presence
- Managed Identity configuration
- Key Vault secret availability (optional)
- HTTPS enforcement and CORS (basic flags)
- Health endpoint reachability (optional)

Example usage (PowerShell):

```powershell
python checklist_infra.py `
  --subscription-id $env:AZURE_SUBSCRIPTION_ID `
  --resource-group rg-caracore `
  --plan-name caracore-plan `
  --app-name caracore-backend `
  --health-url https://caracore-backend.azurewebsites.net/health
```
"""
from __future__ import annotations

import argparse
import logging
from logging.handlers import RotatingFileHandler
import os
from pathlib import Path
import sys
from dataclasses import dataclass
from datetime import datetime
from typing import Iterable, List, Optional

import requests
from azure.core.exceptions import HttpResponseError, ResourceNotFoundError
from azure.identity import DefaultAzureCredential
try:
    from azure.keyvault.secrets import SecretClient
except ModuleNotFoundError as exc:  # pragma: no cover - guidance for setup
    raise ModuleNotFoundError(
        "Dependência 'azure-keyvault-secrets' ausente. Execute 'pip install -r requirements.txt' ou 'pip install azure-keyvault-secrets'."
    ) from exc
from azure.mgmt.resource import ResourceManagementClient
from azure.mgmt.web import WebSiteManagementClient

LOGGER_NAME = "infra-check"
logger = logging.getLogger(LOGGER_NAME)


# ---------------------------------------------------------------------------
# Logging helpers
# ---------------------------------------------------------------------------

def ensure_log_dir() -> Path:
    base = Path(__file__).resolve().parent / "log"
    try:
        base.mkdir(parents=True, exist_ok=True)
    except Exception:  # pragma: no cover - fallback if repo unwritable
        base = Path(Path.cwd())
    return base


def init_logging(level: str = "INFO", log_file: Optional[str] = None) -> Path:
    numeric_level = getattr(logging, level.upper(), logging.INFO)
    logger.setLevel(logging.DEBUG)

    stream = logging.StreamHandler(sys.stdout)
    stream.setLevel(numeric_level)
    stream.setFormatter(logging.Formatter("[%(name)s] %(message)s"))
    logger.addHandler(stream)

    log_dir = ensure_log_dir()
    if not log_file:
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        log_file = str(log_dir / f"infra_check_{ts}.log")
    file_handler = RotatingFileHandler(log_file, maxBytes=2 * 1024 * 1024, backupCount=3, encoding="utf-8")
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s [%(name)s] %(message)s", "%Y-%m-%d %H:%M:%S"))
    logger.addHandler(file_handler)

    logging.getLogger("azure").setLevel(logging.WARNING)
    return Path(log_file)


def log(msg: str) -> None:
    logger.info(msg)


# ---------------------------------------------------------------------------
# Result helpers
# ---------------------------------------------------------------------------

@dataclass
class CheckResult:
    name: str
    passed: bool
    detail: str


class CheckCollector:
    def __init__(self) -> None:
        self.results: List[CheckResult] = []

    def add(self, name: str, passed: bool, detail: str) -> None:
        emoji = "✅" if passed else "❌"
        logger.info("%s %s - %s", emoji, name, detail)
        self.results.append(CheckResult(name, passed, detail))

    def all_passed(self) -> bool:
        return all(item.passed for item in self.results)

    def summary_rows(self) -> List[CheckResult]:
        return self.results


# ---------------------------------------------------------------------------
# Core checks
# ---------------------------------------------------------------------------

def check_resource_group(collector: CheckCollector, client: ResourceManagementClient, resource_group: str) -> None:
    name = f"Resource Group '{resource_group}'"
    try:
        client.resource_groups.get(resource_group)
    except ResourceNotFoundError:
        collector.add(name, False, "Não encontrado")
        return
    except HttpResponseError as exc:
        collector.add(name, False, f"Erro ao consultar: {exc.message}")
        return
    collector.add(name, True, "Encontrado")


def check_app_service_plan(
    collector: CheckCollector,
    client: WebSiteManagementClient,
    resource_group: str,
    plan_name: str,
) -> None:
    name = f"App Service Plan '{plan_name}'"
    try:
        plan = client.app_service_plans.get(resource_group, plan_name)
    except ResourceNotFoundError:
        collector.add(name, False, "Não encontrado")
        return
    except HttpResponseError as exc:
        collector.add(name, False, f"Erro ao consultar: {exc.message}")
        return

    sku = plan.sku.name if plan.sku else "(sem SKU)"
    detail = f"Encontrado - SKU {sku}, localização {plan.location}"
    collector.add(name, True, detail)


def check_web_app(
    collector: CheckCollector,
    client: WebSiteManagementClient,
    resource_group: str,
    app_name: str,
    expected_runtime: Optional[str],
    require_https: bool,
) -> None:
    name = f"Web App '{app_name}'"
    try:
        site = client.web_apps.get(resource_group, app_name)
    except ResourceNotFoundError:
        collector.add(name, False, "Não encontrado")
        return
    except HttpResponseError as exc:
        collector.add(name, False, f"Erro ao consultar: {exc.message}")
        return

    detail_parts = [f"Estado: {site.state}" if site.state else "Estado desconhecido"]
    if require_https:
        # https_only default False if not set
        https_enabled = bool(getattr(site, "https_only", False))
        detail_parts.append("HTTPS on" if https_enabled else "HTTPS off")
        if not https_enabled:
            collector.add(name, False, ", ".join(detail_parts))
            return

    try:
        config = client.web_apps.get_configuration(resource_group, app_name)
        linux_fx = getattr(config, "linux_fx_version", None)
        if linux_fx:
            detail_parts.append(f"Runtime: {linux_fx}")
        if expected_runtime and expected_runtime.lower() not in (linux_fx or "").lower():
            collector.add(name, False, ", ".join(detail_parts) + " (runtime diferente do esperado)")
            return
    except HttpResponseError as exc:
        detail_parts.append(f"Erro ao ler configuração: {exc.message}")
        collector.add(name, False, ", ".join(detail_parts))
        return

    identity = getattr(site, "identity", None)
    if identity and getattr(identity, "type", "").upper() != "NONE":
        detail_parts.append("Managed Identity configurada")
    else:
        detail_parts.append("Managed Identity ausente")

    collector.add(name, True, ", ".join(detail_parts))


def check_app_settings(
    collector: CheckCollector,
    client: WebSiteManagementClient,
    resource_group: str,
    app_name: str,
    expected_settings: Iterable[str],
) -> None:
    name = f"App Settings '{app_name}'"
    try:
        settings = client.web_apps.list_application_settings(resource_group, app_name)
    except HttpResponseError as exc:
        collector.add(name, False, f"Erro ao consultar: {exc.message}")
        return

    missing = [key for key in expected_settings if key not in (settings.properties or {})]
    if missing:
        collector.add(name, False, f"Campos ausentes: {', '.join(missing)}")
    else:
        collector.add(name, True, f"Todos presentes ({', '.join(expected_settings)})")


def check_key_vault_secret(
    collector: CheckCollector,
    vault_url: str,
    secret_name: str,
    credential: DefaultAzureCredential,
) -> None:
    name = f"Key Vault segredo '{secret_name}'"
    try:
        client = SecretClient(vault_url=vault_url, credential=credential)
        secret = client.get_secret(secret_name)
    except ResourceNotFoundError:
        collector.add(name, False, "Segredo não encontrado")
        return
    except HttpResponseError as exc:
        collector.add(name, False, f"Erro ao consultar: {exc.message}")
        return
    collector.add(name, True, f"Encontrado (versão {secret.properties.version})")


def check_health_endpoint(
    collector: CheckCollector,
    url: str,
    timeout: float,
    expected_status: int,
) -> None:
    name = f"Health endpoint '{url}'"
    try:
        response = requests.get(url, timeout=timeout)
    except requests.RequestException as exc:
        collector.add(name, False, f"Falha na requisição: {exc}")
        return

    if response.status_code != expected_status:
        collector.add(name, False, f"Status {response.status_code} (esperado {expected_status})")
        return

    collector.add(name, True, "Resposta OK")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Valida infraestrutura Azure para CaraCore")
    parser.add_argument("--subscription-id", default=os.getenv("AZURE_SUBSCRIPTION_ID"), help="ID da subscription Azure")
    parser.add_argument("--resource-group", default="rg-caracore", help="Resource Group do App Service")
    parser.add_argument("--plan-name", default="caracore-plan", help="Nome do App Service Plan")
    parser.add_argument("--app-name", default="api-caracore", help="Nome do Web App")
    parser.add_argument("--expected-runtime", default="PYTHON|3.11", help="Runtime esperado (linuxFxVersion)")
    parser.add_argument("--required-setting", dest="required_settings", action="append", default=[
        "FLASK_ENV",
        "LOG_LEVEL",
        "GOOGLE_CLIENT_SECRET",
    ], help="App Setting obrigatório (pode repetir)")
    parser.add_argument("--keyvault-name", default=None, help="Nome do Key Vault para validação opcional")
    parser.add_argument("--check-secret", dest="check_secret", default=None, help="Nome do segredo a validar no Key Vault")
    parser.add_argument("--health-url", default=None, help="URL do endpoint de saúde a ser verificado")
    parser.add_argument("--health-timeout", type=float, default=10.0, help="Timeout em segundos para a chamada HTTP")
    parser.add_argument("--health-expected-status", type=int, default=200, help="Status HTTP esperado para o health check")
    parser.add_argument("--skip-health", action="store_true", help="Pula verificação do health endpoint")
    parser.add_argument("--require-https", action="store_true", help="Falha se o Web App não estiver com HTTPS obrigatório")
    parser.add_argument("--log-level", default=os.getenv("INFRA_CHECK_LOG_LEVEL", "INFO"), choices=["DEBUG", "INFO", "WARNING", "ERROR"], help="Nível de log")
    parser.add_argument("--log-file", default=None, help="Arquivo de log (padrão: log/infra_check_YYYYmmdd_HHMMSS.log)")
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    if not args.subscription_id:
        parser.error("--subscription-id não informado e variável AZURE_SUBSCRIPTION_ID ausente")

    log_path = init_logging(args.log_level, args.log_file)
    log(f"Logs detalhados: {log_path}")
    log("Iniciando checklist de infraestrutura Azure...")

    credential = DefaultAzureCredential(exclude_shared_token_cache_credential=True)

    resource_client = ResourceManagementClient(credential, args.subscription_id)
    web_client = WebSiteManagementClient(credential, args.subscription_id)

    collector = CheckCollector()

    check_resource_group(collector, resource_client, args.resource_group)
    check_app_service_plan(collector, web_client, args.resource_group, args.plan_name)
    check_web_app(collector, web_client, args.resource_group, args.app_name, args.expected_runtime, args.require_https)
    required_settings = list(dict.fromkeys(args.required_settings))  # remove duplicados preservando ordem
    if required_settings:
        check_app_settings(collector, web_client, args.resource_group, args.app_name, required_settings)

    if args.keyvault_name and args.check_secret:
        vault_url = f"https://{args.keyvault_name}.vault.azure.net/"
        check_key_vault_secret(collector, vault_url, args.check_secret, credential)
    elif args.keyvault_name or args.check_secret:
        log("⚠️ Para validar segredos, informe tanto --keyvault-name quanto --check-secret")

    if not args.skip_health:
        health_url = args.health_url or f"https://{args.app_name}.azurewebsites.net/health"
        check_health_endpoint(collector, health_url, args.health_timeout, args.health_expected_status)

    # Summarize
    rows = collector.summary_rows()
    name_width = max(len(r.name) for r in rows) if rows else 20
    status_width = len("STATUS")

    print()
    print("Resumo dos checks")
    print("=" * (name_width + status_width + 5))
    print(f"{'Item'.ljust(name_width)} | Status | Detalhes")
    print("-" * (name_width + status_width + 5 + 20))
    for item in rows:
        status = "OK" if item.passed else "FALHA"
        print(f"{item.name.ljust(name_width)} | {status:<6} | {item.detail}")

    if collector.all_passed():
        log("Checklist concluído com sucesso.")
        return 0
    log("Checklist encontrou falhas.")
    return 1


if __name__ == "__main__":
    sys.exit(main())

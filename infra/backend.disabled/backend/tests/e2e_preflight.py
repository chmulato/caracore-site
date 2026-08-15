#!/usr/bin/env python3
"""
E2E preflight checks for CaraCore backend tests.

Usage:
  python tests/e2e_preflight.py
"""

from __future__ import annotations

import socket
import sys
import os
from dataclasses import dataclass

import requests
from selenium import webdriver
from selenium.webdriver.edge.options import Options as EdgeOptions
from selenium.webdriver.chrome.options import Options as ChromeOptions


@dataclass
class CheckResult:
    name: str
    ok: bool
    detail: str


AZURE_HOST = os.getenv("E2E_AZURE_HOST", "caracore-backend-docker.azurewebsites.net")
AZURE_HEALTH_URL = f"https://{AZURE_HOST}/health"


def check_dns() -> CheckResult:
    try:
        ip = socket.gethostbyname(AZURE_HOST)
        return CheckResult("DNS", True, f"{AZURE_HOST} -> {ip}")
    except Exception as exc:
        return CheckResult("DNS", False, f"Falha ao resolver {AZURE_HOST}: {exc}")


def check_health_endpoint(timeout_seconds: int = 10) -> CheckResult:
    try:
        response = requests.get(AZURE_HEALTH_URL, timeout=timeout_seconds)
        if response.status_code == 200:
            return CheckResult("Health Endpoint", True, f"HTTP 200 em {AZURE_HEALTH_URL}")
        return CheckResult("Health Endpoint", False, f"HTTP {response.status_code} em {AZURE_HEALTH_URL}")
    except Exception as exc:
        return CheckResult("Health Endpoint", False, f"Falha ao acessar endpoint: {exc}")


def check_browser_automation() -> CheckResult:
    # Prefer Chrome and fallback to Edge if Chrome is unavailable.
    chrome_options = ChromeOptions()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1280,720")

    edge_options = EdgeOptions()
    edge_options.add_argument("--headless")
    edge_options.add_argument("--disable-gpu")
    edge_options.add_argument("--window-size=1280,720")

    driver = None
    try:
        try:
            driver = webdriver.Chrome(options=chrome_options)
            browser_name = "Chrome"
        except Exception:
            driver = webdriver.Edge(options=edge_options)
            browser_name = "Edge"

        driver.get("https://example.com")
        title = driver.title or ""
        if "Example Domain" in title:
            return CheckResult("Browser Automation", True, f"WebDriver funcionando com {browser_name}")
        return CheckResult("Browser Automation", False, f"WebDriver abriu {browser_name}, mas resposta inesperada")
    except Exception as exc:
        return CheckResult("Browser Automation", False, f"Falha ao iniciar WebDriver (Chrome/Edge): {exc}")
    finally:
        if driver is not None:
            try:
                driver.quit()
            except Exception:
                pass


def print_result(result: CheckResult) -> None:
    status = "OK" if result.ok else "FAIL"
    print(f"[{status}] {result.name}: {result.detail}")


def main() -> int:
    checks = [
        check_dns(),
        check_health_endpoint(),
        check_browser_automation(),
    ]

    print("=== CaraCore E2E Preflight ===")
    for result in checks:
        print_result(result)

    failed = [c for c in checks if not c.ok]
    if failed:
        print("\nPreflight: FAIL")
        print("Defina RUN_E2E=1 somente quando todos os checks estiverem OK.")
        return 1

    print("\nPreflight: OK")
    print("Ambiente pronto para executar E2E com RUN_E2E=1.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

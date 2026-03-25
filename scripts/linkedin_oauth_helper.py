#!/usr/bin/env python3
"""LinkedIn OAuth helper for local setup.

Usage:
  python scripts/linkedin_oauth_helper.py auth-url
  python scripts/linkedin_oauth_helper.py exchange-code --code "AQ..."
    python scripts/linkedin_oauth_helper.py auto --set-github-secret --repo chmulato/cara-core

Configuration is loaded from secrets.txt when present, and may be overridden by
environment variables.
"""

from __future__ import annotations

import argparse
import html
import json
import os
import secrets
import socketserver
import subprocess
import sys
import urllib.parse
import urllib.request
import webbrowser
from http.server import BaseHTTPRequestHandler
from http.server import HTTPServer
from pathlib import Path

SECRETS_FILE = Path("secrets.txt")
TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"
AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization"


def load_secrets_file(path: Path) -> dict[str, str]:
    values: dict[str, str] = {}
    if not path.is_file():
        return values

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key.strip()] = value.strip()
    return values


def get_config(name: str, fallback: str = "") -> str:
    env_value = os.getenv(name)
    if env_value is not None and env_value.strip():
        return env_value.strip()
    return CONFIG.get(name, fallback).strip()


def build_auth_url() -> str:
    return build_auth_url_with_state(state=None)


def build_auth_url_with_state(state: str | None) -> str:
    client_id = require("LINKEDIN_CLIENT_ID")
    redirect_uri = require("LINKEDIN_REDIRECT_URI")
    scopes = require("LINKEDIN_OAUTH_SCOPES")

    params = {
        "response_type": "code",
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "scope": scopes,
    }
    if state:
        params["state"] = state

    query = urllib.parse.urlencode(params, quote_via=urllib.parse.quote)
    return f"{AUTH_URL}?{query}"


def exchange_code(code: str) -> dict:
    payload = urllib.parse.urlencode(
        {
            "grant_type": "authorization_code",
            "code": code,
            "client_id": require("LINKEDIN_CLIENT_ID"),
            "client_secret": require("LINKEDIN_CLIENT_SECRET"),
            "redirect_uri": require("LINKEDIN_REDIRECT_URI"),
        }
    ).encode("utf-8")

    req = urllib.request.Request(
        TOKEN_URL,
        method="POST",
        data=payload,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )

    with urllib.request.urlopen(req, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def persist_secret(name: str, value: str, path: Path) -> None:
    lines: list[str] = []
    if path.exists():
        lines = path.read_text(encoding="utf-8").splitlines()

    updated = False
    for index, raw_line in enumerate(lines):
        if raw_line.startswith(f"{name}="):
            lines[index] = f"{name}={value}"
            updated = True
            break

    if not updated:
        if lines and lines[-1] != "":
            lines.append("")
        lines.append(f"{name}={value}")

    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def set_github_secret(repo: str, secret_name: str, secret_value: str) -> None:
    completed = subprocess.run(
        ["gh", "secret", "set", secret_name, "--repo", repo, "--body", secret_value],
        check=False,
        capture_output=True,
        text=True,
    )
    if completed.returncode != 0:
        raise RuntimeError(completed.stderr.strip() or completed.stdout.strip() or "gh secret set failed")


def parse_redirect_uri() -> tuple[str, int, str]:
    redirect_uri = require("LINKEDIN_REDIRECT_URI")
    parsed = urllib.parse.urlparse(redirect_uri)
    if parsed.scheme != "http" or parsed.hostname not in {"localhost", "127.0.0.1"}:
        raise RuntimeError("LINKEDIN_REDIRECT_URI must use http://localhost or http://127.0.0.1 for auto mode")
    return parsed.hostname, parsed.port or 80, parsed.path or "/"


class OAuthCallbackServer(HTTPServer):
    def __init__(self, server_address: tuple[str, int], handler_class, expected_state: str):
        super().__init__(server_address, handler_class)
        self.expected_state = expected_state
        self.authorization_code: str | None = None
        self.error_message: str | None = None


class OAuthCallbackHandler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:
        parsed = urllib.parse.urlparse(self.path)
        query = urllib.parse.parse_qs(parsed.query)
        state = query.get("state", [""])[0]
        code = query.get("code", [""])[0]
        error = query.get("error", [""])[0]

        if error:
            self.server.error_message = error
            self.respond(400, "Autorizacao recusada no LinkedIn.")
            return

        if state != self.server.expected_state:
            self.server.error_message = "OAuth state mismatch"
            self.respond(400, "Falha de validacao do state OAuth.")
            return

        if not code:
            self.server.error_message = "Authorization code missing"
            self.respond(400, "Codigo de autorizacao ausente.")
            return

        self.server.authorization_code = code
        self.respond(200, "Autorizacao concluida. Pode fechar esta aba e voltar ao terminal.")

    def log_message(self, format: str, *args) -> None:
        return

    def respond(self, status_code: int, message: str) -> None:
        safe_message = html.escape(message)
        body = (
            "<html><head><meta charset='utf-8'><title>LinkedIn OAuth</title></head>"
            f"<body><h1>{safe_message}</h1></body></html>"
        ).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def run_auto_flow(set_github_secret_flag: bool, repo: str | None, open_browser_flag: bool) -> dict:
    host, port, callback_path = parse_redirect_uri()
    state = secrets.token_urlsafe(24)
    auth_url = build_auth_url_with_state(state)

    class PathAwareHandler(OAuthCallbackHandler):
        def do_GET(self_inner) -> None:
            parsed = urllib.parse.urlparse(self_inner.path)
            if parsed.path != callback_path:
                self_inner.respond(404, "Callback nao encontrado.")
                return
            super(PathAwareHandler, self_inner).do_GET()

    with OAuthCallbackServer((host, port), PathAwareHandler, expected_state=state) as server:
        server.timeout = 300
        print(f"[linkedin-oauth-helper] Callback local aguardando em http://{host}:{port}{callback_path}")
        print(f"[linkedin-oauth-helper] Abra e autorize: {auth_url}")

        if open_browser_flag:
            webbrowser.open(auth_url)

        while server.authorization_code is None and server.error_message is None:
            server.handle_request()

        if server.error_message:
            raise RuntimeError(server.error_message)

        result = exchange_code(server.authorization_code)
        access_token = result.get("access_token", "").strip()
        if not access_token:
            raise RuntimeError("LinkedIn did not return access_token")

        persist_secret("LINKEDIN_ACCESS_TOKEN", access_token, SECRETS_FILE)
        print(f"[linkedin-oauth-helper] LINKEDIN_ACCESS_TOKEN salvo em {SECRETS_FILE}")

        if set_github_secret_flag:
            if not repo:
                raise RuntimeError("--repo is required when using --set-github-secret")
            set_github_secret(repo=repo, secret_name="LINKEDIN_ACCESS_TOKEN", secret_value=access_token)
            print(f"[linkedin-oauth-helper] GitHub secret LINKEDIN_ACCESS_TOKEN atualizado em {repo}")

        return result


def require(name: str) -> str:
    value = get_config(name)
    if not value:
        raise RuntimeError(f"Missing required configuration: {name}")
    return value


def main() -> int:
    parser = argparse.ArgumentParser(description="LinkedIn OAuth helper")
    subparsers = parser.add_subparsers(dest="command", required=True)

    subparsers.add_parser("auth-url", help="Print the LinkedIn authorization URL")

    exchange_parser = subparsers.add_parser(
        "exchange-code", help="Exchange an authorization code for an access token"
    )
    exchange_parser.add_argument("--code", required=True, help="Authorization code from LinkedIn redirect")

    auto_parser = subparsers.add_parser(
        "auto",
        help="Run the full localhost OAuth flow, save the token to secrets.txt, and optionally publish it to GitHub Secrets",
    )
    auto_parser.add_argument(
        "--set-github-secret",
        action="store_true",
        help="Also update the LINKEDIN_ACCESS_TOKEN GitHub Actions secret via gh CLI",
    )
    auto_parser.add_argument(
        "--repo",
        default="",
        help="GitHub repository in owner/name format for --set-github-secret",
    )
    auto_parser.add_argument(
        "--no-browser",
        action="store_true",
        help="Do not try to open the browser automatically; print the auth URL only",
    )

    args = parser.parse_args()

    try:
        if args.command == "auth-url":
            print(build_auth_url())
            return 0

        if args.command == "exchange-code":
            result = exchange_code(args.code)
            print(json.dumps(result, indent=2, ensure_ascii=False))
            return 0

        if args.command == "auto":
            result = run_auto_flow(
                set_github_secret_flag=args.set_github_secret,
                repo=args.repo.strip() or None,
                open_browser_flag=not args.no_browser,
            )
            print(json.dumps(result, indent=2, ensure_ascii=False))
            return 0

        parser.error("Unsupported command")
        return 2
    except Exception as exc:
        print(f"[linkedin-oauth-helper] ERROR: {exc}", file=sys.stderr)
        return 1


CONFIG = load_secrets_file(SECRETS_FILE)


if __name__ == "__main__":
    sys.exit(main())

#!/usr/bin/env python3
"""
Minimal Flask backend to exchange Google OAuth2 authorization code for tokens.
Updated: 2025-11-03 - Force redeploy to include super admin endpoints

Endpoints:
  - GET /health                      -> simple health check
  - OPTIONS/POST /oauth/google/token -> proxy to Google's token endpoint, adding client_secret

Environment variables:
  - APP_SECRET_KEY          : Flask secret key
  - PORT                     : Port to run locally (default 5051)
  - ORIGIN_ALLOWED           : CORS allowed origin (e.g., https://www.caracore.com.br)
  - GOOGLE_CLIENT_ID         : Google OAuth2 Client ID
  - GOOGLE_CLIENT_SECRET     : Google OAuth2 Client Secret
  - OAUTH_REDIRECT_URI       : The redirect URI used in the auth flow (must match Google Console)

Notes:
  - Do NOT expose client_secret to the front-end; this backend adds it server-side.
  - For production, host this under your API domain (e.g., https://api.caracore.com.br)
"""
from __future__ import annotations

import base64
import hashlib
import json
import logging
import os
import sys
import time
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Optional, cast
from urllib import parse, request as urlrequest, error as urlerror

APP_ROOT = Path(__file__).resolve().parent
SITE_PACKAGES = APP_ROOT / ".python_packages" / "lib" / "site-packages"
if SITE_PACKAGES.exists():
    sys.path.insert(0, str(SITE_PACKAGES))

import requests
from authlib.jose import JsonWebKey, jwt
from authlib.jose.errors import JoseError
from flask import Flask, jsonify, make_response, request


GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token"
AZURE_TOKEN_ENDPOINT_TEMPLATE = "https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token"
DEFAULT_AZURE_SCOPE = "openid profile email"


logger = logging.getLogger("cara-core-backend")
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(message)s"))
    logger.addHandler(handler)
logger.setLevel(logging.INFO)

# Import auth_manager para validação PKCE e logging
try:
    from auth_manager import PKCEValidator, AuditLogger
    PKCE_VALIDATION_ENABLED = True
    logger.info("Auth manager carregado - validação PKCE habilitada")
except ImportError:
    PKCE_VALIDATION_ENABLED = False
    logger.warning("auth_manager não disponível - validação PKCE desabilitada")

# Import rate_limiter para proteção contra força bruta
try:
    from rate_limiter import rate_limit, get_rate_limiter
    RATE_LIMITING_ENABLED = True
    logger.info("Rate limiter carregado - proteção contra força bruta habilitada")
except ImportError:
    RATE_LIMITING_ENABLED = False
    logger.warning("rate_limiter não disponível - rate limiting desabilitado")
    # Dummy decorator se não disponível
    def rate_limit(endpoint=None):
        def decorator(f):
            return f
        return decorator

# Import security para HTTPS enforcement e headers
try:
    from security import add_security_headers, require_https, log_security_event
    SECURITY_HEADERS_ENABLED = True
    logger.info("Security module carregado - HTTPS enforcement e headers habilitados")
except ImportError:
    SECURITY_HEADERS_ENABLED = False
    logger.warning("security module não disponível - security headers desabilitados")
    # Dummy decorator se não disponível
    def require_https(f):
        return f
    def add_security_headers(response):
        return response

# Import authorization para controle de acesso
try:
    from authorization import (
        is_user_authorized, get_user_role, add_authorized_user, 
        remove_authorized_user, add_pending_request, load_authorized_users
    )
    AUTHORIZATION_ENABLED = True
    logger.info("Authorization module carregado - controle de acesso habilitado")
except ImportError:
    AUTHORIZATION_ENABLED = False
    logger.warning("authorization module não disponível - controle de acesso desabilitado")


class HTTPRequestError(RuntimeError):
    """Raised when the token exchange HTTP call fails."""


class IDTokenValidationError(RuntimeError):
    """Raised when ID token validation fails."""

    def __init__(self, code: str, description: str = "") -> None:
        super().__init__(description or code)
        self.code = code
        self.description = description or code


@dataclass
class SimpleHTTPResponse:
    status_code: int
    headers: dict[str, str]
    _body: bytes

    @property
    def text(self) -> str:
        return self._body.decode("utf-8", errors="replace")

    def json(self) -> dict:
        return json.loads(self.text)


def post_form(url: str, data: dict[str, str], *, timeout: int = 15) -> SimpleHTTPResponse:
    encoded = parse.urlencode({k: v for k, v in data.items() if v is not None}).encode("utf-8")
    req = urlrequest.Request(url, data=encoded, method="POST")
    req.add_header("Content-Type", "application/x-www-form-urlencoded")
    try:
        with urlrequest.urlopen(req, timeout=timeout) as resp:
            body = resp.read()
            headers = {k: v for k, v in resp.headers.items()}
            return SimpleHTTPResponse(resp.status, headers, body)
    except urlerror.HTTPError as exc:
        body = exc.read() if exc.fp else b""
        headers = {k: v for k, v in exc.headers.items()} if exc.headers else {}
        return SimpleHTTPResponse(exc.code, headers, body)
    except urlerror.URLError as exc:
        raise HTTPRequestError(str(exc)) from exc


JWKS_CACHE: Dict[str, Dict[str, Any]] = {}
DEFAULT_JWKS_TTL = max(int(os.getenv("JWKS_CACHE_TTL_SECONDS", "300")), 60)


def _parse_cache_control(header_value: Optional[str]) -> Optional[int]:
    if not header_value:
        return None
    directives = [part.strip() for part in header_value.split(",")]
    for directive in directives:
        if directive.startswith("max-age="):
            try:
                return max(int(directive.split("=", 1)[1]), 60)
            except (ValueError, TypeError):
                return None
    return None


def fetch_jwks(url: str) -> Dict[str, Any]:
    now = time.time()
    cached = JWKS_CACHE.get(url)
    if cached and cached.get("expires_at", 0) > now:
        return cached["jwks"]

    logger.debug("Fetching JWKS", extra={"jwks_url": url})
    response = requests.get(url, timeout=10)
    response.raise_for_status()
    jwks = response.json()
    ttl = _parse_cache_control(response.headers.get("Cache-Control")) or DEFAULT_JWKS_TTL
    JWKS_CACHE[url] = {"jwks": jwks, "expires_at": now + ttl}
    return jwks


def _status_from_validation_error(error: IDTokenValidationError) -> int:
    if error.code in {"unauthorized_domain", "tenant_mismatch"}:
        return 403
    if error.code in {"invalid_request", "missing_id_token"}:
        return 400
    return 502


def response_from_validation_error(error: IDTokenValidationError) -> tuple[dict[str, str], int]:
    body = {
        "error": error.code,
        "error_description": error.description or error.code,
    }
    return body, _status_from_validation_error(error)


def _hash_name_from_alg(alg: Optional[str]) -> Optional[str]:
    if not alg:
        return None
    alg = alg.upper()
    if alg.endswith("256"):
        return "sha256"
    if alg.endswith("384"):
        return "sha384"
    if alg.endswith("512"):
        return "sha512"
    return None


def _validate_at_hash(
    access_token: Optional[str],
    claims: Dict[str, Any],
    header: Dict[str, Any],
) -> None:
    if not access_token:
        return
    at_hash_claim = claims.get("at_hash")
    if not at_hash_claim:
        return
    hash_name = _hash_name_from_alg(header.get("alg"))
    if not hash_name:
        raise IDTokenValidationError(
            "unsupported_at_hash_alg",
            f"Algoritmo {header.get('alg')} não suportado para validar at_hash",
        )
    digest = hashlib.new(hash_name, access_token.encode("utf-8")).digest()
    truncated = digest[: len(digest) // 2]
    computed = base64.urlsafe_b64encode(truncated).rstrip(b"=").decode("ascii")
    if computed != at_hash_claim:
        raise IDTokenValidationError(
            "at_hash_mismatch",
            "at_hash do ID token não corresponde ao access token recebido",
        )


def _validate_nonce(claims: Dict[str, Any], expected_nonce: Optional[str]) -> None:
    if expected_nonce is None:
        return
    expected = expected_nonce.strip()
    if not expected:
        return
    token_nonce = str(claims.get("nonce") or "").strip()
    if not token_nonce:
        raise IDTokenValidationError("missing_nonce", "ID token não contém nonce para validação")
    if token_nonce != expected:
        raise IDTokenValidationError(
            "nonce_mismatch",
            "Nonce recebido no ID token não corresponde ao esperado",
        )


def validate_google_id_token(
    token: str,
    audience: str,
    *,
    allowed_domains: Optional[list[str]] = None,
    expected_nonce: Optional[str] = None,
    access_token: Optional[str] = None,
) -> Dict[str, Any]:
    if not token:
        raise IDTokenValidationError("missing_id_token", "Resposta do Google não contém id_token")

    jwks = fetch_jwks("https://www.googleapis.com/oauth2/v3/certs")
    keys = JsonWebKey.import_key_set(jwks)
    try:
        claims = jwt.decode(
            token,
            keys,
            claims_options={
                "aud": {"essential": True, "values": [audience]},
                "exp": {"essential": True},
                "iat": {"essential": True},
            },
        )
        claims.validate(leeway=60)
    except JoseError as exc:
        raise IDTokenValidationError("invalid_id_token", str(exc)) from exc

    header = getattr(claims, "header", {}) or {}
    issuer = claims.get("iss")
    if issuer not in {"https://accounts.google.com", "accounts.google.com"}:
        raise IDTokenValidationError("invalid_issuer", f"Issuer inesperado: {issuer}")

    claims_dict = dict(claims)
    _validate_nonce(claims_dict, expected_nonce)
    _validate_at_hash(access_token, claims_dict, header)

    if allowed_domains:
        hd_claim = (claims_dict.get("hd") or "").lower()
        if not hd_claim or hd_claim not in allowed_domains:
            raise IDTokenValidationError(
                "unauthorized_domain",
                f"Domínio {hd_claim or '<vazio>'} não autorizado para login Google",
            )

    return claims_dict


def validate_microsoft_id_token(
    token: str,
    audience: str,
    *,
    tenant_hint: Optional[str] = None,
    expected_tenant: Optional[str] = None,
    expected_nonce: Optional[str] = None,
    access_token: Optional[str] = None,
) -> Dict[str, Any]:
    if not token:
        raise IDTokenValidationError("missing_id_token", "Resposta da Microsoft não contém id_token")

    tenant_value = (tenant_hint or expected_tenant or "common").strip() or "common"
    jwks_url = f"https://login.microsoftonline.com/{tenant_value}/discovery/v2.0/keys"
    jwks = fetch_jwks(jwks_url)
    keys = JsonWebKey.import_key_set(jwks)
    try:
        claims = jwt.decode(
            token,
            keys,
            claims_options={
                "aud": {"essential": True, "values": [audience]},
                "exp": {"essential": True},
                "iat": {"essential": True},
            },
        )
        claims.validate(leeway=60)
    except JoseError as exc:
        raise IDTokenValidationError("invalid_id_token", str(exc)) from exc

    header = getattr(claims, "header", {}) or {}
    claims_dict = dict(claims)
    _validate_nonce(claims_dict, expected_nonce)
    _validate_at_hash(access_token, claims_dict, header)

    issuer = claims.get("iss")
    if not (isinstance(issuer, str) and issuer.startswith("https://login.microsoftonline.com/") and issuer.endswith("/v2.0")):
        raise IDTokenValidationError("invalid_issuer", f"Issuer inesperado: {issuer}")

    token_tid = (claims_dict.get("tid") or "").lower()
    if expected_tenant and expected_tenant.lower() not in {"common", "organizations", "consumers"}:
        if token_tid and token_tid != expected_tenant.lower():
            raise IDTokenValidationError(
                "tenant_mismatch",
                f"Token emitido para tenant {token_tid}, esperado {expected_tenant.lower()}",
            )

    return claims_dict


def create_app() -> Flask:
    app = Flask(__name__)
    app.secret_key = os.getenv("APP_SECRET_KEY", os.urandom(32))

    allowed_origin = os.getenv("ORIGIN_ALLOWED", "*")
    google_client_id = os.getenv("GOOGLE_CLIENT_ID")
    google_client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
    google_allowed_domains_env = os.getenv("GOOGLE_ALLOWED_DOMAINS", "")
    default_redirect = os.getenv("OAUTH_REDIRECT_URI")
    azure_client_id = os.getenv("AZURE_CLIENT_ID")
    azure_client_secret = os.getenv("AZURE_CLIENT_SECRET")
    azure_tenant_id = os.getenv("AZURE_TENANT_ID")
    azure_scope_env = os.getenv("AZURE_SCOPE")
    azure_token_endpoint_env = os.getenv("AZURE_TOKEN_ENDPOINT")

    def resolve_azure_token_endpoint(tenant_override: Optional[str] = None) -> str:
        tenant_value = tenant_override or azure_tenant_id or "common"
        template = azure_token_endpoint_env or AZURE_TOKEN_ENDPOINT_TEMPLATE
        if "{tenant}" in template:
            return template.format(tenant=tenant_value)
        return template

    azure_default_scope = azure_scope_env or DEFAULT_AZURE_SCOPE

    google_allowed_domains_list = [entry.strip().lower() for entry in google_allowed_domains_env.split(",") if entry.strip()]
    google_allowed_domains = google_allowed_domains_list or None

    logger.info("Backend inicializado. allowed_origin=%s", allowed_origin or "<empty>")
    if google_client_id:
        logger.info("GOOGLE_CLIENT_ID configurado (valor oculto)")
    else:
        logger.warning("GOOGLE_CLIENT_ID not set - OAuth flow will fail")
    if google_client_secret:
        logger.info("GOOGLE_CLIENT_SECRET carregado do ambiente")
    else:
        logger.warning("GOOGLE_CLIENT_SECRET not set - /oauth/google/token will return HTTP 500")
    if google_allowed_domains:
        logger.info("Google allowed domains restritos a: %s", ", ".join(google_allowed_domains))
    if azure_client_id:
        logger.info("AZURE_CLIENT_ID configurado (valor oculto)")
    else:
        logger.warning("AZURE_CLIENT_ID nao definido - login Microsoft falhara")
    if azure_client_secret:
        logger.info("AZURE_CLIENT_SECRET carregado do ambiente")
    else:
        logger.warning("AZURE_CLIENT_SECRET nao definido - /oauth/microsoft/token retornara erro 500")
    if azure_tenant_id:
        logger.info("AZURE_TENANT_ID definido (valor oculto)")
    else:
        logger.warning("AZURE_TENANT_ID nao definido - usando tenant 'common'")
    logger.info("Token endpoint Microsoft configurado: %s", resolve_azure_token_endpoint())
    if not default_redirect:
        logger.warning("OAUTH_REDIRECT_URI not set - using value provided by client")

    def add_cors(resp):
        # Basic CORS: limit to configured origin if provided, else '*'
        origin = request.headers.get("Origin")
        if allowed_origin and allowed_origin != "*":
            # Allow if matches configured origin exactly
            if origin == allowed_origin:
                resp.headers["Access-Control-Allow-Origin"] = allowed_origin
            else:
                # If strict, do not add CORS for other origins
                pass
        else:
            resp.headers["Access-Control-Allow-Origin"] = "*"
        resp.headers["Vary"] = "Origin"
        resp.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        resp.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        # We are not using cookies by default in this minimal example
        # resp.headers["Access-Control-Allow-Credentials"] = "true"
        return resp

    @app.route("/health", methods=["GET"])  # simple probe
    def health():
        return add_cors(make_response(jsonify({"status": "ok"}), 200))

    @app.route("/health/detailed", methods=["GET"])  # detailed health check
    def health_detailed():
        """
        Endpoint de health check detalhado com verificações de:
        - Dependências Python
        - Variáveis de ambiente (secrets)
        - Conectividade com provedores OAuth
        - Status do sistema
        """
        import sys
        from datetime import datetime
        
        health_status = {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "checks": {},
            "version": {
                "python": sys.version.split()[0],
            }
        }
        
        # 1. Verificar dependências
        try:
            import flask
            import authlib
            import requests as req_module
            health_status["checks"]["dependencies"] = {
                "status": "ok",
                "versions": {
                    "flask": flask.__version__,
                    "authlib": authlib.__version__,
                    "requests": req_module.__version__,
                }
            }
        except ImportError as e:
            health_status["checks"]["dependencies"] = {
                "status": "error",
                "error": f"Missing dependency: {str(e)}"
            }
            health_status["status"] = "unhealthy"
        
        # 2. Verificar variáveis de ambiente (secrets)
        required_env_vars = [
            "GOOGLE_CLIENT_ID",
            "GOOGLE_CLIENT_SECRET",
            "MICROSOFT_CLIENT_ID",
            "MICROSOFT_CLIENT_SECRET",
            "MICROSOFT_TENANT_ID",
        ]
        
        env_status = {}
        for var in required_env_vars:
            value = os.getenv(var)
            if value:
                # Mostrar apenas primeiros 8 caracteres (mascarado)
                masked = value[:8] + "..." if len(value) > 8 else "***"
                env_status[var] = {"status": "ok", "value": masked}
            else:
                env_status[var] = {"status": "missing"}
                health_status["status"] = "degraded"
        
        health_status["checks"]["environment"] = env_status
        
        # 3. Verificar conectividade com provedores OAuth (opcional, pode ser lento)
        # Apenas verificar se os endpoints estão acessíveis (sem autenticar)
        oauth_providers = {
            "google": "https://accounts.google.com/.well-known/openid-configuration",
            "microsoft": f"https://login.microsoftonline.com/{os.getenv('MICROSOFT_TENANT_ID', 'common')}/.well-known/openid-configuration"
        }
        
        provider_status = {}
        for provider, url in oauth_providers.items():
            try:
                resp = requests.get(url, timeout=5)
                if resp.status_code == 200:
                    provider_status[provider] = {
                        "status": "ok",
                        "response_time_ms": int(resp.elapsed.total_seconds() * 1000)
                    }
                else:
                    provider_status[provider] = {
                        "status": "error",
                        "http_status": resp.status_code
                    }
                    health_status["status"] = "degraded"
            except Exception as e:
                provider_status[provider] = {
                    "status": "error",
                    "error": str(e)
                }
                health_status["status"] = "degraded"
        
        health_status["checks"]["oauth_providers"] = provider_status
        
        # 4. Verificar sistema de logs
        try:
            log_dir = APP_ROOT / "logs"
            if log_dir.exists():
                log_files = list(log_dir.glob("*.jsonl"))
                health_status["checks"]["logging"] = {
                    "status": "ok",
                    "log_directory": str(log_dir),
                    "log_files_count": len(log_files)
                }
            else:
                health_status["checks"]["logging"] = {
                    "status": "warning",
                    "message": "Log directory does not exist"
                }
        except Exception as e:
            health_status["checks"]["logging"] = {
                "status": "error",
                "error": str(e)
            }
        
        # Determinar código de status HTTP baseado no health_status
        status_code = 200 if health_status["status"] == "healthy" else 503
        if health_status["status"] == "degraded":
            status_code = 200  # Still operational but with warnings
        
        return add_cors(make_response(jsonify(health_status), status_code))

    @app.route("/oauth/google/token", methods=["OPTIONS"])  # CORS preflight
    def google_token_options():
        return add_cors(make_response("", 204))

    @app.route("/oauth/google/token", methods=["POST"])  # code exchange
    @require_https
    @rate_limit("/oauth/google/token")
    def google_token():
        logger.info(
            "Recebido POST /oauth/google/token de %s (content-type=%s)",
            request.remote_addr,
            request.content_type,
        )
        # Accept both JSON and x-www-form-urlencoded
        payload = {}
        if request.content_type and request.content_type.startswith("application/json"):
            try:
                payload = request.get_json(force=True) or {}
            except Exception:
                logger.warning("Falha ao decodificar JSON recebido no token endpoint", exc_info=True)
                payload = {}
        else:
            # Read form values
            payload = request.form.to_dict() if request.form else {}

        # Extract required fields
        code = payload.get("code")
        code_verifier = payload.get("code_verifier")
        code_challenge = payload.get("code_challenge")  # Para validação PKCE
        grant_type = payload.get("grant_type", "authorization_code")
        redirect_uri = payload.get("redirect_uri") or default_redirect

        # Log tentativa de autenticação
        client_ip = request.remote_addr
        if PKCE_VALIDATION_ENABLED:
            AuditLogger.log_token_exchange(
                provider="google",
                success=False,  # Será atualizado depois
                has_pkce=bool(code_verifier),
                client_ip=client_ip
            )

        # Basic validation
        missing = [k for k in ("code", "code_verifier") if not payload.get(k)]
        if missing:
            logger.warning("Invalid request - missing fields: %s", ", ".join(missing))
            if PKCE_VALIDATION_ENABLED:
                AuditLogger.log_token_exchange(
                    provider="google",
                    success=False,
                    has_pkce=bool(code_verifier),
                    client_ip=client_ip,
                    error_code="invalid_request"
                )
            resp = make_response(jsonify({
                "error": "invalid_request",
                "error_description": f"Missing fields: {', '.join(missing)}"
            }), 400)
            return add_cors(resp)

        # Validação PKCE (OAuth 2.1 obrigatório)
        # TODO: Implementar armazenamento de code_challenge durante authorization
        # Por enquanto, aceita code_challenge no request para validação
        if PKCE_VALIDATION_ENABLED and code_challenge:
            pkce_result = PKCEValidator.validate(
                code_verifier=code_verifier,
                code_challenge=code_challenge,
                method="S256"
            )
            
            if not pkce_result.valid:
                logger.warning(
                    "PKCE validation failed: %s - %s",
                    pkce_result.error_code,
                    pkce_result.error_description
                )
                AuditLogger.log_suspicious_activity(
                    activity_type="pkce_validation_failed",
                    details=pkce_result.error_description or "Invalid PKCE",
                    client_ip=client_ip
                )
                resp = make_response(jsonify({
                    "error": pkce_result.error_code,
                    "error_description": pkce_result.error_description
                }), 400)
                return add_cors(resp)
            
            logger.info("PKCE validation successful")
        elif PKCE_VALIDATION_ENABLED:
            # PKCE é obrigatório mas code_challenge não foi fornecido
            # Isso indica que o cliente não implementou PKCE corretamente
            logger.warning("PKCE required but code_challenge not provided")
            # Por ora, apenas log - para não quebrar clientes existentes
            # Em produção, descomentar abaixo para forçar PKCE:
            # resp = make_response(jsonify({
            #     "error": "invalid_request",
            #     "error_description": "PKCE is required (code_challenge missing)"
            # }), 400)
            # return add_cors(resp)

        if not google_client_id or not google_client_secret:
            logger.error("Credenciais Google ausentes no ambiente - respondendo erro 500")
            resp = make_response(jsonify({
                "error": "server_error",
                "error_description": "Server not configured with Google client credentials"
            }), 500)
            return add_cors(resp)

        # Forward to Google token endpoint with server-side client_secret
        client_id = cast(str, google_client_id)
        data = {
            "client_id": client_id,
            "client_secret": google_client_secret,
            "code": code,
            "code_verifier": code_verifier,
            "grant_type": grant_type,
            "redirect_uri": redirect_uri,
        }

        logger.info(
            "[Step5] Iniciando troca de token com Google (redirect_uri=%s, code_len=%s)",
            redirect_uri,
            len(code or ""),
        )

        try:
            g_resp = post_form(GOOGLE_TOKEN_ENDPOINT, data, timeout=15)
        except HTTPRequestError as e:
            logger.error("Falha ao chamar Google Token Endpoint: %s", e)
            resp = make_response(jsonify({
                "error": "network_error",
                "error_description": str(e)
            }), 502)
            return add_cors(resp)

        # Pass-through response
        body: dict[str, Any]
        try:
            parsed_body = g_resp.json()
            if isinstance(parsed_body, dict):
                body = cast(dict[str, Any], parsed_body)
            else:
                logger.warning("Resposta do Google nao é um objeto JSON. Encapsulando em 'raw'.")
                body = {"raw": parsed_body}
        except Exception:
            logger.warning("Google response was not JSON (status=%s)", g_resp.status_code)
            # If Google returns non-JSON, forward text
            body = {"raw": g_resp.text}

        if g_resp.status_code == 200:
            logger.info(
                "[Step5] Troca concluida com sucesso (scope=%s, expires_in=%s, id_token=%s, access_token=%s)",
                body.get("scope"),
                body.get("expires_in"),
                "presente" if body.get("id_token") else "ausente",
                "presente" if body.get("access_token") else "ausente",
            )
            if body.get("id_token"):
                try:
                    allowed_domains = google_allowed_domains or None
                    claims = validate_google_id_token(
                        body["id_token"],
                        client_id,
                        allowed_domains=allowed_domains,
                        expected_nonce=payload.get("nonce"),
                        access_token=body.get("access_token"),
                    )
                    logger.info(
                        "ID token Google validado com sucesso (sub=%s, email=%s)",
                        claims.get("sub"),
                        claims.get("email"),
                    )
                    # Log sucesso da autenticação
                    if PKCE_VALIDATION_ENABLED:
                        AuditLogger.log_auth_attempt(
                            provider="google",
                            success=True,
                            client_ip=client_ip,
                            user_id=claims.get("sub")
                        )
                except IDTokenValidationError as exc:
                    logger.error(
                        "Falha ao validar ID token Google: %s - %s",
                        exc.code,
                        exc.description,
                    )
                    error_body, status_code = response_from_validation_error(exc)
                    resp = make_response(jsonify(error_body), status_code)
                    return add_cors(resp)
        else:
            logger.warning(
                "[Step5] Google retornou status %s - error=%s description=%s",
                g_resp.status_code,
                body.get("error"),
                body.get("error_description"),
            )

        logger.info("Resposta do Google encaminhada com status %s", g_resp.status_code)
        resp = make_response(jsonify(body), g_resp.status_code)
        resp.headers["Content-Type"] = "application/json"
        return add_cors(resp)

    @app.route("/oauth/microsoft/token", methods=["OPTIONS"])  # CORS preflight
    def microsoft_token_options():
        return add_cors(make_response("", 204))

    @app.route("/oauth/microsoft/token", methods=["POST"])  # code exchange
    @require_https
    @rate_limit("/oauth/microsoft/token")
    def microsoft_token():
        logger.info(
            "Recebido POST /oauth/microsoft/token de %s (content-type=%s)",
            request.remote_addr,
            request.content_type,
        )
        payload = {}
        if request.content_type and request.content_type.startswith("application/json"):
            try:
                payload = request.get_json(force=True) or {}
            except Exception:
                logger.warning("Falha ao decodificar JSON recebido no token endpoint Microsoft", exc_info=True)
                payload = {}
        else:
            payload = request.form.to_dict() if request.form else {}

        code = payload.get("code")
        code_verifier = payload.get("code_verifier")
        code_challenge = payload.get("code_challenge")  # Para validação PKCE
        grant_type = payload.get("grant_type", "authorization_code")
        redirect_uri = payload.get("redirect_uri") or default_redirect
        scope = payload.get("scope") or azure_default_scope
        tenant_override = payload.get("tenant")

        # Log tentativa de autenticação
        client_ip = request.remote_addr
        if PKCE_VALIDATION_ENABLED:
            AuditLogger.log_token_exchange(
                provider="microsoft",
                success=False,  # Será atualizado depois
                has_pkce=bool(code_verifier),
                client_ip=client_ip
            )

        missing = [k for k in ("code", "code_verifier") if not payload.get(k)]
        if missing:
            logger.warning("Requisicao invalida para Microsoft - campos ausentes: %s", ", ".join(missing))
            if PKCE_VALIDATION_ENABLED:
                AuditLogger.log_token_exchange(
                    provider="microsoft",
                    success=False,
                    has_pkce=bool(code_verifier),
                    client_ip=client_ip,
                    error_code="invalid_request"
                )
            resp = make_response(jsonify({
                "error": "invalid_request",
                "error_description": f"Missing fields: {', '.join(missing)}"
            }), 400)
            return add_cors(resp)

        # Validação PKCE (OAuth 2.1 obrigatório)
        if PKCE_VALIDATION_ENABLED and code_challenge:
            pkce_result = PKCEValidator.validate(
                code_verifier=code_verifier,
                code_challenge=code_challenge,
                method="S256"
            )
            
            if not pkce_result.valid:
                logger.warning(
                    "PKCE validation failed (Microsoft): %s - %s",
                    pkce_result.error_code,
                    pkce_result.error_description
                )
                AuditLogger.log_suspicious_activity(
                    activity_type="pkce_validation_failed",
                    details=f"Microsoft: {pkce_result.error_description}",
                    client_ip=client_ip
                )
                resp = make_response(jsonify({
                    "error": pkce_result.error_code,
                    "error_description": pkce_result.error_description
                }), 400)
                return add_cors(resp)
            
            logger.info("PKCE validation successful (Microsoft)")

        if not azure_client_id or not azure_client_secret:
            logger.error("Credenciais Microsoft ausentes no ambiente - respondendo erro 500")
            resp = make_response(jsonify({
                "error": "server_error",
                "error_description": "Server not configured with Microsoft Entra client credentials"
            }), 500)
            return add_cors(resp)

        token_endpoint = resolve_azure_token_endpoint(tenant_override)
        client_id = cast(str, azure_client_id)

        data = {
            "client_id": client_id,
            "client_secret": azure_client_secret,
            "code": code,
            "code_verifier": code_verifier,
            "grant_type": grant_type,
            "redirect_uri": redirect_uri,
        }
        if scope:
            data["scope"] = scope

        try:
            ms_resp = post_form(token_endpoint, data, timeout=15)
        except HTTPRequestError as e:
            logger.error("Falha ao chamar Microsoft Token Endpoint: %s", e)
            resp = make_response(jsonify({
                "error": "network_error",
                "error_description": str(e)
            }), 502)
            return add_cors(resp)

        body: dict[str, Any]
        try:
            parsed_ms_body = ms_resp.json()
            if isinstance(parsed_ms_body, dict):
                body = cast(dict[str, Any], parsed_ms_body)
            else:
                logger.warning("Resposta da Microsoft nao é um objeto JSON. Encapsulando em 'raw'.")
                body = {"raw": parsed_ms_body}
        except Exception:
            logger.warning("Resposta da Microsoft nao estava em JSON (status=%s)", ms_resp.status_code)
            body = {"raw": ms_resp.text}

        if ms_resp.status_code == 200:
            logger.info(
                "Troca com Microsoft concluida (scope=%s, expires_in=%s, id_token=%s, access_token=%s)",
                body.get("scope"),
                body.get("expires_in"),
                "presente" if body.get("id_token") else "ausente",
                "presente" if body.get("access_token") else "ausente",
            )
            if body.get("id_token"):
                try:
                    claims = validate_microsoft_id_token(
                        body["id_token"],
                        client_id,
                        tenant_hint=tenant_override,
                        expected_tenant=azure_tenant_id,
                        expected_nonce=payload.get("nonce"),
                        access_token=body.get("access_token"),
                    )
                    logger.info(
                        "ID token Microsoft validado com sucesso (oid=%s, preferred_username=%s)",
                        claims.get("oid"),
                        claims.get("preferred_username"),
                    )
                    # Log sucesso da autenticação
                    if PKCE_VALIDATION_ENABLED:
                        AuditLogger.log_auth_attempt(
                            provider="microsoft",
                            success=True,
                            client_ip=client_ip,
                            user_id=claims.get("oid")
                        )
                except IDTokenValidationError as exc:
                    logger.error(
                        "Falha ao validar ID token Microsoft: %s - %s",
                        exc.code,
                        exc.description,
                    )
                    error_body, status_code = response_from_validation_error(exc)
                    resp = make_response(jsonify(error_body), status_code)
                    return add_cors(resp)
        else:
            logger.warning(
                "Microsoft retornou status %s - error=%s description=%s",
                ms_resp.status_code,
                body.get("error"),
                body.get("error_description"),
            )

        logger.info("Resposta da Microsoft encaminhada com status %s", ms_resp.status_code)
        resp = make_response(jsonify(body), ms_resp.status_code)
        resp.headers["Content-Type"] = "application/json"
        return add_cors(resp)


    @app.route("/auth/token/refresh", methods=["OPTIONS"])
    def refresh_token_options():
        return add_cors(make_response("", 204))
    
    @app.route("/auth/token/refresh", methods=["POST"])
    @require_https
    @rate_limit("/auth/token/refresh")
    def refresh_token():
        """
        Endpoint para refresh token rotation (OAuth 2.1)
        
        Aceita refresh_token e retorna novo access_token + novo refresh_token
        """
        client_ip = request.headers.get("X-Forwarded-For", request.remote_addr)
        
        try:
            data = request.get_json() or {}
            refresh_token_val = data.get("refresh_token", "")
            provider = data.get("provider", "")  # google ou microsoft
            
            if not refresh_token_val or not provider:
                if PKCE_VALIDATION_ENABLED:
                    AuditLogger.log_suspicious_activity(
                        activity_type="refresh_missing_params",
                        details=f"refresh_token ou provider ausente",
                        client_ip=client_ip
                    )
                resp = make_response(jsonify({
                    "error": "invalid_request",
                    "error_description": "refresh_token e provider são obrigatórios"
                }), 400)
                return add_cors(resp)
            
            # Preparar requisição para provedor OAuth
            if provider.lower() == "google":
                token_url = GOOGLE_TOKEN_ENDPOINT
                payload = {
                    "client_id": os.getenv("GOOGLE_CLIENT_ID"),
                    "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
                    "refresh_token": refresh_token_val,
                    "grant_type": "refresh_token"
                }
            elif provider.lower() == "microsoft":
                tenant = os.getenv("AZURE_TENANT_ID", "common")
                token_url = AZURE_TOKEN_ENDPOINT_TEMPLATE.format(tenant=tenant)
                payload = {
                    "client_id": os.getenv("MICROSOFT_CLIENT_ID"),
                    "client_secret": os.getenv("MICROSOFT_CLIENT_SECRET"),
                    "refresh_token": refresh_token_val,
                    "grant_type": "refresh_token",
                    "scope": DEFAULT_AZURE_SCOPE
                }
            else:
                if PKCE_VALIDATION_ENABLED:
                    AuditLogger.log_suspicious_activity(
                        activity_type="refresh_invalid_provider",
                        details=f"Provider inválido: {provider}",
                        client_ip=client_ip
                    )
                resp = make_response(jsonify({
                    "error": "invalid_request",
                    "error_description": f"Provider não suportado: {provider}"
                }), 400)
                return add_cors(resp)
            
            # Trocar refresh_token por novo access_token
            logger.info("Refresh token request", extra={"provider": provider, "client_ip": client_ip})
            response = post_form(token_url, payload)
            
            if response.status_code != 200:
                error_body = response.text
                logger.warning("Refresh token failed", extra={
                    "provider": provider,
                    "status": response.status_code,
                    "error": error_body,
                    "client_ip": client_ip
                })
                if PKCE_VALIDATION_ENABLED:
                    AuditLogger.log_token_exchange(
                        provider=provider,
                        success=False,
                        has_pkce=False,
                        client_ip=client_ip,
                        error=error_body
                    )
                resp = make_response(jsonify({
                    "error": "invalid_grant",
                    "error_description": "Refresh token inválido ou expirado"
                }), 400)
                return add_cors(resp)
            
            token_response = response.json()
            
            # Log de sucesso
            if PKCE_VALIDATION_ENABLED:
                AuditLogger.log_token_exchange(
                    provider=provider,
                    success=True,
                    has_pkce=False,
                    client_ip=client_ip
                )
            
            logger.info("Refresh token success", extra={"provider": provider, "client_ip": client_ip})
            
            resp = make_response(jsonify(token_response), 200)
            return add_cors(resp)
        
        except Exception as e:
            logger.error("Refresh token exception", extra={"error": str(e), "client_ip": client_ip}, exc_info=True)
            if PKCE_VALIDATION_ENABLED:
                AuditLogger.log_suspicious_activity(
                    activity_type="refresh_exception",
                    details=str(e),
                    client_ip=client_ip
                )
            resp = make_response(jsonify({
                "error": "server_error",
                "error_description": "Erro interno do servidor"
            }), 500)
            return add_cors(resp)
    
    @app.route("/auth/validate", methods=["OPTIONS"])
    def validate_session_options():
        return add_cors(make_response("", 204))
    
    @app.route("/auth/validate", methods=["POST"])
    @rate_limit("/auth/validate")
    def validate_session():
        """
        Endpoint para validar sessão/token
        
        Aceita access_token e valida se ainda é válido
        Retorna informações do usuário se válido
        """
        client_ip = request.headers.get("X-Forwarded-For", request.remote_addr)
        
        try:
            data = request.get_json() or {}
            access_token = data.get("access_token", "")
            provider = data.get("provider", "")
            
            if not access_token or not provider:
                resp = make_response(jsonify({
                    "error": "invalid_request",
                    "error_description": "access_token e provider são obrigatórios"
                }), 400)
                return add_cors(resp)
            
            # Validar token com provedor
            if provider.lower() == "google":
                # Google tokeninfo endpoint
                info_url = f"https://oauth2.googleapis.com/tokeninfo?access_token={access_token}"
                response = requests.get(info_url, timeout=10)
                
                if response.status_code != 200:
                    logger.info("Token validation failed", extra={"provider": provider, "client_ip": client_ip})
                    resp = make_response(jsonify({
                        "valid": False,
                        "error": "invalid_token"
                    }), 200)
                    return add_cors(resp)
                
                token_info = response.json()
                
                # Verificar se token pertence ao nosso client_id
                expected_client_id = os.getenv("GOOGLE_CLIENT_ID")
                if token_info.get("aud") != expected_client_id:
                    logger.warning("Token validation - wrong audience", extra={
                        "provider": provider,
                        "expected": expected_client_id,
                        "actual": token_info.get("aud"),
                        "client_ip": client_ip
                    })
                    resp = make_response(jsonify({
                        "valid": False,
                        "error": "invalid_token"
                    }), 200)
                    return add_cors(resp)
                
                # Token válido
                resp = make_response(jsonify({
                    "valid": True,
                    "user": {
                        "id": token_info.get("sub"),
                        "email": token_info.get("email"),
                        "email_verified": token_info.get("email_verified") == "true",
                        "expires_in": int(token_info.get("exp", 0)) - int(time.time())
                    }
                }), 200)
                return add_cors(resp)
            
            elif provider.lower() == "microsoft":
                # Microsoft usa UserInfo endpoint
                userinfo_url = "https://graph.microsoft.com/oidc/userinfo"
                headers = {"Authorization": f"Bearer {access_token}"}
                response = requests.get(userinfo_url, headers=headers, timeout=10)
                
                if response.status_code != 200:
                    logger.info("Token validation failed", extra={"provider": provider, "client_ip": client_ip})
                    resp = make_response(jsonify({
                        "valid": False,
                        "error": "invalid_token"
                    }), 200)
                    return add_cors(resp)
                
                userinfo = response.json()
                
                # Token válido
                resp = make_response(jsonify({
                    "valid": True,
                    "user": {
                        "id": userinfo.get("sub"),
                        "email": userinfo.get("email"),
                        "name": userinfo.get("name"),
                        "email_verified": userinfo.get("email_verified", False)
                    }
                }), 200)
                return add_cors(resp)
            
            else:
                resp = make_response(jsonify({
                    "error": "invalid_request",
                    "error_description": f"Provider não suportado: {provider}"
                }), 400)
                return add_cors(resp)
        
        except Exception as e:
            logger.error("Validate session exception", extra={"error": str(e), "client_ip": client_ip}, exc_info=True)
            resp = make_response(jsonify({
                "error": "server_error",
                "error_description": "Erro interno do servidor"
            }), 500)
            return add_cors(resp)
    
    @app.route("/auth/logout", methods=["OPTIONS"])
    def logout_options():
        return add_cors(make_response("", 204))
    
    @app.route("/auth/logout", methods=["POST"])
    @rate_limit("/auth/logout")
    def logout():
        """
        Endpoint para logout com revogação de token
        
        Revoga access_token e/ou refresh_token no provedor
        """
        client_ip = request.headers.get("X-Forwarded-For", request.remote_addr)
        
        try:
            data = request.get_json() or {}
            access_token = data.get("access_token", "")
            refresh_token_val = data.get("refresh_token", "")
            provider = data.get("provider", "")
            
            if not provider:
                resp = make_response(jsonify({
                    "error": "invalid_request",
                    "error_description": "provider é obrigatório"
                }), 400)
                return add_cors(resp)
            
            if not access_token and not refresh_token_val:
                resp = make_response(jsonify({
                    "error": "invalid_request",
                    "error_description": "access_token ou refresh_token é obrigatório"
                }), 400)
                return add_cors(resp)
            
            # Revogar token com provedor
            revoked = False
            
            if provider.lower() == "google":
                # Google revocation endpoint
                revoke_url = "https://oauth2.googleapis.com/revoke"
                token = refresh_token_val if refresh_token_val else access_token
                
                try:
                    response = requests.post(
                        revoke_url,
                        data={"token": token},
                        headers={"Content-Type": "application/x-www-form-urlencoded"},
                        timeout=10
                    )
                    
                    if response.status_code == 200:
                        revoked = True
                        logger.info("Token revoked", extra={"provider": provider, "client_ip": client_ip})
                    else:
                        logger.warning("Token revocation failed", extra={
                            "provider": provider,
                            "status": response.status_code,
                            "client_ip": client_ip
                        })
                except Exception as e:
                    logger.error("Token revocation error", extra={
                        "provider": provider,
                        "error": str(e),
                        "client_ip": client_ip
                    })
            
            elif provider.lower() == "microsoft":
                # Microsoft não tem endpoint de revogação padrão
                # Tokens expiram automaticamente
                logger.info("Logout Microsoft (tokens expiram automaticamente)", extra={
                    "provider": provider,
                    "client_ip": client_ip
                })
                revoked = True
            
            else:
                resp = make_response(jsonify({
                    "error": "invalid_request",
                    "error_description": f"Provider não suportado: {provider}"
                }), 400)
                return add_cors(resp)
            
            # Log de logout
            if PKCE_VALIDATION_ENABLED:
                AuditLogger.log_auth_attempt(
                    provider=provider,
                    success=True,
                    client_ip=client_ip
                )
            
            resp = make_response(jsonify({
                "success": True,
                "revoked": revoked,
                "message": "Logout realizado com sucesso"
            }), 200)
            return add_cors(resp)
        
        except Exception as e:
            logger.error("Logout exception", extra={"error": str(e), "client_ip": client_ip}, exc_info=True)
            resp = make_response(jsonify({
                "error": "server_error",
                "error_description": "Erro interno do servidor"
            }), 500)
            return add_cors(resp)
    
    @app.route("/api/consent/register", methods=["OPTIONS"])
    def consent_register_options():
        return add_cors(make_response("", 204))
    
    @app.route("/api/consent/register", methods=["POST"])
    @rate_limit("/api/consent/register")
    def consent_register():
        """
        Endpoint para registrar consentimento do usuário
        
        Registra quando usuário consente em compartilhar dados
        conforme LGPD e GDPR
        """
        client_ip = request.headers.get("X-Forwarded-For", request.remote_addr)
        
        try:
            data = request.get_json() or {}
            provider = data.get("provider", "")
            user_email = data.get("user_email", "")
            permissions = data.get("permissions", [])
            timestamp = data.get("timestamp", "")
            
            if not provider or not user_email:
                resp = make_response(jsonify({
                    "error": "invalid_request",
                    "error_description": "provider e user_email são obrigatórios"
                }), 400)
                return add_cors(resp)
            
            # Log de consentimento (LGPD/GDPR compliance)
            logger.info("User consent registered", extra={
                "provider": provider,
                "user_email": user_email,
                "permissions": permissions,
                "timestamp": timestamp,
                "client_ip": client_ip,
                "event": "consent_granted"
            })
            
            if PKCE_VALIDATION_ENABLED:
                AuditLogger.log_auth_attempt(
                    provider=provider,
                    success=True,
                    client_ip=client_ip,
                    user_id=user_email,
                    event_type="consent_granted"
                )
            
            # Em produção, salvar em banco de dados
            # consent_record = {
            #     "user_email": user_email,
            #     "provider": provider,
            #     "permissions": permissions,
            #     "timestamp": timestamp,
            #     "ip_address": client_ip,
            #     "revoked": False
            # }
            # db.consents.insert_one(consent_record)
            
            resp = make_response(jsonify({
                "success": True,
                "message": "Consentimento registrado com sucesso",
                "consent_id": f"{provider}_{user_email}_{timestamp}"  # ID único
            }), 200)
            return add_cors(resp)
        
        except Exception as e:
            logger.error("Consent registration exception", extra={"error": str(e), "client_ip": client_ip}, exc_info=True)
            resp = make_response(jsonify({
                "error": "server_error",
                "error_description": "Erro interno do servidor"
            }), 500)
            return add_cors(resp)
    
    @app.route("/api/consent/revoke", methods=["OPTIONS"])
    def consent_revoke_options():
        return add_cors(make_response("", 204))
    
    @app.route("/api/consent/revoke", methods=["POST"])
    @rate_limit("/api/consent/revoke")
    def consent_revoke():
        """
        Endpoint para revogar consentimento do usuário
        
        Permite que usuário revogue consentimento previamente dado
        """
        client_ip = request.headers.get("X-Forwarded-For", request.remote_addr)
        
        try:
            data = request.get_json() or {}
            consent_id = data.get("consent_id", "")
            user_email = data.get("user_email", "")
            
            if not consent_id or not user_email:
                resp = make_response(jsonify({
                    "error": "invalid_request",
                    "error_description": "consent_id e user_email são obrigatórios"
                }), 400)
                return add_cors(resp)
            
            # Log de revogação de consentimento
            logger.info("User consent revoked", extra={
                "consent_id": consent_id,
                "user_email": user_email,
                "client_ip": client_ip,
                "event": "consent_revoked"
            })
            
            if PKCE_VALIDATION_ENABLED:
                AuditLogger.log_auth_attempt(
                    provider="system",
                    success=True,
                    client_ip=client_ip,
                    user_id=user_email,
                    event_type="consent_revoked"
                )
            
            # Em produção, atualizar em banco de dados
            # db.consents.update_one(
            #     {"consent_id": consent_id, "user_email": user_email},
            #     {"$set": {"revoked": True, "revoked_at": datetime.utcnow()}}
            # )
            
            resp = make_response(jsonify({
                "success": True,
                "message": "Consentimento revogado com sucesso"
            }), 200)
            return add_cors(resp)
        
        except Exception as e:
            logger.error("Consent revocation exception", extra={"error": str(e), "client_ip": client_ip}, exc_info=True)
            resp = make_response(jsonify({
                "error": "server_error",
                "error_description": "Erro interno do servidor"
            }), 500)
            return add_cors(resp)
    
    def require_auth(f):
        """
        Decorator para exigir autenticação via Authorization header.
        
        Valida Bearer token usando os mesmos mecanismos de /auth/validate.
        Retorna 401 se sem token, 403 se token inválido.
        """
        from functools import wraps
        
        @wraps(f)
        def decorated_function(*args, **kwargs):
            client_ip = request.headers.get("X-Forwarded-For", request.remote_addr)
            auth_header = request.headers.get("Authorization", "")
            
            # Verificar se Authorization header existe
            if not auth_header or not auth_header.startswith("Bearer "):
                logger.warning("Admin endpoint accessed without auth", extra={
                    "endpoint": request.path,
                    "client_ip": client_ip
                })
                resp = make_response(jsonify({
                    "error": "unauthorized",
                    "error_description": "Token de autenticação obrigatório"
                }), 401)
                return add_cors(resp)
            
            # Extrair token
            access_token = auth_header[7:]  # Remove "Bearer "
            
            # Validar token com Google (assumindo Google por padrão)
            # TODO: detectar provider do token ou permitir header X-Provider
            try:
                info_url = f"https://oauth2.googleapis.com/tokeninfo?access_token={access_token}"
                response = requests.get(info_url, timeout=10)
                
                if response.status_code != 200:
                    logger.warning("Admin endpoint accessed with invalid token", extra={
                        "endpoint": request.path,
                        "client_ip": client_ip,
                        "status_code": response.status_code
                    })
                    resp = make_response(jsonify({
                        "error": "forbidden",
                        "error_description": "Token inválido ou expirado"
                    }), 403)
                    return add_cors(resp)
                
                token_info = response.json()
                
                # Verificar se token pertence ao nosso client_id
                expected_client_id = os.getenv("GOOGLE_CLIENT_ID")
                if token_info.get("aud") != expected_client_id:
                    logger.warning("Admin endpoint accessed with wrong audience", extra={
                        "endpoint": request.path,
                        "client_ip": client_ip,
                        "expected": expected_client_id,
                        "actual": token_info.get("aud")
                    })
                    resp = make_response(jsonify({
                        "error": "forbidden",
                        "error_description": "Token não autorizado"
                    }), 403)
                    return add_cors(resp)
                
                # Token válido - prosseguir com request
                logger.info("Admin endpoint accessed", extra={
                    "endpoint": request.path,
                    "user_id": token_info.get("sub"),
                    "email": token_info.get("email"),
                    "client_ip": client_ip
                })
                
                # Injetar user_info no request context para uso posterior
                request.user_info = {
                    "id": token_info.get("sub"),
                    "email": token_info.get("email"),
                    "email_verified": token_info.get("email_verified") == "true"
                }
                
                return f(*args, **kwargs)
                
            except Exception as e:
                logger.error("Auth validation error", extra={
                    "endpoint": request.path,
                    "error": str(e),
                    "client_ip": client_ip
                }, exc_info=True)
                resp = make_response(jsonify({
                    "error": "server_error",
                    "error_description": "Erro ao validar autenticação"
                }), 500)
                return add_cors(resp)
        
        return decorated_function
    
    @app.route("/api/admin/logs", methods=["OPTIONS"])  # CORS preflight
    def admin_logs_preflight():
        return add_cors(make_response("", 204))
    
    @app.route("/api/admin/logs", methods=["GET"])
    @require_https
    @rate_limit("/api/admin/logs")
    @require_auth
    def admin_logs():
        """
        Endpoint protegido para visualização de logs de auditoria.
        
        Requer autenticação via Authorization: Bearer <access_token>
        
        Query Parameters:
        - date: Data dos logs (formato: YYYY-MM-DD), default: hoje
        - event_type: Filtrar por tipo de evento (login, logout, token_refresh, etc.)
        - limit: Número máximo de registros (default: 100, max: 1000)
        - offset: Offset para paginação (default: 0)
        
        Retorna logs em formato JSON com paginação.
        """
        from datetime import datetime, date
        import json
        
        # Parâmetros de query
        log_date = request.args.get("date", date.today().strftime("%Y-%m-%d"))
        event_type = request.args.get("event_type", None)
        limit = min(int(request.args.get("limit", 100)), 1000)
        offset = int(request.args.get("offset", 0))
        
        # Validar formato de data
        try:
            datetime.strptime(log_date, "%Y-%m-%d")
        except ValueError:
            resp = make_response(jsonify({
                "error": "invalid_date_format",
                "error_description": "Data deve estar no formato YYYY-MM-DD"
            }), 400)
            return add_cors(resp)
        
        # Caminho do arquivo de log
        log_file = APP_ROOT / "logs" / f"{log_date}.jsonl"
        
        if not log_file.exists():
            resp = make_response(jsonify({
                "logs": [],
                "total": 0,
                "date": log_date,
                "limit": limit,
                "offset": offset,
                "message": "Nenhum log encontrado para esta data"
            }), 200)
            return add_cors(resp)
        
        # Ler e filtrar logs
        logs = []
        try:
            with open(log_file, "r", encoding="utf-8") as f:
                for line in f:
                    try:
                        log_entry = json.loads(line.strip())
                        
                        # Filtrar por event_type se especificado
                        if event_type:
                            entry_type = log_entry.get("event_type", log_entry.get("message", ""))
                            if event_type.lower() not in entry_type.lower():
                                continue
                        
                        logs.append(log_entry)
                    except json.JSONDecodeError:
                        continue
        except Exception as e:
            logger.error(f"Erro ao ler logs: {str(e)}")
            resp = make_response(jsonify({
                "error": "internal_error",
                "error_description": "Erro ao ler logs"
            }), 500)
            return add_cors(resp)
        
        # Aplicar paginação
        total = len(logs)
        paginated_logs = logs[offset:offset + limit]
        
        # Resposta
        response_data = {
            "logs": paginated_logs,
            "total": total,
            "date": log_date,
            "limit": limit,
            "offset": offset,
            "has_more": (offset + limit) < total
        }
        
        resp = make_response(jsonify(response_data), 200)
        return add_cors(resp)

    # ============================================================================
    # ENDPOINTS DE AUTORIZAÇÃO - FASE 4
    # ============================================================================
    
    def require_admin(f):
        """Decorator para exigir permissões de admin"""
        def wrapper(*args, **kwargs):
            if not AUTHORIZATION_ENABLED:
                resp = make_response(jsonify({"error": "authorization_disabled", "error_description": "Sistema de autorização não disponível"}), 503)
                return add_cors(resp)
            
            # Verificar header Authorization
            auth_header = request.headers.get('Authorization', '')
            if not auth_header.startswith('Bearer '):
                resp = make_response(jsonify({"error": "unauthorized", "error_description": "Token de autorização necessário"}), 401)
                return add_cors(resp)
            
            token = auth_header[7:]  # Remove 'Bearer '
            
            # Verificar se é um token super admin válido
            if not JWT_SECRET_KEY:
                logger.error("Variável JWT_SECRET_KEY não configurada")
                resp = make_response(jsonify({"error": "server_error", "error_description": "Configuração do servidor incompleta"}), 500)
                return add_cors(resp)
            
            try:
                payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=['HS256'])
                
                # Verificar se é super admin ou admin
                user_role = payload.get('role')
                if user_role not in ['super_admin', 'admin']:
                    resp = make_response(jsonify({"error": "forbidden", "error_description": "Permissões insuficientes"}), 403)
                    return add_cors(resp)
                
                # Adicionar informações do usuário ao request para uso na função
                request.admin_user = {
                    'email': payload.get('email'),
                    'role': user_role
                }
                
                return f(*args, **kwargs)
                
            except JoseError as e:
                logger.error(f"Erro ao validar token: {e}")
                resp = make_response(jsonify({"error": "unauthorized", "error_description": "Token inválido"}), 401)
                return add_cors(resp)
                
        wrapper.__name__ = f.__name__
        return wrapper
    
    @app.route("/api/check-authorization", methods=["OPTIONS"])
    def authorization_check_preflight():
        """CORS preflight para verificação de autorização"""
        return add_cors(make_response("", 200))
    
    @app.route("/api/check-authorization", methods=["POST"])
    @rate_limit("/api/check-authorization")
    def check_authorization():
        """Verificar se usuário está autorizado"""
        try:
            if not AUTHORIZATION_ENABLED:
                return jsonify({"error": "authorization_disabled", "error_description": "Sistema de autorização não disponível"}), 503
            
            data = request.get_json()
            if not data or 'email' not in data:
                return jsonify({"error": "invalid_request", "error_description": "Email é obrigatório"}), 400
            
            email = data['email']
            is_authorized = is_user_authorized(email)
            user_role = get_user_role(email) if is_authorized else None
            
            response_data = {
                "authorized": is_authorized,
                "role": user_role,
                "email": email
            }
            
            # Log da verificação
            if PKCE_VALIDATION_ENABLED:
                AuditLogger.log_access_check(email, is_authorized, request.remote_addr)
            
            resp = make_response(jsonify(response_data), 200)
            return add_cors(resp)
            
        except Exception as e:
            logger.error(f"Erro na verificação de autorização: {e}")
            error_response = {"error": "internal_error", "error_description": "Erro interno do servidor"}
            resp = make_response(jsonify(error_response), 500)
            return add_cors(resp)
    
    @app.route("/api/admin/users", methods=["OPTIONS"])
    def admin_users_preflight():
        """CORS preflight para gerenciamento de usuários"""
        return add_cors(make_response("", 200))
    
    @app.route("/api/admin/users", methods=["GET"])
    @rate_limit("/api/admin/users")
    @require_admin
    def get_admin_users():
        """Listar usuários autorizados e solicitações pendentes (admin only)"""
        try:
            if not AUTHORIZATION_ENABLED:
                return jsonify({"error": "authorization_disabled", "error_description": "Sistema de autorização não disponível"}), 503
            
            data = load_authorized_users()
            
            # Filtrar informações sensíveis se necessário
            users = []
            for user in data.get('users', []):
                user_info = {
                    "email": user.get('email'),
                    "name": user.get('name'),
                    "provider": user.get('provider'),
                    "role": user.get('role'),
                    "status": user.get('status'),
                    "approved_at": user.get('approved_at'),
                    "created_at": user.get('created_at')
                }
                users.append(user_info)
            
            response_data = {
                "users": users,
                "pending_requests": data.get('pending_requests', []),
                "settings": data.get('settings', {}),
                "total_users": len(users),
                "total_pending": len(data.get('pending_requests', []))
            }
            
            resp = make_response(jsonify(response_data), 200)
            return add_cors(resp)
            
        except Exception as e:
            logger.error(f"Erro ao listar usuários: {e}")
            error_response = {"error": "internal_error", "error_description": "Erro interno do servidor"}
            resp = make_response(jsonify(error_response), 500)
            return add_cors(resp)
    
    @app.route("/api/admin/users", methods=["POST"])
    @rate_limit("/api/admin/users")
    @require_admin
    def add_admin_user():
        """Adicionar novo usuário autorizado (admin only)"""
        try:
            if not AUTHORIZATION_ENABLED:
                return jsonify({"error": "authorization_disabled", "error_description": "Sistema de autorização não disponível"}), 503
            
            data = request.get_json()
            if not data:
                return jsonify({"error": "invalid_request", "error_description": "Dados JSON são obrigatórios"}), 400
            
            required_fields = ['email', 'name', 'provider']
            for field in required_fields:
                if field not in data or not data[field]:
                    return jsonify({"error": "invalid_request", "error_description": f"Campo '{field}' é obrigatório"}), 400
            
            # Adicionar usuário
            user_data = {
                "email": data['email'],
                "name": data['name'],
                "provider": data['provider'],
                "role": data.get('role', 'user'),
                "approved_by": "admin"  # TODO: identificar admin real
            }
            
            success, message = add_authorized_user(user_data)
            
            if success:
                response_data = {"message": message, "user": user_data}
                resp = make_response(jsonify(response_data), 201)
            else:
                error_response = {"error": "operation_failed", "error_description": message}
                resp = make_response(jsonify(error_response), 400)
            
            return add_cors(resp)
            
        except Exception as e:
            logger.error(f"Erro ao adicionar usuário: {e}")
            error_response = {"error": "internal_error", "error_description": "Erro interno do servidor"}
            resp = make_response(jsonify(error_response), 500)
            return add_cors(resp)
    
    @app.route("/api/admin/users/<email>", methods=["OPTIONS"])
    def admin_user_delete_preflight(email):
        """CORS preflight para remoção de usuário"""
        return add_cors(make_response("", 200))
    
    @app.route("/api/admin/users/<email>", methods=["DELETE"])
    @rate_limit("/api/admin/users")
    @require_admin
    def remove_admin_user(email):
        """Remover usuário autorizado (admin only)"""
        try:
            if not AUTHORIZATION_ENABLED:
                return jsonify({"error": "authorization_disabled", "error_description": "Sistema de autorização não disponível"}), 503
            
            if not email:
                return jsonify({"error": "invalid_request", "error_description": "Email é obrigatório"}), 400
            
            success, message = remove_authorized_user(email, "admin")  # TODO: identificar admin real
            
            if success:
                response_data = {"message": message}
                resp = make_response(jsonify(response_data), 200)
            else:
                error_response = {"error": "operation_failed", "error_description": message}
                status_code = 404 if "não encontrado" in message else 400
                resp = make_response(jsonify(error_response), status_code)
            
            return add_cors(resp)
            
        except Exception as e:
            logger.error(f"Erro ao remover usuário: {e}")
            error_response = {"error": "internal_error", "error_description": "Erro interno do servidor"}
            resp = make_response(jsonify(error_response), 500)
            return add_cors(resp)
    
    # ========================================================================
    # ACCESS REQUESTS MANAGEMENT ENDPOINTS (Admin)
    # ========================================================================
    
    @app.route("/api/admin/access-requests", methods=["OPTIONS"])
    def access_requests_preflight():
        """CORS preflight para solicitações de acesso"""
        return add_cors(make_response("", 200))
    
    @app.route("/api/admin/access-requests", methods=["GET"])
    @rate_limit("/api/admin/access-requests")
    @require_admin
    def get_access_requests():
        """Listar todas as solicitações de acesso (admin only)"""
        try:
            if not AUTHORIZATION_ENABLED:
                return jsonify({"error": "authorization_disabled", "error_description": "Sistema de autorização não disponível"}), 503
            
            data = load_authorized_users()
            pending_requests = data.get('pending_requests', [])
            
            response_data = {
                "requests": pending_requests,
                "total": len(pending_requests)
            }
            
            resp = make_response(jsonify(response_data), 200)
            return add_cors(resp)
            
        except Exception as e:
            logger.error(f"Erro ao listar solicitações: {e}")
            error_response = {"error": "internal_error", "error_description": "Erro interno do servidor"}
            resp = make_response(jsonify(error_response), 500)
            return add_cors(resp)
    
    @app.route("/api/admin/access-requests/<request_id>/approve", methods=["OPTIONS"])
    def approve_request_preflight(request_id):
        """CORS preflight para aprovação"""
        return add_cors(make_response("", 200))
    
    @app.route("/api/admin/access-requests/<request_id>/approve", methods=["POST"])
    @rate_limit("/api/admin/access-requests")
    @require_admin
    def approve_access_request(request_id):
        """Aprovar solicitação de acesso (admin only)"""
        try:
            if not AUTHORIZATION_ENABLED:
                return jsonify({"error": "authorization_disabled", "error_description": "Sistema de autorização não disponível"}), 503
            
            # Carregar dados
            data = load_authorized_users()
            pending_requests = data.get('pending_requests', [])
            
            # Encontrar solicitação
            request_to_approve = None
            for req in pending_requests:
                if req.get('id') == request_id:
                    request_to_approve = req
                    break
            
            if not request_to_approve:
                error_response = {"error": "not_found", "error_description": "Solicitação não encontrada"}
                resp = make_response(jsonify(error_response), 404)
                return add_cors(resp)
            
            # Obter admin atual (do token)
            admin_email = request.headers.get('X-User-Email', 'unknown')
            
            # Criar novo usuário
            new_user = {
                "email": request_to_approve['email'],
                "name": request_to_approve['name'],
                "provider": request_to_approve['provider'],
                "role": "user",
                "status": "active",
                "approved_at": datetime.utcnow().isoformat(),
                "approved_by": admin_email,
                "created_at": datetime.utcnow().isoformat()
            }
            
            # Adicionar aos usuários
            data['users'].append(new_user)
            
            # Remover das pendentes
            data['pending_requests'] = [r for r in pending_requests if r.get('id') != request_id]
            
            # Atualizar timestamp
            data['updated_at'] = datetime.utcnow().isoformat()
            
            # Salvar
            save_authorized_users(data)
            
            # Log de auditoria
            audit_entry = {
                "timestamp": datetime.utcnow().isoformat(),
                "action": "access_request_approved",
                "details": f"Solicitação de {new_user['email']} aprovada",
                "user": admin_email
            }
            data['audit_log'].append(audit_entry)
            save_authorized_users(data)
            
            logger.info(f"Solicitação aprovada: {new_user['email']} por {admin_email}")
            
            response_data = {
                "message": "Solicitação aprovada com sucesso",
                "user": new_user
            }
            
            resp = make_response(jsonify(response_data), 200)
            return add_cors(resp)
            
        except Exception as e:
            logger.error(f"Erro ao aprovar solicitação: {e}")
            error_response = {"error": "internal_error", "error_description": "Erro interno do servidor"}
            resp = make_response(jsonify(error_response), 500)
            return add_cors(resp)
    
    @app.route("/api/admin/access-requests/<request_id>/reject", methods=["OPTIONS"])
    def reject_request_preflight(request_id):
        """CORS preflight para rejeição"""
        return add_cors(make_response("", 200))
    
    @app.route("/api/admin/access-requests/<request_id>/reject", methods=["POST"])
    @rate_limit("/api/admin/access-requests")
    @require_admin
    def reject_access_request(request_id):
        """Rejeitar solicitação de acesso (admin only)"""
        try:
            if not AUTHORIZATION_ENABLED:
                return jsonify({"error": "authorization_disabled", "error_description": "Sistema de autorização não disponível"}), 503
            
            # Obter motivo da rejeição
            request_data = request.get_json() or {}
            reason = request_data.get('reason', 'Não especificado')
            
            # Carregar dados
            data = load_authorized_users()
            pending_requests = data.get('pending_requests', [])
            
            # Encontrar solicitação
            request_to_reject = None
            for req in pending_requests:
                if req.get('id') == request_id:
                    request_to_reject = req
                    break
            
            if not request_to_reject:
                error_response = {"error": "not_found", "error_description": "Solicitação não encontrada"}
                resp = make_response(jsonify(error_response), 404)
                return add_cors(resp)
            
            # Obter admin atual
            admin_email = request.headers.get('X-User-Email', 'unknown')
            
            # Remover das pendentes
            data['pending_requests'] = [r for r in pending_requests if r.get('id') != request_id]
            
            # Atualizar timestamp
            data['updated_at'] = datetime.utcnow().isoformat()
            
            # Log de auditoria
            audit_entry = {
                "timestamp": datetime.utcnow().isoformat(),
                "action": "access_request_rejected",
                "details": f"Solicitação de {request_to_reject['email']} rejeitada. Motivo: {reason}",
                "user": admin_email
            }
            data['audit_log'].append(audit_entry)
            
            # Salvar
            save_authorized_users(data)
            
            logger.info(f"Solicitação rejeitada: {request_to_reject['email']} por {admin_email}")
            
            response_data = {
                "message": "Solicitação rejeitada",
                "reason": reason
            }
            
            resp = make_response(jsonify(response_data), 200)
            return add_cors(resp)
            
        except Exception as e:
            logger.error(f"Erro ao rejeitar solicitação: {e}")
            error_response = {"error": "internal_error", "error_description": "Erro interno do servidor"}
            resp = make_response(jsonify(error_response), 500)
            return add_cors(resp)
    
    @app.route("/api/request-access", methods=["OPTIONS"])
    def request_access_preflight():
        """CORS preflight para solicitação de acesso"""
        return add_cors(make_response("", 200))
    
    @app.route("/api/request-access", methods=["POST"])
    @rate_limit("/api/request-access")
    def request_access():
        """Solicitar acesso ao sistema (público)"""
        try:
            if not AUTHORIZATION_ENABLED:
                return jsonify({"error": "authorization_disabled", "error_description": "Sistema de autorização não disponível"}), 503
            
            data = request.get_json()
            if not data:
                return jsonify({"error": "invalid_request", "error_description": "Dados JSON são obrigatórios"}), 400
            
            required_fields = ['email', 'name', 'provider']
            for field in required_fields:
                if field not in data or not data[field]:
                    return jsonify({"error": "invalid_request", "error_description": f"Campo '{field}' é obrigatório"}), 400
            
            # Criar solicitação
            request_data = {
                "email": data['email'],
                "name": data['name'],
                "provider": data['provider'],
                "message": data.get('message', '')
            }
            
            success, message = add_pending_request(request_data)
            
            if success:
                response_data = {
                    "message": message,
                    "status": "pending",
                    "next_steps": "Sua solicitação foi registrada e será analisada por um administrador."
                }
                resp = make_response(jsonify(response_data), 201)
            else:
                error_response = {"error": "operation_failed", "error_description": message}
                resp = make_response(jsonify(error_response), 400)
            
            return add_cors(resp)
            
        except Exception as e:
            logger.error(f"Erro ao processar solicitação de acesso: {e}")
            error_response = {"error": "internal_error", "error_description": "Erro interno do servidor"}
            resp = make_response(jsonify(error_response), 500)
            return add_cors(resp)

    # ========================================================================
    # SUPER ADMIN AUTHENTICATION ENDPOINTS
    # ========================================================================
    
    @app.route("/auth/super-admin", methods=["OPTIONS"])
    def super_admin_auth_preflight():
        """CORS preflight para autenticação super admin"""
        return add_cors(make_response("", 200))
    
    @app.route("/auth/super-admin", methods=["POST"])
    @rate_limit("/auth/super-admin")
    def authenticate_super_admin():
        """Autenticação do super administrador"""
        try:
            data = request.get_json()
            if not data:
                return jsonify({"error": "invalid_request", "error_description": "Dados JSON são obrigatórios"}), 400
            
            email = data.get('email')
            password = data.get('password')
            
            if not email or not password:
                return jsonify({"error": "invalid_request", "error_description": "Email e senha são obrigatórios"}), 400
            
            # Verificar credenciais do super admin
            SUPER_ADMIN_EMAIL = 'suporte@caracore.com.br'
            SUPER_ADMIN_PASSWORD_HASH = os.getenv('SUPER_ADMIN_PASSWORD_HASH')
            JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
            
            if not SUPER_ADMIN_PASSWORD_HASH or not JWT_SECRET_KEY:
                logger.error("Variáveis de ambiente SUPER_ADMIN_PASSWORD_HASH ou JWT_SECRET_KEY não configuradas")
                return jsonify({"error": "server_error", "error_description": "Configuração do servidor incompleta"}), 500
            
            if email.lower() != SUPER_ADMIN_EMAIL.lower():
                logger.warning(f"Tentativa de login super admin com email não autorizado: {email}")
                return jsonify({"error": "unauthorized", "error_description": "Email não autorizado"}), 401
            
            # Verificar senha hasheada (SHA-256)
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            
            if password_hash != SUPER_ADMIN_PASSWORD_HASH:
                logger.warning(f"Tentativa de login super admin com senha incorreta: {email}")
                return jsonify({"error": "unauthorized", "error_description": "Credenciais inválidas"}), 401
            
            # Gerar token JWT para super admin
            from datetime import datetime, timedelta
            
            payload = {
                'email': email,
                'role': 'super_admin',
                'iat': datetime.utcnow(),
                'exp': datetime.utcnow() + timedelta(hours=24)
            }
            
            # authlib usa JsonWebSignature com header
            header = {'alg': 'HS256'}
            token = jwt.encode(header, payload, JWT_SECRET_KEY).decode('utf-8') if isinstance(jwt.encode(header, payload, JWT_SECRET_KEY), bytes) else jwt.encode(header, payload, JWT_SECRET_KEY)
            
            logger.info(f"Super admin autenticado com sucesso: {email}")
            
            response_data = {
                'token': token,
                'email': email,
                'role': 'super_admin',
                'expires_in': 86400  # 24 horas em segundos
            }
            
            resp = make_response(jsonify(response_data), 200)
            return add_cors(resp)
            
        except Exception as e:
            logger.error(f"Erro na autenticação super admin: {e}")
            error_response = {"error": "internal_error", "error_description": "Erro interno do servidor"}
            resp = make_response(jsonify(error_response), 500)
            return add_cors(resp)
    
    @app.route("/auth/verify-super-admin", methods=["OPTIONS"])
    def verify_super_admin_preflight():
        """CORS preflight para verificação super admin"""
        return add_cors(make_response("", 200))
    
    @app.route("/auth/verify-super-admin", methods=["POST"])
    @rate_limit("/auth/verify-super-admin")
    def verify_super_admin():
        """Verificar token do super administrador"""
        try:
            auth_header = request.headers.get('Authorization')
            
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({"error": "unauthorized", "error_description": "Token não fornecido"}), 401
            
            token = auth_header.split(' ')[1]
            JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
            
            if not JWT_SECRET_KEY:
                logger.error("Variável de ambiente JWT_SECRET_KEY não configurada")
                return jsonify({"error": "server_error", "error_description": "Configuração do servidor incompleta"}), 500
            
            try:
                payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=['HS256'])
                
                if payload.get('role') != 'super_admin':
                    return jsonify({"error": "forbidden", "error_description": "Token não é de super admin"}), 403
                
                response_data = {
                    'valid': True,
                    'email': payload.get('email'),
                    'role': payload.get('role'),
                    'exp': payload.get('exp')
                }
                
                resp = make_response(jsonify(response_data), 200)
                return add_cors(resp)
                
            except JoseError as e:
                if 'expired' in str(e).lower():
                    return jsonify({"error": "token_expired", "error_description": "Token expirado"}), 401
                else:
                    return jsonify({"error": "invalid_token", "error_description": "Token inválido"}), 401
                    
        except Exception as e:
            logger.error(f"Erro na verificação super admin: {e}")
            error_response = {"error": "internal_error", "error_description": "Erro interno do servidor"}
            resp = make_response(jsonify(error_response), 500)
            return add_cors(resp)

    # Aplicar security headers em todas as respostas
    @app.after_request
    def apply_security_headers(response):
        """Aplica headers de segurança em todas as respostas"""
        if SECURITY_HEADERS_ENABLED:
            response = add_security_headers(response)
        return response
    
    # Endpoint de teste para verificar deploy
    @app.route("/test-deploy", methods=["GET"])
    def test_deploy():
        """Endpoint de teste para verificar se o deploy foi executado"""
        return jsonify({
            "status": "deployed", 
            "timestamp": datetime.utcnow().isoformat(),
            "super_admin_available": True,
            "version": "1.1.0",
            "webhook_configured": True
        })
    
    return app


app = create_app()


if __name__ == "__main__":
    port = int(os.getenv("PORT", "5051"))
    app.run(host="0.0.0.0", port=port)

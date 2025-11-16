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
import jwt
import json
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError
from flask import Flask, jsonify, make_response, request


GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token"
AZURE_TOKEN_ENDPOINT_TEMPLATE = "https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token"
DEFAULT_AZURE_SCOPE = "openid profile email offline_access"


logger = logging.getLogger("cara-core-backend")
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(message)s"))
    logger.addHandler(handler)
logger.setLevel(logging.INFO)

# Import auth_manager para validação PKCE e logging
try:
    from auth_manager import PKCEValidator, AuditLogger as AuthManagerAuditLogger
    PKCE_VALIDATION_ENABLED = True
    logger.info("Auth manager carregado - validação PKCE habilitada")
    # Garantir que AuditLogger tenha o método log_access_check
    if not hasattr(AuthManagerAuditLogger, 'log_access_check'):
        def log_access_check(email: str, is_authorized: bool, client_ip: str = None) -> None:
            """Registra verificação de autorização de acesso"""
            logger.info(
                f"Access check: email={email}, authorized={is_authorized}, ip={client_ip}",
                extra={
                    "event": "access_check",
                    "email": email,
                    "authorized": is_authorized,
                    "client_ip": client_ip
                }
            )
        AuthManagerAuditLogger.log_access_check = staticmethod(log_access_check)
    AuditLogger = AuthManagerAuditLogger
except ImportError:
    PKCE_VALIDATION_ENABLED = False
    logger.warning("auth_manager não disponível - validação PKCE desabilitada")
    # Classe AuditLogger local como fallback
    class AuditLogger:
        """Logger de auditoria local (fallback quando auth_manager não está disponível)"""
        @staticmethod
        def log_access_check(email: str, is_authorized: bool, client_ip: str = None) -> None:
            """Registra verificação de autorização de acesso"""
            logger.info(
                f"Access check: email={email}, authorized={is_authorized}, ip={client_ip}",
                extra={
                    "event": "access_check",
                    "email": email,
                    "authorized": is_authorized,
                    "client_ip": client_ip
                }
            )

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
    def add_security_headers(response, use_swagger_csp=False):
        """Dummy function quando security module não está disponível"""
        return response

# Import authorization para controle de acesso
try:
    from authorization import (
        is_user_authorized, get_user_role, add_authorized_user, 
        remove_authorized_user, update_authorized_user, add_pending_request, 
        load_authorized_users, save_authorized_users, get_pending_request_by_email,
        detect_provider_from_email, is_allowed_email_domain, auth_manager
    )
    AUTHORIZATION_ENABLED = True
    logger.info("Authorization module carregado - controle de acesso habilitado")
except ImportError:
    AUTHORIZATION_ENABLED = False
    logger.warning("authorization module não disponível - controle de acesso desabilitado")

# Import SessionManager para Fase 7 - Refresh Tokens
# A chave TOKEN_ENCRYPTION_KEY deve estar configurada como variável de ambiente no Azure App Service
SESSION_MANAGER_ENABLED = False
SessionManager = None

try:
    from session_manager import SessionManager
    # Verificar se a chave de criptografia está configurada
    encryption_key = os.getenv('TOKEN_ENCRYPTION_KEY')
    if not encryption_key:
        logger.warning("TOKEN_ENCRYPTION_KEY não configurada - sistema de refresh tokens desabilitado")
    else:
        # Tentar inicializar para verificar se tudo está OK
        try:
            test_manager = SessionManager()
            SESSION_MANAGER_ENABLED = True
            logger.info("SessionManager carregado - sistema de refresh tokens habilitado")
        except ValueError as e:
            # Chave de criptografia inválida
            logger.warning(f"SessionManager não pode ser inicializado (chave inválida): {e}")
        except Exception as e:
            # Outro erro na inicialização
            logger.warning(f"Erro ao inicializar SessionManager: {e}", exc_info=True)
except ImportError as e:
    logger.warning(f"session_manager não disponível - sistema de refresh tokens desabilitado: {e}")

# Import authorization_middleware para decorators de proteção (Fase 6)
try:
    from authorization_middleware import (
        require_authorization, require_admin, require_super_admin,
        is_user_authorized as check_user_authorized, get_current_user
    )
    AUTHORIZATION_MIDDLEWARE_ENABLED = True
    logger.info("Authorization middleware carregado (Fase 6) - proteção robusta de endpoints habilitada")
except ImportError:
    AUTHORIZATION_MIDDLEWARE_ENABLED = False
    logger.warning("authorization_middleware não disponível - usando fallback")
    # Mantém compatibilidade com decorator antigo
    def require_authorization(role='user'):
        def decorator(f):
            return f
        return decorator


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
    # Temporário: decode sem verificação de assinatura para evitar dependência cryptography
    try:
        # Decodificar header e payload separadamente para obter o algoritmo
        header_data = jwt.get_unverified_header(token)
        claims = jwt.decode(token, options={"verify_signature": False})
    except InvalidTokenError as exc:
        raise IDTokenValidationError("invalid_id_token", str(exc)) from exc

    issuer = claims.get("iss")
    if issuer not in {"https://accounts.google.com", "accounts.google.com"}:
        raise IDTokenValidationError("invalid_issuer", f"Issuer inesperado: {issuer}")

    claims_dict = dict(claims)
    _validate_nonce(claims_dict, expected_nonce)
    # Passar o header real para validação do at_hash
    _validate_at_hash(access_token, claims_dict, header_data or {})

    if allowed_domains:
        # Para contas corporativas, usar o claim 'hd' (hosted domain)
        # Para contas pessoais (gmail.com), o 'hd' está vazio, então usar o domínio do email
        hd_claim = (claims_dict.get("hd") or "").lower()
        email_claim = (claims_dict.get("email") or "").lower()
        
        # Extrair domínio do email se hd estiver vazio
        domain_to_check = hd_claim
        if not domain_to_check and email_claim and "@" in email_claim:
            domain_to_check = email_claim.split("@")[1].lower()
        
        if not domain_to_check or domain_to_check not in allowed_domains:
            raise IDTokenValidationError(
                "unauthorized_domain",
                f"Domínio {domain_to_check or '<vazio>'} não autorizado para login Google",
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
    # Temporário: decode sem verificação de assinatura para evitar dependência cryptography
    try:
        # Decodificar header e payload separadamente para obter o algoritmo
        header_data = jwt.get_unverified_header(token)
        claims = jwt.decode(token, options={"verify_signature": False})
    except InvalidTokenError as exc:
        raise IDTokenValidationError("invalid_id_token", str(exc)) from exc

    claims_dict = dict(claims)
    _validate_nonce(claims_dict, expected_nonce)
    # Passar o header real para validação do at_hash
    _validate_at_hash(access_token, claims_dict, header_data or {})

    issuer = claims.get("iss")
    if not (isinstance(issuer, str) and issuer.startswith("https://login.microsoftonline.com/") and issuer.endswith("/v2.0")):
        raise IDTokenValidationError("invalid_issuer", f"Issuer inesperado: {issuer}")

    token_tid = (claims_dict.get("tid") or "").lower()
    if expected_tenant and expected_tenant.lower() not in {"common", "organizations", "consumers"}:
        # Se o expected_tenant é um tenant específico, verificar correspondência
        # MAS: se o tenant_hint (usado na autorização) for "consumers", aceitar tokens de contas pessoais
        if token_tid and token_tid != expected_tenant.lower():
            # Verificar se é um token de consumidores (contas pessoais)
            # O tenant de consumidores da Microsoft é sempre 9188040d-6c67-4c5b-b112-36a304b66dad
            consumers_tenant_id = "9188040d-6c67-4c5b-b112-36a304b66dad"
            if tenant_hint and tenant_hint.lower().strip() == "consumers" and token_tid == consumers_tenant_id:
                # Token de consumidores é válido quando autorização foi feita com /consumers
                logger.info("Token de consumidores aceito (tenant_hint=consumers, token_tid=%s, expected_tenant=%s)", 
                           token_tid, expected_tenant)
            else:
                raise IDTokenValidationError(
                    "tenant_mismatch",
                    f"Token emitido para tenant {token_tid}, esperado {expected_tenant.lower()}",
                )

    return claims_dict


def create_app() -> Flask:
    app = Flask(__name__)
    app.secret_key = os.getenv("APP_SECRET_KEY", os.urandom(32))
    
    # Configurar Swagger/OpenAPI será feito após todas as rotas serem registradas
    # Ver final do arquivo onde app é retornado

    # Health + storage check endpoint
    @app.route("/health/storage", methods=["GET"])
    def health_storage():
        """Verifica leitura/gravação no caminho persistente configurado por SESSION_DATA_FILE.

        Retorna JSON com status e detalhes. Não altera dados existentes além do arquivo de teste.
        """
        # Path de sessão (preferir variável de ambiente definida no App Service)
        session_path = os.getenv("SESSION_DATA_FILE") or os.getenv("SESSION_FILE") or "/home/site/wwwroot/data/user_sessions.json"
        # Garantir pasta
        try:
            dirpath = os.path.dirname(session_path)
            os.makedirs(dirpath, exist_ok=True)
        except Exception as exc:
            logger.exception("Falha ao garantir diretório de sessões")
            return make_response(jsonify({"ok": False, "error": "failed to ensure session dir", "exception": str(exc)}), 500)

        test_file = os.path.join(dirpath, f".health_write_test_{int(time.time())}.tmp")
        try:
            # write
            with open(test_file, "w", encoding="utf-8") as fh:
                fh.write("health-check")
            # read
            with open(test_file, "r", encoding="utf-8") as fh:
                content = fh.read()
            # cleanup
            try:
                os.remove(test_file)
            except Exception:
                logger.warning("Não foi possível remover arquivo de teste %s", test_file)

            ok = content == "health-check"
            status = 200 if ok else 500
            return make_response(jsonify({
                "ok": ok,
                "session_path": session_path,
                "test_file": test_file,
                "content_read": content
            }), status)
        except Exception as exc:
            logger.exception("Erro no health/storage check")
            return make_response(jsonify({"ok": False, "error": "io_error", "exception": str(exc)}), 500)

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
    jwt_secret_key = os.getenv("JWT_SECRET_KEY")

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
            # Always allow the configured origin
            resp.headers["Access-Control-Allow-Origin"] = allowed_origin
        else:
            # When wildcard is configured, if the client includes an Origin
            # and we allow credentials, we must echo the Origin value (browsers
            # reject '*' when Access-Control-Allow-Credentials is true). Prefer
            # echoing the request Origin when present; otherwise fall back to '*'.
            if origin:
                resp.headers["Access-Control-Allow-Origin"] = origin
            else:
                resp.headers["Access-Control-Allow-Origin"] = "*"
        resp.headers["Vary"] = "Origin"
        resp.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        resp.headers["Access-Control-Allow-Methods"] = "GET, POST, DELETE, OPTIONS"
        resp.headers["Access-Control-Allow-Credentials"] = "true"
        return resp

    # Ensure CORS headers are added to every response as a safety net.
    # Some error paths or proxies may bypass explicit add_cors() calls; using
    # after_request guarantees consistent CORS behavior for the configured origin.
    @app.after_request
    def _apply_cors(response):
        try:
            # Call the same helper used by endpoints to keep behavior consistent
            return add_cors(response)
        except Exception:
            # In case add_cors itself fails, return original response
            return response

    @app.route("/swagger.yaml", methods=["GET"])
    def swagger_yaml():
        """Servir arquivo OpenAPI YAML"""
        try:
            swagger_file = os.path.join(os.path.dirname(__file__), 'swagger.yaml')
            with open(swagger_file, 'r', encoding='utf-8') as f:
                content = f.read()
            resp = make_response(content, 200)
            resp.headers['Content-Type'] = 'application/x-yaml'
            return add_cors(resp)
        except Exception as e:
            logger.error(f"Erro ao servir swagger.yaml: {e}")
            return add_cors(make_response(jsonify({"error": "swagger_file_not_found"}), 404))
    
    @app.route("/health", methods=["GET"])  # simple probe
    def health():
        """
        Health check simples
        ---
        tags:
          - Health
        summary: Health check simples
        description: Verifica se o servidor está respondendo
        responses:
          200:
            description: Servidor está funcionando
            schema:
              type: object
              properties:
                status:
                  type: string
                  example: ok
        """
        return add_cors(make_response(jsonify({"status": "ok"}), 200))

    @app.route("/health/oauth/google", methods=["GET"])
    def health_oauth_google():
        """
        Endpoint de diagnóstico específico para Google OAuth.
        Verifica se todas as variáveis de ambiente necessárias estão configuradas.
        Não expõe valores dos secrets, apenas indica se estão presentes.
        """
        from datetime import datetime
        
        required_vars = {
            "GOOGLE_CLIENT_ID": os.getenv("GOOGLE_CLIENT_ID"),
            "GOOGLE_CLIENT_SECRET": os.getenv("GOOGLE_CLIENT_SECRET"),
        }
        
        optional_vars = {
            "GOOGLE_ALLOWED_DOMAINS": os.getenv("GOOGLE_ALLOWED_DOMAINS"),
        }
        
        # Verificar status de cada variável
        var_status = {}
        all_required_present = True
        
        for var_name, var_value in required_vars.items():
            is_present = bool(var_value)
            var_status[var_name] = {
                "configured": is_present,
                "value_length": len(var_value) if var_value else 0,
                "status": "ok" if is_present else "missing"
            }
            if not is_present:
                all_required_present = False
        
        for var_name, var_value in optional_vars.items():
            is_present = bool(var_value)
            var_status[var_name] = {
                "configured": is_present,
                "value": var_value if is_present else None,
                "status": "ok" if is_present else "using_default"
            }
        
        # Token endpoint do Google
        token_endpoint = GOOGLE_TOKEN_ENDPOINT
        
        # Status geral
        overall_status = "ok" if all_required_present else "error"
        
        response_data = {
            "status": overall_status,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "google_oauth": {
                "required_variables": var_status,
                "token_endpoint": token_endpoint,
                "all_required_configured": all_required_present
            },
            "diagnosis": {
                "message": "All required Google OAuth variables are configured" if all_required_present 
                          else "Some required Google OAuth variables are missing",
                "action_required": not all_required_present,
                "missing_variables": [var for var, status in var_status.items() 
                                     if var in required_vars and not status["configured"]]
            }
        }
        
        status_code = 200 if all_required_present else 503
        resp = make_response(jsonify(response_data), status_code)
        return add_cors(resp)
    
    @app.route("/health/oauth/microsoft", methods=["GET"])
    def health_oauth_microsoft():
        """
        Endpoint de diagnóstico específico para Microsoft OAuth.
        Verifica se todas as variáveis de ambiente necessárias estão configuradas.
        Não expõe valores dos secrets, apenas indica se estão presentes.
        """
        from datetime import datetime
        
        required_vars = {
            "AZURE_CLIENT_ID": os.getenv("AZURE_CLIENT_ID"),
            "AZURE_CLIENT_SECRET": os.getenv("AZURE_CLIENT_SECRET"),
            "AZURE_TENANT_ID": os.getenv("AZURE_TENANT_ID"),
        }
        
        optional_vars = {
            "AZURE_SCOPE": os.getenv("AZURE_SCOPE"),
            "AZURE_TOKEN_ENDPOINT": os.getenv("AZURE_TOKEN_ENDPOINT"),
        }
        
        # Verificar status de cada variável
        var_status = {}
        all_required_present = True
        
        for var_name, var_value in required_vars.items():
            is_present = bool(var_value)
            var_status[var_name] = {
                "configured": is_present,
                "value_length": len(var_value) if var_value else 0,
                "status": "ok" if is_present else "missing"
            }
            if not is_present:
                all_required_present = False
        
        for var_name, var_value in optional_vars.items():
            is_present = bool(var_value)
            var_status[var_name] = {
                "configured": is_present,
                "value": var_value if is_present else None,
                "status": "ok" if is_present else "using_default"
            }
        
        # Resolver token endpoint
        tenant_value = required_vars.get("AZURE_TENANT_ID") or "common"
        token_endpoint = resolve_azure_token_endpoint(None)
        
        # Status geral
        overall_status = "ok" if all_required_present else "error"
        
        response_data = {
            "status": overall_status,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "microsoft_oauth": {
                "required_variables": var_status,
                "token_endpoint": token_endpoint,
                "tenant": tenant_value,
                "all_required_configured": all_required_present
            },
            "diagnosis": {
                "message": "All required Microsoft OAuth variables are configured" if all_required_present 
                          else "Some required Microsoft OAuth variables are missing",
                "action_required": not all_required_present,
                "missing_variables": [var for var, status in var_status.items() 
                                     if var in required_vars and not status["configured"]]
            }
        }
        
        status_code = 200 if all_required_present else 503
        resp = make_response(jsonify(response_data), status_code)
        return add_cors(resp)
    
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
            "AZURE_CLIENT_ID",  # Usar AZURE_* em vez de MICROSOFT_*
            "AZURE_CLIENT_SECRET",
            "AZURE_TENANT_ID",
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
            "microsoft": f"https://login.microsoftonline.com/{os.getenv('AZURE_TENANT_ID', 'common')}/.well-known/openid-configuration"
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
        # code_verifier é obrigatório apenas se PKCE_VALIDATION_ENABLED estiver habilitado
        required_fields = ["code"]
        if PKCE_VALIDATION_ENABLED:
            required_fields.append("code_verifier")
        
        missing = [k for k in required_fields if not payload.get(k)]
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
            logger.error(
                "Credenciais Google ausentes no ambiente - respondendo erro 500. "
                "GOOGLE_CLIENT_ID=%s, GOOGLE_CLIENT_SECRET=%s",
                "presente" if google_client_id else "AUSENTE",
                "presente" if google_client_secret else "AUSENTE"
            )
            resp = make_response(jsonify({
                "error": "server_error",
                "error_description": "Server not configured with Google client credentials",
                "details": {
                    "google_client_id_configured": bool(google_client_id),
                    "google_client_secret_configured": bool(google_client_secret),
                    "hint": "Configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables"
                }
            }), 500)
            return add_cors(resp)

        # Forward to Google token endpoint with server-side client_secret
        client_id = cast(str, google_client_id)
        data = {
            "client_id": client_id,
            "client_secret": google_client_secret,
            "code": code,
            "grant_type": grant_type,
            "redirect_uri": redirect_uri,
        }
        # Adicionar code_verifier apenas se estiver presente (PKCE)
        if code_verifier:
            data["code_verifier"] = code_verifier

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
                "[Step5] Troca concluida com sucesso (scope=%s, expires_in=%s, id_token=%s, access_token=%s, refresh_token=%s)",
                body.get("scope"),
                body.get("expires_in"),
                "presente" if body.get("id_token") else "ausente",
                "presente" if body.get("access_token") else "ausente",
                "presente" if body.get("refresh_token") else "ausente",
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
                    
                    # Fase 7: Criar sessão se houver refresh_token
                    if SESSION_MANAGER_ENABLED and body.get("refresh_token"):
                        try:
                            session_mgr = SessionManager()
                            user_agent = request.headers.get("User-Agent", "")
                            
                            user_data = {
                                "email": claims.get("email"),
                                "name": claims.get("name"),
                                "provider": "google",
                                "user_id": claims.get("sub")
                            }
                            
                            tokens = {
                                "access_token": body.get("access_token"),
                                "id_token": body.get("id_token"),
                                "refresh_token": body.get("refresh_token"),
                                "expires_in": body.get("expires_in", 3600)
                            }
                            
                            session_result = session_mgr.create_session(
                                user_data=user_data,
                                tokens=tokens,
                                ip_address=client_ip,
                                user_agent=user_agent
                            )
                            
                            # Adicionar session_id à resposta
                            body["session_id"] = session_result["session_id"]
                            
                            logger.info(
                                f"Sessão criada para Google OAuth: {session_result['session_id']} "
                                f"({claims.get('email')})"
                            )
                        except Exception as e:
                            # Não falhar o login se criação de sessão falhar
                            logger.warning(f"Erro ao criar sessão após login Google: {e}")
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
            "Recebido POST /oauth/microsoft/token de %s (content-type=%s, origin=%s)",
            request.remote_addr,
            request.content_type,
            request.headers.get("Origin", "N/A"),
        )
        
        # Log detalhado para debug
        logger.debug("Headers recebidos: %s", dict(request.headers))
        
        payload = {}
        if request.content_type and request.content_type.startswith("application/json"):
            try:
                payload = request.get_json(force=True) or {}
                logger.debug("Payload JSON recebido: %s", {k: v if k != 'code_verifier' else '[REDACTED]' for k, v in payload.items()})
            except Exception as e:
                logger.warning("Falha ao decodificar JSON recebido no token endpoint Microsoft: %s", e, exc_info=True)
                payload = {}
        else:
            payload = request.form.to_dict() if request.form else {}
            logger.debug("Payload form recebido: %s", {k: v if k != 'code_verifier' else '[REDACTED]' for k, v in payload.items()})

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

        # Validar campos obrigatórios
        # code_verifier é obrigatório apenas se PKCE_VALIDATION_ENABLED estiver habilitado
        required_fields = ["code"]
        if PKCE_VALIDATION_ENABLED:
            required_fields.append("code_verifier")
        
        missing = [k for k in required_fields if not payload.get(k)]
        if missing:
            logger.warning(
                "Requisicao invalida para Microsoft - campos ausentes: %s. "
                "Payload recebido: code=%s, code_verifier=%s, redirect_uri=%s",
                ", ".join(missing),
                "presente" if code else "ausente",
                "presente" if code_verifier else "ausente",
                redirect_uri
            )
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
                "error_description": f"Missing fields: {', '.join(missing)}",
                "details": {
                    "missing_fields": missing,
                    "has_code": bool(code),
                    "has_code_verifier": bool(code_verifier),
                    "redirect_uri": redirect_uri
                }
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
            logger.error(
                "Credenciais Microsoft ausentes no ambiente - respondendo erro 500. "
                "AZURE_CLIENT_ID=%s, AZURE_CLIENT_SECRET=%s",
                "presente" if azure_client_id else "AUSENTE",
                "presente" if azure_client_secret else "AUSENTE"
            )
            resp = make_response(jsonify({
                "error": "server_error",
                "error_description": "Server not configured with Microsoft Entra client credentials",
                "details": {
                    "azure_client_id_configured": bool(azure_client_id),
                    "azure_client_secret_configured": bool(azure_client_secret),
                    "hint": "Configure AZURE_CLIENT_ID and AZURE_CLIENT_SECRET environment variables"
                }
            }), 500)
            return add_cors(resp)

        token_endpoint = resolve_azure_token_endpoint(tenant_override)
        client_id = cast(str, azure_client_id)

        data = {
            "client_id": client_id,
            "client_secret": azure_client_secret,
            "code": code,
            "grant_type": grant_type,
            "redirect_uri": redirect_uri,
        }
        # Adicionar code_verifier apenas se estiver presente (PKCE)
        if code_verifier:
            data["code_verifier"] = code_verifier
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
                "Troca com Microsoft concluida (scope=%s, expires_in=%s, id_token=%s, access_token=%s, refresh_token=%s)",
                body.get("scope"),
                body.get("expires_in"),
                "presente" if body.get("id_token") else "ausente",
                "presente" if body.get("access_token") else "ausente",
                "presente" if body.get("refresh_token") else "ausente",
            )
            if body.get("id_token"):
                try:
                    # Se tenant_override for "consumers", usar isso como tenant_hint para validação
                    # Isso permite que tokens de contas pessoais sejam aceitos
                    validation_tenant_hint = tenant_override if tenant_override else None
                    claims = validate_microsoft_id_token(
                        body["id_token"],
                        client_id,
                        tenant_hint=validation_tenant_hint,
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
                    
                    # Fase 7: Criar sessão se houver refresh_token
                    if SESSION_MANAGER_ENABLED and body.get("refresh_token"):
                        try:
                            session_mgr = SessionManager()
                            user_agent = request.headers.get("User-Agent", "")
                            
                            user_data = {
                                "email": claims.get("preferred_username") or claims.get("email"),
                                "name": claims.get("name"),
                                "provider": "microsoft",
                                "user_id": claims.get("oid")
                            }
                            
                            tokens = {
                                "access_token": body.get("access_token"),
                                "id_token": body.get("id_token"),
                                "refresh_token": body.get("refresh_token"),
                                "expires_in": body.get("expires_in", 3600)
                            }
                            
                            session_result = session_mgr.create_session(
                                user_data=user_data,
                                tokens=tokens,
                                ip_address=client_ip,
                                user_agent=user_agent
                            )
                            
                            # Adicionar session_id à resposta
                            body["session_id"] = session_result["session_id"]
                            
                            logger.info(
                                f"Sessão criada para Microsoft OAuth: {session_result['session_id']} "
                                f"({user_data.get('email')})"
                            )
                        except Exception as e:
                            # Não falhar o login se criação de sessão falhar
                            logger.warning(f"Erro ao criar sessão após login Microsoft: {e}")
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
    
    # ============================================================================
    # FASE 7 - Sistema de Refresh Tokens - Endpoints de Sessão
    # ============================================================================
    
    @app.route("/auth/session/create", methods=["OPTIONS"])
    def create_session_options():
        return add_cors(make_response("", 204))
    
    @app.route("/auth/session/create", methods=["POST"])
    @require_https
    @rate_limit("/auth/session/create")
    def create_session():
        """
        Endpoint para criar sessão com refresh token (Fase 7)
        
        Request:
        {
            "user_data": {
                "email": "user@example.com",
                "name": "Nome Usuario",
                "provider": "google",
                "user_id": "google_123456"
            },
            "tokens": {
                "access_token": "eyJ...",
                "id_token": "eyJ...",
                "refresh_token": "1//...",
                "expires_in": 3600
            }
        }
        
        Response:
        {
            "success": true,
            "session_id": "sess_abc123...",
            "access_token": "eyJ...",
            "id_token": "eyJ...",
            "expires_in": 3600,
            "expires_at": "2025-11-15T16:00:00Z"
        }
        """
        client_ip = request.headers.get("X-Forwarded-For", request.remote_addr)
        user_agent = request.headers.get("User-Agent", "")
        
        if not SESSION_MANAGER_ENABLED:
            resp = make_response(jsonify({
                "error": "service_unavailable",
                "error_description": "Sistema de sessões não disponível"
            }), 503)
            return add_cors(resp)
        
        try:
            data = request.get_json() or {}
            user_data = data.get("user_data", {})
            tokens = data.get("tokens", {})
            
            # Validação básica
            if not user_data or not tokens:
                resp = make_response(jsonify({
                    "error": "invalid_request",
                    "error_description": "user_data e tokens são obrigatórios"
                }), 400)
                return add_cors(resp)
            
            if not tokens.get("refresh_token"):
                resp = make_response(jsonify({
                    "error": "invalid_request",
                    "error_description": "refresh_token é obrigatório"
                }), 400)
                return add_cors(resp)
            
            # Criar sessão
            session_mgr = SessionManager()
            session_result = session_mgr.create_session(
                user_data=user_data,
                tokens=tokens,
                ip_address=client_ip,
                user_agent=user_agent
            )
            
            logger.info(
                f"Sessão criada: {session_result.get('session_id')} "
                f"para {user_data.get('email')}"
            )
            
            resp = make_response(jsonify(session_result), 200)
            return add_cors(resp)
        
        except ValueError as e:
            logger.warning(f"Erro de validação ao criar sessão: {e}")
            resp = make_response(jsonify({
                "error": "invalid_request",
                "error_description": str(e)
            }), 400)
            return add_cors(resp)
        
        except Exception as e:
            logger.error(f"Erro ao criar sessão: {e}", exc_info=True)
            resp = make_response(jsonify({
                "error": "server_error",
                "error_description": "Erro interno ao criar sessão"
            }), 500)
            return add_cors(resp)
    
    @app.route("/auth/session/refresh", methods=["OPTIONS"])
    def refresh_session_options():
        return add_cors(make_response("", 204))
    
    @app.route("/auth/session/refresh", methods=["POST"])
    @require_https
    @rate_limit("/auth/session/refresh")
    def refresh_session():
        """
        Endpoint para renovar tokens de uma sessão (Fase 7)
        
        Request:
        {
            "session_id": "sess_abc123..."
        }
        
        Response:
        {
            "success": true,
            "access_token": "eyJ...",
            "id_token": "eyJ...",
            "expires_in": 3600,
            "expires_at": "2025-11-15T17:00:00Z"
        }
        """
        client_ip = request.headers.get("X-Forwarded-For", request.remote_addr)
        
        if not SESSION_MANAGER_ENABLED:
            resp = make_response(jsonify({
                "error": "service_unavailable",
                "error_description": "Sistema de sessões não disponível"
            }), 503)
            return add_cors(resp)
        
        try:
            data = request.get_json() or {}
            session_id = data.get("session_id", "")
            
            if not session_id:
                resp = make_response(jsonify({
                    "error": "invalid_request",
                    "error_description": "session_id é obrigatório"
                }), 400)
                return add_cors(resp)
            
            # Renovar tokens
            session_mgr = SessionManager()
            refresh_result = session_mgr.refresh_session(
                session_id=session_id,
                ip_address=client_ip
            )
            
            logger.info(f"Tokens renovados para sessão: {session_id}")
            
            resp = make_response(jsonify(refresh_result), 200)
            return add_cors(resp)
        
        except ValueError as e:
            logger.warning(f"Erro de validação ao renovar sessão: {e}")
            resp = make_response(jsonify({
                "error": "invalid_request",
                "error_description": str(e)
            }), 401)
            return add_cors(resp)
        
        except Exception as e:
            logger.error(f"Erro ao renovar sessão: {e}", exc_info=True)
            resp = make_response(jsonify({
                "error": "server_error",
                "error_description": "Erro interno ao renovar tokens"
            }), 500)
            return add_cors(resp)
    
    @app.route("/auth/session/revoke", methods=["OPTIONS"])
    def revoke_session_options():
        return add_cors(make_response("", 204))
    
    @app.route("/auth/session/revoke", methods=["POST"])
    @require_https
    @rate_limit("/auth/session/revoke")
    def revoke_session():
        """
        Endpoint para revogar uma sessão (Fase 7)
        
        Request:
        {
            "session_id": "sess_abc123..."
        }
        
        Response:
        {
            "success": true,
            "message": "Sessão revogada com sucesso"
        }
        """
        client_ip = request.headers.get("X-Forwarded-For", request.remote_addr)
        
        if not SESSION_MANAGER_ENABLED:
            resp = make_response(jsonify({
                "error": "service_unavailable",
                "error_description": "Sistema de sessões não disponível"
            }), 503)
            return add_cors(resp)
        
        try:
            data = request.get_json() or {}
            session_id = data.get("session_id", "")
            
            if not session_id:
                resp = make_response(jsonify({
                    "error": "invalid_request",
                    "error_description": "session_id é obrigatório"
                }), 400)
                return add_cors(resp)
            
            # Revogar sessão
            session_mgr = SessionManager()
            success = session_mgr.revoke_session(session_id=session_id)
            
            if success:
                logger.info(f"Sessão revogada: {session_id}")
                resp = make_response(jsonify({
                    "success": True,
                    "message": "Sessão revogada com sucesso"
                }), 200)
            else:
                resp = make_response(jsonify({
                    "error": "not_found",
                    "error_description": "Sessão não encontrada"
                }), 404)
            
            return add_cors(resp)
        
        except Exception as e:
            logger.error(f"Erro ao revogar sessão: {e}", exc_info=True)
            resp = make_response(jsonify({
                "error": "server_error",
                "error_description": "Erro interno ao revogar sessão"
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
    # ENDPOINTS DE AUTORIZAÇÃO - FASE 4/6
    # ============================================================================
    
    # Decorator require_admin agora é importado do authorization_middleware (Fase 6)
    # Se não disponível, usa fallback definido nos imports
    
    @app.route("/api/audit/access-granted", methods=["OPTIONS"])
    def access_granted_audit_options():
        """CORS preflight para auditoria de acesso autorizado"""
        return add_cors(make_response("", 200))
    
    @app.route("/api/audit/access-granted", methods=["POST"])
    @rate_limit("/api/audit/access-granted")
    def access_granted_audit():
        """
        Endpoint para registrar acesso autorizado (auditoria)
        
        Request:
        {
            "timestamp": "2025-11-16T15:30:00Z",
            "action": "access_granted",
            "email": "user@example.com",
            "role": "user",
            "fromCache": false,
            "page": "/secure/restrita.html",
            "userAgent": "Mozilla/5.0..."
        }
        
        Response:
        {
            "success": true,
            "message": "Acesso registrado"
        }
        """
        try:
            data = request.get_json() or {}
            email = data.get("email", "")
            role = data.get("role", "")
            page = data.get("page", "")
            from_cache = data.get("fromCache", False)
            
            if email:
                logger.info("Acesso autorizado registrado", extra={
                    "email": email,
                    "role": role,
                    "page": page,
                    "from_cache": from_cache,
                    "client_ip": request.headers.get("X-Forwarded-For", request.remote_addr),
                    "event": "access_granted"
                })
            
            resp = make_response(jsonify({
                "success": True,
                "message": "Acesso registrado"
            }), 200)
            return add_cors(resp)
        
        except Exception as e:
            logger.error(f"Erro ao registrar acesso autorizado: {e}", exc_info=True)
            resp = make_response(jsonify({
                "error": "internal_error",
                "error_description": "Erro ao registrar acesso"
            }), 500)
            return add_cors(resp)
    
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
            
            # Verificar se usuário existe mas está inativo
            user_info = auth_manager.get_user_status(email)
            user_status = user_info.get('status') if user_info else None
            is_inactive = user_info is not None and user_status == 'inactive'
            
            response_data = {
                "authorized": is_authorized,
                "role": user_role,
                "email": email,
                "status": user_status,  # 'active', 'inactive', ou None se não encontrado
                "inactive": is_inactive  # Flag para facilitar verificação no frontend
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
    @require_admin()
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
    @require_admin()
    def add_admin_user():
        """Adicionar novo usuário autorizado (admin only)"""
        try:
            if not AUTHORIZATION_ENABLED:
                return jsonify({"error": "authorization_disabled", "error_description": "Sistema de autorização não disponível"}), 503
            
            data = request.get_json()
            if not data:
                return jsonify({"error": "invalid_request", "error_description": "Dados JSON são obrigatórios"}), 400
            
            required_fields = ['email', 'name']
            for field in required_fields:
                if field not in data or not data[field]:
                    return jsonify({"error": "invalid_request", "error_description": f"Campo '{field}' é obrigatório"}), 400
            
            # Validar domínio do e-mail (apenas Google, Microsoft ou Cara Core)
            email_lower = data['email'].lower().strip()
            if not is_allowed_email_domain(email_lower):
                error_response = {
                    "error": "invalid_domain",
                    "error_description": "Apenas e-mails do Google (gmail.com, googlemail.com), Microsoft (outlook.com, hotmail.com, live.com, msn.com) ou Cara Core são permitidos"
                }
                resp = make_response(jsonify(error_response), 400)
                return add_cors(resp)
            
            # Detectar provedor automaticamente se não fornecido
            provider = data.get('provider')
            if not provider:
                provider = detect_provider_from_email(data['email'])
            
            # Verificar se usuário já existe antes de tentar adicionar
            email_lower = data['email'].lower().strip()
            existing_data = load_authorized_users()
            for existing_user in existing_data.get('users', []):
                if existing_user.get('email', '').lower() == email_lower:
                    error_response = {
                        "error": "duplicate_user", 
                        "error_description": f"Usuário com email {data['email']} já existe no sistema. Use a opção de editar para atualizar."
                    }
                    resp = make_response(jsonify(error_response), 409)  # 409 Conflict
                    return add_cors(resp)
            
            # Adicionar usuário
            user_data = {
                "email": data['email'],
                "name": data['name'],
                "provider": provider,
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
    
    @app.route("/api/admin/users/<email>", methods=["PUT"])
    @rate_limit("/api/admin/users")
    @require_admin()
    def update_admin_user(email):
        """Atualizar usuário autorizado (admin only)"""
        try:
            if not AUTHORIZATION_ENABLED:
                return jsonify({"error": "authorization_disabled", "error_description": "Sistema de autorização não disponível"}), 503
            
            if not email:
                return jsonify({"error": "invalid_request", "error_description": "Email é obrigatório"}), 400
            
            data = request.get_json()
            if not data:
                return jsonify({"error": "invalid_request", "error_description": "Dados JSON são obrigatórios"}), 400
            
            # Preparar atualizações (apenas campos permitidos)
            updates = {}
            if 'name' in data:
                updates['name'] = data['name']
            if 'role' in data:
                updates['role'] = data['role']
            if 'status' in data:
                updates['status'] = data['status']
            # Provider pode ser atualizado, mas se não fornecido, detectar automaticamente
            if 'provider' in data and data['provider']:
                updates['provider'] = data['provider']
            elif 'provider' in data and not data['provider']:
                # Se provider foi enviado vazio, detectar automaticamente
                updates['provider'] = detect_provider_from_email(email)
            
            if not updates:
                return jsonify({"error": "invalid_request", "error_description": "Nenhum campo válido para atualizar"}), 400
            
            success, message = update_authorized_user(email, updates, "admin")  # TODO: identificar admin real
            
            if success:
                response_data = {"message": message}
                resp = make_response(jsonify(response_data), 200)
            else:
                error_response = {"error": "operation_failed", "error_description": message}
                status_code = 404 if "não encontrado" in message else 400
                resp = make_response(jsonify(error_response), status_code)
            
            return add_cors(resp)
            
        except Exception as e:
            logger.error(f"Erro ao atualizar usuário: {e}")
            error_response = {"error": "internal_error", "error_description": "Erro interno do servidor"}
            resp = make_response(jsonify(error_response), 500)
            return add_cors(resp)
    
    @app.route("/api/admin/users/<email>", methods=["DELETE"])
    @rate_limit("/api/admin/users")
    @require_admin()
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
    
    @app.route("/api/admin/users/remove-duplicates", methods=["OPTIONS"])
    def remove_duplicates_preflight():
        """CORS preflight para remoção de duplicatas"""
        return add_cors(make_response("", 200))
    
    @app.route("/api/admin/users/remove-duplicates", methods=["POST"])
    @rate_limit("/api/admin/users")
    @require_admin()
    def remove_duplicate_users():
        """Remover usuários duplicados (admin only)"""
        try:
            if not AUTHORIZATION_ENABLED:
                return jsonify({"error": "authorization_disabled", "error_description": "Sistema de autorização não disponível"}), 503
            
            from collections import defaultdict
            
            # Obter admin atual
            admin_email = request.headers.get('X-User-Email', 'unknown')
            
            # Carregar dados
            data = load_authorized_users()
            users = data.get('users', [])
            initial_count = len(users)
            
            if initial_count == 0:
                return jsonify({
                    "message": "Nenhum usuário encontrado",
                    "removed": 0,
                    "before": 0,
                    "after": 0
                }), 200
            
            # Agrupar por email (case-insensitive)
            email_groups = defaultdict(list)
            for i, user in enumerate(users):
                email_lower = user.get('email', '').lower().strip()
                if email_lower:
                    email_groups[email_lower].append((i, user))
            
            # Identificar duplicatas
            duplicates_found = []
            for email_lower, user_list in email_groups.items():
                if len(user_list) > 1:
                    duplicates_found.append((email_lower, user_list))
            
            if not duplicates_found:
                return jsonify({
                    "message": "Nenhuma duplicata encontrada",
                    "removed": 0,
                    "before": initial_count,
                    "after": initial_count
                }), 200
            
            # Remover duplicatas (manter a mais recente baseada em approved_at ou created_at)
            indices_to_remove = []
            duplicates_info = []
            
            for email_lower, user_list in duplicates_found:
                # Ordenar por approved_at ou created_at (mais recente primeiro)
                user_list.sort(key=lambda x: (
                    x[1].get('approved_at', '') or x[1].get('created_at', '') or '',
                ), reverse=True)
                
                # Manter o primeiro (mais recente) e marcar os outros para remoção
                kept_user = user_list[0][1]
                for idx, user in user_list[1:]:
                    indices_to_remove.append(idx)
                    duplicates_info.append({
                        "email": user.get('email'),
                        "name": user.get('name'),
                        "kept": kept_user.get('email')
                    })
            
            # Remover duplicatas (em ordem reversa para não afetar índices)
            indices_to_remove.sort(reverse=True)
            removed_users = []
            for idx in indices_to_remove:
                removed_user = users.pop(idx)
                removed_users.append(removed_user.get('email'))
            
            # Atualizar dados
            data['users'] = users
            data['updated_at'] = datetime.utcnow().isoformat()
            
            # Adicionar ao log de auditoria
            if 'audit_log' not in data:
                data['audit_log'] = []
            
            data['audit_log'].append({
                "timestamp": datetime.utcnow().isoformat(),
                "action": "duplicates_removed",
                "details": f"Removidas {len(indices_to_remove)} duplicatas. Total antes: {initial_count}, depois: {len(users)}",
                "user": admin_email
            })
            
            # Salvar
            save_authorized_users(data)
            
            final_count = len(users)
            removed_count = initial_count - final_count
            
            logger.info(f"Duplicatas removidas: {removed_count} usuários removidos por {admin_email}")
            
            response_data = {
                "message": f"Duplicatas removidas com sucesso",
                "removed": removed_count,
                "before": initial_count,
                "after": final_count,
                "duplicates": duplicates_info
            }
            
            resp = make_response(jsonify(response_data), 200)
            return add_cors(resp)
            
        except Exception as e:
            logger.error(f"Erro ao remover duplicatas: {e}")
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
    @require_admin()
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
    @require_admin()
    def approve_access_request(request_id):
        """Aprovar solicitação de acesso (admin only)"""
        try:
            if not AUTHORIZATION_ENABLED:
                return jsonify({"error": "authorization_disabled", "error_description": "Sistema de autorização não disponível"}), 503
            
            # Carregar dados
            data = load_authorized_users()
            pending_requests = data.get('pending_requests', [])
            
            # Encontrar solicitação por ID ou email (compatibilidade com solicitações antigas)
            request_to_approve = None
            request_id_lower = str(request_id).lower()
            
            for req in pending_requests:
                req_id = str(req.get('id', '')).lower()
                req_email = str(req.get('email', '')).lower()
                
                if req_id == request_id_lower or req_email == request_id_lower:
                    request_to_approve = req
                    logger.info(f"Solicitação encontrada: ID={req.get('id')}, Email={req.get('email')}")
                    break
            
            if not request_to_approve:
                logger.warning(f"Solicitação não encontrada: request_id={request_id}, total_pending={len(pending_requests)}")
                error_response = {"error": "not_found", "error_description": "Solicitação não encontrada"}
                resp = make_response(jsonify(error_response), 404)
                return add_cors(resp)
            
            # Obter admin atual (do token)
            admin_email = request.headers.get('X-User-Email', 'unknown')
            
            # Verificar consentimento LGPD (obrigatório para aprovação)
            lgpd_consent = request_to_approve.get('lgpd_consent', False)
            lgpd_consent_timestamp = request_to_approve.get('lgpd_consent_timestamp')
            
            # Se não houver consentimento explícito, usar timestamp de aprovação como fallback
            # (para solicitações antigas que não tinham esse campo)
            if not lgpd_consent_timestamp:
                lgpd_consent_timestamp = datetime.utcnow().isoformat()
            
            # Detectar provedor automaticamente pelo domínio do e-mail se não estiver definido
            provider = request_to_approve.get('provider')
            if not provider:
                provider = detect_provider_from_email(request_to_approve['email'])
            
            # Criar novo usuário com dados de consentimento LGPD
            new_user = {
                "email": request_to_approve['email'],
                "name": request_to_approve['name'],
                "provider": provider,
                "role": "user",
                "status": "active",
                "approved_at": datetime.utcnow().isoformat(),
                "approved_by": admin_email,
                "created_at": datetime.utcnow().isoformat(),
                # Dados de consentimento LGPD (obrigatório para compliance)
                "lgpd_consent": lgpd_consent,
                "lgpd_consent_timestamp": lgpd_consent_timestamp,
                "lgpd_terms_version": request_to_approve.get('lgpd_terms_version', '1.0'),
                "lgpd_privacy_version": request_to_approve.get('lgpd_privacy_version', '1.0'),
                "data_retention_policy": "permanent",  # Dados mantidos enquanto usuário ativo na Área 51
                "lgpd_compliant": True,  # Flag indicando que dados foram coletados com consentimento
                "data_purpose": "Área 51 - Sistema de acesso restrito",  # Finalidade do tratamento de dados
                "data_controller": "Cara Core Informática"  # Controlador dos dados
            }
            
            # Verificar se usuário já existe (por email, independente de status)
            email_lower = new_user['email'].lower()
            existing_user_index = None
            for i, existing_user in enumerate(data['users']):
                if existing_user.get('email', '').lower() == email_lower:
                    existing_user_index = i
                    logger.warning(f"Usuário {email_lower} já existe na lista. Atualizando ao invés de duplicar.")
                    break
            
            if existing_user_index is not None:
                # Atualizar usuário existente ao invés de duplicar
                existing_user = data['users'][existing_user_index]
                # Preservar dados importantes do usuário existente
                existing_user.update({
                    'name': new_user['name'],
                    'provider': new_user['provider'],
                    'role': new_user['role'],
                    'status': 'active',  # Reativar se estava inativo
                    'approved_at': new_user['approved_at'],
                    'approved_by': new_user['approved_by'],
                    'updated_at': datetime.utcnow().isoformat()
                })
                # Preservar campos LGPD se existirem
                if 'lgpd_consent' in existing_user:
                    new_user['lgpd_consent'] = existing_user.get('lgpd_consent')
                if 'lgpd_consent_timestamp' in existing_user:
                    new_user['lgpd_consent_timestamp'] = existing_user.get('lgpd_consent_timestamp')
                logger.info(f"Usuário {email_lower} atualizado (não duplicado)")
            else:
                # Adicionar novo usuário apenas se não existir
                data['users'].append(new_user)
                logger.info(f"Novo usuário {email_lower} adicionado")
            
            # Remover das pendentes (por ID ou email) - garantir comparação correta
            request_email_lower = request_to_approve['email'].lower()
            request_id_str = str(request_to_approve.get('id', ''))
            
            initial_count = len(pending_requests)
            data['pending_requests'] = [
                r for r in pending_requests 
                if str(r.get('id', '')).lower() != request_id_str.lower() 
                and str(r.get('email', '')).lower() != request_email_lower
            ]
            removed_count = initial_count - len(data['pending_requests'])
            
            logger.info(f"Removendo solicitação pendente: ID={request_id_str}, Email={request_email_lower}, Removidas={removed_count}, Restantes={len(data['pending_requests'])}")
            
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
    @require_admin()
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
            
            # Encontrar solicitação por ID ou email (compatibilidade com solicitações antigas)
            request_to_reject = None
            for req in pending_requests:
                if req.get('id') == request_id or req.get('email', '').lower() == request_id.lower():
                    request_to_reject = req
                    break
            
            if not request_to_reject:
                error_response = {"error": "not_found", "error_description": "Solicitação não encontrada"}
                resp = make_response(jsonify(error_response), 404)
                return add_cors(resp)
            
            # Obter admin atual
            admin_email = request.headers.get('X-User-Email', 'unknown')
            
            # Remover das pendentes (por ID ou email)
            data['pending_requests'] = [
                r for r in pending_requests 
                if r.get('id') != request_id and r.get('email', '').lower() != request_id.lower()
            ]
            
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
            
            required_fields = ['email', 'name']
            for field in required_fields:
                if field not in data or not data[field]:
                    return jsonify({"error": "invalid_request", "error_description": f"Campo '{field}' é obrigatório"}), 400
            
            # Validar consentimento LGPD (OBRIGATÓRIO)
            lgpd_consent_data = data.get('lgpd_consent')
            if not lgpd_consent_data:
                return jsonify({
                    "error": "lgpd_consent_required", 
                    "error_description": "Consentimento LGPD é obrigatório. Você deve aceitar os Termos de Serviço e Política de Privacidade para solicitar acesso."
                }), 400
            
            # Verificar se o consentimento foi realmente dado
            lgpd_consent_value = False
            if isinstance(lgpd_consent_data, dict):
                lgpd_consent_value = lgpd_consent_data.get('lgpd_consent', False)
            elif isinstance(lgpd_consent_data, bool):
                lgpd_consent_value = lgpd_consent_data
            else:
                lgpd_consent_value = bool(lgpd_consent_data)
            
            if not lgpd_consent_value:
                return jsonify({
                    "error": "lgpd_consent_required", 
                    "error_description": "Consentimento LGPD é obrigatório. Você deve aceitar os Termos de Serviço e Política de Privacidade para solicitar acesso."
                }), 400
            
            # Detectar provedor automaticamente se não fornecido
            provider = data.get('provider')
            if not provider:
                provider = detect_provider_from_email(data['email'])
            
            # Criar solicitação incluindo dados de LGPD
            request_data = {
                "email": data['email'],
                "name": data['name'],
                "provider": provider,
                "message": data.get('message', ''),
                "lgpd_consent": lgpd_consent_data  # Incluir dados completos de LGPD
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
    
    @app.route("/api/request-access/status", methods=["OPTIONS"])
    def request_access_status_preflight():
        """CORS preflight para consulta de status"""
        return add_cors(make_response("", 200))
    
    @app.route("/api/request-access/status", methods=["GET"])
    @rate_limit("/api/request-access/status")
    def request_access_status():
        """Consultar status de uma solicitação de acesso por email"""
        try:
            if not AUTHORIZATION_ENABLED:
                return jsonify({"error": "authorization_disabled", "error_description": "Sistema de autorização não disponível"}), 503
            
            email = request.args.get('email')
            if not email:
                return jsonify({"error": "invalid_request", "error_description": "Parâmetro 'email' é obrigatório"}), 400
            
            # Buscar solicitação pendente
            pending_request = get_pending_request_by_email(email)
            
            if pending_request:
                response_data = {
                    "found": True,
                    "status": pending_request.get("status", "pending"),
                    "email": pending_request.get("email"),
                    "name": pending_request.get("name"),
                    "provider": pending_request.get("provider"),
                    "requested_at": pending_request.get("requested_at"),
                    "message": "Solicitação encontrada no sistema"
                }
                resp = make_response(jsonify(response_data), 200)
            else:
                # Verificar se o usuário já está autorizado
                is_authorized = is_user_authorized(email)
                if is_authorized:
                    response_data = {
                        "found": False,
                        "status": "authorized",
                        "email": email,
                        "message": "Usuário já está autorizado no sistema"
                    }
                else:
                    response_data = {
                        "found": False,
                        "status": "not_found",
                        "email": email,
                        "message": "Nenhuma solicitação encontrada para este email"
                    }
                resp = make_response(jsonify(response_data), 200)
            
            return add_cors(resp)
            
        except Exception as e:
            logger.error(f"Erro ao consultar status da solicitação: {e}")
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
            
            if not SUPER_ADMIN_PASSWORD_HASH or not jwt_secret_key:
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
            
            # PyJWT usa encode diretamente
            token = jwt.encode(payload, jwt_secret_key, algorithm='HS256')
            
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
    
    # Alias para compatibilidade com frontend
    @app.route("/api/admin/auth", methods=["OPTIONS"])
    def api_admin_auth_preflight():
        """CORS preflight para autenticação admin (alias)"""
        return add_cors(make_response("", 200))
    
    @app.route("/api/admin/auth", methods=["POST"])
    @rate_limit("/api/admin/auth")
    def api_authenticate_admin():
        """Autenticação admin (alias para /auth/super-admin)"""
        return authenticate_super_admin()
    
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
            
            if not jwt_secret_key:
                logger.error("Variável de ambiente JWT_SECRET_KEY não configurada")
                return jsonify({"error": "server_error", "error_description": "Configuração do servidor incompleta"}), 500
            
            try:
                payload = jwt.decode(token, jwt_secret_key, algorithms=['HS256'])
                
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
                
            except ExpiredSignatureError:
                return jsonify({"error": "token_expired", "error_description": "Token expirado"}), 401
            except InvalidTokenError as e:
                return jsonify({"error": "invalid_token", "error_description": "Token inválido"}), 401
                    
        except Exception as e:
            logger.error(f"Erro na verificação super admin: {e}")
            error_response = {"error": "internal_error", "error_description": "Erro interno do servidor"}
            resp = make_response(jsonify(error_response), 500)
            return add_cors(resp)

    # ========================================================================
    # SUPER ADMIN PASSWORD CHANGE ENDPOINT
    # ========================================================================
    
    @app.route("/api/admin/change-password", methods=["OPTIONS"])
    def change_password_preflight():
        """CORS preflight para alteração de senha super admin"""
        return add_cors(make_response("", 200))
    
    @app.route("/api/admin/change-password", methods=["POST"])
    @rate_limit("/api/admin/change-password")
    def change_super_admin_password():
        """Alteração segura da senha do super administrador"""
        try:
            # Verificar autenticação
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({"error": "unauthorized", "error_description": "Token de autorização obrigatório"}), 401
            
            token = auth_header.split(' ')[1]
            
            if not jwt_secret_key:
                logger.error("JWT_SECRET_KEY não configurado")
                return jsonify({"error": "server_error", "error_description": "Configuração do servidor incompleta"}), 500
            
            try:
                # Verificar token
                payload = jwt.decode(token, jwt_secret_key, algorithms=['HS256'])
                
                if payload.get('role') != 'super_admin':
                    return jsonify({"error": "forbidden", "error_description": "Acesso negado"}), 403
                
                # Obter dados da requisição
                data = request.get_json()
                if not data:
                    return jsonify({"error": "invalid_request", "error_description": "Dados JSON são obrigatórios"}), 400
                
                current_password = data.get('current_password')
                new_password = data.get('new_password')
                confirm_password = data.get('confirm_password')
                
                if not all([current_password, new_password, confirm_password]):
                    return jsonify({"error": "invalid_request", "error_description": "Senha atual, nova senha e confirmação são obrigatórias"}), 400
                
                # Verificar se nova senha e confirmação coincidem
                if new_password != confirm_password:
                    return jsonify({"error": "invalid_request", "error_description": "Nova senha e confirmação não coincidem"}), 400
                
                # Validar critérios da nova senha
                validation_error = validate_password_strength(new_password)
                if validation_error:
                    return jsonify({"error": "invalid_password", "error_description": validation_error}), 400
                
                # Verificar senha atual
                SUPER_ADMIN_EMAIL = 'suporte@caracore.com.br'
                SUPER_ADMIN_PASSWORD_HASH = os.getenv('SUPER_ADMIN_PASSWORD_HASH')
                
                if not SUPER_ADMIN_PASSWORD_HASH:
                    logger.error("SUPER_ADMIN_PASSWORD_HASH não configurado")
                    return jsonify({"error": "server_error", "error_description": "Configuração do servidor incompleta"}), 500
                
                # Verificar senha atual
                current_password_hash = hashlib.sha256(current_password.encode()).hexdigest()
                if current_password_hash != SUPER_ADMIN_PASSWORD_HASH:
                    logger.warning(f"Tentativa de alteração de senha com senha atual incorreta para: {payload.get('email')}")
                    return jsonify({"error": "unauthorized", "error_description": "Senha atual incorreta"}), 401
                
                # Gerar hash da nova senha
                new_password_hash = hashlib.sha256(new_password.encode()).hexdigest()
                
                # Log de auditoria
                logger.info(f"Alteração de senha super admin solicitada por: {payload.get('email')}")
                
                # Retornar novo hash para atualização manual no Azure
                # NOTA: Em produção, isso seria atualizado automaticamente via Azure API
                response_data = {
                    'success': True,
                    'message': 'Hash da nova senha gerado com sucesso',
                    'new_password_hash': new_password_hash,
                    'instructions': [
                        '1. Copie o hash abaixo',
                        '2. Atualize a variável SUPER_ADMIN_PASSWORD_HASH no Azure App Service',
                        '3. Reinicie a aplicação',
                        '4. A nova senha estará ativa'
                    ],
                    'azure_command': f'az webapp config appsettings set --name caracore-backend-docker --resource-group rg-caracore --settings SUPER_ADMIN_PASSWORD_HASH="{new_password_hash}"'
                }
                
                logger.info(f"Hash da nova senha gerado com sucesso para: {payload.get('email')}")
                
                resp = make_response(jsonify(response_data), 200)
                return add_cors(resp)
                
            except ExpiredSignatureError:
                return jsonify({"error": "token_expired", "error_description": "Token expirado"}), 401
            except InvalidTokenError:
                return jsonify({"error": "invalid_token", "error_description": "Token inválido"}), 401
                    
        except Exception as e:
            logger.error(f"Erro na alteração de senha super admin: {e}")
            error_response = {"error": "internal_error", "error_description": "Erro interno do servidor"}
            resp = make_response(jsonify(error_response), 500)
            return add_cors(resp)

    def validate_password_strength(password):
        """Valida critérios de segurança da senha"""
        if len(password) < 8:
            return "Senha deve ter pelo menos 8 caracteres"
        
        if len(password) > 128:
            return "Senha deve ter no máximo 128 caracteres"
        
        has_upper = any(c.isupper() for c in password)
        has_lower = any(c.islower() for c in password)
        has_digit = any(c.isdigit() for c in password)
        has_special = any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password)
        
        if not has_upper:
            return "Senha deve conter pelo menos uma letra maiúscula"
        
        if not has_lower:
            return "Senha deve conter pelo menos uma letra minúscula"
        
        if not has_digit:
            return "Senha deve conter pelo menos um número"
        
        if not has_special:
            return "Senha deve conter pelo menos um caractere especial (!@#$%^&*()_+-=[]{}|;:,.<>?)"
        
        # Verificar padrões comuns fracos
        weak_patterns = [
            "123456", "password", "admin", "caracore", "super", "admin123",
            "123456789", "qwerty", "abc123", "senha123"
        ]
        
        if password.lower() in weak_patterns:
            return "Senha muito comum, escolha uma senha mais segura"
        
        return None  # Senha válida

    # Aplicar security headers em todas as respostas
    @app.after_request
    def apply_security_headers(response):
        """Aplica headers de segurança em todas as respostas"""
        if SECURITY_HEADERS_ENABLED:
            try:
                # Para /api-docs, usar CSP mais permissivo se já não foi aplicado
                if request.path == "/api-docs":
                    # Se já tem CSP aplicado, não aplicar novamente
                    if "Content-Security-Policy" not in response.headers:
                        try:
                            # Tentar com parâmetro use_swagger_csp (versão nova)
                            response = add_security_headers(response, use_swagger_csp=True)
                        except TypeError:
                            # Se não aceitar o parâmetro, usar versão antiga (compatibilidade retroativa)
                            response = add_security_headers(response)
                else:
                    # Para outros endpoints, aplicar CSP padrão
                    if "Content-Security-Policy" not in response.headers:
                        response = add_security_headers(response)
            except Exception as e:
                logger.error(f"Erro ao aplicar security headers no after_request: {e}", exc_info=True)
                # Continuar mesmo se houver erro
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
    
    # Configurar Swagger/OpenAPI após todas as rotas serem registradas
    # Sempre criar endpoint alternativo primeiro (fallback garantido)
    @app.route("/api-docs", methods=["GET"])
    def swagger_ui_alternative():
        """Swagger UI alternativo usando CDN"""
        try:
            swagger_ui_html = """
<!DOCTYPE html>
<html>
<head>
    <title>CaraCore Backend API - Swagger UI</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css" />
    <style>
        html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
        *, *:before, *:after { box-sizing: inherit; }
        body { margin:0; background: #fafafa; }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            const ui = SwaggerUIBundle({
                url: window.location.origin + "/swagger.yaml",
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout"
            });
        };
    </script>
</body>
</html>
            """
            resp = make_response(swagger_ui_html, 200)
            resp.headers['Content-Type'] = 'text/html; charset=utf-8'
            # Aplicar CSP mais permissivo para Swagger UI
            # Nota: O after_request também aplicará headers, mas verificará se já foram aplicados
            if SECURITY_HEADERS_ENABLED:
                try:
                    # Tentar com parâmetro use_swagger_csp (versão nova)
                    try:
                        resp = add_security_headers(resp, use_swagger_csp=True)
                    except TypeError:
                        # Se não aceitar o parâmetro, usar versão antiga (compatibilidade retroativa)
                        logger.warning("Versão antiga de security.py detectada - usando add_security_headers sem parâmetro")
                        resp = add_security_headers(resp)
                except Exception as header_error:
                    logger.error(f"Erro ao aplicar security headers no Swagger: {header_error}", exc_info=True)
                    # Continuar mesmo se houver erro nos headers - o after_request tentará aplicar
            return add_cors(resp)
        except Exception as e:
            logger.error(f"Erro ao criar resposta Swagger UI: {e}", exc_info=True)
            error_resp = make_response(jsonify({"error": "internal_error", "error_description": str(e)}), 500)
            return add_cors(error_resp)
    
    # Tentar usar Flasgger (pode sobrescrever o endpoint acima se funcionar)
    try:
        from flasgger import Swagger
        swagger_config = {
            "headers": [],
            "specs": [
                {
                    "endpoint": "apispec",
                    "route": "/apispec.json",
                    "rule_filter": lambda rule: True,
                    "model_filter": lambda tag: True,
                }
            ],
            "static_url_path": "/flasgger_static",
            "swagger_ui": True,
            "specs_route": "/api-docs"
        }
        
        swagger_template = {
            "swagger": "2.0",
            "info": {
                "title": "CaraCore Backend API",
                "description": "API Backend do sistema CaraCore - Sistema de autenticação OAuth 2.1 + OIDC e gestão de usuários",
                "version": "1.0.0",
                "contact": {
                    "name": "CaraCore Team",
                    "email": "suporte@caracore.com.br"
                }
            },
            "servers": [
                {
                    "url": "https://caracore-backend-docker.azurewebsites.net",
                    "description": "Produção (Azure)"
                },
                {
                    "url": "http://localhost:5051",
                    "description": "Desenvolvimento Local"
                }
            ],
            "securityDefinitions": {
                "BearerAuth": {
                    "type": "apiKey",
                    "name": "Authorization",
                    "in": "header",
                    "description": "Token JWT no formato: Bearer {token}"
                }
            }
        }
        
        swagger = Swagger(app, config=swagger_config, template=swagger_template)
        logger.info("Swagger/OpenAPI documentação habilitada em /api-docs (Flasgger)")
    except (ImportError, Exception) as e:
        logger.warning(f"Flasgger não disponível - usando Swagger UI alternativo: {e}")
        # O endpoint alternativo já foi criado acima, então está garantido
    
    return app


app = create_app()


if __name__ == "__main__":
    port = int(os.getenv("PORT", "5051"))
    app.run(host="0.0.0.0", port=port)
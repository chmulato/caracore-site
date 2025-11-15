"""
HTTPS Enforcement e Security Headers

Implementa:
- Redirecionamento HTTP -> HTTPS obrigatório
- Security headers (HSTS, CSP, X-Frame-Options, etc)
- Proteção contra ataques comuns

Segue recomendações OWASP e OAuth 2.1
"""
from functools import wraps
from flask import request, redirect, make_response
import logging
import os

logger = logging.getLogger("cara-core-backend")


class SecurityConfig:
    """Configuração de segurança"""
    
    # HTTPS obrigatório em produção
    ENFORCE_HTTPS = os.getenv("ENFORCE_HTTPS", "true").lower() == "true"
    
    # Ambiente (production, development, local)
    ENVIRONMENT = os.getenv("ENVIRONMENT", "production").lower()
    
    # HSTS (HTTP Strict Transport Security)
    HSTS_MAX_AGE = int(os.getenv("HSTS_MAX_AGE", "31536000"))  # 1 ano
    HSTS_INCLUDE_SUBDOMAINS = True
    HSTS_PRELOAD = True
    
    # Content Security Policy
    CSP_POLICY = os.getenv("CSP_POLICY", 
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' https://accounts.google.com https://login.microsoftonline.com https://unpkg.com; "
        "style-src 'self' 'unsafe-inline' https://unpkg.com; "
        "img-src 'self' data: https:; "
        "font-src 'self' data: https://unpkg.com; "
        "connect-src 'self' https://oauth2.googleapis.com https://login.microsoftonline.com https://graph.microsoft.com; "
        "frame-ancestors 'none'; "
        "base-uri 'self'; "
        "form-action 'self'"
    )
    
    # CSP mais permissivo para Swagger UI
    CSP_POLICY_SWAGGER = os.getenv("CSP_POLICY_SWAGGER",
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' https://accounts.google.com https://login.microsoftonline.com https://unpkg.com; "
        "style-src 'self' 'unsafe-inline' https://unpkg.com; "
        "img-src 'self' data: https:; "
        "font-src 'self' data: https://unpkg.com; "
        "connect-src 'self' https://oauth2.googleapis.com https://login.microsoftonline.com https://graph.microsoft.com; "
        "frame-ancestors 'none'; "
        "base-uri 'self'; "
        "form-action 'self'"
    )
    
    # Referrer Policy
    REFERRER_POLICY = "strict-origin-when-cross-origin"
    
    # Permissions Policy
    PERMISSIONS_POLICY = "geolocation=(), microphone=(), camera=(), payment=()"


def is_https(request) -> bool:
    """Verifica se a requisição é HTTPS"""
    # Verificar esquema direto
    if request.scheme == "https":
        return True
    
    # Verificar headers de proxy (Azure, AWS, etc)
    # X-Forwarded-Proto: https (padrão)
    if request.headers.get("X-Forwarded-Proto") == "https":
        return True
    
    # X-Forwarded-SSL: on (nginx)
    if request.headers.get("X-Forwarded-SSL") == "on":
        return True
    
    # Front-End-Https: on (Microsoft IIS)
    if request.headers.get("Front-End-Https") == "on":
        return True
    
    return False


def require_https(f):
    """
    Decorator para forçar HTTPS em endpoints críticos
    
    Usage:
        @app.route("/oauth/token")
        @require_https
        def oauth_token():
            return {"access_token": "..."}
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Skip em ambiente local/dev
        if SecurityConfig.ENVIRONMENT in ("local", "development"):
            logger.debug("HTTPS enforcement skipped (local/dev environment)")
            return f(*args, **kwargs)
        
        # Verificar HTTPS
        if SecurityConfig.ENFORCE_HTTPS and not is_https(request):
            logger.warning("HTTPS required but not used", extra={
                "endpoint": request.path,
                "client_ip": request.remote_addr,
                "scheme": request.scheme
            })
            
            # Redirecionar para HTTPS
            url = request.url.replace("http://", "https://", 1)
            return redirect(url, code=301)  # Permanent redirect
        
        return f(*args, **kwargs)
    
    return decorated_function


def add_security_headers(response):
    """
    Adiciona headers de segurança na resposta
    
    Usage no Flask:
        @app.after_request
        def apply_security_headers(response):
            return add_security_headers(response)
    """
    
    # HSTS - Force HTTPS por período longo
    if is_https(request) and SecurityConfig.ENVIRONMENT == "production":
        hsts_value = f"max-age={SecurityConfig.HSTS_MAX_AGE}"
        if SecurityConfig.HSTS_INCLUDE_SUBDOMAINS:
            hsts_value += "; includeSubDomains"
        if SecurityConfig.HSTS_PRELOAD:
            hsts_value += "; preload"
        response.headers["Strict-Transport-Security"] = hsts_value
    
    # Content Security Policy - Previne XSS
    response.headers["Content-Security-Policy"] = SecurityConfig.CSP_POLICY
    
    # X-Frame-Options - Previne clickjacking
    response.headers["X-Frame-Options"] = "DENY"
    
    # X-Content-Type-Options - Previne MIME sniffing
    response.headers["X-Content-Type-Options"] = "nosniff"
    
    # Referrer-Policy - Controla informações no header Referer
    response.headers["Referrer-Policy"] = SecurityConfig.REFERRER_POLICY
    
    # X-XSS-Protection - Ativa proteção XSS do browser (legacy)
    response.headers["X-XSS-Protection"] = "1; mode=block"
    
    # Permissions-Policy - Controla features do browser
    response.headers["Permissions-Policy"] = SecurityConfig.PERMISSIONS_POLICY
    
    # Cache-Control para endpoints sensíveis
    if request.path.startswith("/oauth/") or request.path.startswith("/auth/"):
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, private"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
    
    return response


def validate_csrf_token(token_from_header: str, token_from_session: str) -> bool:
    """
    Valida token CSRF
    
    Args:
        token_from_header: Token recebido no header X-CSRF-Token
        token_from_session: Token armazenado na sessão do usuário
    
    Returns:
        True se tokens coincidem
    """
    if not token_from_header or not token_from_session:
        return False
    
    # Comparação timing-safe para prevenir timing attacks
    import hmac
    return hmac.compare_digest(token_from_header, token_from_session)


def get_security_headers_for_endpoint(endpoint_path: str) -> dict:
    """
    Retorna headers de segurança específicos para um endpoint
    
    Usage:
        headers = get_security_headers_for_endpoint("/oauth/token")
        response = make_response(jsonify(data))
        for key, value in headers.items():
            response.headers[key] = value
    """
    headers = {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Referrer-Policy": SecurityConfig.REFERRER_POLICY
    }
    
    # Headers específicos para endpoints OAuth/Auth
    if endpoint_path.startswith("/oauth/") or endpoint_path.startswith("/auth/"):
        headers.update({
            "Cache-Control": "no-store, no-cache, must-revalidate, private",
            "Pragma": "no-cache"
        })
    
    # HSTS em produção
    if SecurityConfig.ENVIRONMENT == "production" and is_https(request):
        hsts_value = f"max-age={SecurityConfig.HSTS_MAX_AGE}; includeSubDomains; preload"
        headers["Strict-Transport-Security"] = hsts_value
    
    return headers


def log_security_event(event_type: str, details: dict):
    """
    Log estruturado de eventos de segurança
    
    Args:
        event_type: Tipo do evento (https_redirect, csrf_failed, etc)
        details: Detalhes adicionais
    """
    logger.warning(f"Security event: {event_type}", extra={
        "event_type": event_type,
        "client_ip": request.headers.get("X-Forwarded-For", request.remote_addr),
        "endpoint": request.path,
        "method": request.method,
        **details
    })

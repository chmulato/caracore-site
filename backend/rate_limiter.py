"""
Rate Limiter para proteção contra força bruta e DDoS

Implementa rate limiting baseado em:
- IP do cliente
- Endpoint acessado
- Janela de tempo configurável

Segue boas práticas de OAuth 2.1 para proteção de endpoints críticos.
"""
import time
from collections import defaultdict
from dataclasses import dataclass
from functools import wraps
from typing import Dict, Tuple
from flask import request, jsonify, make_response
import logging

logger = logging.getLogger("cara-core-backend")


@dataclass
class RateLimitConfig:
    """Configuração de rate limit para um endpoint"""
    max_requests: int  # Número máximo de requisições
    window_seconds: int  # Janela de tempo em segundos
    block_duration: int = 300  # Duração do bloqueio em segundos (5 min default)


class RateLimiter:
    """
    Rate limiter em memória (simples)
    
    Para produção, considere usar Redis para rate limiting distribuído.
    """
    
    def __init__(self):
        # {(client_ip, endpoint): [(timestamp1, timestamp2, ...)]}
        self.requests: Dict[Tuple[str, str], list] = defaultdict(list)
        
        # {(client_ip, endpoint): block_until_timestamp}
        self.blocked: Dict[Tuple[str, str], float] = {}
        
        # Configurações por endpoint
        self.configs: Dict[str, RateLimitConfig] = {
            # Endpoints de autenticação - mais restritivo
            "/oauth/google/token": RateLimitConfig(
                max_requests=10,
                window_seconds=60,  # 10 req/min
                block_duration=300  # Bloqueia por 5 min
            ),
            "/oauth/microsoft/token": RateLimitConfig(
                max_requests=10,
                window_seconds=60,  # 10 req/min
                block_duration=300  # Bloqueia por 5 min
            ),
            "/auth/token/refresh": RateLimitConfig(
                max_requests=20,
                window_seconds=60,  # 20 req/min
                block_duration=180  # Bloqueia por 3 min
            ),
            "/auth/validate": RateLimitConfig(
                max_requests=30,
                window_seconds=60,  # 30 req/min
                block_duration=60   # Bloqueia por 1 min
            ),
            "/auth/logout": RateLimitConfig(
                max_requests=10,
                window_seconds=60,  # 10 req/min
                block_duration=60   # Bloqueia por 1 min
            ),
            # Default para outros endpoints
            "default": RateLimitConfig(
                max_requests=100,
                window_seconds=60,
                block_duration=60
            )
        }
    
    def _get_client_key(self, endpoint: str) -> Tuple[str, str]:
        """Obtém chave única para o cliente (IP + endpoint)"""
        # Prefer X-Forwarded-For for proxied requests
        client_ip = request.headers.get("X-Forwarded-For", request.remote_addr)
        if "," in client_ip:
            client_ip = client_ip.split(",")[0].strip()
        return (client_ip, endpoint)
    
    def _cleanup_old_requests(self, key: Tuple[str, str], window_seconds: int):
        """Remove requisições antigas fora da janela de tempo"""
        now = time.time()
        cutoff = now - window_seconds
        
        if key in self.requests:
            self.requests[key] = [ts for ts in self.requests[key] if ts > cutoff]
    
    def is_rate_limited(self, endpoint: str) -> Tuple[bool, dict]:
        """
        Verifica se cliente excedeu rate limit
        
        Returns:
            (is_limited, info_dict)
            - is_limited: True se deve bloquear
            - info_dict: informações sobre o limite
        """
        key = self._get_client_key(endpoint)
        now = time.time()
        
        # Verificar se está bloqueado
        if key in self.blocked:
            block_until = self.blocked[key]
            if now < block_until:
                remaining = int(block_until - now)
                logger.warning(f"Rate limit: Cliente bloqueado", extra={
                    "client_ip": key[0],
                    "endpoint": endpoint,
                    "remaining_seconds": remaining
                })
                return True, {
                    "error": "rate_limit_exceeded",
                    "error_description": "Muitas requisições. Tente novamente mais tarde.",
                    "retry_after": remaining
                }
            else:
                # Bloqueio expirou
                del self.blocked[key]
        
        # Obter configuração para o endpoint
        config = self.configs.get(endpoint, self.configs["default"])
        
        # Limpar requisições antigas
        self._cleanup_old_requests(key, config.window_seconds)
        
        # Adicionar requisição atual
        self.requests[key].append(now)
        
        # Verificar se excedeu limite
        request_count = len(self.requests[key])
        
        if request_count > config.max_requests:
            # Bloquear cliente
            self.blocked[key] = now + config.block_duration
            
            logger.warning(f"Rate limit exceeded - bloqueando cliente", extra={
                "client_ip": key[0],
                "endpoint": endpoint,
                "request_count": request_count,
                "max_requests": config.max_requests,
                "block_duration": config.block_duration
            })
            
            return True, {
                "error": "rate_limit_exceeded",
                "error_description": f"Limite excedido: {config.max_requests} req/{config.window_seconds}s",
                "retry_after": config.block_duration
            }
        
        # Dentro do limite
        remaining = config.max_requests - request_count
        return False, {
            "remaining": remaining,
            "limit": config.max_requests,
            "window": config.window_seconds
        }
    
    def get_rate_limit_headers(self, endpoint: str) -> dict:
        """Retorna headers HTTP para rate limiting (RFC 6585)"""
        config = self.configs.get(endpoint, self.configs["default"])
        key = self._get_client_key(endpoint)
        
        self._cleanup_old_requests(key, config.window_seconds)
        request_count = len(self.requests.get(key, []))
        remaining = max(0, config.max_requests - request_count)
        
        now = time.time()
        reset_time = int(now + config.window_seconds)
        
        return {
            "X-RateLimit-Limit": str(config.max_requests),
            "X-RateLimit-Remaining": str(remaining),
            "X-RateLimit-Reset": str(reset_time)
        }


# Singleton global
_rate_limiter = RateLimiter()


def rate_limit(endpoint: str = None):
    """
    Decorator para aplicar rate limiting em rotas Flask
    
    Usage:
        @app.route("/api/endpoint")
        @rate_limit("/api/endpoint")
        def my_endpoint():
            return {"status": "ok"}
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Usar endpoint fornecido ou detectar da request
            endpoint_path = endpoint or request.path
            
            # Verificar rate limit
            is_limited, info = _rate_limiter.is_rate_limited(endpoint_path)
            
            if is_limited:
                # Retornar erro 429 Too Many Requests
                response = make_response(jsonify(info), 429)
                if "retry_after" in info:
                    response.headers["Retry-After"] = str(info["retry_after"])
                return response
            
            # Executar função normalmente
            result = f(*args, **kwargs)
            
            # Adicionar headers de rate limit na resposta
            if hasattr(result, 'headers'):
                headers = _rate_limiter.get_rate_limit_headers(endpoint_path)
                for key, value in headers.items():
                    result.headers[key] = value
            
            return result
        
        return decorated_function
    return decorator


def get_rate_limiter() -> RateLimiter:
    """Retorna instância global do rate limiter"""
    return _rate_limiter

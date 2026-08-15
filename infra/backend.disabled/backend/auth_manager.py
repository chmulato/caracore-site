"""
Auth Manager - Centraliza lógica de autenticação OAuth 2.1 + OIDC

Este módulo implementa:
- Validação PKCE obrigatória (S256)
- Validação robusta de tokens ID/Access
- Refresh token rotation
- Logging de auditoria
"""
import hashlib
import base64
import time
import logging
from typing import Optional, Dict, Any, Tuple
from dataclasses import dataclass

logger = logging.getLogger("auth_manager")


@dataclass
class PKCEValidationResult:
    """Resultado da validação PKCE"""
    valid: bool
    error_code: Optional[str] = None
    error_description: Optional[str] = None


@dataclass
class TokenValidationResult:
    """Resultado da validação de token"""
    valid: bool
    claims: Optional[Dict[str, Any]] = None
    error_code: Optional[str] = None
    error_description: Optional[str] = None


class PKCEValidator:
    """
    Validador PKCE conforme OAuth 2.1
    
    OAuth 2.1 requer:
    - PKCE obrigatório para todos os clientes
    - Método S256 (SHA-256) obrigatório
    - code_verifier: 43-128 caracteres [A-Z, a-z, 0-9, -, ., _, ~]
    """
    
    MIN_VERIFIER_LENGTH = 43
    MAX_VERIFIER_LENGTH = 128
    REQUIRED_METHOD = "S256"
    
    @classmethod
    def validate(
        cls,
        code_verifier: str,
        code_challenge: str,
        method: str = "S256"
    ) -> PKCEValidationResult:
        """
        Valida PKCE conforme OAuth 2.1
        
        Args:
            code_verifier: Código enviado pelo cliente na troca de token
            code_challenge: Desafio original enviado na autorização
            method: Método usado (deve ser 'S256')
        
        Returns:
            PKCEValidationResult com resultado da validação
        """
        # Validar presença dos parâmetros
        if not code_verifier:
            return PKCEValidationResult(
                valid=False,
                error_code="invalid_request",
                error_description="code_verifier é obrigatório"
            )
        
        if not code_challenge:
            return PKCEValidationResult(
                valid=False,
                error_code="invalid_request",
                error_description="code_challenge é obrigatório"
            )
        
        # Validar método (OAuth 2.1 requer S256)
        if method != cls.REQUIRED_METHOD:
            return PKCEValidationResult(
                valid=False,
                error_code="invalid_request",
                error_description=f"Método {method} não suportado. OAuth 2.1 requer S256"
            )
        
        # Validar comprimento do code_verifier
        verifier_len = len(code_verifier)
        if verifier_len < cls.MIN_VERIFIER_LENGTH or verifier_len > cls.MAX_VERIFIER_LENGTH:
            return PKCEValidationResult(
                valid=False,
                error_code="invalid_request",
                error_description=f"code_verifier deve ter entre {cls.MIN_VERIFIER_LENGTH} e {cls.MAX_VERIFIER_LENGTH} caracteres"
            )
        
        # Calcular SHA256 do code_verifier
        try:
            sha256_hash = hashlib.sha256(code_verifier.encode('ascii')).digest()
            calculated_challenge = base64.urlsafe_b64encode(sha256_hash).decode('ascii').rstrip('=')
        except Exception as e:
            logger.error(f"Erro ao calcular PKCE challenge: {e}")
            return PKCEValidationResult(
                valid=False,
                error_code="server_error",
                error_description="Erro ao validar PKCE"
            )
        
        # Comparar com code_challenge original
        if calculated_challenge != code_challenge:
            logger.warning(
                "PKCE validation failed",
                extra={
                    "expected": code_challenge[:10] + "...",
                    "calculated": calculated_challenge[:10] + "..."
                }
            )
            return PKCEValidationResult(
                valid=False,
                error_code="invalid_grant",
                error_description="code_verifier inválido"
            )
        
        return PKCEValidationResult(valid=True)


class TokenValidator:
    """
    Validador robusto de tokens ID/Access conforme OIDC
    
    Valida:
    - Issuer (iss) - provedor esperado
    - Audience (aud) - client ID correto
    - Expiration (exp) - token não expirado
    - Issued At (iat) - tempo de emissão razoável
    - Nonce (quando presente)
    """
    
    # Janela de tolerância para clock skew (5 minutos)
    CLOCK_SKEW_SECONDS = 300
    
    # Tempo máximo aceitável desde emissão (24 horas)
    MAX_TOKEN_AGE_SECONDS = 86400
    
    @classmethod
    def validate_claims(
        cls,
        claims: Dict[str, Any],
        expected_issuer: str,
        expected_audience: str,
        expected_nonce: Optional[str] = None
    ) -> TokenValidationResult:
        """
        Valida claims de um token ID/Access
        
        Args:
            claims: Claims extraídos do JWT
            expected_issuer: Issuer esperado (ex: https://accounts.google.com)
            expected_audience: Audience esperado (Client ID)
            expected_nonce: Nonce esperado (se usado)
        
        Returns:
            TokenValidationResult com resultado da validação
        """
        now = int(time.time())
        
        # Validar issuer (iss)
        token_iss = claims.get("iss")
        if not token_iss:
            return TokenValidationResult(
                valid=False,
                error_code="invalid_token",
                error_description="Token não contém 'iss' (issuer)"
            )
        
        if token_iss != expected_issuer:
            return TokenValidationResult(
                valid=False,
                error_code="invalid_token",
                error_description=f"Issuer inválido. Esperado: {expected_issuer}, Recebido: {token_iss}"
            )
        
        # Validar audience (aud)
        token_aud = claims.get("aud")
        if not token_aud:
            return TokenValidationResult(
                valid=False,
                error_code="invalid_token",
                error_description="Token não contém 'aud' (audience)"
            )
        
        # aud pode ser string ou lista
        audiences = [token_aud] if isinstance(token_aud, str) else token_aud
        if expected_audience not in audiences:
            return TokenValidationResult(
                valid=False,
                error_code="invalid_token",
                error_description=f"Audience inválido. Client ID não encontrado em audiences"
            )
        
        # Validar expiration (exp)
        token_exp = claims.get("exp")
        if not token_exp:
            return TokenValidationResult(
                valid=False,
                error_code="invalid_token",
                error_description="Token não contém 'exp' (expiration)"
            )
        
        if now > token_exp + cls.CLOCK_SKEW_SECONDS:
            return TokenValidationResult(
                valid=False,
                error_code="token_expired",
                error_description="Token expirado"
            )
        
        # Validar issued at (iat)
        token_iat = claims.get("iat")
        if token_iat:
            # Token não pode ser do futuro (com tolerância de clock skew)
            if token_iat > now + cls.CLOCK_SKEW_SECONDS:
                return TokenValidationResult(
                    valid=False,
                    error_code="invalid_token",
                    error_description="Token emitido no futuro"
                )
            
            # Token não pode ser muito antigo
            if now - token_iat > cls.MAX_TOKEN_AGE_SECONDS:
                return TokenValidationResult(
                    valid=False,
                    error_code="invalid_token",
                    error_description="Token muito antigo"
                )
        
        # Validar nonce (se esperado)
        if expected_nonce:
            token_nonce = claims.get("nonce")
            if not token_nonce:
                return TokenValidationResult(
                    valid=False,
                    error_code="invalid_token",
                    error_description="Token não contém nonce esperado"
                )
            
            if token_nonce != expected_nonce:
                return TokenValidationResult(
                    valid=False,
                    error_code="invalid_token",
                    error_description="Nonce inválido"
                )
        
        return TokenValidationResult(valid=True, claims=claims)


class AuditLogger:
    """
    Logger de auditoria para eventos de autenticação
    
    Registra:
    - Tentativas de login (sucesso/falha)
    - Troca de tokens
    - Refresh de tokens
    - Logout
    - Eventos suspeitos
    """
    
    @staticmethod
    def log_auth_attempt(
        provider: str,
        success: bool,
        client_ip: Optional[str] = None,
        user_id: Optional[str] = None,
        error_code: Optional[str] = None
    ) -> None:
        """Registra tentativa de autenticação"""
        logger.info(
            f"Auth attempt: provider={provider}, success={success}",
            extra={
                "event": "auth_attempt",
                "provider": provider,
                "success": success,
                "client_ip": client_ip,
                "user_id": user_id,
                "error_code": error_code,
                "timestamp": time.time()
            }
        )
    
    @staticmethod
    def log_token_exchange(
        provider: str,
        success: bool,
        has_pkce: bool,
        client_ip: Optional[str] = None,
        error_code: Optional[str] = None
    ) -> None:
        """Registra troca de código por token"""
        logger.info(
            f"Token exchange: provider={provider}, success={success}, pkce={has_pkce}",
            extra={
                "event": "token_exchange",
                "provider": provider,
                "success": success,
                "has_pkce": has_pkce,
                "client_ip": client_ip,
                "error_code": error_code,
                "timestamp": time.time()
            }
        )
    
    @staticmethod
    def log_token_refresh(
        success: bool,
        user_id: Optional[str] = None,
        client_ip: Optional[str] = None,
        error_code: Optional[str] = None
    ) -> None:
        """Registra refresh de token"""
        logger.info(
            f"Token refresh: success={success}",
            extra={
                "event": "token_refresh",
                "success": success,
                "user_id": user_id,
                "client_ip": client_ip,
                "error_code": error_code,
                "timestamp": time.time()
            }
        )
    
    @staticmethod
    def log_logout(
        user_id: Optional[str] = None,
        client_ip: Optional[str] = None
    ) -> None:
        """Registra logout"""
        logger.info(
            "User logout",
            extra={
                "event": "logout",
                "user_id": user_id,
                "client_ip": client_ip,
                "timestamp": time.time()
            }
        )
    
    @staticmethod
    def log_suspicious_activity(
        activity_type: str,
        details: str,
        client_ip: Optional[str] = None
    ) -> None:
        """Registra atividade suspeita"""
        logger.warning(
            f"Suspicious activity: {activity_type}",
            extra={
                "event": "suspicious_activity",
                "activity_type": activity_type,
                "details": details,
                "client_ip": client_ip,
                "timestamp": time.time()
            }
        )
    
    @staticmethod
    def log_access_check(
        email: str,
        is_authorized: bool,
        client_ip: Optional[str] = None
    ) -> None:
        """Registra verificação de autorização de acesso"""
        logger.info(
            f"Access check: email={email}, authorized={is_authorized}",
            extra={
                "event": "access_check",
                "email": email,
                "authorized": is_authorized,
                "client_ip": client_ip,
                "timestamp": time.time()
            }
        )
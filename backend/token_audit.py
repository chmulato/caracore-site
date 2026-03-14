"""
Token Audit Logger - Sistema de auditoria para operações de token
Fase 7 - Sistema de Refresh Tokens

Registra eventos importantes relacionados a sessões e tokens para compliance e segurança
"""

import json
import logging
import os
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict, Optional, Any
from logging.handlers import RotatingFileHandler


class TokenAuditLogger:
    """
    Logger de auditoria para operações de token.
    
    Registra eventos em formato JSON estruturado para facilitar análise e compliance.
    """
    
    def __init__(self, log_path: str = None):
        """
        Inicializa o audit logger.
        
        Args:
            log_path: Caminho para arquivo de log (default: backend/logs/token_audit.log)
        """
        if log_path is None:
            app_root = Path(__file__).resolve().parent
            log_path = app_root / "logs" / "token_audit.log"
        else:
            log_path = Path(log_path)
        
        # Criar diretório de logs se não existir
        log_path.parent.mkdir(parents=True, exist_ok=True)
        
        self.log_path = log_path
        
        # Configurar logger
        self.logger = logging.getLogger('token_audit')
        self.logger.setLevel(logging.INFO)
        
        # Evitar duplicação de handlers
        if not self.logger.handlers:
            # Handler com rotação (10MB, manter 5 arquivos)
            handler = RotatingFileHandler(
                str(log_path),
                maxBytes=10 * 1024 * 1024,  # 10MB
                backupCount=5,
                encoding='utf-8'
            )
            
            # Formato JSON estruturado
            formatter = logging.Formatter('%(message)s')
            handler.setFormatter(formatter)
            
            self.logger.addHandler(handler)
        
        logging.info(f"TokenAuditLogger inicializado: {log_path}")
    
    def _log_event(
        self,
        event_type: str,
        session_id: str = None,
        user_email: str = None,
        provider: str = None,
        ip_address: str = None,
        user_agent: str = None,
        details: Dict[str, Any] = None,
        success: bool = True,
        error: str = None
    ):
        """
        Registra evento de auditoria em formato JSON.
        
        Args:
            event_type: Tipo do evento
            session_id: ID da sessão (opcional)
            user_email: Email do usuário (opcional, mascarado)
            provider: Provider OAuth (opcional)
            ip_address: IP do cliente (opcional)
            user_agent: User agent (opcional)
            details: Detalhes adicionais (opcional)
            success: Se operação foi bem-sucedida
            error: Mensagem de erro (se houver)
        """
        # Mascarar email para privacidade (manter apenas domínio)
        masked_email = None
        if user_email:
            try:
                local, domain = user_email.split('@', 1)
                masked_email = f"{local[0]}***@{domain}" if len(local) > 0 else f"***@{domain}"
            except Exception:
                masked_email = "***@***"
        
        # Criar entrada de log
        log_entry = {
            "timestamp": datetime.now(timezone.utc).replace(tzinfo=None).isoformat() + "Z",
            "event": event_type,
            "success": success,
            "session_id": session_id,
            "user_email": masked_email,  # Sempre mascarado
            "provider": provider,
            "ip_address": ip_address,
            "user_agent": user_agent,
        }
        
        if error:
            log_entry["error"] = error
        
        if details:
            # Garantir que details não contenha dados sensíveis
            safe_details = {}
            for key, value in details.items():
                # Não incluir tokens ou dados sensíveis
                if any(sensitive in key.lower() for sensitive in ['token', 'password', 'secret', 'key']):
                    safe_details[key] = "***REDACTED***"
                else:
                    safe_details[key] = value
            log_entry["details"] = safe_details
        
        # Registrar em formato JSON (uma linha por evento)
        self.logger.info(json.dumps(log_entry, ensure_ascii=False))
    
    def log_session_created(
        self,
        session_id: str,
        user_email: str,
        provider: str,
        ip_address: str = None,
        user_agent: str = None
    ):
        """
        Registra criação de sessão.
        
        Args:
            session_id: ID da sessão criada
            user_email: Email do usuário
            provider: Provider OAuth
            ip_address: IP do cliente
            user_agent: User agent do cliente
        """
        self._log_event(
            event_type="session_created",
            session_id=session_id,
            user_email=user_email,
            provider=provider,
            ip_address=ip_address,
            user_agent=user_agent,
            success=True
        )
    
    def log_token_refreshed(
        self,
        session_id: str,
        user_email: str = None,
        ip_address: str = None,
        success: bool = True,
        error: str = None
    ):
        """
        Registra renovação de token.
        
        Args:
            session_id: ID da sessão
            user_email: Email do usuário (opcional)
            ip_address: IP do cliente (opcional)
            success: Se renovação foi bem-sucedida
            error: Mensagem de erro (se houver)
        """
        self._log_event(
            event_type="token_refreshed",
            session_id=session_id,
            user_email=user_email,
            ip_address=ip_address,
            success=success,
            error=error
        )
    
    def log_session_revoked(
        self,
        session_id: str,
        user_email: str = None,
        reason: str = None,
        ip_address: str = None
    ):
        """
        Registra revogação de sessão.
        
        Args:
            session_id: ID da sessão revogada
            user_email: Email do usuário (opcional)
            reason: Motivo da revogação (opcional)
            ip_address: IP do cliente (opcional)
        """
        details = {}
        if reason:
            details["reason"] = reason
        
        self._log_event(
            event_type="session_revoked",
            session_id=session_id,
            user_email=user_email,
            ip_address=ip_address,
            details=details,
            success=True
        )
    
    def log_invalid_access(
        self,
        session_id: str = None,
        ip_address: str = None,
        reason: str = None,
        user_agent: str = None
    ):
        """
        Registra tentativa de acesso inválido.
        
        Args:
            session_id: ID da sessão (se disponível)
            ip_address: IP do cliente
            reason: Motivo do acesso inválido
            user_agent: User agent do cliente
        """
        details = {}
        if reason:
            details["reason"] = reason
        
        self._log_event(
            event_type="invalid_access",
            session_id=session_id,
            ip_address=ip_address,
            user_agent=user_agent,
            details=details,
            success=False
        )
    
    def log_cleanup(
        self,
        removed_count: int,
        cleanup_type: str = "expired_sessions"
    ):
        """
        Registra operação de limpeza.
        
        Args:
            removed_count: Número de itens removidos
            cleanup_type: Tipo de limpeza (expired_sessions, old_logs, etc.)
        """
        self._log_event(
            event_type="cleanup",
            details={
                "removed_count": removed_count,
                "cleanup_type": cleanup_type
            },
            success=True
        )
    
    def log_rate_limit_exceeded(
        self,
        session_id: str = None,
        ip_address: str = None,
        endpoint: str = None
    ):
        """
        Registra excedência de rate limit.
        
        Args:
            session_id: ID da sessão (se disponível)
            ip_address: IP do cliente
            endpoint: Endpoint que excedeu o limite
        """
        self._log_event(
            event_type="rate_limit_exceeded",
            session_id=session_id,
            ip_address=ip_address,
            details={"endpoint": endpoint} if endpoint else None,
            success=False,
            error="Rate limit exceeded"
        )


# Instância global para uso em outros módulos
_audit_logger = None


def get_audit_logger() -> TokenAuditLogger:
    """
    Obtém instância global do audit logger (singleton).
    
    Returns:
        Instância de TokenAuditLogger
    """
    global _audit_logger
    if _audit_logger is None:
        log_path = os.getenv('AUDIT_LOG_PATH')
        _audit_logger = TokenAuditLogger(log_path=log_path)
    return _audit_logger


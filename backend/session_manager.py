"""
Session Manager - Gerenciamento de sessões de usuário com refresh tokens
Implementa criação, renovação e revogação de sessões OAuth 2.1

Fase 7 - Sistema de Refresh Tokens
Responsável por gerenciar o ciclo de vida completo de sessões
"""

import os
import logging
import requests
from typing import Dict, Optional, Any
from datetime import datetime, timedelta, timezone

from crypto_manager import CryptoManager
from token_storage import TokenStorage
from token_audit import get_audit_logger

# Configurar logging
logger = logging.getLogger(__name__)

# Endpoints OAuth
GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token"
AZURE_TOKEN_ENDPOINT_TEMPLATE = "https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token"
DEFAULT_AZURE_SCOPE = "openid profile email offline_access"


class SessionManager:
    """
    Gerencia sessões de usuário com refresh tokens.
    
    Funcionalidades:
    - Criação de sessões com tokens criptografados
    - Renovação automática de access tokens
    - Revogação de sessões
    - Limite de sessões por usuário
    - Validação de sessões
    """
    
    def __init__(
        self,
        session_timeout_hours: int = None,
        max_sessions_per_user: int = None
    ):
        """
        Inicializa SessionManager.
        
        Args:
            session_timeout_hours: Horas até expiração da sessão (default: env var ou 24)
            max_sessions_per_user: Máximo de sessões por usuário (default: env var ou 5)
        """
        # Configurações
        self.session_timeout_hours = (
            session_timeout_hours or
            int(os.getenv("SESSION_TIMEOUT_HOURS", "24"))
        )
        self.max_sessions_per_user = (
            max_sessions_per_user or
            int(os.getenv("MAX_SESSIONS_PER_USER", "5"))
        )
        
        # Inicializar componentes
        self.storage = TokenStorage()
        self.crypto = CryptoManager()
        self.audit_logger = get_audit_logger()
        
        logger.info(
            f"SessionManager inicializado: "
            f"timeout={self.session_timeout_hours}h, "
            f"max_sessions={self.max_sessions_per_user}"
        )
    
    def create_session(
        self,
        user_data: Dict[str, Any],
        tokens: Dict[str, Any],
        ip_address: str = None,
        user_agent: str = None
    ) -> Dict[str, Any]:
        """
        Cria uma nova sessão de usuário.
        
        Args:
            user_data: Dados do usuário (email, name, provider, user_id)
            tokens: Tokens OAuth (access_token, id_token, refresh_token, expires_in)
            ip_address: IP do cliente (opcional)
            user_agent: User agent do cliente (opcional)
            
        Returns:
            Dicionário com dados da sessão criada (session_id, access_token, etc.)
            
        Raises:
            ValueError: Se dados inválidos ou limite de sessões excedido
            RuntimeError: Se falhar ao criar sessão
        """
        # Validar dados de entrada
        email = user_data.get("email")
        if not email:
            raise ValueError("user_data deve conter 'email'")
        
        provider = user_data.get("provider", "").lower()
        if provider not in ["google", "microsoft"]:
            raise ValueError(f"Provider inválido: {provider}")
        
        refresh_token = tokens.get("refresh_token")
        if not refresh_token:
            raise ValueError("tokens deve conter 'refresh_token'")
        
        access_token = tokens.get("access_token")
        id_token = tokens.get("id_token")
        expires_in = tokens.get("expires_in", 3600)
        
        # Verificar limite de sessões por usuário
        user_sessions = self.storage.get_user_sessions(email)
        if len(user_sessions) >= self.max_sessions_per_user:
            # Remover sessão mais antiga
            oldest_session = min(
                user_sessions,
                key=lambda s: s.get("created_at", "")
            )
            logger.info(
                f"Limite de sessões atingido para {email}, "
                f"revogando sessão mais antiga: {oldest_session.get('session_id')}"
            )
            self.revoke_session(oldest_session.get("session_id"))
        
        # Gerar session_id único
        session_id = CryptoManager.generate_session_id()
        
        # Obter user_id
        user_id = user_data.get("user_id")
        if not user_id:
            # Tentar extrair do id_token ou usar email como fallback
            user_id = f"{provider}_{email}"
        
        # Salvar token criptografado
        try:
            session_data = self.storage.save_token(
                session_id=session_id,
                user_email=email,
                user_id=user_id,
                provider=provider,
                refresh_token=refresh_token,
                ip_address=ip_address,
                user_agent=user_agent,
                expires_in_hours=self.session_timeout_hours
            )
        except Exception as e:
            logger.error(f"Erro ao salvar token: {e}")
            raise RuntimeError(f"Falha ao criar sessão: {e}")
        
        # Calcular expiração do access token
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        access_token_expires_at = now + timedelta(seconds=expires_in)
        
        # Retornar dados da sessão (sem dados sensíveis)
        result = {
            "success": True,
            "session_id": session_id,
            "access_token": access_token,
            "id_token": id_token,
            "expires_in": expires_in,
            "expires_at": access_token_expires_at.isoformat() + "Z",
            "user_email": email,
            "provider": provider
        }
        
        logger.info(f"Sessão criada: {session_id} para {email} ({provider})")
        
        # Auditoria
        self.audit_logger.log_session_created(
            session_id=session_id,
            user_email=email,
            provider=provider,
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        return result
    
    def refresh_session(
        self,
        session_id: str,
        ip_address: str = None
    ) -> Dict[str, Any]:
        """
        Renova access token usando refresh token da sessão.
        
        Args:
            session_id: ID da sessão
            ip_address: IP do cliente (opcional, para validação)
            
        Returns:
            Dicionário com novos tokens (access_token, id_token, expires_in, expires_at)
            
        Raises:
            ValueError: Se session_id inválido ou sessão não encontrada
            RuntimeError: Se falhar ao renovar tokens
        """
        # Validar session_id
        if not session_id or not CryptoManager.validate_session_id(session_id):
            raise ValueError(f"session_id inválido: {session_id}")
        
        # Recuperar sessão
        session_data = self.storage.get_token(session_id, update_last_used=True)
        if not session_data:
            raise ValueError(f"Sessão não encontrada ou expirada: {session_id}")
        
        # Validar IP se fornecido (opcional, para segurança adicional)
        if ip_address and session_data.get("ip_address"):
            if ip_address != session_data.get("ip_address"):
                logger.warning(
                    f"Tentativa de refresh com IP diferente: "
                    f"esperado {session_data.get('ip_address')}, "
                    f"recebido {ip_address}"
                )
                # Não bloquear, apenas logar (pode ser proxy/CDN)
        
        # Obter refresh token descriptografado
        refresh_token = session_data.get("refresh_token")
        if not refresh_token:
            raise RuntimeError("Refresh token não encontrado na sessão")
        
        provider = session_data.get("provider", "").lower()
        if provider not in ["google", "microsoft"]:
            raise ValueError(f"Provider inválido: {provider}")
        
        # Renovar tokens via OAuth provider
        try:
            new_tokens = self._refresh_oauth_tokens(refresh_token, provider)
        except Exception as e:
            logger.error(f"Erro ao renovar tokens OAuth: {e}")
            raise RuntimeError(f"Falha ao renovar tokens: {e}")
        
        # Atualizar sessão com novos tokens
        access_token = new_tokens.get("access_token")
        id_token = new_tokens.get("id_token")
        expires_in = new_tokens.get("expires_in", 3600)
        
        # Atualizar refresh token se fornecido (OAuth 2.1 rotation)
        new_refresh_token = new_tokens.get("refresh_token")
        if new_refresh_token:
            # Criptografar e atualizar
            encrypted_data = self.crypto.encrypt_token(new_refresh_token)
            session_data["refresh_token_encrypted"] = encrypted_data["encrypted"]
            session_data["encryption_iv"] = encrypted_data["iv"]
        
        # Atualizar storage
        self.storage.update_session(
            session_id=session_id,
            access_token=access_token,
            id_token=id_token,
            expires_in=expires_in
        )
        
        # Calcular nova expiração
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        expires_at = now + timedelta(seconds=expires_in)
        
        result = {
            "success": True,
            "access_token": access_token,
            "id_token": id_token,
            "expires_in": expires_in,
            "expires_at": expires_at.isoformat() + "Z"
        }
        
        logger.info(f"Tokens renovados para sessão: {session_id}")
        
        # Auditoria
        self.audit_logger.log_token_refreshed(
            session_id=session_id,
            user_email=session_data.get("email"),
            ip_address=ip_address,
            success=True
        )
        
        return result
    
    def _refresh_oauth_tokens(
        self,
        refresh_token: str,
        provider: str
    ) -> Dict[str, Any]:
        """
        Renova tokens via OAuth provider.
        
        Args:
            refresh_token: Refresh token para renovar
            provider: Nome do provider (google, microsoft)
            
        Returns:
            Dicionário com novos tokens
            
        Raises:
            RuntimeError: Se falhar ao renovar
        """
        if provider == "google":
            return self._refresh_google_token(refresh_token)
        elif provider == "microsoft":
            return self._refresh_microsoft_token(refresh_token)
        else:
            raise ValueError(f"Provider não suportado: {provider}")
    
    def _refresh_google_token(self, refresh_token: str) -> Dict[str, Any]:
        """Renova tokens via Google OAuth."""
        token_url = GOOGLE_TOKEN_ENDPOINT
        payload = {
            "client_id": os.getenv("GOOGLE_CLIENT_ID"),
            "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
            "refresh_token": refresh_token,
            "grant_type": "refresh_token"
        }
        
        try:
            response = requests.post(token_url, data=payload, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            # Google pode retornar apenas access_token (sem refresh_token)
            # Se não retornar refresh_token, o antigo continua válido
            return {
                "access_token": data.get("access_token"),
                "id_token": data.get("id_token"),
                "refresh_token": data.get("refresh_token"),  # Pode ser None
                "expires_in": data.get("expires_in", 3600)
            }
        except requests.exceptions.RequestException as e:
            logger.error(f"Erro ao renovar token Google: {e}")
            raise RuntimeError(f"Falha ao renovar token Google: {e}")
    
    def _refresh_microsoft_token(self, refresh_token: str) -> Dict[str, Any]:
        """Renova tokens via Microsoft OAuth."""
        tenant = os.getenv("AZURE_TENANT_ID", "consumers")
        token_url = AZURE_TOKEN_ENDPOINT_TEMPLATE.format(tenant=tenant)
        
        payload = {
            "client_id": os.getenv("AZURE_CLIENT_ID") or os.getenv("MICROSOFT_CLIENT_ID"),
            "client_secret": os.getenv("AZURE_CLIENT_SECRET") or os.getenv("MICROSOFT_CLIENT_SECRET"),
            "refresh_token": refresh_token,
            "grant_type": "refresh_token",
            "scope": DEFAULT_AZURE_SCOPE
        }
        
        try:
            response = requests.post(token_url, data=payload, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            return {
                "access_token": data.get("access_token"),
                "id_token": data.get("id_token"),
                "refresh_token": data.get("refresh_token"),  # Pode ser None
                "expires_in": data.get("expires_in", 3600)
            }
        except requests.exceptions.RequestException as e:
            logger.error(f"Erro ao renovar token Microsoft: {e}")
            raise RuntimeError(f"Falha ao renovar token Microsoft: {e}")
    
    def revoke_session(self, session_id: str) -> bool:
        """
        Revoga uma sessão.
        
        Args:
            session_id: ID da sessão
            
        Returns:
            True se revogada com sucesso, False caso contrário
        """
        if not session_id:
            return False
        
        success = self.storage.revoke_session(session_id)
        
        if success:
            logger.info(f"Sessão revogada: {session_id}")
            
            # Obter informações da sessão para auditoria
            session_info = self.get_session_info(session_id)
            
            # Auditoria
            self.audit_logger.log_session_revoked(
                session_id=session_id,
                user_email=session_info.get("user_email") if session_info else None,
                reason="user_logout",
                ip_address=None
            )
        else:
            logger.warning(f"Falha ao revogar sessão: {session_id}")
        
        return success
    
    def validate_session(self, session_id: str) -> bool:
        """
        Valida se uma sessão está ativa e não expirada.
        
        Args:
            session_id: ID da sessão
            
        Returns:
            True se válida, False caso contrário
        """
        if not session_id or not CryptoManager.validate_session_id(session_id):
            return False
        
        session_data = self.storage.get_token(session_id, update_last_used=False)
        return session_data is not None
    
    def get_session_info(self, session_id: str) -> Optional[Dict[str, Any]]:
        """
        Obtém informações de uma sessão (sem dados sensíveis).
        
        Args:
            session_id: ID da sessão
            
        Returns:
            Dicionário com informações da sessão ou None se não encontrada
        """
        if not session_id:
            return None
        
        session_data = self.storage.get_token(session_id, update_last_used=False)
        if not session_data:
            return None
        
        # Retornar apenas informações seguras
        return {
            "session_id": session_id,
            "user_email": session_data.get("email"),
            "provider": session_data.get("provider"),
            "created_at": session_data.get("created_at"),
            "last_used": session_data.get("last_used"),
            "last_refresh": session_data.get("last_refresh"),
            "expires_at": session_data.get("expires_at"),
            "status": session_data.get("status")
        }
    
    def get_user_sessions(self, user_email: str) -> list[Dict[str, Any]]:
        """
        Lista todas as sessões ativas de um usuário.
        
        Args:
            user_email: Email do usuário
            
        Returns:
            Lista de sessões (sem dados sensíveis)
        """
        return self.storage.get_user_sessions(user_email)
    
    def revoke_user_sessions(self, user_email: str) -> int:
        """
        Revoga todas as sessões de um usuário.
        
        Args:
            user_email: Email do usuário
            
        Returns:
            Número de sessões revogadas
        """
        sessions = self.get_user_sessions(user_email)
        revoked_count = 0
        
        for session in sessions:
            if self.revoke_session(session.get("session_id")):
                revoked_count += 1
        
        logger.info(f"Revogadas {revoked_count} sessões para {user_email}")
        return revoked_count


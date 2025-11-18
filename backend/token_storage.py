"""
Token Storage Manager - Armazenamento seguro de refresh tokens
Implementa armazenamento criptografado com backup automático e file locking

Fase 7 - Sistema de Refresh Tokens
Responsável por persistir e recuperar refresh tokens criptografados
"""

import json
import os
import logging
import shutil
from pathlib import Path
from datetime import datetime, timedelta, timezone
from typing import Dict, Optional, Any
from dateutil import parser as date_parser

# File locking - compatível com Windows e Linux
try:
    import fcntl
    HAS_FCNTL = True
except ImportError:
    # Windows não tem fcntl, usar alternativa ou desabilitar
    HAS_FCNTL = False
    try:
        import msvcrt
        HAS_MSVCRT = True
    except ImportError:
        HAS_MSVCRT = False

from crypto_manager import CryptoManager

# Configurar logging
logger = logging.getLogger(__name__)


class TokenStorage:
    """
    Gerencia armazenamento seguro de refresh tokens criptografados.
    
    Funcionalidades:
    - Armazenamento em JSON com criptografia AES-256
    - Backup automático antes de modificações
    - File locking para concorrência
    - Limpeza de tokens expirados
    - Validação de integridade
    """
    
    def __init__(self, storage_path: str = None, backup_dir: str = None):
        """
        Inicializa TokenStorage.
        
        Args:
            storage_path: Caminho para arquivo JSON de sessões (default: detectado automaticamente)
            backup_dir: Diretório para backups (default: mesmo diretório do storage_path/backups)
        """
        # Detectar caminho de persistência (mesmo sistema do authorization.py)
        if storage_path is None:
            # Priorizar variável de ambiente
            env_path = os.getenv("SESSION_DATA_FILE") or os.getenv("SESSION_FILE")
            if env_path:
                storage_path = Path(env_path)
            else:
                # Detectar Azure Files mount (mesma lógica do authorization.py)
                azure_mount_path = os.getenv('AZURE_STORAGE_MOUNT_PATH', '')
                azure_data_dirs = [
                    azure_mount_path,
                    '/home/site/wwwroot/data',
                    '/home/data',
                ]
                
                data_dir = None
                for azure_dir in azure_data_dirs:
                    if azure_dir and os.path.exists(azure_dir) and os.path.isdir(azure_dir):
                        data_dir = azure_dir
                        logger.info(f"TokenStorage: Detectado ambiente Azure - usando {data_dir}")
                        break
                
                if not data_dir:
                    # Fallback: diretório local
                    app_root = Path(__file__).resolve().parent
                    data_dir = app_root / "data"
                    logger.info(f"TokenStorage: Ambiente local - usando {data_dir}")
                
                storage_path = Path(data_dir) / "user_sessions.json"
        else:
            storage_path = Path(storage_path)
            
        self.storage_path = storage_path
        self.storage_path.parent.mkdir(parents=True, exist_ok=True)
        
        if backup_dir is None:
            backup_dir = self.storage_path.parent / "backups"
        else:
            backup_dir = Path(backup_dir)
            
        self.backup_dir = backup_dir
        self.backup_dir.mkdir(parents=True, exist_ok=True)
        
        # Inicializar CryptoManager
        try:
            self.crypto = CryptoManager()
        except ValueError as e:
            logger.error(f"Erro ao inicializar CryptoManager: {e}")
            raise
        
        # Inicializar estrutura se arquivo não existir
        if not self.storage_path.exists():
            self._initialize_storage()
        
        logger.info(f"TokenStorage inicializado: {self.storage_path}")
    
    def _initialize_storage(self):
        """Inicializa arquivo de storage com estrutura vazia."""
        initial_data = {
            "version": "1.0",
            "encryption_algorithm": "AES-256-CBC",
            "sessions": {},
            "metadata": {
                "total_sessions": 0,
                "active_sessions": 0,
                "last_cleanup": None
            }
        }
        self._save_sessions(initial_data)
        logger.info("Arquivo de storage inicializado")
    
    def _load_sessions(self) -> Dict[str, Any]:
        """
        Carrega sessões do arquivo JSON com file locking.
        
        Returns:
            Dicionário com dados de sessões
            
        Raises:
            RuntimeError: Se falhar ao ler arquivo
        """
        try:
            with open(self.storage_path, 'r', encoding='utf-8') as f:
                # File locking para leitura (shared lock)
                if HAS_FCNTL:
                    try:
                        fcntl.flock(f.fileno(), fcntl.LOCK_SH)
                        data = json.load(f)
                    finally:
                        fcntl.flock(f.fileno(), fcntl.LOCK_UN)
                elif HAS_MSVCRT:
                    try:
                        msvcrt.locking(f.fileno(), msvcrt.LK_LOCK, 1)
                        data = json.load(f)
                    finally:
                        msvcrt.locking(f.fileno(), msvcrt.LK_UNLCK, 1)
                else:
                    # Sem locking disponível (Windows sem msvcrt)
                    data = json.load(f)
            
            # Validar estrutura
            if not isinstance(data, dict):
                raise ValueError("Dados inválidos: não é um objeto JSON")
            if "sessions" not in data:
                raise ValueError("Dados inválidos: campo 'sessions' ausente")
            
            return data
            
        except FileNotFoundError:
            logger.warning("Arquivo de storage não encontrado, inicializando...")
            self._initialize_storage()
            return self._load_sessions()
        except json.JSONDecodeError as e:
            logger.error(f"Erro ao decodificar JSON: {e}")
            # Tentar restaurar backup
            self._restore_from_backup()
            return self._load_sessions()
        except Exception as e:
            logger.error(f"Erro ao carregar sessões: {e}")
            raise RuntimeError(f"Falha ao carregar sessões: {e}")
    
    def _save_sessions(self, data: Dict[str, Any]):
        """
        Salva sessões no arquivo JSON com file locking.
        
        Args:
            data: Dicionário com dados de sessões
        """
        try:
            # Atualizar metadata
            if "metadata" in data:
                data["metadata"]["total_sessions"] = len(data.get("sessions", {}))
                active = sum(
                    1 for s in data.get("sessions", {}).values()
                    if s.get("status") == "active"
                )
                data["metadata"]["active_sessions"] = active
            
            # Salvar com file locking exclusivo
            with open(self.storage_path, 'w', encoding='utf-8') as f:
                try:
                    if HAS_FCNTL:
                        fcntl.flock(f.fileno(), fcntl.LOCK_EX)
                    elif HAS_MSVCRT:
                        msvcrt.locking(f.fileno(), msvcrt.LK_LOCK, 1)
                    
                    json.dump(data, f, indent=2, ensure_ascii=False)
                    f.flush()
                    os.fsync(f.fileno())  # Garantir escrita em disco
                finally:
                    if HAS_FCNTL:
                        fcntl.flock(f.fileno(), fcntl.LOCK_UN)
                    elif HAS_MSVCRT:
                        msvcrt.locking(f.fileno(), msvcrt.LK_UNLCK, 1)
            
            logger.debug(f"Sessões salvas: {len(data.get('sessions', {}))} total")
            
        except Exception as e:
            logger.error(f"Erro ao salvar sessões: {e}")
            raise RuntimeError(f"Falha ao salvar sessões: {e}")
    
    def _create_backup(self) -> str:
        """
        Cria backup do arquivo de storage antes de modificação.
        
        Returns:
            Caminho do arquivo de backup criado
        """
        if not self.storage_path.exists():
            return None
        
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        backup_filename = f"user_sessions_backup_{timestamp}.json"
        backup_path = self.backup_dir / backup_filename
        
        try:
            shutil.copy2(self.storage_path, backup_path)
            logger.debug(f"Backup criado: {backup_path}")
            
            # Limpar backups antigos (manter últimos 10)
            self._cleanup_old_backups(keep_count=10)
            
            return str(backup_path)
        except Exception as e:
            logger.warning(f"Erro ao criar backup: {e}")
            return None
    
    def _cleanup_old_backups(self, keep_count: int = 10):
        """Remove backups antigos, mantendo apenas os N mais recentes."""
        try:
            backups = sorted(
                self.backup_dir.glob("user_sessions_backup_*.json"),
                key=lambda p: p.stat().st_mtime,
                reverse=True
            )
            
            if len(backups) > keep_count:
                for old_backup in backups[keep_count:]:
                    old_backup.unlink()
                    logger.debug(f"Backup antigo removido: {old_backup}")
        except Exception as e:
            logger.warning(f"Erro ao limpar backups antigos: {e}")
    
    def _restore_from_backup(self):
        """Tenta restaurar do backup mais recente."""
        try:
            backups = sorted(
                self.backup_dir.glob("user_sessions_backup_*.json"),
                key=lambda p: p.stat().st_mtime,
                reverse=True
            )
            
            if backups:
                latest_backup = backups[0]
                shutil.copy2(latest_backup, self.storage_path)
                logger.info(f"Storage restaurado do backup: {latest_backup}")
            else:
                logger.warning("Nenhum backup disponível para restaurar")
        except Exception as e:
            logger.error(f"Erro ao restaurar do backup: {e}")
    
    def save_token(
        self,
        session_id: str,
        user_email: str,
        user_id: str,
        provider: str,
        refresh_token: str,
        ip_address: str = None,
        user_agent: str = None,
        expires_in_hours: int = 24
    ) -> Dict[str, Any]:
        """
        Salva refresh token criptografado para uma sessão.
        
        Args:
            session_id: ID único da sessão
            user_email: Email do usuário
            user_id: ID do usuário no provider
            provider: Nome do provider (google, microsoft)
            refresh_token: Refresh token em texto plano
            ip_address: IP do cliente (opcional)
            user_agent: User agent do cliente (opcional)
            expires_in_hours: Horas até expiração (default: 24)
            
        Returns:
            Dicionário com dados da sessão criada
            
        Raises:
            ValueError: Se dados inválidos
            RuntimeError: Se falhar ao salvar
        """
        if not session_id or not CryptoManager.validate_session_id(session_id):
            raise ValueError(f"session_id inválido: {session_id}")
        
        if not refresh_token:
            raise ValueError("refresh_token não pode ser vazio")
        
        # Criar backup antes de modificar
        self._create_backup()
        
        # Carregar sessões
        data = self._load_sessions()
        
        # Criptografar refresh token
        encrypted_data = self.crypto.encrypt_token(refresh_token)
        
        # Calcular datas
        now = datetime.utcnow()
        expires_at = now + timedelta(hours=expires_in_hours)
        
        # Criar entrada de sessão
        session_data = {
            "user_id": user_id,
            "email": user_email,
            "provider": provider.lower(),
            "refresh_token_encrypted": encrypted_data["encrypted"],
            "encryption_iv": encrypted_data["iv"],
            "created_at": now.isoformat() + "Z",
            "expires_at": expires_at.isoformat() + "Z",
            "last_used": now.isoformat() + "Z",
            "last_refresh": None,
            "ip_address": ip_address,
            "user_agent": user_agent,
            "status": "active"
        }
        
        # Salvar sessão
        data["sessions"][session_id] = session_data
        self._save_sessions(data)
        
        logger.info(f"Sessão salva: {session_id} para {user_email} ({provider})")
        
        return session_data
    
    def get_token(self, session_id: str, update_last_used: bool = True) -> Optional[Dict[str, Any]]:
        """
        Recupera refresh token descriptografado de uma sessão.
        
        Args:
            session_id: ID da sessão
            update_last_used: Se True, atualiza timestamp de último uso
            
        Returns:
            Dicionário com dados da sessão (incluindo refresh_token descriptografado)
            ou None se sessão não encontrada/expirada
            
        Raises:
            RuntimeError: Se falhar ao descriptografar
        """
        if not session_id or not CryptoManager.validate_session_id(session_id):
            logger.warning(f"Tentativa de acesso com session_id inválido: {session_id}")
            return None
        
        # Carregar sessões
        data = self._load_sessions()
        
        if session_id not in data["sessions"]:
            logger.warning(f"Sessão não encontrada: {session_id}")
            return None
        
        session_data = data["sessions"][session_id].copy()
        
        # Verificar status
        if session_data.get("status") != "active":
            logger.warning(f"Sessão não está ativa: {session_id} (status: {session_data.get('status')})")
            return None
        
        # Verificar expiração
        try:
            expires_at = date_parser.parse(session_data["expires_at"])
            # Garantir que ambos os datetimes tenham timezone (offset-aware)
            now = datetime.utcnow().replace(tzinfo=timezone.utc)
            # Se expires_at não tiver timezone, assumir UTC
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            
            if now > expires_at:
                logger.warning(f"Sessão expirada: {session_id}")
                # Marcar como expirada
                session_data["status"] = "expired"
                data["sessions"][session_id] = session_data
                self._save_sessions(data)
                return None
        except Exception as e:
            logger.error(f"Erro ao verificar expiração: {e}", exc_info=True)
            return None
        
        # Descriptografar refresh token
        try:
            refresh_token = self.crypto.decrypt_token(
                session_data["refresh_token_encrypted"],
                session_data["encryption_iv"]
            )
            session_data["refresh_token"] = refresh_token
        except Exception as e:
            logger.error(f"Erro ao descriptografar token: {e}")
            raise RuntimeError(f"Falha ao descriptografar token: {e}")
        
        # Atualizar last_used se solicitado
        if update_last_used:
            session_data["last_used"] = datetime.utcnow().isoformat() + "Z"
            data["sessions"][session_id]["last_used"] = session_data["last_used"]
            self._save_sessions(data)
        
        # Remover dados sensíveis antes de retornar
        session_data.pop("refresh_token_encrypted", None)
        session_data.pop("encryption_iv", None)
        
        return session_data
    
    def update_session(
        self,
        session_id: str,
        access_token: str = None,
        id_token: str = None,
        expires_in: int = None
    ) -> bool:
        """
        Atualiza dados de uma sessão (após refresh).
        
        Args:
            session_id: ID da sessão
            access_token: Novo access token (opcional)
            id_token: Novo id token (opcional)
            expires_in: Tempo até expiração em segundos (opcional)
            
        Returns:
            True se atualizado com sucesso, False caso contrário
        """
        if not session_id:
            return False
        
        # Criar backup
        self._create_backup()
        
        # Carregar sessões
        data = self._load_sessions()
        
        if session_id not in data["sessions"]:
            return False
        
        session_data = data["sessions"][session_id]
        
        # Atualizar campos
        now = datetime.utcnow()
        session_data["last_refresh"] = now.isoformat() + "Z"
        session_data["last_used"] = now.isoformat() + "Z"
        
        if access_token:
            session_data["access_token"] = access_token
        if id_token:
            session_data["id_token"] = id_token
        if expires_in:
            expires_at = now + timedelta(seconds=expires_in)
            session_data["expires_at"] = expires_at.isoformat() + "Z"
        
        # Salvar
        self._save_sessions(data)
        
        logger.debug(f"Sessão atualizada: {session_id}")
        return True
    
    def revoke_session(self, session_id: str) -> bool:
        """
        Revoga uma sessão (marca como revoked).
        
        Args:
            session_id: ID da sessão
            
        Returns:
            True se revogada com sucesso, False caso contrário
        """
        if not session_id:
            return False
        
        # Criar backup
        self._create_backup()
        
        # Carregar sessões
        data = self._load_sessions()
        
        if session_id not in data["sessions"]:
            return False
        
        # Marcar como revoked
        data["sessions"][session_id]["status"] = "revoked"
        data["sessions"][session_id]["revoked_at"] = datetime.utcnow().isoformat() + "Z"
        
        # Salvar
        self._save_sessions(data)
        
        logger.info(f"Sessão revogada: {session_id}")
        return True
    
    def cleanup_expired(self) -> int:
        """
        Remove sessões expiradas ou revogadas.
        
        Returns:
            Número de sessões removidas
        """
        # Criar backup antes de limpar
        self._create_backup()
        
        # Carregar sessões
        data = self._load_sessions()
        
        now = datetime.utcnow().replace(tzinfo=timezone.utc)
        removed_count = 0
        sessions_to_remove = []
        
        for session_id, session_data in data["sessions"].items():
            # Verificar se está expirada
            try:
                expires_at = date_parser.parse(session_data["expires_at"])
                # Garantir que ambos os datetimes tenham timezone (offset-aware)
                if expires_at.tzinfo is None:
                    expires_at = expires_at.replace(tzinfo=timezone.utc)
                
                if now > expires_at:
                    sessions_to_remove.append(session_id)
                    continue
            except Exception as e:
                # Se não conseguir parsear, considerar expirada
                logger.warning(f"Erro ao parsear expires_at para {session_id}: {e}")
                sessions_to_remove.append(session_id)
                continue
            
            # Verificar se está revogada há mais de 1 hora
            if session_data.get("status") == "revoked":
                try:
                    revoked_at = date_parser.parse(session_data.get("revoked_at", ""))
                    # Garantir que ambos os datetimes tenham timezone (offset-aware)
                    if revoked_at.tzinfo is None:
                        revoked_at = revoked_at.replace(tzinfo=timezone.utc)
                    
                    if now > revoked_at + timedelta(hours=1):
                        sessions_to_remove.append(session_id)
                except Exception as e:
                    # Se não conseguir parsear, remover
                    logger.warning(f"Erro ao parsear revoked_at para {session_id}: {e}")
                    sessions_to_remove.append(session_id)
        
        # Remover sessões
        for session_id in sessions_to_remove:
            del data["sessions"][session_id]
            removed_count += 1
        
        # Atualizar metadata
        if removed_count > 0:
            data["metadata"]["last_cleanup"] = now.isoformat() + "Z"
            self._save_sessions(data)
            logger.info(f"Limpeza concluída: {removed_count} sessões removidas")
        
        return removed_count
    
    def get_user_sessions(self, user_email: str) -> list[Dict[str, Any]]:
        """
        Lista todas as sessões ativas de um usuário.
        
        Args:
            user_email: Email do usuário
            
        Returns:
            Lista de sessões (sem dados sensíveis)
        """
        data = self._load_sessions()
        
        user_sessions = []
        for session_id, session_data in data["sessions"].items():
            if session_data.get("email") == user_email and session_data.get("status") == "active":
                # Criar cópia sem dados sensíveis
                safe_session = {
                    "session_id": session_id,
                    "provider": session_data.get("provider"),
                    "created_at": session_data.get("created_at"),
                    "last_used": session_data.get("last_used"),
                    "expires_at": session_data.get("expires_at"),
                    "ip_address": session_data.get("ip_address")
                }
                user_sessions.append(safe_session)
        
        return user_sessions


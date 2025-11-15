"""
Testes unitários para TokenStorage - Fase 7
"""

import pytest
import tempfile
import shutil
import os
import base64
import secrets
from pathlib import Path
from datetime import datetime, timedelta

# Adicionar backend ao path
import sys
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from token_storage import TokenStorage
from crypto_manager import CryptoManager


@pytest.fixture
def temp_storage_dir():
    """Diretório temporário para testes de storage"""
    temp_dir = tempfile.mkdtemp(prefix="token_storage_test_")
    yield temp_dir
    shutil.rmtree(temp_dir, ignore_errors=True)


@pytest.fixture
def encryption_key():
    """Chave de criptografia para testes"""
    key_bytes = secrets.token_bytes(32)
    return base64.b64encode(key_bytes).decode('utf-8')


@pytest.fixture
def token_storage(temp_storage_dir, encryption_key):
    """Instância de TokenStorage para testes"""
    # Definir variável de ambiente para a chave
    os.environ['TOKEN_ENCRYPTION_KEY'] = encryption_key
    
    storage_path = Path(temp_storage_dir) / "test_sessions.json"
    backup_dir = Path(temp_storage_dir) / "backups"
    
    storage = TokenStorage(
        storage_path=str(storage_path),
        backup_dir=str(backup_dir)
    )
    
    yield storage
    
    # Cleanup
    if 'TOKEN_ENCRYPTION_KEY' in os.environ:
        del os.environ['TOKEN_ENCRYPTION_KEY']


@pytest.fixture
def sample_session_data():
    """Dados de sessão de exemplo"""
    return {
        "session_id": CryptoManager.generate_session_id(),
        "user_email": "test@example.com",
        "user_id": "google_123456",
        "provider": "google",
        "refresh_token": "1//test_refresh_token_very_long_string_123456789",
        "ip_address": "192.168.1.100",
        "user_agent": "Mozilla/5.0 Test"
    }


class TestTokenStorage:
    """Testes para TokenStorage"""
    
    def test_initialization(self, token_storage):
        """Testa inicialização do TokenStorage"""
        assert token_storage.storage_path.exists()
        assert token_storage.backup_dir.exists()
    
    def test_save_token(self, token_storage, sample_session_data):
        """Testa salvamento de token"""
        session_data = token_storage.save_token(
            session_id=sample_session_data["session_id"],
            user_email=sample_session_data["user_email"],
            user_id=sample_session_data["user_id"],
            provider=sample_session_data["provider"],
            refresh_token=sample_session_data["refresh_token"],
            ip_address=sample_session_data["ip_address"],
            user_agent=sample_session_data["user_agent"]
        )
        
        assert session_data is not None
        assert "refresh_token_encrypted" in session_data
        assert "encryption_iv" in session_data
        assert session_data["status"] == "active"
        assert session_data["email"] == sample_session_data["user_email"]
    
    def test_get_token(self, token_storage, sample_session_data):
        """Testa recuperação de token"""
        # Salvar primeiro
        token_storage.save_token(
            session_id=sample_session_data["session_id"],
            user_email=sample_session_data["user_email"],
            user_id=sample_session_data["user_id"],
            provider=sample_session_data["provider"],
            refresh_token=sample_session_data["refresh_token"]
        )
        
        # Recuperar
        retrieved = token_storage.get_token(sample_session_data["session_id"])
        
        assert retrieved is not None
        assert retrieved["refresh_token"] == sample_session_data["refresh_token"]
        assert retrieved["email"] == sample_session_data["user_email"]
        assert retrieved["provider"] == sample_session_data["provider"]
    
    def test_get_token_invalid_session_id(self, token_storage):
        """Testa recuperação com session_id inválido"""
        result = token_storage.get_token("invalid_session_id")
        assert result is None
    
    def test_get_token_nonexistent(self, token_storage):
        """Testa recuperação de sessão inexistente"""
        fake_session_id = CryptoManager.generate_session_id()
        result = token_storage.get_token(fake_session_id)
        assert result is None
    
    def test_update_session(self, token_storage, sample_session_data):
        """Testa atualização de sessão"""
        # Salvar primeiro
        token_storage.save_token(
            session_id=sample_session_data["session_id"],
            user_email=sample_session_data["user_email"],
            user_id=sample_session_data["user_id"],
            provider=sample_session_data["provider"],
            refresh_token=sample_session_data["refresh_token"]
        )
        
        # Atualizar
        success = token_storage.update_session(
            session_id=sample_session_data["session_id"],
            access_token="new_access_token",
            expires_in=7200
        )
        
        assert success is True
        
        # Verificar atualização
        session = token_storage.get_token(sample_session_data["session_id"])
        assert session is not None
        assert "last_refresh" in session
    
    def test_revoke_session(self, token_storage, sample_session_data):
        """Testa revogação de sessão"""
        # Salvar primeiro
        token_storage.save_token(
            session_id=sample_session_data["session_id"],
            user_email=sample_session_data["user_email"],
            user_id=sample_session_data["user_id"],
            provider=sample_session_data["provider"],
            refresh_token=sample_session_data["refresh_token"]
        )
        
        # Revogar
        success = token_storage.revoke_session(sample_session_data["session_id"])
        assert success is True
        
        # Verificar que não pode mais recuperar
        result = token_storage.get_token(sample_session_data["session_id"])
        assert result is None  # Sessão revogada não é retornada
    
    def test_cleanup_expired(self, token_storage, sample_session_data):
        """Testa limpeza de sessões expiradas"""
        # Criar sessão que expira em 1 hora
        session_id = CryptoManager.generate_session_id()
        token_storage.save_token(
            session_id=session_id,
            user_email=sample_session_data["user_email"],
            user_id=sample_session_data["user_id"],
            provider=sample_session_data["provider"],
            refresh_token=sample_session_data["refresh_token"],
            expires_in_hours=1  # Expira em 1 hora
        )
        
        # Criar outra sessão que não expira
        session_id2 = CryptoManager.generate_session_id()
        token_storage.save_token(
            session_id=session_id2,
            user_email="other@example.com",
            user_id="google_789",
            provider="google",
            refresh_token="another_token",
            expires_in_hours=24
        )
        
        # Não há sessões expiradas ainda, então cleanup não deve remover nada
        removed = token_storage.cleanup_expired()
        assert removed == 0
        
        # Verificar que ambas as sessões ainda existem
        assert token_storage.get_token(session_id) is not None
        assert token_storage.get_token(session_id2) is not None
    
    def test_get_user_sessions(self, token_storage, sample_session_data):
        """Testa listagem de sessões de um usuário"""
        # Criar múltiplas sessões para o mesmo usuário
        session_ids = []
        for i in range(3):
            session_id = CryptoManager.generate_session_id()
            token_storage.save_token(
                session_id=session_id,
                user_email=sample_session_data["user_email"],
                user_id=sample_session_data["user_id"],
                provider=sample_session_data["provider"],
                refresh_token=f"token_{i}"
            )
            session_ids.append(session_id)
        
        # Criar sessão para outro usuário
        other_session_id = CryptoManager.generate_session_id()
        token_storage.save_token(
            session_id=other_session_id,
            user_email="other@example.com",
            user_id="google_999",
            provider="google",
            refresh_token="other_token"
        )
        
        # Listar sessões do usuário
        user_sessions = token_storage.get_user_sessions(sample_session_data["user_email"])
        
        assert len(user_sessions) == 3
        for session in user_sessions:
            assert session["session_id"] in session_ids
            assert "refresh_token" not in session  # Não deve conter dados sensíveis
    
    def test_backup_creation(self, token_storage, sample_session_data):
        """Testa criação de backup"""
        # Salvar token (deve criar backup)
        token_storage.save_token(
            session_id=sample_session_data["session_id"],
            user_email=sample_session_data["user_email"],
            user_id=sample_session_data["user_id"],
            provider=sample_session_data["provider"],
            refresh_token=sample_session_data["refresh_token"]
        )
        
        # Verificar que backup foi criado
        backups = list(token_storage.backup_dir.glob("user_sessions_backup_*.json"))
        assert len(backups) > 0
    
    def test_concurrent_access(self, token_storage, sample_session_data):
        """Testa acesso concorrente (múltiplas operações)"""
        # Criar múltiplas sessões simultaneamente
        session_ids = []
        for i in range(5):
            session_id = CryptoManager.generate_session_id()
            token_storage.save_token(
                session_id=session_id,
                user_email=f"user{i}@example.com",
                user_id=f"google_{i}",
                provider="google",
                refresh_token=f"token_{i}"
            )
            session_ids.append(session_id)
        
        # Verificar que todas foram salvas
        for session_id in session_ids:
            result = token_storage.get_token(session_id)
            assert result is not None


if __name__ == "__main__":
    pytest.main([__file__, "-v"])


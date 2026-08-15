"""
Testes unitários para SessionManager - Fase 7
"""

import pytest
import tempfile
import shutil
import os
import base64
import secrets
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock

# Adicionar backend ao path
import sys
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from session_manager import SessionManager
from crypto_manager import CryptoManager


@pytest.fixture
def temp_storage_dir():
    """Diretório temporário para testes"""
    temp_dir = tempfile.mkdtemp(prefix="session_manager_test_")
    yield temp_dir
    shutil.rmtree(temp_dir, ignore_errors=True)


@pytest.fixture
def encryption_key():
    """Chave de criptografia para testes"""
    key_bytes = secrets.token_bytes(32)
    return base64.b64encode(key_bytes).decode('utf-8')


@pytest.fixture
def session_manager(temp_storage_dir, encryption_key):
    """Instância de SessionManager para testes"""
    # Definir variável de ambiente
    os.environ['TOKEN_ENCRYPTION_KEY'] = encryption_key
    os.environ['SESSION_TIMEOUT_HOURS'] = '24'
    os.environ['MAX_SESSIONS_PER_USER'] = '5'
    
    # Criar storage temporário
    storage_path = Path(temp_storage_dir) / "test_sessions.json"
    backup_dir = Path(temp_storage_dir) / "backups"
    
    # Mock do TokenStorage para evitar dependências
    with patch('session_manager.TokenStorage') as mock_storage_class:
        from token_storage import TokenStorage
        # Usar instância real mas com paths temporários
        real_storage = TokenStorage(
            storage_path=str(storage_path),
            backup_dir=str(backup_dir)
        )
        mock_storage_class.return_value = real_storage
        
        manager = SessionManager()
        yield manager
    
    # Cleanup
    if 'TOKEN_ENCRYPTION_KEY' in os.environ:
        del os.environ['TOKEN_ENCRYPTION_KEY']


@pytest.fixture
def sample_user_data():
    """Dados de usuário de exemplo"""
    return {
        "email": "test@example.com",
        "name": "Test User",
        "provider": "google",
        "user_id": "google_123456"
    }


@pytest.fixture
def sample_tokens():
    """Tokens de exemplo"""
    return {
        "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.test",
        "id_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.id_test",
        "refresh_token": "1//test_refresh_token_very_long_string_123456789",
        "expires_in": 3600
    }


class TestSessionManager:
    """Testes para SessionManager"""
    
    def test_initialization(self, session_manager):
        """Testa inicialização do SessionManager"""
        assert session_manager.storage is not None
        assert session_manager.crypto is not None
        assert session_manager.session_timeout_hours == 24
        assert session_manager.max_sessions_per_user == 5
    
    @patch('session_manager.SessionManager._refresh_oauth_tokens')
    def test_create_session(
        self,
        mock_refresh,
        session_manager,
        sample_user_data,
        sample_tokens
    ):
        """Testa criação de sessão"""
        result = session_manager.create_session(
            user_data=sample_user_data,
            tokens=sample_tokens,
            ip_address="192.168.1.100",
            user_agent="Mozilla/5.0 Test"
        )
        
        assert result["success"] is True
        assert "session_id" in result
        assert result["access_token"] == sample_tokens["access_token"]
        assert result["user_email"] == sample_user_data["email"]
        assert result["provider"] == sample_user_data["provider"]
        assert "expires_at" in result
    
    def test_create_session_invalid_data(self, session_manager):
        """Testa criação de sessão com dados inválidos"""
        with pytest.raises(ValueError):
            session_manager.create_session(
                user_data={},  # Sem email
                tokens={"refresh_token": "test"}
            )
        
        with pytest.raises(ValueError):
            session_manager.create_session(
                user_data={"email": "test@example.com", "provider": "invalid"},
                tokens={"refresh_token": "test"}
            )
        
        with pytest.raises(ValueError):
            session_manager.create_session(
                user_data={"email": "test@example.com", "provider": "google"},
                tokens={}  # Sem refresh_token
            )
    
    @patch('session_manager.SessionManager._refresh_google_token')
    def test_refresh_session(
        self,
        mock_refresh_google,
        session_manager,
        sample_user_data,
        sample_tokens
    ):
        """Testa renovação de sessão"""
        # Mock da resposta de refresh
        mock_refresh_google.return_value = {
            "access_token": "new_access_token",
            "id_token": "new_id_token",
            "expires_in": 3600
        }
        
        # Criar sessão primeiro
        session_result = session_manager.create_session(
            user_data=sample_user_data,
            tokens=sample_tokens
        )
        session_id = session_result["session_id"]
        
        # Renovar
        refresh_result = session_manager.refresh_session(session_id=session_id)
        
        assert refresh_result["success"] is True
        assert refresh_result["access_token"] == "new_access_token"
        assert "expires_at" in refresh_result
    
    def test_refresh_session_invalid_id(self, session_manager):
        """Testa renovação com session_id inválido"""
        with pytest.raises(ValueError):
            session_manager.refresh_session("invalid_session_id")
    
    def test_refresh_session_nonexistent(self, session_manager):
        """Testa renovação de sessão inexistente"""
        fake_session_id = CryptoManager.generate_session_id()
        with pytest.raises(ValueError):
            session_manager.refresh_session(fake_session_id)
    
    def test_revoke_session(
        self,
        session_manager,
        sample_user_data,
        sample_tokens
    ):
        """Testa revogação de sessão"""
        # Criar sessão
        session_result = session_manager.create_session(
            user_data=sample_user_data,
            tokens=sample_tokens
        )
        session_id = session_result["session_id"]
        
        # Revogar
        success = session_manager.revoke_session(session_id)
        assert success is True
    
    def test_revoke_session_invalid(self, session_manager):
        """Testa revogação com session_id inválido"""
        success = session_manager.revoke_session("invalid")
        assert success is False
    
    def test_validate_session(
        self,
        session_manager,
        sample_user_data,
        sample_tokens
    ):
        """Testa validação de sessão"""
        # Criar sessão
        session_result = session_manager.create_session(
            user_data=sample_user_data,
            tokens=sample_tokens
        )
        session_id = session_result["session_id"]
        
        # Validar
        assert session_manager.validate_session(session_id) is True
        assert session_manager.validate_session("invalid") is False
    
    def test_get_session_info(
        self,
        session_manager,
        sample_user_data,
        sample_tokens
    ):
        """Testa obtenção de informações da sessão"""
        # Criar sessão
        session_result = session_manager.create_session(
            user_data=sample_user_data,
            tokens=sample_tokens
        )
        session_id = session_result["session_id"]
        
        # Obter info
        info = session_manager.get_session_info(session_id)
        
        assert info is not None
        assert info["session_id"] == session_id
        assert info["user_email"] == sample_user_data["email"]
        assert "refresh_token" not in info  # Não deve conter dados sensíveis
    
    def test_get_user_sessions(
        self,
        session_manager,
        sample_user_data,
        sample_tokens
    ):
        """Testa listagem de sessões do usuário"""
        # Criar múltiplas sessões
        session_ids = []
        for i in range(3):
            session_result = session_manager.create_session(
                user_data=sample_user_data,
                tokens=sample_tokens
            )
            session_ids.append(session_result["session_id"])
        
        # Listar
        sessions = session_manager.get_user_sessions(sample_user_data["email"])
        
        assert len(sessions) == 3
        for session in sessions:
            assert session["session_id"] in session_ids
    
    def test_revoke_user_sessions(
        self,
        session_manager,
        sample_user_data,
        sample_tokens
    ):
        """Testa revogação de todas as sessões do usuário"""
        # Criar múltiplas sessões
        session_ids = []
        for i in range(3):
            session_result = session_manager.create_session(
                user_data=sample_user_data,
                tokens=sample_tokens
            )
            session_ids.append(session_result["session_id"])
        
        # Revogar todas
        revoked_count = session_manager.revoke_user_sessions(sample_user_data["email"])
        
        assert revoked_count == 3
        
        # Verificar que não são mais válidas
        for session_id in session_ids:
            assert session_manager.validate_session(session_id) is False
    
    @patch('session_manager.requests.post')
    def test_refresh_google_token(self, mock_post, session_manager):
        """Testa renovação de token Google"""
        # Mock da resposta
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "access_token": "new_token",
            "id_token": "new_id",
            "expires_in": 3600
        }
        mock_response.raise_for_status = MagicMock()
        mock_post.return_value = mock_response
        
        # Mock de variáveis de ambiente
        with patch.dict(os.environ, {
            'GOOGLE_CLIENT_ID': 'test_client_id',
            'GOOGLE_CLIENT_SECRET': 'test_secret'
        }):
            result = session_manager._refresh_google_token("refresh_token_test")
        
        assert result["access_token"] == "new_token"
        assert result["expires_in"] == 3600
        mock_post.assert_called_once()
    
    @patch('session_manager.requests.post')
    def test_refresh_microsoft_token(self, mock_post, session_manager):
        """Testa renovação de token Microsoft"""
        # Mock da resposta
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "access_token": "new_token",
            "id_token": "new_id",
            "expires_in": 3600
        }
        mock_response.raise_for_status = MagicMock()
        mock_post.return_value = mock_response
        
        # Mock de variáveis de ambiente
        with patch.dict(os.environ, {
            'AZURE_TENANT_ID': 'common',
            'AZURE_CLIENT_ID': 'test_client_id',
            'AZURE_CLIENT_SECRET': 'test_secret'
        }):
            result = session_manager._refresh_microsoft_token("refresh_token_test")
        
        assert result["access_token"] == "new_token"
        assert result["expires_in"] == 3600
        mock_post.assert_called_once()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])


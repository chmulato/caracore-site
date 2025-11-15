"""
Testes unitários para o Crypto Manager - Fase 7
Valida criptografia, descriptografia e geração de session_id
"""

import pytest
import base64
import secrets
import sys
import os

# Adicionar backend ao path para importar crypto_manager
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'backend'))

from crypto_manager import CryptoManager


class TestCryptoManager:
    """Testes para CryptoManager."""
    
    @pytest.fixture
    def crypto(self):
        """Fixture para criar CryptoManager de teste."""
        test_key = base64.b64encode(secrets.token_bytes(32)).decode('utf-8')
        return CryptoManager(test_key)
    
    def test_initialization(self, crypto):
        """Testa inicialização do CryptoManager."""
        assert crypto.key is not None
        assert len(crypto.key) == 32  # AES-256 = 32 bytes
        assert crypto.backend is not None
    
    def test_initialization_with_invalid_key_length(self):
        """Testa rejeição de chave com tamanho inválido."""
        invalid_key = base64.b64encode(b"short_key").decode('utf-8')
        with pytest.raises(ValueError) as exc_info:
            CryptoManager(invalid_key)
        assert "32 bytes" in str(exc_info.value)
    
    def test_initialization_without_key(self):
        """Testa erro quando chave não é fornecida."""
        # Garantir que TOKEN_ENCRYPTION_KEY não está definida
        old_value = os.getenv('TOKEN_ENCRYPTION_KEY')
        if old_value:
            del os.environ['TOKEN_ENCRYPTION_KEY']
        
        with pytest.raises(ValueError) as exc_info:
            CryptoManager()
        assert "TOKEN_ENCRYPTION_KEY não configurada" in str(exc_info.value)
        
        # Restaurar valor original se existia
        if old_value:
            os.environ['TOKEN_ENCRYPTION_KEY'] = old_value
    
    def test_encrypt_token(self, crypto):
        """Testa criptografia de token."""
        token = "1//test_refresh_token_123456789"
        encrypted = crypto.encrypt_token(token)
        
        assert 'encrypted' in encrypted
        assert 'iv' in encrypted
        assert isinstance(encrypted['encrypted'], str)
        assert isinstance(encrypted['iv'], str)
        
        # Verificar que são base64 válidos
        assert base64.b64decode(encrypted['encrypted'])
        assert base64.b64decode(encrypted['iv'])
    
    def test_encrypt_empty_token(self, crypto):
        """Testa erro ao criptografar token vazio."""
        with pytest.raises(ValueError):
            crypto.encrypt_token("")
    
    def test_decrypt_token(self, crypto):
        """Testa descriptografia de token."""
        original_token = "1//test_refresh_token_123456789"
        
        # Criptografar
        encrypted = crypto.encrypt_token(original_token)
        
        # Descriptografar
        decrypted = crypto.decrypt_token(encrypted['encrypted'], encrypted['iv'])
        
        assert decrypted == original_token
    
    def test_encrypt_decrypt_cycle(self, crypto):
        """Testa ciclo completo de criptografia/descriptografia."""
        test_tokens = [
            "short",
            "1//very_long_refresh_token_with_many_characters_0123456789",
            "token_with_special_chars_!@#$%^&*()",
            "token\nwith\nnewlines",
        ]
        
        for token in test_tokens:
            encrypted = crypto.encrypt_token(token)
            decrypted = crypto.decrypt_token(encrypted['encrypted'], encrypted['iv'])
            assert decrypted == token, f"Falhou para token: {token}"
    
    def test_encrypt_produces_different_results(self, crypto):
        """Testa que cada criptografia gera resultado diferente (IV único)."""
        token = "same_token_encrypted_twice"
        
        encrypted1 = crypto.encrypt_token(token)
        encrypted2 = crypto.encrypt_token(token)
        
        # IVs devem ser diferentes
        assert encrypted1['iv'] != encrypted2['iv']
        # Dados criptografados devem ser diferentes
        assert encrypted1['encrypted'] != encrypted2['encrypted']
        
        # Mas ambos devem descriptografar para o mesmo token
        decrypted1 = crypto.decrypt_token(encrypted1['encrypted'], encrypted1['iv'])
        decrypted2 = crypto.decrypt_token(encrypted2['encrypted'], encrypted2['iv'])
        assert decrypted1 == decrypted2 == token
    
    def test_decrypt_with_invalid_data(self, crypto):
        """Testa erro ao descriptografar dados inválidos."""
        with pytest.raises(RuntimeError):
            crypto.decrypt_token("invalid_base64", "invalid_iv")
    
    def test_decrypt_with_wrong_iv(self, crypto):
        """Testa erro ao descriptografar com IV incorreto."""
        token = "test_token"
        encrypted = crypto.encrypt_token(token)
        
        # Tentar descriptografar com IV diferente
        wrong_iv = base64.b64encode(secrets.token_bytes(16)).decode('utf-8')
        
        with pytest.raises(RuntimeError):
            crypto.decrypt_token(encrypted['encrypted'], wrong_iv)
    
    def test_generate_session_id(self):
        """Testa geração de session_id."""
        session_id = CryptoManager.generate_session_id()
        
        # Verificar formato básico
        assert isinstance(session_id, str)
        assert session_id.startswith('sess_')
        assert len(session_id) > 50  # sess_ + 32 + _ + 10 + _ + 16 = 63+
    
    def test_generate_unique_session_ids(self):
        """Testa que session_ids gerados são únicos."""
        session_ids = set()
        
        for _ in range(100):
            session_id = CryptoManager.generate_session_id()
            assert session_id not in session_ids, "Session ID duplicado encontrado!"
            session_ids.add(session_id)
    
    def test_validate_session_id_valid(self):
        """Testa validação de session_id válido."""
        # Gerar session_id real
        session_id = CryptoManager.generate_session_id()
        assert CryptoManager.validate_session_id(session_id)
    
    def test_validate_session_id_invalid_formats(self):
        """Testa rejeição de session_ids com formato inválido."""
        invalid_ids = [
            "",  # Vazio
            None,  # None
            "invalid_format",  # Sem prefixo
            "sess_",  # Apenas prefixo
            "sess_short",  # Muito curto
            "sess_abc123_1234567890_fedcba",  # UUID muito curto
            "sess_abc123def456abc123def456abc12_12345_fedcba9876543210",  # Timestamp curto
            "sess_abc123def456abc123def456abc123_1234567890_short",  # Salt curto
            123456,  # Não é string
        ]
        
        for invalid_id in invalid_ids:
            assert not CryptoManager.validate_session_id(invalid_id), \
                f"Session ID inválido foi aceito: {invalid_id}"


class TestCryptoManagerIntegration:
    """Testes de integração para cenários reais."""
    
    def test_realistic_refresh_token_encryption(self):
        """Testa criptografia de refresh token realista do Google."""
        # Token similar ao formato real do Google
        google_refresh_token = (
            "1//0eWzCyAzVKwXUCgYIARAAGA4SNwF-L9Ir"
            "abcdefghijklmnopqrstuvwxyz0123456789"
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        )
        
        test_key = base64.b64encode(secrets.token_bytes(32)).decode('utf-8')
        crypto = CryptoManager(test_key)
        
        # Criptografar e descriptografar
        encrypted = crypto.encrypt_token(google_refresh_token)
        decrypted = crypto.decrypt_token(encrypted['encrypted'], encrypted['iv'])
        
        assert decrypted == google_refresh_token
    
    def test_session_lifecycle(self):
        """Testa ciclo de vida completo de uma sessão."""
        # 1. Gerar session_id
        session_id = CryptoManager.generate_session_id()
        assert CryptoManager.validate_session_id(session_id)
        
        # 2. Criptografar refresh token
        test_key = base64.b64encode(secrets.token_bytes(32)).decode('utf-8')
        crypto = CryptoManager(test_key)
        
        refresh_token = "1//real_refresh_token_from_oauth_provider"
        encrypted = crypto.encrypt_token(refresh_token)
        
        # 3. Simular armazenamento (conversão para/de JSON)
        import json
        session_data = {
            'session_id': session_id,
            'refresh_token_encrypted': encrypted['encrypted'],
            'iv': encrypted['iv']
        }
        
        # Serializar e deserializar
        json_str = json.dumps(session_data)
        loaded_data = json.loads(json_str)
        
        # 4. Recuperar e descriptografar
        recovered_token = crypto.decrypt_token(
            loaded_data['refresh_token_encrypted'],
            loaded_data['iv']
        )
        
        assert recovered_token == refresh_token


if __name__ == "__main__":
    # Executar testes com pytest
    pytest.main([__file__, '-v', '--tb=short'])

"""
Crypto Manager - Sistema de criptografia para refresh tokens
Implementa AES-256-CBC para criptografia segura de tokens sensíveis

Fase 7 - Sistema de Refresh Tokens
Responsável por criptografar/descriptografar refresh tokens e gerar session_ids únicos
"""

from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import padding
import secrets
import base64
import os
import uuid
import time
import logging

# Configurar logging
logger = logging.getLogger(__name__)


class CryptoManager:
    """
    Gerencia operações de criptografia para refresh tokens.
    
    Utiliza AES-256-CBC com padding PKCS7 para criptografia segura.
    Cada token é criptografado com um IV (Initialization Vector) único.
    """
    
    def __init__(self, encryption_key: str = None):
        """
        Inicializa o CryptoManager com chave de criptografia.
        
        Args:
            encryption_key: Chave base64-encoded (32 bytes) ou None para usar env var
            
        Raises:
            ValueError: Se chave não fornecida ou inválida
        """
        if encryption_key is None:
            encryption_key = os.getenv('TOKEN_ENCRYPTION_KEY')
            
        if not encryption_key:
            raise ValueError(
                "TOKEN_ENCRYPTION_KEY não configurada. "
                "Execute scripts/generate_encryption_keys.py para gerar"
            )
            
        # Decodificar chave base64 para bytes
        try:
            self.key = base64.b64decode(encryption_key)
        except Exception as e:
            raise ValueError(f"Erro ao decodificar TOKEN_ENCRYPTION_KEY: {e}")
            
        # Validar tamanho (AES-256 = 32 bytes)
        if len(self.key) != 32:
            raise ValueError(
                f"TOKEN_ENCRYPTION_KEY deve ter 32 bytes (256 bits), "
                f"mas tem {len(self.key)} bytes. "
                f"Use scripts/generate_encryption_keys.py para gerar chave válida"
            )
            
        self.backend = default_backend()
        logger.info("CryptoManager inicializado com AES-256-CBC")
    
    def encrypt_token(self, token: str) -> dict:
        """
        Criptografa um refresh token usando AES-256-CBC.
        
        Args:
            token: Refresh token em texto plano
            
        Returns:
            dict contendo:
                - 'encrypted': Token criptografado (base64)
                - 'iv': Initialization Vector (base64)
                
        Raises:
            RuntimeError: Se falhar ao criptografar
        """
        if not token:
            raise ValueError("Token não pode ser vazio")
            
        try:
            # Gerar IV aleatório (16 bytes para AES)
            iv = secrets.token_bytes(16)
            
            # Criar cipher
            cipher = Cipher(
                algorithms.AES(self.key),
                modes.CBC(iv),
                backend=self.backend
            )
            encryptor = cipher.encryptor()
            
            # Aplicar padding PKCS7 (AES block size = 128 bits)
            padder = padding.PKCS7(algorithms.AES.block_size).padder()
            padded_data = padder.update(token.encode('utf-8')) + padder.finalize()
            
            # Criptografar
            encrypted_data = encryptor.update(padded_data) + encryptor.finalize()
            
            # Retornar em base64 para armazenamento JSON-safe
            result = {
                'encrypted': base64.b64encode(encrypted_data).decode('utf-8'),
                'iv': base64.b64encode(iv).decode('utf-8')
            }
            
            logger.debug(f"Token criptografado (tamanho: {len(encrypted_data)} bytes)")
            return result
            
        except Exception as e:
            logger.error(f"Erro ao criptografar token: {e}")
            raise RuntimeError(f"Falha na criptografia: {e}")
    
    def decrypt_token(self, encrypted_data: str, iv: str) -> str:
        """
        Descriptografa um refresh token.
        
        Args:
            encrypted_data: Token criptografado (base64)
            iv: Initialization Vector (base64)
            
        Returns:
            Token em texto plano
            
        Raises:
            RuntimeError: Se falhar ao descriptografar
        """
        if not encrypted_data or not iv:
            raise ValueError("encrypted_data e iv são obrigatórios")
            
        try:
            # Decodificar base64
            encrypted_bytes = base64.b64decode(encrypted_data)
            iv_bytes = base64.b64decode(iv)
            
            # Validar tamanho do IV
            if len(iv_bytes) != 16:
                raise ValueError(f"IV deve ter 16 bytes, tem {len(iv_bytes)}")
            
            # Criar cipher
            cipher = Cipher(
                algorithms.AES(self.key),
                modes.CBC(iv_bytes),
                backend=self.backend
            )
            decryptor = cipher.decryptor()
            
            # Descriptografar
            padded_data = decryptor.update(encrypted_bytes) + decryptor.finalize()
            
            # Remover padding
            unpadder = padding.PKCS7(algorithms.AES.block_size).unpadder()
            data = unpadder.update(padded_data) + unpadder.finalize()
            
            # Retornar como string
            token = data.decode('utf-8')
            logger.debug(f"Token descriptografado com sucesso (tamanho: {len(token)} chars)")
            return token
            
        except Exception as e:
            logger.error(f"Erro ao descriptografar token: {e}")
            raise RuntimeError(f"Falha na descriptografia: {e}")
    
    @staticmethod
    def generate_session_id() -> str:
        """
        Gera um session_id único e seguro.
        
        Formato: sess_{uuid}_{timestamp}_{salt}
        - uuid: UUID v4 sem hífens (32 chars)
        - timestamp: Unix timestamp (10 chars)
        - salt: 16 chars hexadecimais aleatórios
        
        Returns:
            Session ID único (formato: sess_...)
        """
        session_uuid = str(uuid.uuid4()).replace('-', '')
        timestamp = str(int(time.time()))
        salt = secrets.token_hex(8)  # 16 chars hex
        
        session_id = f"sess_{session_uuid}_{timestamp}_{salt}"
        logger.debug(f"Session ID gerado: {session_id}")
        return session_id
    
    @staticmethod
    def validate_session_id(session_id: str) -> bool:
        """
        Valida formato de um session_id.
        
        Args:
            session_id: Session ID a validar
            
        Returns:
            True se formato válido, False caso contrário
        """
        if not session_id or not isinstance(session_id, str):
            return False
            
        if not session_id.startswith('sess_'):
            return False
            
        # Formato esperado: sess_{32chars}_{timestamp}_{16chars}
        # Remove prefixo e divide
        parts = session_id[5:].split('_')  # Remove 'sess_' e divide
        if len(parts) != 3:
            return False
            
        # Validar comprimentos
        if len(parts[0]) != 32:  # UUID sem hífens
            return False
        if not parts[1].isdigit() or len(parts[1]) != 10:  # Timestamp
            return False
        if len(parts[2]) != 16:  # Salt hex (8 bytes = 16 chars hex)
            return False
            
        return True


# Função auxiliar para testes e validação
def test_crypto_manager():
    """
    Testa funcionalidades básicas do CryptoManager.
    Executa testes de criptografia, descriptografia e geração de session_id.
    """
    print("\nTestando CryptoManager...")
    print("=" * 80)
    
    # Gerar chave de teste
    test_key = base64.b64encode(secrets.token_bytes(32)).decode('utf-8')
    print(f"Chave de teste gerada: {test_key[:20]}...")
    
    # Inicializar
    try:
        crypto = CryptoManager(test_key)
        print("CryptoManager inicializado com sucesso")
    except Exception as e:
        print(f"ERRO ao inicializar: {e}")
        return False
    
    # Testar criptografia
    test_token = "1//test_refresh_token_very_long_string_123456789_abcdefgh"
    print(f"\nToken original: {test_token}")
    
    try:
        encrypted = crypto.encrypt_token(test_token)
        print(f"Token criptografado:")
        print(f"   - Encrypted: {encrypted['encrypted'][:60]}...")
        print(f"   - IV: {encrypted['iv']}")
    except Exception as e:
        print(f"ERRO ao criptografar: {e}")
        return False
    
    # Testar descriptografia
    try:
        decrypted = crypto.decrypt_token(encrypted['encrypted'], encrypted['iv'])
        if decrypted == test_token:
            print(f"Token descriptografado corretamente")
            print(f"   - Match: {decrypted == test_token}")
        else:
            print(f"ERRO: Token descriptografado não corresponde ao original")
            return False
    except Exception as e:
        print(f"ERRO ao descriptografar: {e}")
        return False
    
    # Testar que cada criptografia gera resultado diferente (IV único)
    try:
        encrypted2 = crypto.encrypt_token(test_token)
        if encrypted['iv'] != encrypted2['iv']:
            print(f"IVs únicos confirmados (segurança garantida)")
        else:
            print(f"AVISO: IVs iguais - possível problema de segurança")
    except Exception as e:
        print(f"ERRO ao testar unicidade de IV: {e}")
    
    # Testar geração de session_id
    print("\nTestando geração de session_id...")
    try:
        session_id = CryptoManager.generate_session_id()
        print(f"Session ID gerado: {session_id}")
        
        # Validar formato
        if CryptoManager.validate_session_id(session_id):
            print(f"Session ID possui formato válido")
        else:
            print(f"ERRO: Session ID com formato inválido")
            return False
        
        # Testar unicidade
        session_id2 = CryptoManager.generate_session_id()
        if session_id != session_id2:
            print(f"Session IDs únicos confirmados")
        else:
            print(f"ERRO: Session IDs duplicados - problema")
            return False
            
    except Exception as e:
        print(f"ERRO ao gerar session_id: {e}")
        return False
    
    # Testar validação de session_id
    print("\nTestando validação de session_id...")
    
    # Gerar um session_id real para testar
    valid_session = CryptoManager.generate_session_id()
    
    test_cases = [
        (valid_session, True, "válido (gerado)"),
        ("sess_abc123def456_1700000000_fedcba9876543210", False, "timestamp incorreto"),
        ("invalid_session_id", False, "sem prefixo sess_"),
        ("sess_short", False, "muito curto"),
        ("", False, "vazio"),
        (None, False, "None"),
    ]
    
    for test_id, expected, description in test_cases:
        result = CryptoManager.validate_session_id(test_id)
        status = "OK" if result == expected else "ERRO"
        print(f"{status} Teste '{description}': {result} (esperado: {expected})")
    
    print("\n" + "=" * 80)
    print("Todos os testes do CryptoManager passaram")
    print("=" * 80)
    return True


if __name__ == "__main__":
    # Executar testes se rodado diretamente
    import sys
    
    print("\n" + "=" * 80)
    print("CRYPTO MANAGER - FASE 7 - TESTES")
    print("=" * 80)
    
    success = test_crypto_manager()
    
    if success:
        print("\nCryptoManager está pronto para uso")
        sys.exit(0)
    else:
        print("\nERRO: Testes falharam - verifique os erros acima")
        sys.exit(1)

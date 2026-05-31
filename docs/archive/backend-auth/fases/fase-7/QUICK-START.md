# Quick Start - Fase 7

**Início:** 15/11/2025  
**Objetivo:** Implementar sistema de refresh tokens em 3 semanas

---

## 🚀 PREPARAÇÃO DO AMBIENTE

### 1. Instalar Dependências

```bash
cd d:\dev\site\cara-core\backend

# Adicionar ao requirements.txt
echo cryptography>=41.0.0 >> requirements.txt
echo flask-limiter>=3.5.0 >> requirements.txt
echo python-dateutil>=2.8.2 >> requirements.txt

# Instalar
pip install -r requirements.txt
```

### 2. Gerar Chaves de Criptografia

```bash
# Criar script para gerar chaves
cd d:\dev\site\cara-core\scripts
```

**Arquivo:** `scripts/generate_encryption_keys.py`

```python
import secrets
import base64

def generate_keys():
    """Gera chaves seguras para criptografia e sessão."""
    
    # Chave AES-256 (32 bytes)
    encryption_key = base64.b64encode(secrets.token_bytes(32)).decode('utf-8')
    
    # Chave de sessão (32 caracteres URL-safe)
    session_secret = secrets.token_urlsafe(32)
    
    print("=" * 80)
    print("CHAVES DE CRIPTOGRAFIA GERADAS")
    print("=" * 80)
    print()
    print("Adicione estas variáveis ao seu .env ou Azure App Settings:")
    print()
    print(f"TOKEN_ENCRYPTION_KEY={encryption_key}")
    print(f"SESSION_SECRET_KEY={session_secret}")
    print()
    print("⚠️  IMPORTANTE: Guarde estas chaves em local seguro!")
    print("⚠️  NUNCA commit estas chaves no Git!")
    print("=" * 80)

if __name__ == "__main__":
    generate_keys()
```

**Executar:**

```bash
python scripts/generate_encryption_keys.py
```

### 3. Configurar Variáveis de Ambiente

**Arquivo:** `backend/.env` (criar se não existir)

```bash
# Chaves de criptografia (usar os valores gerados)
TOKEN_ENCRYPTION_KEY=seu_token_gerado_aqui
SESSION_SECRET_KEY=seu_session_secret_aqui

# Configurações de sessão
SESSION_TIMEOUT_HOURS=24
MAX_SESSIONS_PER_USER=5
CLEANUP_INTERVAL_HOURS=6

# Rate limiting
RATE_LIMIT_TOKEN_REFRESH=10/minute
RATE_LIMIT_SESSION_CREATE=5/minute

# Caminhos
SESSION_DATA_FILE=data/user_sessions.json
AUDIT_LOG_PATH=logs/token_audit.log
```

**⚠️ IMPORTANTE:** Adicionar `.env` ao `.gitignore`:

```bash
echo .env >> .gitignore
```

### 4. Criar Estrutura de Diretórios

```bash
# Criar diretórios necessários
mkdir -p backend/data/backups
mkdir -p backend/logs
mkdir -p tests/fase-7
```

### 5. Criar Branch de Desenvolvimento

```bash
git checkout -b feature/fase-7-refresh-tokens
```

---

## 📝 PRIMEIRO COMPONENTE: Crypto Manager

### Arquivo: `backend/crypto_manager.py`

```python
"""
Crypto Manager - Sistema de criptografia para refresh tokens
Implementa AES-256-CBC para criptografia segura de tokens sensíveis
"""

from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import padding
import secrets
import base64
import os
import uuid
import time


class CryptoManager:
    """Gerencia operações de criptografia para refresh tokens."""
    
    def __init__(self, encryption_key: str = None):
        """
        Inicializa o CryptoManager com chave de criptografia.
        
        Args:
            encryption_key: Chave base64-encoded (32 bytes) ou None para usar env var
        """
        if encryption_key is None:
            encryption_key = os.getenv('TOKEN_ENCRYPTION_KEY')
            
        if not encryption_key:
            raise ValueError("TOKEN_ENCRYPTION_KEY não configurada")
            
        # Decodificar chave base64 para bytes
        try:
            self.key = base64.b64decode(encryption_key)
        except Exception as e:
            raise ValueError(f"Erro ao decodificar chave: {e}")
            
        # Validar tamanho (AES-256 = 32 bytes)
        if len(self.key) != 32:
            raise ValueError(f"Chave deve ter 32 bytes, tem {len(self.key)}")
            
        self.backend = default_backend()
    
    def encrypt_token(self, token: str) -> dict:
        """
        Criptografa um refresh token usando AES-256-CBC.
        
        Args:
            token: Refresh token em texto plano
            
        Returns:
            dict com 'encrypted' (base64) e 'iv' (base64)
        """
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
            
            # Aplicar padding PKCS7
            padder = padding.PKCS7(algorithms.AES.block_size).padder()
            padded_data = padder.update(token.encode('utf-8')) + padder.finalize()
            
            # Criptografar
            encrypted_data = encryptor.update(padded_data) + encryptor.finalize()
            
            # Retornar em base64
            return {
                'encrypted': base64.b64encode(encrypted_data).decode('utf-8'),
                'iv': base64.b64encode(iv).decode('utf-8')
            }
            
        except Exception as e:
            raise RuntimeError(f"Erro ao criptografar token: {e}")
    
    def decrypt_token(self, encrypted_data: str, iv: str) -> str:
        """
        Descriptografa um refresh token.
        
        Args:
            encrypted_data: Token criptografado (base64)
            iv: Initialization Vector (base64)
            
        Returns:
            Token em texto plano
        """
        try:
            # Decodificar base64
            encrypted_bytes = base64.b64decode(encrypted_data)
            iv_bytes = base64.b64decode(iv)
            
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
            
            return data.decode('utf-8')
            
        except Exception as e:
            raise RuntimeError(f"Erro ao descriptografar token: {e}")
    
    @staticmethod
    def generate_session_id() -> str:
        """
        Gera um session_id único e seguro.
        
        Returns:
            Session ID no formato: sess_{uuid}_{timestamp}_{salt}
        """
        session_uuid = str(uuid.uuid4()).replace('-', '')
        timestamp = str(int(time.time()))
        salt = secrets.token_hex(8)
        
        return f"sess_{session_uuid}_{timestamp}_{salt}"


# Função auxiliar para testes
def test_crypto_manager():
    """Testa funcionalidades básicas do CryptoManager."""
    print("🔧 Testando CryptoManager...")
    
    # Gerar chave de teste
    test_key = base64.b64encode(secrets.token_bytes(32)).decode('utf-8')
    
    # Inicializar
    crypto = CryptoManager(test_key)
    print("✅ CryptoManager inicializado")
    
    # Testar criptografia
    test_token = "1//test_refresh_token_very_long_string_123456789"
    encrypted = crypto.encrypt_token(test_token)
    print(f"✅ Token criptografado: {encrypted['encrypted'][:50]}...")
    
    # Testar descriptografia
    decrypted = crypto.decrypt_token(encrypted['encrypted'], encrypted['iv'])
    assert decrypted == test_token, "Descriptografia falhou!"
    print("✅ Token descriptografado corretamente")
    
    # Testar geração de session_id
    session_id = CryptoManager.generate_session_id()
    assert session_id.startswith('sess_'), "Session ID inválido!"
    print(f"✅ Session ID gerado: {session_id}")
    
    print("✅ Todos os testes passaram!")


if __name__ == "__main__":
    # Executar testes se rodado diretamente
    test_crypto_manager()
```

### Testar o Crypto Manager

```bash
# Configurar variável temporária para teste
$env:TOKEN_ENCRYPTION_KEY="gerar_com_script_acima"

# Executar teste
python backend/crypto_manager.py
```

**Output esperado:**

```text
🔧 Testando CryptoManager...
✅ CryptoManager inicializado
✅ Token criptografado: U29tZUVuY3J5cHRlZERhdGFIZXJl...
✅ Token descriptografado corretamente
✅ Session ID gerado: sess_a1b2c3d4e5f6_1700000000_abc123
✅ Todos os testes passaram!
```

---

## 📋 PRÓXIMOS PASSOS

### Hoje (15/11/2025)

1.✅ Preparar ambiente
2.✅ Gerar chaves de criptografia
3.✅ Implementar Crypto Manager
4.⬜ Criar testes unitários para Crypto Manager

### Amanhã (18/11/2025)

5.⬜ Implementar Token Storage Manager
6.⬜ Criar testes unitários para Token Storage

### Esta Semana

7.⬜ Implementar Session Manager
8.⬜ Testes de integração dos componentes base
9.⬜ Documentar componentes

---

## 🧪 CRIAR TESTES UNITÁRIOS

### Arquivo: `tests/fase-7/test_crypto_manager.py`

```python
import pytest
import base64
import secrets
from backend.crypto_manager import CryptoManager


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
        assert len(crypto.key) == 32
    
    def test_invalid_key_length(self):
        """Testa rejeição de chave com tamanho inválido."""
        invalid_key = base64.b64encode(b"short").decode('utf-8')
        with pytest.raises(ValueError):
            CryptoManager(invalid_key)
    
    def test_encrypt_decrypt(self, crypto):
        """Testa ciclo completo de criptografia/descriptografia."""
        original_token = "1//test_refresh_token_123456789"
        
        # Criptografar
        encrypted = crypto.encrypt_token(original_token)
        assert 'encrypted' in encrypted
        assert 'iv' in encrypted
        
        # Descriptografar
        decrypted = crypto.decrypt_token(encrypted['encrypted'], encrypted['iv'])
        assert decrypted == original_token
    
    def test_encrypt_produces_different_results(self, crypto):
        """Testa que cada criptografia gera resultado diferente (IV único)."""
        token = "same_token"
        
        encrypted1 = crypto.encrypt_token(token)
        encrypted2 = crypto.encrypt_token(token)
        
        # IVs devem ser diferentes
        assert encrypted1['iv'] != encrypted2['iv']
        # Dados criptografados devem ser diferentes
        assert encrypted1['encrypted'] != encrypted2['encrypted']
    
    def test_generate_session_id(self):
        """Testa geração de session_id."""
        session_id = CryptoManager.generate_session_id()
        
        # Verificar formato
        assert session_id.startswith('sess_')
        
        # Verificar unicidade
        session_id2 = CryptoManager.generate_session_id()
        assert session_id != session_id2
    
    def test_decrypt_invalid_data(self, crypto):
        """Testa tratamento de erro em dados inválidos."""
        with pytest.raises(RuntimeError):
            crypto.decrypt_token("invalid_base64", "invalid_iv")
```

### Executar Testes

```bash
# Instalar pytest se necessário
pip install pytest pytest-cov

# Executar testes
python -m pytest tests/fase-7/test_crypto_manager.py -v

# Com cobertura
python -m pytest tests/fase-7/test_crypto_manager.py -v --cov=backend.crypto_manager --cov-report=html
```

---

## 📚 REFERÊNCIAS RÁPIDAS

### Comandos Úteis

```bash
# Status do projeto
git status

# Commit de progresso
git add .
git commit -m "feat(fase-7): implementar crypto manager"

# Ver testes
python -m pytest tests/fase-7/ -v

# Ver logs
tail -f backend/logs/app.log
```

### Links Importantes

- **Documentação Fase 7:** `docs/fases/fase-7/README.md`
- **Acompanhamento:** `docs/fases/fase-7/acompanhamento-tecnico.md`
- **Cryptography Docs:** [https://cryptography.io/en/latest/]

---

**Pronto para começar! 🚀**  
**Primeira tarefa:** Implementar e testar `crypto_manager.py`  
**Tempo estimado:** 4-6 horas

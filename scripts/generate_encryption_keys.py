#!/usr/bin/env python3
"""
Script para gerar chaves de criptografia seguras para Fase 7
Gera TOKEN_ENCRYPTION_KEY e SESSION_SECRET_KEY

Uso:
    python scripts/generate_encryption_keys.py
"""

import secrets
import base64
import sys
from pathlib import Path

def generate_encryption_key() -> str:
    """
    Gera chave de criptografia AES-256 (32 bytes).
    
    Returns:
        Chave base64-encoded
    """
    key_bytes = secrets.token_bytes(32)  # 32 bytes = 256 bits
    return base64.b64encode(key_bytes).decode('utf-8')

def generate_session_secret() -> str:
    """
    Gera secret para sessões.
    
    Returns:
        Secret URL-safe
    """
    return secrets.token_urlsafe(32)

def main():
    """Gera e exibe chaves de criptografia."""
    print("\n" + "=" * 80)
    print("GERADOR DE CHAVES DE CRIPTOGRAFIA - FASE 7")
    print("=" * 80)
    print()
    
    # Gerar chaves
    encryption_key = generate_encryption_key()
    session_secret = generate_session_secret()
    
    print("[OK] Chaves geradas com sucesso!")
    print()
    print("Adicione estas variáveis ao seu arquivo .env ou Azure App Settings:")
    print()
    print("-" * 80)
    print("TOKEN_ENCRYPTION_KEY=" + encryption_key)
    print("SESSION_SECRET_KEY=" + session_secret)
    print("-" * 80)
    print()
    print("[IMPORTANTE]:")
    print("   - Mantenha estas chaves em SEGREDO")
    print("   - NÃO commite estas chaves no Git")
    print("   - Faça backup seguro das chaves")
    print("   - Se perder as chaves, todos os tokens criptografados serão perdidos")
    print()
    print("=" * 80)
    
    # Opcional: salvar em arquivo .env.example (sem valores reais)
    env_example_path = Path(__file__).parent.parent / ".env.example"
    if not env_example_path.exists():
        try:
            with open(env_example_path, 'w', encoding='utf-8') as f:
                f.write("# Variáveis de ambiente para Fase 7 - Refresh Tokens\n")
                f.write("# Gere valores com: python scripts/generate_encryption_keys.py\n")
                f.write("\n")
                f.write("TOKEN_ENCRYPTION_KEY=your_base64_encoded_32_byte_key_here\n")
                f.write("SESSION_SECRET_KEY=your_session_secret_here\n")
                f.write("\n")
                f.write("# Configurações de sessão\n")
                f.write("SESSION_TIMEOUT_HOURS=24\n")
                f.write("MAX_SESSIONS_PER_USER=5\n")
                f.write("CLEANUP_INTERVAL_HOURS=6\n")
            print(f"[OK] Arquivo .env.example criado: {env_example_path}")
        except Exception as e:
            print(f"[AVISO] Não foi possível criar .env.example: {e}")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())

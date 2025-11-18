#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para verificar configuração de GOOGLE_ALLOWED_DOMAINS
"""

import os
import sys
from pathlib import Path

# Configurar encoding para Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

def read_from_env_file(file_path: Path) -> str:
    """Lê GOOGLE_ALLOWED_DOMAINS de arquivo .env"""
    if not file_path.exists():
        return ""
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line.startswith('GOOGLE_ALLOWED_DOMAINS='):
                    # Extrair valor após o =
                    value = line.split('=', 1)[1].strip()
                    # Remover aspas se houver
                    if value.startswith('"') and value.endswith('"'):
                        value = value[1:-1]
                    elif value.startswith("'") and value.endswith("'"):
                        value = value[1:-1]
                    return value
    except Exception as e:
        print(f"⚠️  Erro ao ler arquivo {file_path}: {e}")
    
    return ""

def main():
    """Verifica configuração de GOOGLE_ALLOWED_DOMAINS"""
    
    print("=" * 60)
    print("Verificação de GOOGLE_ALLOWED_DOMAINS")
    print("=" * 60)
    print()
    
    # Tentar ler de múltiplas fontes
    google_allowed_domains_env = ""
    source = None
    
    # 1. Variável de ambiente do sistema
    google_allowed_domains_env = os.getenv("GOOGLE_ALLOWED_DOMAINS", "")
    if google_allowed_domains_env:
        source = "variável de ambiente do sistema"
    
    # 2. Arquivo docker/backend.env
    if not google_allowed_domains_env:
        env_file = Path(__file__).parent.parent / "docker" / "backend.env"
        google_allowed_domains_env = read_from_env_file(env_file)
        if google_allowed_domains_env:
            source = f"arquivo {env_file}"
    
    # 3. Arquivo docker/backend.env.sample (template)
    if not google_allowed_domains_env:
        sample_file = Path(__file__).parent.parent / "docker" / "backend.env.sample"
        google_allowed_domains_env = read_from_env_file(sample_file)
        if google_allowed_domains_env:
            source = f"template {sample_file} (não é configuração real)"
    
    # Processar lista (igual ao backend)
    google_allowed_domains_list = [
        entry.strip().lower() 
        for entry in google_allowed_domains_env.split(",") 
        if entry.strip()
    ]
    google_allowed_domains = google_allowed_domains_list or None
    
    # Exibir configuração
    print("📋 Configuração Atual:")
    print(f"   Variável: GOOGLE_ALLOWED_DOMAINS")
    if source:
        print(f"   Fonte: {source}")
    else:
        print(f"   Fonte: não encontrada")
    print(f"   Valor bruto: '{google_allowed_domains_env}'")
    print()
    
    if google_allowed_domains:
        print(f"✅ Domínios autorizados ({len(google_allowed_domains)}):")
        for i, domain in enumerate(google_allowed_domains, 1):
            print(f"   {i}. {domain}")
    else:
        print("⚠️  Nenhum domínio restrito (aceita qualquer domínio)")
    print()
    
    # Verificar configuração esperada
    expected_domains = ["caracore.com.br", "gmail.com"]
    print("🎯 Configuração Esperada:")
    print(f"   Domínios: {', '.join(expected_domains)}")
    print()
    
    # Comparar
    if google_allowed_domains:
        missing = set(expected_domains) - set(google_allowed_domains)
        extra = set(google_allowed_domains) - set(expected_domains)
        
        if not missing and not extra:
            print("✅ Configuração está correta!")
            return 0
        else:
            print("⚠️  Configuração não corresponde ao esperado:")
            if missing:
                print(f"   ❌ Faltando: {', '.join(missing)}")
            if extra:
                print(f"   ⚠️  Extras: {', '.join(extra)}")
            return 1
    else:
        print("⚠️  Nenhum domínio restrito (deve ter restrições)")
        print()
        print("💡 Como configurar:")
        print("   1. Definir variável de ambiente:")
        print("      Windows PowerShell: $env:GOOGLE_ALLOWED_DOMAINS='caracore.com.br,gmail.com'")
        print("      Linux/macOS: export GOOGLE_ALLOWED_DOMAINS='caracore.com.br,gmail.com'")
        print()
        print("   2. Ou criar arquivo docker/backend.env com:")
        print("      GOOGLE_ALLOWED_DOMAINS=caracore.com.br,gmail.com")
        print()
        print("   3. Ou configurar no Azure App Service:")
        print("      Portal Azure → App Service → Configuration → Application settings")
        return 1

if __name__ == "__main__":
    sys.exit(main())


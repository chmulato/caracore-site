#!/usr/bin/env python3
"""
Script para verificar configuração de GOOGLE_ALLOWED_DOMAINS
"""

import os
import sys

def main():
    """Verifica configuração de GOOGLE_ALLOWED_DOMAINS"""
    
    print("=" * 60)
    print("Verificação de GOOGLE_ALLOWED_DOMAINS")
    print("=" * 60)
    print()
    
    # Ler variável de ambiente
    google_allowed_domains_env = os.getenv("GOOGLE_ALLOWED_DOMAINS", "")
    
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
        return 1

if __name__ == "__main__":
    sys.exit(main())


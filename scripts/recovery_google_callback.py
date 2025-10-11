#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
recovery_google_callback.py - Recuperação Manual Google Callback

Script para executar quando o callback do Google falha.
Limpa estado e força reprocessamento.
"""

from pathlib import Path
import webbrowser

def main():
    print("🚨 RECUPERAÇÃO GOOGLE CALLBACK")
    print("=" * 35)
    
    print("1. 📋 Cole este código no Console do navegador (F12):")
    print("-" * 50)
    print("""
// Limpa estado e força reprocessamento
sessionStorage.setItem('cara_core_oidc_provider', 'google');
localStorage.setItem('cara_core_oidc_provider', 'google');

// Aguarda e tenta reprocessar
setTimeout(async () => {
    try {
        await window.OIDCAuth.initialize();
        await window.OIDCAuth.handleAuthCallback();
        window.location.href = '/secure/restrita.html';
    } catch (e) {
        console.error('Erro:', e);
        alert('Erro no callback. Redirecionando manualmente...');
        window.location.href = '/secure/restrita.html';
    }
}, 1000);
""")
    print("-" * 50)
    
    print("\n2. 🌐 Ou abra diretamente a área restrita:")
    choice = input("Abrir área restrita agora? (s/n): ")
    
    if choice.lower() in ['s', 'sim', 'y', 'yes']:
        webbrowser.open('https://www.caracore.com.br/secure/restrita.html')
        print("✅ Área restrita aberta no navegador")
    
    print("\n💡 Para evitar problemas futuros:")
    print("   - Limpe cache do navegador")
    print("   - Verifique console para erros JavaScript")
    print("   - Execute: python scripts/diagnosticar_google_callback.py")

if __name__ == "__main__":
    main()

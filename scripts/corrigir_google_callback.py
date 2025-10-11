#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
corrigir_google_callback.py - Correção Google OAuth Callback

Script para corrigir problemas comuns no callback do Google OAuth.

Problema identificado:
- Authorization code recebido corretamente
- Fica travado em "Validando credenciais"
- Provavelmente erro no processamento JavaScript

Uso:
    python corrigir_google_callback.py [--action diagnose|fix|test]
"""

import json
import re
from pathlib import Path
from datetime import datetime

class GoogleCallbackFixer:
    def __init__(self):
        self.workspace_dir = Path(__file__).parent.parent
        self.fixes_applied = []
        self.issues_found = []

    def log(self, message: str, level: str = 'INFO'):
        """Log com timestamp"""
        timestamp = datetime.now().strftime('%H:%M:%S')
        icons = {'INFO': '📝', 'SUCCESS': '✅', 'ERROR': '❌', 'WARNING': '⚠️', 'FIX': '🔧'}
        print(f"[{timestamp}] {icons.get(level, '📝')} {message}")

    def check_auth_standalone_loading(self):
        """Verifica se auth-standalone.js está carregando corretamente"""
        self.log("Verificando carregamento do auth-standalone.js...", 'INFO')
        
        callback_html = self.workspace_dir / "secure" / "callback.html"
        
        if not callback_html.exists():
            self.issues_found.append("callback.html não encontrado")
            return False
        
        try:
            content = callback_html.read_text(encoding='utf-8')
            
            # Verifica se auth-standalone.js está sendo carregado
            if 'auth-standalone.js' not in content:
                self.issues_found.append("auth-standalone.js não está sendo carregado em callback.html")
                return False
            
            # Verifica ordem de carregamento
            scripts_order = [
                'oidc-client-ts.js',
                'auth-standalone.js'
            ]
            
            last_pos = -1
            for script in scripts_order:
                pos = content.find(script)
                if pos == -1:
                    self.issues_found.append(f"Script {script} não encontrado")
                    return False
                if pos < last_pos:
                    self.issues_found.append(f"Ordem incorreta de scripts: {script}")
                    return False
                last_pos = pos
            
            self.log("Carregamento de scripts: OK", 'SUCCESS')
            return True
            
        except Exception as e:
            self.issues_found.append(f"Erro lendo callback.html: {e}")
            return False

    def check_google_config_completeness(self):
        """Verifica se a configuração do Google está completa"""
        self.log("Verificando configuração completa do Google...", 'INFO')
        
        config_js = self.workspace_dir / "js" / "config.js"
        
        if not config_js.exists():
            self.issues_found.append("config.js não encontrado")
            return False
        
        try:
            content = config_js.read_text(encoding='utf-8')
            
            # Procura configuração do Google
            google_match = re.search(r'google:\s*{([^}]+)}', content, re.DOTALL)
            if not google_match:
                self.issues_found.append("Configuração Google não encontrada em config.js")
                return False
            
            google_block = google_match.group(1)
            
            # Verifica campos obrigatórios
            required_fields = ['clientId', 'authority', 'redirectUri', 'scope']
            missing_fields = []
            
            for field in required_fields:
                if field not in google_block:
                    missing_fields.append(field)
            
            if missing_fields:
                self.issues_found.append(f"Campos faltando na config Google: {', '.join(missing_fields)}")
                return False
            
            # Verifica se scope está definido corretamente
            scope_match = re.search(r'scope:\s*["\']([^"\']+)', google_block)
            if not scope_match:
                self.issues_found.append("Scope não definido corretamente na configuração Google")
                return False
            
            scope_value = scope_match.group(1)
            required_scopes = ['openid', 'profile', 'email']
            
            for req_scope in required_scopes:
                if req_scope not in scope_value:
                    self.issues_found.append(f"Scope '{req_scope}' faltando na configuração")
            
            self.log("Configuração Google: OK", 'SUCCESS')
            return True
            
        except Exception as e:
            self.issues_found.append(f"Erro verificando config.js: {e}")
            return False

    def fix_callback_timeout_handling(self):
        """Corrige handling de timeout no callback"""
        self.log("Corrigindo timeout handling...", 'FIX')
        
        callback_html = self.workspace_dir / "secure" / "callback.html"
        
        try:
            content = callback_html.read_text(encoding='utf-8')
            
            # Verifica se já tem timeout adequado
            current_timeout = re.search(r'setTimeout\([^,]+,\s*(\d+)\)', content)
            
            if current_timeout:
                timeout_value = int(current_timeout.group(1))
                if timeout_value < 15000:  # Menos que 15 segundos
                    # Aumenta timeout para 15 segundos
                    new_content = re.sub(
                        r'setTimeout\(([^,]+),\s*\d+\)',
                        r'setTimeout(\1, 15000)',
                        content
                    )
                    
                    callback_html.write_text(new_content, encoding='utf-8')
                    self.fixes_applied.append("Aumentado timeout do callback para 15 segundos")
                    self.log("Timeout aumentado para 15 segundos", 'SUCCESS')
            else:
                self.log("Timeout não encontrado no callback", 'WARNING')
            
        except Exception as e:
            self.log(f"Erro corrigindo timeout: {e}", 'ERROR')

    def create_google_callback_debugger(self):
        """Cria script de debug específico para Google"""
        self.log("Criando debugger específico para Google...", 'FIX')
        
        debug_script = '''// google-callback-debugger.js - Debug específico para Google OAuth
(function() {
    'use strict';
    
    console.log("🐛 GOOGLE CALLBACK DEBUGGER ATIVADO");
    console.log("==================================");
    
    // Função para debug detalhado
    function debugGoogleCallback() {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');
        
        console.log("📊 ANÁLISE DETALHADA:");
        console.log("Code presente:", !!code);
        console.log("Code length:", code ? code.length : 0);
        console.log("State presente:", !!state);
        console.log("State value:", state);
        
        // Verifica providers armazenados
        const sessionProvider = sessionStorage.getItem('cara_core_oidc_provider');
        const localProvider = localStorage.getItem('cara_core_oidc_provider');
        
        console.log("Provider session:", sessionProvider);
        console.log("Provider local:", localProvider);
        
        // Verifica OIDC Auth
        console.log("\\n🔧 VERIFICAÇÃO OIDC AUTH:");
        console.log("window.OIDCAuth:", typeof window.OIDCAuth);
        
        if (window.OIDCAuth) {
            console.log("OIDCAuth.initialize:", typeof window.OIDCAuth.initialize);
            console.log("OIDCAuth.handleAuthCallback:", typeof window.OIDCAuth.handleAuthCallback);
            console.log("OIDCAuth.userManager:", typeof window.OIDCAuth.userManager);
            
            // Tenta obter estado atual
            try {
                const lastProvider = window.OIDCAuth.getLastUsedProvider();
                console.log("Last used provider:", lastProvider);
            } catch (e) {
                console.log("Erro obtendo provider:", e);
            }
        }
        
        // Verifica scripts carregados
        console.log("\\n📦 SCRIPTS CARREGADOS:");
        const scripts = Array.from(document.querySelectorAll('script[src]'));
        scripts.forEach(script => {
            const src = script.src;
            if (src.includes('oidc') || src.includes('auth')) {
                console.log("Script:", src.split('/').pop(), "- Loaded:", script.readyState !== 'loading');
            }
        });
        
        return {
            hasCode: !!code,
            hasState: !!state,
            codeLength: code ? code.length : 0,
            oidcAuthAvailable: typeof window.OIDCAuth !== 'undefined',
            sessionProvider,
            localProvider
        };
    }
    
    // Função para forçar reprocessamento
    window.forceGoogleCallbackProcessing = async function() {
        console.log("🔄 FORÇANDO REPROCESSAMENTO...");
        
        try {
            // Garante que provider está definido
            sessionStorage.setItem('cara_core_oidc_provider', 'google');
            localStorage.setItem('cara_core_oidc_provider', 'google');
            
            // Aguarda OIDCAuth estar disponível
            let attempts = 0;
            while (typeof window.OIDCAuth === 'undefined' && attempts < 50) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            
            if (typeof window.OIDCAuth === 'undefined') {
                throw new Error('OIDCAuth não carregou após 5 segundos');
            }
            
            console.log("✅ OIDCAuth disponível, inicializando...");
            
            // Inicializa
            await window.OIDCAuth.initialize();
            console.log("✅ OIDCAuth inicializado");
            
            // Processa callback
            await window.OIDCAuth.handleAuthCallback();
            console.log("✅ Callback processado com sucesso!");
            
            // Redireciona
            console.log("🚀 Redirecionando para área restrita...");
            window.location.href = '/secure/restrita.html';
            
        } catch (error) {
            console.error("❌ Erro no reprocessamento:", error);
            console.log("Detalhes:", {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
            
            // Oferece fallback
            const fallback = confirm("Erro no login automático. Deseja ir manualmente para a área restrita?");
            if (fallback) {
                window.location.href = '/secure/restrita.html';
            }
        }
    };
    
    // Debug inicial
    const analysis = debugGoogleCallback();
    console.log("🎯 RESUMO ANÁLISE:", analysis);
    
    // Auto-força reprocessamento se tudo parecer OK
    if (analysis.hasCode && analysis.hasState) {
        console.log("📋 Dados parecem OK, tentando reprocessamento automático em 2s...");
        setTimeout(() => {
            window.forceGoogleCallbackProcessing();
        }, 2000);
    } else {
        console.log("⚠️ Dados incompletos, reprocessamento manual necessário");
        console.log("Execute: window.forceGoogleCallbackProcessing()");
    }
    
    // Disponibiliza função global para debug manual
    window.debugGoogleCallback = debugGoogleCallback;
    
})();'''
        
        debug_file = self.workspace_dir / "secure" / "google-callback-debugger.js"
        debug_file.write_text(debug_script, encoding='utf-8')
        
        self.fixes_applied.append("Criado google-callback-debugger.js")
        self.log("Debugger criado: secure/google-callback-debugger.js", 'SUCCESS')

    def add_debugger_to_callback(self):
        """Adiciona debugger ao callback.html"""
        self.log("Adicionando debugger ao callback.html...", 'FIX')
        
        callback_html = self.workspace_dir / "secure" / "callback.html"
        
        try:
            content = callback_html.read_text(encoding='utf-8')
            
            # Verifica se debugger já foi adicionado
            if 'google-callback-debugger.js' in content:
                self.log("Debugger já presente no callback.html", 'INFO')
                return
            
            # Adiciona script antes do auth-standalone.js
            debug_script_tag = '  <script defer src="/secure/google-callback-debugger.js?v=20251011"></script>\n'
            
            # Procura posição para inserir (antes do auth-standalone.js)
            auth_script_pos = content.find('auth-standalone.js')
            if auth_script_pos == -1:
                self.log("auth-standalone.js não encontrado no callback.html", 'ERROR')
                return
            
            # Encontra início da linha
            line_start = content.rfind('\n', 0, auth_script_pos) + 1
            
            # Insere debugger
            new_content = content[:line_start] + debug_script_tag + content[line_start:]
            
            callback_html.write_text(new_content, encoding='utf-8')
            self.fixes_applied.append("Adicionado debugger ao callback.html")
            self.log("Debugger adicionado ao callback.html", 'SUCCESS')
            
        except Exception as e:
            self.log(f"Erro adicionando debugger: {e}", 'ERROR')

    def create_manual_recovery_script(self):
        """Cria script de recuperação manual"""
        self.log("Criando script de recuperação manual...", 'FIX')
        
        recovery_script = '''#!/usr/bin/env python3
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
    
    print("\\n2. 🌐 Ou abra diretamente a área restrita:")
    choice = input("Abrir área restrita agora? (s/n): ")
    
    if choice.lower() in ['s', 'sim', 'y', 'yes']:
        webbrowser.open('https://www.caracore.com.br/secure/restrita.html')
        print("✅ Área restrita aberta no navegador")
    
    print("\\n💡 Para evitar problemas futuros:")
    print("   - Limpe cache do navegador")
    print("   - Verifique console para erros JavaScript")
    print("   - Execute: python scripts/diagnosticar_google_callback.py")

if __name__ == "__main__":
    main()
'''
        
        recovery_file = self.workspace_dir / "scripts" / "recovery_google_callback.py"
        recovery_file.write_text(recovery_script, encoding='utf-8')
        
        self.fixes_applied.append("Criado recovery_google_callback.py")
        self.log("Script de recuperação criado", 'SUCCESS')

    def run_fixes(self):
        """Executa todas as correções"""
        print("🔧 CORRIGINDO PROBLEMAS DO GOOGLE CALLBACK")
        print("=" * 45)
        print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print()
        
        # Executa verificações
        self.check_auth_standalone_loading()
        self.check_google_config_completeness()
        
        # Executa correções
        self.fix_callback_timeout_handling()
        self.create_google_callback_debugger()
        self.add_debugger_to_callback()
        self.create_manual_recovery_script()
        
        # Relatório final
        print("\n" + "=" * 45)
        print("📊 RELATÓRIO DE CORREÇÕES")
        print("=" * 45)
        
        if self.issues_found:
            print("⚠️ PROBLEMAS ENCONTRADOS:")
            for issue in self.issues_found:
                print(f"   • {issue}")
            print()
        
        if self.fixes_applied:
            print("✅ CORREÇÕES APLICADAS:")
            for fix in self.fixes_applied:
                print(f"   • {fix}")
            print()
        
        print("🎯 PRÓXIMOS PASSOS:")
        print("1. Teste login Google novamente")
        print("2. Se ainda falhar, abra Console (F12) para ver debugs")
        print("3. Execute: python scripts/recovery_google_callback.py")
        print("4. Verifique Network tab para erros de rede")

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Correção Google OAuth Callback")
    parser.add_argument('--action', choices=['diagnose', 'fix', 'test'], default='fix',
                       help='Ação a executar')
    
    args = parser.parse_args()
    
    fixer = GoogleCallbackFixer()
    
    if args.action == 'fix':
        fixer.run_fixes()
    elif args.action == 'diagnose':
        fixer.check_auth_standalone_loading()
        fixer.check_google_config_completeness()
    
    return 0

if __name__ == "__main__":
    exit(main())
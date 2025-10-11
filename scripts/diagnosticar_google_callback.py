#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
diagnosticar_google_callback.py - Diagnóstico Google OAuth Callback

Script para diagnosticar problemas no callback do Google OAuth.
Analisa URL de callback, logs e configurações do Google.

Erro reportado:
- URL callback recebida com code
- Fica travado em "Validando credenciais"
- Não redireciona para restrita.html

Uso:
    python diagnosticar_google_callback.py [--callback-url URL]
"""

import re
import json
from pathlib import Path
from urllib.parse import urlparse, parse_qs, unquote
from datetime import datetime

class GoogleCallbackDiagnostic:
    def __init__(self):
        self.workspace_dir = Path(__file__).parent.parent
        self.callback_url = None
        self.parsed_callback = {}
        self.config_data = {}
        self.diagnostics = {
            'timestamp': datetime.now().isoformat(),
            'callback_analysis': {},
            'config_analysis': {},
            'potential_issues': [],
            'recommendations': []
        }

    def analyze_callback_url(self, url: str):
        """Analisa URL de callback do Google"""
        print("🔍 ANALISANDO URL DE CALLBACK")
        print("=" * 35)
        
        self.callback_url = url
        parsed = urlparse(url)
        query_params = parse_qs(parsed.query)
        
        # Extrai parâmetros importantes
        callback_data = {
            'domain': f"{parsed.scheme}://{parsed.netloc}",
            'path': parsed.path,
            'state': query_params.get('state', [None])[0],
            'code': query_params.get('code', [None])[0],
            'scope': query_params.get('scope', [None])[0],
            'authuser': query_params.get('authuser', [None])[0],
            'prompt': query_params.get('prompt', [None])[0]
        }
        
        # Decodifica code se necessário
        if callback_data['code']:
            callback_data['code_decoded'] = unquote(callback_data['code'])
            callback_data['code_length'] = len(callback_data['code_decoded'])
        
        # Decodifica scope
        if callback_data['scope']:
            scopes = unquote(callback_data['scope']).split(' ')
            callback_data['scopes_decoded'] = scopes
            callback_data['scopes_count'] = len(scopes)
        
        self.parsed_callback = callback_data
        self.diagnostics['callback_analysis'] = callback_data
        
        # Exibe análise
        print(f"🌐 Domínio: {callback_data['domain']}")
        print(f"📍 Path: {callback_data['path']}")
        print(f"🔑 State: {callback_data['state'][:20]}..." if callback_data['state'] else "❌ State: None")
        print(f"📨 Code: {'✅ Presente' if callback_data['code'] else '❌ Ausente'}")
        
        if callback_data['code']:
            print(f"   📏 Tamanho: {callback_data['code_length']} chars")
        
        if callback_data['scopes_decoded']:
            print(f"🔐 Scopes ({callback_data['scopes_count']}):")
            for scope in callback_data['scopes_decoded']:
                print(f"   ✅ {scope}")
        
        print(f"👤 Auth User: {callback_data['authuser']}")
        print(f"❓ Prompt: {callback_data['prompt']}")

    def read_google_config(self):
        """Lê configurações do Google"""
        print("\n📋 ANALISANDO CONFIGURAÇÃO GOOGLE")
        print("=" * 40)
        
        # Lê config.js principal
        config_js = self.workspace_dir / "js" / "config.js"
        google_config = {}
        
        if config_js.exists():
            try:
                content = config_js.read_text(encoding='utf-8')
                
                # Extrai configuração do Google
                google_match = re.search(r'google:\s*{([^}]+)}', content, re.DOTALL)
                if google_match:
                    google_block = google_match.group(1)
                    
                    # Extrai valores específicos
                    client_id = re.search(r'clientId:\s*["\']([^"\']+)', google_block)
                    redirect_uri = re.search(r'redirectUri:\s*([^,\n]+)', google_block)
                    scope = re.search(r'scope:\s*["\']([^"\']+)', google_block)
                    
                    google_config = {
                        'clientId': client_id.group(1) if client_id else 'NÃO ENCONTRADO',
                        'redirectUri_code': redirect_uri.group(1).strip() if redirect_uri else 'NÃO ENCONTRADO',
                        'scope': scope.group(1) if scope else 'NÃO ENCONTRADO',
                        'file_found': True
                    }
                    
                    print(f"✅ config.js encontrado")
                    print(f"🔑 Client ID: {google_config['clientId']}")
                    print(f"🔄 Redirect URI: {google_config['redirectUri_code']}")
                    print(f"🔐 Scope: {google_config['scope']}")
                else:
                    print("❌ Configuração Google não encontrada em config.js")
                    google_config['file_found'] = False
                    
            except Exception as e:
                print(f"❌ Erro lendo config.js: {e}")
                google_config['error'] = str(e)
        else:
            print("❌ Arquivo config.js não encontrado")
        
        self.config_data['google'] = google_config
        self.diagnostics['config_analysis']['google'] = google_config

    def check_google_cloud_console(self):
        """Verifica configurações necessárias no Google Cloud Console"""
        print("\n☁️ VERIFICAÇÕES GOOGLE CLOUD CONSOLE")
        print("=" * 45)
        
        if 'google' in self.config_data:
            client_id = self.config_data['google'].get('clientId', '')
            
            print(f"🔍 Client ID: {client_id}")
            
            # URLs que devem estar registradas
            required_uris = [
                "https://www.caracore.com.br/secure/callback.html",
                "https://caracore.com.br/secure/callback.html",
                "http://localhost:8000/secure/callback.html"
            ]
            
            print("\n📋 URIs que DEVEM estar registradas no Google Cloud Console:")
            for uri in required_uris:
                print(f"   ✅ {uri}")
            
            print(f"\n🌐 Para verificar/corrigir:")
            print(f"1. Acesse: https://console.cloud.google.com/")
            print(f"2. APIs & Services → Credentials")
            print(f"3. OAuth 2.0 Client IDs → Busque: {client_id}")
            print(f"4. Authorized redirect URIs → Verifique se todas as URIs acima estão listadas")

    def analyze_potential_issues(self):
        """Analisa possíveis problemas"""
        print("\n🚨 ANÁLISE DE PROBLEMAS POTENCIAIS")
        print("=" * 40)
        
        issues = []
        recommendations = []
        
        # Verifica se recebeu code
        if not self.parsed_callback.get('code'):
            issues.append("❌ CRÍTICO: Nenhum authorization code recebido")
            recommendations.append("Verificar redirect URIs no Google Cloud Console")
        else:
            print("✅ Authorization code recebido com sucesso")
        
        # Verifica state
        if not self.parsed_callback.get('state'):
            issues.append("⚠️ AVISO: Parâmetro state ausente (possível problema de segurança)")
        else:
            print("✅ Parâmetro state presente")
        
        # Verifica scopes
        expected_scopes = ['openid', 'profile', 'email']
        received_scopes = self.parsed_callback.get('scopes_decoded', [])
        
        for expected in expected_scopes:
            if not any(expected in scope for scope in received_scopes):
                issues.append(f"⚠️ SCOPE: '{expected}' pode estar faltando")
        
        if received_scopes:
            print(f"✅ Scopes recebidos: {len(received_scopes)}")
        
        # Verifica configuração
        google_config = self.config_data.get('google', {})
        if not google_config.get('file_found', False):
            issues.append("❌ CONFIG: Configuração Google não encontrada")
            recommendations.append("Verificar js/config.js - seção google")
        
        # Problema específico: fica travado em callback
        issues.append("🔄 PROBLEMA ATUAL: Fica travado em 'Validando credenciais'")
        recommendations.extend([
            "Verificar console do navegador para erros JavaScript",
            "Verificar se auth-standalone.js está carregando corretamente",
            "Verificar se há erro de CORS ao trocar code por token",
            "Verificar logs de rede (Network tab) para chamadas falhando"
        ])
        
        self.diagnostics['potential_issues'] = issues
        self.diagnostics['recommendations'] = recommendations
        
        # Exibe problemas
        if issues:
            print("\n🚨 PROBLEMAS IDENTIFICADOS:")
            for issue in issues:
                print(f"   {issue}")
        
        # Exibe recomendações
        if recommendations:
            print("\n💡 RECOMENDAÇÕES:")
            for i, rec in enumerate(recommendations, 1):
                print(f"   {i}. {rec}")

    def generate_debug_script(self):
        """Gera script de debug para o navegador"""
        print("\n🛠️ SCRIPT DE DEBUG PARA NAVEGADOR")
        print("=" * 40)
        
        debug_script = '''
// Cole este script no Console do navegador na página de callback
(function() {
    console.log("🔍 DIAGNÓSTICO GOOGLE CALLBACK");
    console.log("================================");
    
    // Analisa URL atual
    const url = window.location.href;
    const params = new URLSearchParams(window.location.search);
    
    console.log("📍 URL atual:", url);
    console.log("🔑 Parâmetros:");
    params.forEach((value, key) => {
        console.log(`   ${key}:`, value);
    });
    
    // Verifica se window.OIDCAuth existe
    console.log("\\n🔧 VERIFICANDO OIDC AUTH:");
    console.log("window.OIDCAuth existe:", typeof window.OIDCAuth);
    
    if (window.OIDCAuth) {
        console.log("Métodos disponíveis:", Object.keys(window.OIDCAuth));
        console.log("Provider atual:", window.OIDCAuth.getLastUsedProvider?.());
    }
    
    // Verifica erros de console
    console.log("\\n📋 STORAGE:");
    try {
        console.log("localStorage cara_core_oidc_provider:", localStorage.getItem('cara_core_oidc_provider'));
        console.log("sessionStorage cara_core_oidc_provider:", sessionStorage.getItem('cara_core_oidc_provider'));
    } catch(e) {
        console.log("Erro acessando storage:", e);
    }
    
    // Tenta reprocessar callback manualmente
    console.log("\\n🔄 TENTANDO REPROCESSAR CALLBACK:");
    if (window.OIDCAuth && window.OIDCAuth.handleAuthCallback) {
        window.OIDCAuth.handleAuthCallback()
            .then(() => {
                console.log("✅ Callback processado com sucesso!");
                console.log("Redirecionando para restrita.html...");
                window.location.href = '/secure/restrita.html';
            })
            .catch(err => {
                console.error("❌ Erro no callback:", err);
                console.log("Detalhes do erro:", {
                    name: err.name,
                    message: err.message,
                    stack: err.stack
                });
            });
    } else {
        console.log("❌ window.OIDCAuth.handleAuthCallback não disponível");
    }
})();
'''
        
        print("Cole este script no Console do navegador (F12):")
        print("-" * 50)
        print(debug_script)
        print("-" * 50)

    def run_diagnostic(self, callback_url: str = None):
        """Executa diagnóstico completo"""
        print("🔍 DIAGNÓSTICO GOOGLE OAUTH CALLBACK")
        print("=" * 50)
        print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # URL de exemplo se não fornecida
        if not callback_url:
            callback_url = "https://www.caracore.com.br/secure/callback.html?state=6ded8bce70b04e30a28e735fc7fe382c&code=4%2F0AVGzR1A7z7PZWkSGjj7J_vokdFDV1nz861u6BUCpfLd2lHdXw5J0U5I2NY45096LoJq5Sw&scope=email+profile+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+openid+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile&authuser=0&prompt=none"
        
        # Executa análises
        self.analyze_callback_url(callback_url)
        self.read_google_config()
        self.check_google_cloud_console()
        self.analyze_potential_issues()
        self.generate_debug_script()
        
        print("\n" + "=" * 50)
        print("📊 RESUMO:")
        print(f"✅ Authorization code: {'Presente' if self.parsed_callback.get('code') else 'Ausente'}")
        print(f"✅ State parameter: {'Presente' if self.parsed_callback.get('state') else 'Ausente'}")
        print(f"✅ Configuração Google: {'OK' if self.config_data.get('google', {}).get('file_found') else 'Problema'}")
        print(f"⚠️ Problemas identificados: {len(self.diagnostics['potential_issues'])}")

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Diagnóstico Google OAuth Callback")
    parser.add_argument('--callback-url', help='URL de callback para analisar')
    
    args = parser.parse_args()
    
    diagnostic = GoogleCallbackDiagnostic()
    diagnostic.run_diagnostic(args.callback_url)
    
    return 0

if __name__ == "__main__":
    exit(main())
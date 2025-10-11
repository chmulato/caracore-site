#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
corrigir_redirect_uri_entra.py - Corretor de Redirect URIs para Entra ID

Este script verifica e fornece instruções para corrigir o erro de redirect_uri
no Azure App Registration para o portal Cara-Core.

Erro atual:
"The provided value for the input parameter 'redirect_uri' is not valid"

Uso:
    python corrigir_redirect_uri_entra.py [opções]

Opções:
    --check      Verifica configurações atuais
    --fix        Gera instruções de correção
    --validate   Valida URIs após correção
    --verbose    Logs detalhados
    --help       Mostra esta ajuda
"""

import json
import re
from pathlib import Path
from urllib.parse import urlparse, unquote
from datetime import datetime

class EntraRedirectURIFixer:
    def __init__(self, verbose: bool = False):
        self.verbose = verbose
        self.workspace_dir = Path(__file__).parent.parent
        self.config_js = self.workspace_dir / "js" / "config.js"
        self.entra_json = self.workspace_dir / "secure" / "config" / "entra.json"
        
        # URLs conhecidas do ambiente
        self.known_domains = [
            "https://www.caracore.com.br",
            "https://caracore.com.br", 
            "http://localhost:8000",
            "http://localhost:8080",
            "http://127.0.0.1:8000",
            "http://127.0.0.1:8080"
        ]
        
        # Cliente ID do App Registration
        self.client_id = "***AZURE_SECRET_REDACTED***"
        
        self.results = {
            'timestamp': datetime.now().isoformat(),
            'error_analysis': {},
            'current_config': {},
            'required_uris': [],
            'azure_instructions': [],
            'validation_tests': []
        }

    def log(self, message: str, level: str = 'INFO'):
        """Log com timestamp se verbose ativo"""
        if self.verbose or level in ['ERROR', 'WARNING']:
            timestamp = datetime.now().strftime('%H:%M:%S')
            print(f"[{timestamp}] {level}: {message}")

    def analyze_error_url(self, error_url: str):
        """Analisa a URL que gerou o erro"""
        self.log("Analisando URL do erro...")
        
        # Extrai parâmetros da URL
        params = {}
        if 'redirect_uri=' in error_url:
            redirect_param = error_url.split('redirect_uri=')[1].split('&')[0]
            redirect_uri = unquote(redirect_param)
            params['redirect_uri'] = redirect_uri
        
        if 'client_id=' in error_url:
            client_param = error_url.split('client_id=')[1].split('&')[0]
            params['client_id'] = client_param
        
        # Analisa o domínio
        if 'redirect_uri' in params:
            parsed = urlparse(params['redirect_uri'])
            params['domain'] = f"{parsed.scheme}://{parsed.netloc}"
            params['path'] = parsed.path
        
        self.results['error_analysis'] = {
            'error_url': error_url,
            'extracted_params': params,
            'issue': 'redirect_uri not registered in Azure App Registration',
            'failed_uri': params.get('redirect_uri', 'Not found')
        }
        
        return params

    def read_current_config(self):
        """Lê configurações atuais"""
        self.log("Lendo configurações atuais...")
        
        config = {
            'config_js': {},
            'entra_json': {},
            'files_found': {}
        }
        
        # Lê config.js
        if self.config_js.exists():
            try:
                content = self.config_js.read_text(encoding='utf-8')
                
                # Extrai configuração do Azure
                azure_match = re.search(r'azure:\s*{([^}]+)}', content, re.DOTALL)
                if azure_match:
                    azure_config = azure_match.group(1)
                    
                    # Extrai valores
                    client_id = re.search(r'clientId:\s*["\']([^"\']+)', azure_config)
                    authority = re.search(r'authority:\s*["\']([^"\']+)', azure_config)
                    redirect_uri = re.search(r'redirectUri:\s*([^,\n]+)', azure_config)
                    
                    config['config_js'] = {
                        'clientId': client_id.group(1) if client_id else None,
                        'authority': authority.group(1) if authority else None,
                        'redirectUri_code': redirect_uri.group(1).strip() if redirect_uri else None,
                        'redirectUri_resolved': 'window.location.origin + "/secure/callback.html"'
                    }
                
                config['files_found']['config_js'] = True
                
            except Exception as e:
                self.log(f"Erro lendo config.js: {e}", 'ERROR')
                config['files_found']['config_js'] = False
        
        # Lê entra.json
        if self.entra_json.exists():
            try:
                with open(self.entra_json, 'r', encoding='utf-8') as f:
                    entra_data = json.load(f)
                    config['entra_json'] = entra_data
                config['files_found']['entra_json'] = True
                
            except Exception as e:
                self.log(f"Erro lendo entra.json: {e}", 'ERROR')
                config['files_found']['entra_json'] = False
        
        self.results['current_config'] = config
        return config

    def generate_required_uris(self):
        """Gera lista de URIs que devem ser registrados"""
        self.log("Gerando lista de URIs necessários...")
        
        required_uris = []
        
        # URIs para cada domínio conhecido
        for domain in self.known_domains:
            required_uris.extend([
                f"{domain}/secure/callback.html",
                f"{domain}/secure/logout.html"
            ])
        
        # Remove duplicatas
        required_uris = list(set(required_uris))
        
        # Categoriza por ambiente
        categorized = {
            'production': [uri for uri in required_uris if 'caracore.com.br' in uri],
            'development': [uri for uri in required_uris if 'localhost' in uri or '127.0.0.1' in uri]
        }
        
        self.results['required_uris'] = {
            'all': required_uris,
            'categorized': categorized,
            'total_count': len(required_uris)
        }
        
        return required_uris

    def generate_azure_instructions(self):
        """Gera instruções detalhadas para Azure Portal"""
        self.log("Gerando instruções para Azure Portal...")
        
        instructions = [
            "🔧 INSTRUÇÕES PARA CORRIGIR NO AZURE PORTAL",
            "=" * 50,
            "",
            "1. 🌐 Acesse o Azure Portal:",
            "   https://portal.azure.com",
            "",
            "2. 📱 Navegue até App Registrations:",
            "   Portal → Azure Active Directory → App registrations",
            "",
            f"3. 🔍 Procure pela aplicação com Client ID:",
            f"   {self.client_id}",
            "",
            "4. ⚙️ Entre em Authentication:",
            "   App Registration → Authentication (menu lateral)",
            "",
            "5. ➕ Na seção 'Redirect URIs', adicione TODAS as URIs:",
            ""
        ]
        
        # Adiciona URIs categorizadas
        production_uris = self.results['required_uris']['categorized']['production']
        development_uris = self.results['required_uris']['categorized']['development']
        
        instructions.extend([
            "   📍 PRODUÇÃO (obrigatórias):",
            *[f"   ✅ {uri}" for uri in production_uris],
            "",
            "   🔧 DESENVOLVIMENTO (recomendadas):",
            *[f"   ✅ {uri}" for uri in development_uris],
            "",
            "6. � CRÍTICO - Configure Front-channel logout URL:",
            "   Role para baixo na mesma página até encontrar:",
            "   'Front-channel logout URL'",
            "   ✅ https://www.caracore.com.br/secure/logout.html",
            "   ⚠️ Essencial para Single Sign-Out funcionar!",
            "",
            "7. �💾 Clique em 'Save' para salvar as alterações",
            "",
            "8. ⏳ Aguarde alguns minutos para propagação",
            "",
            "9. ✅ Teste o login E logout novamente",
            "",
            "⚠️ IMPORTANTE:",
            "- As URIs são case-sensitive",
            "- Incluir TODAS as variações (www e sem www)",
            "- Front-channel logout URL é obrigatório para SSO",
            "- Testar em ambiente dev antes de produção"
        ])
        
        self.results['azure_instructions'] = instructions
        return instructions

    def create_validation_tests(self):
        """Cria testes de validação"""
        self.log("Criando testes de validação...")
        
        tests = []
        
        # Testa URLs de produção
        prod_uris = self.results['required_uris']['categorized']['production']
        for uri in prod_uris:
            tests.append({
                'type': 'production',
                'description': f"Teste de login com redirect para {uri}",
                'test_url': f"https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize?client_id={self.client_id}&redirect_uri={uri}&response_type=code&scope=openid profile email",
                'expected': "Deve redirecionar sem erro de redirect_uri",
                'priority': 'critical'
            })
        
        # Testa URLs de desenvolvimento
        dev_uris = self.results['required_uris']['categorized']['development']
        for uri in dev_uris:
            tests.append({
                'type': 'development',
                'description': f"Teste local com redirect para {uri}",
                'test_url': f"https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize?client_id={self.client_id}&redirect_uri={uri}&response_type=code&scope=openid profile email",
                'expected': "Deve redirecionar sem erro de redirect_uri",
                'priority': 'medium'
            })
        
        self.results['validation_tests'] = tests
        return tests

    def check_configuration(self):
        """Verifica configuração atual"""
        self.log("Verificando configuração atual...")
        
        config = self.read_current_config()
        
        print("📋 CONFIGURAÇÃO ATUAL")
        print("=" * 30)
        
        # Config.js
        if config['files_found']['config_js']:
            print("✅ js/config.js encontrado:")
            js_config = config['config_js']
            print(f"   Client ID: {js_config.get('clientId', 'N/A')}")
            print(f"   Authority: {js_config.get('authority', 'N/A')}")
            print(f"   Redirect URI: {js_config.get('redirectUri_resolved', 'N/A')}")
        else:
            print("❌ js/config.js não encontrado")
        
        print()
        
        # Entra.json
        if config['files_found']['entra_json']:
            print("✅ secure/config/entra.json encontrado:")
            entra_config = config['entra_json']
            print(f"   Client ID: {entra_config.get('client_id', 'N/A')}")
            print(f"   Authority: {entra_config.get('authority', 'N/A')}")
            print(f"   Redirect URI: {entra_config.get('redirect_uri', 'N/A')}")
        else:
            print("❌ secure/config/entra.json não encontrado")

    def fix_configuration(self):
        """Gera instruções completas de correção"""
        # Analisa erro (URL de exemplo)
        error_url = "https://login.live.com/oauth20_authorize.srf?redirect_uri=https%3a%2f%2fwww.caracore.com.br%2fsecure%2fcallback.html"
        self.analyze_error_url(error_url)
        
        # Lê configurações
        self.read_current_config()
        
        # Gera URIs necessários
        self.generate_required_uris()
        
        # Gera instruções
        instructions = self.generate_azure_instructions()
        
        # Cria testes
        self.create_validation_tests()
        
        # Exibe instruções
        for instruction in instructions:
            print(instruction)
        
        print("\n" + "=" * 50)
        print("📊 RESUMO:")
        print(f"URIs a registrar: {self.results['required_uris']['total_count']}")
        print(f"Testes de validação: {len(self.results['validation_tests'])}")
        print("Status: Aguardando correção no Azure Portal")

    def validate_after_fix(self):
        """Valida configuração após correção"""
        self.log("Validando configuração após correção...")
        
        # Recria testes
        self.create_validation_tests()
        
        print("🧪 TESTES DE VALIDAÇÃO")
        print("=" * 30)
        print("Execute estes testes após registrar as URIs no Azure:")
        print()
        
        critical_tests = [t for t in self.results['validation_tests'] if t['priority'] == 'critical']
        
        for i, test in enumerate(critical_tests[:3], 1):  # Primeiros 3 testes críticos
            print(f"{i}. {test['description']}")
            print(f"   URL: {test['test_url']}")
            print(f"   Esperado: {test['expected']}")
            print()
        
        print("💡 Como testar:")
        print("1. Cole uma URL acima no navegador")
        print("2. Se não aparecer erro de redirect_uri = ✅ Sucesso")
        print("3. Se ainda aparecer erro = ❌ URI não registrada")

def main():
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Corretor de Redirect URIs para Entra ID"
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="Verifica configurações atuais"
    )
    parser.add_argument(
        "--fix",
        action="store_true",
        help="Gera instruções de correção"
    )
    parser.add_argument(
        "--validate",
        action="store_true",
        help="Valida URIs após correção"
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Logs detalhados"
    )
    
    args = parser.parse_args()
    
    if not any([args.check, args.fix, args.validate]):
        args.fix = True  # Padrão
    
    fixer = EntraRedirectURIFixer(verbose=args.verbose)
    
    if args.check:
        fixer.check_configuration()
    
    if args.fix:
        fixer.fix_configuration()
    
    if args.validate:
        fixer.validate_after_fix()
    
    return 0

if __name__ == "__main__":
    exit(main())
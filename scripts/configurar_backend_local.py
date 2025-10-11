#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
configurar_backend_local.py - Configuração Backend Local

Script para configurar e testar o backend localmente para resolver
o problema do Google OAuth callback.

Problema identificado:
- Backend não está rodando em produção
- Endpoints /health e /oauth/google/token retornando 404/405
- Google OAuth precisa do backend para trocar code por token

Uso:
    python configurar_backend_local.py [--action config|test|run]
"""

import os
import subprocess
import requests
import time
from pathlib import Path
from datetime import datetime

class BackendLocalConfigurator:
    def __init__(self):
        self.workspace_dir = Path(__file__).parent.parent
        self.backend_dir = self.workspace_dir / "backend"
        self.env_file = self.backend_dir / ".env"
        self.env_example = self.backend_dir / ".env.example"
        self.local_url = "http://localhost:5051"

    def log(self, message: str, level: str = 'INFO'):
        """Log com timestamp"""
        timestamp = datetime.now().strftime('%H:%M:%S')
        icons = {'INFO': '📝', 'SUCCESS': '✅', 'ERROR': '❌', 'WARNING': '⚠️', 'CONFIG': '⚙️'}
        print(f"[{timestamp}] {icons.get(level, '📝')} {message}")

    def check_backend_requirements(self):
        """Verifica se o backend pode ser executado"""
        self.log("Verificando requisitos do backend...", 'INFO')
        
        # Verifica se app.py existe
        app_py = self.backend_dir / "app.py"
        if not app_py.exists():
            self.log("app.py não encontrado no diretório backend", 'ERROR')
            return False
        
        # Verifica se Flask está disponível
        try:
            import flask
            self.log(f"Flask disponível: versão {flask.__version__}", 'SUCCESS')
        except ImportError:
            self.log("Flask não está instalado", 'ERROR')
            return False
        
        # Verifica outras dependências
        try:
            import requests
            import authlib
            self.log("Dependências básicas disponíveis", 'SUCCESS')
        except ImportError as e:
            self.log(f"Dependência faltando: {e}", 'ERROR')
            return False
        
        return True

    def create_local_env_config(self):
        """Cria configuração .env para execução local"""
        self.log("Criando configuração .env local...", 'CONFIG')
        
        # Configuração mínima para teste local
        env_config = """# Configuração local para teste do backend
# Google OAuth
GOOGLE_CLIENT_ID=1023942712021-7k4aalpg2oeenhisln9tk9s15m26iruu.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
OAUTH_REDIRECT_URI=http://localhost:8000/secure/callback.html

# Flask
APP_SECRET_KEY=local-development-secret-key-change-in-production
PORT=5051

# CORS
ORIGIN_ALLOWED=http://localhost:8000

# Admin
ADMIN_EMAIL=admin@caracore.com.br

# Logging
LOG_RETENTION_DAYS=7
"""
        
        try:
            self.env_file.write_text(env_config, encoding='utf-8')
            self.log("Arquivo .env criado com configuração local", 'SUCCESS')
            return True
        except Exception as e:
            self.log(f"Erro criando .env: {e}", 'ERROR')
            return False

    def check_google_client_secret(self):
        """Verifica se GOOGLE_CLIENT_SECRET está configurado"""
        self.log("Verificando GOOGLE_CLIENT_SECRET...", 'INFO')
        
        if not self.env_file.exists():
            self.log(".env não existe - criando configuração básica", 'WARNING')
            return False
        
        try:
            content = self.env_file.read_text(encoding='utf-8')
            
            if 'GOOGLE_CLIENT_SECRET=your-google-client-secret-here' in content:
                self.log("GOOGLE_CLIENT_SECRET precisa ser configurado", 'WARNING')
                return False
            elif 'GOOGLE_CLIENT_SECRET=' in content:
                self.log("GOOGLE_CLIENT_SECRET configurado", 'SUCCESS')
                return True
            else:
                self.log("GOOGLE_CLIENT_SECRET não encontrado no .env", 'WARNING')
                return False
                
        except Exception as e:
            self.log(f"Erro lendo .env: {e}", 'ERROR')
            return False

    def show_google_secret_instructions(self):
        """Mostra instruções para obter Google Client Secret"""
        print("\n🔑 CONFIGURAÇÃO GOOGLE CLIENT SECRET")
        print("=" * 45)
        
        print("Para obter o GOOGLE_CLIENT_SECRET:")
        print("1. 🌐 Acesse: https://console.cloud.google.com/")
        print("2. 📁 Vá para: APIs & Services → Credentials")
        print("3. 🔍 Busque: OAuth 2.0 Client IDs")
        print("4. 📋 Client ID: 1023942712021-7k4aalpg2oeenhisln9tk9s15m26iruu.apps.googleusercontent.com")
        print("5. 👁️ Clique no ícone de 'olho' para ver o Client Secret")
        print("6. 📝 Copie o Client Secret")
        print("7. ✏️ Edite backend/.env e substitua 'your-google-client-secret-here'")
        print()
        print("⚠️ IMPORTANTE: Nunca commite o Client Secret no Git!")

    def test_backend_locally(self):
        """Testa se o backend está rodando localmente"""
        self.log("Testando backend local...", 'INFO')
        
        try:
            # Testa health endpoint
            response = requests.get(f"{self.local_url}/health", timeout=5)
            
            if response.status_code == 200:
                self.log("Backend local: FUNCIONANDO", 'SUCCESS')
                self.log(f"Health response: {response.text}", 'INFO')
                return True
            else:
                self.log(f"Backend local: Status {response.status_code}", 'WARNING')
                return False
                
        except requests.exceptions.ConnectionError:
            self.log("Backend local: NÃO ESTÁ RODANDO", 'WARNING')
            return False
        except Exception as e:
            self.log(f"Erro testando backend: {e}", 'ERROR')
            return False

    def run_backend_locally(self):
        """Executa o backend localmente"""
        self.log("Preparando para executar backend localmente...", 'INFO')
        
        if not self.check_backend_requirements():
            self.log("Requisitos não atendidos", 'ERROR')
            return False
        
        if not self.env_file.exists():
            self.create_local_env_config()
        
        if not self.check_google_client_secret():
            self.show_google_secret_instructions()
            self.log("Configure GOOGLE_CLIENT_SECRET antes de continuar", 'ERROR')
            return False
        
        self.log("Iniciando backend local...", 'INFO')
        
        try:
            # Muda para diretório backend
            os.chdir(self.backend_dir)
            
            # Executa app.py
            print("\n" + "="*50)
            print("🚀 EXECUTANDO BACKEND LOCAL")
            print("="*50)
            print("📍 URL: http://localhost:5051")
            print("❤️ Health: http://localhost:5051/health")
            print("🔑 Google OAuth: http://localhost:5051/oauth/google/token")
            print("🛑 Para parar: Ctrl+C")
            print("="*50)
            
            # Executa em subprocess para manter no foreground
            subprocess.run(["python", "app.py"], check=True)
            
        except KeyboardInterrupt:
            self.log("Backend interrompido pelo usuário", 'INFO')
        except subprocess.CalledProcessError as e:
            self.log(f"Erro executando backend: {e}", 'ERROR')
        except Exception as e:
            self.log(f"Erro inesperado: {e}", 'ERROR')

    def create_frontend_local_config(self):
        """Cria configuração frontend para usar backend local"""
        self.log("Criando configuração frontend para backend local...", 'CONFIG')
        
        local_config = """// Configuração para desenvolvimento local com backend local
// Este arquivo sobrescreve config.js quando carregado
window.CARA_CORE_CONFIG_OVERRIDE = {
    provider: 'google',
    oidc: {
        clientId: "1023942712021-7k4aalpg2oeenhisln9tk9s15m26iruu.apps.googleusercontent.com",
        authority: "https://accounts.google.com",
        redirectUri: "http://localhost:8000/secure/callback.html",
        postLogoutRedirectUri: "http://localhost:8000/secure/logout.html",
        cacheLocation: "sessionStorage",
        scopes: ["openid", "profile", "email"],
        tokenEndpoint: "http://localhost:5051/oauth/google/token"  // Backend local
    },
    googleTokenEndpoint: 'http://localhost:5051/oauth/google/token',
    environment: 'dev'
};

console.log('🔧 CONFIG LOCAL: Backend local configurado para Google OAuth');
"""
        
        try:
            config_local = self.workspace_dir / "js" / "config-local.js"
            config_local.write_text(local_config, encoding='utf-8')
            self.log("Configuração frontend local criada: js/config-local.js", 'SUCCESS')
            return True
        except Exception as e:
            self.log(f"Erro criando config local: {e}", 'ERROR')
            return False

    def show_usage_instructions(self):
        """Mostra instruções de uso"""
        print("\n📖 INSTRUÇÕES DE USO")
        print("=" * 25)
        
        print("\n🔧 Para testar localmente:")
        print("1. Configure GOOGLE_CLIENT_SECRET em backend/.env")
        print("2. Execute: python configurar_backend_local.py --action run")
        print("3. Em outro terminal, execute o frontend local:")
        print("   cd .. && python -m http.server 8000")
        print("4. Acesse: http://localhost:8000/secure/")
        print("5. Inclua js/config-local.js no HTML para usar backend local")
        
        print("\n🌐 Para produção:")
        print("1. Configure backend em servidor")
        print("2. Configure variáveis de ambiente corretas")
        print("3. Aponte tokenEndpoint para URL de produção")

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Configuração Backend Local")
    parser.add_argument('--action', choices=['config', 'test', 'run'], default='config',
                       help='Ação a executar')
    
    args = parser.parse_args()
    
    configurator = BackendLocalConfigurator()
    
    print("🔧 CONFIGURADOR BACKEND LOCAL")
    print("=" * 35)
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    if args.action == 'config':
        # Configura ambiente local
        configurator.create_local_env_config()
        configurator.create_frontend_local_config()
        configurator.show_google_secret_instructions()
        configurator.show_usage_instructions()
        
    elif args.action == 'test':
        # Testa backend local
        if configurator.test_backend_locally():
            print("✅ Backend local funcionando!")
        else:
            print("❌ Backend local não está rodando")
            print("Execute: python configurar_backend_local.py --action run")
            
    elif args.action == 'run':
        # Executa backend local
        configurator.run_backend_locally()
    
    return 0

if __name__ == "__main__":
    exit(main())
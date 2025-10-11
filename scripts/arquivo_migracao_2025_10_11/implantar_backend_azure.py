#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
implantar_backend_azure.py - Implantação Backend Azure

Script para implantar o backend Python Flask no Azure App Service
usando Azure CLI e configurar variáveis de ambiente.

Requisitos:
- az login executado
- Backend em backend/ pronto para deploy

Uso:
    python implantar_backend_azure.py
"""

import os
import subprocess
import json
import zipfile
from pathlib import Path
from datetime import datetime
import shutil

class AzureBackendDeployer:
    def __init__(self):
        self.workspace_dir = Path(__file__).parent.parent
        self.backend_dir = self.workspace_dir / "backend"
        self.deploy_dir = self.workspace_dir / "deploy_temp"
        
        # Configurações do Azure
        self.resource_group = "rg-caracore"
        self.app_name = "caracore-backend"
        self.location = "East US"
        self.plan_name = "caracore-plan"
        
        # Configurações da aplicação
        self.google_client_id = "1023942712021-7k4aalpg2oeenhisln9tk9s15m26iruu.apps.googleusercontent.com"

    def log(self, message: str, level: str = 'INFO'):
        """Log com timestamp"""
        timestamp = datetime.now().strftime('%H:%M:%S')
        icons = {'INFO': '📝', 'SUCCESS': '✅', 'ERROR': '❌', 'WARNING': '⚠️', 'DEPLOY': '🚀'}
        print(f"[{timestamp}] {icons.get(level, '📝')} {message}")

    def run_command(self, command: str, shell: bool = True):
        """Executa comando no terminal"""
        self.log(f"Executando: {command}", 'INFO')
        
        try:
            result = subprocess.run(
                command,
                shell=shell,
                capture_output=True,
                text=True,
                check=True
            )
            return result.stdout.strip()
        except subprocess.CalledProcessError as e:
            self.log(f"Erro: {e}", 'ERROR')
            if e.stdout:
                self.log(f"Output: {e.stdout}", 'ERROR')
            if e.stderr:
                self.log(f"Error: {e.stderr}", 'ERROR')
            return None

    def check_prerequisites(self):
        """Verifica pré-requisitos"""
        self.log("Verificando pré-requisitos...", 'INFO')
        
        # Verifica Azure CLI
        result = self.run_command("az --version")
        if result:
            self.log("Azure CLI: OK", 'SUCCESS')
        else:
            self.log("Azure CLI não encontrado", 'ERROR')
            return False
        
        # Verifica login
        result = self.run_command("az account show")
        if result:
            account = json.loads(result)
            user = account.get('user', {}).get('name', 'Desconhecido')
            self.log(f"Logado como: {user}", 'SUCCESS')
        else:
            self.log("Não está logado no Azure", 'ERROR')
            return False
        
        # Verifica backend
        if not self.backend_dir.exists():
            self.log("Diretório backend não encontrado", 'ERROR')
            return False
        
        app_py = self.backend_dir / "app.py"
        if not app_py.exists():
            self.log("app.py não encontrado", 'ERROR')
            return False
        
        self.log("Pré-requisitos: OK", 'SUCCESS')
        return True

    def create_resource_group(self):
        """Cria grupo de recursos se não existir"""
        self.log(f"Criando/verificando resource group: {self.resource_group}", 'DEPLOY')
        
        # Verifica se existe
        result = self.run_command(f"az group show --name {self.resource_group} --output json")
        if result:
            self.log("Resource group já existe", 'SUCCESS')
            return True
        
        # Cria novo
        result = self.run_command(f"az group create --name {self.resource_group} --location \"{self.location}\"")
        if result:
            self.log("Resource group criado", 'SUCCESS')
            return True
        else:
            self.log("Erro criando resource group", 'ERROR')
            return False

    def create_app_service_plan(self):
        """Cria plano do App Service se não existir"""
        self.log(f"Criando/verificando App Service Plan: {self.plan_name}", 'DEPLOY')
        
        # Verifica se existe
        result = self.run_command(f"az appservice plan show --name {self.plan_name} --resource-group {self.resource_group} --output json")
        if result:
            self.log("App Service Plan já existe", 'SUCCESS')
            return True
        
        # Cria novo (Free tier)
        result = self.run_command(f"az appservice plan create --name {self.plan_name} --resource-group {self.resource_group} --sku F1 --is-linux")
        if result:
            self.log("App Service Plan criado", 'SUCCESS')
            return True
        else:
            self.log("Erro criando App Service Plan", 'ERROR')
            return False

    def create_webapp(self):
        """Cria Web App se não existir"""
        self.log(f"Criando/verificando Web App: {self.app_name}", 'DEPLOY')
        
        # Verifica se existe
        result = self.run_command(f"az webapp show --name {self.app_name} --resource-group {self.resource_group} --output json")
        if result:
            self.log("Web App já existe", 'SUCCESS')
            return True
        
        # Cria novo
        result = self.run_command(f'az webapp create --name {self.app_name} --resource-group {self.resource_group} --plan {self.plan_name} --runtime "PYTHON:3.11"')
        if result:
            self.log("Web App criado", 'SUCCESS')
            return True
        else:
            self.log("Erro criando Web App", 'ERROR')
            return False

    def prepare_deployment_package(self):
        """Prepara pacote para deploy"""
        self.log("Preparando pacote de deploy...", 'DEPLOY')
        
        # Remove diretório temporário se existir
        if self.deploy_dir.exists():
            shutil.rmtree(self.deploy_dir)
        
        # Cria diretório temporário
        self.deploy_dir.mkdir()
        
        # Copia arquivos do backend
        for item in self.backend_dir.iterdir():
            if item.name in ['__pycache__', '.env', 'logs']:
                continue
            
            if item.is_file():
                shutil.copy2(item, self.deploy_dir / item.name)
            elif item.is_dir() and item.name != '__pycache__':
                shutil.copytree(item, self.deploy_dir / item.name)
        
        # Cria requirements.txt se não existir
        requirements_file = self.deploy_dir / "requirements.txt"
        if not requirements_file.exists():
            requirements = """Flask==3.0.0
requests==2.31.0
authlib==1.2.1
cryptography==41.0.7
"""
            requirements_file.write_text(requirements)
            self.log("requirements.txt criado", 'SUCCESS')
        
        # Cria startup.py para Azure
        startup_py = self.deploy_dir / "startup.py"
        startup_content = """#!/usr/bin/env python3
import os
from app import create_app

# Para Azure App Service
app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5051))
    app.run(host="0.0.0.0", port=port, debug=False)
"""
        startup_py.write_text(startup_content)
        self.log("startup.py criado", 'SUCCESS')
        
        self.log("Pacote de deploy preparado", 'SUCCESS')
        return True

    def deploy_code(self):
        """Faz deploy do código"""
        self.log("Fazendo deploy do código...", 'DEPLOY')
        
        # Muda para diretório de deploy
        original_cwd = os.getcwd()
        os.chdir(self.deploy_dir)
        
        try:
            # Inicializa git se necessário
            if not (self.deploy_dir / ".git").exists():
                self.run_command("git init")
                self.run_command("git add .")
                self.run_command('git commit -m "Initial commit for Azure deploy"')
            
            # Deploy via git
            result = self.run_command(f"az webapp deployment source config-local-git --name {self.app_name} --resource-group {self.resource_group} --output json")
            
            if result:
                deploy_info = json.loads(result)
                git_url = deploy_info.get('url')
                
                if git_url:
                    self.log(f"Deploy URL: {git_url}", 'INFO')
                    
                    # Adiciona remote se não existir
                    self.run_command(f"git remote remove azure")  # Remove se existir
                    self.run_command(f"git remote add azure {git_url}")
                    
                    # Push para Azure
                    self.log("Fazendo push para Azure (pode demorar alguns minutos)...", 'DEPLOY')
                    result = self.run_command("git push azure main")
                    
                    if result:
                        self.log("Deploy do código: SUCESSO", 'SUCCESS')
                        return True
                    else:
                        self.log("Erro no push para Azure", 'ERROR')
                        return False
                else:
                    self.log("URL de deploy não encontrada", 'ERROR')
                    return False
            else:
                self.log("Erro configurando deploy source", 'ERROR')
                return False
                
        finally:
            os.chdir(original_cwd)

    def configure_app_settings(self):
        """Configura variáveis de ambiente"""
        self.log("Configurando variáveis de ambiente...", 'DEPLOY')
        
        # Solicita Google Client Secret
        print("\n🔑 CONFIGURAÇÃO GOOGLE CLIENT SECRET")
        print("=" * 45)
        print("Para obter o GOOGLE_CLIENT_SECRET:")
        print("1. Acesse: https://console.cloud.google.com/")
        print("2. APIs & Services → Credentials")
        print(f"3. Busque: {self.google_client_id}")
        print("4. Clique no ícone 'olho' para ver o secret")
        print()
        
        google_secret = input("Cole o GOOGLE_CLIENT_SECRET aqui (ou Enter para pular): ").strip()
        
        # Configurações básicas
        settings = {
            'GOOGLE_CLIENT_ID': self.google_client_id,
            'ORIGIN_ALLOWED': 'https://www.caracore.com.br',
            'OAUTH_REDIRECT_URI': 'https://www.caracore.com.br/secure/callback.html',
            'SCM_DO_BUILD_DURING_DEPLOYMENT': 'true',
            'WEBSITE_RUN_FROM_PACKAGE': '0'
        }
        
        if google_secret:
            settings['GOOGLE_CLIENT_SECRET'] = google_secret
        
        # Gera APP_SECRET_KEY
        import secrets
        settings['APP_SECRET_KEY'] = secrets.token_urlsafe(32)
        
        # Aplica configurações
        for key, value in settings.items():
            self.log(f"Configurando {key}...", 'INFO')
            result = self.run_command(f'az webapp config appsettings set --name {self.app_name} --resource-group {self.resource_group} --settings "{key}={value}"')
            
            if result:
                self.log(f"{key}: OK", 'SUCCESS')
            else:
                self.log(f"Erro configurando {key}", 'ERROR')
        
        return True

    def test_deployment(self):
        """Testa o deployment"""
        self.log("Testando deployment...", 'INFO')
        
        import requests
        import time
        
        # Aguarda alguns segundos
        self.log("Aguardando 30 segundos para estabilizar...", 'INFO')
        time.sleep(30)
        
        base_url = f"https://{self.app_name}.azurewebsites.net"
        
        # Testa health endpoint
        try:
            response = requests.get(f"{base_url}/health", timeout=30)
            if response.status_code == 200:
                self.log("Health endpoint: OK", 'SUCCESS')
                self.log(f"URL: {base_url}", 'SUCCESS')
                return True
            else:
                self.log(f"Health endpoint: Status {response.status_code}", 'WARNING')
                return False
        except Exception as e:
            self.log(f"Erro testando deployment: {e}", 'ERROR')
            return False

    def show_next_steps(self):
        """Mostra próximos passos"""
        print("\n🎉 DEPLOYMENT CONCLUÍDO!")
        print("=" * 30)
        
        backend_url = f"https://{self.app_name}.azurewebsites.net"
        
        print(f"🌐 Backend URL: {backend_url}")
        print(f"❤️ Health: {backend_url}/health")
        print(f"🔑 Google OAuth: {backend_url}/oauth/google/token")
        print()
        
        print("📋 PRÓXIMOS PASSOS:")
        print("1. Configure GOOGLE_CLIENT_SECRET se não fez ainda:")
        print(f"   az webapp config appsettings set --name {self.app_name} --resource-group {self.resource_group} --settings \"GOOGLE_CLIENT_SECRET=seu-secret-aqui\"")
        print()
        print("2. Configure frontend para usar o backend:")
        print("   Edite js/config.js e adicione:")
        print(f"   tokenEndpoint: '{backend_url}/oauth/google/token'")
        print()
        print("3. Teste Google OAuth:")
        print("   - Acesse: https://www.caracore.com.br/secure/")
        print("   - Clique em 'Login with Google'")
        print("   - Deve funcionar sem erro de callback")

    def full_deployment(self):
        """Executa deployment completo"""
        print("🚀 DEPLOYMENT BACKEND AZURE")
        print("=" * 35)
        print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print()
        
        if not self.check_prerequisites():
            return False
        
        if not self.create_resource_group():
            return False
        
        if not self.create_app_service_plan():
            return False
        
        if not self.create_webapp():
            return False
        
        if not self.prepare_deployment_package():
            return False
        
        # Deploy via ZIP é mais simples que git
        self.log("Fazendo deploy via ZIP...", 'DEPLOY')
        
        # Cria ZIP
        zip_path = self.workspace_dir / "backend_deploy.zip"
        with zipfile.ZipFile(zip_path, 'w') as zipf:
            for root, dirs, files in os.walk(self.deploy_dir):
                for file in files:
                    file_path = Path(root) / file
                    arc_name = file_path.relative_to(self.deploy_dir)
                    zipf.write(file_path, arc_name)
        
        # Deploy ZIP
        result = self.run_command(f'az webapp deployment source config-zip --name {self.app_name} --resource-group {self.resource_group} --src "{zip_path}"')
        
        if result:
            self.log("Deploy ZIP: SUCESSO", 'SUCCESS')
        else:
            self.log("Erro no deploy ZIP", 'ERROR')
            return False
        
        if not self.configure_app_settings():
            return False
        
        if self.test_deployment():
            self.show_next_steps()
            return True
        else:
            self.log("Deployment pode ter problemas - verifique logs no Azure Portal", 'WARNING')
            return False

def main():
    deployer = AzureBackendDeployer()
    
    try:
        success = deployer.full_deployment()
        return 0 if success else 1
    except KeyboardInterrupt:
        print("\n❌ Deployment cancelado pelo usuário")
        return 1
    except Exception as e:
        print(f"\n❌ Erro inesperado: {e}")
        return 1

if __name__ == "__main__":
    exit(main())
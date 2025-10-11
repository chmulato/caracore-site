#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
configurar_backend_azure.py - Configuração Backend Azure

Script para configurar o backend no Azure App Service para processar
Google OAuth. Usa Azure CLI para verificar e configurar o serviço.

Requisitos:
- az login já executado
- Backend já implantado no Azure

Uso:
    python configurar_backend_azure.py [--action check|config|deploy]
"""

import subprocess
import json
import requests
from datetime import datetime
from pathlib import Path

class AzureBackendConfigurator:
    def __init__(self):
        self.workspace_dir = Path(__file__).parent.parent
        self.backend_dir = self.workspace_dir / "backend"
        
        # Configurações Azure (serão detectadas automaticamente)
        self.resource_group = None
        self.app_name = None
        self.subscription_id = None
        
        # URLs
        self.backend_url = "https://www.caracore.com.br"
        self.google_client_id = "1023942712021-7k4aalpg2oeenhisln9tk9s15m26iruu.apps.googleusercontent.com"

    def log(self, message: str, level: str = 'INFO'):
        """Log com timestamp"""
        timestamp = datetime.now().strftime('%H:%M:%S')
        icons = {'INFO': '📝', 'SUCCESS': '✅', 'ERROR': '❌', 'WARNING': '⚠️', 'CONFIG': '⚙️'}
        print(f"[{timestamp}] {icons.get(level, '📝')} {message}")

    def run_az_command(self, command: list, capture_output: bool = True):
        """Executa comando Azure CLI"""
        try:
            result = subprocess.run(
                ['az'] + command,
                capture_output=capture_output,
                text=True,
                check=True
            )
            return result.stdout.strip() if capture_output else True
        except subprocess.CalledProcessError as e:
            self.log(f"Erro executando az {' '.join(command)}: {e}", 'ERROR')
            if capture_output and e.stdout:
                self.log(f"Output: {e.stdout}", 'ERROR')
            if capture_output and e.stderr:
                self.log(f"Error: {e.stderr}", 'ERROR')
            return None

    def check_az_login(self):
        """Verifica se está logado no Azure CLI"""
        self.log("Verificando login Azure CLI...", 'INFO')
        
        result = self.run_az_command(['account', 'show', '--output', 'json'])
        if result:
            account_info = json.loads(result)
            self.subscription_id = account_info.get('id')
            user_name = account_info.get('user', {}).get('name', 'Desconhecido')
            
            self.log(f"Logado como: {user_name}", 'SUCCESS')
            self.log(f"Subscription: {account_info.get('name', 'Desconhecida')}", 'INFO')
            return True
        else:
            self.log("Não está logado no Azure CLI", 'ERROR')
            return False

    def find_app_service(self):
        """Encontra o App Service que hospeda o backend"""
        self.log("Procurando App Service do backend...", 'INFO')
        
        # Lista todos os App Services
        result = self.run_az_command(['webapp', 'list', '--output', 'json'])
        if not result:
            return False
        
        webapps = json.loads(result)
        
        # Procura por apps que podem ser o backend
        candidates = []
        for app in webapps:
            app_name = app.get('name', '')
            default_hostname = app.get('defaultHostName', '')
            
            # Verifica se é relacionado ao caracore
            if any(keyword in app_name.lower() for keyword in ['caracore', 'cara-core', 'backend']):
                candidates.append({
                    'name': app_name,
                    'resourceGroup': app.get('resourceGroup'),
                    'defaultHostName': default_hostname,
                    'state': app.get('state'),
                    'location': app.get('location')
                })
        
        if candidates:
            self.log(f"Encontrados {len(candidates)} App Services candidatos:", 'SUCCESS')
            for i, candidate in enumerate(candidates):
                print(f"   {i+1}. {candidate['name']} ({candidate['defaultHostName']})")
                print(f"      Resource Group: {candidate['resourceGroup']}")
                print(f"      Estado: {candidate['state']}")
                print()
            
            # Se há apenas um, usa automaticamente
            if len(candidates) == 1:
                self.app_name = candidates[0]['name']
                self.resource_group = candidates[0]['resourceGroup']
                self.log(f"Usando App Service: {self.app_name}", 'SUCCESS')
                return True
            else:
                # Solicita escolha do usuário
                try:
                    choice = int(input("Escolha o App Service (número): ")) - 1
                    if 0 <= choice < len(candidates):
                        self.app_name = candidates[choice]['name']
                        self.resource_group = candidates[choice]['resourceGroup']
                        self.log(f"Selecionado: {self.app_name}", 'SUCCESS')
                        return True
                    else:
                        self.log("Escolha inválida", 'ERROR')
                        return False
                except (ValueError, KeyboardInterrupt):
                    self.log("Operação cancelada", 'ERROR')
                    return False
        else:
            self.log("Nenhum App Service relacionado encontrado", 'WARNING')
            
            # Lista todos para o usuário escolher
            if webapps:
                self.log("App Services disponíveis:", 'INFO')
                for i, app in enumerate(webapps[:10]):  # Mostra primeiros 10
                    print(f"   {i+1}. {app.get('name')} ({app.get('defaultHostName')})")
                
                try:
                    choice = int(input("Escolha o App Service correto (número): ")) - 1
                    if 0 <= choice < len(webapps):
                        self.app_name = webapps[choice]['name']
                        self.resource_group = webapps[choice]['resourceGroup']
                        self.log(f"Selecionado: {self.app_name}", 'SUCCESS')
                        return True
                except (ValueError, KeyboardInterrupt):
                    pass
            
            return False

    def check_app_service_status(self):
        """Verifica status do App Service"""
        if not self.app_name or not self.resource_group:
            self.log("App Service não identificado", 'ERROR')
            return False
        
        self.log(f"Verificando status do App Service: {self.app_name}", 'INFO')
        
        # Obtém informações do app
        result = self.run_az_command([
            'webapp', 'show',
            '--name', self.app_name,
            '--resource-group', self.resource_group,
            '--output', 'json'
        ])
        
        if result:
            app_info = json.loads(result)
            state = app_info.get('state', 'Unknown')
            default_hostname = app_info.get('defaultHostName', 'Unknown')
            
            self.log(f"Estado: {state}", 'SUCCESS' if state == 'Running' else 'WARNING')
            self.log(f"URL: https://{default_hostname}", 'INFO')
            
            # Atualiza URL do backend se necessário
            if default_hostname != 'Unknown' and 'caracore.com.br' not in default_hostname:
                self.backend_url = f"https://{default_hostname}"
                self.log(f"Backend URL atualizada: {self.backend_url}", 'INFO')
            
            return state == 'Running'
        
        return False

    def get_app_settings(self):
        """Obtém configurações atuais do App Service"""
        self.log("Obtendo configurações do App Service...", 'INFO')
        
        result = self.run_az_command([
            'webapp', 'config', 'appsettings', 'list',
            '--name', self.app_name,
            '--resource-group', self.resource_group,
            '--output', 'json'
        ])
        
        if result:
            settings = json.loads(result)
            settings_dict = {setting['name']: setting['value'] for setting in settings}
            
            # Verifica configurações importantes
            important_settings = [
                'GOOGLE_CLIENT_ID',
                'GOOGLE_CLIENT_SECRET', 
                'ORIGIN_ALLOWED',
                'APP_SECRET_KEY'
            ]
            
            self.log("Configurações importantes:", 'INFO')
            for setting in important_settings:
                value = settings_dict.get(setting)
                if value:
                    display_value = value[:20] + "..." if len(value) > 20 else value
                    if 'SECRET' in setting or 'KEY' in setting:
                        display_value = "*" * len(display_value)
                    self.log(f"  {setting}: {display_value}", 'SUCCESS')
                else:
                    self.log(f"  {setting}: NÃO CONFIGURADO", 'WARNING')
            
            return settings_dict
        
        return {}

    def configure_google_oauth_settings(self):
        """Configura variáveis de ambiente para Google OAuth"""
        self.log("Configurando variáveis para Google OAuth...", 'CONFIG')
        
        # Configurações necessárias
        settings_to_set = {
            'GOOGLE_CLIENT_ID': self.google_client_id,
            'ORIGIN_ALLOWED': 'https://www.caracore.com.br',
            'OAUTH_REDIRECT_URI': 'https://www.caracore.com.br/secure/callback.html'
        }
        
        # Verifica se GOOGLE_CLIENT_SECRET já está configurado
        current_settings = self.get_app_settings()
        if not current_settings.get('GOOGLE_CLIENT_SECRET'):
            self.log("GOOGLE_CLIENT_SECRET não está configurado", 'WARNING')
            self.show_google_secret_instructions()
            
            secret = input("Cole o GOOGLE_CLIENT_SECRET aqui (ou Enter para pular): ").strip()
            if secret:
                settings_to_set['GOOGLE_CLIENT_SECRET'] = secret
            else:
                self.log("GOOGLE_CLIENT_SECRET será necessário para funcionamento completo", 'WARNING')
        
        # Gera APP_SECRET_KEY se não existir
        if not current_settings.get('APP_SECRET_KEY'):
            import secrets
            app_secret = secrets.token_urlsafe(32)
            settings_to_set['APP_SECRET_KEY'] = app_secret
            self.log("APP_SECRET_KEY gerado automaticamente", 'SUCCESS')
        
        # Aplica configurações
        for key, value in settings_to_set.items():
            self.log(f"Configurando {key}...", 'CONFIG')
            
            result = self.run_az_command([
                'webapp', 'config', 'appsettings', 'set',
                '--name', self.app_name,
                '--resource-group', self.resource_group,
                '--settings', f"{key}={value}"
            ])
            
            if result:
                self.log(f"{key} configurado", 'SUCCESS')
            else:
                self.log(f"Erro configurando {key}", 'ERROR')

    def restart_app_service(self):
        """Reinicia o App Service para aplicar configurações"""
        self.log("Reiniciando App Service...", 'CONFIG')
        
        result = self.run_az_command([
            'webapp', 'restart',
            '--name', self.app_name,
            '--resource-group', self.resource_group
        ])
        
        if result:
            self.log("App Service reiniciado", 'SUCCESS')
            self.log("Aguardando 30 segundos para estabilizar...", 'INFO')
            import time
            time.sleep(30)
            return True
        else:
            self.log("Erro reiniciando App Service", 'ERROR')
            return False

    def test_backend_endpoints(self):
        """Testa endpoints do backend"""
        self.log("Testando endpoints do backend...", 'INFO')
        
        endpoints_to_test = [
            ('/health', 'Health check'),
            ('/oauth/google/token', 'Google OAuth token (OPTIONS)', 'OPTIONS')
        ]
        
        results = {}
        
        for endpoint_info in endpoints_to_test:
            endpoint = endpoint_info[0]
            description = endpoint_info[1]
            method = endpoint_info[2] if len(endpoint_info) > 2 else 'GET'
            
            url = f"{self.backend_url}{endpoint}"
            self.log(f"Testando {description}: {method} {url}", 'INFO')
            
            try:
                if method == 'OPTIONS':
                    response = requests.options(url, timeout=10, headers={
                        'Origin': 'https://www.caracore.com.br',
                        'Access-Control-Request-Method': 'POST'
                    })
                else:
                    response = requests.get(url, timeout=10)
                
                if response.status_code in [200, 204]:
                    self.log(f"{description}: ✅ OK (Status {response.status_code})", 'SUCCESS')
                    results[endpoint] = True
                else:
                    self.log(f"{description}: ⚠️ Status {response.status_code}", 'WARNING')
                    results[endpoint] = False
                    
            except requests.exceptions.RequestException as e:
                self.log(f"{description}: ❌ Erro - {e}", 'ERROR')
                results[endpoint] = False
        
        return results

    def show_google_secret_instructions(self):
        """Mostra instruções para obter Google Client Secret"""
        print("\n🔑 OBTER GOOGLE CLIENT SECRET")
        print("=" * 35)
        print("1. Acesse: https://console.cloud.google.com/")
        print("2. APIs & Services → Credentials")
        print(f"3. Busque Client ID: {self.google_client_id}")
        print("4. Clique no ícone 'olho' para ver o Client Secret")
        print("5. Copie o valor")

    def show_final_instructions(self):
        """Mostra instruções finais"""
        print("\n🎯 CONFIGURAÇÃO COMPLETA")
        print("=" * 30)
        print("Para testar o Google OAuth:")
        print("1. Acesse: https://www.caracore.com.br/secure/")
        print("2. Clique em 'Login with Google'")
        print("3. O callback deve funcionar corretamente agora")
        print()
        print("Se ainda houver problemas:")
        print("1. Verifique logs do App Service no Azure Portal")
        print("2. Execute: python testar_backend_google.py")
        print("3. Verifique Console do navegador (F12)")

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Configuração Backend Azure")
    parser.add_argument('--action', choices=['check', 'config', 'test'], default='config',
                       help='Ação a executar')
    
    args = parser.parse_args()
    
    configurator = AzureBackendConfigurator()
    
    print("⚙️ CONFIGURADOR BACKEND AZURE")
    print("=" * 35)
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Verifica login Azure
    if not configurator.check_az_login():
        print("❌ Execute 'az login' primeiro")
        return 1
    
    # Encontra App Service
    if not configurator.find_app_service():
        print("❌ Não foi possível encontrar o App Service")
        return 1
    
    if args.action == 'check':
        # Apenas verifica status atual
        configurator.check_app_service_status()
        configurator.get_app_settings()
        
    elif args.action == 'config':
        # Configura tudo
        if configurator.check_app_service_status():
            configurator.configure_google_oauth_settings()
            configurator.restart_app_service()
            
            # Testa após configuração
            results = configurator.test_backend_endpoints()
            
            if all(results.values()):
                print("\n🎉 BACKEND CONFIGURADO COM SUCESSO!")
                configurator.show_final_instructions()
            else:
                print("\n⚠️ Configuração parcial - alguns endpoints falharam")
        else:
            print("❌ App Service não está executando")
            
    elif args.action == 'test':
        # Apenas testa endpoints
        configurator.test_backend_endpoints()
    
    return 0

if __name__ == "__main__":
    exit(main())
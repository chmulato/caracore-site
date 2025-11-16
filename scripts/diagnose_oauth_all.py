#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de diagnóstico completo para verificar configuração de OAuth (Google e Microsoft)
Usa os endpoints de diagnóstico do próprio backend (não requer Azure CLI)

Uso:
    python scripts/diagnose_oauth_all.py
"""

import requests
import json
import sys
import io

# Configurar encoding UTF-8 para Windows
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# URL do backend (produção)
BACKEND_URL = "https://caracore-backend-docker.azurewebsites.net"

# Endpoints de diagnóstico
GOOGLE_ENDPOINT = f"{BACKEND_URL}/health/oauth/google"
MICROSOFT_ENDPOINT = f"{BACKEND_URL}/health/oauth/microsoft"


def format_status(status):
    """Formata status com emoji"""
    status_map = {
        "ok": "✅",
        "error": "❌",
        "missing": "❌",
        "using_default": "⚠️"
    }
    return f"{status_map.get(status, '❓')} {status.upper()}"


def diagnose_provider(provider_name, endpoint_url):
    """Executa diagnóstico para um provedor específico"""
    print(f"\n{'='*70}")
    print(f"🔍 DIAGNÓSTICO: {provider_name} OAuth")
    print(f"{'='*70}")
    print(f"\n📡 Endpoint: {endpoint_url}\n")
    
    try:
        response = requests.get(endpoint_url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
        elif response.status_code == 503:
            data = response.json()
            print(f"⚠️  Backend respondeu mas há problemas de configuração\n")
        else:
            print(f"❌ Erro ao acessar endpoint: {response.status_code}")
            print(f"   Resposta: {response.text[:200]}")
            return False, None
        
        # Determinar qual provedor
        if provider_name == "Google":
            oauth_info = data.get("google_oauth", {})
        else:
            oauth_info = data.get("microsoft_oauth", {})
        
        var_status = oauth_info.get("required_variables", {})
        diagnosis = data.get("diagnosis", {})
        
        # Exibir informações
        print(f"{'='*70}")
        print(f"📋 VARIÁVEIS DE AMBIENTE:")
        print(f"{'='*70}")
        
        # Variáveis obrigatórias
        print(f"\n🔍 Variáveis Obrigatórias:")
        print("-" * 70)
        
        if provider_name == "Google":
            required_vars = ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"]
        else:
            required_vars = ["AZURE_CLIENT_ID", "AZURE_CLIENT_SECRET", "AZURE_TENANT_ID"]
        
        all_required_ok = True
        
        for var_name in required_vars:
            var_info = var_status.get(var_name, {})
            configured = var_info.get("configured", False)
            status = var_info.get("status", "unknown")
            
            if configured:
                if "SECRET" in var_name:
                    length = var_info.get("value_length", 0)
                    print(f"✅ {var_name}: Configurado (tamanho: {length} caracteres)")
                else:
                    print(f"✅ {var_name}: Configurado")
            else:
                print(f"❌ {var_name}: NÃO CONFIGURADO")
                all_required_ok = False
        
        # Variáveis opcionais
        print(f"\n📝 Variáveis Opcionais:")
        print("-" * 70)
        
        if provider_name == "Google":
            optional_vars = ["GOOGLE_ALLOWED_DOMAINS"]
        else:
            optional_vars = ["AZURE_SCOPE", "AZURE_TOKEN_ENDPOINT"]
        
        for var_name in optional_vars:
            var_info = var_status.get(var_name, {})
            configured = var_info.get("configured", False)
            value = var_info.get("value")
            
            if configured:
                print(f"✅ {var_name}: {value}")
            else:
                print(f"⚠️  {var_name}: Usando valor padrão")
        
        # Informações adicionais
        print(f"\n{'='*70}")
        print(f"🔗 INFORMAÇÕES ADICIONAIS:")
        print(f"{'='*70}")
        print(f"   Token Endpoint: {oauth_info.get('token_endpoint', 'N/A')}")
        if provider_name == "Microsoft":
            print(f"   Tenant: {oauth_info.get('tenant', 'N/A')}")
        
        # Diagnóstico
        print(f"\n{'='*70}")
        print(f"📊 DIAGNÓSTICO:")
        print(f"{'='*70}")
        print(f"\n   Status: {format_status(data.get('status', 'unknown'))}")
        print(f"   Mensagem: {diagnosis.get('message', 'N/A')}")
        
        missing = diagnosis.get("missing_variables", [])
        if missing:
            print(f"\n   ❌ Variáveis faltando:")
            for var in missing:
                print(f"      - {var}")
        
        return all_required_ok, data
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Erro ao conectar ao backend: {e}")
        print(f"\n   Verifique se o backend está acessível em: {BACKEND_URL}")
        return False, None
    except json.JSONDecodeError as e:
        print(f"❌ Erro ao decodificar resposta JSON: {e}")
        return False, None
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")
        import traceback
        traceback.print_exc()
        return False, None


def main():
    """Função principal"""
    print("\n" + "="*70)
    print("🔍 DIAGNÓSTICO COMPLETO: OAuth (Google e Microsoft)")
    print("="*70)
    
    # Diagnóstico Google
    google_ok, google_data = diagnose_provider("Google", GOOGLE_ENDPOINT)
    
    # Diagnóstico Microsoft
    microsoft_ok, microsoft_data = diagnose_provider("Microsoft", MICROSOFT_ENDPOINT)
    
    # Resumo final
    print("\n" + "="*70)
    print("📊 RESUMO FINAL:")
    print("="*70)
    
    print(f"\n   Google OAuth:   {format_status('ok' if google_ok else 'error')}")
    print(f"   Microsoft OAuth: {format_status('ok' if microsoft_ok else 'error')}")
    
    all_ok = google_ok and microsoft_ok
    
    if all_ok:
        print(f"\n✅ Todos os provedores OAuth estão configurados corretamente!")
        print(f"\n💡 Próximos passos:")
        print(f"   1. Teste o login Google no site")
        print(f"   2. Teste o login Microsoft no site")
        print(f"   3. Verifique se não há erros 500 nos logs")
    else:
        print(f"\n❌ Alguns provedores OAuth precisam de configuração!")
        print(f"\n🔧 Para corrigir:")
        if not google_ok:
            print(f"   - Configure as variáveis do Google OAuth")
            print(f"     Ver: docs/CONFIGURAR_GOOGLE_OAUTH_AZURE.md")
        if not microsoft_ok:
            print(f"   - Configure as variáveis do Microsoft OAuth")
            print(f"     Ver: docs/CONFIGURAR_MICROSOFT_OAUTH_AZURE.md")
    
    print("\n" + "="*70)
    
    return 0 if all_ok else 1


if __name__ == "__main__":
    sys.exit(main())


#!/usr/bin/env python3
"""
Script de diagnóstico simplificado para verificar configuração do Microsoft OAuth
Usa o endpoint de diagnóstico do próprio backend (não requer Azure CLI)

Uso:
    python scripts/diagnose_microsoft_oauth_simple.py
"""

import requests
import json
import sys

# URL do backend (produção)
BACKEND_URL = "https://caracore-backend-docker.azurewebsites.net"

# Endpoint de diagnóstico
DIAGNOSTIC_ENDPOINT = f"{BACKEND_URL}/health/oauth/microsoft"


def format_status(status):
    """Formata status com emoji"""
    status_map = {
        "ok": "✅",
        "error": "❌",
        "missing": "❌",
        "using_default": "⚠️"
    }
    return f"{status_map.get(status, '❓')} {status.upper()}"


def diagnose_microsoft_oauth():
    """Executa diagnóstico via endpoint do backend"""
    print("\n" + "="*70)
    print("🔍 DIAGNÓSTICO: Microsoft OAuth - Erro 500")
    print("="*70)
    print(f"\n📡 Conectando ao backend: {BACKEND_URL}")
    print(f"   Endpoint: /health/oauth/microsoft\n")
    
    try:
        response = requests.get(DIAGNOSTIC_ENDPOINT, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
        elif response.status_code == 503:
            data = response.json()
            print("⚠️  Backend respondeu mas há problemas de configuração\n")
        else:
            print(f"❌ Erro ao acessar endpoint: {response.status_code}")
            print(f"   Resposta: {response.text[:200]}")
            return False
        
        # Exibir informações
        oauth_info = data.get("microsoft_oauth", {})
        var_status = oauth_info.get("required_variables", {})
        diagnosis = data.get("diagnosis", {})
        
        print("="*70)
        print("📋 VARIÁVEIS DE AMBIENTE:")
        print("="*70)
        
        # Variáveis obrigatórias
        print("\n🔍 Variáveis Obrigatórias:")
        print("-" * 70)
        
        required_vars = ["AZURE_CLIENT_ID", "AZURE_CLIENT_SECRET", "AZURE_TENANT_ID"]
        all_required_ok = True
        
        for var_name in required_vars:
            var_info = var_status.get(var_name, {})
            configured = var_info.get("configured", False)
            status = var_info.get("status", "unknown")
            
            if configured:
                if var_name == "AZURE_CLIENT_SECRET":
                    length = var_info.get("value_length", 0)
                    print(f"✅ {var_name}: Configurado (tamanho: {length} caracteres)")
                else:
                    # Não mostrar valor completo por segurança
                    print(f"✅ {var_name}: Configurado")
            else:
                print(f"❌ {var_name}: NÃO CONFIGURADO")
                all_required_ok = False
        
        # Variáveis opcionais
        print("\n📝 Variáveis Opcionais:")
        print("-" * 70)
        
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
        print("\n" + "="*70)
        print("🔗 INFORMAÇÕES ADICIONAIS:")
        print("="*70)
        print(f"   Token Endpoint: {oauth_info.get('token_endpoint', 'N/A')}")
        print(f"   Tenant: {oauth_info.get('tenant', 'N/A')}")
        
        # Diagnóstico
        print("\n" + "="*70)
        print("📊 DIAGNÓSTICO:")
        print("="*70)
        print(f"\n   Status: {format_status(data.get('status', 'unknown'))}")
        print(f"   Mensagem: {diagnosis.get('message', 'N/A')}")
        
        missing = diagnosis.get("missing_variables", [])
        if missing:
            print(f"\n   ❌ Variáveis faltando:")
            for var in missing:
                print(f"      - {var}")
        
        # Recomendações
        print("\n" + "="*70)
        print("💡 RECOMENDAÇÕES:")
        print("="*70)
        
        if all_required_ok:
            print("\n✅ Todas as variáveis obrigatórias estão configuradas!")
            print("\n   Se ainda houver erro 500, verifique:")
            print("   1. Se as credenciais estão corretas")
            print("   2. Se o App Registration no Azure AD está ativo")
            print("   3. Se o Client Secret não expirou")
            print("   4. Se o redirect URI está configurado corretamente")
            print("   5. Logs do App Service para mais detalhes")
            print("\n   Ver logs:")
            print("   https://portal.azure.com/#@/resource/subscriptions/*/resourceGroups/rg-caracore/providers/Microsoft.Web/sites/caracore-backend-docker/logStream")
        else:
            print("\n❌ Algumas variáveis obrigatórias estão faltando!")
            print("\n🔧 Para corrigir:")
            print("\n   1. Acesse o Portal Azure:")
            print("      https://portal.azure.com/#@/resource/subscriptions/*/resourceGroups/rg-caracore/providers/Microsoft.Web/sites/caracore-backend-docker/configuration")
            print("\n   2. Vá em: Configuration > Application settings")
            print("\n   3. Adicione as variáveis faltantes:")
            for var in missing:
                print(f"      - {var}")
            print("\n   4. Clique em 'Save' e aguarde a reinicialização")
            print("\n   5. Execute este script novamente para verificar")
        
        print("\n" + "="*70)
        return all_required_ok
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Erro ao conectar ao backend: {e}")
        print(f"\n   Verifique se o backend está acessível em: {BACKEND_URL}")
        print(f"   Ou se há problemas de rede/firewall")
        return False
    except json.JSONDecodeError as e:
        print(f"❌ Erro ao decodificar resposta JSON: {e}")
        return False
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Função principal"""
    success = diagnose_microsoft_oauth()
    
    print("\n" + "="*70)
    if success:
        print("✅ Diagnóstico concluído. Configuração parece correta.")
        print("   Se o erro persistir, verifique os logs do App Service.")
    else:
        print("❌ Diagnóstico concluído. Configuração incompleta.")
        print("   Configure as variáveis faltantes e tente novamente.")
    print("="*70 + "\n")
    
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())


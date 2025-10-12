import requests
import json
import re
import sys
from urllib.parse import urlparse

# URL base da produção
PROD_URL = "https://www.caracore.com.br"

def print_header(text):
    """Imprime um cabeçalho formatado."""
    print("\n" + "=" * 80)
    print(text.center(80))
    print("=" * 80 + "\n")

def print_section(text):
    """Imprime um título de seção."""
    print("\n" + "-" * 80)
    print(text)
    print("-" * 80)

def fetch_js_content(url):
    """Busca o conteúdo de um arquivo JS."""
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            return response.text
        else:
            return f"Erro ao acessar {url}: Status {response.status_code}"
    except Exception as e:
        return f"Erro ao acessar {url}: {str(e)}"

def analyze_config_js():
    """Analisa o arquivo config.js."""
    print_section("Análise do arquivo config.js")
    
    config_url = f"{PROD_URL}/js/config.js"
    content = fetch_js_content(config_url)
    
    if content.startswith("Erro"):
        print(content)
        return
    
    # Extrair provedor configurado
    provider_match = re.search(r'const\s+OIDC_PROVIDER\s*=\s*[\'"]([^\'"]+)[\'"]', content)
    provider = provider_match.group(1) if provider_match else "Não encontrado"
    print(f"Provedor configurado: {provider}")
    
    # Extrair client IDs
    azure_id_match = re.search(r'azure:\s*{[^}]*clientId:\s*[\'"]([^\'"]+)[\'"]', content, re.DOTALL)
    azure_id = azure_id_match.group(1) if azure_id_match else "Não encontrado"
    print(f"Microsoft Entra ID Client ID: {azure_id}")
    
    google_id_match = re.search(r'google:\s*{[^}]*clientId:\s*[\'"]([^\'"]+)[\'"]', content, re.DOTALL)
    google_id = google_id_match.group(1) if google_id_match else "Não encontrado"
    print(f"Google OAuth Client ID: {google_id}")
    
    # Verificar URLs de redirecionamento
    redirect_match = re.search(r'redirectUri:\s*(.*?)(?:,|$)', content)
    redirect_uri = redirect_match.group(1) if redirect_match else "Não encontrado"
    print(f"Configuração de redirectUri: {redirect_uri}")
    
    # Análise adicional
    if ".apps.googleusercontent.com" not in google_id and google_id != "Não encontrado":
        print("\n⚠️ ALERTA: O Client ID do Google não parece estar no formato correto.")
        print("   Formato esperado: algo como '1234567890-abcdef.apps.googleusercontent.com'")
    
    if azure_id == google_id and azure_id != "Não encontrado":
        print("\n⚠️ ALERTA: Os Client IDs do Microsoft Entra ID e Google são idênticos.")
        print("   Isso geralmente indica uma configuração incorreta.")

def analyze_dynamic_config():
    """Analisa o arquivo dynamic-config.js."""
    print_section("Análise do arquivo dynamic-config.js")
    
    config_url = f"{PROD_URL}/secure/dynamic-config.js"
    content = fetch_js_content(config_url)
    
    if content.startswith("Erro"):
        print(content)
        return
    
    # Verificar principais funções
    has_path_resolve = "resolveOidcPaths" in content
    has_google_config = "generateGoogleConfig" in content
    has_azure_config = "generateAzureConfig" in content
    
    print(f"Função resolveOidcPaths: {'✓ Presente' if has_path_resolve else '✗ Ausente'}")
    print(f"Função generateGoogleConfig: {'✓ Presente' if has_google_config else '✗ Ausente'}")
    print(f"Função generateAzureConfig: {'✓ Presente' if has_azure_config else '✗ Ausente'}")
    
    # Verificar padrões de caminhos
    paths_match = re.search(r'const\s+defaults\s*=\s*{([^}]+)}', content)
    if paths_match:
        paths_block = paths_match.group(1)
        print("\nCaminhos padrão configurados:")
        for path_match in re.finditer(r'(\w+):\s*[\'"]([^\'"]+)[\'"]', paths_block):
            print(f"  - {path_match.group(1)}: {path_match.group(2)}")

def analyze_auth_standalone():
    """Analisa o arquivo auth-standalone.js."""
    print_section("Análise do arquivo auth-standalone.js")
    
    config_url = f"{PROD_URL}/secure/auth-standalone.js"
    content = fetch_js_content(config_url)
    
    if content.startswith("Erro"):
        print(content)
        return
    
    # Verificar funções importantes
    has_login = "login:" in content
    has_logout = "logout:" in content
    has_redirect_uri = "redirectUri:" in content
    
    print(f"Função de login: {'✓ Presente' if has_login else '✗ Ausente'}")
    print(f"Função de logout: {'✓ Presente' if has_logout else '✗ Ausente'}")
    print(f"Configuração redirectUri: {'✓ Presente' if has_redirect_uri else '✗ Ausente'}")
    
    # Verificar modo de redirecionamento
    uses_assign = "location.assign" in content
    uses_href = "location.href" in content
    uses_replace = "location.replace" in content
    
    print("\nMétodo de redirecionamento usado:")
    if uses_assign:
        print("  - location.assign()")
    if uses_href:
        print("  - location.href")
    if uses_replace:
        print("  - location.replace()")

def analyze_auth_force_recognition():
    """Analisa o arquivo auth-force-recognition.js."""
    print_section("Análise do arquivo auth-force-recognition.js")
    
    config_url = f"{PROD_URL}/secure/auth-force-recognition.js"
    content = fetch_js_content(config_url)
    
    if content.startswith("Erro"):
        print(content)
        return
    
    # Verificar comportamento de refresh
    refresh_matches = re.findall(r'(location\.reload|window\.location\.reload)', content)
    
    if refresh_matches:
        print(f"⚠️ Encontradas {len(refresh_matches)} instruções de recarga (reload) no arquivo.")
        print("   Isso pode estar causando um loop infinito de recargas.")
        
        # Tentar encontrar o contexto do refresh
        for i, match in enumerate(refresh_matches):
            context_match = re.search(r'([^\n]{0,50}' + re.escape(match) + r'[^\n]{0,50})', content)
            if context_match:
                print(f"\n   Recarga #{i+1} - Contexto: ...{context_match.group(1)}...")
    else:
        print("✓ Nenhuma instrução de recarga (reload) encontrada.")
    
    # Verificar outras funções importantes
    has_override = re.search(r'Aplicando\s+override|override\s+dos\s+métodos', content, re.IGNORECASE)
    
    if has_override:
        print("\n⚠️ O arquivo contém código que faz override de métodos de autenticação.")
        print("   Isso pode estar causando problemas se não estiver configurado corretamente.")

def check_redirect_uris():
    """Verifica as URIs de redirecionamento necessárias."""
    print_section("Verificação de URIs de Redirecionamento")
    
    # URIs que precisam estar registradas nos provedores
    required_uris = [
        f"{PROD_URL}/secure/callback.html"
    ]
    
    print("As seguintes URIs precisam estar registradas nos portais dos provedores:")
    for uri in required_uris:
        parsed = urlparse(uri)
        print(f"\n✓ {uri}")
        print(f"  - Host: {parsed.netloc}")
        print(f"  - Caminho: {parsed.path}")
        print(f"  - Protocolo: {parsed.scheme}")

def main():
    """Função principal do diagnóstico."""
    print_header("DIAGNÓSTICO DE AUTENTICAÇÃO EM PRODUÇÃO")
    print(f"URL base analisada: {PROD_URL}\n")
    
    # Executar análises
    analyze_config_js()
    analyze_dynamic_config()
    analyze_auth_standalone()
    analyze_auth_force_recognition()
    check_redirect_uris()
    
    # Imprimir resumo e recomendações
    print_header("RESUMO E RECOMENDAÇÕES")
    
    print("""1. PROBLEMA DE REFRESH CONSTANTE:
   - O arquivo auth-force-recognition.js pode estar causando um loop infinito
   - Se possível, desative temporariamente este componente para diagnóstico

2. VERIFIQUE OS CLIENT IDs:
   - Certifique-se de que o Client ID do Google está no formato correto (terminando com .apps.googleusercontent.com)
   - Confirme que o Client ID do Azure está correto

3. REGISTRE AS URIs DE REDIRECIONAMENTO:
   - Microsoft Entra ID: https://portal.azure.com
     Registrar: https://www.caracore.com.br/secure/callback.html
   - Google Cloud Console: https://console.cloud.google.com
     Registrar: https://www.caracore.com.br/secure/callback.html

4. VERIFICAÇÃO DO CONSOLE:
   - Abra a página em modo incógnito com o Console de Desenvolvedor aberto (F12)
   - Execute este comando para bloquear os refreshes:
     
     // Bloquear recargas automáticas
     window.location.reload = function() { console.log("Recarga bloqueada"); }
     
   - Tente fazer login manualmente no console:
     
     // Tentar login manual
     if (window.OIDCAuth) window.OIDCAuth.login().catch(e => console.error(e))
     
   - Observe os erros no console para diagnóstico adicional""")

if __name__ == "__main__":
    main()
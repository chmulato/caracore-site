import requests
import sys
import os
import re
import json
import urllib.parse
from datetime import datetime

# URL base da produção
PROD_URL = "https://www.caracore.com.br"

# Diretório para salvar logs
LOG_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "log")
os.makedirs(LOG_DIR, exist_ok=True)

def log_info(message):
    """Exibe e registra uma mensagem informativa."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[INFO] {timestamp} - {message}")

def log_error(message):
    """Exibe e registra uma mensagem de erro."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[ERRO] {timestamp} - {message}", file=sys.stderr)

def check_url_status(url):
    """Verifica o status HTTP de uma URL."""
    try:
        response = requests.get(url, timeout=10)
        return {
            "url": url,
            "status_code": response.status_code,
            "ok": response.status_code == 200,
            "content_type": response.headers.get('Content-Type', ''),
            "content_length": len(response.content),
            "redirected": len(response.history) > 0,
            "final_url": response.url
        }
    except Exception as e:
        return {
            "url": url,
            "status_code": 0,
            "ok": False,
            "error": str(e)
        }

def check_css_js_references(url):
    """Verifica se os arquivos CSS e JS referenciados existem."""
    try:
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            return {
                "ok": False,
                "message": f"Não foi possível acessar a página (status {response.status_code})"
            }
        
        # Extrair referências CSS
        css_refs = re.findall(r'href=[\'"]([^\'"]*\.css[^\'"]*)[\'"]', response.text)
        
        # Extrair referências JS
        js_refs = re.findall(r'src=[\'"]([^\'"]*\.js[^\'"]*)[\'"]', response.text)
        
        # Verificar cada referência
        results = {"css": [], "js": [], "all_ok": True}
        base_url = response.url
        
        for css in css_refs:
            css_url = urllib.parse.urljoin(base_url, css)
            status = check_url_status(css_url)
            results["css"].append(status)
            if not status["ok"]:
                results["all_ok"] = False
        
        for js in js_refs:
            js_url = urllib.parse.urljoin(base_url, js)
            status = check_url_status(js_url)
            results["js"].append(status)
            if not status["ok"]:
                results["all_ok"] = False
        
        return results
    except Exception as e:
        return {
            "ok": False,
            "message": f"Erro ao verificar referências: {str(e)}"
        }

def check_oidc_configuration():
    """Verifica a configuração OIDC no servidor de produção."""
    try:
        config_url = f"{PROD_URL}/js/config.js"
        response = requests.get(config_url, timeout=10)
        
        if response.status_code != 200:
            return {
                "ok": False,
                "message": f"Não foi possível acessar o arquivo de configuração (status {response.status_code})"
            }
        
        content = response.text
        
        # Tentar extrair informações relevantes do config.js usando regex
        # (isso não é perfeito, mas pode nos dar algumas pistas)
        provider = re.search(r'const OIDC_PROVIDER\s*=\s*[\'"]([^\'"]+)[\'"]', content)
        azure_client_id = re.search(r'clientId:\s*[\'"]([a-f0-9\-]+)[\'"].*?azure', content, re.DOTALL)
        google_client_id = re.search(r'clientId:\s*[\'"]([a-f0-9\-\.]+)[\'"].*?google', content, re.DOTALL)
        redirect_uri = re.search(r'redirectUri:\s*(.*?)(?:,|$)', content)
        
        # Extrair informações sobre redirect URI dinâmico
        dynamic_url = f"{PROD_URL}/secure/dynamic-config.js"
        dynamic_resp = requests.get(dynamic_url, timeout=10)
        
        return {
            "ok": True,
            "provider": provider.group(1) if provider else "Não encontrado",
            "azure_client_id": azure_client_id.group(1) if azure_client_id else "Não encontrado",
            "google_client_id": google_client_id.group(1) if google_client_id else "Não encontrado",
            "redirect_uri_config": redirect_uri.group(1) if redirect_uri else "Não encontrado",
            "dynamic_config_status": dynamic_resp.status_code
        }
    except Exception as e:
        return {
            "ok": False,
            "message": f"Erro ao verificar configuração OIDC: {str(e)}"
        }

def check_production_environment():
    """Função principal para verificar o ambiente de produção."""
    log_info(f"Verificando ambiente de produção em {PROD_URL}...")

    # Verificar disponibilidade geral do site
    status_home = check_url_status(f"{PROD_URL}/index.html")
    if not status_home["ok"]:
        log_error(f"Site principal não está acessível: {status_home.get('error', f'Status {status_home['status_code']}')})")
        return False
    
    log_info(f"Site principal acessível (status {status_home['status_code']})")
    
    # Verificar arquivos centralizados CSS e JS
    css_files = [
        "/secure/css/secure-layout.css",
        "/secure/css/secure-restrita.css",
        "/secure/css/secure-callback.css",
        "/secure/css/secure-logout.css",
        "/secure/css/secure-admin-logs.css"
    ]
    
    js_files = [
        "/secure/js/nav-controls.js",
        "/secure/js/secure-auth-ui.js",
        "/secure/js/callback-helpers.js", 
        "/secure/js/admin-logs.js"
    ]
    
    log_info("Verificando arquivos CSS centralizados...")
    css_status = []
    for css in css_files:
        url = f"{PROD_URL}{css}"
        status = check_url_status(url)
        css_status.append(status)
        log_info(f"{url}: {'✓' if status['ok'] else '✗'} ({status['status_code']})")
    
    log_info("Verificando arquivos JS centralizados...")
    js_status = []
    for js in js_files:
        url = f"{PROD_URL}{js}"
        status = check_url_status(url)
        js_status.append(status)
        log_info(f"{url}: {'✓' if status['ok'] else '✗'} ({status['status_code']})")
    
    # Verificar configuração OIDC
    log_info("Verificando configuração OIDC...")
    oidc_config = check_oidc_configuration()
    if not oidc_config["ok"]:
        log_error(f"Erro na verificação OIDC: {oidc_config['message']}")
    else:
        log_info(f"Provedor configurado: {oidc_config['provider']}")
        log_info(f"ID do cliente Azure: {oidc_config['azure_client_id']}")
        log_info(f"ID do cliente Google: {oidc_config['google_client_id']}")
        log_info(f"URI de redirecionamento: {oidc_config['redirect_uri_config']}")

    # Verificar página de callback
    log_info("Verificando página de callback...")
    callback_status = check_url_status(f"{PROD_URL}/secure/callback.html")
    log_info(f"Callback: {'✓' if callback_status['ok'] else '✗'} ({callback_status['status_code']})")
    
    if callback_status["ok"]:
        log_info("Verificando referências na página de callback...")
        callback_refs = check_css_js_references(f"{PROD_URL}/secure/callback.html")
        if callback_refs.get("all_ok", False):
            log_info("Todas as referências na página de callback estão OK")
        else:
            log_error("Alguns arquivos referenciados na página de callback não estão acessíveis")
    
    # Gerar relatório
    report = {
        "timestamp": datetime.now().isoformat(),
        "site_status": status_home,
        "css_status": css_status,
        "js_status": js_status,
        "oidc_config": oidc_config,
        "callback_status": callback_status
    }
    
    # Salvar relatório
    report_path = os.path.join(LOG_DIR, f"verificacao_producao_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json")
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    
    log_info(f"Relatório salvo em: {report_path}")
    log_info("Verificação concluída.")
    
    # Sugestões baseadas nos resultados
    log_info("\n" + "=" * 80)
    log_info("POSSÍVEIS PROBLEMAS E SOLUÇÕES:")
    
    # Problema 1: Arquivos CSS/JS não encontrados
    missing_files = [f["url"] for f in css_status + js_status if not f["ok"]]
    if missing_files:
        log_info("\n1. ARQUIVOS NÃO ENCONTRADOS:")
        for f in missing_files:
            log_info(f"   - {f}")
        log_info("   Solução: Verifique se os arquivos foram implantados corretamente no servidor de produção.")
    
    # Problema 2: Configuração OIDC
    if not oidc_config["ok"] or oidc_config["provider"] == "Não encontrado":
        log_info("\n2. PROBLEMA NA CONFIGURAÇÃO OIDC:")
        log_info("   Solução: Verifique se o arquivo config.js foi atualizado em produção.")
    
    # Problema 3: URI de redirecionamento
    log_info("\n3. PROBLEMA COM URI DE REDIRECIONAMENTO:")
    log_info("   Solução: Verifique se as URIs de redirecionamento estão registradas corretamente nos portais:")
    log_info("   - Microsoft Entra ID: https://portal.azure.com")
    log_info("   - Google Cloud Console: https://console.cloud.google.com")
    log_info("   As URIs devem incluir exatamente: https://www.caracore.com.br/secure/callback.html")
    
    # Problema 4: Versão dos arquivos
    log_info("\n4. PROBLEMA COM VERSÕES DE CACHE:")
    log_info("   Solução: Verifique se os parâmetros de versão (?v=XXXXXXXX) estão corretos e atualizados.")
    
    log_info("\n5. VERIFICAÇÃO MANUAL RECOMENDADA:")
    log_info("   Acesse https://www.caracore.com.br/secure/estrita.html e verifique o console do navegador")
    log_info("   para identificar erros JavaScript que possam estar ocorrendo.")
    log_info("=" * 80)
    
    return True

if __name__ == "__main__":
    check_production_environment()

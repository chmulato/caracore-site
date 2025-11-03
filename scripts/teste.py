"""Teste rápido para validar todas as páginas do site, Área 51 e executar testes JS/HTML.

O script inicia um servidor HTTP local apontando para a raiz do projeto,
realiza requisições a todas as páginas-chave e verifica conteúdos essenciais:

Testes Básicos:
- `index.html` deve responder com HTTP 200 e conter o link "Área 51"
- Páginas principais do `/secure/`: index.html, callback.html, restrita.html, logout.html

Testes HTML Específicos (validação detalhada):
- Todas as páginas do sistema de gerenciamento de usuários
- Páginas administrativas e de controle de acesso
- Validação de estrutura HTML e palavras-chave específicas

Validação JavaScript:
- Verifica sintaxe de todos os arquivos .js da aplicação
- Valida estrutura e balanceamento de símbolos
- Usa Node.js para validação rigorosa quando disponível

Testes JavaScript (Jest):
- Executa todos os testes via Jest automaticamente
- Descobre todos os arquivos *.test.js na pasta secure/testes/

Páginas testadas na pasta /secure/:
- index.html, callback.html, restrita.html, logout.html
- super-admin-setup.html, request-access-enhanced.html, request-access.html
- approval-requests.html, admin-users.html, admin-logs.html
- historia.html, access-denied.html, consent.html
- testes/test-runner.html

Arquivos JavaScript validados:
- Todos os arquivos .js em /secure/js/ e /js/

Uso:
    python teste.py

O processo retorna código 0 em caso de sucesso e 1 quando algum teste falha.
"""
from __future__ import annotations

import contextlib
import http.server
import os
import socketserver
import subprocess
import sys
import threading
import time
import urllib.error
import urllib.request
from dataclasses import dataclass
from html.parser import HTMLParser
from pathlib import Path
from typing import List

PROJECT_ROOT = Path(__file__).resolve().parent.parent  # Voltar um nível para a raiz do projeto
HOST = "127.0.0.1"


class SilentRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Handler que silencia logs e serve a partir da raiz do projeto."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(PROJECT_ROOT), **kwargs)

    def log_message(self, format: str, *args) -> None:  # noqa: A003 (shadow built-in)
        # Evita poluir a saída de testes
        return


class ThreadedHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


@dataclass
class TestResult:
    name: str
    success: bool
    details: str = ""


class Area51LinkChecker(HTMLParser):
    """Procura por um link com o texto "Área 51" apontando para /secure/."""

    def __init__(self):
        super().__init__()
        self._capture = False
        self._href: str | None = None
        self.found = False

    def handle_starttag(self, tag: str, attrs):
        if tag.lower() != "a":
            return
        attrs_dict = dict(attrs)
        self._href = attrs_dict.get("href")
        self._capture = True

    def handle_data(self, data: str):
        if not self._capture:
            return
        if self._href and "secure" in self._href.lower() and "área 51" in data.lower():
            self.found = True

    def handle_endtag(self, tag: str):
        if tag.lower() == "a":
            self._capture = False
            self._href = None


@contextlib.contextmanager
def start_test_server():
    with ThreadedHTTPServer((HOST, 0), SilentRequestHandler) as httpd:
        port = httpd.server_address[1]
        thread = threading.Thread(target=httpd.serve_forever, daemon=True)
        thread.start()
        # Pequena pausa para garantir que o servidor esteja pronto
        time.sleep(0.1)
        try:
            yield port
        finally:
            httpd.shutdown()
            thread.join(timeout=2)


def fetch(path: str, port: int) -> tuple[int, str]:
    url = f"http://{HOST}:{port}{path}"
    with urllib.request.urlopen(url) as response:  # noqa: S310 (urlopen é local)
        status = response.getcode()
        body = response.read().decode("utf-8", errors="ignore")
        return status, body


def run_tests(port: int) -> List[TestResult]:
    results: List[TestResult] = []

    # 1. index.html responde 200
    try:
        status, body = fetch("/index.html", port)
        results.append(TestResult("index.html responde 200", status == 200, f"status={status}"))
    except urllib.error.URLError as exc:  # pragma: no cover - falha de rede local
        results.append(TestResult("index.html responde 200", False, f"erro: {exc}"))
        return results

    # 2. index.html contém link Área 51
    parser = Area51LinkChecker()
    parser.feed(body)
    results.append(TestResult("Link Área 51 presente na home", parser.found))

    # 3. secure/index.html responde 200 e contém texto característico
    try:
        status, body_secure_index = fetch("/secure/index.html", port)
        contains_text = "Área Restrita" in body_secure_index
        results.append(
            TestResult(
                "secure/index.html ok",
                status == 200 and contains_text,
                f"status={status}; contains_text={contains_text}",
            )
        )
    except urllib.error.URLError as exc:
        results.append(TestResult("secure/index.html ok", False, f"erro: {exc}"))

    # 4. secure/callback.html responde 200 e exibe mensagem de validação
    try:
        status, body_callback = fetch("/secure/callback.html", port)
        contains_text = "Validando credenciais" in body_callback or "Área 51" in body_callback
        results.append(
            TestResult(
                "secure/callback.html ok",
                status == 200 and contains_text,
                f"status={status}; contains_text={contains_text}",
            )
        )
    except urllib.error.URLError as exc:
        results.append(TestResult("secure/callback.html ok", False, f"erro: {exc}"))

    # 5. secure/restrita.html responde 200 e contém mensagem de sessão
    try:
        status, body_restrita = fetch("/secure/restrita.html", port)
        contains_text = "Conteúdo Protegido" in body_restrita or "Sessão ativa" in body_restrita
        results.append(
            TestResult(
                "secure/restrita.html ok",
                status == 200 and contains_text,
                f"status={status}; contains_text={contains_text}",
            )
        )
    except urllib.error.URLError as exc:
        results.append(TestResult("secure/restrita.html ok", False, f"erro: {exc}"))

    # 6. secure/logout.html responde 200 e sinaliza sessão encerrada
    try:
        status, body_logout = fetch("/secure/logout.html", port)
        contains_text = "Sessão encerrada" in body_logout or "Até breve" in body_logout
        results.append(
            TestResult(
                "secure/logout.html ok",
                status == 200 and contains_text,
                f"status={status}; contains_text={contains_text}",
            )
        )
    except urllib.error.URLError as exc:
        results.append(TestResult("secure/logout.html ok", False, f"erro: {exc}"))

    return results


def run_javascript_tests() -> List[TestResult]:
    """Executa todos os testes JavaScript usando Jest."""
    results: List[TestResult] = []
    
    # Caminho para o diretório de testes
    test_dir = PROJECT_ROOT / "secure" / "testes"
    
    if not test_dir.exists():
        results.append(TestResult("Diretório de testes JS", False, "secure/testes não encontrado"))
        return results
    
    print("\n🧪 Executando testes JavaScript...")
    
    # Verificar se Node.js está disponível
    try:
        subprocess.run(["node", "--version"], 
                      capture_output=True, check=True, cwd=test_dir)
    except (subprocess.CalledProcessError, FileNotFoundError):
        results.append(TestResult("Node.js disponível", False, "Node.js não encontrado"))
        return results
    
    results.append(TestResult("Node.js disponível", True))
    
    # Verificar se npx está disponível
    try:
        subprocess.run(["npx", "--version"], 
                      capture_output=True, check=True, cwd=test_dir)
        results.append(TestResult("npx disponível", True))
    except (subprocess.CalledProcessError, FileNotFoundError):
        results.append(TestResult("npx disponível", False, "npx não encontrado - testes JS pulados"))
        print("   ⚠️  npx não encontrado. Testes JavaScript serão pulados.")
        return results
    
    # Instalar dependências se necessário
    package_json = test_dir / "package.json"
    if not package_json.exists():
        # Criar package.json básico se não existir
        package_content = """{
  "name": "caracore-tests",
  "version": "1.0.0",
  "devDependencies": {
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0"
  },
  "scripts": {
    "test": "jest"
  },
  "jest": {
    "testEnvironment": "jsdom",
    "setupFilesAfterEnv": ["<rootDir>/test-setup.js"],
    "testMatch": ["**/*.test.js"],
    "testTimeout": 10000
  }
}"""
        with open(package_json, 'w', encoding='utf-8') as f:
            f.write(package_content)
        results.append(TestResult("package.json criado", True))
    
    # Verificar se dependências estão instaladas
    node_modules = test_dir / "node_modules"
    if not node_modules.exists():
        print("   📦 Instalando dependências Jest...")
        try:
            result = subprocess.run(["npm", "install"], 
                                  capture_output=True, text=True, cwd=test_dir)
            if result.returncode == 0:
                results.append(TestResult("Dependências instaladas", True))
            else:
                results.append(TestResult("Dependências instaladas", False, 
                                        f"npm install falhou: {result.stderr}"))
                return results
        except FileNotFoundError:
            results.append(TestResult("npm disponível", False, "npm não encontrado"))
            return results
    
    # Executar testes JavaScript
    test_files = list(test_dir.glob("*.test.js"))
    if not test_files:
        results.append(TestResult("Arquivos de teste JS", False, "Nenhum arquivo *.test.js encontrado"))
        return results
    
    results.append(TestResult("Arquivos de teste JS encontrados", True, f"{len(test_files)} arquivos"))
    
    print(f"   🎯 Executando {len(test_files)} arquivos de teste...")
    
    try:
        # Executar Jest
        result = subprocess.run(["npx", "jest", "--verbose", "--no-cache"], 
                              capture_output=True, text=True, cwd=test_dir, timeout=120)
        
        if result.returncode == 0:
            results.append(TestResult("Execução dos testes JS", True, "Todos os testes passaram"))
            
            # Contar testes individuais na saída
            output_lines = result.stdout.split('\n')
            passed_tests = [line for line in output_lines if '✓' in line or 'PASS' in line]
            results.append(TestResult("Testes JS individuais", True, f"{len(passed_tests)} testes passaram"))
            
        else:
            results.append(TestResult("Execução dos testes JS", False, 
                                    f"Testes falharam (código {result.returncode})"))
            # Adicionar detalhes do erro
            if result.stderr:
                print(f"   ❌ Erro: {result.stderr[:200]}...")
            
    except subprocess.TimeoutExpired:
        results.append(TestResult("Execução dos testes JS", False, "Timeout após 120s"))
    except Exception as e:
        results.append(TestResult("Execução dos testes JS", False, f"Erro: {str(e)}"))
    
    return results


def validate_javascript_files() -> List[TestResult]:
    """Valida todos os arquivos JavaScript da aplicação."""
    results: List[TestResult] = []
    
    print("\n📝 Validando arquivos JavaScript...")
    
    # Diretórios onde estão os arquivos JS
    js_dirs = [
        PROJECT_ROOT / "secure" / "js",
        PROJECT_ROOT / "js"
    ]
    
    all_js_files = []
    for js_dir in js_dirs:
        if js_dir.exists():
            js_files = list(js_dir.glob("*.js"))
            all_js_files.extend(js_files)
    
    if not all_js_files:
        results.append(TestResult("Arquivos JS encontrados", False, "Nenhum arquivo .js encontrado"))
        return results
    
    results.append(TestResult("Arquivos JS encontrados", True, f"{len(all_js_files)} arquivos"))
    
    # Verificar se Node.js está disponível para validação de sintaxe
    node_available = False
    try:
        subprocess.run(["node", "--version"], 
                      capture_output=True, check=True)
        node_available = True
        results.append(TestResult("Node.js para validação", True))
    except (subprocess.CalledProcessError, FileNotFoundError):
        results.append(TestResult("Node.js para validação", False, "Node.js não disponível - validação sintática limitada"))
    
    # Validar cada arquivo JavaScript
    valid_files = 0
    for js_file in all_js_files:
        try:
            # Validação básica: ler o arquivo e verificar se não está vazio
            with open(js_file, 'r', encoding='utf-8') as f:
                content = f.read().strip()
            
            if not content:
                results.append(TestResult(f"JS: {js_file.name}", False, "Arquivo vazio"))
                continue
            
            # Arquivos minificados (.min.js) - validação simplificada
            if '.min.js' in js_file.name:
                # Para arquivos minificados, apenas verificar se não estão vazios e têm estrutura JS básica
                has_js_content = any(keyword in content for keyword in ['function', 'var', 'let', 'const', '=', '{', '}'])
                if has_js_content:
                    valid_files += 1
                    results.append(TestResult(f"JS: {js_file.name}", True, "arquivo minificado válido"))
                else:
                    results.append(TestResult(f"JS: {js_file.name}", False, "arquivo minificado sem conteúdo JS"))
                continue
            
            # Verificações básicas de sintaxe JavaScript para arquivos normais
            basic_checks = []
            
            # Verificar se contém estruturas JavaScript válidas
            js_patterns = [
                ('function', 'function' in content or '=>' in content),
                ('variáveis', any(keyword in content for keyword in ['var ', 'let ', 'const '])),
                ('estruturas', any(keyword in content for keyword in ['if', 'for', 'while', 'class'])),
            ]
            
            for pattern_name, pattern_found in js_patterns:
                if pattern_found:
                    basic_checks.append(pattern_name)
            
            # Se Node.js disponível, fazer validação de sintaxe mais rigorosa
            if node_available:
                try:
                    # Verificar sintaxe usando Node.js (método mais confiável)
                    result = subprocess.run(
                        ["node", "-c", str(js_file)], 
                        capture_output=True, text=True, timeout=10
                    )
                    syntax_valid = result.returncode == 0
                    if syntax_valid:
                        # Node.js confirmou que o arquivo é válido
                        valid_files += 1
                        details = f"Node.js OK; estruturas={','.join(basic_checks) if basic_checks else 'básica'}"
                        results.append(TestResult(f"JS: {js_file.name}", True, details))
                        continue
                    else:
                        # Node.js encontrou erro de sintaxe
                        error_msg = result.stderr.split('\n')[0][:50] if result.stderr else "erro de sintaxe"
                        results.append(TestResult(f"JS: {js_file.name}", False, f"Erro sintaxe: {error_msg}"))
                        continue
                except subprocess.TimeoutExpired:
                    results.append(TestResult(f"JS: {js_file.name}", False, "Timeout na validação"))
                    continue
                except Exception as e:
                    results.append(TestResult(f"JS: {js_file.name}", False, f"Erro: {str(e)}"))
                    continue
            
            # Fallback: validação básica apenas se Node.js não estiver disponível
            # Verificar balanceamento básico de chaves/parênteses
            braces_balanced = content.count('{') == content.count('}')
            parens_balanced = content.count('(') == content.count(')')
            brackets_balanced = content.count('[') == content.count(']')
            
            syntax_ok = braces_balanced and parens_balanced and brackets_balanced
            
            # Arquivo válido
            if syntax_ok:
                valid_files += 1
                details = f"sintaxe_ok={syntax_ok}; estruturas={','.join(basic_checks) if basic_checks else 'básica'}"
                results.append(TestResult(f"JS: {js_file.name}", True, details))
            else:
                results.append(TestResult(f"JS: {js_file.name}", False, "Balanceamento de símbolos incorreto"))
                
        except Exception as e:
            results.append(TestResult(f"JS: {js_file.name}", False, f"Erro ao ler: {str(e)}"))
    
    # Resumo da validação
    results.append(TestResult("Validação JS completa", True, f"{valid_files}/{len(all_js_files)} arquivos válidos"))
    
    return results


def run_html_tests(port: int) -> List[TestResult]:
    """Executa testes específicos dos arquivos HTML."""
    results: List[TestResult] = []
    
    print("\n🌐 Executando testes HTML...")
    
    # Páginas do sistema de gerenciamento de usuários e outras páginas importantes
    test_pages = [
        ("/secure/super-admin-setup.html", "Configuração", ["super", "admin", "configuração"]),
        ("/secure/request-access-enhanced.html", "Solicitação Enhanced", ["solicitar", "acesso", "usuário"]),
        ("/secure/approval-requests.html", "Aprovação", ["aprovação", "solicitações", "admin"]),
        ("/secure/admin-users.html", "Admin Users", ["admin", "usuários", "gerenciar"]),
        ("/secure/admin-logs.html", "Admin Logs", ["admin", "logs", "auditoria"]),
        ("/secure/historia.html", "História", ["história", "área 51", "narrativa"]),
        ("/secure/access-denied.html", "Acesso Negado", ["acesso", "negado", "não autorizado"]),
        ("/secure/consent.html", "Consentimento", ["consentimento", "termos", "aceitar"]),
        ("/secure/request-access.html", "Solicitação Básica", ["solicitar", "acesso"]),
        ("/secure/testes/test-runner.html", "Test Runner", ["test", "runner", "jest"])
    ]
    
    for path, name, keywords in test_pages:
        try:
            status, body = fetch(path, port)
            
            # Verificar status HTTP
            status_ok = status == 200
            
            # Verificar se contém palavras-chave relevantes
            body_lower = body.lower()
            contains_keywords = any(keyword.lower() in body_lower for keyword in keywords)
            
            # Verificar estrutura HTML básica
            has_html_structure = all(tag in body_lower for tag in ['<html', '<head', '<body'])
            
            success = status_ok and contains_keywords and has_html_structure
            
            details = f"status={status}; keywords={contains_keywords}; structure={has_html_structure}"
            
            results.append(TestResult(f"HTML: {name}", success, details))
            
        except urllib.error.URLError as exc:
            results.append(TestResult(f"HTML: {name}", False, f"erro: {exc}"))
    
    return results


def main() -> int:
    if not PROJECT_ROOT.joinpath("index.html").exists():
        print("[ERRO] index.html não encontrado na raiz do projeto.")
        return 1

    print("🚀 CaraCore - Execução Completa de Testes")
    print("=" * 50)
    
    all_results = []
    
    # 1. Executar testes básicos de páginas (HTTP)
    print("\n📄 Executando testes básicos de páginas...")
    with start_test_server() as port:
        basic_results = run_tests(port)
        all_results.extend(basic_results)
        
        # 2. Executar testes HTML específicos
        html_results = run_html_tests(port)
        all_results.extend(html_results)
    
    # 3. Validar arquivos JavaScript da aplicação
    js_validation_results = validate_javascript_files()
    all_results.extend(js_validation_results)
    
    # 4. Executar testes JavaScript (Jest)
    js_results = run_javascript_tests()
    all_results.extend(js_results)
    
    # Exibir resultados consolidados
    print("\n" + "=" * 50)
    print("📊 RELATÓRIO FINAL DE TESTES")
    print("=" * 50)
    
    # Categorizar resultados
    basic_tests = [r for r in basic_results if r.name.startswith(('index.html', 'Link Área 51', 'secure/'))]
    html_tests = [r for r in html_results if r.name.startswith('HTML:')]
    js_validation_tests = [r for r in js_validation_results]
    js_jest_tests = [r for r in js_results]
    
    # Mostrar estatísticas por categoria
    def show_category_stats(tests, category_name):
        if not tests:
            return
        
        passed = sum(1 for t in tests if t.success)
        total = len(tests)
        print(f"\n{category_name}: {passed}/{total} passaram")
        
        for result in tests:
            status = "✅ OK" if result.success else "❌ FALHA"
            details = f" ({result.details})" if result.details else ""
            print(f"  {status} :: {result.name}{details}")
    
    show_category_stats(basic_tests, "🌐 Testes Básicos de Páginas")
    show_category_stats(html_tests, "📄 Testes HTML Específicos")
    show_category_stats(js_validation_tests, "📝 Validação JavaScript")
    show_category_stats(js_jest_tests, "🧪 Testes JavaScript (Jest)")
    
    # Resultado geral (excluir falhas de dependências opcionais)
    optional_failures = ["Node.js disponível", "npx disponível", "npm disponível"]
    critical_results = [r for r in all_results if r.name not in optional_failures]
    optional_results = [r for r in all_results if r.name in optional_failures]
    
    critical_ok = all(result.success for result in critical_results)
    total_tests = len(all_results)
    passed_tests = sum(1 for result in all_results if result.success)
    
    print(f"\n{'=' * 50}")
    
    # Mostrar status de dependências opcionais
    if optional_results:
        failed_optional = [r for r in optional_results if not r.success]
        if failed_optional:
            print("⚠️  Dependências opcionais não disponíveis:")
            for result in failed_optional:
                print(f"  • {result.name}: {result.details}")
            print()
    
    if critical_ok:
        print(f"🎉 SUCESSO: Todos os testes críticos passaram!")
        print(f"📊 Total: {passed_tests}/{total_tests} testes passaram")
        return 0
    else:
        print(f"❌ FALHAS: {passed_tests}/{total_tests} testes passaram")
        failed_critical = [r for r in critical_results if not r.success]
        if failed_critical:
            print(f"\nTestes críticos que falharam:")
            for result in failed_critical:
                print(f"  • {result.name}: {result.details}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())

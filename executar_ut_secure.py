#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
executar_ut_secure.py - Script para executar testes unitários da Área Secure (OIDC)

Este script executa os testes unitários JavaScript para autenticação OIDC
da área restrita do sistema CaraCore.

Uso:
    python executar_ut_secure.py [opções]

Opções:
    --headless    Executa testes sem abrir navegador (usando Selenium)
    --port PORT   Porta para o servidor HTTP (padrão: 8080)
    --verbose     Modo verboso com logs detalhados
    --output      Salva relatório em arquivo
    --help        Mostra esta ajuda

Exemplos:
    python executar_ut_secure.py
    python executar_ut_secure.py --headless --verbose
    python executar_ut_secure.py --port 9000 --output
"""

import os
import sys
import subprocess
import time
import threading
import webbrowser
import argparse
import json
from datetime import datetime
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import socket

class SecureTestRunner:
    def __init__(self, port=8080, headless=False, verbose=False, output=False):
        self.port = port
        self.headless = headless
        self.verbose = verbose
        self.output = output
        self.server = None
        self.server_thread = None
        self.test_dir = Path(__file__).parent / 'secure' / 'testes'
        self.results = {
            'timestamp': datetime.now().isoformat(),
            'tests': {},
            'summary': {}
        }

    def log(self, message, level='INFO'):
        """Log com timestamp"""
        if self.verbose or level in ['ERROR', 'WARNING']:
            timestamp = datetime.now().strftime('%H:%M:%S')
            print(f"[{timestamp}] {level}: {message}")

    def check_port_available(self, port):
        """Verifica se a porta está disponível"""
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(('localhost', port))
                return True
            except OSError:
                return False

    def find_available_port(self, start_port=8080):
        """Encontra uma porta disponível"""
        port = start_port
        while port < start_port + 100:
            if self.check_port_available(port):
                return port
            port += 1
        raise Exception("Nenhuma porta disponível encontrada")

    def start_http_server(self):
        """Inicia servidor HTTP para servir os testes"""
        if not self.check_port_available(self.port):
            self.log(f"Porta {self.port} ocupada, procurando porta disponível...", 'WARNING')
            self.port = self.find_available_port(self.port)
            self.log(f"Usando porta {self.port}")

        os.chdir(self.test_dir)
        
        class QuietHTTPRequestHandler(SimpleHTTPRequestHandler):
            def log_message(self, format, *args):
                if self.verbose:
                    super().log_message(format, *args)
        
        Handler = QuietHTTPRequestHandler if not self.verbose else SimpleHTTPRequestHandler
        self.server = HTTPServer(('localhost', self.port), Handler)
        
        def run_server():
            self.log(f"Servidor HTTP iniciado em http://localhost:{self.port}")
            self.server.serve_forever()
        
        self.server_thread = threading.Thread(target=run_server, daemon=True)
        self.server_thread.start()
        time.sleep(1)  # Aguarda servidor inicializar

    def stop_http_server(self):
        """Para o servidor HTTP"""
        if self.server:
            self.server.shutdown()
            self.server.server_close()
            self.log("Servidor HTTP finalizado")

    def run_headless_tests(self):
        """Executa testes usando Selenium em modo headless"""
        try:
            from selenium import webdriver
            from selenium.webdriver.chrome.options import Options
            from selenium.webdriver.common.by import By
            from selenium.webdriver.support.ui import WebDriverWait
            from selenium.webdriver.support import expected_conditions as EC
            
            self.log("Iniciando testes em modo headless com Selenium")
            
            chrome_options = Options()
            chrome_options.add_argument('--headless')
            chrome_options.add_argument('--no-sandbox')
            chrome_options.add_argument('--disable-dev-shm-usage')
            chrome_options.add_argument('--disable-gpu')
            chrome_options.add_argument('--window-size=1920,1080')
            
            driver = webdriver.Chrome(options=chrome_options)
            
            try:
                url = f"http://localhost:{self.port}/test-runner.html"
                self.log(f"Acessando: {url}")
                driver.get(url)
                
                # Aguarda página carregar
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.CLASS_NAME, "run-all-button"))
                )
                
                # Clica no botão para executar todos os testes
                run_button = driver.find_element(By.CLASS_NAME, "run-all-button")
                driver.execute_script("arguments[0].click();", run_button)
                self.log("Executando todos os testes...")
                
                # Aguarda execução dos testes (máximo 60 segundos)
                WebDriverWait(driver, 60).until(
                    lambda d: "Executando" not in run_button.text
                )
                
                # Coleta resultados
                self.collect_test_results(driver)
                
                self.log("Testes headless concluídos com sucesso")
                return True
                
            finally:
                driver.quit()
                
        except ImportError:
            self.log("Selenium não instalado. Use: pip install selenium", 'ERROR')
            return False
        except Exception as e:
            self.log(f"Erro durante testes headless: {e}", 'ERROR')
            return False

    def collect_test_results(self, driver):
        """Coleta resultados dos testes da página"""
        try:
            # Coleta estatísticas de cada teste
            test_types = ['framework', 'config', 'jwt', 'error', 'google', 'entra', 'dual']
            
            for test_type in test_types:
                try:
                    total_elem = driver.find_element(By.ID, f"{test_type}-total")
                    pass_elem = driver.find_element(By.ID, f"{test_type}-pass")
                    fail_elem = driver.find_element(By.ID, f"{test_type}-fail")
                    
                    self.results['tests'][test_type] = {
                        'total': int(total_elem.text),
                        'pass': int(pass_elem.text),
                        'fail': int(fail_elem.text)
                    }
                except Exception as e:
                    self.log(f"Erro coletando resultados de {test_type}: {e}", 'WARNING')
            
            # Calcula resumo total
            total_tests = sum(test['total'] for test in self.results['tests'].values())
            total_pass = sum(test['pass'] for test in self.results['tests'].values())
            total_fail = sum(test['fail'] for test in self.results['tests'].values())
            
            self.results['summary'] = {
                'total': total_tests,
                'pass': total_pass,
                'fail': total_fail,
                'success_rate': round((total_pass / total_tests) * 100, 2) if total_tests > 0 else 0
            }
            
        except Exception as e:
            self.log(f"Erro coletando resultados: {e}", 'ERROR')

    def run_browser_tests(self):
        """Executa testes abrindo navegador"""
        url = f"http://localhost:{self.port}/test-runner.html"
        self.log(f"Abrindo navegador: {url}")
        
        try:
            webbrowser.open(url)
            self.log("Navegador aberto. Execute os testes manualmente.")
            self.log("Pressione Ctrl+C para finalizar o servidor quando terminar.")
            
            # Mantém servidor rodando
            try:
                while True:
                    time.sleep(1)
            except KeyboardInterrupt:
                self.log("Finalizando...")
                return True
                
        except Exception as e:
            self.log(f"Erro abrindo navegador: {e}", 'ERROR')
            return False

    def save_results(self):
        """Salva resultados em arquivo JSON"""
        if not self.results['tests']:
            self.log("Nenhum resultado para salvar", 'WARNING')
            return
        
        output_file = Path(__file__).parent / f"test_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        try:
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(self.results, f, indent=2, ensure_ascii=False)
            
            self.log(f"Resultados salvos em: {output_file}")
            
        except Exception as e:
            self.log(f"Erro salvando resultados: {e}", 'ERROR')

    def print_results(self):
        """Imprime resumo dos resultados"""
        if not self.results['tests']:
            return
        
        print("\n" + "="*60)
        print("📊 RESUMO DOS TESTES UNITÁRIOS - ÁREA SECURE")
        print("="*60)
        
        for test_type, stats in self.results['tests'].items():
            status = "✅" if stats['fail'] == 0 else "❌"
            print(f"{status} {test_type.upper():12} | Total: {stats['total']:2} | Pass: {stats['pass']:2} | Fail: {stats['fail']:2}")
        
        print("-"*60)
        summary = self.results['summary']
        overall_status = "🎉" if summary['fail'] == 0 else "⚠️"
        print(f"{overall_status} TOTAL GERAL    | Total: {summary['total']:2} | Pass: {summary['pass']:2} | Fail: {summary['fail']:2}")
        print(f"📈 Taxa de Sucesso: {summary['success_rate']}%")
        print("="*60)

    def check_dependencies(self):
        """Verifica dependências necessárias"""
        self.log("Verificando dependências...")
        
        # Verifica se está no diretório correto
        if not self.test_dir.exists():
            self.log(f"Diretório de testes não encontrado: {self.test_dir}", 'ERROR')
            return False
        
        # Verifica arquivos de teste
        test_files = [
            'test-runner.html',
            'test-framework.js',
            'test-config-validation.js',
            'test-jwt-validation.js',
            'test-error-handling.js',
            'test-google-auth.js',
            'test-entra-auth.js',
            'test-dual-auth.js'
        ]
        
        missing_files = []
        for file in test_files:
            if not (self.test_dir / file).exists():
                missing_files.append(file)
        
        if missing_files:
            self.log(f"Arquivos de teste não encontrados: {missing_files}", 'ERROR')
            return False
        
        self.log("Todas as dependências encontradas ✅")
        return True

    def run(self):
        """Executa o runner de testes"""
        print("EXECUTOR DE TESTES UNITARIOS - AREA SECURE")
        print("Sistema de Autenticacao OIDC - CaraCore")
        print("-" * 50)
        
        if not self.check_dependencies():
            return False
        
        try:
            self.start_http_server()
            
            if self.headless:
                success = self.run_headless_tests()
                if success and self.output:
                    self.save_results()
                if success:
                    self.print_results()
            else:
                success = self.run_browser_tests()
            
            return success
            
        except KeyboardInterrupt:
            self.log("Execução interrompida pelo usuário")
            return True
        except Exception as e:
            self.log(f"Erro durante execução: {e}", 'ERROR')
            return False
        finally:
            self.stop_http_server()

def main():
    parser = argparse.ArgumentParser(
        description='Executor de Testes Unitários - Área Secure OIDC',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos de uso:
  python executar_ut_secure.py                    # Modo interativo (abre navegador)
  python executar_ut_secure.py --headless         # Modo headless (sem navegador)
  python executar_ut_secure.py --verbose          # Com logs detalhados
  python executar_ut_secure.py --headless --output # Headless + salva resultados
  python executar_ut_secure.py --port 9000        # Usa porta específica
        """
    )
    
    parser.add_argument('--headless', action='store_true',
                       help='Executa em modo headless (requer Selenium)')
    parser.add_argument('--port', type=int, default=8080,
                       help='Porta para o servidor HTTP (padrão: 8080)')
    parser.add_argument('--verbose', action='store_true',
                       help='Modo verboso com logs detalhados')
    parser.add_argument('--output', action='store_true',
                       help='Salva relatório de resultados em arquivo JSON')
    
    args = parser.parse_args()
    
    # Instancia o runner com as opções
    runner = SecureTestRunner(
        port=args.port,
        headless=args.headless,
        verbose=args.verbose,
        output=args.output
    )
    
    # Executa os testes
    success = runner.run()
    
    # Retorna código de saída apropriado
    sys.exit(0 if success else 1)

if __name__ == '__main__':
    main()
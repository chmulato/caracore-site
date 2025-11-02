#!/usr/bin/env python3
"""
Script para executar testes do sistema de autorização - Fase 4 Item 13

Autor: Claude AI Assistant
Data: 02/11/2024

Uso:
    python run_tests.py                    # Executar todos os testes
    python run_tests.py --unit            # Apenas testes unitários
    python run_tests.py --integration     # Apenas testes de integração
    python run_tests.py --coverage        # Com relatório de cobertura
    python run_tests.py --verbose         # Saída detalhada
"""

import os
import sys
import subprocess
import argparse
from pathlib import Path

# Diretório raiz do projeto
PROJECT_ROOT = Path(__file__).parent
BACKEND_DIR = PROJECT_ROOT / "backend"
TESTS_DIR = BACKEND_DIR / "tests"

def setup_environment():
    """Configura ambiente para execução dos testes"""
    # Adicionar backend ao PYTHONPATH
    if str(BACKEND_DIR) not in sys.path:
        sys.path.insert(0, str(BACKEND_DIR))
    
    # Definir variáveis de ambiente
    os.environ['PYTHONPATH'] = str(BACKEND_DIR)
    os.environ['TESTING'] = 'true'

def install_test_dependencies():
    """Instala dependências necessárias para testes"""
    print("📦 Verificando dependências de teste...")
    
    dependencies = [
        'pytest>=7.0.0',
        'pytest-cov>=4.0.0',
        'pytest-mock>=3.10.0',
        'coverage>=7.0.0'
    ]
    
    try:
        for dep in dependencies:
            subprocess.run([
                sys.executable, '-m', 'pip', 'install', dep
            ], check=True, capture_output=True)
        print("✅ Dependências instaladas com sucesso")
    except subprocess.CalledProcessError as e:
        print(f"❌ Erro ao instalar dependências: {e}")
        return False
    
    return True

def run_tests(test_type=None, coverage=False, verbose=False):
    """Executa os testes com configurações especificadas"""
    
    # Configurar comando pytest
    cmd = [sys.executable, '-m', 'pytest']
    
    # Adicionar diretório de testes
    cmd.append(str(TESTS_DIR))
    
    # Filtros por tipo de teste
    if test_type == 'unit':
        cmd.extend(['-m', 'unit'])
        print("🧪 Executando testes unitários...")
    elif test_type == 'integration':
        cmd.extend(['-m', 'integration'])
        print("🔗 Executando testes de integração...")
    else:
        print("🚀 Executando todos os testes...")
    
    # Configurar verbosidade
    if verbose:
        cmd.append('-v')
        cmd.append('-s')
    else:
        cmd.append('-q')
    
    # Configurar cobertura
    if coverage:
        cmd.extend([
            '--cov=backend',
            '--cov-report=html',
            '--cov-report=term-missing',
            '--cov-report=xml'
        ])
        print("📊 Executando com relatório de cobertura...")
    
    # Configurações adicionais
    cmd.extend([
        '--tb=short',  # Traceback mais limpo
        '--strict-markers',  # Validar marcadores
        '--color=yes'  # Colorir saída
    ])
    
    print(f"💻 Comando: {' '.join(cmd)}")
    print("-" * 60)
    
    # Executar testes
    try:
        result = subprocess.run(cmd, cwd=PROJECT_ROOT)
        return result.returncode == 0
    except KeyboardInterrupt:
        print("\n❌ Testes interrompidos pelo usuário")
        return False
    except Exception as e:
        print(f"❌ Erro ao executar testes: {e}")
        return False

def generate_test_report():
    """Gera relatório resumido dos testes"""
    print("\n" + "=" * 60)
    print("📋 RELATÓRIO DE TESTES - SISTEMA DE AUTORIZAÇÃO")
    print("=" * 60)
    
    # Verificar arquivos de teste
    test_files = list(TESTS_DIR.glob("test_*.py"))
    print(f"📁 Arquivos de teste encontrados: {len(test_files)}")
    
    for test_file in test_files:
        print(f"   • {test_file.name}")
    
    # Verificar cobertura se existe
    coverage_html = PROJECT_ROOT / "htmlcov" / "index.html"
    if coverage_html.exists():
        print(f"\n📊 Relatório de cobertura disponível em: {coverage_html}")
    
    print("\n✅ Relatório gerado com sucesso!")

def main():
    """Função principal"""
    parser = argparse.ArgumentParser(
        description='Executar testes do sistema de autorização CaraCore'
    )
    
    parser.add_argument(
        '--unit',
        action='store_true',
        help='Executar apenas testes unitários'
    )
    
    parser.add_argument(
        '--integration', 
        action='store_true',
        help='Executar apenas testes de integração'
    )
    
    parser.add_argument(
        '--coverage',
        action='store_true',
        help='Gerar relatório de cobertura'
    )
    
    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Saída detalhada'
    )
    
    parser.add_argument(
        '--install-deps',
        action='store_true',
        help='Instalar dependências antes de executar'
    )
    
    parser.add_argument(
        '--report',
        action='store_true',
        help='Gerar apenas relatório (sem executar testes)'
    )
    
    args = parser.parse_args()
    
    # Banner
    print("🔐 SISTEMA DE AUTORIZAÇÃO - CARA CORE")
    print("    Fase 4 - Item 13: Testes Automatizados")
    print("    Autor: Claude AI Assistant")
    print("=" * 50)
    
    # Configurar ambiente
    setup_environment()
    
    # Instalar dependências se solicitado
    if args.install_deps:
        if not install_test_dependencies():
            sys.exit(1)
    
    # Apenas relatório
    if args.report:
        generate_test_report()
        sys.exit(0)
    
    # Determinar tipo de teste
    test_type = None
    if args.unit:
        test_type = 'unit'
    elif args.integration:
        test_type = 'integration'
    
    # Executar testes
    success = run_tests(
        test_type=test_type,
        coverage=args.coverage,
        verbose=args.verbose
    )
    
    # Gerar relatório final
    if success:
        generate_test_report()
        print("\n🎉 Todos os testes executados com sucesso!")
        sys.exit(0)
    else:
        print("\n❌ Alguns testes falharam. Verifique a saída acima.")
        sys.exit(1)

if __name__ == '__main__':
    main()
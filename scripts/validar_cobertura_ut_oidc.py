#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
validar_cobertura_ut_oidc.py - Validador de Cobertura de Testes Unitários OIDC

Este script analisa a cobertura de testes unitários para as páginas OIDC
da área segura, identificando:
- Páginas HTML/JS que devem ser testadas
- Testes existentes e sua cobertura
- Funcionalidades OIDC cobertas
- Gaps de cobertura

Uso:
    python validar_cobertura_ut_oidc.py [opções]

Opções:
    --detailed    Análise detalhada de cada arquivo
    --html        Gera relatório HTML
    --json        Salva resultados em JSON
    --verbose     Logs detalhados
    --help        Mostra esta ajuda

Exemplos:
    python validar_cobertura_ut_oidc.py --detailed --html
    python validar_cobertura_ut_oidc.py --json --verbose
"""

import os
import re
import json
import argparse
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Set, Tuple, Any
import html

class OIDCCoverageAnalyzer:
    def __init__(self, secure_dir: Path, verbose: bool = False):
        self.secure_dir = secure_dir
        self.testes_dir = secure_dir / 'testes'
        self.verbose = verbose
        
        # Funcionalidades OIDC críticas que devem ser testadas
        self.critical_oidc_features = {
            'authentication': ['login', 'logout', 'token', 'authorize'],
            'providers': ['google', 'microsoft', 'entra', 'azure'],
            'security': ['jwt', 'pkce', 'state', 'nonce', 'csrf'],
            'config': ['authority', 'clientId', 'redirectUri', 'scope'],
            'error_handling': ['invalid_token', 'expired', 'network_error', 'auth_failed'],
            'ui_flows': ['callback', 'popup', 'redirect', 'silent'],
            'validation': ['token_validation', 'issuer_check', 'audience_check']
        }
        
        self.results = {
            'timestamp': datetime.now().isoformat(),
            'pages': {},
            'tests': {},
            'coverage': {},
            'gaps': [],
            'summary': {}
        }

    def log(self, message: str, level: str = 'INFO'):
        """Log com timestamp se verbose ativo"""
        if self.verbose or level in ['ERROR', 'WARNING']:
            timestamp = datetime.now().strftime('%H:%M:%S')
            print(f"[{timestamp}] {level}: {message}")

    def scan_secure_pages(self) -> Dict[str, Dict]:
        """Escaneia páginas na área segura"""
        self.log("Escaneando páginas da área segura...")
        
        pages = {}
        
        # Arquivos HTML
        html_files = list(self.secure_dir.glob("*.html"))
        for html_file in html_files:
            pages[html_file.name] = self.analyze_html_file(html_file)
        
        # Arquivos JavaScript principais
        js_files = [f for f in self.secure_dir.glob("*.js") 
                   if not f.name.startswith('test-')]
        for js_file in js_files:
            pages[js_file.name] = self.analyze_js_file(js_file)
        
        # Arquivos em subpastas importantes
        for subdir in ['js', 'assets', 'config']:
            subdir_path = self.secure_dir / subdir
            if subdir_path.exists():
                for js_file in subdir_path.glob("*.js"):
                    rel_path = f"{subdir}/{js_file.name}"
                    pages[rel_path] = self.analyze_js_file(js_file)
        
        return pages

    def analyze_html_file(self, html_file: Path) -> Dict:
        """Analisa arquivo HTML para funcionalidades OIDC"""
        try:
            content = html_file.read_text(encoding='utf-8')
            
            analysis = {
                'type': 'html',
                'size': len(content),
                'oidc_features': [],
                'critical_functions': [],
                'security_elements': [],
                'test_priority': 'low'
            }
            
            # Detecta funcionalidades OIDC
            for category, features in self.critical_oidc_features.items():
                for feature in features:
                    if re.search(rf'\b{feature}\b', content, re.IGNORECASE):
                        analysis['oidc_features'].append(f"{category}:{feature}")
            
            # Funções críticas
            critical_patterns = [
                r'function\s+(\w*login\w*)',
                r'function\s+(\w*logout\w*)',
                r'function\s+(\w*auth\w*)',
                r'function\s+(\w*token\w*)',
                r'(\w*\.login\w*)',
                r'(\w*\.logout\w*)'
            ]
            
            for pattern in critical_patterns:
                matches = re.findall(pattern, content, re.IGNORECASE)
                analysis['critical_functions'].extend(matches)
            
            # Elementos de segurança
            security_patterns = [
                r'(state\s*=)',
                r'(nonce\s*=)',
                r'(code_verifier)',
                r'(code_challenge)',
                r'(access_token)',
                r'(id_token)'
            ]
            
            for pattern in security_patterns:
                if re.search(pattern, content, re.IGNORECASE):
                    analysis['security_elements'].append(pattern.strip('()'))
            
            # Determina prioridade de teste
            if any('login' in f or 'auth' in f for f in analysis['oidc_features']):
                analysis['test_priority'] = 'critical'
            elif analysis['oidc_features']:
                analysis['test_priority'] = 'high'
            
            return analysis
            
        except Exception as e:
            self.log(f"Erro analisando {html_file}: {e}", 'ERROR')
            return {'type': 'html', 'error': str(e)}

    def analyze_js_file(self, js_file: Path) -> Dict:
        """Analisa arquivo JavaScript para funcionalidades OIDC"""
        try:
            content = js_file.read_text(encoding='utf-8')
            
            analysis = {
                'type': 'javascript',
                'size': len(content),
                'oidc_features': [],
                'functions': [],
                'api_calls': [],
                'security_checks': [],
                'test_priority': 'medium'
            }
            
            # Detecta funcionalidades OIDC
            for category, features in self.critical_oidc_features.items():
                for feature in features:
                    if re.search(rf'\b{feature}\b', content, re.IGNORECASE):
                        analysis['oidc_features'].append(f"{category}:{feature}")
            
            # Funções JavaScript
            function_patterns = [
                r'function\s+(\w+)',
                r'(\w+)\s*[:=]\s*function',
                r'(\w+)\s*=>\s*{',
                r'async\s+function\s+(\w+)'
            ]
            
            for pattern in function_patterns:
                matches = re.findall(pattern, content)
                analysis['functions'].extend([m for m in matches if m])
            
            # Chamadas de API
            api_patterns = [
                r'fetch\s*\(\s*["\']([^"\']+)',
                r'axios\.\w+\s*\(\s*["\']([^"\']+)',
                r'\.post\s*\(\s*["\']([^"\']+)',
                r'\.get\s*\(\s*["\']([^"\']+)'
            ]
            
            for pattern in api_patterns:
                matches = re.findall(pattern, content)
                analysis['api_calls'].extend(matches)
            
            # Verificações de segurança
            security_patterns = [
                r'validateToken',
                r'checkAuth',
                r'verifySignature',
                r'validateJWT',
                r'checkExpiry'
            ]
            
            for pattern in security_patterns:
                if re.search(pattern, content, re.IGNORECASE):
                    analysis['security_checks'].append(pattern)
            
            # Determina prioridade
            if 'auth' in js_file.name.lower() or 'login' in js_file.name.lower():
                analysis['test_priority'] = 'critical'
            elif analysis['oidc_features']:
                analysis['test_priority'] = 'high'
            
            return analysis
            
        except Exception as e:
            self.log(f"Erro analisando {js_file}: {e}", 'ERROR')
            return {'type': 'javascript', 'error': str(e)}

    def scan_existing_tests(self) -> Dict[str, Dict]:
        """Escaneia testes existentes"""
        self.log("Escaneando testes existentes...")
        
        tests = {}
        
        if not self.testes_dir.exists():
            self.log("Diretório de testes não encontrado", 'WARNING')
            return tests
        
        test_files = list(self.testes_dir.glob("test-*.js"))
        for test_file in test_files:
            tests[test_file.name] = self.analyze_test_file(test_file)
        
        return tests

    def analyze_test_file(self, test_file: Path) -> Dict:
        """Analisa arquivo de teste"""
        try:
            content = test_file.read_text(encoding='utf-8')
            
            analysis = {
                'type': 'test',
                'size': len(content),
                'test_count': 0,
                'covered_features': [],
                'test_cases': [],
                'assertions': 0
            }
            
            # Conta testes
            test_patterns = [
                r'it\s*\(\s*["\']([^"\']+)',
                r'test\s*\(\s*["\']([^"\']+)',
                r'describe\s*\(\s*["\']([^"\']+)'
            ]
            
            for pattern in test_patterns:
                matches = re.findall(pattern, content)
                analysis['test_cases'].extend(matches)
                analysis['test_count'] += len(matches)
            
            # Conta assertions
            assertion_patterns = [
                r'expect\s*\(',
                r'assert\s*\.',
                r'should\s*\.',
                r'\.to\.',
                r'\.toBe',
                r'\.toEqual'
            ]
            
            for pattern in assertion_patterns:
                analysis['assertions'] += len(re.findall(pattern, content))
            
            # Detecta funcionalidades cobertas
            for category, features in self.critical_oidc_features.items():
                for feature in features:
                    if re.search(rf'\b{feature}\b', content, re.IGNORECASE):
                        analysis['covered_features'].append(f"{category}:{feature}")
            
            return analysis
            
        except Exception as e:
            self.log(f"Erro analisando teste {test_file}: {e}", 'ERROR')
            return {'type': 'test', 'error': str(e)}

    def calculate_coverage(self, pages: Dict, tests: Dict) -> Dict:
        """Calcula cobertura de testes"""
        self.log("Calculando cobertura de testes...")
        
        coverage = {
            'by_feature': {},
            'by_file': {},
            'overall': {
                'total_features': 0,
                'covered_features': 0,
                'coverage_percentage': 0
            }
        }
        
        # Coleta todas as funcionalidades encontradas nas páginas
        all_page_features = set()
        for page, info in pages.items():
            if 'oidc_features' in info:
                all_page_features.update(info['oidc_features'])
        
        # Coleta funcionalidades cobertas pelos testes
        all_test_features = set()
        for test, info in tests.items():
            if 'covered_features' in info:
                all_test_features.update(info['covered_features'])
        
        # Calcula cobertura por funcionalidade
        for feature in all_page_features:
            coverage['by_feature'][feature] = {
                'tested': feature in all_test_features,
                'pages': [p for p, info in pages.items() 
                         if 'oidc_features' in info and feature in info['oidc_features']],
                'tests': [t for t, info in tests.items() 
                         if 'covered_features' in info and feature in info['covered_features']]
            }
        
        # Calcula cobertura por arquivo
        for page, info in pages.items():
            if 'oidc_features' in info:
                page_features = set(info['oidc_features'])
                covered = page_features.intersection(all_test_features)
                coverage['by_file'][page] = {
                    'total_features': len(page_features),
                    'covered_features': len(covered),
                    'coverage_percentage': (len(covered) / len(page_features) * 100) if page_features else 0,
                    'uncovered': list(page_features - covered)
                }
        
        # Cobertura geral
        coverage['overall']['total_features'] = len(all_page_features)
        coverage['overall']['covered_features'] = len(all_test_features.intersection(all_page_features))
        if all_page_features:
            coverage['overall']['coverage_percentage'] = (
                len(all_test_features.intersection(all_page_features)) / len(all_page_features) * 100
            )
        
        return coverage

    def identify_gaps(self, coverage: Dict) -> List[Dict]:
        """Identifica gaps de cobertura"""
        self.log("Identificando gaps de cobertura...")
        
        gaps = []
        
        # Funcionalidades críticas não cobertas
        for feature, info in coverage['by_feature'].items():
            if not info['tested']:
                category = feature.split(':')[0] if ':' in feature else 'unknown'
                gaps.append({
                    'type': 'missing_test',
                    'severity': 'critical' if category in ['authentication', 'security'] else 'high',
                    'feature': feature,
                    'pages': info['pages'],
                    'recommendation': f"Criar testes para '{feature}'"
                })
        
        # Arquivos com baixa cobertura
        for file, info in coverage['by_file'].items():
            if info['coverage_percentage'] < 50 and info['total_features'] > 0:
                gaps.append({
                    'type': 'low_coverage',
                    'severity': 'medium',
                    'file': file,
                    'coverage': info['coverage_percentage'],
                    'uncovered': info['uncovered'],
                    'recommendation': f"Aumentar cobertura de testes para {file}"
                })
        
        # Arquivos críticos sem testes
        critical_files = [f for f, info in coverage['by_file'].items() 
                         if info['coverage_percentage'] == 0 and info['total_features'] > 0]
        for file in critical_files:
            gaps.append({
                'type': 'no_coverage',
                'severity': 'critical',
                'file': file,
                'recommendation': f"Criar testes para {file}"
            })
        
        return sorted(gaps, key=lambda x: {'critical': 0, 'high': 1, 'medium': 2, 'low': 3}[x['severity']])

    def analyze(self) -> Dict:
        """Executa análise completa"""
        self.log("Iniciando análise de cobertura OIDC...")
        
        # Escaneia páginas e testes
        self.results['pages'] = self.scan_secure_pages()
        self.results['tests'] = self.scan_existing_tests()
        
        # Calcula cobertura
        self.results['coverage'] = self.calculate_coverage(
            self.results['pages'], 
            self.results['tests']
        )
        
        # Identifica gaps
        self.results['gaps'] = self.identify_gaps(self.results['coverage'])
        
        # Resumo
        self.results['summary'] = {
            'total_pages': len(self.results['pages']),
            'total_tests': len(self.results['tests']),
            'total_test_cases': sum(t.get('test_count', 0) for t in self.results['tests'].values()),
            'coverage_percentage': self.results['coverage']['overall']['coverage_percentage'],
            'critical_gaps': len([g for g in self.results['gaps'] if g['severity'] == 'critical']),
            'recommendations': len(self.results['gaps'])
        }
        
        self.log(f"Análise concluída: {self.results['summary']['coverage_percentage']:.1f}% de cobertura")
        return self.results

    def generate_report(self, detailed: bool = False) -> str:
        """Gera relatório de cobertura"""
        if not self.results['summary']:
            self.analyze()
        
        report = []
        report.append("📊 RELATÓRIO DE COBERTURA DE TESTES UNITÁRIOS OIDC")
        report.append("=" * 60)
        
        # Resumo
        summary = self.results['summary']
        report.append(f"\n📋 RESUMO GERAL:")
        report.append(f"Total de páginas analisadas: {summary['total_pages']}")
        report.append(f"Total de arquivos de teste: {summary['total_tests']}")
        report.append(f"Total de casos de teste: {summary['total_test_cases']}")
        report.append(f"Cobertura geral: {summary['coverage_percentage']:.1f}%")
        report.append(f"Gaps críticos: {summary['critical_gaps']}")
        
        # Cobertura por arquivo
        if detailed:
            report.append(f"\n📁 COBERTURA POR ARQUIVO:")
            for file, info in self.results['coverage']['by_file'].items():
                status = "✅" if info['coverage_percentage'] > 80 else "⚠️" if info['coverage_percentage'] > 50 else "❌"
                report.append(f"{status} {file}: {info['coverage_percentage']:.1f}% ({info['covered_features']}/{info['total_features']})")
        
        # Gaps principais
        report.append(f"\n🚨 PRINCIPAIS GAPS DE COBERTURA:")
        critical_gaps = [g for g in self.results['gaps'] if g['severity'] == 'critical'][:10]
        for gap in critical_gaps:
            report.append(f"❌ {gap['type'].upper()}: {gap.get('feature', gap.get('file'))}")
            report.append(f"   → {gap['recommendation']}")
        
        # Recomendações
        report.append(f"\n💡 RECOMENDAÇÕES:")
        coverage_pct = summary['coverage_percentage']
        if coverage_pct < 50:
            report.append("🔴 CRÍTICO: Cobertura muito baixa - priorizar criação de testes básicos")
        elif coverage_pct < 80:
            report.append("🟡 MÉDIO: Cobertura moderada - focar em funcionalidades críticas")
        else:
            report.append("🟢 BOM: Cobertura adequada - focar em casos edge e melhorias")
        
        return "\n".join(report)

    def save_json(self, filepath: Path):
        """Salva resultados em JSON"""
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, indent=2, ensure_ascii=False)
        self.log(f"Resultados salvos em: {filepath}")

    def generate_html_report(self, filepath: Path):
        """Gera relatório HTML"""
        if not self.results['summary']:
            self.analyze()
        
        html_content = self._create_html_template()
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html_content)
        self.log(f"Relatório HTML gerado: {filepath}")

    def _create_html_template(self) -> str:
        """Cria template HTML para o relatório"""
        summary = self.results['summary']
        coverage_pct = summary['coverage_percentage']
        
        # Determina cor da cobertura
        color = "#28a745" if coverage_pct > 80 else "#ffc107" if coverage_pct > 50 else "#dc3545"
        
        html = f"""
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Cobertura OIDC - Área Segura</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }}
        .container {{ max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
        .header {{ text-align: center; margin-bottom: 30px; }}
        .coverage-badge {{ display: inline-block; padding: 10px 20px; color: white; border-radius: 20px; font-weight: bold; background: {color}; }}
        .grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }}
        .card {{ border: 1px solid #ddd; border-radius: 8px; padding: 15px; background: #f9f9f9; }}
        .card h3 {{ margin-top: 0; color: #333; }}
        .progress-bar {{ width: 100%; height: 20px; background: #e9ecef; border-radius: 10px; overflow: hidden; }}
        .progress-fill {{ height: 100%; transition: width 0.3s; }}
        .gap {{ padding: 10px; margin: 5px 0; border-left: 4px solid; }}
        .gap.critical {{ border-color: #dc3545; background: #f8d7da; }}
        .gap.high {{ border-color: #fd7e14; background: #fff3cd; }}
        .gap.medium {{ border-color: #ffc107; background: #fff3cd; }}
        .stats {{ display: flex; justify-content: space-around; text-align: center; }}
        .stat {{ flex: 1; }}
        .stat-value {{ font-size: 2em; font-weight: bold; color: #007bff; }}
        .stat-label {{ color: #666; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Relatório de Cobertura de Testes OIDC</h1>
            <div class="coverage-badge">{coverage_pct:.1f}% de Cobertura</div>
            <p>Gerado em: {datetime.now().strftime('%d/%m/%Y às %H:%M:%S')}</p>
        </div>
        
        <div class="stats">
            <div class="stat">
                <div class="stat-value">{summary['total_pages']}</div>
                <div class="stat-label">Páginas</div>
            </div>
            <div class="stat">
                <div class="stat-value">{summary['total_tests']}</div>
                <div class="stat-label">Arquivos de Teste</div>
            </div>
            <div class="stat">
                <div class="stat-value">{summary['total_test_cases']}</div>
                <div class="stat-label">Casos de Teste</div>
            </div>
            <div class="stat">
                <div class="stat-value">{summary['critical_gaps']}</div>
                <div class="stat-label">Gaps Críticos</div>
            </div>
        </div>
        
        <div class="grid">
            <div class="card">
                <h3>📁 Cobertura por Arquivo</h3>
                {self._generate_file_coverage_html()}
            </div>
            
            <div class="card">
                <h3>🚨 Gaps Críticos</h3>
                {self._generate_gaps_html()}
            </div>
        </div>
        
        <div class="card">
            <h3>💡 Recomendações</h3>
            {self._generate_recommendations_html()}
        </div>
    </div>
</body>
</html>
"""
        return html

    def _generate_file_coverage_html(self) -> str:
        """Gera HTML para cobertura por arquivo"""
        html_parts = []
        for file, info in self.results['coverage']['by_file'].items():
            pct = info['coverage_percentage']
            color = "#28a745" if pct > 80 else "#ffc107" if pct > 50 else "#dc3545"
            html_parts.append(f"""
                <div style="margin: 10px 0;">
                    <div style="display: flex; justify-content: space-between;">
                        <span>{html.escape(file)}</span>
                        <span>{pct:.1f}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: {pct}%; background: {color};"></div>
                    </div>
                </div>
            """)
        return "".join(html_parts)

    def _generate_gaps_html(self) -> str:
        """Gera HTML para gaps"""
        html_parts = []
        critical_gaps = [g for g in self.results['gaps'] if g['severity'] == 'critical'][:10]
        for gap in critical_gaps:
            feature = gap.get('feature', gap.get('file', 'N/A'))
            html_parts.append(f"""
                <div class="gap {gap['severity']}">
                    <strong>{gap['type'].replace('_', ' ').title()}</strong><br>
                    {html.escape(feature)}<br>
                    <small>{html.escape(gap['recommendation'])}</small>
                </div>
            """)
        return "".join(html_parts) if html_parts else "<p>Nenhum gap crítico encontrado! 🎉</p>"

    def _generate_recommendations_html(self) -> str:
        """Gera HTML para recomendações"""
        coverage_pct = self.results['summary']['coverage_percentage']
        if coverage_pct < 50:
            return "<p>🔴 <strong>CRÍTICO:</strong> Cobertura muito baixa - priorizar criação de testes básicos</p>"
        elif coverage_pct < 80:
            return "<p>🟡 <strong>MÉDIO:</strong> Cobertura moderada - focar em funcionalidades críticas</p>"
        else:
            return "<p>🟢 <strong>BOM:</strong> Cobertura adequada - focar em casos edge e melhorias</p>"


def main():
    parser = argparse.ArgumentParser(
        description="Validador de Cobertura de Testes Unitários OIDC"
    )
    parser.add_argument(
        "--secure-dir",
        default=str(Path(__file__).parent.parent / "secure"),
        help="Diretório da área segura (padrão: ../secure)"
    )
    parser.add_argument(
        "--detailed",
        action="store_true",
        help="Análise detalhada de cada arquivo"
    )
    parser.add_argument(
        "--html",
        action="store_true",
        help="Gera relatório HTML"
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Salva resultados em JSON"
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Logs detalhados"
    )
    
    args = parser.parse_args()
    
    secure_dir = Path(args.secure_dir)
    if not secure_dir.exists():
        print(f"❌ Erro: Diretório não encontrado: {secure_dir}")
        return 1
    
    # Executa análise
    analyzer = OIDCCoverageAnalyzer(secure_dir, verbose=args.verbose)
    results = analyzer.analyze()
    
    # Gera relatório
    print(analyzer.generate_report(detailed=args.detailed))
    
    # Salva em formatos adicionais
    if args.json:
        json_path = Path("oidc_coverage_report.json")
        analyzer.save_json(json_path)
    
    if args.html:
        html_path = Path("oidc_coverage_report.html")
        analyzer.generate_html_report(html_path)
    
    return 0


if __name__ == "__main__":
    exit(main())
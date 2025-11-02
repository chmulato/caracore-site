#!/usr/bin/env python3
"""
Script de Execução Automatizada de Testes - CaraCore Fase 3
Executa todos os testes disponíveis e gera relatórios
"""
import subprocess
import sys
import os
import json
from datetime import datetime
from pathlib import Path


class TestRunner:
    """Executor de testes automatizados"""
    
    def __init__(self):
        self.backend_dir = Path(__file__).parent
        self.project_root = self.backend_dir.parent
        self.test_results = {
            "timestamp": datetime.now().isoformat(),
            "summary": {
                "total_suites": 0,
                "passed_suites": 0,
                "failed_suites": 0,
                "total_tests": 0,
                "passed_tests": 0,
                "failed_tests": 0,
                "skipped_tests": 0
            },
            "suites": []
        }
    
    def run_command(self, cmd, cwd=None):
        """Executa comando e retorna resultado"""
        try:
            result = subprocess.run(
                cmd, 
                shell=True, 
                capture_output=True, 
                text=True,
                cwd=cwd or self.backend_dir,
                timeout=300
            )
            return result
        except subprocess.TimeoutExpired:
            return None
    
    def run_pytest_suite(self, test_file, suite_name):
        """Executa uma suíte de testes pytest"""
        print(f"\n🧪 Executando {suite_name}...")
        print("=" * 60)
        
        cmd = f"python -m pytest {test_file} -v --tb=short --json-report --json-report-file=temp_result.json"
        result = self.run_command(cmd)
        
        suite_info = {
            "name": suite_name,
            "file": test_file,
            "status": "unknown",
            "tests": 0,
            "passed": 0,
            "failed": 0,
            "skipped": 0,
            "duration": 0,
            "output": ""
        }
        
        if result is None:
            suite_info["status"] = "timeout"
            suite_info["output"] = "Teste excedeu tempo limite (5 min)"
        elif result.returncode == 0:
            suite_info["status"] = "passed"
            print(f"✅ {suite_name} - PASSOU")
        else:
            suite_info["status"] = "failed"
            print(f"❌ {suite_name} - FALHOU")
        
        # Tentar ler relatório JSON
        json_file = self.backend_dir / "temp_result.json"
        if json_file.exists():
            try:
                with open(json_file, 'r') as f:
                    test_data = json.load(f)
                    summary = test_data.get('summary', {})
                    suite_info.update({
                        "tests": summary.get('total', 0),
                        "passed": summary.get('passed', 0),
                        "failed": summary.get('failed', 0),
                        "skipped": summary.get('skipped', 0),
                        "duration": test_data.get('duration', 0)
                    })
                json_file.unlink()  # Remover arquivo temporário
            except:
                pass
        
        suite_info["output"] = result.stdout if result else "Timeout"
        
        if result and result.stderr:
            suite_info["output"] += f"\n\nSTDERR:\n{result.stderr}"
        
        self.test_results["suites"].append(suite_info)
        self.test_results["summary"]["total_suites"] += 1
        
        if suite_info["status"] == "passed":
            self.test_results["summary"]["passed_suites"] += 1
        else:
            self.test_results["summary"]["failed_suites"] += 1
        
        self.test_results["summary"]["total_tests"] += suite_info["tests"]
        self.test_results["summary"]["passed_tests"] += suite_info["passed"]
        self.test_results["summary"]["failed_tests"] += suite_info["failed"]
        self.test_results["summary"]["skipped_tests"] += suite_info["skipped"]
        
        return suite_info["status"] == "passed"
    
    def run_custom_script(self, script_path, script_name):
        """Executa script customizado"""
        print(f"\n🔧 Executando {script_name}...")
        print("=" * 60)
        
        script_full_path = self.backend_dir / script_path
        if not script_full_path.exists():
            print(f"⚠️  Script não encontrado: {script_path}")
            return False
        
        result = self.run_command(f"python {script_path}")
        
        suite_info = {
            "name": script_name,
            "file": script_path,
            "status": "passed" if result and result.returncode == 0 else "failed",
            "tests": 1,
            "passed": 1 if result and result.returncode == 0 else 0,
            "failed": 0 if result and result.returncode == 0 else 1,
            "skipped": 0,
            "duration": 0,
            "output": result.stdout if result else "Falha na execução"
        }
        
        if result and result.stderr:
            suite_info["output"] += f"\n\nSTDERR:\n{result.stderr}"
        
        self.test_results["suites"].append(suite_info)
        self.test_results["summary"]["total_suites"] += 1
        
        if suite_info["status"] == "passed":
            self.test_results["summary"]["passed_suites"] += 1
            print(f"✅ {script_name} - PASSOU")
        else:
            self.test_results["summary"]["failed_suites"] += 1
            print(f"❌ {script_name} - FALHOU")
        
        self.test_results["summary"]["total_tests"] += 1
        self.test_results["summary"]["passed_tests"] += suite_info["passed"]
        self.test_results["summary"]["failed_tests"] += suite_info["failed"]
        
        return suite_info["status"] == "passed"
    
    def run_all_tests(self):
        """Executa todos os testes disponíveis"""
        print("🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯")
        print("   SUITE DE TESTES AUTOMATIZADOS CARACORE - FASE 3")
        print("🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯")
        
        all_passed = True
        
        # 1. Testes Unitários
        if not self.run_pytest_suite("tests/test_auth_manager.py", "Testes Unitários - Auth Manager"):
            all_passed = False
        
        # 2. Testes E2E
        if not self.run_pytest_suite("tests/test_e2e.py::TestEndpoints", "Testes E2E - Endpoints"):
            all_passed = False
        
        if not self.run_pytest_suite("tests/test_e2e.py::TestSecurityHeaders", "Testes E2E - Security Headers"):
            all_passed = False
        
        # 3. Scripts de Validação
        if not self.run_custom_script("validar_dashboard.py", "Validação Dashboard Azure"):
            all_passed = False
        
        # 4. Testes do Site (se disponível)
        site_test_script = self.project_root / "scripts" / "teste.py"
        if site_test_script.exists():
            result = self.run_command(f"python {site_test_script}", cwd=self.project_root)
            suite_info = {
                "name": "Teste Site Estático",
                "file": "scripts/teste.py",
                "status": "passed" if result and result.returncode == 0 else "failed",
                "tests": 1,
                "passed": 1 if result and result.returncode == 0 else 0,
                "failed": 0 if result and result.returncode == 0 else 1,
                "skipped": 0,
                "duration": 0,
                "output": result.stdout if result else "Falha na execução"
            }
            self.test_results["suites"].append(suite_info)
            self.test_results["summary"]["total_suites"] += 1
            self.test_results["summary"]["total_tests"] += 1
            
            if suite_info["status"] == "passed":
                self.test_results["summary"]["passed_suites"] += 1
                self.test_results["summary"]["passed_tests"] += 1
                print(f"\n✅ Teste Site Estático - PASSOU")
            else:
                self.test_results["summary"]["failed_suites"] += 1
                self.test_results["summary"]["failed_tests"] += 1
                print(f"\n❌ Teste Site Estático - FALHOU")
                all_passed = False
        
        return all_passed
    
    def generate_report(self):
        """Gera relatório final"""
        print("\n" + "=" * 70)
        print("📊 RESUMO DOS TESTES")
        print("=" * 70)
        
        summary = self.test_results["summary"]
        
        print(f"🧪 Total de Suítes: {summary['total_suites']}")
        print(f"✅ Suítes Passou: {summary['passed_suites']}")
        print(f"❌ Suítes Falhou: {summary['failed_suites']}")
        print()
        print(f"🔬 Total de Testes: {summary['total_tests']}")
        print(f"✅ Testes Passou: {summary['passed_tests']}")
        print(f"❌ Testes Falhou: {summary['failed_tests']}")
        print(f"⏭️  Testes Ignorados: {summary['skipped_tests']}")
        print()
        
        success_rate = (summary['passed_tests'] / summary['total_tests'] * 100) if summary['total_tests'] > 0 else 0
        print(f"📈 Taxa de Sucesso: {success_rate:.1f}%")
        
        # Salvar relatório JSON
        report_file = self.backend_dir / f"test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(self.test_results, f, indent=2, ensure_ascii=False)
        
        print(f"\n📄 Relatório salvo em: {report_file}")
        
        if summary['failed_tests'] == 0 and summary['failed_suites'] == 0:
            print("\n🎉 TODOS OS TESTES PASSARAM! 🎉")
            return True
        else:
            print(f"\n⚠️  {summary['failed_tests']} teste(s) falharam")
            return False


def main():
    """Função principal"""
    runner = TestRunner()
    
    # Verificar se estamos no diretório correto
    if not (runner.backend_dir / "pytest.ini").exists():
        print("❌ Execute este script a partir do diretório backend/")
        sys.exit(1)
    
    try:
        all_passed = runner.run_all_tests()
        success = runner.generate_report()
        
        print("\n" + "=" * 70)
        
        if success:
            print("🎯 AUTOMAÇÃO DE TESTES FASE 3: COMPLETA E FUNCIONAL")
            sys.exit(0)
        else:
            print("⚠️  ALGUNS TESTES FALHARAM - VERIFICAR RELATÓRIO")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n\n⚠️  Execução interrompida pelo usuário")
        sys.exit(130)
    except Exception as e:
        print(f"\n❌ Erro inesperado: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
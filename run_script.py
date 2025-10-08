#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Scripts CaraCore - Acesso Rápido

Este script facilita o acesso aos scripts Python movidos para a pasta scripts/

MIGRAÇÃO:
Todos os scripts Python foram organizados em: scripts/

USO:
    python run_script.py <nome_do_script> [argumentos]

EXEMPLOS:
    python run_script.py executar_ut_secure.py --headless --verbose
    python run_script.py smoke_teste_local.py
    python run_script.py deploy_to_azure.py

SCRIPTS DISPONÍVEIS:
    Para ver todos os scripts disponíveis:
    python run_script.py list
"""

import os
import sys
import subprocess
from pathlib import Path

def main():
    if len(sys.argv) < 2:
        print("Uso: python run_script.py <nome_do_script> [argumentos]")
        print("Para listar scripts: python run_script.py list")
        sys.exit(1)
    
    script_name = sys.argv[1]
    
    if script_name == "list":
        # Lista scripts disponíveis
        scripts_dir = Path(__file__).parent / "scripts"
        subprocess.run([sys.executable, str(scripts_dir / "index.py")])
        return
    
    # Executa o script na pasta scripts/
    scripts_dir = Path(__file__).parent / "scripts"
    script_path = scripts_dir / script_name
    
    if not script_path.exists():
        print(f"❌ Script '{script_name}' não encontrado em scripts/")
        print("Use 'python run_script.py list' para ver scripts disponíveis")
        sys.exit(1)
    
    # Muda para o diretório scripts e executa
    os.chdir(scripts_dir)
    args = [sys.executable, script_name] + sys.argv[2:]
    subprocess.run(args)

if __name__ == "__main__":
    main()
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Scripts CaraCore - Índice de Scripts Python

Este módulo contém todos os scripts Python do projeto CaraCore organizados
em categorias funcionais.

ESTRUTURA:
- scripts/           # Pasta principal dos scripts
- scripts/README_PY.md   # Documentação oficial dos scripts Python

CATEGORIAS DE SCRIPTS:

1. TESTES E VALIDAÇÃO:
   - executar_ut_secure.py        # Testes unitários da área segura (OIDC)
   - smoke_teste_local.py         # Smoke tests locais
   - teste_end_point_local.py     # Testes de endpoints locais
   - teste_end_point_azure.py     # Testes de endpoints Azure
   - teste_keyvault_azure.py      # Testes KeyVault Azure
   - teste_keyvault_simples.py    # Testes KeyVault simples
   - validar_api_azure.py         # Validação API Azure
   - endpoint_checks.py           # Verificações de endpoints
   - teste.py                     # Testes gerais

2. DEPLOY E INFRAESTRUTURA:
   - deploy_to_azure.py           # Deploy para Azure
   - deploy_helpers.py            # Helpers para deploy
   - infra_to_azure.py           # Infraestrutura Azure
   - checklist_infra.py          # Checklist de infraestrutura

3. TESTES AZURE:
   - executar_testes_azure.py          # Executor completo testes Azure
   - executar_testes_azure_simples.py  # Executor simples testes Azure

4. SERVIDOR E DESENVOLVIMENTO:
   - server.py                    # Servidor HTTP local

5. OIDC E AUTENTICAÇÃO:
   - test_oidc_login.py          # Testes login OIDC
   - test_oidc_login_full.py     # Testes login OIDC completos
   - validate_oidc_endpoints.py  # Validação endpoints OIDC

6. FERRAMENTAS DE BUILD:
   - package_backend_with_docker.py  # Empacotamento Docker
   - generate_prod_diffs.py          # Geração de diffs produção
   - snapshot_and_diff.py            # Snapshots e comparações

USO:
    cd scripts/
    python nome_do_script.py [opções]

EXEMPLOS:
    # Executar testes unitários da área segura
    python executar_ut_secure.py --headless --verbose
    
    # Smoke tests locais
    python smoke_teste_local.py
    
    # Deploy para Azure
    python deploy_to_azure.py
    
    # Testes OIDC
    python test_oidc_login.py

DOCUMENTAÇÃO:
    Para documentação detalhada, consulte: README_PY.md
"""

import os
import sys
from pathlib import Path

def list_scripts():
    """Lista todos os scripts Python disponíveis"""
    script_dir = Path(__file__).parent
    py_files = sorted(script_dir.glob("*.py"))
    
    print("📝 SCRIPTS PYTHON DISPONÍVEIS:")
    print("=" * 50)
    
    categories = {
        "🧪 TESTES E VALIDAÇÃO": [
            "executar_ut_secure.py", "smoke_teste_local.py", 
            "teste_end_point_local.py", "teste_end_point_azure.py",
            "teste_keyvault_azure.py", "teste_keyvault_simples.py",
            "validar_api_azure.py", "endpoint_checks.py", "teste.py"
        ],
        "🚀 DEPLOY E INFRAESTRUTURA": [
            "deploy_to_azure.py", "deploy_helpers.py", 
            "infra_to_azure.py", "checklist_infra.py"
        ],
        "☁️ TESTES AZURE": [
            "executar_testes_azure.py", "executar_testes_azure_simples.py"
        ],
        "🖥️ SERVIDOR": [
            "server.py"
        ],
        "🔐 OIDC E AUTENTICAÇÃO": [
            "test_oidc_login.py", "test_oidc_login_full.py", 
            "validate_oidc_endpoints.py"
        ],
        "🔧 FERRAMENTAS DE BUILD": [
            "package_backend_with_docker.py", "generate_prod_diffs.py", 
            "snapshot_and_diff.py"
        ]
    }
    
    for category, scripts in categories.items():
        print(f"\n{category}:")
        for script in scripts:
            if (script_dir / script).exists():
                print(f"  ✅ {script}")
            else:
                print(f"  ❌ {script} (não encontrado)")
    
    print(f"\n📚 Documentação: README_PY.md")
    print(f"📍 Localização: {script_dir}")

if __name__ == "__main__":
    list_scripts()
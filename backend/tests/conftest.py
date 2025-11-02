"""
Configuração para testes do sistema de autorização - Fase 4 Item 13

Autor: Claude AI Assistant  
Data: 02/11/2024
"""

import pytest
import os
import sys
import tempfile
import shutil
from pathlib import Path

# Adicionar o diretório backend ao path para importações
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

@pytest.fixture(scope="session")
def test_data_dir():
    """Diretório temporário para dados de teste da sessão"""
    temp_dir = tempfile.mkdtemp(prefix="cara_core_auth_tests_")
    yield temp_dir
    shutil.rmtree(temp_dir)

@pytest.fixture(scope="function")
def clean_test_data():
    """Limpa dados entre testes"""
    yield
    # Cleanup após cada teste se necessário

# Configurações para todos os testes
@pytest.fixture(autouse=True)
def configure_test_environment():
    """Configura ambiente de teste automaticamente"""
    # Definir variáveis de ambiente para testes
    os.environ['TESTING'] = 'true'
    os.environ['LOG_LEVEL'] = 'DEBUG'
    
    yield
    
    # Cleanup após testes
    if 'TESTING' in os.environ:
        del os.environ['TESTING']
    if 'LOG_LEVEL' in os.environ:
        del os.environ['LOG_LEVEL']

# Dados de exemplo reutilizáveis
@pytest.fixture
def sample_admin_user():
    """Usuário admin de exemplo"""
    return {
        'email': 'admin@test.com',
        'name': 'Admin Test',
        'provider': 'google',
        'role': 'admin'
    }

@pytest.fixture  
def sample_regular_user():
    """Usuário regular de exemplo"""
    return {
        'email': 'user@test.com',
        'name': 'User Test', 
        'provider': 'google',
        'role': 'user'
    }

@pytest.fixture
def sample_access_request():
    """Solicitação de acesso de exemplo"""
    return {
        'email': 'requester@test.com',
        'name': 'Requester User',
        'provider': 'google',
        'justification': 'Preciso acessar para trabalho importante'
    }

# Configuração do pytest
def pytest_configure(config):
    """Configuração do pytest"""
    config.addinivalue_line(
        "markers", "slow: marca testes que demoram para executar"
    )
    config.addinivalue_line(
        "markers", "integration: marca testes de integração"  
    )
    config.addinivalue_line(
        "markers", "unit: marca testes unitários"
    )

def pytest_collection_modifyitems(config, items):
    """Modifica coleta de itens de teste"""
    for item in items:
        # Marcar testes automaticamente baseado no nome do arquivo
        if "test_authorization_api" in str(item.fspath):
            item.add_marker(pytest.mark.integration)
        elif "test_authorization" in str(item.fspath):
            item.add_marker(pytest.mark.unit)
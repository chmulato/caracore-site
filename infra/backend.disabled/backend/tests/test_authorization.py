"""
Testes unitários para o módulo de autorização - Fase 4 Item 13
Sistema de controle de acesso para Área 51

Autor: Claude AI Assistant
Data: 02/11/2024
"""

import pytest
import json
import os
import tempfile
import shutil
from datetime import datetime, timedelta
from unittest.mock import patch, MagicMock

# Importar o módulo de autorização
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from authorization import AuthorizationManager

class TestAuthorizationManager:
    """Testes para a classe AuthorizationManager"""
    
    @pytest.fixture
    def temp_dir(self):
        """Cria diretório temporário para testes"""
        temp_dir = tempfile.mkdtemp()
        yield temp_dir
        shutil.rmtree(temp_dir)
    
    @pytest.fixture
    def auth_manager(self, temp_dir):
        """Cria instância do AuthorizationManager para testes"""
        data_file = os.path.join(temp_dir, 'test_authorized_users.json')
        return AuthorizationManager(data_file)
    
    @pytest.fixture
    def sample_data(self):
        """Dados de exemplo para testes"""
        return {
            "users": [
                {
                    "id": 1,
                    "email": "admin@test.com",
                    "name": "Admin Test",
                    "provider": "google",
                    "role": "admin",
                    "status": "active",
                    "created_at": "2024-11-02T10:00:00Z",
                    "last_access": "2024-11-02T15:30:00Z"
                },
                {
                    "id": 2,
                    "email": "user@test.com",
                    "name": "User Test",
                    "provider": "google",
                    "role": "user",
                    "status": "active",
                    "created_at": "2024-11-02T11:00:00Z"
                }
            ],
            "pending_requests": [
                {
                    "id": 1,
                    "email": "pending@test.com",
                    "name": "Pending User",
                    "provider": "google",
                    "justification": "Preciso acessar para trabalho",
                    "requested_at": "2024-11-02T14:00:00Z",
                    "status": "pending"
                }
            ],
            "settings": {
                "auto_approve": False,
                "admin_notification": True,
                "max_failed_attempts": 3,
                "cache_duration": 300
            },
            "audit_log": [
                {
                    "timestamp": "2024-11-02T10:00:00Z",
                    "action": "user_created",
                    "email": "admin@test.com",
                    "details": "Admin user created"
                }
            ]
        }
    
    def test_init_creates_default_structure(self, auth_manager, temp_dir):
        """Testa se a inicialização cria a estrutura padrão"""
        assert os.path.exists(auth_manager.data_file)
        
        data = auth_manager._load_data()
        assert 'users' in data
        assert 'pending_requests' in data
        assert 'settings' in data
        assert 'audit_log' in data
        
        # Verificar admin padrão
        assert len(data['users']) >= 1
        admin_user = next((u for u in data['users'] if u['role'] == 'admin'), None)
        assert admin_user is not None
    
    def test_load_and_save_data(self, auth_manager, sample_data):
        """Testa carregamento e salvamento de dados"""
        # Salvar dados de exemplo
        with open(auth_manager.data_file, 'w', encoding='utf-8') as f:
            json.dump(sample_data, f, ensure_ascii=False, indent=2)
        
        # Carregar dados
        loaded_data = auth_manager._load_data()
        assert loaded_data['users'] == sample_data['users']
        assert loaded_data['pending_requests'] == sample_data['pending_requests']
        
        # Modificar e salvar
        loaded_data['users'][0]['name'] = 'Modified Admin'
        auth_manager._save_data(loaded_data)
        
        # Verificar se foi salvo
        reloaded_data = auth_manager._load_data()
        assert reloaded_data['users'][0]['name'] == 'Modified Admin'
    
    def test_is_user_authorized_valid_user(self, auth_manager, sample_data):
        """Testa verificação de autorização para usuário válido"""
        # Preparar dados
        with open(auth_manager.data_file, 'w', encoding='utf-8') as f:
            json.dump(sample_data, f, ensure_ascii=False, indent=2)
        
        # Testar usuário autorizado
        result = auth_manager.is_user_authorized('admin@test.com', 'google')
        assert result is True
        
        result = auth_manager.is_user_authorized('user@test.com', 'google')
        assert result is True
    
    def test_is_user_authorized_invalid_user(self, auth_manager, sample_data):
        """Testa verificação de autorização para usuário inválido"""
        # Preparar dados
        with open(auth_manager.data_file, 'w', encoding='utf-8') as f:
            json.dump(sample_data, f, ensure_ascii=False, indent=2)
        
        # Testar usuário não autorizado
        result = auth_manager.is_user_authorized('unauthorized@test.com', 'google')
        assert result is False
    
    def test_is_user_authorized_inactive_user(self, auth_manager, sample_data):
        """Testa verificação de autorização para usuário inativo"""
        # Modificar dados para ter usuário inativo
        sample_data['users'][1]['status'] = 'inactive'
        with open(auth_manager.data_file, 'w', encoding='utf-8') as f:
            json.dump(sample_data, f, ensure_ascii=False, indent=2)
        
        # Testar usuário inativo
        result = auth_manager.is_user_authorized('user@test.com', 'google')
        assert result is False
    
    def test_cache_functionality(self, auth_manager, sample_data):
        """Testa funcionalidade de cache"""
        # Preparar dados
        with open(auth_manager.data_file, 'w', encoding='utf-8') as f:
            json.dump(sample_data, f, ensure_ascii=False, indent=2)
        
        # Primeira verificação (deve carregar do arquivo)
        with patch.object(auth_manager, '_load_data', wraps=auth_manager._load_data) as mock_load:
            result1 = auth_manager.is_user_authorized('admin@test.com', 'google')
            assert result1 is True
            assert mock_load.call_count == 1
        
        # Segunda verificação (deve usar cache)
        with patch.object(auth_manager, '_load_data', wraps=auth_manager._load_data) as mock_load:
            result2 = auth_manager.is_user_authorized('admin@test.com', 'google')
            assert result2 is True
            assert mock_load.call_count == 0  # Não deve carregar novamente
    
    def test_cache_expiration(self, auth_manager, sample_data):
        """Testa expiração do cache"""
        # Preparar dados
        with open(auth_manager.data_file, 'w', encoding='utf-8') as f:
            json.dump(sample_data, f, ensure_ascii=False, indent=2)
        
        # Primeira verificação
        auth_manager.is_user_authorized('admin@test.com', 'google')
        
        # Simular expiração do cache
        auth_manager._cache_timestamp = datetime.now() - timedelta(seconds=301)
        
        # Segunda verificação (deve recarregar)
        with patch.object(auth_manager, '_load_data', wraps=auth_manager._load_data) as mock_load:
            result = auth_manager.is_user_authorized('admin@test.com', 'google')
            assert result is True
            assert mock_load.call_count == 1  # Deve carregar novamente
    
    def test_add_user(self, auth_manager):
        """Testa adição de usuário"""
        user_data = {
            'email': 'newuser@test.com',
            'name': 'New User',
            'provider': 'google',
            'role': 'user'
        }
        
        result = auth_manager.add_user(user_data)
        assert result is True
        
        # Verificar se usuário foi adicionado
        is_authorized = auth_manager.is_user_authorized('newuser@test.com', 'google')
        assert is_authorized is True
        
        # Verificar dados do usuário
        data = auth_manager._load_data()
        new_user = next((u for u in data['users'] if u['email'] == 'newuser@test.com'), None)
        assert new_user is not None
        assert new_user['name'] == 'New User'
        assert new_user['role'] == 'user'
        assert new_user['status'] == 'active'
    
    def test_add_duplicate_user(self, auth_manager, sample_data):
        """Testa adição de usuário duplicado"""
        # Preparar dados
        with open(auth_manager.data_file, 'w', encoding='utf-8') as f:
            json.dump(sample_data, f, ensure_ascii=False, indent=2)
        
        user_data = {
            'email': 'admin@test.com',  # Email já existe
            'name': 'Duplicate Admin',
            'provider': 'google',
            'role': 'user'
        }
        
        result = auth_manager.add_user(user_data)
        assert result is False
    
    def test_remove_user(self, auth_manager, sample_data):
        """Testa remoção de usuário"""
        # Preparar dados
        with open(auth_manager.data_file, 'w', encoding='utf-8') as f:
            json.dump(sample_data, f, ensure_ascii=False, indent=2)
        
        # Remover usuário
        result = auth_manager.remove_user('user@test.com')
        assert result is True
        
        # Verificar se usuário foi removido
        is_authorized = auth_manager.is_user_authorized('user@test.com', 'google')
        assert is_authorized is False
    
    def test_remove_nonexistent_user(self, auth_manager, sample_data):
        """Testa remoção de usuário inexistente"""
        # Preparar dados
        with open(auth_manager.data_file, 'w', encoding='utf-8') as f:
            json.dump(sample_data, f, ensure_ascii=False, indent=2)
        
        # Tentar remover usuário inexistente
        result = auth_manager.remove_user('nonexistent@test.com')
        assert result is False
    
    def test_update_user(self, auth_manager, sample_data):
        """Testa atualização de usuário"""
        # Preparar dados
        with open(auth_manager.data_file, 'w', encoding='utf-8') as f:
            json.dump(sample_data, f, ensure_ascii=False, indent=2)
        
        # Atualizar usuário
        updates = {
            'name': 'Updated User',
            'role': 'admin',
            'status': 'inactive'
        }
        
        result = auth_manager.update_user('user@test.com', updates)
        assert result is True
        
        # Verificar atualizações
        data = auth_manager._load_data()
        updated_user = next((u for u in data['users'] if u['email'] == 'user@test.com'), None)
        assert updated_user is not None
        assert updated_user['name'] == 'Updated User'
        assert updated_user['role'] == 'admin'
        assert updated_user['status'] == 'inactive'
    
    def test_get_users(self, auth_manager, sample_data):
        """Testa recuperação de usuários"""
        # Preparar dados
        with open(auth_manager.data_file, 'w', encoding='utf-8') as f:
            json.dump(sample_data, f, ensure_ascii=False, indent=2)
        
        # Obter todos os usuários
        users = auth_manager.get_users()
        assert len(users) == 2
        assert users[0]['email'] == 'admin@test.com'
        assert users[1]['email'] == 'user@test.com'
        
        # Obter usuários com filtro
        admin_users = auth_manager.get_users(role='admin')
        assert len(admin_users) == 1
        assert admin_users[0]['email'] == 'admin@test.com'
        
        active_users = auth_manager.get_users(status='active')
        assert len(active_users) == 2
    
    def test_add_access_request(self, auth_manager):
        """Testa adição de solicitação de acesso"""
        request_data = {
            'email': 'requester@test.com',
            'name': 'Requester User',
            'provider': 'google',
            'justification': 'Preciso acessar para trabalho'
        }
        
        result = auth_manager.add_access_request(request_data)
        assert result is True
        
        # Verificar se solicitação foi adicionada
        data = auth_manager._load_data()
        request = next((r for r in data['pending_requests'] if r['email'] == 'requester@test.com'), None)
        assert request is not None
        assert request['name'] == 'Requester User'
        assert request['status'] == 'pending'
    
    def test_approve_access_request(self, auth_manager, sample_data):
        """Testa aprovação de solicitação de acesso"""
        # Preparar dados
        with open(auth_manager.data_file, 'w', encoding='utf-8') as f:
            json.dump(sample_data, f, ensure_ascii=False, indent=2)
        
        # Aprovar solicitação
        result = auth_manager.approve_access_request(1)
        assert result is True
        
        # Verificar se usuário foi adicionado
        is_authorized = auth_manager.is_user_authorized('pending@test.com', 'google')
        assert is_authorized is True
        
        # Verificar se solicitação foi removida
        data = auth_manager._load_data()
        request = next((r for r in data['pending_requests'] if r['id'] == 1), None)
        assert request is None
    
    def test_reject_access_request(self, auth_manager, sample_data):
        """Testa rejeição de solicitação de acesso"""
        # Preparar dados
        with open(auth_manager.data_file, 'w', encoding='utf-8') as f:
            json.dump(sample_data, f, ensure_ascii=False, indent=2)
        
        # Rejeitar solicitação
        result = auth_manager.reject_access_request(1, 'Não atende aos critérios')
        assert result is True
        
        # Verificar se usuário não foi adicionado
        is_authorized = auth_manager.is_user_authorized('pending@test.com', 'google')
        assert is_authorized is False
        
        # Verificar se solicitação foi removida
        data = auth_manager._load_data()
        request = next((r for r in data['pending_requests'] if r['id'] == 1), None)
        assert request is None
    
    def test_get_pending_requests(self, auth_manager, sample_data):
        """Testa recuperação de solicitações pendentes"""
        # Preparar dados
        with open(auth_manager.data_file, 'w', encoding='utf-8') as f:
            json.dump(sample_data, f, ensure_ascii=False, indent=2)
        
        # Obter solicitações pendentes
        requests = auth_manager.get_pending_requests()
        assert len(requests) == 1
        assert requests[0]['email'] == 'pending@test.com'
        assert requests[0]['status'] == 'pending'
    
    def test_get_statistics(self, auth_manager, sample_data):
        """Testa recuperação de estatísticas"""
        # Preparar dados
        with open(auth_manager.data_file, 'w', encoding='utf-8') as f:
            json.dump(sample_data, f, ensure_ascii=False, indent=2)
        
        # Obter estatísticas
        stats = auth_manager.get_statistics()
        
        assert 'total_users' in stats
        assert 'active_users' in stats
        assert 'admin_users' in stats
        assert 'pending_requests' in stats
        assert 'recent_access' in stats
        
        assert stats['total_users'] == 2
        assert stats['active_users'] == 2
        assert stats['admin_users'] == 1
        assert stats['pending_requests'] == 1
    
    def test_create_backup(self, auth_manager, sample_data, temp_dir):
        """Testa criação de backup"""
        # Preparar dados
        with open(auth_manager.data_file, 'w', encoding='utf-8') as f:
            json.dump(sample_data, f, ensure_ascii=False, indent=2)
        
        # Criar backup
        backup_path = auth_manager.create_backup()
        assert backup_path is not None
        assert os.path.exists(backup_path)
        
        # Verificar conteúdo do backup
        with open(backup_path, 'r', encoding='utf-8') as f:
            backup_data = json.load(f)
        
        assert backup_data['users'] == sample_data['users']
        assert backup_data['pending_requests'] == sample_data['pending_requests']
    
    def test_error_handling_invalid_json(self, auth_manager, temp_dir):
        """Testa tratamento de erro com JSON inválido"""
        # Criar arquivo com JSON inválido
        with open(auth_manager.data_file, 'w') as f:
            f.write('invalid json content')
        
        # Deve criar estrutura padrão quando JSON é inválido
        data = auth_manager._load_data()
        assert 'users' in data
        assert 'pending_requests' in data
    
    def test_error_handling_file_not_found(self, temp_dir):
        """Testa tratamento de erro quando arquivo não existe"""
        nonexistent_file = os.path.join(temp_dir, 'nonexistent.json')
        auth_manager = AuthorizationManager(nonexistent_file)
        
        # Deve criar arquivo com estrutura padrão
        data = auth_manager._load_data()
        assert 'users' in data
        assert 'pending_requests' in data
        assert os.path.exists(nonexistent_file)
    
    def test_audit_logging(self, auth_manager):
        """Testa sistema de auditoria"""
        # Adicionar usuário (deve gerar log)
        user_data = {
            'email': 'audit@test.com',
            'name': 'Audit User',
            'provider': 'google',
            'role': 'user'
        }
        
        auth_manager.add_user(user_data)
        
        # Verificar log de auditoria
        data = auth_manager._load_data()
        assert len(data['audit_log']) > 0
        
        # Encontrar log de criação de usuário
        create_log = next((log for log in data['audit_log'] 
                          if log['action'] == 'user_added' and log['email'] == 'audit@test.com'), None)
        assert create_log is not None
        assert 'timestamp' in create_log
        assert 'details' in create_log


if __name__ == '__main__':
    pytest.main([__file__])
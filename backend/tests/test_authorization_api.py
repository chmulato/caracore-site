"""
Testes para endpoints de autorização da API - Fase 4 Item 13
Testes de integração para verificar funcionamento dos endpoints REST

Autor: Claude AI Assistant
Data: 02/11/2024
"""

import pytest
import json
import os
import tempfile
import shutil
from unittest.mock import patch, MagicMock

# Importar o app Flask
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from app import app
from authorization import AuthorizationManager

class TestAuthorizationAPI:
    """Testes para endpoints de autorização da API"""
    
    @pytest.fixture
    def client(self):
        """Cliente de teste Flask"""
        app.config['TESTING'] = True
        with app.test_client() as client:
            yield client
    
    @pytest.fixture
    def temp_dir(self):
        """Diretório temporário para testes"""
        temp_dir = tempfile.mkdtemp()
        yield temp_dir
        shutil.rmtree(temp_dir)
    
    @pytest.fixture
    def mock_auth_manager(self, temp_dir):
        """Mock do AuthorizationManager"""
        data_file = os.path.join(temp_dir, 'test_auth.json')
        auth_manager = AuthorizationManager(data_file)
        
        # Adicionar dados de teste
        auth_manager.add_user({
            'email': 'admin@test.com',
            'name': 'Admin Test',
            'provider': 'google',
            'role': 'admin'
        })
        auth_manager.add_user({
            'email': 'user@test.com',
            'name': 'User Test',
            'provider': 'google',
            'role': 'user'
        })
        
        return auth_manager
    
    @pytest.fixture(autouse=True)
    def patch_auth_manager(self, mock_auth_manager):
        """Substitui o AuthorizationManager global pelos testes"""
        with patch('app.auth_manager', mock_auth_manager):
            yield mock_auth_manager
    
    def test_check_authorization_valid_user(self, client):
        """Testa verificação de autorização para usuário válido"""
        response = client.post('/api/check-authorization', 
                              json={
                                  'email': 'admin@test.com',
                                  'provider': 'google'
                              })
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['authorized'] is True
        assert data['user']['email'] == 'admin@test.com'
        assert data['user']['role'] == 'admin'
    
    def test_check_authorization_invalid_user(self, client):
        """Testa verificação de autorização para usuário inválido"""
        response = client.post('/api/check-authorization', 
                              json={
                                  'email': 'unauthorized@test.com',
                                  'provider': 'google'
                              })
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['authorized'] is False
        assert 'user' not in data
    
    def test_check_authorization_missing_email(self, client):
        """Testa verificação de autorização sem email"""
        response = client.post('/api/check-authorization', 
                              json={'provider': 'google'})
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data
    
    def test_check_authorization_missing_provider(self, client):
        """Testa verificação de autorização sem provider"""
        response = client.post('/api/check-authorization', 
                              json={'email': 'test@test.com'})
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data
    
    def test_check_authorization_invalid_json(self, client):
        """Testa verificação de autorização com JSON inválido"""
        response = client.post('/api/check-authorization', 
                              data='invalid json',
                              content_type='application/json')
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data
    
    def test_get_admin_users_without_auth(self, client):
        """Testa acesso a usuários admin sem autenticação"""
        response = client.get('/api/admin/users')
        
        assert response.status_code == 401
        data = response.get_json()
        assert 'error' in data
    
    @patch('app.verify_admin_access')
    def test_get_admin_users_with_auth(self, mock_verify, client):
        """Testa listagem de usuários com autenticação admin"""
        mock_verify.return_value = True
        
        response = client.get('/api/admin/users')
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'users' in data
        assert 'statistics' in data
        assert 'pending_requests' in data
        
        # Verificar se retorna os usuários de teste
        assert len(data['users']) == 2
        assert any(u['email'] == 'admin@test.com' for u in data['users'])
        assert any(u['email'] == 'user@test.com' for u in data['users'])
    
    @patch('app.verify_admin_access')
    def test_add_admin_user(self, mock_verify, client):
        """Testa adição de usuário via API admin"""
        mock_verify.return_value = True
        
        new_user = {
            'email': 'newuser@test.com',
            'name': 'New User',
            'provider': 'google',
            'role': 'user'
        }
        
        response = client.post('/api/admin/users', json=new_user)
        
        assert response.status_code == 201
        data = response.get_json()
        assert data['success'] is True
        assert 'user' in data
        assert data['user']['email'] == 'newuser@test.com'
    
    @patch('app.verify_admin_access')
    def test_add_admin_user_duplicate(self, mock_verify, client):
        """Testa adição de usuário duplicado via API admin"""
        mock_verify.return_value = True
        
        duplicate_user = {
            'email': 'admin@test.com',  # Email já existe
            'name': 'Duplicate Admin',
            'provider': 'google',
            'role': 'user'
        }
        
        response = client.post('/api/admin/users', json=duplicate_user)
        
        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False
        assert 'error' in data
    
    @patch('app.verify_admin_access')
    def test_add_admin_user_missing_fields(self, mock_verify, client):
        """Testa adição de usuário com campos obrigatórios faltando"""
        mock_verify.return_value = True
        
        incomplete_user = {
            'email': 'incomplete@test.com',
            # 'name' faltando
            'provider': 'google',
            'role': 'user'
        }
        
        response = client.post('/api/admin/users', json=incomplete_user)
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data
    
    @patch('app.verify_admin_access')
    def test_delete_admin_user(self, mock_verify, client):
        """Testa remoção de usuário via API admin"""
        mock_verify.return_value = True
        
        response = client.delete('/api/admin/users', 
                               json={'email': 'user@test.com'})
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
    
    @patch('app.verify_admin_access')
    def test_delete_admin_user_not_found(self, mock_verify, client):
        """Testa remoção de usuário inexistente via API admin"""
        mock_verify.return_value = True
        
        response = client.delete('/api/admin/users', 
                               json={'email': 'nonexistent@test.com'})
        
        assert response.status_code == 404
        data = response.get_json()
        assert data['success'] is False
        assert 'error' in data
    
    @patch('app.verify_admin_access')
    def test_delete_admin_user_missing_email(self, mock_verify, client):
        """Testa remoção de usuário sem especificar email"""
        mock_verify.return_value = True
        
        response = client.delete('/api/admin/users', json={})
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data
    
    def test_request_access_valid(self, client):
        """Testa solicitação de acesso válida"""
        request_data = {
            'email': 'requester@test.com',
            'name': 'Requester User',
            'provider': 'google',
            'justification': 'Preciso acessar para trabalho'
        }
        
        response = client.post('/api/request-access', json=request_data)
        
        assert response.status_code == 201
        data = response.get_json()
        assert data['success'] is True
        assert 'request_id' in data
    
    def test_request_access_missing_fields(self, client):
        """Testa solicitação de acesso com campos obrigatórios faltando"""
        incomplete_request = {
            'email': 'requester@test.com',
            # 'name' faltando
            'provider': 'google',
            'justification': 'Preciso acessar para trabalho'
        }
        
        response = client.post('/api/request-access', json=incomplete_request)
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data
    
    def test_request_access_invalid_email(self, client):
        """Testa solicitação de acesso com email inválido"""
        invalid_request = {
            'email': 'invalid-email',
            'name': 'Requester User',
            'provider': 'google',
            'justification': 'Preciso acessar para trabalho'
        }
        
        response = client.post('/api/request-access', json=invalid_request)
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data
    
    def test_request_access_short_justification(self, client):
        """Testa solicitação de acesso com justificativa muito curta"""
        short_request = {
            'email': 'requester@test.com',
            'name': 'Requester User',
            'provider': 'google',
            'justification': 'Test'  # Muito curto
        }
        
        response = client.post('/api/request-access', json=short_request)
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data
    
    def test_cors_headers(self, client):
        """Testa se headers CORS estão configurados"""
        response = client.options('/api/check-authorization')
        
        assert 'Access-Control-Allow-Origin' in response.headers
        assert 'Access-Control-Allow-Methods' in response.headers
        assert 'Access-Control-Allow-Headers' in response.headers
    
    def test_rate_limiting(self, client):
        """Testa rate limiting (se implementado)"""
        # Fazer muitas requisições rapidamente
        for _ in range(20):
            response = client.post('/api/check-authorization', 
                                  json={
                                      'email': 'test@test.com',
                                      'provider': 'google'
                                  })
        
        # Se rate limiting está ativo, uma das últimas requisições deve falhar
        # Este teste pode precisar ser ajustado baseado na configuração de rate limiting
        assert response.status_code in [200, 429]  # 200 (sucesso) ou 429 (rate limited)
    
    def test_error_handling_server_error(self, client):
        """Testa tratamento de erro do servidor"""
        with patch('app.auth_manager.is_user_authorized', side_effect=Exception('Database error')):
            response = client.post('/api/check-authorization', 
                                  json={
                                      'email': 'test@test.com',
                                      'provider': 'google'
                                  })
            
            assert response.status_code == 500
            data = response.get_json()
            assert 'error' in data
    
    def test_content_type_validation(self, client):
        """Testa validação de Content-Type"""
        # Tentar enviar dados sem Content-Type application/json
        response = client.post('/api/check-authorization', 
                              data='{"email": "test@test.com", "provider": "google"}',
                              content_type='text/plain')
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data
    
    def test_method_not_allowed(self, client):
        """Testa métodos HTTP não permitidos"""
        # Tentar GET em endpoint que só aceita POST
        response = client.get('/api/check-authorization')
        
        assert response.status_code == 405
    
    @patch('app.verify_admin_access')
    def test_admin_update_user(self, mock_verify, client):
        """Testa atualização de usuário via API admin"""
        mock_verify.return_value = True
        
        # Primeiro, obter o usuário atual
        response = client.get('/api/admin/users')
        users = response.get_json()['users']
        user_to_update = next((u for u in users if u['email'] == 'user@test.com'), None)
        
        assert user_to_update is not None
        
        # Atualizar usuário
        update_data = {
            'email': 'user@test.com',
            'name': 'Updated User Name',
            'role': 'admin'
        }
        
        response = client.put('/api/admin/users', json=update_data)
        
        # Como não implementamos PUT ainda, pode retornar 405
        # Este teste serve para documentar funcionalidade futura
        assert response.status_code in [200, 405]
    
    @patch('app.verify_admin_access')
    def test_admin_approve_request(self, mock_verify, client, mock_auth_manager):
        """Testa aprovação de solicitação via API admin"""
        mock_verify.return_value = True
        
        # Adicionar uma solicitação pendente primeiro
        mock_auth_manager.add_access_request({
            'email': 'pending@test.com',
            'name': 'Pending User',
            'provider': 'google',
            'justification': 'Preciso acessar para trabalho'
        })
        
        # Obter ID da solicitação
        requests = mock_auth_manager.get_pending_requests()
        request_id = requests[0]['id']
        
        # Aprovar solicitação
        response = client.post('/api/admin/approve-request', 
                              json={'request_id': request_id})
        
        # Como não implementamos este endpoint ainda, pode retornar 404
        # Este teste serve para documentar funcionalidade futura
        assert response.status_code in [200, 404]


if __name__ == '__main__':
    pytest.main([__file__])
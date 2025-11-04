"""
Sistema de Autorização - CaraCore

Gerencia autorização de usuários para acesso às páginas protegidas.
Complementa o sistema de autenticação OAuth 2.1 + OIDC existente.

Author: CaraCore Team
Date: 2025-11-02
Version: 1.0
"""

import json
import os
import logging
import copy
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple, Any


# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Caminho para o arquivo de dados com logs de debug
BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, 'data')
AUTHORIZED_USERS_FILE = os.path.join(DATA_DIR, 'authorized_users.json')
BACKUP_DIR = os.path.join(DATA_DIR, 'backups')

# Debug inicial para verificar caminhos em Azure
logger.info(f"Authorization module - BASE_DIR: {BASE_DIR}")
logger.info(f"Authorization module - DATA_DIR: {DATA_DIR}")
logger.info(f"Authorization module - AUTHORIZED_USERS_FILE: {AUTHORIZED_USERS_FILE}")
logger.info(f"Authorization module - File exists: {os.path.exists(AUTHORIZED_USERS_FILE)}")

if os.path.exists(AUTHORIZED_USERS_FILE):
    logger.info(f"Authorization file found with size: {os.path.getsize(AUTHORIZED_USERS_FILE)} bytes")
else:
    logger.error(f"Authorization file NOT FOUND at: {AUTHORIZED_USERS_FILE}")
    logger.info(f"Directory contents of {DATA_DIR}: {os.listdir(DATA_DIR) if os.path.exists(DATA_DIR) else 'Directory not found'}")
    logger.info(f"Directory contents of {BASE_DIR}: {os.listdir(BASE_DIR) if os.path.exists(BASE_DIR) else 'Directory not found'}")


class AuthorizationError(Exception):
    """Exceção customizada para erros de autorização"""
    pass


class AuthorizationManager:
    """Gerenciador principal do sistema de autorização"""
    
    def __init__(self):
        """Inicializar o gerenciador"""
        self._ensure_directories_exist()
        self._data_cache = None
        self._cache_timestamp = None
        self._cache_duration = 300  # 5 minutos
    
    def _ensure_directories_exist(self):
        """Garantir que os diretórios necessários existam"""
        os.makedirs(DATA_DIR, exist_ok=True)
        os.makedirs(BACKUP_DIR, exist_ok=True)
    
    def _get_timestamp(self) -> str:
        """Obter timestamp atual em formato ISO"""
        return datetime.now(timezone.utc).isoformat()
    
    def _create_backup(self) -> str:
        """Criar backup do arquivo atual"""
        if not os.path.exists(AUTHORIZED_USERS_FILE):
            return ""
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_file = os.path.join(BACKUP_DIR, f'authorized_users_{timestamp}.json')
        
        try:
            with open(AUTHORIZED_USERS_FILE, 'r', encoding='utf-8') as src:
                with open(backup_file, 'w', encoding='utf-8') as dst:
                    dst.write(src.read())
            
            logger.info(f"Backup criado: {backup_file}")
            return backup_file
        except Exception as e:
            logger.error(f"Erro ao criar backup: {e}")
            return ""
    
    def _create_default_structure(self) -> Dict[str, Any]:
        """Criar estrutura padrão do arquivo de dados"""
        return {
            "version": "1.0",
            "updated_at": self._get_timestamp(),
            "users": [
                {
                    "email": "admin@caracore.com",
                    "name": "Admin Sistema",
                    "provider": "google",
                    "role": "admin",
                    "status": "active",
                    "approved_at": self._get_timestamp(),
                    "approved_by": "system",
                    "created_at": self._get_timestamp()
                },
                {
                    "email": "suporte@caracore.com.br",
                    "name": "Super Administrador",
                    "provider": "direct",
                    "role": "super_admin",
                    "status": "active",
                    "approved_at": self._get_timestamp(),
                    "approved_by": "system",
                    "created_at": self._get_timestamp()
                }
            ],
            "pending_requests": [],
            "settings": {
                "require_approval": True,
                "auto_approve_domains": [],
                "max_pending_requests": 50,
                "notification_email": "suporte@caracore.com.br"
            },
            "audit_log": [
                {
                    "timestamp": self._get_timestamp(),
                    "action": "system_initialized",
                    "details": "Sistema de autorização inicializado com super admin",
                    "user": "system"
                }
            ]
        }
    
    def load_authorized_users(self, force_reload: bool = False) -> Dict[str, Any]:
        """
        Carregar dados de usuários autorizados do JSON
        
        Args:
            force_reload: Forçar recarregamento ignorando cache
            
        Returns:
            Dict com estrutura completa dos dados
        """
        try:
            current_time = datetime.now().timestamp()
            
            # Verificar cache
            if (not force_reload and 
                self._data_cache is not None and 
                self._cache_timestamp is not None and
                current_time - self._cache_timestamp < self._cache_duration):
                return copy.deepcopy(self._data_cache)
            
            # Verificar se arquivo existe
            if not os.path.exists(AUTHORIZED_USERS_FILE):
                logger.warning("Arquivo de dados não encontrado. Criando estrutura padrão.")
                default_data = self._create_default_structure()
                self.save_authorized_users(default_data)
                return default_data
            
            # Carregar dados do arquivo
            with open(AUTHORIZED_USERS_FILE, 'r', encoding='utf-8') as file:
                data = json.load(file)
            
            # Validar estrutura básica
            required_keys = ['version', 'users', 'pending_requests']
            for key in required_keys:
                if key not in data:
                    raise AuthorizationError(f"Estrutura inválida: chave '{key}' não encontrada")
            
            # Atualizar cache
            self._data_cache = copy.deepcopy(data)
            self._cache_timestamp = current_time
            
            logger.info(f"Dados carregados: {len(data['users'])} usuários, {len(data['pending_requests'])} pendentes")
            return data
            
        except json.JSONDecodeError as e:
            logger.error(f"Erro ao decodificar JSON: {e}")
            raise AuthorizationError(f"Arquivo JSON inválido: {e}")
        except Exception as e:
            logger.error(f"Erro ao carregar dados: {e}")
            raise AuthorizationError(f"Erro ao carregar dados: {e}")
    
    def save_authorized_users(self, data: Dict[str, Any]) -> bool:
        """
        Salvar dados de usuários autorizados no JSON
        
        Args:
            data: Estrutura completa dos dados para salvar
            
        Returns:
            True se salvou com sucesso, False caso contrário
        """
        try:
            # Validar estrutura antes de salvar
            required_keys = ['version', 'users', 'pending_requests']
            for key in required_keys:
                if key not in data:
                    raise AuthorizationError(f"Estrutura inválida: chave '{key}' não encontrada")
            
            # Criar backup antes de sobrescrever
            if os.path.exists(AUTHORIZED_USERS_FILE):
                self._create_backup()
            
            # Atualizar timestamp
            data['updated_at'] = self._get_timestamp()
            
            # Salvar dados
            with open(AUTHORIZED_USERS_FILE, 'w', encoding='utf-8') as file:
                json.dump(data, file, indent=2, ensure_ascii=False)
            
            # Invalidar cache
            self._data_cache = None
            self._cache_timestamp = None
            
            logger.info("Dados salvos com sucesso")
            return True
            
        except Exception as e:
            logger.error(f"Erro ao salvar dados: {e}")
            return False
    
    def is_user_authorized(self, email: str) -> bool:
        """
        Verificar se usuário está autorizado
        
        Args:
            email: Email do usuário para verificar
            
        Returns:
            True se autorizado, False caso contrário
        """
        try:
            if not email:
                return False
            
            data = self.load_authorized_users()
            email_lower = email.lower().strip()
            
            for user in data['users']:
                if (user.get('email', '').lower() == email_lower and 
                    user.get('status') == 'active'):
                    return True
            
            return False
            
        except Exception as e:
            logger.error(f"Erro ao verificar autorização para {email}: {e}")
            return False
    
    def get_user_role(self, email: str) -> Optional[str]:
        """
        Obter role do usuário
        
        Args:
            email: Email do usuário
            
        Returns:
            Role do usuário ('admin', 'user') ou None se não autorizado
        """
        try:
            if not email:
                return None
            
            data = self.load_authorized_users()
            email_lower = email.lower().strip()
            
            for user in data['users']:
                if (user.get('email', '').lower() == email_lower and 
                    user.get('status') == 'active'):
                    return user.get('role', 'user')
            
            return None
            
        except Exception as e:
            logger.error(f"Erro ao obter role para {email}: {e}")
            return None
    
    def add_authorized_user(self, user_data: Dict[str, Any]) -> Tuple[bool, str]:
        """
        Adicionar novo usuário autorizado
        
        Args:
            user_data: Dados do usuário (email, name, provider, role)
            
        Returns:
            Tuple (sucesso, mensagem)
        """
        try:
            # Validar campos obrigatórios
            required_fields = ['email', 'name', 'provider']
            for field in required_fields:
                if field not in user_data or not user_data[field]:
                    return False, f"Campo obrigatório '{field}' não fornecido"
            
            email = user_data['email'].lower().strip()
            
            # Verificar se já existe
            if self.is_user_authorized(email):
                return False, "Usuário já está autorizado"
            
            # Carregar dados atuais
            data = self.load_authorized_users()
            
            # Criar novo usuário
            new_user = {
                "email": email,
                "name": user_data['name'].strip(),
                "provider": user_data['provider'].lower(),
                "role": user_data.get('role', 'user'),
                "status": "active",
                "approved_at": self._get_timestamp(),
                "approved_by": user_data.get('approved_by', 'admin'),
                "created_at": self._get_timestamp()
            }
            
            # Adicionar à lista
            data['users'].append(new_user)
            
            # Adicionar ao log de auditoria
            data['audit_log'].append({
                "timestamp": self._get_timestamp(),
                "action": "user_added",
                "details": f"Usuário {email} adicionado com role {new_user['role']}",
                "user": user_data.get('approved_by', 'admin')
            })
            
            # Salvar
            if self.save_authorized_users(data):
                logger.info(f"Usuário {email} adicionado com sucesso")
                return True, "Usuário adicionado com sucesso"
            else:
                return False, "Erro ao salvar dados"
                
        except Exception as e:
            logger.error(f"Erro ao adicionar usuário: {e}")
            return False, f"Erro interno: {e}"
    
    def remove_authorized_user(self, email: str, removed_by: str = "admin") -> Tuple[bool, str]:
        """
        Remover usuário autorizado
        
        Args:
            email: Email do usuário para remover
            removed_by: Quem está removendo
            
        Returns:
            Tuple (sucesso, mensagem)
        """
        try:
            if not email:
                return False, "Email não fornecido"
            
            email_lower = email.lower().strip()
            data = self.load_authorized_users()
            
            # Encontrar usuário
            user_found = None
            for i, user in enumerate(data['users']):
                if user.get('email', '').lower() == email_lower:
                    user_found = (i, user)
                    break
            
            if not user_found:
                return False, "Usuário não encontrado"
            
            user_index, user = user_found
            
            # Verificar se não é o último admin
            if user.get('role') == 'admin':
                admin_count = sum(1 for u in data['users'] 
                                 if u.get('role') == 'admin' and u.get('status') == 'active')
                if admin_count <= 1:
                    return False, "Não é possível remover o último administrador"
            
            # Remover usuário
            removed_user = data['users'].pop(user_index)
            
            # Adicionar ao log de auditoria
            data['audit_log'].append({
                "timestamp": self._get_timestamp(),
                "action": "user_removed",
                "details": f"Usuário {email_lower} removido (role: {removed_user.get('role', 'user')})",
                "user": removed_by
            })
            
            # Salvar
            if self.save_authorized_users(data):
                logger.info(f"Usuário {email_lower} removido com sucesso")
                return True, "Usuário removido com sucesso"
            else:
                return False, "Erro ao salvar dados"
                
        except Exception as e:
            logger.error(f"Erro ao remover usuário: {e}")
            return False, f"Erro interno: {e}"
    
    def add_pending_request(self, request_data: Dict[str, Any]) -> Tuple[bool, str]:
        """
        Adicionar solicitação de acesso pendente
        
        Args:
            request_data: Dados da solicitação (email, name, provider, message)
            
        Returns:
            Tuple (sucesso, mensagem)
        """
        try:
            # Validar campos obrigatórios
            required_fields = ['email', 'name', 'provider']
            for field in required_fields:
                if field not in request_data or not request_data[field]:
                    return False, f"Campo obrigatório '{field}' não fornecido"
            
            email = request_data['email'].lower().strip()
            
            # Verificar se já está autorizado
            if self.is_user_authorized(email):
                return False, "Usuário já está autorizado"
            
            # Carregar dados atuais
            data = self.load_authorized_users()
            
            # Verificar se já tem solicitação pendente
            for request in data['pending_requests']:
                if request.get('email', '').lower() == email:
                    return False, "Já existe uma solicitação pendente para este email"
            
            # Verificar limite de solicitações pendentes
            max_pending = data.get('settings', {}).get('max_pending_requests', 50)
            if len(data['pending_requests']) >= max_pending:
                return False, "Limite de solicitações pendentes atingido"
            
            # Criar nova solicitação
            new_request = {
                "email": email,
                "name": request_data['name'].strip(),
                "provider": request_data['provider'].lower(),
                "message": request_data.get('message', '').strip(),
                "requested_at": self._get_timestamp(),
                "status": "pending"
            }
            
            # Adicionar à lista
            data['pending_requests'].append(new_request)
            
            # Adicionar ao log de auditoria
            data['audit_log'].append({
                "timestamp": self._get_timestamp(),
                "action": "access_requested",
                "details": f"Solicitação de acesso recebida de {email}",
                "user": email
            })
            
            # Salvar
            if self.save_authorized_users(data):
                logger.info(f"Solicitação de acesso registrada para {email}")
                return True, "Solicitação registrada com sucesso"
            else:
                return False, "Erro ao salvar solicitação"
                
        except Exception as e:
            logger.error(f"Erro ao registrar solicitação: {e}")
            return False, f"Erro interno: {e}"


# Instância global do gerenciador
auth_manager = AuthorizationManager()

# Funções de conveniência para compatibilidade
def load_authorized_users() -> Dict[str, Any]:
    """Carregar dados de usuários autorizados"""
    return auth_manager.load_authorized_users()

def save_authorized_users(data: Dict[str, Any]) -> bool:
    """Salvar dados de usuários autorizados"""
    return auth_manager.save_authorized_users(data)

def is_user_authorized(email: str) -> bool:
    """Verificar se usuário está autorizado"""
    return auth_manager.is_user_authorized(email)

def get_user_role(email: str) -> Optional[str]:
    """Obter role do usuário"""
    return auth_manager.get_user_role(email)

def add_authorized_user(user_data: Dict[str, Any]) -> Tuple[bool, str]:
    """Adicionar novo usuário autorizado"""
    return auth_manager.add_authorized_user(user_data)

def remove_authorized_user(email: str, removed_by: str = "admin") -> Tuple[bool, str]:
    """Remover usuário autorizado"""
    return auth_manager.remove_authorized_user(email, removed_by)

def add_pending_request(request_data: Dict[str, Any]) -> Tuple[bool, str]:
    """Adicionar solicitação de acesso pendente"""
    return auth_manager.add_pending_request(request_data)
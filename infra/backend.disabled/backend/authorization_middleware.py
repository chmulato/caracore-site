"""
Middleware de Autorização - Fase 6
Sistema de verificação de usuários autorizados para endpoints protegidos.

Data: 14/11/2025
Responsável: Equipe Cara Core
"""

import json
import os
from functools import wraps
from flask import request, jsonify
import jwt
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError, DecodeError
import logging

logger = logging.getLogger(__name__)

# Caminho do arquivo de usuários autorizados
AUTHORIZED_USERS_FILE = os.path.join(os.path.dirname(__file__), 'data', 'authorized_users.json')

# JWT Secret Key para validação de tokens
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', '')

def load_authorized_users():
    """
    Carrega a lista de usuários autorizados do arquivo JSON.
    
    Returns:
        dict: Dados de usuários autorizados
    """
    try:
        with open(AUTHORIZED_USERS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        logger.error(f"Arquivo de usuários autorizados não encontrado: {AUTHORIZED_USERS_FILE}")
        return {"users": [], "pending_requests": []}
    except json.JSONDecodeError as e:
        logger.error(f"Erro ao decodificar JSON de usuários autorizados: {e}")
        return {"users": [], "pending_requests": []}
    except Exception as e:
        logger.error(f"Erro ao carregar usuários autorizados: {e}")
        return {"users": [], "pending_requests": []}

def is_user_authorized(email, role_required='user'):
    """
    Verifica se um usuário está autorizado e tem a role necessária.
    
    Args:
        email (str): Email do usuário
        role_required (str): Role mínima necessária (user, admin, super_admin)
        
    Returns:
        tuple: (is_authorized: bool, user_data: dict or None)
    """
    data = load_authorized_users()
    users = data.get('users', [])
    
    # Hierarquia de roles
    role_hierarchy = {
        'user': 0,
        'admin': 1,
        'super_admin': 2
    }
    
    for user in users:
        if user.get('email', '').lower() == email.lower():
            # Verifica se o usuário está ativo
            if user.get('status') != 'active':
                logger.warning(f"Usuário {email} está inativo")
                return False, None
            
            # Verifica se tem a role necessária
            user_role = user.get('role', 'user')
            user_role_level = role_hierarchy.get(user_role, 0)
            required_role_level = role_hierarchy.get(role_required, 0)
            
            if user_role_level >= required_role_level:
                logger.info(f"Usuário {email} autorizado com role {user_role}")
                return True, user
            else:
                logger.warning(f"Usuário {email} não tem permissão suficiente. Role atual: {user_role}, necessária: {role_required}")
                return False, None
    
    logger.warning(f"Usuário {email} não encontrado na lista de autorizados")
    return False, None

def require_authorization(role_required='user'):
    """
    Decorator para proteger endpoints que requerem autorização.
    
    Args:
        role_required (str): Role mínima necessária (user, admin, super_admin)
        
    Usage:
        @app.route('/api/admin/users')
        @require_authorization('admin')
        def get_users():
            return jsonify({"users": []})
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Verifica se há token de autorização
            auth_header = request.headers.get('Authorization')
            
            if not auth_header:
                logger.warning(f"Tentativa de acesso sem token ao endpoint: {request.path}")
                return jsonify({
                    "error": "Unauthorized",
                    "message": "Token de autorização não fornecido"
                }), 401
            
            # Extrai o token
            try:
                token = auth_header.split(' ')[1] if ' ' in auth_header else auth_header
            except IndexError:
                logger.warning(f"Formato de token inválido: {auth_header}")
                return jsonify({
                    "error": "Unauthorized",
                    "message": "Formato de token inválido"
                }), 401
            
            # Valida o token e extrai informações do usuário
            try:
                # Decodifica e valida o token JWT com a chave secreta
                if not JWT_SECRET_KEY:
                    logger.error("JWT_SECRET_KEY não configurada no ambiente")
                    return jsonify({
                        "error": "Server Error",
                        "message": "Configuração do servidor incompleta"
                    }), 500
                
                # Valida a assinatura e expiração do token
                decoded = jwt.decode(token, JWT_SECRET_KEY, algorithms=['HS256'])
                user_email = decoded.get('email')
                user_role = decoded.get('role')
                
                if not user_email:
                    logger.warning("Token não contém email do usuário")
                    return jsonify({
                        "error": "Unauthorized",
                        "message": "Token inválido - email não encontrado"
                    }), 401
                
                # Verificar se é super admin - super admin tem acesso direto sem verificar arquivo JSON
                if user_role == 'super_admin':
                    # Verificar hierarquia de roles para super admin
                    role_hierarchy = {
                        'user': 0,
                        'admin': 1,
                        'super_admin': 2
                    }
                    super_admin_level = role_hierarchy.get('super_admin', 0)
                    required_level = role_hierarchy.get(role_required, 0)
                    
                    if super_admin_level >= required_level:
                        logger.info(f"Super admin {user_email} acessou {request.path}")
                        # Criar dados do usuário para o request context
                        request.current_user = {
                            'email': user_email,
                            'role': 'super_admin',
                            'status': 'active'
                        }
                        # Super admin tem acesso direto
                        return f(*args, **kwargs)
                    else:
                        logger.warning(f"Super admin {user_email} não tem permissão para {role_required}")
                        return jsonify({
                            "error": "Forbidden",
                            "message": "Permissão insuficiente"
                        }), 403
                
            except ExpiredSignatureError:
                logger.warning(f"Token expirado para endpoint: {request.path}")
                return jsonify({
                    "error": "Unauthorized",
                    "message": "Token expirado"
                }), 401
            except DecodeError as e:
                logger.warning(f"Erro ao decodificar token: {e}")
                return jsonify({
                    "error": "Unauthorized",
                    "message": "Token inválido"
                }), 401
            except InvalidTokenError as e:
                logger.warning(f"Token inválido: {e}")
                return jsonify({
                    "error": "Unauthorized",
                    "message": "Token inválido ou corrompido"
                }), 401
            except Exception as e:
                logger.error(f"Erro inesperado ao processar token: {e}")
                return jsonify({
                    "error": "Unauthorized",
                    "message": "Erro ao processar token"
                }), 401
            
            # Verifica se o usuário está autorizado
            is_authorized, user_data = is_user_authorized(user_email, role_required)
            
            if not is_authorized:
                logger.warning(f"Usuário {user_email} tentou acessar {request.path} sem autorização")
                return jsonify({
                    "error": "Forbidden",
                    "message": "Usuário não autorizado para este recurso"
                }), 403
            
            # Adiciona dados do usuário ao request context
            request.current_user = user_data
            
            # Continua com a função original
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator

def require_super_admin():
    """
    Decorator para proteger endpoints que requerem super_admin.
    
    Usage:
        @app.route('/api/super-admin/settings')
        @require_super_admin()
        def update_settings():
            return jsonify({"success": True})
    """
    return require_authorization('super_admin')

def require_admin():
    """
    Decorator para proteger endpoints que requerem admin ou super_admin.
    
    Usage:
        @app.route('/api/admin/users')
        @require_admin()
        def get_users():
            return jsonify({"users": []})
    """
    return require_authorization('admin')

def get_current_user():
    """
    Obtém os dados do usuário atual do request context.
    
    Returns:
        dict: Dados do usuário ou None
    """
    return getattr(request, 'current_user', None)

# Funções auxiliares para gerenciamento de usuários

def add_authorized_user(email, name, provider, role='user', authorized_by='system'):
    """
    Adiciona um novo usuário autorizado.
    
    Args:
        email (str): Email do usuário
        name (str): Nome do usuário
        provider (str): Provedor de autenticação (google, microsoft)
        role (str): Role do usuário (user, admin, super_admin)
        authorized_by (str): Email de quem autorizou
        
    Returns:
        bool: True se adicionado com sucesso
    """
    try:
        data = load_authorized_users()
        
        # Verifica se o usuário já existe
        for user in data.get('users', []):
            if user.get('email', '').lower() == email.lower():
                logger.warning(f"Usuário {email} já existe na lista de autorizados")
                return False
        
        # Adiciona o novo usuário
        from datetime import datetime
        new_user = {
            "email": email,
            "name": name,
            "provider": provider,
            "role": role,
            "status": "active",
            "approved_at": datetime.utcnow().isoformat() + 'Z',
            "approved_by": authorized_by,
            "created_at": datetime.utcnow().isoformat() + 'Z'
        }
        
        data['users'].append(new_user)
        data['updated_at'] = datetime.utcnow().isoformat() + 'Z'
        
        # Adiciona ao audit log
        if 'audit_log' not in data:
            data['audit_log'] = []
        
        data['audit_log'].append({
            "timestamp": datetime.utcnow().isoformat() + 'Z',
            "action": "user_authorized",
            "details": f"{email} autorizado como {role}",
            "user": authorized_by
        })
        
        # Salva no arquivo
        with open(AUTHORIZED_USERS_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Usuário {email} adicionado com sucesso como {role}")
        return True
        
    except Exception as e:
        logger.error(f"Erro ao adicionar usuário autorizado: {e}")
        return False

def remove_authorized_user(email, removed_by='system'):
    """
    Remove um usuário da lista de autorizados.
    
    Args:
        email (str): Email do usuário
        removed_by (str): Email de quem removeu
        
    Returns:
        bool: True se removido com sucesso
    """
    try:
        data = load_authorized_users()
        users = data.get('users', [])
        
        # Encontra e remove o usuário
        user_found = False
        for i, user in enumerate(users):
            if user.get('email', '').lower() == email.lower():
                users.pop(i)
                user_found = True
                break
        
        if not user_found:
            logger.warning(f"Usuário {email} não encontrado para remoção")
            return False
        
        data['users'] = users
        
        # Adiciona ao audit log
        from datetime import datetime
        if 'audit_log' not in data:
            data['audit_log'] = []
        
        data['audit_log'].append({
            "timestamp": datetime.utcnow().isoformat() + 'Z',
            "action": "user_removed",
            "details": f"{email} removido da lista de autorizados",
            "user": removed_by
        })
        
        data['updated_at'] = datetime.utcnow().isoformat() + 'Z'
        
        # Salva no arquivo
        with open(AUTHORIZED_USERS_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Usuário {email} removido com sucesso")
        return True
        
    except Exception as e:
        logger.error(f"Erro ao remover usuário autorizado: {e}")
        return False

# Exemplos de Código - Fase 6

**Data:** 04/11/2025  
**Versão:** 1.0

Este arquivo contém exemplos práticos de código para implementar os 3 itens da Fase 6.

---

## 🔐 ITEM 1: Sistema de Autorização

### 1.1 Middleware de Autorização

**Arquivo:** `backend/authorization_middleware.py`

```python
import json
import os
import logging
from functools import wraps
from flask import request, jsonify, current_app
import jwt

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def load_authorized_users():
    """
    Carrega lista de usuários autorizados do arquivo JSON.
    Cria arquivo padrão se não existir.
    """
    json_path = os.path.join(os.path.dirname(__file__), 'data', 'authorized_users.json')
    
    # Criar arquivo padrão se não existir
    if not os.path.exists(json_path):
        os.makedirs(os.path.dirname(json_path), exist_ok=True)
        default_data = {
            "version": "1.0",
            "updated_at": "2025-11-04T19:30:00Z",
            "super_admins": ["suporte@caracore.com.br"],
            "authorized_users": [],
            "pending_requests": []
        }
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(default_data, f, indent=2, ensure_ascii=False)
        logger.info(f"Arquivo de autorização criado: {json_path}")
    
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        logger.debug(f"Dados de autorização carregados: {len(data.get('super_admins', []))} super admins")
        return data
    except (FileNotFoundError, json.JSONDecodeError) as e:
        logger.error(f"Erro ao carregar dados de autorização: {e}")
        return {"super_admins": ["suporte@caracore.com.br"], "authorized_users": []}

def extract_email_from_token():
    """
    Extrai email do token JWT no header Authorization.
    Retorna None se token inválido ou ausente.
    """
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    
    token = auth_header.split(' ')[1]
    
    try:
        # Usar a mesma secret key do app principal
        secret_key = current_app.config.get('SECRET_KEY', 'your-secret-key')
        decoded = jwt.decode(token, secret_key, algorithms=['HS256'])
        return decoded.get('email')
    except jwt.InvalidTokenError:
        return None

def is_user_authorized(email):
    """
    Verifica se usuário está autorizado a acessar recursos protegidos.
    
    Args:
        email (str): Email do usuário
        
    Returns:
        bool: True se autorizado, False caso contrário
    """
    if not email:
        return False
    
    data = load_authorized_users()
    
    # Super admins sempre autorizados
    if email.lower() in [admin.lower() for admin in data.get("super_admins", [])]:
        logger.info(f"Super admin autorizado: {email}")
        return True
    
    # Verificar na lista de usuários autorizados
    for user in data.get("authorized_users", []):
        if (user.get("email", "").lower() == email.lower() and 
            user.get("status") == "active"):
            logger.info(f"Usuário autorizado: {email}")
            return True
    
    logger.warning(f"Usuário não autorizado: {email}")
    return False

def require_authorization(f):
    """
    Decorator que requer autorização do usuário para acessar o endpoint.
    
    Usage:
        @app.route('/api/admin/users')
        @require_authorization
        def get_users():
            return jsonify({"users": []})
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Extrair email do token JWT
        user_email = extract_email_from_token()
        
        if not user_email:
            logger.warning("Tentativa de acesso sem email válido no token")
            return jsonify({
                "error": "Unauthorized", 
                "message": "Token inválido ou email não encontrado"
            }), 401
        
        if not is_user_authorized(user_email):
            logger.warning(f"Tentativa de acesso não autorizado: {user_email}")
            return jsonify({
                "error": "Forbidden", 
                "message": "Usuário não autorizado para acessar este recurso"
            }), 403
        
        # Log de acesso autorizado
        logger.info(f"Acesso autorizado concedido: {user_email} -> {request.endpoint}")
        return f(*args, **kwargs)
    
    return decorated_function

def log_unauthorized_attempt(email, endpoint, ip_address):
    """
    Registra tentativa de acesso não autorizado para auditoria.
    """
    logger.warning(f"UNAUTHORIZED_ACCESS: email={email}, endpoint={endpoint}, ip={ip_address}")
    
    # Aqui você pode implementar log em arquivo separado, banco de dados, etc.
    # Por exemplo, salvar em arquivo de auditoria
    try:
        audit_data = {
            "timestamp": "2025-11-04T19:30:00Z",  # Use datetime.utcnow().isoformat()
            "event_type": "unauthorized_access_attempt",
            "email": email,
            "endpoint": endpoint,
            "ip_address": ip_address,
            "user_agent": request.headers.get('User-Agent', 'Unknown')
        }
        
        audit_file = os.path.join(os.path.dirname(__file__), 'logs', 'audit.jsonl')
        os.makedirs(os.path.dirname(audit_file), exist_ok=True)
        
        with open(audit_file, 'a', encoding='utf-8') as f:
            f.write(json.dumps(audit_data) + '\\n')
            
    except Exception as e:
        logger.error(f"Erro ao salvar log de auditoria: {e}")
```

### 1.2 Estrutura do arquivo JSON

**Arquivo:** `backend/data/authorized_users.json`

```json
{
  "version": "1.0",
  "updated_at": "2025-11-04T19:30:00Z",
  "super_admins": [
    "suporte@caracore.com.br"
  ],
  "authorized_users": [
    {
      "email": "admin@example.com",
      "name": "Admin User",
      "role": "admin",
      "provider": "google",
      "status": "active",
      "authorized_at": "2025-11-04T19:30:00Z",
      "authorized_by": "suporte@caracore.com.br",
      "permissions": ["read", "write", "delete"]
    },
    {
      "email": "viewer@example.com",
      "name": "Viewer User",
      "role": "viewer",
      "provider": "microsoft",
      "status": "active",
      "authorized_at": "2025-11-04T19:30:00Z",
      "authorized_by": "suporte@caracore.com.br",
      "permissions": ["read"]
    }
  ],
  "pending_requests": [
    {
      "email": "pending@example.com",
      "name": "Pending User",
      "provider": "google",
      "message": "Preciso de acesso para gerenciar usuários",
      "requested_at": "2025-11-04T19:30:00Z",
      "status": "pending"
    }
  ]
}
```

### 1.3 Integração no app.py

**Modificações em:** `backend/app.py`

```python
# Adicionar no início do arquivo
from authorization_middleware import require_authorization

# Modificar endpoints protegidos
@app.route('/api/admin/users', methods=['GET'])
@require_authorization  # Adicionar esta linha
def get_admin_users():
    # ... código existente ...
    pass

@app.route('/api/admin/users', methods=['POST'])
@require_authorization  # Adicionar esta linha
def create_admin_user():
    # ... código existente ...
    pass

@app.route('/api/admin/users/<email>', methods=['DELETE'])
@require_authorization  # Adicionar esta linha
def delete_admin_user(email):
    # ... código existente ...
    pass

# Manter endpoints de autenticação SEM o decorator
@app.route('/auth/super-admin', methods=['POST'])
def super_admin_login():
    # Este endpoint NÃO deve ter @require_authorization
    # ... código existente ...
    pass
```

---

## 🛡️ ITEM 2: Proteção de Endpoints

### 2.1 Validação JWT Robusta

**Adições em:** `backend/app.py`

```python
import jwt
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

def validate_jwt_token():
    """
    Valida token JWT de forma robusta.
    Retorna (is_valid, email, error_message)
    """
    # Verificar se header Authorization existe
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return False, None, "Header Authorization ausente"
    
    # Verificar formato "Bearer <token>"
    if not auth_header.startswith('Bearer '):
        return False, None, "Formato de Authorization inválido. Esperado: Bearer <token>"
    
    # Extrair token
    try:
        token = auth_header.split(' ')[1]
    except IndexError:
        return False, None, "Token não fornecido no header Authorization"
    
    # Validar token JWT
    try:
        secret_key = current_app.config.get('SECRET_KEY', 'your-secret-key')
        decoded = jwt.decode(token, secret_key, algorithms=['HS256'])
        
        # Verificar se token não expirou
        exp_timestamp = decoded.get('exp')
        if exp_timestamp:
            exp_datetime = datetime.fromtimestamp(exp_timestamp, timezone.utc)
            if datetime.now(timezone.utc) > exp_datetime:
                return False, None, "Token expirado"
        
        # Extrair email
        email = decoded.get('email')
        if not email:
            return False, None, "Email não encontrado no token"
        
        logger.info(f"Token JWT válido para: {email}")
        return True, email, None
        
    except jwt.ExpiredSignatureError:
        return False, None, "Token expirado"
    except jwt.InvalidSignatureError:
        return False, None, "Assinatura do token inválida"
    except jwt.DecodeError:
        return False, None, "Token malformado"
    except jwt.InvalidTokenError as e:
        return False, None, f"Token inválido: {str(e)}"

def require_valid_token(f):
    """
    Decorator que requer um token JWT válido.
    Diferente do require_authorization, este apenas valida o token,
    não verifica se o usuário está autorizado.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        is_valid, email, error_msg = validate_jwt_token()
        
        if not is_valid:
            logger.warning(f"Token inválido: {error_msg}")
            return jsonify({
                "error": "Unauthorized",
                "message": error_msg
            }), 401
        
        # Adicionar email ao request para uso posterior
        request.current_user_email = email
        return f(*args, **kwargs)
    
    return decorated_function

# Aplicar em todos os endpoints que precisam de token válido
@app.route('/api/some-protected-endpoint', methods=['GET'])
@require_valid_token
def protected_endpoint():
    # Agora você pode acessar o email via request.current_user_email
    user_email = getattr(request, 'current_user_email', None)
    return jsonify({"message": f"Olá, {user_email}!"})

# Para endpoints que precisam de token E autorização
@app.route('/api/admin/users', methods=['GET'])
@require_valid_token
@require_authorization
def get_admin_users():
    # Este endpoint requer token válido E usuário autorizado
    pass
```

### 2.2 Middleware de Proteção Global

**Adições em:** `backend/app.py`

```python
# Lista de endpoints que requerem proteção
PROTECTED_ENDPOINTS = [
    '/api/admin/users',
    '/api/admin/access-requests',
    '/api/user/profile',
    # Adicione outros endpoints conforme necessário
]

@app.before_request
def check_protected_endpoints():
    """
    Middleware global que intercepta requisições para endpoints protegidos.
    """
    # Verificar se é um endpoint protegido
    if request.path in PROTECTED_ENDPOINTS:
        # Verificar método HTTP (algumas rotas podem ter métodos específicos)
        if request.method in ['GET', 'POST', 'PUT', 'DELETE']:
            is_valid, email, error_msg = validate_jwt_token()
            
            if not is_valid:
                logger.warning(f"Acesso negado a {request.path}: {error_msg}")
                return jsonify({
                    "error": "Unauthorized",
                    "message": error_msg,
                    "endpoint": request.path
                }), 401

# Tratamento de erros específicos
@app.errorhandler(401)
def handle_unauthorized(error):
    """Tratamento customizado para erros 401"""
    return jsonify({
        "error": "Unauthorized",
        "message": "Acesso não autorizado. Token válido requerido.",
        "status_code": 401
    }), 401

@app.errorhandler(403)
def handle_forbidden(error):
    """Tratamento customizado para erros 403"""
    return jsonify({
        "error": "Forbidden",
        "message": "Acesso proibido. Permissões insuficientes.",
        "status_code": 403
    }), 403
```

---

## ✅ ITEM 3: Validação de Credenciais

### 3.1 Calibrar Endpoint de Super Admin

**Modificações em:** `backend/app.py`

```python
import bcrypt
import logging

logger = logging.getLogger(__name__)

# Configurar hash da senha super admin
# IMPORTANTE: Trocar por hash real da senha "***TEST_PASSWORD_REDACTED***"
SUPER_ADMIN_PASSWORD_HASH = "$2b$12$..."  # Hash bcrypt da senha atual

@app.route('/auth/super-admin', methods=['POST'])
def super_admin_login():
    """
    Endpoint de login do super administrador com validação robusta.
    """
    try:
        data = request.get_json()
        
        # Validar dados de entrada
        if not data:
            logger.warning("Tentativa de login sem dados JSON")
            return jsonify({"error": "Dados inválidos"}), 400
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        # Validar campos obrigatórios
        if not email or not password:
            logger.warning(f"Tentativa de login com campos vazios: email={email}")
            return jsonify({
                "error": "Email e senha são obrigatórios"
            }), 400
        
        # Verificar se é o email do super admin
        if email != 'suporte@caracore.com.br':
            logger.warning(f"Tentativa de login com email inválido: {email}")
            return jsonify({
                "error": "Credenciais inválidas"
            }), 401
        
        # Verificar senha com bcrypt
        try:
            password_bytes = password.encode('utf-8')
            hash_bytes = SUPER_ADMIN_PASSWORD_HASH.encode('utf-8')
            
            if not bcrypt.checkpw(password_bytes, hash_bytes):
                logger.warning(f"Tentativa de login com senha incorreta: {email}")
                # Log para auditoria de segurança
                log_failed_login_attempt(email, request.remote_addr)
                return jsonify({
                    "error": "Credenciais inválidas"
                }), 401
                
        except Exception as e:
            logger.error(f"Erro na verificação de senha: {e}")
            return jsonify({
                "error": "Erro interno do servidor"
            }), 500
        
        # Gerar token JWT para super admin
        token_payload = {
            'email': email,
            'role': 'super_admin',
            'exp': datetime.utcnow() + timedelta(hours=24),
            'iat': datetime.utcnow()
        }
        
        secret_key = current_app.config.get('SECRET_KEY', 'your-secret-key')
        token = jwt.encode(token_payload, secret_key, algorithm='HS256')
        
        # Log de login bem-sucedido
        logger.info(f"Login super admin bem-sucedido: {email}")
        
        return jsonify({
            "success": True,
            "token": token,
            "user": {
                "email": email,
                "role": "super_admin"
            },
            "expires_in": 86400  # 24 horas em segundos
        })
        
    except Exception as e:
        logger.error(f"Erro no endpoint de login super admin: {e}")
        return jsonify({
            "error": "Erro interno do servidor"
        }), 500

def log_failed_login_attempt(email, ip_address):
    """
    Registra tentativas de login falhadas para auditoria de segurança.
    """
    try:
        audit_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": "failed_login_attempt",
            "email": email,
            "ip_address": ip_address,
            "user_agent": request.headers.get('User-Agent', 'Unknown'),
            "endpoint": "/auth/super-admin"
        }
        
        # Salvar em arquivo de auditoria
        audit_file = os.path.join(os.path.dirname(__file__), 'logs', 'security_audit.jsonl')
        os.makedirs(os.path.dirname(audit_file), exist_ok=True)
        
        with open(audit_file, 'a', encoding='utf-8') as f:
            f.write(json.dumps(audit_data) + '\\n')
            
        logger.info(f"Tentativa de login falhada registrada: {email}")
        
    except Exception as e:
        logger.error(f"Erro ao salvar log de auditoria: {e}")

# Implementar throttling básico (opcional)
login_attempts = {}  # Em produção, usar Redis ou banco de dados

def is_rate_limited(ip_address, max_attempts=5, window_minutes=15):
    """
    Implementa rate limiting básico para tentativas de login.
    """
    current_time = datetime.utcnow()
    window_start = current_time - timedelta(minutes=window_minutes)
    
    # Limpar tentativas antigas
    if ip_address in login_attempts:
        login_attempts[ip_address] = [
            attempt_time for attempt_time in login_attempts[ip_address] 
            if attempt_time > window_start
        ]
    
    # Verificar se excedeu limite
    attempts_count = len(login_attempts.get(ip_address, []))
    if attempts_count >= max_attempts:
        return True
    
    # Registrar nova tentativa
    if ip_address not in login_attempts:
        login_attempts[ip_address] = []
    login_attempts[ip_address].append(current_time)
    
    return False
```

### 3.2 Gerar Hash da Senha

**Script auxiliar:** `scripts/generate_password_hash.py`

```python
import bcrypt

def generate_password_hash(password):
    """
    Gera hash bcrypt para uma senha.
    """
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt(rounds=12)  # 12 rounds é um bom equilíbrio segurança/performance
    hash_bytes = bcrypt.hashpw(password_bytes, salt)
    return hash_bytes.decode('utf-8')

def verify_password(password, hash_string):
    """
    Verifica se uma senha corresponde ao hash.
    """
    password_bytes = password.encode('utf-8')
    hash_bytes = hash_string.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hash_bytes)

if __name__ == "__main__":
    # Gerar hash para a senha atual
    current_password = "***TEST_PASSWORD_REDACTED***"
    hash_result = generate_password_hash(current_password)
    
    print(f"Senha: {current_password}")
    print(f"Hash: {hash_result}")
    
    # Verificar se o hash está correto
    is_valid = verify_password(current_password, hash_result)
    print(f"Verificação: {'✅ Correto' if is_valid else '❌ Incorreto'}")
    
    # Para usar no código, copie o hash gerado para SUPER_ADMIN_PASSWORD_HASH
    print(f"\\nPara usar no app.py:")
    print(f'SUPER_ADMIN_PASSWORD_HASH = "{hash_result}"')
```

---

## 🧪 SCRIPTS DE TESTE

### Teste de Autorização

**Script:** `scripts/test_authorization.py`

```python
import requests
import json

# Configurações
BASE_URL = "https://caracore-backend-docker.azurewebsites.net"
VALID_TOKEN = "seu_token_jwt_aqui"
INVALID_TOKEN = "token_invalido"

def test_authorization():
    """
    Testa o sistema de autorização implementado.
    """
    tests = [
        {
            "name": "Acesso com token válido e usuário autorizado",
            "token": VALID_TOKEN,
            "expected_status": 200
        },
        {
            "name": "Acesso sem token",
            "token": None,
            "expected_status": 401
        },
        {
            "name": "Acesso com token inválido",
            "token": INVALID_TOKEN,
            "expected_status": 401
        }
    ]
    
    for test in tests:
        print(f"\\n🧪 {test['name']}")
        
        headers = {}
        if test['token']:
            headers['Authorization'] = f"Bearer {test['token']}"
        
        try:
            response = requests.get(f"{BASE_URL}/api/admin/users", headers=headers)
            
            if response.status_code == test['expected_status']:
                print(f"✅ PASS - Status: {response.status_code}")
            else:
                print(f"❌ FAIL - Esperado: {test['expected_status']}, Recebido: {response.status_code}")
                print(f"Response: {response.text}")
                
        except Exception as e:
            print(f"❌ ERROR - {e}")

if __name__ == "__main__":
    test_authorization()
```

---

**Última Atualização:** 04/11/2025  
**Versão:** 1.0  
**Responsável:** Equipe Cara Core
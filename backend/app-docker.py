# app.py - Versão simplificada para Docker (sem JOSE/JWT temporariamente)
import os
import sys
import json
import logging
import time
from pathlib import Path
from datetime import datetime, timedelta
from urllib.parse import urlencode, parse_qs, urlparse
from base64 import b64decode

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(name)s %(message)s'
)

# Logger específico para a aplicação
logger = logging.getLogger('cara-core-backend')

# Adicionar python_packages ao path se existir (para Azure App Service)
APP_ROOT = Path(__file__).resolve().parent
SITE_PACKAGES = APP_ROOT / ".python_packages" / "lib" / "site-packages"
if SITE_PACKAGES.exists():
    sys.path.insert(0, str(SITE_PACKAGES))

import requests
from flask import Flask, jsonify, make_response, request

# Importar módulos locais
try:
    from authorization import is_user_authorized, get_user_role, load_authorized_users
    logger.info("Authorization module carregado - controle de acesso habilitado")
    AUTHORIZATION_ENABLED = True
except Exception as e:
    logger.warning(f"Authorization module não carregado: {e}")
    AUTHORIZATION_ENABLED = False

# Configuração da aplicação
app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')

# Configurações
ALLOWED_ORIGIN = os.environ.get('ALLOWED_ORIGIN', 'https://www.caracore.com.br')

logger.info(f"Backend inicializado. allowed_origin={ALLOWED_ORIGIN}")

# Configurações OAuth2/OIDC
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')

if GOOGLE_CLIENT_ID:
    logger.info("GOOGLE_CLIENT_ID configurado (valor oculto)")
if GOOGLE_CLIENT_SECRET:
    logger.info("GOOGLE_CLIENT_SECRET carregado do ambiente")

# Google allowed domains (restrição para caracore.com.br)
GOOGLE_ALLOWED_DOMAINS = ['caracore.com.br']
logger.info(f"Google allowed domains restritos a: {', '.join(GOOGLE_ALLOWED_DOMAINS)}")

# Microsoft Azure AD
AZURE_CLIENT_ID = os.environ.get('AZURE_CLIENT_ID')
AZURE_CLIENT_SECRET = os.environ.get('AZURE_CLIENT_SECRET')
AZURE_TENANT_ID = os.environ.get('AZURE_TENANT_ID')

if AZURE_CLIENT_ID:
    logger.info("AZURE_CLIENT_ID configurado (valor oculto)")
if AZURE_CLIENT_SECRET:
    logger.info("AZURE_CLIENT_SECRET carregado do ambiente")
if AZURE_TENANT_ID:
    logger.info("AZURE_TENANT_ID definido (valor oculto)")

# URLs dos endpoints Microsoft
MICROSOFT_TOKEN_URL = f'https://login.microsoftonline.com/{AZURE_TENANT_ID}/oauth2/v2.0/token' if AZURE_TENANT_ID else None
if MICROSOFT_TOKEN_URL:
    logger.info(f"Token endpoint Microsoft configurado: {MICROSOFT_TOKEN_URL}")

# Configuração CORS
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = ALLOWED_ORIGIN
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response

@app.after_request
def after_request(response):
    return add_cors_headers(response)

@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = make_response()
        return add_cors_headers(response)

# Health check endpoint
@app.route('/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0',
        'authorization_enabled': AUTHORIZATION_ENABLED
    })

# Root endpoint
@app.route('/')
def index():
    return jsonify({
        'message': 'CaraCore Backend API',
        'version': '1.0.0',
        'status': 'running',
        'timestamp': datetime.utcnow().isoformat()
    })

# Authorization endpoints (Fase 4)
@app.route('/api/check-authorization', methods=['POST'])
def check_authorization():
    """Endpoint para verificar autorização do usuário"""
    if not AUTHORIZATION_ENABLED:
        return jsonify({'error': 'Authorization module not available'}), 500
    
    try:
        data = request.get_json()
        if not data or 'email' not in data:
            return jsonify({'error': 'Email is required'}), 400
        
        email = data['email']
        provider = data.get('provider', 'unknown')
        
        # Verificar se o usuário está autorizado
        is_authorized = is_user_authorized(email)
        
        if is_authorized:
            user_role = get_user_role(email)
            return jsonify({
                'authorized': True,
                'email': email,
                'role': user_role,
                'provider': provider
            })
        else:
            return jsonify({
                'authorized': False,
                'email': email,
                'message': 'User not authorized'
            }), 403
            
    except Exception as e:
        logger.error(f"Erro em check_authorization: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/admin/users', methods=['GET'])
def get_authorized_users():
    """Endpoint admin para listar usuários autorizados"""
    if not AUTHORIZATION_ENABLED:
        return jsonify({'error': 'Authorization module not available'}), 500
    
    try:
        users_data = load_authorized_users()
        return jsonify(users_data)
    except Exception as e:
        logger.error(f"Erro em get_authorized_users: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/admin/users/<email>/approve', methods=['POST'])
def approve_user(email):
    """Endpoint admin para aprovar usuário"""
    if not AUTHORIZATION_ENABLED:
        return jsonify({'error': 'Authorization module not available'}), 500
    
    return jsonify({'message': 'User approval functionality coming soon'}), 501

@app.route('/api/admin/users/<email>/reject', methods=['POST'])
def reject_user(email):
    """Endpoint admin para rejeitar usuário"""
    if not AUTHORIZATION_ENABLED:
        return jsonify({'error': 'Authorization module not available'}), 500
    
    return jsonify({'message': 'User rejection functionality coming soon'}), 501

@app.route('/api/admin/audit-log', methods=['GET'])
def get_audit_log():
    """Endpoint admin para visualizar audit log"""
    if not AUTHORIZATION_ENABLED:
        return jsonify({'error': 'Authorization module not available'}), 500
    
    return jsonify({'message': 'Audit log functionality coming soon'}), 501

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=False)
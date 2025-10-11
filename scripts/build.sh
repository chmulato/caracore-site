#!/bin/bash

# Script de build para o site Cara Core
# Pode ser executado localmente ou no GitHub Actions

set -euo pipefail

# Descobrir diretório do script e garantir execução a partir da raiz do projeto
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${ROOT_DIR}"

echo "[BUILD] Iniciando build do Cara Core..."

# Verificar se estamos no GitHub Actions
if [ "$GITHUB_ACTIONS" = "true" ]; then
    echo "[INFO] Executando no GitHub Actions"
    ENVIRONMENT="production"
    BASE_URL="https://chmulato.github.io/cara-core"
else
    echo "[INFO] Executando localmente"
    ENVIRONMENT="development"
    BASE_URL="http://localhost:8000"
fi

echo "[INFO] Ambiente: $ENVIRONMENT"
echo "[INFO] URL Base: $BASE_URL"

# Criar diretório de configuração se não existir
mkdir -p secure/config

# Criar configuração do Google para o ambiente atual
cat > secure/config/google.json << EOF
{
  "authority": "https://accounts.google.com",
  "client_id": "1023942712021-7k4aalpg2oeenhisln9tk9s15m26iruu.apps.googleusercontent.com",
  "redirect_uri": "${BASE_URL}/secure/callback.html",
  "response_type": "code",
  "scope": "openid profile email",
  "post_logout_redirect_uri": "${BASE_URL}/secure/logout.html",
  "metadata": {
    "issuer": "https://accounts.google.com",
    "authorization_endpoint": "https://accounts.google.com/o/oauth2/v2/auth",
    "token_endpoint": "https://oauth2.googleapis.com/token",
    "userinfo_endpoint": "https://openidconnect.googleapis.com/v1/userinfo",
    "jwks_uri": "https://www.googleapis.com/oauth2/v3/certs"
  }
}
EOF

# Criar configuração do Microsoft Entra para o ambiente atual
cat > secure/config/entra.json << EOF
{
  "authority": "https://login.microsoftonline.com/consumers/v2.0",
  "client_id": "***AZURE_SECRET_REDACTED***",
  "redirect_uri": "${BASE_URL}/secure/callback.html",
  "response_type": "code",
  "scope": "openid profile email",
  "post_logout_redirect_uri": "${BASE_URL}/secure/logout.html",
  "metadata": {
    "issuer": "https://login.microsoftonline.com/consumers/v2.0",
    "authorization_endpoint": "https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize",
    "token_endpoint": "https://login.microsoftonline.com/consumers/oauth2/v2.0/token",
    "userinfo_endpoint": "https://graph.microsoft.com/oidc/userinfo",
    "jwks_uri": "https://login.microsoftonline.com/consumers/discovery/v2.0/keys"
  }
}
EOF

# Criar configuração de logging baseada no ambiente
if [ "$ENVIRONMENT" = "production" ]; then
    LOG_LEVEL="WARN"
    CONSOLE_LOGGING="false"
    DEBUG_PANEL="false"
else
    LOG_LEVEL="DEBUG"
    CONSOLE_LOGGING="true"
    DEBUG_PANEL="true"
fi

cat > secure/log-config.js << EOF
// Configuração de logging para $ENVIRONMENT
window.OIDC_LOG_CONFIG = {
  logLevel: '$LOG_LEVEL',
  consoleLogging: $CONSOLE_LOGGING,
  debugPanel: $DEBUG_PANEL,
  autoSave: true,
  maxLogs: 1000,
  saveInterval: 30000, // 30 segundos
  environment: '$ENVIRONMENT',
  baseUrl: '$BASE_URL'
};

// Configuração para produção - carregar oidc-client-ts via CDN
if ('$ENVIRONMENT' === 'production') {
  window.OIDC_CDN_FALLBACK = true;
}
EOF

echo "[OK] Configurações criadas:"
echo "   - secure/config/google.json"
echo "   - secure/config/entra.json" 
echo "   - secure/log-config.js"

# Verificar se os arquivos principais existem
echo "[CHECK] Verificando arquivos principais..."

REQUIRED_FILES=(
    "secure/auth.js"
    "secure/logger.js"
    "secure/index.html"
    "secure/restrita.html"
    "secure/logout.html"
    "secure/assets/style.css"
)

MISSING_FILES=0
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   [OK] $file"
    else
        echo "   [WARN] $file (FALTANDO - ignorando para deploy)"
        MISSING_FILES=$((MISSING_FILES + 1))
    fi
done

if [ $MISSING_FILES -gt 0 ]; then
    echo "[WARN] $MISSING_FILES arquivos estão faltando, mas continuando deploy..."
fi

# Listar estrutura final
echo "[FILES] Estrutura do projeto:"
find . -name "*.html" -o -name "*.js" -o -name "*.css" -o -name "*.json" | grep -E "(secure|js|css)" | sort

echo "[SUCESSO] Build concluído com sucesso para $ENVIRONMENT!"
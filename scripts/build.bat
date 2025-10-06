@echo off
REM Script de build para o site Cara Core (Windows)
REM Pode ser executado a partir de qualquer diretório

setlocal ENABLEEXTENSIONS

REM Garantir que estamos na raiz do projeto (um nível acima deste script)
set "SCRIPT_DIR=%~dp0"
if not defined SCRIPT_DIR set "SCRIPT_DIR=.\"
pushd "%SCRIPT_DIR%.." >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Nao foi possivel acessar a raiz do projeto a partir de %SCRIPT_DIR%
    exit /b 1
)

set "EXIT_CODE=0"

echo [BUILD] Iniciando build do Cara Core...

set "ENVIRONMENT=development"
set "BASE_URL=http://localhost:8000"

echo [INFO] Executando localmente
echo [INFO] Ambiente: %ENVIRONMENT%
echo [INFO] URL Base: %BASE_URL%

REM Criar diretório de configuração se não existir
if not exist "secure\config" mkdir "secure\config"

REM Criar configuração do Google para desenvolvimento
(
echo {
echo   "authority": "https://accounts.google.com",
echo   "client_id": "1023942712021-7k4aalpg2oeenhisln9tk9s15m26iruu.apps.googleusercontent.com",
echo   "redirect_uri": "%BASE_URL%/secure/callback.html",
echo   "response_type": "code",
echo   "scope": "openid profile email",
echo   "post_logout_redirect_uri": "%BASE_URL%/secure/logout.html",
echo   "metadata": {
echo     "issuer": "https://accounts.google.com",
echo     "authorization_endpoint": "https://accounts.google.com/o/oauth2/v2/auth",
echo     "token_endpoint": "https://oauth2.googleapis.com/token",
echo     "userinfo_endpoint": "https://openidconnect.googleapis.com/v1/userinfo",
echo     "jwks_uri": "https://www.googleapis.com/oauth2/v3/certs"
echo   }
echo }
) > "secure\config\google.json"

REM Criar configuração do Microsoft Entra para desenvolvimento
(
echo {
echo   "authority": "https://login.microsoftonline.com/consumers/v2.0",
echo   "client_id": "8ef17663-438f-4777-99ca-c5ad5b2a2993",
echo   "redirect_uri": "%BASE_URL%/secure/callback.html",
echo   "response_type": "code",
echo   "scope": "openid profile email",
echo   "post_logout_redirect_uri": "%BASE_URL%/secure/logout.html",
echo   "metadata": {
echo     "issuer": "https://login.microsoftonline.com/consumers/v2.0",
echo     "authorization_endpoint": "https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize",
echo     "token_endpoint": "https://login.microsoftonline.com/consumers/oauth2/v2.0/token",
echo     "userinfo_endpoint": "https://graph.microsoft.com/oidc/userinfo",
echo     "jwks_uri": "https://login.microsoftonline.com/consumers/discovery/v2.0/keys"
echo   }
echo }
) > "secure\config\entra.json"

REM Criar configuração de logging para desenvolvimento
(
echo // Configuração de logging para %ENVIRONMENT%
echo window.OIDC_LOG_CONFIG = {
echo   logLevel: 'DEBUG',
echo   consoleLogging: true,
echo   debugPanel: true,
echo   autoSave: true,
echo   maxLogs: 1000,
echo   saveInterval: 30000, // 30 segundos
echo   environment: '%ENVIRONMENT%',
echo   baseUrl: '%BASE_URL%'
echo };
echo.
echo // Configuração para desenvolvimento
echo window.OIDC_CDN_FALLBACK = false;
) > "secure\log-config.js"

echo [OK] Configurações criadas:
echo    - secure\config\google.json
echo    - secure\config\entra.json 
echo    - secure\log-config.js

echo [CHECK] Verificando arquivos principais...

REM Verificar se os arquivos principais existem
set FILES_OK=1

if not exist "secure\auth.js" (
    echo    [ERRO] secure\auth.js ^(FALTANDO^)
    set FILES_OK=0
) else (
    echo    [OK] secure\auth.js
)

if not exist "secure\logger.js" (
    echo    [ERRO] secure\logger.js ^(FALTANDO^)
    set FILES_OK=0
) else (
    echo    [OK] secure\logger.js
)

if not exist "secure\index.html" (
    echo    [ERRO] secure\index.html ^(FALTANDO^)
    set FILES_OK=0
) else (
    echo    [OK] secure\index.html
)

if not exist "secure\restrita.html" (
    echo    [ERRO] secure\restrita.html ^(FALTANDO^)
    set FILES_OK=0
) else (
    echo    [OK] secure\restrita.html
)

if not exist "secure\logout.html" (
    echo    [ERRO] secure\logout.html ^(FALTANDO^)
    set FILES_OK=0
) else (
    echo    [OK] secure\logout.html
)

if not exist "secure\assets\style.css" (
    echo    [ERRO] secure\assets\style.css ^(FALTANDO^)
    set FILES_OK=0
) else (
    echo    [OK] secure\assets\style.css
)

if %FILES_OK%==0 (
    echo [ERRO] Alguns arquivos estão faltando!
    set "EXIT_CODE=1"
    goto :final
)

echo [SUCESSO] Build concluído com sucesso para %ENVIRONMENT%!
echo [INFO] Para testar localmente, execute: python server.py

if /I not "%GITHUB_ACTIONS%"=="true" (
    pause
)

:final
popd >nul 2>&1
exit /b %EXIT_CODE%

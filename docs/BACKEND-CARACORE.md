# Backend CaraCore - Documentação Técnica

## Visão Geral

Este documento descreve a implementação e arquitetura do backend Flask para autenticação OIDC do projeto CaraCore, deployado no Azure App Service como `caracore-backend.azurewebsites.net`.

## Arquitetura

### Estrutura do Backend

```
backend/
├── app.py                 # Aplicação Flask principal
├── requirements.txt       # Dependências Python
├── oryx-build-commands.txt # Comandos de build do Azure
└── logs/                  # Logs locais (desenvolvimento)
```

### Deployment

- **Plataforma:** Azure App Service (Linux)
- **Runtime:** Python 3.11.13
- **WSGI Server:** Gunicorn 23.0.0
- **URL Produção:** `https://caracore-backend.azurewebsites.net`
- **Recursos Azure:**
  - App Service: `caracore-backend`
  - App Service Plan: `caracore-plan`

## Funcionalidades

### Endpoints Principais

#### 1. Health Check

```http
GET /health
Response: {"status": "ok"}
```

- Verificação de saúde da aplicação
- Usado por monitoramento e testes automatizados

#### 2. Google OAuth Token Exchange

```http
POST /oauth/google/token
Content-Type: application/x-www-form-urlencoded

Parâmetros:
- code: Authorization code do Google
- code_verifier: PKCE code verifier
- redirect_uri: URI de redirecionamento
```

**Funcionalidade:**

- Troca authorization code por access token
- Validação de ID token usando JWKS do Google
- Extração de claims do usuário (email, nome, foto)

#### 3. Microsoft Entra ID Token Exchange

```http
POST /oauth/microsoft/token
Content-Type: application/x-www-form-urlencoded

Parâmetros:
- code: Authorization code do Microsoft
- code_verifier: PKCE code verifier (opcional)
- redirect_uri: URI de redirecionamento
```

**Funcionalidade:**

- Troca authorization code por access token
- Suporte a validação de ID token
- Extração de claims do usuário

### CORS (Cross-Origin Resource Sharing)

**Configuração:**

- **Origin Permitido:** `https://www.caracore.com.br`
- **Métodos:** GET, POST, OPTIONS
- **Headers:** Content-Type, Authorization
- **Credentials:** Permitido

## Configuração

### Variáveis de Ambiente (App Service Settings)

#### Google OAuth (Obrigatório)

```bash
GOOGLE_CLIENT_ID=seu_client_id_google.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-seu_client_secret_google
```

#### Microsoft Entra ID (Opcional)

```bash
AZURE_CLIENT_ID=seu_client_id_azure
AZURE_CLIENT_SECRET=seu_client_secret_azure
AZURE_TENANT_ID=seu_tenant_id_ou_common
```

#### Configurações Adicionais

```bash
OAUTH_REDIRECT_URI=https://www.caracore.com.br/secure/callback
ALLOWED_ORIGIN=https://www.caracore.com.br
```

### Dependências Python

```python
# requirements.txt principais
Flask==3.0.3
Flask-CORS==4.0.1
requests==2.32.5
PyJWT==2.8.0
cryptography==42.0.5
gunicorn==23.0.0
```

## Segurança

### Validação de Tokens

#### Google OAuth

- **JWKS Endpoint:** `https://www.googleapis.com/oauth2/v3/certs`
- **Algoritmo:** RS256
- **Validação:** Issuer, audience, expiration

#### Microsoft Entra ID

- **JWKS Endpoint:** `https://login.microsoftonline.com/{tenant}/discovery/v2.0/keys`
- **Algoritmo:** RS256
- **Validação:** Issuer, audience, expiration

### Proteções Implementadas

1. **CORS Restritivo:** Apenas www.caracore.com.br
2. **Validação de Parâmetros:** Campos obrigatórios verificados
3. **Sanitização de Logs:** Valores sensíveis ocultados
4. **HTTPS Obrigatório:** Redirecionamento automático
5. **Error Handling:** Responses sanitizados

## Monitoramento e Logs

### Estrutura de Logs

```python
# Formato dos logs
2025-10-11 22:13:07,740 INFO Backend inicializado. allowed_origin=https://www.caracore.com.br
2025-10-11 22:13:07,740 INFO GOOGLE_CLIENT_ID configurado (valor oculto)
2025-10-11 22:13:07,742 INFO GOOGLE_CLIENT_SECRET carregado do ambiente
```

### Tipos de Log

#### INFO

- Inicialização do backend
- Configurações carregadas
- Requests processados com sucesso

#### WARNING

- Configurações faltando (non-blocking)
- Requests inválidos
- Fallbacks ativados

#### ERROR

- Falhas na validação de tokens
- Erros de comunicação com provedores
- Configurações críticas faltando

### Health Monitoring

- **Azure Application Insights:** Habilitado
- **Health Check Endpoint:** `/health`
- **Uptime Monitoring:** 99.9% SLA
- **Response Time:** < 200ms típico

## Deploy e CI/CD

### Scripts de Deploy

#### 1. Infraestrutura

```bash
python scripts/infra_to_azure.py
```

- Cria recursos Azure (caracore-plan, caracore-backend)
- Configura App Service Settings
- Define configurações CORS e HTTPS

#### 2. Deploy da Aplicação

```bash
python scripts/deploy_to_azure.py
```

- Gera backend.zip com dependências
- Upload via Azure CLI
- Restart automático do App Service

#### 3. Validação

```bash
python scripts/teste_end_point_azure.py
python scripts/validar_api_azure.py
```

### Build Commands (Azure)

```bash
# oryx-build-commands.txt
pip install -r requirements.txt --target="./.python_packages/lib/site-packages"
```

## Migração Key Vault para App Service Settings

### Antes (Arquitetura Legada)

- Azure Key Vault para GOOGLE_CLIENT_SECRET
- Configuração complexa com managed identity
- Custo adicional (~$0.30/mês)
- Múltiplos pontos de falha

### Depois (Arquitetura Atual)

- App Service Settings direto
- Configuração simplificada
- Sem custos adicionais
- Menos pontos de falha

### Benefícios da Migração

1. **Redução de Custos:** Eliminação do Key Vault
2. **Simplicidade:** Menos recursos para gerenciar
3. **Performance:** Acesso direto às configurações
4. **Manutenibilidade:** Deploy e configuração mais simples

## Performance

### Métricas Típicas

- **Cold Start:** < 5 segundos
- **Warm Response:** < 200ms
- **Token Exchange:** < 1 segundo
- **Health Check:** < 50ms

### Otimizações Implementadas

1. **Gunicorn Workers:** Processamento paralelo
2. **Token Caching:** Cache de chaves JWKS
3. **Connection Pooling:** Reutilização de conexões HTTP
4. **Response Compression:** Gzip habilitado

## Testes

### Scripts de Teste Disponíveis

```bash
# Testes locais
python scripts/teste_end_point_local.py
python scripts/smoke_teste_local.py

# Testes Azure
python scripts/teste_end_point_azure.py
python scripts/validar_api_azure.py
python scripts/executar_testes_azure.py
```

### Cobertura de Testes

- Health check endpoint
- CORS preflight e headers
- Google OAuth token exchange
- Microsoft OAuth token exchange
- Error handling
- Configuração de ambiente

## Troubleshooting

### Problemas Comuns

#### 1. Google OAuth Retorna HTTP 500

```bash
# Verificar configuração
curl https://caracore-backend.azurewebsites.net/health

# Log esperado
WARNING GOOGLE_CLIENT_SECRET not set - /oauth/google/token will return HTTP 500
```

**Solução:** Configurar `GOOGLE_CLIENT_SECRET` no App Service Settings

#### 2. CORS Errors

```javascript
// Error no frontend
Access to XMLHttpRequest at 'https://caracore-backend.azurewebsites.net/oauth/google/token' 
from origin 'https://outro-dominio.com' has been blocked by CORS policy
```

**Solução:** Verificar se o request vem de `https://www.caracore.com.br`

#### 3. Token Validation Failed

```bash
# Log de erro
ERROR Token validation failed: Invalid signature
```

**Possíveis Causas:**

- Token expirado
- Token de outro issuer
- Chaves JWKS desatualizadas

### Debug Local

```bash
# Executar backend local
cd backend
export GOOGLE_CLIENT_ID="seu_id"
export GOOGLE_CLIENT_SECRET="seu_secret"
python app.py

# Testar endpoints
curl http://localhost:5000/health
curl -X POST http://localhost:5000/oauth/google/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "code=test&code_verifier=test&redirect_uri=http://localhost"
```

## Referências Técnicas

### Documentação OAuth

- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Microsoft Identity Platform](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
- [PKCE RFC 7636](https://tools.ietf.org/html/rfc7636)

### Azure App Service

- [App Service Documentation](https://docs.microsoft.com/en-us/azure/app-service/)
- [Python on App Service](https://docs.microsoft.com/en-us/azure/app-service/configure-language-python)

### Flask & Security

- [Flask Documentation](https://flask.palletsprojects.com/)
- [Flask-CORS](https://flask-cors.readthedocs.io/)
- [PyJWT](https://pyjwt.readthedocs.io/)

---

**Versão:** 1.0  
**Última Atualização:** 11 de outubro de 2025  
**Autor:** CaraCore Team  
**Status:** Produção Estável

### Dependências Python

```python
# requirements.txt principais
Flask==3.0.3
Flask-CORS==4.0.1
requests==2.32.5
PyJWT==2.8.0
cryptography==42.0.5
gunicorn==23.0.0
```

## 🔐 Segurança

### Validação de Tokens

#### Google OAuth
- **JWKS Endpoint:** `https://www.googleapis.com/oauth2/v3/certs`
- **Algoritmo:** RS256
- **Validação:** Issuer, audience, expiration

#### Microsoft Entra ID
- **JWKS Endpoint:** `https://login.microsoftonline.com/{tenant}/discovery/v2.0/keys`
- **Algoritmo:** RS256
- **Validação:** Issuer, audience, expiration

### Proteções Implementadas

1. **CORS Restritivo:** Apenas www.caracore.com.br
2. **Validação de Parâmetros:** Campos obrigatórios verificados
3. **Sanitização de Logs:** Valores sensíveis ocultados
4. **HTTPS Obrigatório:** Redirecionamento automático
5. **Error Handling:** Responses sanitizados

## 📊 Monitoramento e Logs

### Estrutura de Logs

```python
# Formato dos logs
2025-10-11 22:13:07,740 INFO Backend inicializado. allowed_origin=https://www.caracore.com.br
2025-10-11 22:13:07,740 INFO GOOGLE_CLIENT_ID configurado (valor oculto)
2025-10-11 22:13:07,742 INFO GOOGLE_CLIENT_SECRET carregado do ambiente
```

### Tipos de Log

#### INFO
- Inicialização do backend
- Configurações carregadas
- Requests processados com sucesso

#### WARNING
- Configurações faltando (non-blocking)
- Requests inválidos
- Fallbacks ativados

#### ERROR
- Falhas na validação de tokens
- Erros de comunicação com provedores
- Configurações críticas faltando

### Health Monitoring

- **Azure Application Insights:** Habilitado
- **Health Check Endpoint:** `/health`
- **Uptime Monitoring:** 99.9% SLA
- **Response Time:** < 200ms típico

## 🚀 Deploy e CI/CD

### Scripts de Deploy

#### 1. Infraestrutura
```bash
python scripts/infra_to_azure.py
```
- Cria recursos Azure (caracore-plan, caracore-backend)
- Configura App Service Settings
- Define configurações CORS e HTTPS

#### 2. Deploy da Aplicação
```bash
python scripts/deploy_to_azure.py
```
- Gera backend.zip com dependências
- Upload via Azure CLI
- Restart automático do App Service

#### 3. Validação
```bash
python scripts/teste_end_point_azure.py
python scripts/validar_api_azure.py
```

### Build Commands (Azure)

```bash
# oryx-build-commands.txt
pip install -r requirements.txt --target="./.python_packages/lib/site-packages"
```

## 🔄 Migração Key Vault → App Service Settings

### Antes (Arquitetura Legada)
- Azure Key Vault para GOOGLE_CLIENT_SECRET
- Configuração complexa com managed identity
- Custo adicional (~$0.30/mês)
- Múltiplos pontos de falha

### Depois (Arquitetura Atual)
- App Service Settings direto
- Configuração simplificada
- Sem custos adicionais
- Menos pontos de falha

### Benefícios da Migração

1. **Redução de Custos:** Eliminação do Key Vault
2. **Simplicidade:** Menos recursos para gerenciar
3. **Performance:** Acesso direto às configurações
4. **Manutenibilidade:** Deploy e configuração mais simples

## 📈 Performance

### Métricas Típicas

- **Cold Start:** < 5 segundos
- **Warm Response:** < 200ms
- **Token Exchange:** < 1 segundo
- **Health Check:** < 50ms

### Otimizações Implementadas

1. **Gunicorn Workers:** Processamento paralelo
2. **Token Caching:** Cache de chaves JWKS
3. **Connection Pooling:** Reutilização de conexões HTTP
4. **Response Compression:** Gzip habilitado

## 🧪 Testes

### Scripts de Teste Disponíveis

```bash
# Testes locais
python scripts/teste_end_point_local.py
python scripts/smoke_teste_local.py

# Testes Azure
python scripts/teste_end_point_azure.py
python scripts/validar_api_azure.py
python scripts/executar_testes_azure.py
```

### Cobertura de Testes

- ✅ Health check endpoint
- ✅ CORS preflight e headers
- ✅ Google OAuth token exchange
- ✅ Microsoft OAuth token exchange
- ✅ Error handling
- ✅ Configuração de ambiente

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Google OAuth Retorna HTTP 500
```bash
# Verificar configuração
curl https://caracore-backend.azurewebsites.net/health

# Log esperado
WARNING GOOGLE_CLIENT_SECRET not set - /oauth/google/token will return HTTP 500
```

**Solução:** Configurar `GOOGLE_CLIENT_SECRET` no App Service Settings

#### 2. CORS Errors
```javascript
// Error no frontend
Access to XMLHttpRequest at 'https://caracore-backend.azurewebsites.net/oauth/google/token' 
from origin 'https://outro-dominio.com' has been blocked by CORS policy
```

**Solução:** Verificar se o request vem de `https://www.caracore.com.br`

#### 3. Token Validation Failed
```bash
# Log de erro
ERROR Token validation failed: Invalid signature
```

**Possíveis Causas:**
- Token expirado
- Token de outro issuer
- Chaves JWKS desatualizadas

### Debug Local

```bash
# Executar backend local
cd backend
export GOOGLE_CLIENT_ID="seu_id"
export GOOGLE_CLIENT_SECRET="seu_secret"
python app.py

# Testar endpoints
curl http://localhost:5000/health
curl -X POST http://localhost:5000/oauth/google/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "code=test&code_verifier=test&redirect_uri=http://localhost"
```

## 📚 Referências Técnicas

### Documentação OAuth

- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Microsoft Identity Platform](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
- [PKCE RFC 7636](https://tools.ietf.org/html/rfc7636)

### Azure App Service

- [App Service Documentation](https://docs.microsoft.com/en-us/azure/app-service/)
- [Python on App Service](https://docs.microsoft.com/en-us/azure/app-service/configure-language-python)

### Flask & Security

- [Flask Documentation](https://flask.palletsprojects.com/)
- [Flask-CORS](https://flask-cors.readthedocs.io/)
- [PyJWT](https://pyjwt.readthedocs.io/)

---

**Versão:** 1.0  
**Última Atualização:** 11 de outubro de 2025  
**Autor:** CaraCore Team  
**Status:** ✅ Produção Estável
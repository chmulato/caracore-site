# Autenticação do Super Administrador

## Visão Geral

O sistema CaraCore implementa um sistema de autenticação híbrido que inclui:

- **OAuth 2.1 + OIDC** para usuários regulares (Google e Microsoft Entra ID)
- **Autenticação direta com senha** para o Super Administrador

## Credenciais do Super Administrador

- **E-mail:** `suporte@caracore.com.br`
- **Senha:** Configurada via script `setup_super_admin.py`
- **URL de Login:** https://www.caracore.com.br/secure/super-admin-setup.html

## Configuração Inicial

### 1. Gerar Hash da Senha

Execute o script de configuração:

```bash
cd d:\dev\site\cara-core\scripts
python setup_super_admin.py
```

O script irá:

- Solicitar uma senha segura (ou gerar uma automaticamente)
- Criar hash SHA-256 da senha
- Gerar chave secreta JWT
- Atualizar o arquivo `secrets.txt` automaticamente

### 2. Configurar Azure Container App (Docker)

As seguintes variáveis de ambiente devem ser configuradas no Azure Container App (`caracore-backend-docker`):

```text
SUPER_ADMIN_PASSWORD_HASH=<hash_gerado>
JWT_SECRET_KEY=<chave_secreta_gerada>
```

**Passos:**

1. Acesse o Azure Portal
2. Navegue até o Container App `caracore-backend-docker`
3. Vá em **Containers** ou **Environment variables**
4. Adicione as duas variáveis de ambiente (use Secret para JWT_SECRET_KEY)
5. Clique em **Apply/Save** e aguarde o container reiniciar

### 3. Testar Autenticação

1. Acesse: https://www.caracore.com.br/secure/super-admin-setup.html
2. O e-mail já estará preenchido: `suporte@caracore.com.br`
3. Digite a senha configurada
4. Clique em **Entrar como Super Administrador**

Se a autenticação for bem-sucedida, você será redirecionado para o painel de solicitações de acesso.

## Arquitetura Técnica

### Backend (Flask - app.py)

#### Endpoint: POST /auth/super-admin

Autentica o super administrador e retorna um token JWT.

**Request:**

```json
{
 "email": "suporte@caracore.com.br",
 "password": "senha_do_admin"
}
```

**Response (200 OK):**

```json
{
 "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 "email": "suporte@caracore.com.br",
 "role": "super_admin",
 "expires_in": 86400
}
```

**Erros:**

- `401 Unauthorized` - Credenciais inválidas
- `500 Internal Server Error` - Configuração incompleta

#### Endpoint: POST /auth/verify-super-admin

Verifica a validade de um token JWT do super admin.

**Request Headers:**

```
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
 "valid": true,
 "email": "suporte@caracore.com.br",
 "role": "super_admin",
 "exp": 1730678400
}
```

**Erros:**

- `401 Unauthorized` - Token ausente ou inválido
- `403 Forbidden` - Token não é de super admin

### Frontend (JavaScript)

#### Arquivo: secure/js/super-admin-setup.js

Gerencia a autenticação do super admin no frontend.

**Funções Principais:**

```javascript
// Autenticar super admin
async function authenticateSuperAdmin()

// Verificar se está autenticado
function isSuperAdminAuthenticated()

// Fazer logout
function logoutSuperAdmin()
```

**LocalStorage:**

- `super_admin_token` - Token JWT
- `super_admin_email` - E-mail do admin
- `super_admin_role` - Role (sempre "super_admin")
- `super_admin_authenticated` - Flag de autenticação

### Segurança

#### Hashing de Senha

- **Algoritmo:** SHA-256
- **Implementação:** Python `hashlib.sha256()`
- **Armazenamento:** Variável de ambiente no Azure

#### Token JWT

- **Algoritmo:** HS256 (HMAC with SHA-256)
- **Validade:** 24 horas
- **Payload:**

```json
{
"email": "suporte@caracore.com.br",
"role": "super_admin",
"iat": 1730592000,
"exp": 1730678400
}
```

#### Rate Limiting

- Endpoint protegido com rate limiting
- Previne ataques de força bruta

#### CORS

- Apenas origens autorizadas podem fazer requisições
- Headers de segurança aplicados

## Fluxo de Autenticação

```text
┌─────────────┐ ┌──────────────┐ ┌─────────────┐
│ Browser │ │ Backend │ │ Azure │
│ │ │ (Flask) │ │ App Service │
└──────┬──────┘ └───────┬──────┘ └──────┬──────┘
 │ │ │
 │ 1. Acessar login page │ │
 ├────────────────────────────────>│ │
 │ │ │
 │ 2. Digite email/senha │ │
 │ │ │
 │ 3. POST /auth/super-admin │ │
 ├────────────────────────────────>│ │
 │ │ │
 │ │ 4. Validar credenciais │
 │ │ - Verificar email │
 │ │ - Hash senha (SHA-256) │
 │ │ - Comparar com env var │
 │ │ │
 │ │ 5. Gerar token JWT │
 │ │ │
 │ 6. Retornar token │ │
 │<────────────────────────────────┤ │
 │ │ │
 │ 7. Armazenar em localStorage │ │
 │ │ │
 │ 8. Redirecionar para dashboard │ │
 │ │ │
```

## Manutenção

### Trocar Senha do Super Admin

Para trocar a senha, execute novamente o script:

```bash
cd d:\dev\site\cara-core\scripts
python setup_super_admin.py
```

Depois atualize as variáveis de ambiente no Azure App Service.

### Verificar Logs

Os logs de autenticação ficam disponíveis no Azure App Service:

```bash
# Via Azure CLI
az webapp log tail --name caracore-backend --resource-group <resource-group>
```

Eventos registrados:

- `Super admin autenticado com sucesso: suporte@caracore.com.br`
- `Tentativa de login super admin com email não autorizado: xyz@email.com`
- `Tentativa de login super admin com senha incorreta: suporte@caracore.com.br`

### Revogar Acesso

Para revogar o acesso imediatamente:

1. Altere `JWT_SECRET_KEY` no Azure App Service
2. Todos os tokens existentes se tornarão inválidos
3. O super admin precisará fazer login novamente

## Troubleshooting

### Erro: "Configuração do servidor incompleta"

**Causa:** Variáveis de ambiente não configuradas no Azure.

**Solução:**

1. Verifique se `SUPER_ADMIN_PASSWORD_HASH` está configurada
2. Verifique se `JWT_SECRET_KEY` está configurada
3. Reinicie o App Service após adicionar as variáveis

### Erro: "Credenciais inválidas"

**Causa:** Senha incorreta ou hash não corresponde.

**Solução:**

1. Execute novamente `setup_super_admin.py`
2. Copie o novo hash para o Azure App Service
3. Tente fazer login novamente

### Token Expira Rapidamente

**Comportamento Normal:** Tokens expiram após 24 horas.

**Para sessões mais longas:** Ajuste a expiração em `app.py`:

```python
exp=datetime.utcnow() + timedelta(hours=168) # 7 dias
```

## Referências

- **Script de Setup:** `scripts/setup_super_admin.py`
- **Backend:** `backend/app.py` (linhas com `/auth/super-admin`)
- **Frontend:** `secure/js/super-admin-setup.js`
- **Página de Login:** `secure/super-admin-setup.html`
- **Secrets:** `secrets.txt` (não versionado)
- **Template:** `secrets.txt.template`

## Segurança - Checklist

- [x] Senha hasheada (SHA-256)
- [x] Token JWT com expiração
- [x] Rate limiting nos endpoints
- [x] CORS configurado
- [x] Secrets não versionados (.gitignore)
- [x] HTTPS obrigatório em produção
- [x] Logs de tentativas de acesso
- [x] Email fixo ([suporte@caracore.com.br])
- [x] Validação de role no token

---

**Última atualização:** Novembro 2025 
**Versão:** 1.0

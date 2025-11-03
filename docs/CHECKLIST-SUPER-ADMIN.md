# ✅ Checklist de Configuração - Super Admin

## Status Atual

### ✅ Concluído

1. **Backend atualizado** (`backend/app.py`)
   - Endpoints `/auth/super-admin` criado
   - Endpoint `/auth/verify-super-admin` criado
   - Validação de credenciais com SHA-256
   - Geração de tokens JWT
   - Logging de tentativas de acesso
   - Rate limiting aplicado

2. **Frontend atualizado**
   - Página de login (`secure/super-admin-setup.html`) reformulada
   - JavaScript (`secure/js/super-admin-setup.js`) atualizado
   - Formulário de login direto (sem OAuth)
   - Gestão de tokens no localStorage

3. **Secrets configurados localmente**
   - `secrets.txt` atualizado com:
     - `SUPER_ADMIN_PASSWORD_HASH=***PASSWORD_HASH_REDACTED***`
     - `JWT_SECRET_KEY=***JWT_SECRET_REDACTED***`
   - `secrets.txt.template` atualizado
   - `.gitignore` protegendo secrets

4. **Script de setup** (`scripts/setup_super_admin.py`)
   - Geração de hash SHA-256
   - Geração de JWT secret
   - Integração com secrets.txt
   - Documentação completa

5. **Documentação criada**
   - `docs/SUPER-ADMIN-AUTH.md` - Guia completo

---

## ⚠️ Pendente - Configuração Azure

### Passo 1: Acessar Azure Portal

1. Acesse: [https://portal.azure.com]
2. Faça login com suas credenciais Azure

### Passo 2: Localizar o Container App

1. Na barra de pesquisa, digite: **caracore-backend-docker**
2. Clique no Container App **caracore-backend-docker**

### Passo 3: Configurar Variáveis de Ambiente (Docker)

Para Container Apps com Docker, há duas opções:

#### Opção A: Via Azure Portal

1. No menu lateral esquerdo, clique em **Containers** ou **Environment variables**
2. Procure pela seção **Environment variables**
3. Clique em **+ Add** para adicionar novas variáveis

#### Variável 1: SUPER_ADMIN_PASSWORD_HASH

- **Name:** `SUPER_ADMIN_PASSWORD_HASH`
- **Value:** `***PASSWORD_HASH_REDACTED***`
- **Type:** Plain text (ou Secret se disponível)
- Clique em **Add**

#### Variável 2: JWT_SECRET_KEY

- Clique em **+ Add** novamente
- **Name:** `JWT_SECRET_KEY`
- **Value:** `***JWT_SECRET_REDACTED***`
- **Type:** Secret (recomendado) ou Plain text
- Clique em **Add**

#### Opção B: Via docker-compose.yml ou Dockerfile

Adicione as variáveis no seu arquivo de configuração Docker:

```yaml
environment:
  - SUPER_ADMIN_PASSWORD_HASH=***PASSWORD_HASH_REDACTED***
  - JWT_SECRET_KEY=***JWT_SECRET_REDACTED***
```

### Passo 4: Salvar e Reiniciar

1. Clique em **Apply** ou **Save** (dependendo da interface)
2. Aguarde a confirmação da atualização
3. O container deve reiniciar automaticamente
4. Se não reiniciar, vá em **Overview** e clique em **Restart**
5. Aguarde o container reiniciar (pode levar 1-3 minutos)

### Passo 5: Verificar Configuração

Execute este comando no PowerShell para verificar se as variáveis estão configuradas:

```powershell
# Verificar variáveis em Container App (requer Azure CLI instalado)
az containerapp show --name caracore-backend-docker --resource-group <seu-resource-group> --query "properties.configuration.secrets"
```

---

## ⚠️ Pendente - Testar Autenticação

### Teste 1: Acessar Página de Login

1. Abra o navegador
2. Acesse: [https://www.caracore.com.br/secure/super-admin-setup.html]
3. Verifique se a página carrega corretamente

### Teste 2: Fazer Login

1. O e-mail já deve estar preenchido: `suporte@caracore.com.br`
2. Digite a senha configurada no script `setup_super_admin.py`
3. Clique em **Entrar como Super Administrador**

**Resultado Esperado:**

- Mensagem: "✅ Autenticado com sucesso! Redirecionando..."
- Redirecionamento para: `/secure/approval-requests.html`

### Teste 3: Verificar Token

Abra o Console do navegador (F12) e execute:

```javascript
console.log(localStorage.getItem('super_admin_token'));
console.log(localStorage.getItem('super_admin_authenticated'));
```

**Resultado Esperado:**

- Token JWT válido (longo string começando com "eyJ...")
- `super_admin_authenticated` = "true"

### Teste 4: Verificar Backend

Teste o endpoint diretamente:

```bash
# PowerShell
$body = @{
    email = "suporte@caracore.com.br"
    password = "sua_senha_aqui"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "https://caracore-backend.azurewebsites.net/auth/super-admin" -Method POST -Body $body -ContentType "application/json"

$response | ConvertTo-Json
```

**Resultado Esperado:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "suporte@caracore.com.br",
  "role": "super_admin",
  "expires_in": 86400
}
```

---

## 🔍 Troubleshooting

### Erro: "Configuração do servidor incompleta"

**Causa:** Variáveis de ambiente não estão no Azure App Service

**Solução:**

1. Verifique novamente o Passo 3 acima
2. Certifique-se de clicar em **Save** após adicionar as variáveis
3. Reinicie o App Service

### Erro: "Credenciais inválidas"

**Causa:** Senha incorreta ou hash não corresponde

**Solução:**

1.Verifique qual senha foi configurada no `setup_super_admin.py`
2.Se necessário, execute o script novamente:

```bash
cd d:\dev\site\cara-core\scripts
python setup_super_admin.py
```

3.Atualize `SUPER_ADMIN_PASSWORD_HASH` no Azure com o novo valor

### Erro: CORS / Network Error

**Causa:** Backend não está respondendo ou CORS não configurado

**Solução:**

1. Verifique se o App Service está rodando
2. Acesse [https://caracore-backend.azurewebsites.net/health]
3. Se retornar erro, verifique logs do Azure

### Token JWT Inválido

**Causa:** `JWT_SECRET_KEY` diferente entre geração e validação

**Solução:**

1. Certifique-se de usar a mesma `JWT_SECRET_KEY` gerada pelo script
2. Não altere a chave depois de gerar tokens
3. Se alterou, todos os tokens antigos ficarão inválidos

---

## 📊 Resumo das Credenciais

| Item | Valor |
|------|-------|
| **E-mail** | [suporte@caracore.com.br] |
| **Senha** | [Configurada via setup_super_admin.py] |
| **Password Hash** | ***PASSWORD_HASH_REDACTED*** |
| **JWT Secret** | ***JWT_SECRET_REDACTED*** |
| **URL Login** | [https://www.caracore.com.br/secure/super-admin-setup.html] |
| **Backend** | [https://caracore-backend.azurewebsites.net/ |

---

## 📝 Próximos Passos (Após Configuração)

1. **Testar todas as funcionalidades de admin:**
   - Aprovar/rejeitar solicitações de acesso
   - Adicionar usuários autorizados
   - Remover usuários autorizados
   - Visualizar logs de acesso

2. **Configurar backup de secrets:**
   - Guardar `secrets.txt` em local seguro
   - Considerar usar Azure Key Vault para secrets

3. **Monitorar logs:**
   - Verificar tentativas de login inválidas
   - Monitorar atividades do super admin

4. **Documentar processo para equipe:**
   - Compartilhar `docs/SUPER-ADMIN-AUTH.md`
   - Treinar administradores

---

**Data:** Novembro 2025  
**Versão:** 1.0  
**Status:** Aguardando configuração Azure ⚠️

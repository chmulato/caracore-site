# Configuração Super Admin - Docker (caracore-backend-docker)

## Guia Rápido para Ambiente Docker

### Pré-requisitos

- Código atualizado com endpoints super admin
- Script `setup_super_admin.py` disponível
- Docker rodando localmente ou no Azure Container Apps

---

## Configuração Local (Desenvolvimento)

### Passo 1: Gerar Credenciais

```bash
cd d:\dev\site\cara-core\scripts
python setup_super_admin.py
```

Isso irá gerar:
- `SUPER_ADMIN_PASSWORD_HASH` (hash SHA-256 da senha)
- `JWT_SECRET_KEY` (chave secreta para JWT)

### Passo 2: Atualizar docker/backend.env

Edite o arquivo `docker/backend.env` (crie a partir de `backend.env.sample` se não existir):

```bash
# Copiar template se necessário
cp docker/backend.env.sample docker/backend.env
```

Adicione no final do arquivo:

```bash
# SUPER ADMINISTRADOR
SUPER_ADMIN_PASSWORD_HASH=***PASSWORD_HASH_REDACTED***
JWT_SECRET_KEY=***JWT_SECRET_REDACTED***
```

### Passo 3: Reiniciar Container

```bash
cd docker
docker-compose down
docker-compose up -d
```

### Passo 4: Testar Localmente

1. Acesse: http://localhost:5051/health (verificar se backend está rodando)
2. Acesse: http://localhost:8080/secure/super-admin-setup.html
3. Email: `suporte@caracore.com.br`
4. Digite a senha configurada
5. Clique em "Entrar como Super Administrador"

---

## Configuração Azure Container Apps (Produção)

### Opção 1: Via Azure Portal (Recomendado)

#### Passo 1: Acessar Container App

1. Acesse: https://portal.azure.com
2. Busque por: **caracore-backend-docker**
3. Clique no Container App

#### Passo 2: Adicionar Variáveis de Ambiente

1. No menu lateral, clique em **Containers**
2. Clique em **Environment variables** ou **Edit and deploy**
3. Role até a seção **Environment variables**

#### Passo 3: Adicionar SUPER_ADMIN_PASSWORD_HASH

- Clique em **+ Add**
- **Name:** `SUPER_ADMIN_PASSWORD_HASH`
- **Source:** Manual entry
- **Value:** `***PASSWORD_HASH_REDACTED***`
- Clique em **Add**

#### Passo 4: Adicionar JWT_SECRET_KEY

- Clique em **+ Add** novamente
- **Name:** `JWT_SECRET_KEY`
- **Source:** Reference a secret (RECOMENDADO) ou Manual entry
- **Value:** `***JWT_SECRET_REDACTED***`
- Clique em **Add**

#### Passo 5: Aplicar e Reiniciar

1. Clique em **Create** ou **Apply** (botão no topo ou rodapé)
2. Aguarde a nova revisão ser criada (pode levar 2-3 minutos)
3. O container será reiniciado automaticamente
4. Verifique o status em **Revisions** - deve aparecer nova revisão ativa

#### Passo 6: Verificar Logs

1. Vá em **Log stream** ou **Monitoring** → **Logs**
2. Procure por:
 - "Auth manager carregado" (confirmação de módulos)
 - Erros relacionados a variáveis de ambiente

---

### Opção 2: Via Azure CLI

```bash
# Configurar variáveis no Container App
az containerapp update \
 --name caracore-backend-docker \
 --resource-group <seu-resource-group> \
 --set-env-vars \
 SUPER_ADMIN_PASSWORD_HASH=***PASSWORD_HASH_REDACTED*** \
 JWT_SECRET_KEY=***JWT_SECRET_REDACTED***
```

---

### Opção 3: Via docker-compose.yml (desenvolvimento)

Edite `docker/docker-compose.yml` e adicione no `environment`:

```yaml
services:
 backend:
 # ... outras configurações
 environment:
 # ... outras variáveis
 SUPER_ADMIN_PASSWORD_HASH: ${SUPER_ADMIN_PASSWORD_HASH}
 JWT_SECRET_KEY: ${JWT_SECRET_KEY}
```

E defina no `docker/backend.env`:

```bash
SUPER_ADMIN_PASSWORD_HASH=***PASSWORD_HASH_REDACTED***
JWT_SECRET_KEY=***JWT_SECRET_REDACTED***
```

---

## Testes

### Teste 1: Verificar Backend está Rodando

```bash
# Local
curl http://localhost:5051/health

# Produção
curl https://caracore-backend-docker.azurewebsites.net/health
```

**Resultado esperado:** `{"status": "ok"}` ou similar

### Teste 2: Testar Endpoint Super Admin

```bash
# PowerShell
$body = @{
 email = "suporte@caracore.com.br"
 password = "SUA_SENHA_AQUI"
} | ConvertTo-Json

# Local
$response = Invoke-RestMethod -Uri "http://localhost:5051/auth/super-admin" -Method POST -Body $body -ContentType "application/json"

# Produção
$response = Invoke-RestMethod -Uri "https://caracore-backend-docker.azurewebsites.net/auth/super-admin" -Method POST -Body $body -ContentType "application/json"

$response | ConvertTo-Json
```

**Resultado esperado:**

```json
{
 "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 "email": "suporte@caracore.com.br",
 "role": "super_admin",
 "expires_in": 86400
}
```

### Teste 3: Testar no Frontend

1. Acesse: https://www.caracore.com.br/secure/super-admin-setup.html
2. Email: `suporte@caracore.com.br` (já preenchido)
3. Digite a senha
4. Clique em "Entrar como Super Administrador"
5. Deve redirecionar para: `/secure/approval-requests.html`

---

## Troubleshooting Docker

### Erro: "Configuração do servidor incompleta"

**Causa:** Variáveis de ambiente não definidas no container

**Solução:**

```bash
# Verificar variáveis dentro do container
docker exec -it cara-core-backend env | grep SUPER_ADMIN

# Ou via Azure CLI
az containerapp show \
 --name caracore-backend-docker \
 --resource-group <seu-resource-group> \
 --query "properties.template.containers[0].env"
```

### Erro: Container não inicia após adicionar variáveis

**Causa:** Possível erro de sintaxe ou valor inválido

**Solução:**

1. Verifique os logs:

```bash
# Local
docker logs cara-core-backend

# Azure
az containerapp logs show --name caracore-backend-docker --resource-group <seu-resource-group> --follow
```

2. Verifique se não há caracteres especiais ou espaços nas variáveis

### Erro: "ModuleNotFoundError: No module named 'jwt'"

**Causa:** Dependência PyJWT não instalada

**Solução:**

Verifique se `requirements.txt` inclui:

```text
PyJWT>=2.8.0
cryptography>=41.0.0
```

Reconstrua a imagem:

```bash
docker-compose build --no-cache
docker-compose up -d
```

### Variáveis não aparecem após restart

**Causa:** No Azure Container Apps, variáveis precisam ser commitadas em uma revisão

**Solução:**

1. Após adicionar variáveis, clique em **Create** (não apenas Save)
2. Nova revisão será criada automaticamente
3. Verifique em **Revisions** que a nova revisão está ativa

---

## Estrutura de Arquivos Docker

```
d:\dev\site\cara-core\
├── docker\
│ ├── docker-compose.yml ............... Orquestração de containers
│ ├── Dockerfile ........................ Imagem do backend
│ ├── backend.env ....................... Variáveis locais (não versionado)
│ ├── backend.env.sample ................ Template de variáveis
│ └── docker-entrypoint.sh .............. Script de inicialização
├── backend\
│ └── app.py ............................ Endpoints super admin
├── scripts\
│ └── setup_super_admin.py .............. Gerador de credenciais
└── secrets.txt ........................... Secrets gerais (não versionado)
```

---

## Segurança em Docker

### Boas Práticas

1. **Use secrets do Docker/Azure**
 - JWT_SECRET_KEY deve ser secret, não variável de ambiente

2. **Não commite backend.env**
 - Já está no .gitignore
 - Use backend.env.sample como template

3. **Rotacione secrets periodicamente**
 - Execute `setup_super_admin.py` novamente
 - Atualize variáveis no Azure

4. **Use HTTPS em produção**
 - Backend deve estar atrás de proxy HTTPS (Azure já faz isso)

5. **Monitore logs**
 - Verifique tentativas de login inválidas
 - Use Azure Monitor ou Log Analytics

---

## 📚 Referências

- **Docker Compose:** `docker/docker-compose.yml`
- **Dockerfile:** `docker/Dockerfile`
- **Backend Endpoints:** `backend/app.py` (linhas ~1800-1950)
- **Documentação Geral:** `docs/SUPER-ADMIN-AUTH.md`
- **Checklist:** `docs/CHECKLIST-SUPER-ADMIN.md`

---

## Checklist Final

- [ ] Executar `setup_super_admin.py`
- [ ] Copiar hash e secret gerados
- [ ] Adicionar variáveis no Azure Container App
- [ ] Aguardar nova revisão ser criada
- [ ] Verificar logs sem erros
- [ ] Testar endpoint via curl/PowerShell
- [ ] Testar login no frontend
- [ ] Verificar redirecionamento funciona
- [ ] Documentar senha em local seguro
- [ ] Backup de `secrets.txt`

---

**Ambiente:** Docker / Azure Container Apps 
**Container:** caracore-backend-docker 
**Versão:** 1.0 
**Data:** Novembro 2025

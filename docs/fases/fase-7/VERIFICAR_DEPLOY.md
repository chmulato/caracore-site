# Verificar Deploy da Fase 7

## 🔍 Problema Identificado

O log do servidor ainda mostra:
```
WARNING session_manager não disponível - sistema de refresh tokens desabilitado
```

Isso indica que:
1. O deploy ainda não foi aplicado (imagem Docker antiga)
2. Ou os arquivos da Fase 7 não estão no container

## ✅ Verificações Necessárias

### 1. Verificar se os Arquivos Estão no Container

**Via SSH no Azure Portal:**

```bash
az webapp ssh --name caracore-backend-docker --resource-group rg-caracore
```

Dentro do shell:
```bash
# Verificar se os arquivos existem
ls -la /app/session_manager.py
ls -la /app/crypto_manager.py
ls -la /app/token_storage.py
ls -la /app/token_audit.py

# Verificar se as dependências estão instaladas
python3 -c "import cryptography; print('cryptography OK')"
python3 -c "from dateutil import parser; print('python-dateutil OK')"
```

### 2. Verificar se TOKEN_ENCRYPTION_KEY Está Configurada

```bash
az webapp config appsettings list \
  --name caracore-backend-docker \
  --resource-group rg-caracore \
  --query "[?name=='TOKEN_ENCRYPTION_KEY']" \
  --output table
```

**Resultado esperado:**
```
Name                  Value                                         SlotSetting
--------------------  --------------------------------------------  -------------
TOKEN_ENCRYPTION_KEY  aJSEi4SKz9rzF5m5fCUkMgnpC9AMIOBCka2FRCQMsYA=  False
```

### 3. Verificar Status do Deploy

**GitHub Actions:**
1. Acesse: https://github.com/chmulato/cara-core/actions
2. Verifique se o workflow "Deploy Docker Backend to Azure Container Registry" executou após o último commit
3. Verifique se o build foi bem-sucedido

**Azure Portal:**
1. App Service → **Deployment Center** → **Logs**
2. Verifique o último deploy e se foi bem-sucedido

### 4. Forçar Rebuild da Imagem Docker

Se os arquivos não estiverem no container, pode ser necessário forçar um rebuild:

**Opção A: Via GitHub Actions (Recomendado)**
1. Vá para: https://github.com/chmulato/cara-core/actions
2. Selecione o workflow "Deploy Docker Backend to Azure Container Registry"
3. Clique em **Run workflow** → **Run workflow**

**Opção B: Via Azure CLI**
```bash
# Forçar pull da imagem mais recente
az webapp config container set \
  --name caracore-backend-docker \
  --resource-group rg-caracore \
  --container-image-name caracoreregistry.azurecr.io/caracore-backend:latest \
  --container-registry-url https://caracoreregistry.azurecr.io

# Reiniciar
az webapp restart \
  --name caracore-backend-docker \
  --resource-group rg-caracore
```

### 5. Verificar Logs Após Deploy

Após o deploy, verifique os logs:

```bash
az webapp log tail --name caracore-backend-docker --resource-group rg-caracore
```

**Procure por:**
- ✅ `"SessionManager carregado - sistema de refresh tokens habilitado"` (sucesso)
- ❌ `"TOKEN_ENCRYPTION_KEY não configurada"` (chave não encontrada)
- ❌ `"SessionManager não pode ser inicializado (chave inválida)"` (chave inválida)
- ❌ `"session_manager não disponível"` (arquivo não encontrado)

## 🔧 Solução de Problemas

### Problema: Arquivos não estão no container

**Causa:** O Dockerfile não está copiando os arquivos ou o build não incluiu os arquivos.

**Solução:**
1. Verificar se os arquivos estão commitados no Git
2. Verificar se o workflow do GitHub Actions está copiando corretamente
3. Forçar rebuild da imagem

### Problema: TOKEN_ENCRYPTION_KEY não configurada

**Causa:** A variável de ambiente não foi configurada no Azure App Service.

**Solução:**
```bash
az webapp config appsettings set \
  --name caracore-backend-docker \
  --resource-group rg-caracore \
  --settings TOKEN_ENCRYPTION_KEY=aJSEi4SKz9rzF5m5fCUkMgnpC9AMIOBCka2FRCQMsYA=
```

### Problema: Dependências não instaladas

**Causa:** As dependências `cryptography` ou `python-dateutil` não estão instaladas.

**Solução:**
Verificar se `backend/requirements.txt` ou `backend/requirements-docker.txt` inclui:
```
cryptography>=41.0.0
python-dateutil>=2.8.2
```

## 📝 Checklist de Verificação

- [ ] Arquivos `session_manager.py`, `crypto_manager.py`, `token_storage.py` existem no container
- [ ] `TOKEN_ENCRYPTION_KEY` está configurada no Azure App Service
- [ ] Dependências `cryptography` e `python-dateutil` estão instaladas
- [ ] Deploy foi executado com sucesso
- [ ] App Service foi reiniciado após configurar a chave
- [ ] Logs mostram "SessionManager carregado" (não "não disponível")

---

**Última atualização:** 15/11/2025


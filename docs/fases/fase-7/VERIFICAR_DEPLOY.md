# Verificar Deploy da Fase 7

## ðŸ” Problema Identificado

O log do servidor ainda mostra:
```
WARNING session_manager nÃ£o disponÃ­vel - sistema de refresh tokens desabilitado
```

Isso indica que:
1. O deploy ainda nÃ£o foi aplicado (imagem Docker antiga)
2. Ou os arquivos da Fase 7 nÃ£o estÃ£o no container

## âœ… VerificaÃ§Ãµes NecessÃ¡rias

### 1. Verificar se os Arquivos EstÃ£o no Container

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

# Verificar se as dependÃªncias estÃ£o instaladas
python3 -c "import cryptography; print('cryptography OK')"
python3 -c "from dateutil import parser; print('python-dateutil OK')"
```

### 2. Verificar se TOKEN_ENCRYPTION_KEY EstÃ¡ Configurada

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
TOKEN_ENCRYPTION_KEY  <REPLACE_WITH_BASE64_32BYTE_KEY>  False
```

### 3. Verificar Status do Deploy

**GitHub Actions:**
1. Acesse: https://caracore.com.br/
2. Verifique se o workflow "Deploy Docker Backend to Azure Container Registry" executou apÃ³s o Ãºltimo commit
3. Verifique se o build foi bem-sucedido

**Azure Portal:**
1. App Service â†’ **Deployment Center** â†’ **Logs**
2. Verifique o Ãºltimo deploy e se foi bem-sucedido

### 4. ForÃ§ar Rebuild da Imagem Docker

Se os arquivos nÃ£o estiverem no container, pode ser necessÃ¡rio forÃ§ar um rebuild:

**OpÃ§Ã£o A: Via GitHub Actions (Recomendado)**
1. VÃ¡ para: https://caracore.com.br/
2. Selecione o workflow "Deploy Docker Backend to Azure Container Registry"
3. Clique em **Run workflow** â†’ **Run workflow**

**OpÃ§Ã£o B: Via Azure CLI**
```bash
# ForÃ§ar pull da imagem mais recente
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

### 5. Verificar Logs ApÃ³s Deploy

ApÃ³s o deploy, verifique os logs:

```bash
az webapp log tail --name caracore-backend-docker --resource-group rg-caracore
```

**Procure por:**
- âœ… `"SessionManager carregado - sistema de refresh tokens habilitado"` (sucesso)
- âŒ `"TOKEN_ENCRYPTION_KEY nÃ£o configurada"` (chave nÃ£o encontrada)
- âŒ `"SessionManager nÃ£o pode ser inicializado (chave invÃ¡lida)"` (chave invÃ¡lida)
- âŒ `"session_manager nÃ£o disponÃ­vel"` (arquivo nÃ£o encontrado)

## ðŸ”§ SoluÃ§Ã£o de Problemas

### Problema: Arquivos nÃ£o estÃ£o no container

**Causa:** O Dockerfile nÃ£o estÃ¡ copiando os arquivos ou o build nÃ£o incluiu os arquivos.

**SoluÃ§Ã£o:**
1. Verificar se os arquivos estÃ£o commitados no Git
2. Verificar se o workflow do GitHub Actions estÃ¡ copiando corretamente
3. ForÃ§ar rebuild da imagem

### Problema: TOKEN_ENCRYPTION_KEY nÃ£o configurada

**Causa:** A variÃ¡vel de ambiente nÃ£o foi configurada no Azure App Service.

**SoluÃ§Ã£o:**
```bash
az webapp config appsettings set \
  --name caracore-backend-docker \
  --resource-group rg-caracore \
  --settings TOKEN_ENCRYPTION_KEY=<REPLACE_WITH_BASE64_32BYTE_KEY>
```

### Problema: DependÃªncias nÃ£o instaladas

**Causa:** As dependÃªncias `cryptography` ou `python-dateutil` nÃ£o estÃ£o instaladas.

**SoluÃ§Ã£o:**
Verificar se `backend/requirements.txt` ou `backend/requirements-docker.txt` inclui:
```
cryptography>=41.0.0
python-dateutil>=2.8.2
```

## ðŸ“ Checklist de VerificaÃ§Ã£o

- [ ] Arquivos `session_manager.py`, `crypto_manager.py`, `token_storage.py` existem no container
- [ ] `TOKEN_ENCRYPTION_KEY` estÃ¡ configurada no Azure App Service
- [ ] DependÃªncias `cryptography` e `python-dateutil` estÃ£o instaladas
- [ ] Deploy foi executado com sucesso
- [ ] App Service foi reiniciado apÃ³s configurar a chave
- [ ] Logs mostram "SessionManager carregado" (nÃ£o "nÃ£o disponÃ­vel")

---

**Ãšltima atualizaÃ§Ã£o:** 15/11/2025




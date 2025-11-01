# Deploy Status - GitHub Actions

## Status Atual

❌ **GitHub Actions com azure/webapps-deploy@v2 não está funcionando**

**Problema**: O action `azure/webapps-deploy` tem incompatibilidade com o perfil de publicação do Azure App Service B1.

**Erro**: `Publish profile is invalid for app-name and slot-name provided`

## ✅ Solução Atual: Deploy Manual via Azure CLI

O deploy manual via Azure CLI funciona perfeitamente e foi testado com sucesso:

```powershell
# 1. Criar ZIP do backend
cd d:\dev\site\cara-core
Compress-Archive -Path backend\* -DestinationPath backend_deploy.zip -Force

# 2. Deploy via Azure CLI
az webapp deployment source config-zip `
    --name caracore-backend `
    --resource-group rg-caracore `
    --src backend_deploy.zip
```

**Resultado**: Deploy completo em ~2 minutos, backend funcional.

## 🔄 Alternativas para Deploy Automático

### Opção 1: Deploy Manual (Recomendado por enquanto)
- **Vantagem**: Funciona 100%, testado e validado
- **Desvantagem**: Manual, requer execução do comando
- **Tempo**: ~2 minutos por deploy

### Opção 2: GitHub Actions com Service Principal (Futuro)
Requer configurar:
1. Service Principal no Azure
2. Role assignment no App Service
3. Secrets no GitHub: `AZURE_CREDENTIALS` (JSON com clientId, clientSecret, tenantId, subscriptionId)
4. Usar `azure/login@v1` + `az webapp deploy`

**Exemplo workflow**:
```yaml
- uses: azure/login@v1
  with:
    creds: ${{ secrets.AZURE_CREDENTIALS }}

- name: Deploy
  run: |
    az webapp deploy \
      --resource-group rg-caracore \
      --name caracore-backend \
      --src-path ./backend-deploy.zip \
      --type zip
```

### Opção 3: Azure DevOps Pipelines
- Integração nativa com Azure
- Mais complexo de configurar
- Overkill para este projeto

## 📊 Histórico de Tentativas

| Tentativa | Método | Resultado |
|-----------|--------|-----------|
| 1 | `azure/webapps-deploy@v3` | ❌ Publish profile invalid |
| 2 | `azure/webapps-deploy@v2` | ❌ Publish profile invalid |
| 3 | `azure/webapps-deploy@v2` + `slot-name: ''` | ❌ Publish profile invalid |
| 4 | `Azure/cli@v1` + `az webapp deployment` | ❌ Precisa autenticação |
| 5 | **Az CLI manual** | ✅ **FUNCIONA** |

## ✅ Workflow Atual para Deploy

**Após fazer mudanças no backend:**

```powershell
# 1. Commit e push normalmente
git add backend/
git commit -m "feat: Nova funcionalidade"
git push origin main

# 2. Deploy manual (2 minutos)
cd d:\dev\site\cara-core
Compress-Archive -Path backend\* -DestinationPath backend_deploy.zip -Force
az webapp deployment source config-zip `
    --name caracore-backend `
    --resource-group rg-caracore `
    --src backend_deploy.zip

# 3. Verificar
Start-Sleep -Seconds 30
Invoke-RestMethod https://caracore-backend.azurewebsites.net/health
```

## 🎯 Recomendação

**Para agora**: Usar deploy manual via Azure CLI (funciona, rápido, confiável)

**Para futuro** (quando tiver tempo): Implementar Opção 2 com Service Principal para automação completa

## 📝 Nota

O arquivo `.github/workflows/azure-backend-deploy.yml` está configurado mas não funciona no momento devido ao problema com publish profile. Pode ser removido ou mantido para referência futura.

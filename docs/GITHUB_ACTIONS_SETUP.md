# Configuração de Deploy Automático - GitHub Actions → Azure

## ✅ Arquivos Criados

1. **Workflow GitHub Actions**: `.github/workflows/azure-backend-deploy.yml`
   - Deploy automático quando houver push em `main` com mudanças em `backend/**`
   - Testa health endpoint após deploy
   - Verifica autenticação do endpoint `/api/admin/logs`

2. **Perfil de Publicação**: `publish_profile.xml` (arquivo temporário)
   - Contém credenciais para deploy no Azure App Service
   - **⚠️ ESTE ARQUIVO DEVE SER DELETADO APÓS CONFIGURAÇÃO**

## 📋 Passo a Passo para Configurar

### 1. Adicionar Secret no GitHub

1. Acesse: https://github.com/chmulato/cara-core/settings/secrets/actions

2. Clique em **"New repository secret"**

3. Configure o secret:
   - **Name**: `AZURE_WEBAPP_PUBLISH_PROFILE`
   - **Secret**: Cole o conteúdo completo do arquivo `publish_profile.xml`

4. Clique em **"Add secret"**

### 2. Commitar e Fazer Push

```powershell
cd d:\dev\site\cara-core
git add .github/workflows/azure-backend-deploy.yml
git add scripts/setup_github_deploy.ps1
git commit -m "ci: Adicionar GitHub Actions para deploy automático no Azure

- Deploy dispara automaticamente em push na main
- Apenas quando há mudanças em backend/**
- Health check automático pós-deploy
- Verifica autenticação do endpoint admin"
git push origin main
```

### 3. Deletar Arquivo Temporário

```powershell
Remove-Item publish_profile.xml -Force
```

### 4. Verificar Deploy

Após o push, acesse:
- **Actions**: https://github.com/chmulato/cara-core/actions
- Você verá o workflow "Deploy Backend to Azure App Service" em execução
- Deploy leva ~2-3 minutos

## 🎯 Como Funciona

### Triggers
- **Push em `main`** com mudanças em:
  - `backend/**` (qualquer arquivo do backend)
  - `.github/workflows/azure-backend-deploy.yml` (o próprio workflow)
- **Manual** via botão "Run workflow" na aba Actions

### Pipeline
1. ✅ Checkout do código
2. ✅ Setup Python 3.11
3. ✅ Instalar dependências (`requirements.txt`)
4. ✅ Criar ZIP de deploy (exclui logs, cache, pyc)
5. ✅ Deploy no Azure App Service
6. ✅ Aguardar 30s (warm-up)
7. ✅ Health check (deve retornar 200)
8. ✅ Test auth endpoint (deve retornar 401)

### Logs
- Disponíveis em: https://github.com/chmulato/cara-core/actions
- Cada step mostra output detalhado
- Falhas param o deploy e notificam

## 🔒 Segurança

- ✅ Perfil de publicação armazenado como **GitHub Secret** (criptografado)
- ✅ Não aparece em logs ou console
- ✅ Apenas workflows podem acessar
- ✅ Arquivo `publish_profile.xml` deve ser **deletado** após uso

## 🚀 Vantagens

✅ **Deploy automático** - Push em main = deploy em produção  
✅ **Validação automática** - Health check e auth test  
✅ **Rastreabilidade** - Histórico completo de deploys  
✅ **Rollback fácil** - Revert commit = deploy da versão anterior  
✅ **Zero downtime** - Azure faz deploy sem interrupção  

## 📊 Status

- [x] Workflow criado
- [x] Perfil de publicação exportado
- [ ] Secret configurado no GitHub (aguardando configuração manual)
- [ ] Primeiro deploy automático (após push)

## 🔄 Próximos Deploys

Depois de configurado, para fazer deploy basta:

```powershell
# Fazer mudanças no backend
git add backend/
git commit -m "feat: Nova funcionalidade"
git push origin main

# Deploy automático será disparado! 🚀
```

## ❓ Troubleshooting

**Deploy falhou?**
- Verifique logs em: https://github.com/chmulato/cara-core/actions
- Verifique se secret `AZURE_WEBAPP_PUBLISH_PROFILE` está configurado
- Verifique se o perfil de publicação é válido (pode expirar)

**Como renovar perfil de publicação?**
```powershell
az webapp deployment list-publishing-profiles --name caracore-backend --resource-group rg-caracore --xml | Out-File publish_profile_new.xml -Encoding UTF8
# Depois atualize o secret no GitHub com o novo conteúdo
```

**Como fazer deploy manual?**
- Acesse: https://github.com/chmulato/cara-core/actions/workflows/azure-backend-deploy.yml
- Clique em "Run workflow"
- Selecione branch `main`
- Clique em "Run workflow"

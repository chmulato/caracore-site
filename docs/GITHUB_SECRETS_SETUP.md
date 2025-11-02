# Configuração de Secrets para GitHub Actions - Docker Deployment

## Problema Identificado

O workflow de deploy Docker falhou porque os secrets necessários não estão configurados no GitHub. 

**Erro:** `Username and password required` durante login no Azure Container Registry.

## Referência de Template

Use o arquivo `secrets.txt.template` como referência completa. Este template foi atualizado para incluir:

- Todas as variáveis do Azure App Service
- Documentação dos GitHub Secrets necessários
- Comandos Azure CLI para obter valores atuais

## Secrets Necessários

Você precisa configurar os seguintes secrets no GitHub:

### 1. ACR_USERNAME

- **Valor:** Nome do usuário do Azure Container Registry
- **Como obter:** 

  ```bash
  az acr credential show --name caracoreregistry --query username --output tsv
  ```

### 2. ACR_PASSWORD 

- **Valor:** Senha do Azure Container Registry
- **Como obter:**

  ```bash
  az acr credential show --name caracoreregistry --query passwords[0].value --output tsv
  ```

### 3. AZURE_WEBAPP_DOCKER_PUBLISH_PROFILE

- **Valor:** Publish profile do Azure Web App
- **Como obter:** No portal Azure > App Service > caracore-backend-docker > Get publish profile

## Como Configurar os Secrets

1. **Acesse o GitHub:**
   - Vá para: [https://github.com/chmulato/cara-core]
   - Clique em **Settings** > **Secrets and variables** > **Actions**

2. **Adicione cada secret:**
   - Clique em **New repository secret**
   - Digite o nome do secret (ex: `ACR_USERNAME`)
   - Cole o valor obtido
   - Clique em **Add secret**

## Comandos para Obter os Valores

Execute estes comandos para obter os valores necessários:

```bash
# 1. Obter ACR_USERNAME
az acr credential show --name caracoreregistry --query username --output tsv

# 2. Obter ACR_PASSWORD
az acr credential show --name caracoreregistry --query passwords[0].value --output tsv

# 3. Para o publish profile, faça download pelo portal Azure
# Portal Azure > App Services > caracore-backend-docker > Get publish profile
```

## Verificação

Após configurar os secrets, execute novamente o workflow:

1. **Manualmente:** GitHub Actions > Deploy Docker Backend > Run workflow
2. **Automático:** Faça commit de alguma alteração na pasta `backend/`

## Status Atual

✅ **Dockerfile.azure:** Configurado corretamente  
✅ **Workflow YAML:** Configurado corretamente  
❌ **GitHub Secrets:** Pendente de configuração  
❌ **Deploy:** Aguardando secrets

## Próximos Passos

1. Configure os 3 secrets no GitHub
2. Execute o workflow manualmente para testar
3. Verifique se o health check passa
4. Confirme que a API de autorização responde corretamente
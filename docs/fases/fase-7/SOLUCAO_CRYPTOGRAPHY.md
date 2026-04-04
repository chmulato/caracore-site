# SoluÃ§Ã£o: DependÃªncia `cryptography` NÃ£o Instalada

## ðŸ” Problema Identificado

O log do servidor mostra:
```
WARNING session_manager nÃ£o disponÃ­vel - sistema de refresh tokens desabilitado: No module named 'cryptography'
```

## âœ… Causa

A dependÃªncia `cryptography` estÃ¡ no arquivo `backend/requirements-docker.txt`, mas a imagem Docker foi construÃ­da **antes** dessa dependÃªncia ser adicionada, ou o build nÃ£o estÃ¡ instalando corretamente.

## ðŸ”§ SoluÃ§Ã£o

### OpÃ§Ã£o 1: ForÃ§ar Rebuild da Imagem Docker (Recomendado)

**Via GitHub Actions:**

1. Acesse: https://caracore.com.br/
2. Selecione o workflow "Deploy Docker Backend to Azure Container Registry"
3. Clique em **Run workflow** â†’ **Run workflow**
4. Aguarde o build e deploy completarem (5-10 minutos)

**Via Azure CLI (forÃ§ar pull):**

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

### OpÃ§Ã£o 2: Verificar Arquivo de Requirements

Certifique-se de que `backend/requirements-docker.txt` contÃ©m:

```txt
# Fase 7 - Sistema de Refresh Tokens
cryptography>=41.0.0      # Criptografia AES-256
flask-limiter>=3.5.0      # Rate limiting
python-dateutil>=2.8.2    # ManipulaÃ§Ã£o de datas
```

### OpÃ§Ã£o 3: Verificar Build Logs

No GitHub Actions, verifique os logs do build para ver se `cryptography` estÃ¡ sendo instalado:

1. Acesse: https://caracore.com.br/
2. Abra o Ãºltimo workflow executado
3. Expanda o step "Build and push Docker image"
4. Procure por: `Installing cryptography` ou `Collecting cryptography`

## âœ… VerificaÃ§Ã£o ApÃ³s Deploy

ApÃ³s o rebuild, verifique os logs:

```bash
az webapp log tail --name caracore-backend-docker --resource-group rg-caracore
```

**Procure por:**
- âœ… `"SessionManager carregado - sistema de refresh tokens habilitado"` (sucesso)
- âŒ `"No module named 'cryptography'"` (ainda nÃ£o instalado)

## ðŸ“ Nota Importante

O arquivo `backend/requirements-docker.txt` **jÃ¡ contÃ©m** a dependÃªncia `cryptography>=41.0.0`. O problema Ã© que a imagem Docker precisa ser **reconstruÃ­da** para incluir essa dependÃªncia.

---

**Ãšltima atualizaÃ§Ã£o:** 15/11/2025



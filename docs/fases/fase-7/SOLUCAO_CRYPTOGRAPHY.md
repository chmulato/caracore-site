# Solução: Dependência `cryptography` Não Instalada

## 🔍 Problema Identificado

O log do servidor mostra:
```
WARNING session_manager não disponível - sistema de refresh tokens desabilitado: No module named 'cryptography'
```

## ✅ Causa

A dependência `cryptography` está no arquivo `backend/requirements-docker.txt`, mas a imagem Docker foi construída **antes** dessa dependência ser adicionada, ou o build não está instalando corretamente.

## 🔧 Solução

### Opção 1: Forçar Rebuild da Imagem Docker (Recomendado)

**Via GitHub Actions:**

1. Acesse: https://www.caracore.com.br/
2. Selecione o workflow "Deploy Docker Backend to Azure Container Registry"
3. Clique em **Run workflow** → **Run workflow**
4. Aguarde o build e deploy completarem (5-10 minutos)

**Via Azure CLI (forçar pull):**

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

### Opção 2: Verificar Arquivo de Requirements

Certifique-se de que `backend/requirements-docker.txt` contém:

```txt
# Fase 7 - Sistema de Refresh Tokens
cryptography>=41.0.0      # Criptografia AES-256
flask-limiter>=3.5.0      # Rate limiting
python-dateutil>=2.8.2    # Manipulação de datas
```

### Opção 3: Verificar Build Logs

No GitHub Actions, verifique os logs do build para ver se `cryptography` está sendo instalado:

1. Acesse: https://www.caracore.com.br/
2. Abra o último workflow executado
3. Expanda o step "Build and push Docker image"
4. Procure por: `Installing cryptography` ou `Collecting cryptography`

## ✅ Verificação Após Deploy

Após o rebuild, verifique os logs:

```bash
az webapp log tail --name caracore-backend-docker --resource-group rg-caracore
```

**Procure por:**
- ✅ `"SessionManager carregado - sistema de refresh tokens habilitado"` (sucesso)
- ❌ `"No module named 'cryptography'"` (ainda não instalado)

## 📝 Nota Importante

O arquivo `backend/requirements-docker.txt` **já contém** a dependência `cryptography>=41.0.0`. O problema é que a imagem Docker precisa ser **reconstruída** para incluir essa dependência.

---

**Última atualização:** 15/11/2025



# Configurar Chave de Criptografia - Fase 7

## 🔐 Chave Gerada

A chave de criptografia foi gerada com sucesso:

```
TOKEN_ENCRYPTION_KEY=aJSEi4SKz9rzF5m5fCUkMgnpC9AMIOBCka2FRCQMsYA=
SESSION_SECRET_KEY=4iNNc7tFewIH8R7vDMjSWKfkX8ZYulUsf1LbzjloeVk
```

⚠️ **IMPORTANTE:** 
- Mantenha estas chaves em SEGREDO
- NÃO commite estas chaves no Git
- Faça backup seguro das chaves
- Se perder as chaves, todos os tokens criptografados serão perdidos

---

## 🚀 Opção 1: Configurar via Script Python (Recomendado)

### Pré-requisitos
- Azure CLI instalado e configurado
- Login no Azure: `az login`
- Permissões para modificar App Service

### Comando
```bash
python scripts/configure_app_settings.py --set TOKEN_ENCRYPTION_KEY=aJSEi4SKz9rzF5m5fCUkMgnpC9AMIOBCka2FRCQMsYA=
```

### Verificar antes de aplicar (dry-run)
```bash
python scripts/configure_app_settings.py --set TOKEN_ENCRYPTION_KEY=aJSEi4SKz9rzF5m5fCUkMgnpC9AMIOBCka2FRCQMsYA= --dry-run
```

---

## 🖥️ Opção 2: Configurar via Azure Portal (Manual)

### Passo a Passo

1. **Acesse o Azure Portal**
   - URL: https://portal.azure.com
   - Faça login com sua conta Azure

2. **Navegue até o App Service**
   - No menu lateral, clique em **App Services**
   - Selecione: `caracore-backend-docker`

3. **Acesse Configuration**
   - No menu lateral do App Service, clique em **Configuration**
   - Clique na aba **Application settings**

4. **Adicionar Nova Variável**
   - Clique em **+ New application setting**
   - **Name:** `TOKEN_ENCRYPTION_KEY`
   - **Value:** `aJSEi4SKz9rzF5m5fCUkMgnpC9AMIOBCka2FRCQMsYA=`
   - Clique em **OK**

5. **Salvar e Reiniciar**
   - Clique em **Save** no topo da página
   - Aguarde a confirmação
   - O App Service será reiniciado automaticamente

---

## 🖥️ Opção 3: Configurar via Azure CLI

### Comando
```bash
az webapp config appsettings set \
  --name caracore-backend-docker \
  --resource-group rg-caracore \
  --settings TOKEN_ENCRYPTION_KEY=aJSEi4SKz9rzF5m5fCUkMgnpC9AMIOBCka2FRCQMsYA=
```

### Verificar Configuração
```bash
az webapp config appsettings list \
  --name caracore-backend-docker \
  --resource-group rg-caracore \
  --query "[?name=='TOKEN_ENCRYPTION_KEY']"
```

---

## ✅ Verificar se Foi Configurado Corretamente

### Via Azure Portal
1. App Service → Configuration → Application settings
2. Procure por `TOKEN_ENCRYPTION_KEY`
3. Verifique se o valor está correto (primeiros e últimos caracteres)

### Via Azure CLI
```bash
az webapp config appsettings list \
  --name caracore-backend-docker \
  --resource-group rg-caracore \
  --query "[?name=='TOKEN_ENCRYPTION_KEY'].{Name:name, Value:value}" \
  --output table
```

### Via Logs do Backend
Após reiniciar o App Service, verifique os logs:

✅ **Sucesso:**
```
SessionManager carregado - sistema de refresh tokens habilitado
```

❌ **Erro (se não configurado):**
```
TOKEN_ENCRYPTION_KEY não configurada
session_manager não disponível - sistema de refresh tokens desabilitado
```

---

## 🔄 Reiniciar App Service

Após configurar, o App Service será reiniciado automaticamente. Se não reiniciar:

### Via Portal
1. App Service → Overview → **Restart**

### Via CLI
```bash
az webapp restart \
  --name caracore-backend-docker \
  --resource-group rg-caracore
```

---

## 🧪 Testar Configuração

Após reiniciar, teste fazendo login:

1. Acesse: https://www.caracore.com.br/secure/index.html
2. Faça login com Google ou Microsoft
3. Verifique no console do navegador:
   ```
   [OAuth Callback] Criando sessão no backend (Fase 7)...
   [OAuth Callback] ✅ Sessão criada com sucesso no backend
   ```

4. Verifique os logs do backend (Azure Portal → App Service → Log stream):
   ```
   SessionManager carregado - sistema de refresh tokens habilitado
   Sessão criada: sess_abc123... para user@example.com (google)
   ```

---

## 📝 Atualizar secrets.txt (Local - NÃO Commitar)

Para desenvolvimento local, adicione ao arquivo `.env` ou `secrets.txt`:

```bash
TOKEN_ENCRYPTION_KEY=aJSEi4SKz9rzF5m5fCUkMgnpC9AMIOBCka2FRCQMsYA=
SESSION_SECRET_KEY=4iNNc7tFewIH8R7vDMjSWKfkX8ZYulUsf1LbzjloeVk
```

⚠️ **NUNCA commite o arquivo `secrets.txt` com valores reais!**

---

## 🔒 Segurança

### Boas Práticas
- ✅ Use Azure Key Vault para armazenar chaves em produção (opcional)
- ✅ Rotacione chaves periodicamente (a cada 6-12 meses)
- ✅ Mantenha backup seguro das chaves
- ✅ Use diferentes chaves para desenvolvimento e produção
- ✅ Monitore logs para detectar tentativas de uso de chaves inválidas

### O que acontece se perder a chave?
- ❌ Todos os refresh tokens criptografados serão **perdidos**
- ❌ Usuários precisarão fazer login novamente
- ❌ Sessões existentes serão inválidas

**Solução:** Gere nova chave e configure novamente. Usuários precisarão fazer login novamente.

---

## 📚 Documentação Relacionada

- **Guia de Ativação:** `docs/fases/fase-7/COMO_ATIVAR_FASE_7.md`
- **Endpoints:** `docs/fases/fase-7/ENDPOINTS_REFRESH_TOKEN.md`
- **Script de Configuração:** `scripts/configure_app_settings.py`

---

**Última atualização:** 15/11/2025  
**Chave gerada em:** 15/11/2025  
**Status:** ✅ Chave gerada, aguardando configuração no Azure


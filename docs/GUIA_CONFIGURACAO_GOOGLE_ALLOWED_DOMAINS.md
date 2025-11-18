# Guia de Configuração - GOOGLE_ALLOWED_DOMAINS

## 📋 Resumo

Este guia passo a passo mostra como configurar `GOOGLE_ALLOWED_DOMAINS=caracore.com.br,gmail.com` em diferentes ambientes.

---

## ✅ Configuração Atual

**Valor configurado:** `caracore.com.br,gmail.com`

**Significado:**
- ✅ Aceita emails `@caracore.com.br` (contas corporativas)
- ✅ Aceita emails `@gmail.com` (contas pessoais)
- ❌ Rejeita outros domínios (ex: `@outro.com.br`)

---

## 🔧 Passo a Passo

### **1. Desenvolvimento Local**

#### **Opção A: Usar arquivo `.env`**

**Arquivo:** `docker/backend.env` (criar se não existir)

```bash
# Copiar template
cp docker/backend.env.sample docker/backend.env

# Editar arquivo
# Adicionar ou atualizar a linha:
GOOGLE_ALLOWED_DOMAINS=caracore.com.br,gmail.com
```

**Verificar:**
```bash
# Ver conteúdo da variável
grep GOOGLE_ALLOWED_DOMAINS docker/backend.env
```

**Resultado esperado:**
```
GOOGLE_ALLOWED_DOMAINS=caracore.com.br,gmail.com
```

---

#### **Opção B: Variável de ambiente do sistema**

**Linux/macOS:**
```bash
export GOOGLE_ALLOWED_DOMAINS=caracore.com.br,gmail.com
```

**Windows (PowerShell):**
```powershell
$env:GOOGLE_ALLOWED_DOMAINS="caracore.com.br,gmail.com"
```

**Windows (CMD):**
```cmd
set GOOGLE_ALLOWED_DOMAINS=caracore.com.br,gmail.com
```

---

### **2. Produção (Azure App Service)**

#### **Método 1: Portal Azure (Recomendado)**

1. **Acesse o Azure Portal:**
   ```
   https://portal.azure.com
   ```

2. **Navegue até o App Service:**
   - Procure por: **App Services**
   - Clique em: **caracore-backend-docker**

3. **Vá para Configuration:**
   - No menu lateral esquerdo, clique em: **Configuration**
   - Ou acesse diretamente:
   ```
   https://portal.azure.com/#@/resource/subscriptions/*/resourceGroups/rg-caracore/providers/Microsoft.Web/sites/caracore-backend-docker/configuration
   ```

4. **Adicione ou edite a variável:**
   - **Name:** `GOOGLE_ALLOWED_DOMAINS`
   - **Value:** `caracore.com.br,gmail.com`
   - **Deployment slot setting:** Deixe desmarcado

5. **Salve as alterações:**
   - Clique em **Save** no topo da página
   - Confirme a reinicialização do App Service

---

#### **Método 2: Azure CLI**

```bash
# Configurar variável
az webapp config appsettings set \
  --resource-group rg-caracore \
  --name caracore-backend-docker \
  --settings GOOGLE_ALLOWED_DOMAINS="caracore.com.br,gmail.com"

# Verificar configuração
az webapp config appsettings list \
  --resource-group rg-caracore \
  --name caracore-backend-docker \
  --query "[?name=='GOOGLE_ALLOWED_DOMAINS']"
```

**Resultado esperado:**
```json
[
  {
    "name": "GOOGLE_ALLOWED_DOMAINS",
    "value": "caracore.com.br,gmail.com",
    "slotSetting": false
  }
]
```

---

#### **Método 3: Azure PowerShell**

```powershell
# Configurar variável
$appService = Get-AzWebApp -ResourceGroupName "rg-caracore" -Name "caracore-backend-docker"
$appService.SiteConfig.AppSettings.Add("GOOGLE_ALLOWED_DOMAINS", "caracore.com.br,gmail.com")
Set-AzWebApp -WebApp $appService

# Verificar configuração
$appService = Get-AzWebApp -ResourceGroupName "rg-caracore" -Name "caracore-backend-docker"
$appService.SiteConfig.AppSettings | Where-Object { $_.Name -eq "GOOGLE_ALLOWED_DOMAINS" }
```

---

### **3. Docker Compose**

**Arquivo:** `docker/docker-compose.yml`

```yaml
services:
  backend:
    environment:
      - GOOGLE_ALLOWED_DOMAINS=caracore.com.br,gmail.com
    # ... outras configurações
```

**Ou usar arquivo `.env`:**
```bash
# docker/.env
GOOGLE_ALLOWED_DOMAINS=caracore.com.br,gmail.com
```

---

## 🔍 Verificar Configuração

### **1. Ver Logs do Backend**

**Local (Docker):**
```bash
docker logs <container-name> | grep "Google allowed domains"
```

**Azure App Service:**
```bash
az webapp log tail \
  --resource-group rg-caracore \
  --name caracore-backend-docker \
  --filter "Google allowed domains"
```

**Resultado esperado:**
```
INFO: Google allowed domains restritos a: caracore.com.br, gmail.com
```

---

### **2. Verificar Variável de Ambiente**

**Local:**
```bash
# Docker
docker exec <container-name> env | grep GOOGLE_ALLOWED_DOMAINS

# Ou no código Python
python -c "import os; print(os.getenv('GOOGLE_ALLOWED_DOMAINS', 'NÃO DEFINIDO'))"
```

**Azure:**
```bash
az webapp config appsettings list \
  --resource-group rg-caracore \
  --name caracore-backend-docker \
  --query "[?name=='GOOGLE_ALLOWED_DOMAINS'].value" \
  --output tsv
```

**Resultado esperado:**
```
caracore.com.br,gmail.com
```

---

### **3. Testar Endpoint de Health**

```bash
# Verificar se backend está rodando
curl https://caracore-backend-docker.azurewebsites.net/health

# Verificar configuração OAuth (se endpoint existir)
curl https://caracore-backend-docker.azurewebsites.net/health/oauth/google
```

---

## 🧪 Testar Login

### **Teste 1: Domínio Permitido - caracore.com.br**

1. Acesse: `https://www.caracore.com.br/secure/index.html`
2. Clique em "Login com Google"
3. Use conta: `usuario@caracore.com.br`
4. **Resultado esperado:** ✅ Login bem-sucedido

---

### **Teste 2: Domínio Permitido - gmail.com**

1. Acesse: `https://www.caracore.com.br/secure/index.html`
2. Clique em "Login com Google"
3. Use conta: `usuario@gmail.com`
4. **Resultado esperado:** ✅ Login bem-sucedido

---

### **Teste 3: Domínio NÃO Permitido**

1. Acesse: `https://www.caracore.com.br/secure/index.html`
2. Clique em "Login com Google"
3. Use conta: `usuario@outro.com.br`
4. **Resultado esperado:** 
   - ❌ Erro 403 (Forbidden)
   - Mensagem: "Domínio outro.com.br não autorizado para login Google"
   - Redirecionamento para reautenticação

---

## 📊 Verificar Logs de Autenticação

### **Backend Logs**

**Local:**
```bash
docker logs <container-name> | grep -i "unauthorized_domain\|allowed domains"
```

**Azure:**
```bash
az webapp log tail \
  --resource-group rg-caracore \
  --name caracore-backend-docker \
  --filter "unauthorized_domain OR allowed domains"
```

**Logs esperados:**

**Login bem-sucedido:**
```
INFO: Google allowed domains restritos a: caracore.com.br, gmail.com
INFO: ID token Google validado com sucesso (sub=..., email=usuario@caracore.com.br)
```

**Login rejeitado:**
```
ERROR: Falha ao validar ID token Google: unauthorized_domain - Domínio outro.com.br não autorizado para login Google
```

---

### **Frontend Console (Navegador)**

Abra o Console do navegador (F12) e procure por:

**Login bem-sucedido:**
```
✅ [Google] Tokens REAIS obtidos do backend
✅ [Google] Autenticação criada com sucesso
```

**Login rejeitado:**
```
🔄 Domínio não autorizado detectado (esperado). Tentando obter email para redirecionar...
✅ Usuário autorizado, mas não autenticado corretamente (domínio não autorizado).
🔄 Redirecionando para reautenticação...
```

---

## ⚠️ Troubleshooting

### **Problema: Configuração não está sendo aplicada**

**Solução:**
1. Verificar se variável está definida corretamente
2. Reiniciar backend/App Service
3. Verificar logs de inicialização

**Comandos:**
```bash
# Reiniciar App Service (Azure)
az webapp restart \
  --resource-group rg-caracore \
  --name caracore-backend-docker

# Reiniciar container (Local)
docker restart <container-name>
```

---

### **Problema: Domínio permitido está sendo rejeitado**

**Solução:**
1. Verificar formato da variável (sem espaços extras, minúsculas)
2. Verificar se domínio está na lista (case-sensitive na comparação)
3. Verificar logs para ver qual domínio está sendo verificado

**Verificar formato:**
```bash
# Deve ser: caracore.com.br,gmail.com
# NÃO: Caracore.Com.Br, Gmail.Com (será convertido, mas melhor evitar)
```

---

### **Problema: Todos os domínios estão sendo aceitos**

**Solução:**
1. Verificar se variável está definida (não vazia)
2. Verificar se backend está lendo a variável corretamente
3. Verificar logs de inicialização

**Verificar:**
```bash
# Ver se variável está definida
echo $GOOGLE_ALLOWED_DOMAINS  # Linux/macOS
echo %GOOGLE_ALLOWED_DOMAINS%  # Windows CMD
$env:GOOGLE_ALLOWED_DOMAINS   # Windows PowerShell
```

---

## 📝 Checklist de Configuração

- [ ] Variável `GOOGLE_ALLOWED_DOMAINS` definida com valor `caracore.com.br,gmail.com`
- [ ] Backend reiniciado após alteração
- [ ] Logs mostram: "Google allowed domains restritos a: caracore.com.br, gmail.com"
- [ ] Teste com `@caracore.com.br` → ✅ Login bem-sucedido
- [ ] Teste com `@gmail.com` → ✅ Login bem-sucedido
- [ ] Teste com `@outro.com.br` → ❌ Erro 403 (esperado)

---

## 🔗 Referências

- **Documentação completa:** `docs/CONFIGURAR_AUTORIZACAO_DOMINIO_GOOGLE.md`
- **Correção de erro 403:** `docs/CORRECAO_ERRO_403_GOOGLE_UNAUTHORIZED_DOMAIN.md`
- **Código backend:** `backend/app.py` (linha 489-512, 1080-1097)

---

## ✅ Resumo

**Configuração aplicada:**
- ✅ `docker/backend.env.sample` atualizado
- ✅ Valor: `caracore.com.br,gmail.com`
- ✅ Formato: lista separada por vírgula, case-insensitive

**Próximos passos:**
1. Aplicar configuração no ambiente (local/produção)
2. Reiniciar backend
3. Verificar logs
4. Testar login com diferentes domínios

